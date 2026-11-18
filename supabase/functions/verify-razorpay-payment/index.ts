import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function hmacSha256Hex(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Authentication required" }, 401);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const admin = createClient(supabaseUrl, serviceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: "Invalid session" }, 401);

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();
    if (![orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature].every((v) => typeof v === "string" && v.length > 0)) {
      return json({ error: "Missing payment verification fields" }, 400);
    }

    const { data: order, error: orderError } = await admin
      .from("orders").select("id,user_id,total_paise,status").eq("id", orderId).single();
    if (orderError || !order || order.user_id !== user.id) return json({ error: "Order not found" }, 404);

    const { data: payment, error: paymentError } = await admin
      .from("payments").select("id,gateway_order_id,amount_paise,status").eq("order_id", orderId).single();
    if (paymentError || !payment || payment.gateway_order_id !== razorpayOrderId ||
        Number(payment.amount_paise) !== Number(order.total_paise)) {
      return json({ error: "Payment does not match this order" }, 400);
    }

    const expected = await hmacSha256Hex(razorpaySecret, `${razorpayOrderId}|${razorpayPaymentId}`);
    if (expected.length !== razorpaySignature.length) return json({ error: "Invalid payment signature" }, 400);
    const a = new TextEncoder().encode(expected);
    const b = new TextEncoder().encode(razorpaySignature);
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
    if (mismatch !== 0) return json({ error: "Invalid payment signature" }, 400);

    const { error: updatePaymentError } = await admin.from("payments").update({
      gateway_payment_id: razorpayPaymentId,
      status: "authorized",
    }).eq("id", payment.id);
    if (updatePaymentError) throw new Error("Could not update payment record");

    // Mark paid only after a verified signature and a server-side Razorpay status check.
    const razorpayFetch = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpayPaymentId)}`, {
      headers: {
        "Authorization": "Basic " + btoa(`${Deno.env.get("RAZORPAY_KEY_ID")}:${razorpaySecret}`),
      },
    });
    const razorpayPayment = await razorpayFetch.json();
    if (!razorpayFetch.ok || razorpayPayment.order_id !== razorpayOrderId ||
        Number(razorpayPayment.amount) !== Number(order.total_paise) ||
        razorpayPayment.currency !== "INR" ||
        !["authorized", "captured"].includes(razorpayPayment.status)) {
      await admin.from("payments").update({ status: "failed" }).eq("id", payment.id);
      return json({ error: "Razorpay payment could not be confirmed" }, 400);
    }

    const finalStatus = razorpayPayment.status === "captured" ? "captured" : "authorized";
    await admin.from("payments").update({ status: finalStatus }).eq("id", payment.id);
    if (finalStatus === "captured") {
      await admin.from("orders").update({ status: "paid" }).eq("id", order.id);
    }
    return json({ verified: true, paymentStatus: finalStatus, orderId: order.id });
  } catch (error) {
    console.error("verify-razorpay-payment:", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected server error" }, 500);
  }
});
