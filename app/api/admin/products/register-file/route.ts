import { NextRequest, NextResponse } from "next/server";
import { insertAudit } from "@/lib/marketplace/admin-repository";
import { assertUploadAllowed } from "@/lib/marketplace/admin-products";
import { requireAdminContext } from "@/lib/marketplace/security";
import { registerFileSchema } from "@/lib/marketplace/validators";
import { createSupabaseServerClient, hasSupabaseAdminConfig, useMarketplaceDemoMode } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { admin, response } = await requireAdminContext(request);
  if (response) return response;

  const parsed = registerFileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid file registration." }, { status: 400 });
  }

  const blocked = assertUploadAllowed(parsed.data);
  if (blocked) return NextResponse.json({ error: blocked }, { status: 400 });

  if (parsed.data.assetType === "premium_file" && parsed.data.bucket !== "protected-products") {
    return NextResponse.json({ error: "Premium files must be stored in protected-products." }, { status: 400 });
  }

  if (useMarketplaceDemoMode() || !hasSupabaseAdminConfig()) {
    return NextResponse.json({
      ok: true,
      record: {
        id: `demo-file-${Date.now()}`,
        ...parsed.data
      }
    });
  }

  const supabase = createSupabaseServerClient();
  const exists = await supabase.storage.from(parsed.data.bucket).list(parsed.data.path.split("/").slice(0, -1).join("/"), {
    search: parsed.data.path.split("/").at(-1)
  });
  if (exists.error) {
    return NextResponse.json({ error: exists.error.message }, { status: 500 });
  }
  if (!exists.data?.length) {
    return NextResponse.json({ error: "Uploaded file was not found in storage." }, { status: 404 });
  }

  if (parsed.data.assetType === "premium_file") {
    if (parsed.data.isActive) {
      await supabase
        .from("product_files")
        .update({ is_active: false })
        .eq("product_id", parsed.data.productId);
    }

    const { data, error } = await supabase
      .from("product_files")
      .insert({
        available_to_previous_buyers: parsed.data.availableToPreviousBuyers,
        bucket: parsed.data.bucket,
        display_file_name: parsed.data.displayFileName || parsed.data.originalFileName,
        file_name: parsed.data.originalFileName,
        file_size: parsed.data.sizeBytes,
        file_type: parsed.data.mimeType,
        is_active: parsed.data.isActive,
        mime_type: parsed.data.mimeType,
        original_file_name: parsed.data.originalFileName,
        path: parsed.data.path,
        product_id: parsed.data.productId,
        size_bytes: parsed.data.sizeBytes,
        uploaded_by: admin?.userId ?? null,
        version: parsed.data.version ?? 1
      })
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await insertAudit("product_file_uploaded", "product", parsed.data.productId, admin, { fileId: data.id, version: data.version });
    return NextResponse.json({ ok: true, record: data });
  }

  const { data, error } = await supabase
    .from("product_assets")
    .insert({
      asset_type: parsed.data.assetType,
      bucket: parsed.data.bucket,
      is_public_preview: parsed.data.isPublicPreview,
      mime_type: parsed.data.mimeType,
      original_file_name: parsed.data.originalFileName,
      path: parsed.data.path,
      product_id: parsed.data.productId,
      size_bytes: parsed.data.sizeBytes,
      sort_order: parsed.data.sortOrder
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await insertAudit("product_asset_uploaded", "product", parsed.data.productId, admin, { assetId: data.id, assetType: parsed.data.assetType });
  return NextResponse.json({ ok: true, record: data });
}
