import { createClient } from "npm:@supabase/supabase-js@2";

async function hmacSha256Hex(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
  if (!secret || !signature) return new Response("Missing webhook signature", { status: 400 });

  const expected = await hmacSha256Hex(secret, rawBody);
  if (expected.length !== signature.length) return new Response("Invalid signature", { status: 400 });
  const a = new TextEncoder().encode(expected);
  const b = new TextEncoder().encode(signature);
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
  if (mismatch !== 0) return new Response("Invalid signature", { status: 400 });

  try {
    const event = JSON.parse(rawBody);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const entity = event.payload?.payment?.entity;
    if (entity?.order_id && entity?.id) {
      const { data: payment } = await admin.from("payments")
        .select("id,order_id,amount_paise").eq("gateway_order_id", entity.order_id).single();
      if (payment && Number(payment.amount_paise) === Number(entity.amount) && entity.currency === "INR") {
        if (event.event === "payment.captured") {
          await admin.from("payments").update({
            gateway_payment_id: entity.id, status: "captured",
          }).eq("id", payment.id);
          await admin.from("orders").update({ status: "paid" }).eq("id", payment.order_id);
        } else if (event.event === "payment.failed") {
          await admin.from("payments").update({
            gateway_payment_id: entity.id, status: "failed",
          }).eq("id", payment.id);
          await admin.from("orders").update({ status: "payment_failed" })
            .eq("id", payment.order_id).eq("status", "pending_payment");
        }
      }
    }
    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("razorpay-webhook:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
});
