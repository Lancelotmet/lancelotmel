import Link from "next/link";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { listCategories, listPrices, listProducts } from "@/lib/marketplace/repository";

type MarketplacePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const params = await searchParams;
  const q = getParam(params.q);
  const category = getParam(params.category);
  const level = getParam(params.level);
  const resourceType = getParam(params.type);
  const sort = getParam(params.sort) as "popular" | "recent" | "price_asc" | "price_desc" | undefined;

  const [products, categories, prices] = await Promise.all([
    listProducts({ category, level, query: q, resourceType, sort }),
    listCategories(),
    listPrices()
  ]);

  const levels = ["A1", "A2", "B1", "B2", "C1", "General", "Teacher Resource"];
  const resourceTypes = ["Complete Class Pack", "Infographic Pack", "Worksheet", "Lesson Pack", "PDF Guide", "Slides", "Workbook", "Assessment"];

  return (
    <main className="page shell">
      <div className="market-header">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h1>Find the exact resource or live experience you need.</h1>
          <p className="lead">Search by topic, level, category, language, resource type, popularity and publication date.</p>
        </div>
        <form className="market-search">
          <input name="q" defaultValue={q} placeholder="Search Past Perfect, pasado perfecto, had eaten..." />
          <button className="button gold" type="submit">Search</button>
        </form>
      </div>

      <div className="market-layout">
        <aside className="filters-panel">
          <h2>Filters</h2>
          <FilterGroup title="Category" param="category" values={categories.map((item) => ({ label: item.name, value: item.slug }))} current={category} />
          <FilterGroup title="Level" param="level" values={levels.map((item) => ({ label: item, value: item }))} current={level} />
          <FilterGroup title="Type" param="type" values={resourceTypes.map((item) => ({ label: item, value: item }))} current={resourceType} />
          <FilterGroup title="Sort" param="sort" values={[
            { label: "Popular", value: "popular" },
            { label: "Recent", value: "recent" },
            { label: "Price low to high", value: "price_asc" },
            { label: "Price high to low", value: "price_desc" }
          ]} current={sort} />
        </aside>

        <section>
          <div className="results-bar">
            <span>{products.length} results</span>
            {q ? <span>Search: {q}</span> : null}
          </div>
          {products.length ? (
            <div className="product-grid">
              {products.map((product) => <ProductCard key={product.id} product={product} prices={prices} />)}
            </div>
          ) : (
            <div className="empty-state large">
              <strong>No results found</strong>
              <span>This search is logged in production so LANCELOT can decide what to create next.</span>
              <Link className="button" href="/marketplace">Clear filters</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function FilterGroup({ title, param, values, current }: { title: string; param: string; values: { label: string; value: string }[]; current?: string }) {
  return (
    <div className="filter-group">
      <strong>{title}</strong>
      <Link className={!current ? "active" : ""} href="/marketplace">All</Link>
      {values.map((item) => (
        <Link className={current === item.value ? "active" : ""} href={`/marketplace?${param}=${encodeURIComponent(item.value)}`} key={item.value}>
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
