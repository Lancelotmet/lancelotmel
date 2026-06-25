import { CheckoutClient } from "@/components/marketplace/CheckoutClient";
import { listExperiences, listPrices, listProducts } from "@/lib/marketplace/repository";

export default async function CheckoutPage() {
  const [products, prices, experiences] = await Promise.all([listProducts(), listPrices(), listExperiences()]);

  return (
    <main className="page shell">
      <div className="market-header compact">
        <div>
          <p className="eyebrow">Secure checkout</p>
          <h1>Validate payment before download or booking confirmation.</h1>
        </div>
      </div>
      <CheckoutClient products={products} prices={prices} experiences={experiences} />
    </main>
  );
}
