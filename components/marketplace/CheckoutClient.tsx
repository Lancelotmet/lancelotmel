"use client";

import { useEffect, useMemo, useState } from "react";
import { CHECKOUT_LICENSE_ACK, DIGITAL_LICENSE, LIVE_CLASS_POLICY } from "@/lib/marketplace/legal";
import { formatCurrency } from "@/lib/marketplace/format";
import { getExperiencePrice, getMaterialPrice } from "@/lib/marketplace/pricing";
import type { CartItem, LiveExperience, Product, ProductPrice } from "@/lib/marketplace/types";

type CheckoutClientProps = {
  products: Product[];
  prices: ProductPrice[];
  experiences: LiveExperience[];
};

export function CheckoutClient({ products, prices, experiences }: CheckoutClientProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [licenseAccepted, setLicenseAccepted] = useState(false);
  const [timezone, setTimezone] = useState("America/Bogota");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            item.itemType === "full_experience" || item.itemType === "live_class_only"
              ? getExperiencePrice(product.id, item.itemType === "live_class_only", prices)
              : getMaterialPrice(product.id, prices);
          return { item, product, experience, price };
        })
        .filter(Boolean),
    [experiences, items, prices, products]
  );

  const subtotal = lines.reduce((sum, line) => sum + (line?.price?.amount ?? line?.experience?.price ?? 0), 0);
  const currency = lines[0]?.price?.currency ?? lines[0]?.experience?.currency ?? "USD";

  async function checkout() {
    setBusy(true);
    setError(null);

    const response = await fetch("/api/checkout", {
      body: JSON.stringify({
        couponCode: couponCode || undefined,
        email,
        fullName,
        items,
        licenseAccepted,
        paymentProvider: "mercado_pago",
        studentTimezone: timezone
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });

    const payload = await response.json();

    if (!response.ok) {
      setBusy(false);
      setError(payload.error ?? "Checkout could not be created.");
      return;
    }

    localStorage.removeItem("lancelot_cart");
    window.location.href = payload.checkoutUrl;
  }

  if (!items.length) {
    return (
      <section className="page-section">
        <div className="empty-state large">
          <strong>No checkout items</strong>
          <span>Add a material or full experience before starting checkout.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-layout">
      <div className="checkout-main">
        <div className="panel flush">
          <h2>Contact and access</h2>
          <div className="form-grid">
            <label className="field">
              <span>Full name</span>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Student name" />
            </label>
            <label className="field">
              <span>Email</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="student@example.com" />
            </label>
            <label className="field">
              <span>Timezone</span>
              <select value={timezone} onChange={(event) => setTimezone(event.target.value)}>
                <option>America/Bogota</option>
                <option>America/New_York</option>
                <option>Europe/Madrid</option>
                <option>UTC</option>
              </select>
            </label>
            <label className="field">
              <span>Coupon</span>
              <input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="LANCELOT10" />
            </label>
          </div>
        </div>

        <div className="panel flush legal-box">
          <h2>License and booking terms</h2>
          <p>{DIGITAL_LICENSE}</p>
          <p>{LIVE_CLASS_POLICY}</p>
          <label className="check-row">
            <input checked={licenseAccepted} onChange={(event) => setLicenseAccepted(event.target.checked)} type="checkbox" />
            <span>{CHECKOUT_LICENSE_ACK}</span>
          </label>
        </div>
      </div>

      <aside className="checkout-summary">
        <h2>Checkout</h2>
        <div className="summary-lines">
          {lines.map((line) =>
            line ? (
              <div key={line.item.id}>
                <span>{line.product.title}</span>
                <strong>{formatCurrency(line.price?.amount ?? line.experience?.price ?? 0, line.price?.currency ?? line.experience?.currency ?? "USD")}</strong>
              </div>
            ) : null
          )}
        </div>
        <dl>
          <div><dt>Subtotal</dt><dd>{formatCurrency(subtotal, currency)}</dd></div>
          <div><dt>Estimated tax</dt><dd>{formatCurrency(0, currency)}</dd></div>
          <div><dt>Total</dt><dd>{formatCurrency(subtotal, currency)}</dd></div>
        </dl>
        <button className="button gold" disabled={busy || !email || !licenseAccepted} onClick={checkout} type="button">
          {busy ? "Creating secure checkout..." : "Pay securely"}
        </button>
        <p className="muted small">You will pay securely through Mercado Pago. Access is unlocked after payment confirmation.</p>
        {error ? <p className="status error">{error}</p> : null}
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
