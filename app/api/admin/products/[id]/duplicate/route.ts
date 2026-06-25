import { NextRequest, NextResponse } from "next/server";
import { duplicateAdminProduct } from "@/lib/marketplace/admin-repository";
import { requireAdminContext } from "@/lib/marketplace/security";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { admin, response } = await requireAdminContext(request);
  if (response) return response;

  const { id } = await context.params;
  try {
    const product = await duplicateAdminProduct(id, admin);
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not duplicate product." }, { status: 500 });
  }
}
