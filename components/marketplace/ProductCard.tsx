import Link from "next/link";
import { formatCurrency } from "@/lib/marketplace/format";
import { getMaterialPrice } from "@/lib/marketplace/pricing";
import type { Product, ProductPrice } from "@/lib/marketplace/types";
import { ProductVisual } from "./ProductVisual";

type ProductCardProps = {
  product: Product;
  prices: ProductPrice[];
};

export function ProductCard({ product, prices }: ProductCardProps) {
  const materialPrice = getMaterialPrice(product.id, prices);

  return (
    <article className="product-card">
      <Link href={`/marketplace/${product.categorySlug}/${product.level.toLowerCase()}/${product.slug}`} aria-label={product.title}>
        <ProductVisual title={product.title} level={product.level} resourceType={product.resourceType} />
      </Link>
      <div className="product-card-body">
        <div className="product-meta">
          <span>{product.category}</span>
          <span>{product.level}</span>
          <span>{product.resourceType}</span>
        </div>
        <h3>
          <Link href={`/marketplace/${product.categorySlug}/${product.level.toLowerCase()}/${product.slug}`}>
            {product.title}
          </Link>
        </h3>
        <p>{product.shortDescription}</p>
        <div className="product-card-footer">
          <strong>{formatCurrency(materialPrice?.amount ?? 0, materialPrice?.currency ?? "USD")}</strong>
          <Link className="text-link" href={`/marketplace/${product.categorySlug}/${product.level.toLowerCase()}/${product.slug}`}>
            View product
          </Link>
        </div>
      </div>
    </article>
  );
}
