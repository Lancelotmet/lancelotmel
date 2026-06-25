import { formatCurrency } from "@/lib/marketplace/format";
import { listExperiences, listProducts } from "@/lib/marketplace/repository";

export default async function AdminExperiencesPage() {
  const [experiences, products] = await Promise.all([listExperiences(), listProducts()]);

  return (
    <main className="page shell">
      <div className="market-header compact">
        <div>
          <p className="eyebrow">Admin experiences</p>
          <h1>Manage Full LANCELOT Experience packages.</h1>
        </div>
      </div>
      <div className="table-wrap panel">
        <table className="table">
          <thead><tr><th>Experience</th><th>Product</th><th>Duration</th><th>Price</th><th>Reduced class price</th><th>Status</th></tr></thead>
          <tbody>
            {experiences.map((experience) => (
              <tr key={experience.id}>
                <td>{experience.title}</td>
                <td>{products.find((product) => product.id === experience.productId)?.title ?? experience.productId}</td>
                <td>{experience.durationMinutes} min</td>
                <td>{formatCurrency(experience.price, experience.currency)}</td>
                <td>{formatCurrency(experience.reducedPriceAfterMaterial, experience.currency)}</td>
                <td><span className="badge confirmed">{experience.isActive ? "active" : "inactive"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
