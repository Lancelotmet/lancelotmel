import { DownloadButton } from "@/components/marketplace/DownloadButton";
import { formatDateTime } from "@/lib/marketplace/format";
import { listLibraryForEmail } from "@/lib/marketplace/repository";

type LibraryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MyLibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const library = await listLibraryForEmail(email);

  return (
    <main className="page shell">
      <div className="market-header compact">
        <div>
          <p className="eyebrow">My Library</p>
          <h1>Your secure academic downloads.</h1>
          <p className="lead">Downloads are enabled only after paid orders and delivered through temporary signed links.</p>
        </div>
      </div>
      {library.length ? (
        <div className="library-grid">
          {library.map((item) => (
            <article className="library-card" key={item.accessId}>
              <div>
                <span className="type-badge">Purchased {formatDateTime(item.purchasedAt)}</span>
                <h2>{item.product.title}</h2>
                <p>{item.product.shortDescription}</p>
                <p className="muted small">Downloads used: {item.downloadsUsed}/{item.downloadLimit}</p>
              </div>
              <DownloadButton orderId={item.orderId} productId={item.product.id} />
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state large">
          <strong>No purchases yet</strong>
          <span>When a paid order is validated, your material appears here automatically.</span>
        </div>
      )}
    </main>
  );
}
