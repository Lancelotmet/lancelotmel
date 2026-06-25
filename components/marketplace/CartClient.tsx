"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CartItem, Product, ProductPrice, LiveExperience } from "@/lib/marketplace/types";
import { formatCurrency } from "@/lib/marketplace/format";
import { getExperiencePrice, getMaterialPrice } from "@/lib/marketplace/pricing";

type CartClientProps = {
  products: Product[];
  prices: ProductPrice[];
  experiences: LiveExperience[];
};

export function CartClient({ products, prices, experiences }: CartClientProps) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  const lines = useMemo(
    () =>
      items
        .map((item) => {
          const product = products.find((candidate) => candidate.id === item.productId);
          if (!product) return null;
          const experience = experiences.find((candidate) => candidate.id === item.experienceId);
          const price =
            item.itemType === "full_experience"
              ? getExperiencePrice(product.id, false, prices)
              : getMaterialPrice(product.id, prices);
          return { item, product, experience, price };
        })
        .filter(Boolean),
    [experiences, items, prices, products]
  );

  const total = lines.reduce((sum, line) => sum + (line?.price?.amount ?? line?.experience?.price ?? 0), 0);
  const currency = lines[0]?.price?.currency ?? lines[0]?.experience?.currency ?? "USD";

  function remove(id: string) {
    const next = items.filter((item) => item.id !== id);
    localStorage.setItem("lancelot_cart", JSON.stringify(next));
    setItems(next);
  }

  if (!items.length) {
    return (
      <section className="page-section">
        <div className="empty-state large">
          <strong>Your cart is empty</strong>
          <span>Explore premium academic downloads or book the full LANCELOT experience for a specific topic.</span>
          <Link className="button" href="/marketplace">Explore marketplace</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-layout">
      <div className="cart-lines">
        {lines.map((line) =>
          line ? (
            <article className="cart-line" key={line.item.id}>
              <div>
                <span className="type-badge">{line.item.itemType === "full_experience" ? "Full Experience" : "Material Only"}</span>
                <h3>{line.product.title}</h3>
                <p>{line.item.itemType === "full_experience" ? "Digital material plus live guided LANCELOT session." : line.product.shortDescription}</p>
              </div>
              <div className="cart-line-side">
                <strong>{formatCurrency(line.price?.amount ?? line.experience?.price ?? 0, line.price?.currency ?? line.experience?.currency ?? "USD")}</strong>
                <button className="text-link danger-text" type="button" onClick={() => line.item.id && remove(line.item.id)}>Remove</button>
              </div>
            </article>
          ) : null
        )}
      </div>
      <aside className="checkout-summary">
        <h2>Order summary</h2>
        <dl>
          <div><dt>Subtotal</dt><dd>{formatCurrency(total, currency)}</dd></div>
          <div><dt>Taxes</dt><dd>{formatCurrency(0, currency)}</dd></div>
          <div><dt>Total</dt><dd>{formatCurrency(total, currency)}</dd></div>
        </dl>
        <Link className="button gold" href="/checkout">Checkout</Link>
      </aside>
    </section>
  );
}

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem("lancelot_cart");
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}
