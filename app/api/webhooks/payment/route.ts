import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { markOrderPaid } from "@/lib/marketplace/payments";

export async function POST(request: NextRequest) {
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

  const result = await markOrderPaid(orderId, "stripe", eventId);
  return NextResponse.json(result);
}
