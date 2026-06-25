import { NextRequest, NextResponse } from "next/server";
import { createAdminProduct, listAdminProducts } from "@/lib/marketplace/admin-repository";
import { requireAdminContext } from "@/lib/marketplace/security";
import { createProductSchema } from "@/lib/marketplace/validators";

export async function GET(request: NextRequest) {
  const { response } = await requireAdminContext(request);
  if (response) return response;

  const products = await listAdminProducts();
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const { admin, response } = await requireAdminContext(request);
  if (response) return response;

  const parsed = createProductSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid product." }, { status: 400 });
  }

  try {
    const product = await createAdminProduct(parsed.data, admin);
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create product." }, { status: 500 });
  }
}
