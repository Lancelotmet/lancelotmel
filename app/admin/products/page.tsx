import Link from "next/link";
import { AdminProductsTable } from "@/components/marketplace/AdminProductsTable";
import { listAdminPrices, listAdminProducts, listProductAssets, listProductFiles } from "@/lib/marketplace/admin-repository";

export default async function AdminProductsPage() {
  const [products, prices] = await Promise.all([listAdminProducts(), listAdminPrices()]);
  const assetEntries = await Promise.all(products.map(async (product) => [product.id, await listProductAssets(product.id)] as const));
  const fileEntries = await Promise.all(products.map(async (product) => [product.id, await listProductFiles(product.id)] as const));

  return (
    <main className="page shell">
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin products</p>
          <h1>Digital product publishing system.</h1>
          <p className="lead">Create drafts, upload protected files, review readiness and publish academic materials without touching code.</p>
        </div>
        <div className="admin-tools">
          <Link className="button gold" href="/admin/products/new">Create new product</Link>
          <Link className="button secondary" href="/admin/marketplace">Metrics</Link>
        </div>
      </div>
      <AdminProductsTable
        products={products}
        prices={prices}
        assetsByProduct={Object.fromEntries(assetEntries)}
        filesByProduct={Object.fromEntries(fileEntries)}
      />
    </main>
  );
}
