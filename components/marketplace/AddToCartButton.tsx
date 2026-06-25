"use client";

import { useState } from "react";
import type { CartItem } from "@/lib/marketplace/types";

type AddToCartButtonProps = {
  item: Omit<CartItem, "id" | "quantity"> & { quantity?: number };
  label: string;
  className?: string;
  redirectToCart?: boolean;
};

export function AddToCartButton({ item, label, className = "button", redirectToCart = false }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  function addToCart() {
    const current = readCart();
    const cartItem: CartItem = {
      ...item,
      id: `${item.productId}-${item.itemType}-${item.experienceId ?? "material"}-${item.bookingId ?? "none"}`,
      quantity: item.quantity ?? 1
    };
    const withoutDuplicate = current.filter((candidate) => candidate.id !== cartItem.id);
    localStorage.setItem("lancelot_cart", JSON.stringify([...withoutDuplicate, cartItem]));
    window.dispatchEvent(new Event("lancelot-cart-updated"));
    setAdded(true);

    if (redirectToCart) {
      window.location.href = "/cart";
    }
  }

  return (
    <button className={className} type="button" onClick={addToCart}>
      {added ? "Added to cart" : label}
    </button>
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
