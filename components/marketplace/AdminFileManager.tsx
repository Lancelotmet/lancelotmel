"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { ProductAsset, ProductFile } from "@/lib/marketplace/types";
import { AdminToast } from "./AdminToast";

type UploadKind = "cover" | "preview_image" | "preview_pdf" | "gallery_image" | "og_image" | "premium_file";

export function AdminFileManager({ productId, assets, files }: { productId: string; assets: ProductAsset[]; files: ProductFile[] }) {
  const [adminToken, setAdminToken] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "info" | "error" | "ok" } | null>(null);
  const [progress, setProgress] = useState<Record<string, string>>({});
  const nextVersion = Math.max(0, ...files.map((file) => file.version)) + 1;

  async function upload(file: File | null, assetType: UploadKind) {
    if (!file) return;
    setProgress((current) => ({ ...current, [assetType]: "uploading" }));
    setToast(null);

    const uploadResponse = await fetch("/api/admin/products/upload-url", {
      body: JSON.stringify({
        assetType,
        fileName: file.name,
        mimeType: file.type,
        productId,
        sizeBytes: file.size,
        version: assetType === "premium_file" ? nextVersion : undefined
      }),
      headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
      method: "POST"
    });
    const uploadPayload = await uploadResponse.json();
    if (!uploadResponse.ok) {
      setProgress((current) => ({ ...current, [assetType]: "failed" }));
      setToast({ message: uploadPayload.error ?? "Upload URL could not be created.", type: "error" });
      return;
    }

    if (uploadPayload.token !== "demo-upload-token") {
      try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.storage
          .from(uploadPayload.bucket)
          .uploadToSignedUrl(uploadPayload.path, uploadPayload.token, file);
        if (error) throw error;
      } catch (error) {
        setProgress((current) => ({ ...current, [assetType]: "failed" }));
        setToast({ message: error instanceof Error ? error.message : "Upload failed.", type: "error" });
        return;
      }
    }

    const registerResponse = await fetch("/api/admin/products/register-file", {
      body: JSON.stringify({
        assetType,
        bucket: uploadPayload.bucket,
        displayFileName: file.name,
        fileName: file.name,
        isActive: true,
        isPublicPreview: assetType !== "premium_file",
        mimeType: file.type,
        originalFileName: file.name,
        path: uploadPayload.path,
        productId,
        sizeBytes: file.size,
        sortOrder: assets.length + 1,
        version: assetType === "premium_file" ? nextVersion : 1,
        availableToPreviousBuyers: true
      }),
      headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
      method: "POST"
    });
    const registerPayload = await registerResponse.json();
    if (!registerResponse.ok) {
      setProgress((current) => ({ ...current, [assetType]: "failed" }));
      setToast({ message: registerPayload.error ?? "File could not be registered.", type: "error" });
      return;
    }

    setProgress((current) => ({ ...current, [assetType]: "uploaded" }));
    setToast({ message: `${file.name} uploaded and registered.`, type: "ok" });
  }

  return (
    <div className="admin-file-manager">
      <AdminToast message={toast?.message ?? null} type={toast?.type} />
      <section className="panel admin-editor-section">
        <h2>Secure upload access</h2>
        <label className="field"><span>Admin token</span><input value={adminToken} onChange={(event) => setAdminToken(event.target.value)} type="password" placeholder="ADMIN_ACCESS_TOKEN" /></label>
        <p className="muted">The frontend asks the backend for a signed upload URL. The service role key never reaches the browser.</p>
      </section>

      <section className="file-upload-grid">
        <UploadCard title="Cover image" description="Main product image. Max 5 MB." assetType="cover" progress={progress.cover} onUpload={upload} />
        <UploadCard title="Preview image" description="Watermarked buyer preview. Max 5 MB." assetType="preview_image" progress={progress.preview_image} onUpload={upload} />
        <UploadCard title="Preview PDF" description="Limited free sample. Max 20 MB." assetType="preview_pdf" progress={progress.preview_pdf} onUpload={upload} />
        <UploadCard title="Open Graph image" description="SEO/social preview image. Max 5 MB." assetType="og_image" progress={progress.og_image} onUpload={upload} />
        <UploadCard title="Premium digital file" description="Protected buyer download. Max 200 MB." assetType="premium_file" progress={progress.premium_file} onUpload={upload} />
      </section>

      <section className="panel">
        <h2>Registered preview assets</h2>
        <FileTable rows={assets.map((asset) => ({ id: asset.id, type: asset.assetType, bucket: asset.bucket, path: asset.path, name: asset.originalFileName, status: asset.isPublicPreview ? "public preview" : "private preview" }))} />
      </section>
      <section className="panel">
        <h2>Premium file versions</h2>
        <p className="muted">Upload new version creates a new record. Older files are not deleted automatically.</p>
        <FileTable rows={files.map((file) => ({ id: file.id, type: `v${file.version}`, bucket: file.bucket, path: file.path, name: file.displayFileName, status: file.isActive ? "active" : "inactive" }))} />
      </section>
    </div>
  );
}

function UploadCard({ title, description, assetType, progress, onUpload }: { title: string; description: string; assetType: UploadKind; progress?: string; onUpload: (file: File | null, assetType: UploadKind) => void }) {
  return (
    <article className="upload-card">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
        <span className="type-badge">{assetType === "premium_file" ? "Protected premium file" : "Preview file"}</span>
      </div>
      <input type="file" onChange={(event) => onUpload(event.target.files?.[0] ?? null, assetType)} />
      {progress ? <p className={`upload-status ${progress}`}>{progress}</p> : null}
    </article>
  );
}

function FileTable({ rows }: { rows: { id: string; type: string; bucket: string; path: string; name: string; status: string }[] }) {
  if (!rows.length) {
    return <div className="empty-state"><strong>No files yet</strong><span>Upload and register files to make the product publishable.</span></div>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Type</th><th>Name</th><th>Bucket</th><th>Path</th><th>Status</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.id}><td>{row.type}</td><td>{row.name}</td><td>{row.bucket}</td><td>{row.path}</td><td>{row.status}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
