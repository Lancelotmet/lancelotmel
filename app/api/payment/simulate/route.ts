import { NextRequest, NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/marketplace/payments";

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId." }, { status: 400 });
  }

  await markOrderPaid(orderId, "demo", `demo-${orderId}`);
  return NextResponse.redirect(new URL(`/checkout/success?orderId=${orderId}`, request.url));
}
