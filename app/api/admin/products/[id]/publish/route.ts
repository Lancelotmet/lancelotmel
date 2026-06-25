import { NextRequest, NextResponse } from "next/server";
import { buildReadinessChecklist } from "@/lib/marketplace/admin-products";
import { getAdminProduct, listAdminPrices, listProductAssets, listProductFiles, publishAdminProduct } from "@/lib/marketplace/admin-repository";
import { requireAdminContext } from "@/lib/marketplace/security";
import { publishProductSchema } from "@/lib/marketplace/validators";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { admin, response } = await requireAdminContext(request);
  if (response) return response;

  const parsed = publishProductSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Publication confirmation is required." }, { status: 400 });
  }

  const { id } = await context.params;
  const [product, assets, files, prices] = await Promise.all([
    getAdminProduct(id),
    listProductAssets(id),
    listProductFiles(id),
    listAdminPrices()
  ]);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const price = prices.find((item) => item.productId === id && (item.priceType === "material_only" || item.priceType === "free"));
  const readiness = buildReadinessChecklist({ product, assets, files, price: price?.amount ?? 0 });
  if (!readiness.complete) {
    return NextResponse.json({ error: "Product is not ready to publish.", readiness }, { status: 422 });
  }

  const updated = await publishAdminProduct(id, admin);
  return NextResponse.json({ ok: true, product: updated, readiness });
}
