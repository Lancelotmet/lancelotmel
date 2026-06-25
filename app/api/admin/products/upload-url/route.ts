import { NextRequest, NextResponse } from "next/server";
import { assertUploadAllowed, bucketForAssetType, pathForUpload, sanitizeFileName } from "@/lib/marketplace/admin-products";
import { insertAudit } from "@/lib/marketplace/admin-repository";
import { requireAdminContext } from "@/lib/marketplace/security";
import { uploadFileSchema } from "@/lib/marketplace/validators";
import { createSupabaseServerClient, hasSupabaseAdminConfig, useMarketplaceDemoMode } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { admin, response } = await requireAdminContext(request);
  if (response) return response;

  const parsed = uploadFileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid upload request." }, { status: 400 });
  }

  const blocked = assertUploadAllowed(parsed.data);
  if (blocked) return NextResponse.json({ error: blocked }, { status: 400 });

  const bucket = bucketForAssetType(parsed.data.assetType);
  const path = pathForUpload(parsed.data);
  const safeFileName = sanitizeFileName(parsed.data.fileName);

  if (useMarketplaceDemoMode() || !hasSupabaseAdminConfig()) {
    return NextResponse.json({
      bucket,
      path,
      safeFileName,
      signedUrl: `/api/admin/products/register-file`,
      token: "demo-upload-token"
    });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Could not create signed upload URL." }, { status: 500 });
  }

  await insertAudit("product_upload_url_created", "product", parsed.data.productId, admin, {
    assetType: parsed.data.assetType,
    bucket,
    path
  });

  return NextResponse.json({
    bucket,
    path,
    safeFileName,
    signedUrl: data.signedUrl,
    token: data.token
  });
}
