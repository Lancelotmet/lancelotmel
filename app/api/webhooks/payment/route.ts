import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getMercadoPagoPayment, hasMercadoPagoConfig } from "@/lib/marketplace/mercado-pago";
import { markOrderPaid } from "@/lib/marketplace/payments";

export async function POST(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider");

  if (provider === "mercado_pago") {
    return handleMercadoPagoWebhook(request);
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  let orderId: string | undefined;
  let eventId = `manual-${Date.now()}`;

  if (process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_SECRET_KEY && signature) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    eventId = event.id;
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      orderId = session.metadata?.orderId;
    }
  } else {
    const payload = JSON.parse(rawBody || "{}");
    if (process.env.DEMO_WEBHOOK_SECRET && request.headers.get("x-demo-webhook-secret") !== process.env.DEMO_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Invalid demo webhook secret." }, { status: 401 });
    }
    eventId = payload.eventId ?? eventId;
    orderId = payload.orderId;
  }

  if (!orderId) {
    return NextResponse.json({ error: "No orderId in payment event." }, { status: 400 });
  }

  const result = await markOrderPaid(orderId, signature ? "stripe" : "demo", eventId);
  return NextResponse.json(result);
}

async function handleMercadoPagoWebhook(request: NextRequest) {
  if (!hasMercadoPagoConfig()) {
    return NextResponse.json({ error: "Mercado Pago is not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const paymentId =
    request.nextUrl.searchParams.get("data.id") ??
    request.nextUrl.searchParams.get("id") ??
    body?.data?.id ??
    body?.id;

  const topic = request.nextUrl.searchParams.get("type") ?? body?.type ?? body?.topic;
  if (topic && topic !== "payment") {
    return NextResponse.json({ ok: true, ignored: topic });
  }

  if (!paymentId) {
    return NextResponse.json({ error: "No Mercado Pago payment id in event." }, { status: 400 });
  }

  const payment = await getMercadoPagoPayment(String(paymentId));
  if (payment.status !== "approved") {
    return NextResponse.json({ ok: true, status: payment.status ?? "unknown" });
  }

  const orderId = payment.external_reference;
  if (!orderId) {
    return NextResponse.json({ error: "No order reference in Mercado Pago payment." }, { status: 400 });
  }

  const result = await markOrderPaid(orderId, "mercado_pago", `mercado-pago-${payment.id}`);
  return NextResponse.json(result);
}
