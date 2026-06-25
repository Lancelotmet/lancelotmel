import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/marketplace/AddToCartButton";
import { BookingSelector } from "@/components/marketplace/BookingSelector";
import { ProductVisual } from "@/components/marketplace/ProductVisual";
import { PRODUCT_LEGAL_NOTICE } from "@/lib/marketplace/legal";
import { formatCurrency } from "@/lib/marketplace/format";
import { getMaterialPrice } from "@/lib/marketplace/pricing";
import { getProductBySlug, listAvailability, listExperiences, listLearningPaths, listPrices, listProducts } from "@/lib/marketplace/repository";

type ProductPageProps = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug.at(-1) ?? "");
  if (!product) return {};

  return {
    title: `${product.title} | LANCELOT Academic Marketplace`,
    description: product.shortDescription,
    alternates: { canonical: `/marketplace/${product.categorySlug}/${product.level.toLowerCase()}/${product.slug}` },
    openGraph: {
      description: product.shortDescription,
      images: [`/marketplace/${product.slug}/opengraph-image`],
      title: product.title,
      type: "website"
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug.at(-1) ?? "");
  if (!product) notFound();

  const [prices, experiences, learningPaths, relatedProducts] = await Promise.all([
    listPrices(),
    listExperiences(product.id),
    listLearningPaths(product.id),
    listProducts({ category: product.categorySlug })
  ]);
  const materialPrice = getMaterialPrice(product.id, prices);
  const experience = experiences[0];
  const slots = experience ? await listAvailability(experience.id) : [];
  const related = relatedProducts.filter((item) => item.id !== product.id).slice(0, 3);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    brand: "LANCELOT",
    category: product.category,
    description: product.shortDescription,
    name: product.title,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: materialPrice?.amount ?? 0,
      priceCurrency: materialPrice?.currency ?? "USD",
      url: `https://lancelotmet.com/marketplace/${product.categorySlug}/${product.level.toLowerCase()}/${product.slug}`
    }
  };

  return (
    <main className="product-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="product-hero shell">
        <div>
          <ProductVisual title={product.title} level={product.level} resourceType={product.resourceType} />
          <div className="preview-strip">
            {product.previewImages.map((preview) => (
              <ProductVisual key={preview} title={product.title} level="Free sample" resourceType="Watermarked preview" variant="preview" />
            ))}
          </div>
        </div>
        <div className="product-info">
          <nav className="breadcrumbs">
            <Link href="/marketplace">Marketplace</Link>
            <span>/</span>
            <Link href={`/marketplace?category=${product.categorySlug}`}>{product.category}</Link>
            <span>/</span>
            <span>{product.level}</span>
          </nav>
          <div className="product-meta">
            <span>{product.category}</span>
            <span>{product.level}</span>
            <span>{product.language}</span>
            <span>{product.resourceType}</span>
          </div>
          <h1>{product.title}</h1>
          <p className="lead">{product.shortDescription}</p>
          <div className="file-specs">
            <span>{product.pageCount} pages/files</span>
            <span>{product.fileType}</span>
            <span>{product.fileSize}</span>
          </div>
          {learningPaths.length ? (
            <div className="path-callout">
              This product is part of: <strong>{learningPaths.map((path) => path.title).join(", ")}</strong>
            </div>
          ) : null}
        </div>
      </section>

      <section className="shell page-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Choose your learning path</p>
            <h2>Study independently or book a live class on this exact topic.</h2>
          </div>
        </div>
        <div className="purchase-options">
          <article className="purchase-card">
            <span className="type-badge">Material Only</span>
            <h3>Study independently.</h3>
            <p>Get the complete digital material and learn at your own pace.</p>
            <ul>{product.includes.map((item) => <li key={item}>{item}</li>)}</ul>
            <strong className="price">{formatCurrency(materialPrice?.amount ?? 0, materialPrice?.currency ?? "USD")}</strong>
            <AddToCartButton
              item={{ itemType: "digital_material", productId: product.id }}
              label="Buy Material"
              redirectToCart
            />
          </article>

          {experience ? (
            <article className="purchase-card premium">
              <span className="type-badge gold">Full LANCELOT Experience</span>
              <h3>Learn with LANCELOT.</h3>
              <p>Book a live session and transform the material into a guided learning experience.</p>
              <ul>
                <li>Everything in Material Only</li>
                <li>{experience.durationMinutes}-minute live class</li>
                <li>Personalized explanation and guided practice</li>
                <li>Error correction and post-class recommendations</li>
                <li>Secure digital download after payment</li>
              </ul>
              <strong className="price">{formatCurrency(experience.price, experience.currency)}</strong>
              <a className="button gold" href="#book-live">Book Live Experience</a>
            </article>
          ) : null}
        </div>
      </section>

      <section className="content-sections shell">
        <article>
          <h2>What you will learn</h2>
          <ul>{product.learningObjectives.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article>
          <h2>What is included</h2>
          <ul>{product.includes.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article>
          <h2>Who this is for</h2>
          <ul>{product.whoIsFor.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article>
          <h2>How to use this material</h2>
          <p>{product.fullDescription}</p>
        </article>
      </section>

      {experience ? (
        <section className="shell page-section">
          <BookingSelector product={product} experience={experience} slots={slots} />
        </section>
      ) : null}

      <section className="shell page-section">
        <div className="legal-box">
          <h2>License and allowed use</h2>
          <p>{PRODUCT_LEGAL_NOTICE}</p>
          <p>{product.licenseText}</p>
        </div>
      </section>

      <section className="shell page-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Related resources</p>
            <h2>Continue the learning route</h2>
          </div>
        </div>
        <div className="related-list">
          {related.map((item) => (
            <Link href={`/marketplace/${item.categorySlug}/${item.level.toLowerCase()}/${item.slug}`} key={item.id}>{item.title}</Link>
          ))}
        </div>
      </section>
    </main>
  );
}
