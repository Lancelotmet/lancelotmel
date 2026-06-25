import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient, hasSupabaseAdminConfig, useMarketplaceDemoMode } from "@/lib/supabase/server";
import { buildCheckoutSummary } from "@/lib/marketplace/pricing";
import { buildCheckoutLines } from "@/lib/marketplace/repository";
import { createCheckoutSchema } from "@/lib/marketplace/validators";

export async function POST(request: NextRequest) {
  const parsed = createCheckoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid checkout payload." }, { status: 400 });
  }

  const payload = parsed.data;
  const lines = await buildCheckoutLines(payload.items);
  if (!lines.length) {
    return NextResponse.json({ error: "No valid checkout items." }, { status: 400 });
  }

  const summary = buildCheckoutSummary(lines);
  const appUrl = process.env.APP_URL || request.nextUrl.origin;

  if (useMarketplaceDemoMode() || !hasSupabaseAdminConfig()) {
    const orderId = `demo-order-${Date.now()}`;
    return NextResponse.json({
      checkoutUrl: `/api/payment/simulate?orderId=${orderId}`,
      orderId,
      summary
    });
  }

  const supabase = createSupabaseServerClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      currency: summary.currency,
      email: payload.email.toLowerCase(),
      metadata: { fullName: payload.fullName, studentTimezone: payload.studentTimezone },
      status: "pending",
      subtotal: summary.subtotal,
      tax_total: summary.taxTotal,
      total: summary.total
    })
    .select("*")
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  const orderItems = lines.map((line, index) => ({
    booking_id: payload.items[index]?.bookingId ?? null,
    currency: line.currency,
    experience_id: line.experience?.id ?? null,
    item_type: line.itemType,
    order_id: order.id,
    price_snapshot: line.unitPrice,
    product_id: line.product.id,
    quantity: line.quantity,
    title_snapshot: line.experience?.title ?? line.product.title
  }));

  const { error: itemError } = await supabase.from("order_items").insert(orderItems);
  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 });
  }

  await supabase.from("user_events").insert({
    event_type: "checkout_started",
    metadata: { total: summary.total, email: payload.email }
  });

  if (payload.paymentProvider === "stripe" && process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      cancel_url: `${appUrl}/checkout?cancelled=1`,
      customer_email: payload.email,
      line_items: lines.map((line) => ({
        price_data: {
          currency: line.currency.toLowerCase(),
          product_data: { name: line.experience?.title ?? line.product.title },
          unit_amount: Math.round(line.unitPrice * 100)
        },
        quantity: line.quantity
      })),
      metadata: { orderId: order.id },
      mode: "payment",
      success_url: `${appUrl}/checkout/success?orderId=${order.id}`
    });

    await supabase.from("orders").update({ checkout_session_id: session.id }).eq("id", order.id);
    return NextResponse.json({ checkoutUrl: session.url, orderId: order.id, summary });
  }

  return NextResponse.json({
    checkoutUrl: `/api/payment/simulate?orderId=${order.id}`,
    orderId: order.id,
    summary
  });
}
