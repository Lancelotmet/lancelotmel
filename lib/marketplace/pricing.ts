import { demoPrices } from "./demo";
import type { CartItem, CheckoutLine, Product, ProductPrice } from "./types";

export function getPrice(productId: string, priceType: ProductPrice["priceType"], prices: ProductPrice[] = demoPrices) {
  return prices.find((price) => price.productId === productId && price.priceType === priceType && price.isActive);
}

export function getMaterialPrice(productId: string, prices?: ProductPrice[]) {
  return getPrice(productId, "material_only", prices);
}

export function getExperiencePrice(productId: string, alreadyOwnsMaterial = false, prices?: ProductPrice[]) {
  return getPrice(
    productId,
    alreadyOwnsMaterial ? "live_class_only_after_material_purchase" : "full_experience",
    prices
  );
}

export function buildCheckoutSummary(lines: CheckoutLine[], coupon?: { discountType: "percentage" | "fixed_amount"; discountValue: number }) {
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  let discountTotal = 0;

  if (coupon) {
    discountTotal =
      coupon.discountType === "percentage"
        ? subtotal * Math.min(coupon.discountValue, 100) / 100
        : Math.min(coupon.discountValue, subtotal);
  }

  const taxTotal = 0;
  const total = Math.max(subtotal - discountTotal + taxTotal, 0);

  return {
    subtotal: roundMoney(subtotal),
    discountTotal: roundMoney(discountTotal),
    taxTotal: roundMoney(taxTotal),
    total: roundMoney(total),
    currency: lines[0]?.currency ?? "USD"
  };
}

export function productMatchesCartItem(product: Product, item: CartItem) {
  return product.id === item.productId;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
