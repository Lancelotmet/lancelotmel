"use client";

import { useState } from "react";

type DownloadButtonProps = {
  productId: string;
  orderId: string;
};

export function DownloadButton({ productId, orderId }: DownloadButtonProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function requestDownload() {
    setBusy(true);
    setStatus(null);
    const response = await fetch("/api/download/request", {
      body: JSON.stringify({ orderId, productId }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const payload = await response.json();
    setBusy(false);

    if (!response.ok) {
      setStatus(payload.error ?? "Download unavailable.");
      return;
    }

    setStatus("Secure temporary download URL generated. In production this opens the signed Supabase Storage URL.");
    if (payload.url) {
      window.open(payload.url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="download-action">
      <button className="button" disabled={busy} type="button" onClick={requestDownload}>
        {busy ? "Preparing..." : "Download"}
      </button>
      {status ? <p className="muted small">{status}</p> : null}
    </div>
  );
}
