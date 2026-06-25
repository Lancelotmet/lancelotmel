"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DIGITAL_LICENSE } from "@/lib/marketplace/legal";
import { PRODUCT_TEMPLATES, RESOURCE_TYPES } from "@/lib/marketplace/admin-products";
import { slugify } from "@/lib/marketplace/format";
import type { Category, Instructor, LiveExperience, Product, ProductPrice } from "@/lib/marketplace/types";
import { AdminToast } from "./AdminToast";

type AdminProductEditorProps = {
  mode: "create" | "edit";
  categories: Category[];
  instructors: Instructor[];
  product?: Product | null;
  price?: ProductPrice | null;
  experience?: LiveExperience | null;
};

export function AdminProductEditor({ mode, categories, instructors, product, price, experience }: AdminProductEditorProps) {
  const router = useRouter();
  const [adminToken, setAdminToken] = useState("");
  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [template, setTemplate] = useState("");
  const [resourceType, setResourceType] = useState(product?.resourceType ?? "Complete Class Pack");
  const [learningObjectives, setLearningObjectives] = useState((product?.learningObjectives ?? []).join("\n"));
  const [includes, setIncludes] = useState((product?.includes ?? []).join("\n"));
  const [tags, setTags] = useState((product?.tags ?? []).join(", "));
  const [isFree, setIsFree] = useState((price?.amount ?? 0) === 0 && Boolean(product));
  const [enableExperience, setEnableExperience] = useState(Boolean(experience?.isActive));
  const [toast, setToast] = useState<{ message: string; type: "info" | "error" | "ok" } | null>(null);
  const [busy, setBusy] = useState(false);

  const completion = useMemo(() => {
    const checks = [
      Boolean(title),
      Boolean(slug),
      Boolean(product?.categoryId || categories[0]?.id),
      Boolean(learningObjectives),
      Boolean(includes),
      Boolean(tags),
      Boolean(resourceType)
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [categories, includes, learningObjectives, product?.categoryId, resourceType, slug, tags, title]);

  function applyTemplate(name: string) {
    setTemplate(name);
    const selected = PRODUCT_TEMPLATES[name as keyof typeof PRODUCT_TEMPLATES];
    if (!selected) return;
    setResourceType(selected.resourceType);
    setIncludes(selected.includes.join("\n"));
    setLearningObjectives(selected.learningObjectives.join("\n"));
  }

  async function submit(formData: FormData, status: "draft" | "published" = "draft") {
    setBusy(true);
    setToast(null);
    const payload = buildPayload(formData, status);
    const url = mode === "edit" && product ? `/api/admin/products/${product.id}` : "/api/admin/products";
    const response = await fetch(url, {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
      method: mode === "edit" ? "PATCH" : "POST"
    });
    const result = await response.json();
    setBusy(false);

    if (!response.ok) {
      setToast({ message: result.error ?? "Product could not be saved.", type: "error" });
      return;
    }

    setToast({ message: status === "published" ? "Product saved. Open publish checklist to finalize." : "Draft saved.", type: "ok" });
    const productId = result.product?.id ?? product?.id;
    if (productId && mode === "create") router.push(`/admin/products/${productId}/files`);
    router.refresh();
  }

  function buildPayload(formData: FormData, status: "draft" | "published") {
    const selectedPrice = isFree ? 0 : Number(formData.get("price") ?? 0);
    return {
      categoryId: String(formData.get("categoryId") ?? categories[0]?.id ?? ""),
      fileCount: Number(formData.get("fileCount") ?? 0),
      fullDescription: String(formData.get("fullDescription") ?? ""),
      howToUse: String(formData.get("howToUse") ?? ""),
      includes,
      isFeatured: formData.get("isFeatured") === "on",
      language: String(formData.get("language") ?? "English"),
      learningObjectives,
      level: String(formData.get("level") ?? "General"),
      licenseText: String(formData.get("licenseText") ?? DIGITAL_LICENSE),
      pageCount: Number(formData.get("pageCount") ?? 0),
      pricing: {
        allowCoupons: formData.get("allowCoupons") === "on",
        compareAtPrice: Number(formData.get("compareAtPrice") || 0),
        currency: String(formData.get("currency") ?? "USD"),
        isFreeResource: isFree,
        price: selectedPrice
      },
      productKind: isFree ? "free_lead_magnet" : String(formData.get("productKind") ?? "digital_download"),
      recommendedPreviousKnowledge: String(formData.get("recommendedPreviousKnowledge") ?? ""),
      requiredLevel: String(formData.get("requiredLevel") ?? ""),
      resourceType,
      seo: {
        ogImagePath: String(formData.get("ogImagePath") ?? ""),
        seoDescription: String(formData.get("seoDescription") ?? ""),
        seoTitle: String(formData.get("seoTitle") ?? "")
      },
      shortDescription: String(formData.get("shortDescription") ?? ""),
      slug,
      status,
      tags,
      title,
      whoIsFor: String(formData.get("whoIsFor") ?? ""),
      whoIsThisFor: String(formData.get("whoIsThisFor") ?? ""),
      estimatedStudyTime: String(formData.get("estimatedStudyTime") ?? ""),
      liveExperience: {
        description: String(formData.get("experienceDescription") ?? ""),
        durationMinutes: Number(formData.get("durationMinutes") ?? 60),
        enabled: enableExperience,
        includesFollowUp: formData.get("includesFollowUp") === "on",
        includesLiveClass: true,
        includesMaterial: true,
        instructorId: String(formData.get("instructorId") ?? ""),
        isActive: enableExperience,
        meetingProvider: String(formData.get("meetingProvider") ?? "manual"),
        price: Number(formData.get("experiencePrice") ?? 0),
        title: String(formData.get("experienceTitle") ?? "")
      }
    };
  }

  return (
    <form className="admin-editor" action={(formData) => submit(formData, "draft")}>
      <AdminToast message={toast?.message ?? null} type={toast?.type} />
      <div className="admin-editor-toolbar">
        <div>
          <span className="type-badge">Completion {completion}%</span>
          <div className="completion-bar"><span style={{ width: `${completion}%` }} /></div>
        </div>
        <div className="admin-tools">
          <button className="button secondary" disabled={busy} type="submit">Save as draft</button>
          <button className="button gold" disabled={busy} type="button" onClick={(event) => submit(new FormData(event.currentTarget.form!), "published")}>Save and review publish</button>
        </div>
      </div>

      <section className="panel admin-editor-section">
        <h2>Admin access</h2>
        <label className="field"><span>Admin token</span><input value={adminToken} onChange={(event) => setAdminToken(event.target.value)} type="password" placeholder="ADMIN_ACCESS_TOKEN or use Supabase admin session in production" /></label>
      </section>

      <section className="panel admin-editor-section">
        <h2>1. Basic information</h2>
        <div className="form-grid">
          <label className="field"><span>Product title</span><input name="title" value={title} onChange={(event) => { setTitle(event.target.value); if (!product) setSlug(slugify(event.target.value)); }} /></label>
          <label className="field"><span>Slug</span><input name="slug" value={slug} onChange={(event) => setSlug(slugify(event.target.value))} /></label>
          <label className="field"><span>Create from template</span><select value={template} onChange={(event) => applyTemplate(event.target.value)}><option value="">No template</option>{Object.keys(PRODUCT_TEMPLATES).map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="field"><span>Category</span><select name="categoryId" defaultValue={product?.categoryId ?? categories[0]?.id}>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
          <label className="field"><span>Level</span><select name="level" defaultValue={product?.level ?? "B1"}>{["A1", "A2", "B1", "B2", "C1", "General", "Teacher Resource"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="field"><span>Language</span><input name="language" defaultValue={product?.language ?? "English"} /></label>
          <label className="field"><span>Resource type</span><select value={resourceType} onChange={(event) => setResourceType(event.target.value)}>{RESOURCE_TYPES.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="field"><span>Product kind</span><select name="productKind" defaultValue={product?.productKind ?? "digital_download"}><option>digital_download</option><option>bundle</option><option>learning_path</option><option>free_lead_magnet</option></select></label>
        </div>
        <label className="field"><span>Short description</span><textarea name="shortDescription" defaultValue={product?.shortDescription ?? ""} /></label>
        <label className="field"><span>Full description</span><textarea name="fullDescription" defaultValue={product?.fullDescription ?? ""} /></label>
        <label className="field"><span>Tags</span><textarea value={tags} onChange={(event) => setTags(event.target.value)} placeholder="past perfect, b1, grammar" /></label>
      </section>

      <section className="panel admin-editor-section">
        <h2>2. Academic content</h2>
        <div className="form-grid">
          <label className="field"><span>Estimated study time</span><input name="estimatedStudyTime" defaultValue={product?.estimatedStudyTime ?? "60 minutes"} /></label>
          <label className="field"><span>Number of pages</span><input name="pageCount" type="number" defaultValue={product?.pageCount ?? 0} /></label>
          <label className="field"><span>Number of files</span><input name="fileCount" type="number" defaultValue={product?.fileCount ?? 1} /></label>
          <label className="field"><span>Required level</span><input name="requiredLevel" defaultValue={product?.level ?? "B1"} /></label>
        </div>
        <label className="field"><span>Learning objectives</span><textarea value={learningObjectives} onChange={(event) => setLearningObjectives(event.target.value)} /></label>
        <label className="field"><span>What is included</span><textarea value={includes} onChange={(event) => setIncludes(event.target.value)} /></label>
        <label className="field"><span>Who this is for</span><textarea name="whoIsThisFor" defaultValue={product?.whoIsThisFor ?? product?.whoIsFor.join("\n") ?? ""} /></label>
        <label className="field"><span>How to use this material</span><textarea name="howToUse" defaultValue={product?.howToUse ?? ""} /></label>
        <label className="field"><span>Recommended previous knowledge</span><textarea name="recommendedPreviousKnowledge" defaultValue={product?.contents.join("\n") ?? ""} /></label>
      </section>

      <section className="panel admin-editor-section">
        <h2>3. Price</h2>
        <div className="form-grid">
          <label className="field"><span>Price</span><input name="price" type="number" step="0.01" defaultValue={price?.amount ?? 12} disabled={isFree} /></label>
          <label className="field"><span>Currency</span><select name="currency" defaultValue={price?.currency ?? "USD"}><option>USD</option><option>COP</option><option>EUR</option></select></label>
          <label className="field"><span>Compare at price</span><input name="compareAtPrice" type="number" step="0.01" defaultValue={price?.compareAtPrice ?? product?.compareAtPrice ?? 0} /></label>
          <label className="check-row"><input checked={isFree} onChange={(event) => setIsFree(event.target.checked)} type="checkbox" /><span>Is free resource?</span></label>
          <label className="check-row"><input name="isFeatured" defaultChecked={product?.isFeatured} type="checkbox" /><span>Featured product</span></label>
          <label className="check-row"><input name="allowCoupons" defaultChecked type="checkbox" /><span>Allow coupons</span></label>
        </div>
      </section>

      <section className="panel admin-editor-section">
        <h2>4. Files</h2>
        <p className="muted">Premium files are stored privately and only buyers with paid orders can download them.</p>
        {product?.id ? <a className="button secondary" href={`/admin/products/${product.id}/files`}>Manage cover, previews and premium files</a> : <p className="status info">Save the product as draft first, then upload files.</p>}
      </section>

      <section className="panel admin-editor-section">
        <h2>5. License</h2>
        <label className="field"><span>License text</span><textarea name="licenseText" defaultValue={product?.licenseText ?? DIGITAL_LICENSE} /></label>
      </section>

      <section className="panel admin-editor-section">
        <h2>6. Full LANCELOT Experience</h2>
        <label className="check-row"><input checked={enableExperience} onChange={(event) => setEnableExperience(event.target.checked)} type="checkbox" /><span>Enable Full LANCELOT Experience</span></label>
        {enableExperience ? (
          <div className="form-grid">
            <label className="field"><span>Live experience title</span><input name="experienceTitle" defaultValue={experience?.title ?? `${title} - Full LANCELOT Experience`} /></label>
            <label className="field"><span>Duration in minutes</span><input name="durationMinutes" type="number" defaultValue={experience?.durationMinutes ?? 60} /></label>
            <label className="field"><span>Full experience price</span><input name="experiencePrice" type="number" step="0.01" defaultValue={experience?.price ?? 45} /></label>
            <label className="field"><span>Instructor</span><select name="instructorId" defaultValue={experience?.instructorId ?? instructors[0]?.id}>{instructors.map((instructor) => <option value={instructor.id} key={instructor.id}>{instructor.name}</option>)}</select></label>
            <label className="field"><span>Meeting provider future</span><select name="meetingProvider" defaultValue={experience?.meetingProvider ?? "manual"}><option>manual</option><option>google_meet_future</option><option>zoom_future</option><option>teams_future</option></select></label>
            <label className="check-row"><input name="includesFollowUp" defaultChecked={experience?.includesFollowUp} type="checkbox" /><span>Includes follow-up</span></label>
            <label className="field full-span"><span>Live experience description</span><textarea name="experienceDescription" defaultValue={experience?.description ?? ""} /></label>
          </div>
        ) : null}
      </section>

      <section className="panel admin-editor-section">
        <h2>7. SEO</h2>
        <div className="form-grid">
          <label className="field"><span>SEO title</span><input name="seoTitle" defaultValue={product?.seoTitle ?? `${title} | LANCELOT`} /></label>
          <label className="field"><span>Open Graph image path</span><input name="ogImagePath" defaultValue={product?.ogImagePath ?? ""} /></label>
        </div>
        <label className="field"><span>SEO description</span><textarea name="seoDescription" defaultValue={product?.seoDescription ?? product?.shortDescription ?? ""} /></label>
      </section>
    </form>
  );
}
