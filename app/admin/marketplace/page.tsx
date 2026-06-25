import Link from "next/link";
import { listBookingsForEmail, listExperiences, listLibraryForEmail, listPrices, listProducts } from "@/lib/marketplace/repository";
import { formatCurrency } from "@/lib/marketplace/format";

export default async function AdminMarketplacePage() {
  const [products, prices, experiences, library, bookings] = await Promise.all([
    listProducts(),
    listPrices(),
    listExperiences(),
    listLibraryForEmail(),
    listBookingsForEmail()
  ]);
  const materialRevenue = products.reduce((sum, product) => sum + (prices.find((price) => price.productId === product.id && price.priceType === "material_only")?.amount ?? 0), 0);
  const experienceRevenue = experiences.reduce((sum, experience) => sum + experience.price, 0);

  return (
    <main className="page shell">
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>LANCELOT marketplace command center.</h1>
        </div>
        <div className="admin-tools">
          <Link className="button" href="/admin/marketplace/products">Create product</Link>
          <Link className="button secondary" href="/admin/marketplace/experiences">Experiences</Link>
          <Link className="button secondary" href="/admin/marketplace/bookings">Bookings</Link>
        </div>
      </div>

      <section className="summary-grid admin-metrics">
        <Metric label="Published products" value={products.length.toString()} />
        <Metric label="Material revenue model" value={formatCurrency(materialRevenue, "USD")} />
        <Metric label="Full experiences" value={experiences.length.toString()} />
        <Metric label="Experience revenue model" value={formatCurrency(experienceRevenue, "USD")} />
        <Metric label="Download accesses" value={library.length.toString()} />
        <Metric label="Bookings" value={bookings.length.toString()} />
        <Metric label="Conversion focus" value="Material -> Live" />
        <Metric label="Top topic" value={products[0]?.title.split(" - ")[0] ?? "None"} />
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Products</p>
            <h2>Catalog overview</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Level</th>
                <th>Type</th>
                <th>Material</th>
                <th>Full experience</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.title}</td>
                  <td>{product.level}</td>
                  <td>{product.resourceType}</td>
                  <td>{formatCurrency(prices.find((price) => price.productId === product.id && price.priceType === "material_only")?.amount ?? 0, "USD")}</td>
                  <td>{formatCurrency(experiences.find((experience) => experience.productId === product.id)?.price ?? 0, "USD")}</td>
                  <td><span className="badge confirmed">{product.isPublished ? "published" : "draft"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
