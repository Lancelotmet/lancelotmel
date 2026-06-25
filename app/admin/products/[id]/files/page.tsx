import { notFound } from "next/navigation";
import { AdminFileManager } from "@/components/marketplace/AdminFileManager";
import { getAdminProduct, listProductAssets, listProductFiles } from "@/lib/marketplace/admin-repository";

type FilesProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductFilesPage({ params }: FilesProductPageProps) {
  const { id } = await params;
  const [product, assets, files] = await Promise.all([getAdminProduct(id), listProductAssets(id), listProductFiles(id)]);
  if (!product) notFound();

  return (
    <main className="page shell">
      <div className="market-header compact">
        <div>
          <p className="eyebrow">Product files</p>
          <h1>{product.title}</h1>
          <p className="lead">Upload cover, previews and the protected premium file. Premium files must stay in `protected-products`.</p>
        </div>
      </div>
      <AdminFileManager productId={product.id} assets={assets} files={files} />
    </main>
  );
}
