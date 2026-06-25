import Link from "next/link";

type SuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;

  return (
    <main className="page shell">
      <section className="success-panel">
        <p className="eyebrow">Payment validated</p>
        <h1>Your LANCELOT access is ready.</h1>
        <p className="lead">
          Demo checkout has run the same backend transition expected from a signed payment webhook: order paid, download access created and booking confirmed when applicable.
        </p>
        {orderId ? <p className="muted">Order reference: {orderId}</p> : null}
        <div className="actions">
          <Link className="button gold" href="/my-library">Open My Library</Link>
          <Link className="button secondary" href="/my-bookings">View My Bookings</Link>
        </div>
      </section>
    </main>
  );
}
