import { notFound } from "next/navigation";
import { AdminProductEditor } from "@/components/marketplace/AdminProductEditor";
import { getAdminProduct, listAdminCategories, listAdminExperiences, listAdminInstructors, listAdminPrices } from "@/lib/marketplace/admin-repository";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAdminProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories, instructors, prices, experiences] = await Promise.all([
    getAdminProduct(id),
    listAdminCategories(),
    listAdminInstructors(),
    listAdminPrices(),
    listAdminExperiences(id)
  ]);
  if (!product) notFound();

  const price = prices.find((item) => item.productId === product.id && (item.priceType === "material_only" || item.priceType === "free"));
  const experience = experiences[0] ?? null;

  return (
    <main className="page shell">
      <div className="market-header compact">
        <div>
          <p className="eyebrow">Edit product</p>
          <h1>{product.title}</h1>
        </div>
      </div>
      <AdminProductEditor mode="edit" categories={categories} instructors={instructors} product={product} price={price} experience={experience} />
    </main>
  );
}
