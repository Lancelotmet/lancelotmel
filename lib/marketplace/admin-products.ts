import { PRODUCT_LEGAL_NOTICE } from "./legal";
import type { Product, ProductAsset, ProductFile, ProductStatus } from "./types";

export const RESOURCE_TYPES = [
  "PDF Guide",
  "Infographic Pack",
  "Worksheet",
  "Lesson Plan",
  "Complete Class Pack",
  "Workbook",
  "Assessment",
  "Prompt Pack",
  "Slides",
  "ZIP Bundle",
  "Teacher Resource"
] as const;

export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "General", "Teacher Resource"] as const;
export const CURRENCIES = ["USD", "COP", "EUR"] as const;

export const ALLOWED_UPLOAD_MIME_TYPES = [
  "application/pdf",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/webp"
] as const;

export const BLOCKED_EXTENSIONS = [
  "exe",
  "bat",
  "cmd",
  "sh",
  "js",
  "php",
  "py",
  "jar",
  "msi",
  "dmg",
  "app"
] as const;

export const UPLOAD_LIMITS = {
  cover: 5 * 1024 * 1024,
  gallery_image: 5 * 1024 * 1024,
  og_image: 5 * 1024 * 1024,
  preview_image: 5 * 1024 * 1024,
  preview_pdf: 20 * 1024 * 1024,
  premium_file: 200 * 1024 * 1024
};

export const PRODUCT_TEMPLATES = {
  "Complete Class Pack": {
    includes: ["Lesson guide", "Premium infographics", "Practice worksheet", "Answer key", "Speaking activity", "Mini assessment"],
    learningObjectives: ["Understand the topic through visual logic.", "Practice with guided activities.", "Apply the concept in speaking or writing."],
    resourceType: "Complete Class Pack"
  },
  "Infographic Pack": {
    includes: ["Visual guide", "Printable infographics", "Quick review sheet"],
    learningObjectives: ["Understand the concept visually.", "Use the guide for review and practice."],
    resourceType: "Infographic Pack"
  },
  Worksheet: {
    includes: ["Practice worksheet", "Answer key", "Teacher notes"],
    learningObjectives: ["Practice the target topic.", "Identify and correct common mistakes."],
    resourceType: "Worksheet"
  },
  "Lesson Guide": {
    includes: ["Lesson flow", "Teacher notes", "Student prompts"],
    learningObjectives: ["Teach the concept with a clear sequence.", "Guide learners through practice."],
    resourceType: "Lesson Plan"
  },
  Assessment: {
    includes: ["Assessment", "Answer key", "Rubric"],
    learningObjectives: ["Evaluate understanding.", "Identify next learning steps."],
    resourceType: "Assessment"
  },
  "Mindset Guide": {
    includes: ["PDF guide", "Reflection prompts", "Action plan"],
    learningObjectives: ["Reframe learning obstacles.", "Build a practical improvement routine."],
    resourceType: "PDF Guide"
  },
  "Pronunciation Pack": {
    includes: ["Sound guide", "Rhythm drills", "Speaking practice"],
    learningObjectives: ["Hear pronunciation patterns.", "Practice rhythm and connected speech."],
    resourceType: "Teacher Resource"
  }
} as const;

export function sanitizeFileName(fileName: string) {
  const parts = fileName.split(".");
  const extension = parts.length > 1 ? parts.pop()?.toLowerCase() ?? "" : "";
  const base = parts.join(".") || fileName;
  const safeBase = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 90);

  return extension ? `${safeBase || "file"}.${extension}` : safeBase || "file";
}

export function getFileExtension(fileName: string) {
  return fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() ?? "" : "";
}

export function assertUploadAllowed(input: {
  assetType: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}) {
  const extension = getFileExtension(input.fileName);
  if (BLOCKED_EXTENSIONS.includes(extension as (typeof BLOCKED_EXTENSIONS)[number])) {
    return `.${extension} files are not allowed.`;
  }

  if (!ALLOWED_UPLOAD_MIME_TYPES.includes(input.mimeType as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number])) {
    return "This MIME type is not allowed for marketplace uploads.";
  }

  const limitKey = input.assetType === "premium_file" ? "premium_file" : input.assetType;
  const limit = UPLOAD_LIMITS[limitKey as keyof typeof UPLOAD_LIMITS];
  if (!limit) return "Invalid asset type.";
  if (input.sizeBytes > limit) {
    return `File exceeds the maximum size for ${input.assetType}.`;
  }

  return null;
}

export function bucketForAssetType(assetType: string) {
  if (assetType === "premium_file") return "protected-products";
  if (assetType === "cover" || assetType === "preview_image" || assetType === "preview_pdf" || assetType === "gallery_image" || assetType === "og_image") {
    return "product-previews";
  }
  return "product-previews";
}

export function pathForUpload(input: {
  productId: string;
  assetType: string;
  fileName: string;
  version?: number;
}) {
  const safeFileName = sanitizeFileName(input.fileName);
  const stamp = Date.now();

  if (input.assetType === "premium_file") {
    return `${input.productId}/v${input.version ?? 1}/${stamp}-${safeFileName}`;
  }

  if (input.assetType === "cover") {
    return `${input.productId}/cover/${stamp}-${safeFileName}`;
  }

  if (input.assetType === "og_image") {
    return `${input.productId}/og/${stamp}-${safeFileName}`;
  }

  return `${input.productId}/previews/${stamp}-${safeFileName}`;
}

export function buildReadinessChecklist(input: {
  product: Product;
  assets: ProductAsset[];
  files: ProductFile[];
  price?: number | null;
}) {
  const product = input.product;
  const isFree = product.productKind === "free_lead_magnet" || (input.price ?? 0) === 0;
  const cover = input.assets.some((asset) => asset.assetType === "cover");
  const preview = input.assets.some((asset) => asset.assetType === "preview_image" || asset.assetType === "preview_pdf" || asset.assetType === "gallery_image");
  const premiumFile = input.files.some((file) => file.isActive && file.bucket === "protected-products");
  const priceConfigured = isFree || Number(input.price ?? product.compareAtPrice ?? 0) >= 0;

  const items = [
    { key: "basic", label: "Basic information complete", complete: Boolean(product.title && product.slug && product.shortDescription && product.fullDescription) },
    { key: "category", label: "Category selected", complete: Boolean(product.categoryId) },
    { key: "level", label: "Level selected", complete: Boolean(product.level) },
    { key: "price", label: "Price configured", complete: priceConfigured },
    { key: "cover", label: "Cover image uploaded", complete: cover },
    { key: "preview", label: "Preview uploaded", complete: preview },
    { key: "premium", label: "Premium file uploaded", complete: isFree || premiumFile },
    { key: "license", label: "License text added", complete: Boolean(product.licenseText || PRODUCT_LEGAL_NOTICE) },
    { key: "seo", label: "SEO fields added", complete: Boolean(product.seoTitle && product.seoDescription) },
    { key: "protected", label: "Download file stored in protected bucket", complete: isFree || premiumFile },
    { key: "previewChecked", label: "Product page preview checked", complete: true }
  ];

  return {
    complete: items.every((item) => item.complete),
    items
  };
}

export function statusLabel(status?: ProductStatus) {
  if (status === "published") return "published";
  if (status === "archived") return "archived";
  return "draft";
}
