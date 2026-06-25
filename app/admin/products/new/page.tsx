import { AdminProductEditor } from "@/components/marketplace/AdminProductEditor";
import { listAdminCategories, listAdminInstructors } from "@/lib/marketplace/admin-repository";

export default async function NewAdminProductPage() {
  const [categories, instructors] = await Promise.all([listAdminCategories(), listAdminInstructors()]);

  return (
    <main className="page shell">
      <div className="market-header compact">
        <div>
          <p className="eyebrow">New product</p>
          <h1>Create a sellable academic material.</h1>
          <p className="lead">Start as draft, upload files, then publish after the readiness checklist passes.</p>
        </div>
      </div>
      <AdminProductEditor mode="create" categories={categories} instructors={instructors} />
    </main>
  );
}
