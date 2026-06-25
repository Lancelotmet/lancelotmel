import { NextRequest, NextResponse } from "next/server";
import { requireAdminContext } from "@/lib/marketplace/security";
import { createSupabaseServerClient, hasSupabaseAdminConfig, useMarketplaceDemoMode } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { admin, response } = await requireAdminContext(request);
  if (response) return response;
  if (admin?.role !== "super_admin") {
    return NextResponse.json({ error: "Only super_admin can inspect orphan files." }, { status: 403 });
  }

  if (useMarketplaceDemoMode() || !hasSupabaseAdminConfig()) {
    return NextResponse.json({ orphans: [], message: "Demo mode. No storage scan performed." });
  }

  const supabase = createSupabaseServerClient();
  const { data: registeredAssets } = await supabase.from("product_assets").select("bucket,path");
  const { data: registeredFiles } = await supabase.from("product_files").select("bucket,path");
  const registered = new Set([...(registeredAssets ?? []), ...(registeredFiles ?? [])].map((item) => `${item.bucket}/${item.path}`));
  const buckets = ["product-previews", "protected-products"];
  const orphans: { bucket: string; path: string }[] = [];

  for (const bucket of buckets) {
    const { data } = await supabase.storage.from(bucket).list("", { limit: 100 });
    for (const object of data ?? []) {
      const key = `${bucket}/${object.name}`;
      if (!registered.has(key)) orphans.push({ bucket, path: object.name });
    }
  }

  return NextResponse.json({
    message: "Review only. Nothing was deleted.",
    orphans
  });
}
