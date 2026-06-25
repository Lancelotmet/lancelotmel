import Link from "next/link";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { listCategories, listPrices, listProducts } from "@/lib/marketplace/repository";

export default async function Home() {
  const [products, categories, prices] = await Promise.all([
    listProducts({ sort: "popular" }),
    listCategories(),
    listPrices()
  ]);
  const featured = products.filter((product) => product.isFeatured).slice(0, 3);
  const recent = products.slice(0, 4);

  return (
    <main>
      <section className="market-hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">LANCELOT Academic Marketplace</p>
            <h1>Premium Academic Downloads for Smarter Learning</h1>
            <p className="lead">
              Download complete class packs, worksheets, infographics, lesson guides and learning resources designed with the LANCELOT method.
            </p>
            <form className="hero-search" action="/marketplace">
              <input name="q" placeholder="Search Past Perfect B1, had eaten, pronunciation..." />
              <button className="button gold" type="submit">Search</button>
            </form>
            <div className="hero-actions">
              <Link className="button" href="/marketplace">Explore resources</Link>
              <Link className="button secondary" href="/marketplace/free-resources">Free resources</Link>
            </div>
          </div>
          <div className="hero-art" aria-label="LANCELOT premium academic marketplace visual">
            <div className="orbital-card main">
              <span>Not just downloads</span>
              <strong>Guided learning experiences</strong>
            </div>
            <div className="orbital-card small top">Material Only</div>
            <div className="orbital-card small bottom">Full LANCELOT Experience</div>
          </div>
        </div>
      </section>

      <section className="page-section shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Categories</p>
            <h2>Academic resources with room to scale</h2>
          </div>
          <Link className="text-link" href="/marketplace">View all</Link>
        </div>
        <div className="category-grid">
          {categories.slice(0, 6).map((category) => (
            <Link className="category-tile" href={`/marketplace?category=${category.slug}`} key={category.id}>
              <span>{category.name}</span>
              <p>{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-section shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured</p>
            <h2>Buy the material. Or live the complete LANCELOT experience.</h2>
          </div>
        </div>
        <div className="product-grid">
          {featured.map((product) => <ProductCard key={product.id} product={product} prices={prices} />)}
        </div>
      </section>

      <section className="benefit-band">
        <div className="shell benefit-grid">
          <div>
            <p className="eyebrow">Why LANCELOT</p>
            <h2>Premium academic resources designed to turn content into understanding.</h2>
          </div>
          <div className="benefits">
            <article><strong>Designed for mastery</strong><span>Visual logic, guided practice and learning objectives in every pack.</span></article>
            <article><strong>Secure delivery</strong><span>Private storage, temporary download links and purchase validation.</span></article>
            <article><strong>Live upgrade path</strong><span>Each material can become a guided class on the exact topic.</span></article>
          </div>
        </div>
      </section>

      <section className="page-section shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recent</p>
            <h2>New academic downloads</h2>
          </div>
        </div>
        <div className="product-grid four">
          {recent.map((product) => <ProductCard key={product.id} product={product} prices={prices} />)}
        </div>
      </section>
    </main>
  );
}
