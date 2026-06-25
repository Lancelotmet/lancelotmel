"use client";

import { useMemo, useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/marketplace/format";
import type { AvailabilitySlot, CartItem, LiveExperience, Product } from "@/lib/marketplace/types";

type BookingSelectorProps = {
  product: Product;
  experience: LiveExperience;
  slots: AvailabilitySlot[];
};

export function BookingSelector({ product, experience, slots }: BookingSelectorProps) {
  const [selectedSlotId, setSelectedSlotId] = useState(slots[0]?.id ?? "");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("America/Bogota");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === selectedSlotId),
    [selectedSlotId, slots]
  );

  async function reserve() {
    if (!selectedSlot) {
      setStatus("Select an available time.");
      return;
    }

    setBusy(true);
    setStatus(null);

    const response = await fetch("/api/bookings/hold", {
      body: JSON.stringify({
        email,
        experienceId: experience.id,
        productId: product.id,
        slotId: selectedSlot.id,
        studentTimezone: timezone
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });

    const payload = await response.json();
    setBusy(false);

    if (!response.ok) {
      setStatus(payload.error ?? "The slot could not be reserved.");
      return;
    }

    const current = readCart();
    const item = {
      bookingId: payload.booking.id,
      experienceId: experience.id,
      id: `${product.id}-full-experience-${payload.booking.id}`,
      itemType: "full_experience" as const,
      productId: product.id,
      quantity: 1
    };

    localStorage.setItem("lancelot_cart", JSON.stringify([...current.filter((candidate: CartItem) => candidate.id !== item.id), item]));
    window.location.href = "/checkout";
  }

  return (
    <div className="booking-box" id="book-live">
      <div>
        <p className="eyebrow">Live availability</p>
        <h3>Reserve your Full LANCELOT Experience</h3>
        <p className="muted">
          Your selected time is shown in your local timezone. The slot is held for 15 minutes while checkout is completed.
        </p>
      </div>

      <div className="form-grid">
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
      </div>

      <div className="slot-grid">
        {slots.length ? (
          slots.map((slot) => (
            <button
              className={`slot-card ${selectedSlotId === slot.id ? "active" : ""}`}
              disabled={slot.isBooked || !slot.isAvailable}
              key={slot.id}
              onClick={() => setSelectedSlotId(slot.id)}
              type="button"
            >
              <span>{formatDateTime(slot.startTimeUtc, timezone)}</span>
              <small>{experience.durationMinutes} minutes</small>
            </button>
          ))
        ) : (
          <div className="empty-state">
            <strong>No availability yet</strong>
            <span>Contact support or check again later for live LANCELOT sessions.</span>
          </div>
        )}
      </div>

      <div className="booking-summary">
        <span>{experience.title}</span>
        <strong>{formatCurrency(experience.price, experience.currency)}</strong>
      </div>
      <button className="button gold" disabled={busy || !email || !selectedSlot} type="button" onClick={reserve}>
        {busy ? "Holding slot..." : "Hold slot and checkout"}
      </button>
      {status ? <p className="status error">{status}</p> : null}
    </div>
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
