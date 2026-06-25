"use client";

export function AdminToast({ message, type = "info" }: { message: string | null; type?: "info" | "error" | "ok" }) {
  if (!message) return null;
  return <div className={`admin-toast ${type}`}>{message}</div>;
}
