"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/marketplace/types";
import { AdminToast } from "./AdminToast";

type Readiness = {
  complete: boolean;
  items: { key: string; label: string; complete: boolean }[];
};

export function AdminPublishPanel({ product, readiness }: { product: Product; readiness: Readiness }) {
  const router = useRouter();
  const [adminToken, setAdminToken] = useState("");
  const [licenseConfirmed, setLicenseConfirmed] = useState(false);
  const [previewChecked, setPreviewChecked] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "info" | "error" | "ok" } | null>(null);
  const [busy, setBusy] = useState(false);

  async function publish() {
    setBusy(true);
    const response = await fetch(`/api/admin/products/${product.id}/publish`, {
      body: JSON.stringify({ licenseConfirmed, previewChecked }),
      headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
      method: "POST"
    });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) {
      setToast({ message: payload.error ?? "Product cannot be published yet.", type: "error" });
      return;
    }
    setToast({ message: "Product published.", type: "ok" });
    router.refresh();
  }

  async function archive() {
    if (!confirm("Archive this product? Buyers with previous purchases keep access.")) return;
    setBusy(true);
    const response = await fetch(`/api/admin/products/${product.id}/archive`, {
      headers: { "x-admin-token": adminToken },
      method: "POST"
    });
    const payload = await response.json();
    setBusy(false);
    setToast(response.ok ? { message: "Product archived.", type: "ok" } : { message: payload.error ?? "Could not archive product.", type: "error" });
    router.refresh();
  }

  async function duplicate() {
    setBusy(true);
    const response = await fetch(`/api/admin/products/${product.id}/duplicate`, {
      headers: { "x-admin-token": adminToken },
      method: "POST"
    });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) {
      setToast({ message: payload.error ?? "Could not duplicate product.", type: "error" });
      return;
    }
    setToast({ message: "Product duplicated as draft.", type: "ok" });
  }

  return (
    <section className="publish-panel">
      <AdminToast message={toast?.message ?? null} type={toast?.type} />
      <div className="panel">
        <h2>Product readiness</h2>
        <div className="readiness-list">
          {readiness.items.map((item) => (
            <div className={item.complete ? "ready" : "missing"} key={item.key}>
              <span>{item.complete ? "OK" : "Missing"}</span>
              <strong>{item.label}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="panel admin-editor-section">
        <h2>Publish controls</h2>
        <label className="field"><span>Admin token</span><input value={adminToken} onChange={(event) => setAdminToken(event.target.value)} type="password" /></label>
        <label className="check-row"><input checked={licenseConfirmed} onChange={(event) => setLicenseConfirmed(event.target.checked)} type="checkbox" /><span>I confirm that this product has a license notice and that the premium file is not publicly accessible.</span></label>
        <label className="check-row"><input checked={previewChecked} onChange={(event) => setPreviewChecked(event.target.checked)} type="checkbox" /><span>I checked the admin preview.</span></label>
        <div className="admin-tools">
          <button className="button gold" disabled={busy || !readiness.complete || !licenseConfirmed || !previewChecked} type="button" onClick={publish}>Publish product</button>
          <button className="button secondary" disabled={busy} type="button" onClick={duplicate}>Duplicate product</button>
          <button className="danger-button subtle" disabled={busy} type="button" onClick={archive}>Archive product</button>
        </div>
      </div>
    </section>
  );
}
