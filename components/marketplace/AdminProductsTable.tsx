"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/marketplace/format";
import type { Product, ProductAsset, ProductFile, ProductPrice } from "@/lib/marketplace/types";

type AdminProductsTableProps = {
  products: Product[];
  prices: ProductPrice[];
  assetsByProduct: Record<string, ProductAsset[]>;
  filesByProduct: Record<string, ProductFile[]>;
};

export function AdminProductsTable({ products, prices, assetsByProduct, filesByProduct }: AdminProductsTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [kind, setKind] = useState("all");

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const matchesQuery = !query || product.title.toLowerCase().includes(query.toLowerCase());
        const matchesStatus = status === "all" || (product.status ?? (product.isPublished ? "published" : "draft")) === status;
        const matchesCategory = category === "all" || product.category === category;
        const matchesKind = kind === "all" || product.productKind === kind;
        return matchesQuery && matchesStatus && matchesCategory && matchesKind;
      }),
    [category, kind, products, query, status]
  );

  const categories = Array.from(new Set(products.map((product) => product.category)));
  const kinds = Array.from(new Set(products.map((product) => product.productKind)));

  return (
    <section className="panel admin-products-panel">
      <div className="admin-filter-row">
        <label className="field"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title" /></label>
        <label className="field"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
        <label className="field"><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="field"><span>Kind</span><select value={kind} onChange={(event) => setKind(event.target.value)}><option value="all">All</option>{kinds.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <div className="table-wrap">
        <table className="table admin-products-table">
          <thead>
            <tr>
              <th>Cover</th>
              <th>Title</th>
              <th>Category</th>
              <th>Level</th>
              <th>Price</th>
              <th>Status</th>
              <th>Kind</th>
              <th>Files</th>
              <th>Sales</th>
              <th>Last updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const price = prices.find((item) => item.productId === product.id && (item.priceType === "material_only" || item.priceType === "free"));
              const assets = assetsByProduct[product.id] ?? [];
              const files = filesByProduct[product.id] ?? [];
              return (
                <tr key={product.id}>
                  <td><div className="admin-thumb">{product.title.slice(0, 1)}</div></td>
                  <td><strong>{product.title}</strong><br /><span className="muted small">{product.resourceType}</span></td>
                  <td>{product.category}</td>
                  <td>{product.level}</td>
                  <td>{formatCurrency(price?.amount ?? 0, price?.currency ?? "USD")}</td>
                  <td><span className={`badge ${product.status ?? (product.isPublished ? "confirmed" : "pending")}`}>{product.status ?? (product.isPublished ? "published" : "draft")}</span></td>
                  <td>{product.productKind}</td>
                  <td>{assets.length} assets / {files.length} premium</td>
                  <td>0</td>
                  <td>{formatDateTime(product.updatedAt)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                      <Link href={`/admin/products/${product.id}/files`}>Files</Link>
                      <Link href={`/admin/products/${product.id}/preview`}>Preview</Link>
                      <Link href={`/admin/products/${product.id}/publish`}>Publish</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
