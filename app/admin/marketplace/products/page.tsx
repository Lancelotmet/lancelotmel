import { AdminProductForm } from "@/components/marketplace/AdminProductForm";
import { listCategories } from "@/lib/marketplace/repository";

export default async function AdminProductsPage() {
  const categories = await listCategories();

  return (
    <main className="page shell">
      <div className="market-header compact">
        <div>
          <p className="eyebrow">Admin products</p>
          <h1>Create a digital academic product.</h1>
          <p className="lead">Use the admin token in production requests. Supabase RLS also limits product management to admin roles.</p>
        </div>
      </div>
      <AdminProductForm categories={categories} />
    </main>
  );
}
