import { NextRequest, NextResponse } from "next/server";
import { getAdminProduct, updateAdminProduct } from "@/lib/marketplace/admin-repository";
import { requireAdminContext } from "@/lib/marketplace/security";
import { updateProductSchema } from "@/lib/marketplace/validators";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminContext(request);
  if (response) return response;

  const { id } = await context.params;
  const product = await getAdminProduct(id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { admin, response } = await requireAdminContext(request);
  if (response) return response;

  const { id } = await context.params;
  const parsed = updateProductSchema.safeParse({ ...(await request.json()), id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid product update." }, { status: 400 });
  }

  try {
    const product = await updateAdminProduct(parsed.data, admin);
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update product." }, { status: 500 });
  }
}
