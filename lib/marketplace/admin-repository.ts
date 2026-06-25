import { createSupabaseServerClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";
import { demoCategories, demoExperiences, demoInstructor, demoPrices, demoProducts } from "./demo";
import type { AdminContext } from "./security";
import type { Category, Instructor, LiveExperience, Product, ProductAsset, ProductFile, ProductPrice } from "./types";
import type { z } from "zod";
import type { createProductSchema, updateProductSchema } from "./validators";
import { DIGITAL_LICENSE } from "./legal";

export async function listAdminProducts(): Promise<Product[]> {
  if (!hasSupabaseAdminConfig()) return demoProducts.map(withDraftDefaults);

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error || !data?.length) return demoProducts.map(withDraftDefaults);
  return data.map(mapProductRow);
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  const demo = demoProducts.map(withDraftDefaults).find((product) => product.id === id || product.slug === id);
  if (!hasSupabaseAdminConfig()) return demo ?? null;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return demo ?? null;
  return mapProductRow(data);
}

export async function listAdminPrices(): Promise<ProductPrice[]> {
  if (!hasSupabaseAdminConfig()) return demoPrices;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("product_prices").select("*").eq("is_active", true);
  if (error || !data?.length) return demoPrices;
  return data.map(mapPriceRow);
}

export async function listAdminCategories(): Promise<Category[]> {
  if (!hasSupabaseAdminConfig()) return demoCategories;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error || !data?.length) return demoCategories;
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    parentId: row.parent_id,
    description: row.description,
    isActive: row.is_active
  }));
}

export async function listAdminInstructors(): Promise<Instructor[]> {
  if (!hasSupabaseAdminConfig()) return [demoInstructor];

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("instructors").select("*").eq("is_active", true).order("name");
  if (error || !data?.length) return [demoInstructor];
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    bio: row.bio ?? "",
    profileImage: row.profile_image ?? "",
    specialties: row.specialties ?? [],
    isActive: row.is_active
  }));
}

export async function listProductAssets(productId: string): Promise<ProductAsset[]> {
  if (!hasSupabaseAdminConfig()) return demoAssets(productId);

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("product_assets")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order");
  if (error) return [];
  return (data ?? []).map(mapAssetRow);
}

export async function listProductFiles(productId: string): Promise<ProductFile[]> {
  if (!hasSupabaseAdminConfig()) return demoFiles(productId);

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("product_files")
    .select("*")
    .eq("product_id", productId)
    .order("version", { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapFileRow);
}

export async function listAdminExperiences(productId?: string): Promise<LiveExperience[]> {
  const fallback = productId ? demoExperiences.filter((item) => item.productId === productId) : demoExperiences;
  if (!hasSupabaseAdminConfig()) return fallback;

  const supabase = createSupabaseServerClient();
  let query = supabase.from("live_experiences").select("*").order("updated_at", { ascending: false });
  if (productId) query = query.eq("product_id", productId);
  const { data, error } = await query;
  if (error || !data?.length) return fallback;
  return data.map(mapExperienceRow);
}

export async function createAdminProduct(input: z.infer<typeof createProductSchema>, admin: AdminContext | null) {
  if (!hasSupabaseAdminConfig()) {
    return { id: `demo-product-${Date.now()}`, ...input };
  }

  const supabase = createSupabaseServerClient();
  const productPayload = buildProductPayload(input, admin);
  const { data: product, error } = await supabase
    .from("products")
    .insert(productPayload)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  await upsertMaterialPrice(product.id, input.pricing);
  await upsertLiveExperience(product.id, input.liveExperience);
  await insertAudit("product_created", "product", product.id, admin, { title: product.title });
  return product;
}

export async function updateAdminProduct(input: z.infer<typeof updateProductSchema>, admin: AdminContext | null) {
  if (!hasSupabaseAdminConfig()) {
    return { ...input };
  }

  const supabase = createSupabaseServerClient();
  const productPayload = buildProductPayload(input, admin);
  const { data: product, error } = await supabase
    .from("products")
    .update(productPayload)
    .eq("id", input.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  if (input.pricing) await upsertMaterialPrice(input.id, input.pricing);
  if (input.liveExperience) await upsertLiveExperience(input.id, input.liveExperience);
  await insertAudit("product_updated", "product", input.id, admin, { title: product.title });
  return product;
}

export async function publishAdminProduct(productId: string, admin: AdminContext | null) {
  if (!hasSupabaseAdminConfig()) return { id: productId, status: "published" };

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .update({
      archived_at: null,
      is_published: true,
      published_at: new Date().toISOString(),
      status: "published",
      updated_at: new Date().toISOString(),
      updated_by: admin?.userId ?? null
    })
    .eq("id", productId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  await insertAudit("product_published", "product", productId, admin, { title: data.title });
  return data;
}

export async function archiveAdminProduct(productId: string, admin: AdminContext | null) {
  if (!hasSupabaseAdminConfig()) return { id: productId, status: "archived" };

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .update({
      archived_at: new Date().toISOString(),
      is_published: false,
      status: "archived",
      updated_at: new Date().toISOString(),
      updated_by: admin?.userId ?? null
    })
    .eq("id", productId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  await insertAudit("product_archived", "product", productId, admin, { title: data.title });
  return data;
}

export async function duplicateAdminProduct(productId: string, admin: AdminContext | null) {
  const product = await getAdminProduct(productId);
  if (!product) throw new Error("Product not found.");
  const slug = `${product.slug}-copy-${Date.now()}`;

  if (!hasSupabaseAdminConfig()) {
    return { ...product, id: `demo-copy-${Date.now()}`, slug, title: `${product.title} Copy`, status: "draft" };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      category_id: product.categoryId,
      contents: product.contents,
      full_description: product.fullDescription,
      how_to_use: product.howToUse,
      includes: product.includes,
      is_featured: false,
      is_published: false,
      language: product.language,
      learning_objectives: product.learningObjectives,
      level: product.level,
      license_text: product.licenseText,
      product_kind: product.productKind,
      resource_type: product.resourceType,
      seo_description: product.seoDescription,
      seo_title: product.seoTitle,
      short_description: product.shortDescription,
      slug,
      status: "draft",
      tags: product.tags,
      title: `${product.title} Copy`,
      who_is_for: product.whoIsFor,
      who_is_this_for: product.whoIsThisFor
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  await insertAudit("product_created", "product", data.id, admin, { duplicatedFrom: productId });
  return data;
}

export async function insertAudit(action: string, entityType: string, entityId: string, admin: AdminContext | null, metadata: Record<string, unknown> = {}) {
  if (!hasSupabaseAdminConfig()) return;
  const supabase = createSupabaseServerClient();
  await supabase.from("audit_logs").insert({
    action,
    actor_user_id: admin?.userId ?? null,
    entity_id: entityId,
    entity_type: entityType,
    metadata
  });
}

function buildProductPayload(input: Partial<z.infer<typeof createProductSchema>>, admin: AdminContext | null) {
  const pricing = input.pricing;
  const isPublished = input.status === "published";
  return {
    category_id: input.categoryId,
    compare_at_price: pricing?.compareAtPrice ?? null,
    contents: input.recommendedPreviousKnowledge ? [input.recommendedPreviousKnowledge] : undefined,
    currency: pricing?.currency,
    estimated_study_time: input.estimatedStudyTime,
    file_count: input.fileCount,
    full_description: input.fullDescription,
    how_to_use: input.howToUse,
    includes: input.includes,
    is_featured: input.isFeatured,
    is_published: isPublished,
    language: input.language,
    learning_objectives: input.learningObjectives,
    level: input.level,
    license_text: input.licenseText || DIGITAL_LICENSE,
    og_image_path: input.seo?.ogImagePath,
    page_count: input.pageCount,
    price: pricing?.isFreeResource ? 0 : pricing?.price,
    product_kind: input.pricing?.isFreeResource ? "free_lead_magnet" : input.productKind,
    published_at: isPublished ? new Date().toISOString() : undefined,
    resource_type: input.resourceType,
    seo_description: input.seo?.seoDescription,
    seo_title: input.seo?.seoTitle,
    short_description: input.shortDescription,
    slug: input.slug,
    status: input.status ?? "draft",
    tags: input.tags,
    title: input.title,
    updated_at: new Date().toISOString(),
    updated_by: admin?.userId ?? null,
    who_is_for: input.whoIsFor,
    who_is_this_for: input.whoIsThisFor
  };
}

async function upsertMaterialPrice(productId: string, pricing: z.infer<typeof createProductSchema>["pricing"]) {
  const supabase = createSupabaseServerClient();
  await supabase
    .from("product_prices")
    .update({ is_active: false })
    .eq("product_id", productId)
    .eq("price_type", "material_only");

  await supabase.from("product_prices").insert({
    amount: pricing.isFreeResource ? 0 : pricing.price,
    compare_at_price: pricing.compareAtPrice ?? null,
    currency: pricing.currency,
    is_active: true,
    price_type: pricing.isFreeResource ? "free" : "material_only",
    product_id: productId
  });
}

async function upsertLiveExperience(productId: string, liveExperience?: z.infer<typeof createProductSchema>["liveExperience"]) {
  if (!liveExperience) return;
  const supabase = createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("live_experiences")
    .select("id")
    .eq("product_id", productId)
    .maybeSingle();

  const payload = {
    currency: "USD",
    description: liveExperience.description,
    duration_minutes: liveExperience.durationMinutes,
    includes_follow_up: liveExperience.includesFollowUp,
    includes_live_class: liveExperience.includesLiveClass,
    includes_material: liveExperience.includesMaterial,
    instructor_id: liveExperience.instructorId || null,
    is_active: liveExperience.enabled && liveExperience.isActive,
    meeting_provider: liveExperience.meetingProvider,
    price: liveExperience.price,
    product_id: productId,
    reduced_price_after_material: Math.max(liveExperience.price - 10, 0),
    title: liveExperience.title,
    updated_at: new Date().toISOString()
  };

  if (existing?.id) {
    await supabase.from("live_experiences").update(payload).eq("id", existing.id);
  } else if (liveExperience.enabled) {
    await supabase.from("live_experiences").insert(payload);
  }
}

function withDraftDefaults(product: Product): Product {
  return {
    ...product,
    status: product.status ?? (product.isPublished ? "published" : "draft"),
    seoTitle: product.seoTitle ?? `${product.title} | LANCELOT`,
    seoDescription: product.seoDescription ?? product.shortDescription,
    whoIsThisFor: product.whoIsThisFor ?? product.whoIsFor.join("\n"),
    howToUse: product.howToUse ?? product.fullDescription
  };
}

function demoAssets(productId: string): ProductAsset[] {
  return [
    {
      id: `asset-cover-${productId}`,
      productId,
      assetType: "cover",
      bucket: "product-previews",
      path: `${productId}/cover/demo-cover.webp`,
      originalFileName: "demo-cover.webp",
      mimeType: "image/webp",
      sizeBytes: 120000,
      sortOrder: 0,
      isPublicPreview: true,
      createdAt: new Date().toISOString()
    },
    {
      id: `asset-preview-${productId}`,
      productId,
      assetType: "preview_image",
      bucket: "product-previews",
      path: `${productId}/previews/demo-preview.webp`,
      originalFileName: "demo-preview.webp",
      mimeType: "image/webp",
      sizeBytes: 160000,
      sortOrder: 1,
      isPublicPreview: true,
      createdAt: new Date().toISOString()
    }
  ];
}

function demoFiles(productId: string): ProductFile[] {
  return [
    {
      id: `file-${productId}`,
      productId,
      bucket: "protected-products",
      path: `${productId}/v1/demo-premium-file.zip`,
      originalFileName: "demo-premium-file.zip",
      displayFileName: "LANCELOT premium package.zip",
      mimeType: "application/zip",
      sizeBytes: 42000000,
      version: 1,
      isActive: true,
      availableToPreviousBuyers: true,
      uploadedBy: null,
      createdAt: new Date().toISOString()
    }
  ];
}

function mapProductRow(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description ?? "",
    fullDescription: row.full_description ?? "",
    categoryId: row.category_id ?? "",
    category: row.categories?.name ?? "English",
    categorySlug: row.categories?.slug ?? "english",
    subcategory: row.subcategory ?? "",
    level: row.level ?? "General",
    language: row.language ?? "English",
    resourceType: row.resource_type ?? "PDF Guide",
    productKind: row.product_kind ?? "digital_download",
    status: row.status ?? (row.is_published ? "published" : "draft"),
    tags: row.tags ?? [],
    coverImage: row.cover_image ?? "cover-default",
    previewImages: row.preview_images ?? [],
    previewFile: row.preview_file,
    digitalFileName: row.digital_file_name ?? "protected-file.zip",
    fileType: row.file_type ?? "PDF",
    fileSize: row.file_size ?? "0 MB",
    pageCount: row.page_count ?? 0,
    fileCount: row.file_count ?? 0,
    estimatedStudyTime: row.estimated_study_time,
    isPublished: row.is_published ?? false,
    isFeatured: row.is_featured ?? false,
    licenseText: row.license_text ?? DIGITAL_LICENSE,
    includes: row.includes ?? [],
    learningObjectives: row.learning_objectives ?? [],
    whoIsFor: row.who_is_for ?? [],
    whoIsThisFor: row.who_is_this_for,
    howToUse: row.how_to_use,
    contents: row.contents ?? [],
    learningPathIds: row.learning_path_ids ?? [],
    searchAliases: row.search_aliases ?? [],
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    ogImagePath: row.og_image_path,
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : null,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString()
  };
}

function mapPriceRow(row: any): ProductPrice {
  return {
    id: row.id,
    productId: row.product_id,
    priceType: row.price_type,
    amount: Number(row.amount),
    currency: row.currency,
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : null,
    isActive: row.is_active
  };
}

function mapExperienceRow(row: any): LiveExperience {
  return {
    id: row.id,
    productId: row.product_id,
    title: row.title,
    slug: row.slug ?? row.id,
    description: row.description ?? "",
    durationMinutes: row.duration_minutes,
    price: Number(row.price),
    reducedPriceAfterMaterial: Number(row.reduced_price_after_material ?? row.price),
    currency: row.currency,
    includesMaterial: row.includes_material,
    includesLiveClass: row.includes_live_class,
    includesFollowUp: row.includes_follow_up,
    instructorId: row.instructor_id,
    meetingProvider: row.meeting_provider ?? "manual",
    isActive: row.is_active
  };
}

function mapAssetRow(row: any): ProductAsset {
  return {
    id: row.id,
    productId: row.product_id,
    assetType: row.asset_type,
    bucket: row.bucket,
    path: row.path,
    originalFileName: row.original_file_name ?? row.path.split("/").at(-1) ?? "file",
    mimeType: row.mime_type ?? "",
    sizeBytes: Number(row.size_bytes ?? 0),
    sortOrder: row.sort_order ?? 0,
    isPublicPreview: row.is_public_preview,
    createdAt: row.created_at
  };
}

function mapFileRow(row: any): ProductFile {
  return {
    id: row.id,
    productId: row.product_id,
    bucket: row.bucket,
    path: row.path,
    originalFileName: row.original_file_name ?? row.file_name ?? row.path.split("/").at(-1) ?? "file",
    displayFileName: row.display_file_name ?? row.file_name ?? row.path.split("/").at(-1) ?? "file",
    mimeType: row.mime_type ?? row.file_type ?? "",
    sizeBytes: Number(row.size_bytes ?? row.file_size ?? 0),
    checksum: row.checksum,
    version: row.version,
    isActive: row.is_active,
    availableToPreviousBuyers: row.available_to_previous_buyers,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at
  };
}
