import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductVisual } from "@/components/marketplace/ProductVisual";
import { formatCurrency } from "@/lib/marketplace/format";
import { PRODUCT_LEGAL_NOTICE } from "@/lib/marketplace/legal";
import { getAdminProduct, listAdminExperiences, listAdminPrices, listProductAssets } from "@/lib/marketplace/admin-repository";

type PreviewProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPreviewPage({ params }: PreviewProductPageProps) {
  const { id } = await params;
  const [product, prices, experiences, assets] = await Promise.all([
    getAdminProduct(id),
    listAdminPrices(),
    listAdminExperiences(id),
    listProductAssets(id)
  ]);
  if (!product) notFound();

  const price = prices.find((item) => item.productId === product.id && (item.priceType === "material_only" || item.priceType === "free"));
  const experience = experiences[0];

  return (
    <main className="product-page">
      <div className="shell admin-preview-banner">
        <strong>Admin preview</strong>
        <span>This product is not necessarily published.</span>
        <Link href={`/admin/products/${product.id}/publish`}>Open publish checklist</Link>
      </div>
      <section className="product-hero shell">
        <div>
          <ProductVisual title={product.title} level={product.level} resourceType={product.resourceType} />
          <div className="preview-strip">
            {(assets.length ? assets : [null, null, null]).slice(0, 3).map((asset, index) => (
              <ProductVisual key={asset?.id ?? index} title={product.title} level="Free sample" resourceType="Watermarked preview" variant="preview" />
            ))}
          </div>
        </div>
        <div className="product-info">
          <div className="product-meta">
            <span>{product.category}</span>
            <span>{product.level}</span>
            <span>{product.language}</span>
            <span>{product.resourceType}</span>
          </div>
          <h1>{product.title}</h1>
          <p className="lead">{product.shortDescription}</p>
          <div className="file-specs">
            <span>{product.pageCount} pages</span>
            <span>{product.fileCount ?? 1} files</span>
            <span>{product.estimatedStudyTime ?? "Self-paced"}</span>
          </div>
        </div>
      </section>

      <section className="shell page-section">
        <div className="purchase-options">
          <article className="purchase-card">
            <span className="type-badge">Material Only</span>
            <h3>Study independently.</h3>
            <p>Get the complete digital material and learn at your own pace.</p>
            <ul>{product.includes.map((item) => <li key={item}>{item}</li>)}</ul>
            <strong className="price">{formatCurrency(price?.amount ?? 0, price?.currency ?? "USD")}</strong>
            <button className="button" type="button">Buy Material</button>
          </article>
          {experience?.isActive ? (
            <article className="purchase-card premium">
              <span className="type-badge gold">Full LANCELOT Experience</span>
              <h3>Learn with LANCELOT.</h3>
              <p>{experience.description}</p>
              <ul>
                <li>Everything in Material Only</li>
                <li>{experience.durationMinutes}-minute live class</li>
                <li>Guided practice and correction</li>
              </ul>
              <strong className="price">{formatCurrency(experience.price, experience.currency)}</strong>
              <button className="button gold" type="button">Book Live Experience</button>
            </article>
          ) : null}
        </div>
      </section>

      <section className="content-sections shell">
        <article><h2>What you will learn</h2><ul>{product.learningObjectives.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><h2>What is included</h2><ul>{product.includes.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><h2>Who this is for</h2><p>{product.whoIsThisFor ?? product.whoIsFor.join(", ")}</p></article>
        <article><h2>How to use this material</h2><p>{product.howToUse ?? product.fullDescription}</p></article>
      </section>

      <section className="shell page-section">
        <div className="legal-box">
          <h2>License and allowed use</h2>
          <p>{product.licenseText || PRODUCT_LEGAL_NOTICE}</p>
        </div>
      </section>
    </main>
  );
}
