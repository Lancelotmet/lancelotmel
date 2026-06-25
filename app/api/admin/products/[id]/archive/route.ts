import { NextRequest, NextResponse } from "next/server";
import { archiveAdminProduct } from "@/lib/marketplace/admin-repository";
import { requireAdminContext } from "@/lib/marketplace/security";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { admin, response } = await requireAdminContext(request);
  if (response) return response;

  const { id } = await context.params;
  const product = await archiveAdminProduct(id, admin);
  return NextResponse.json({ ok: true, product });
}
