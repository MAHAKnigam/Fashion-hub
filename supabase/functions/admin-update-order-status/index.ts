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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization) return json({ error: "Authentication required" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: "Invalid session" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: profile, error: profileError } = await admin
      .from("profiles").select("role").eq("id", user.id).single();
    if (profileError || profile?.role !== "admin") {
      return json({ error: "Admin access required" }, 403);
    }

    const body = await req.json();
    const orderId = body?.orderId;
    const nextStatus = body?.status;
    if (typeof orderId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId) ||
        !["processing", "shipped", "delivered"].includes(nextStatus)) {
      return json({ error: "Invalid order or requested status" }, 400);
    }

    const allowedNext: Record<string, string> = {
      paid: "processing",
      processing: "shipped",
      shipped: "delivered",
    };
    const { data: order, error: orderError } = await admin
      .from("orders").select("id,status").eq("id", orderId).maybeSingle();
    if (orderError || !order) return json({ error: "Order not found" }, 404);

    if (allowedNext[order.status] !== nextStatus) {
      return json({ error: `This order cannot move from ${order.status} to ${nextStatus}.` }, 409);
    }

    const { data: payment, error: paymentError } = await admin
      .from("payments").select("status").eq("order_id", orderId).maybeSingle();
    if (paymentError || !payment || payment.status !== "captured") {
      return json({ error: "Only orders with captured payments can be processed" }, 409);
    }

    const { data: updated, error: updateError } = await admin
      .from("orders")
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("status", order.status)
      .select("id,status,updated_at")
      .maybeSingle();
    if (updateError) throw updateError;
    if (!updated) return json({ error: "Order status changed elsewhere. Refresh and try again." }, 409);

    return json({ success: true, order: updated });
  } catch (error) {
    console.error("admin-update-order-status:", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected server error" }, 500);
  }
});
