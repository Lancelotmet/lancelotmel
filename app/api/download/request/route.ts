import { NextRequest, NextResponse } from "next/server";
import { clientIp } from "@/lib/marketplace/security";
import { getProductById } from "@/lib/marketplace/repository";
import { downloadRequestSchema } from "@/lib/marketplace/validators";
import { createSupabaseServerClient, hasSupabaseAdminConfig, useMarketplaceDemoMode } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const parsed = downloadRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid download request." }, { status: 400 });
  }

  const payload = parsed.data;

  if (useMarketplaceDemoMode() || !hasSupabaseAdminConfig()) {
    const product = await getProductById(payload.productId);
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({
      expiresIn: 300,
      url: `data:text/plain;charset=utf-8,Secure%20demo%20download%20for%20${encodeURIComponent(product.title)}`
    });
  }

  const supabase = createSupabaseServerClient();
  const { data: access, error } = await supabase
    .from("download_access")
    .select("*, orders(status), product_files(bucket,path,is_active)")
    .eq("product_id", payload.productId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !access) {
    return NextResponse.json({ error: "No active download access for this product." }, { status: 403 });
  }

  if (access.orders?.status !== "paid") {
    return NextResponse.json({ error: "Order is not paid." }, { status: 403 });
  }

  if (access.downloads_used >= access.download_limit) {
    return NextResponse.json({ error: "Download limit reached." }, { status: 403 });
  }

  if (access.expires_at && new Date(access.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Download access expired." }, { status: 403 });
  }

  const file = Array.isArray(access.product_files) ? access.product_files[0] : access.product_files;
  if (!file?.is_active) {
    return NextResponse.json({ error: "File is not available." }, { status: 404 });
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from(file.bucket)
    .createSignedUrl(file.path, 300);

  if (signedError || !signed?.signedUrl) {
    return NextResponse.json({ error: signedError?.message ?? "Could not create signed URL." }, { status: 500 });
  }

  await supabase
    .from("download_access")
    .update({ downloads_used: access.downloads_used + 1 })
    .eq("id", access.id);

  await supabase.from("download_logs").insert({
    ip_address: clientIp(request),
    order_id: access.order_id,
    product_file_id: access.product_file_id,
    product_id: access.product_id,
    user_agent: request.headers.get("user-agent") ?? "unknown",
    user_id: access.user_id
  });

  return NextResponse.json({ expiresIn: 300, url: signed.signedUrl });
}
