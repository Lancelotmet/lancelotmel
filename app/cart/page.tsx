import { CartClient } from "@/components/marketplace/CartClient";
import { listExperiences, listPrices, listProducts } from "@/lib/marketplace/repository";

export default async function CartPage() {
  const [products, prices, experiences] = await Promise.all([listProducts(), listPrices(), listExperiences()]);

  return (
    <main className="page shell">
      <div className="market-header compact">
        <div>
          <p className="eyebrow">Cart</p>
          <h1>Review your material and experience selections.</h1>
        </div>
      </div>
      <CartClient products={products} prices={prices} experiences={experiences} />
    </main>
  );
}
