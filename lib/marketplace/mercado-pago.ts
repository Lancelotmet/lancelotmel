import type { CheckoutLine } from "./types";

type MercadoPagoPreferenceResponse = {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
};

type MercadoPagoPaymentResponse = {
  id: number;
  external_reference?: string;
  status?: string;
};

type PreferenceInput = {
  appUrl: string;
  buyerEmail: string;
  lines: CheckoutLine[];
  orderId: string;
};

export function hasMercadoPagoConfig() {
  return Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN);
}

export async function createMercadoPagoPreference({ appUrl, buyerEmail, lines, orderId }: PreferenceInput) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) throw new Error("Missing MERCADO_PAGO_ACCESS_TOKEN.");

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    body: JSON.stringify({
      auto_return: "approved",
      back_urls: {
        failure: `${appUrl}/checkout?payment=failure&orderId=${orderId}`,
        pending: `${appUrl}/checkout?payment=pending&orderId=${orderId}`,
        success: `${appUrl}/checkout/success?orderId=${orderId}`
      },
      external_reference: orderId,
      items: lines.map((line) => ({
        currency_id: line.currency.toUpperCase(),
        description: line.product.shortDescription,
        id: line.product.id,
        quantity: line.quantity,
        title: line.experience?.title ?? line.product.title,
        unit_price: Number(line.unitPrice.toFixed(2))
      })),
      metadata: { order_id: orderId },
      notification_url: `${appUrl}/api/webhooks/payment?provider=mercado_pago`,
      payer: { email: buyerEmail }
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  const payload = (await response.json()) as MercadoPagoPreferenceResponse & { message?: string };
  if (!response.ok) {
    throw new Error(payload.message ?? "Mercado Pago preference could not be created.");
  }

  const checkoutUrl = process.env.MERCADO_PAGO_USE_SANDBOX === "true" ? payload.sandbox_init_point : payload.init_point;
  if (!checkoutUrl) throw new Error("Mercado Pago did not return a checkout URL.");

  return { checkoutUrl, preferenceId: payload.id };
}

export async function getMercadoPagoPayment(paymentId: string) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) throw new Error("Missing MERCADO_PAGO_ACCESS_TOKEN.");

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const payload = (await response.json()) as MercadoPagoPaymentResponse & { message?: string };
  if (!response.ok) {
    throw new Error(payload.message ?? "Mercado Pago payment could not be fetched.");
  }

  return payload;
}
