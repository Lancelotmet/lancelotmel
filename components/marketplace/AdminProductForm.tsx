"use client";

import { useState } from "react";
import type { Category } from "@/lib/marketplace/types";

export function AdminProductForm({ categories }: { categories: Category[] }) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true);
    setStatus(null);
    const token = String(formData.get("adminToken") ?? "");
    const payload = {
      categoryId: String(formData.get("categoryId") ?? ""),
      currency: "USD",
      fullDescription: String(formData.get("fullDescription") ?? ""),
      isFeatured: formData.get("isFeatured") === "on",
      isPublished: formData.get("isPublished") === "on",
      language: String(formData.get("language") ?? "English"),
      level: String(formData.get("level") ?? "General"),
      price: Number(formData.get("price") ?? 0),
      productKind: String(formData.get("productKind") ?? "digital_download"),
      resourceType: String(formData.get("resourceType") ?? "PDF"),
      shortDescription: String(formData.get("shortDescription") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      tags: String(formData.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
      title: String(formData.get("title") ?? "")
    };

    const response = await fetch("/api/admin/products", {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token
      },
      method: "POST"
    });
    const result = await response.json();
    setBusy(false);
    setStatus(response.ok ? `Product created: ${result.product?.title ?? result.product?.id}` : result.error ?? "Could not create product.");
  }

  return (
    <form className="panel admin-form" action={submit}>
      <label className="field"><span>Admin token</span><input name="adminToken" type="password" placeholder="ADMIN_ACCESS_TOKEN" /></label>
      <div className="form-grid">
        <label className="field"><span>Title</span><input name="title" defaultValue="New LANCELOT Resource" /></label>
        <label className="field"><span>Slug</span><input name="slug" defaultValue="new-lancelot-resource" /></label>
        <label className="field"><span>Category</span><select name="categoryId">{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
        <label className="field"><span>Level</span><input name="level" defaultValue="B1" /></label>
        <label className="field"><span>Language</span><input name="language" defaultValue="English" /></label>
        <label className="field"><span>Resource type</span><input name="resourceType" defaultValue="Complete Class Pack" /></label>
        <label className="field"><span>Product kind</span><select name="productKind"><option>digital_download</option><option>free_lead_magnet</option><option>bundle</option><option>learning_path</option></select></label>
        <label className="field"><span>Price</span><input name="price" type="number" step="0.01" defaultValue="12" /></label>
      </div>
      <label className="field"><span>Tags</span><input name="tags" defaultValue="english, b1, grammar" /></label>
      <label className="field"><span>Short description</span><textarea name="shortDescription" defaultValue="A premium LANCELOT academic resource designed for smarter learning." /></label>
      <label className="field"><span>Full description</span><textarea name="fullDescription" defaultValue="This material includes guided explanations, visual support, practice and implementation notes for LANCELOT learners." /></label>
      <label className="check-row"><input name="isPublished" type="checkbox" defaultChecked /><span>Published</span></label>
      <label className="check-row"><input name="isFeatured" type="checkbox" /><span>Featured</span></label>
      <button className="button gold" disabled={busy} type="submit">{busy ? "Creating..." : "Create product"}</button>
      {status ? <p className="status info">{status}</p> : null}
    </form>
  );
}
