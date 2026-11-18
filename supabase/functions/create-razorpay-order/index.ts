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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Authentication required" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: "Invalid session" }, 401);

    const body = await req.json();
    const items = body.items;
    const shippingAddress = body.shippingAddress;
    if (!Array.isArray(items) || items.length === 0 || items.length > 30 || !shippingAddress) {
      return json({ error: "A valid cart and shipping address are required" }, 400);
    }

    const quantities = new Map<string, number>();
    for (const item of items) {
      if (typeof item.productId !== "string" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) {
        return json({ error: "Invalid cart item" }, 400);
      }
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    }

    const productIds = [...quantities.keys()];
    const { data: products, error: productsError } = await admin
      .from("products")
      .select("id,name,price_paise,stock_quantity,is_active")
      .in("id", productIds);
    if (productsError || !products || products.length !== productIds.length) {
      return json({ error: "One or more products are unavailable" }, 400);
    }

    let subtotalPaise = 0;
    const orderLines = [];
    for (const product of products) {
      const quantity = quantities.get(product.id)!;
      if (!product.is_active || product.stock_quantity < quantity) {
        return json({ error: `Insufficient stock for ${product.name}` }, 409);
      }
      const lineTotal = Number(product.price_paise) * quantity;
      if (!Number.isSafeInteger(lineTotal)) return json({ error: "Invalid product price" }, 400);
      subtotalPaise += lineTotal;
      orderLines.push({
        product_id: product.id,
        product_name: product.name,
        unit_price_paise: product.price_paise,
        quantity,
        line_total_paise: lineTotal,
      });
    }

    const shippingPaise = 0;
    const totalPaise = subtotalPaise + shippingPaise;
    if (!Number.isSafeInteger(totalPaise) || totalPaise <= 0) return json({ error: "Invalid order total" }, 400);

    const { data: order, error: orderError } = await admin.from("orders").insert({
      user_id: user.id,
      subtotal_paise: subtotalPaise,
      shipping_paise: shippingPaise,
      total_paise: totalPaise,
      shipping_address: shippingAddress,
    }).select("id").single();
    if (orderError || !order) throw new Error("Could not create order");

    const { error: linesError } = await admin.from("order_items").insert(
      orderLines.map((line) => ({ ...line, order_id: order.id })),
    );
    if (linesError) {
      await admin.from("orders").delete().eq("id", order.id);
      throw new Error("Could not save order items");
    }

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${razorpayKeyId}:${razorpayKeySecret}`),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: totalPaise,
        currency: "INR",
        receipt: order.id,
        notes: { fashion_hub_order_id: order.id, user_id: user.id },
      }),
    });
    const razorpayOrder = await razorpayResponse.json();
    if (!razorpayResponse.ok) {
      await admin.from("orders").update({ status: "payment_failed" }).eq("id", order.id);
      throw new Error("Razorpay could not create the payment order");
    }

    const { error: paymentError } = await admin.from("payments").insert({
      order_id: order.id,
      gateway_order_id: razorpayOrder.id,
      amount_paise: totalPaise,
    });
    if (paymentError) throw new Error("Could not save payment record");

    return json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: totalPaise,
      currency: "INR",
      keyId: razorpayKeyId,
    });
  } catch (error) {
    console.error("create-razorpay-order:", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected server error" }, 500);
  }
});
