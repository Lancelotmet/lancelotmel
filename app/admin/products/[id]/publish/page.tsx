import { notFound } from "next/navigation";
import { AdminPublishPanel } from "@/components/marketplace/AdminPublishPanel";
import { buildReadinessChecklist } from "@/lib/marketplace/admin-products";
import { getAdminProduct, listAdminPrices, listProductAssets, listProductFiles } from "@/lib/marketplace/admin-repository";

type PublishProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPublishPage({ params }: PublishProductPageProps) {
  const { id } = await params;
  const [product, assets, files, prices] = await Promise.all([
    getAdminProduct(id),
    listProductAssets(id),
    listProductFiles(id),
    listAdminPrices()
  ]);
  if (!product) notFound();
  const price = prices.find((item) => item.productId === product.id && (item.priceType === "material_only" || item.priceType === "free"));
  const readiness = buildReadinessChecklist({ product, assets, files, price: price?.amount ?? 0 });

  return (
    <main className="page shell">
      <div className="market-header compact">
        <div>
          <p className="eyebrow">Publish product</p>
          <h1>{product.title}</h1>
          <p className="lead">Review critical requirements before making this product visible and purchasable.</p>
        </div>
      </div>
      <AdminPublishPanel product={product} readiness={readiness} />
    </main>
  );
}
