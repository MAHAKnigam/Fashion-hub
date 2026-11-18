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
      const { data: payment, error: paymentLookupError } = await admin.from("payments")
        .select("id,order_id,amount_paise,status").eq("gateway_order_id", entity.order_id).maybeSingle();
      if (paymentLookupError) throw paymentLookupError;
      if (!payment) throw new Error("Payment record not found for Razorpay order");
      if (Number(payment.amount_paise) !== Number(entity.amount) || entity.currency !== "INR") {
        return new Response("Payment amount or currency mismatch", { status: 400 });
      }

      // Webhooks may be retried or delivered out of order. Never let an old
      // failure overwrite a capture, or let a duplicate capture reset fulfilment.
      if (event.event === "payment.captured" && payment.status !== "refunded") {
        const { error: paymentUpdateError } = await admin.from("payments").update({
          gateway_payment_id: entity.id, status: "captured",
        }).eq("id", payment.id);
        if (paymentUpdateError) throw paymentUpdateError;

        const { error: orderUpdateError } = await admin.from("orders").update({ status: "paid" })
          .eq("id", payment.order_id).in("status", ["pending_payment", "payment_failed"]);
        if (orderUpdateError) throw orderUpdateError;
      } else if (event.event === "payment.failed" &&
          !["captured", "refunded"].includes(payment.status)) {
        const { error: paymentUpdateError } = await admin.from("payments").update({
          gateway_payment_id: entity.id, status: "failed",
        }).eq("id", payment.id).in("status", ["created", "authorized", "failed"]);
        if (paymentUpdateError) throw paymentUpdateError;

        const { error: orderUpdateError } = await admin.from("orders").update({ status: "payment_failed" })
          .eq("id", payment.order_id).eq("status", "pending_payment");
        if (orderUpdateError) throw orderUpdateError;
      }
    }
    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("razorpay-webhook:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
});
