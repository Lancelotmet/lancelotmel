import { createSupabaseServerClient, hasSupabaseAdminConfig, useMarketplaceDemoMode } from "@/lib/supabase/server";
import {
  demoAvailabilitySlots,
  demoBookings,
  demoCategories,
  demoExperiences,
  demoInstructor,
  demoLearningPaths,
  demoLibrary,
  demoPrices,
  demoProducts
} from "./demo";
import { getMaterialPrice } from "./pricing";
import type {
  AvailabilitySlot,
  BookingHold,
  BookingView,
  CartItem,
  Category,
  CheckoutLine,
  Instructor,
  LibraryItem,
  LearningPath,
  LiveExperience,
  Product,
  ProductPrice
} from "./types";

export type ProductSearchParams = {
  query?: string;
  category?: string;
  level?: string;
  resourceType?: string;
  language?: string;
  priceMax?: number;
  sort?: "popular" | "recent" | "price_asc" | "price_desc";
};

export function usingDemoData() {
  return useMarketplaceDemoMode() || !hasSupabaseAdminConfig();
}

export async function listCategories(): Promise<Category[]> {
  if (usingDemoData()) return demoCategories;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,parent_id,description,is_active")
    .eq("is_active", true)
    .order("name");

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

export async function listProducts(params: ProductSearchParams = {}): Promise<Product[]> {
  if (usingDemoData()) return filterProducts(demoProducts, params);

  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("is_published", true);

  if (params.level) query = query.eq("level", params.level);
  if (params.resourceType) query = query.eq("resource_type", params.resourceType);
  if (params.language) query = query.eq("language", params.language);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error || !data?.length) return filterProducts(demoProducts, params);

  return filterProducts(data.map(mapProductRow), params);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const demo = demoProducts.find((product) => product.slug === slug);
  if (usingDemoData()) return demo ?? null;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return demo ?? null;
  return mapProductRow(data);
}

export async function getProductById(id: string): Promise<Product | null> {
  const demo = demoProducts.find((product) => product.id === id);
  if (usingDemoData()) return demo ?? null;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return demo ?? null;
  return mapProductRow(data);
}

export async function listPrices(): Promise<ProductPrice[]> {
  if (usingDemoData()) return demoPrices;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("product_prices").select("*").eq("is_active", true);
  if (error || !data?.length) return demoPrices;

  return data.map((row) => ({
    id: row.id,
    productId: row.product_id,
    priceType: row.price_type,
    amount: Number(row.amount),
    currency: row.currency,
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : null,
    isActive: row.is_active
  }));
}

export async function listExperiences(productId?: string): Promise<LiveExperience[]> {
  const fallback = productId ? demoExperiences.filter((experience) => experience.productId === productId) : demoExperiences;
  if (usingDemoData()) return fallback;

  const supabase = createSupabaseServerClient();
  let query = supabase.from("live_experiences").select("*").eq("is_active", true);
  if (productId) query = query.eq("product_id", productId);
  const { data, error } = await query;
  if (error || !data?.length) return fallback;

  return data.map((row) => ({
    id: row.id,
    productId: row.product_id,
    title: row.title,
    slug: row.slug ?? `${row.id}`,
    description: row.description,
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
  }));
}

export async function listLearningPaths(productId?: string): Promise<LearningPath[]> {
  if (!productId || usingDemoData()) {
    return productId
      ? demoLearningPaths.filter((path) => path.items.some((item) => item.productId === productId))
      : demoLearningPaths;
  }

  return demoLearningPaths.filter((path) => path.items.some((item) => item.productId === productId));
}

export async function listAvailability(experienceId?: string): Promise<AvailabilitySlot[]> {
  if (usingDemoData()) return demoAvailabilitySlots.filter((slot) => !slot.isBooked);

  const experiences = await listExperiences();
  const experience = experienceId ? experiences.find((item) => item.id === experienceId) : experiences[0];
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("availability_slots")
    .select("*")
    .gte("start_time_utc", new Date().toISOString())
    .eq("is_available", true)
    .eq("is_booked", false)
    .order("start_time_utc", { ascending: true });

  if (experience?.instructorId) query = query.eq("instructor_id", experience.instructorId);
  const { data, error } = await query;
  if (error || !data?.length) return demoAvailabilitySlots.filter((slot) => !slot.isBooked);

  return data.map((row) => ({
    id: row.id,
    instructorId: row.instructor_id,
    startTimeUtc: row.start_time_utc,
    endTimeUtc: row.end_time_utc,
    timezone: row.timezone,
    isAvailable: row.is_available,
    isBooked: row.is_booked
  }));
}

export async function getInstructor(id: string): Promise<Instructor> {
  if (usingDemoData()) return demoInstructor;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("instructors").select("*").eq("id", id).maybeSingle();
  if (error || !data) return demoInstructor;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    bio: data.bio,
    profileImage: data.profile_image,
    specialties: data.specialties ?? [],
    isActive: data.is_active
  };
}

export async function buildCheckoutLines(items: CartItem[]): Promise<CheckoutLine[]> {
  const prices = await listPrices();
  const lines: CheckoutLine[] = [];

  for (const item of items) {
    const product = await getProductById(item.productId);
    if (!product) continue;

    if (item.itemType === "full_experience" || item.itemType === "live_class_only") {
      const experience = (await listExperiences(product.id)).find((candidate) => candidate.id === item.experienceId);
      if (!experience) continue;
      lines.push({
        product,
        experience,
        itemType: item.itemType,
        quantity: item.quantity,
        unitPrice: item.itemType === "live_class_only" ? experience.reducedPriceAfterMaterial : experience.price,
        currency: experience.currency
      });
      continue;
    }

    const price = getMaterialPrice(product.id, prices);
    lines.push({
      product,
      itemType: item.itemType,
      quantity: item.quantity,
      unitPrice: price?.amount ?? 0,
      currency: price?.currency ?? "USD"
    });
  }

  return lines;
}

export async function listLibraryForEmail(email?: string): Promise<LibraryItem[]> {
  if (usingDemoData() || !email) return demoLibrary;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("download_access")
    .select("id, order_id, downloads_used, download_limit, expires_at, created_at, products(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data?.length) return demoLibrary;

  return data.map((row) => ({
    accessId: row.id,
    orderId: row.order_id,
    product: mapProductRow(row.products),
    downloadsUsed: row.downloads_used,
    downloadLimit: row.download_limit,
    expiresAt: row.expires_at,
    purchasedAt: row.created_at
  }));
}

export async function listBookingsForEmail(email?: string): Promise<BookingView[]> {
  if (usingDemoData() || !email) return demoBookings;
  return demoBookings;
}

export async function createDemoBookingHold(input: {
  productId: string;
  experienceId: string;
  slotId: string;
  studentTimezone: string;
}): Promise<BookingHold | null> {
  const slot = demoAvailabilitySlots.find((candidate) => candidate.id === input.slotId && !candidate.isBooked);
  const experience = demoExperiences.find((candidate) => candidate.id === input.experienceId);
  if (!slot || !experience) return null;

  return {
    id: `hold-${Date.now()}`,
    productId: input.productId,
    experienceId: input.experienceId,
    instructorId: experience.instructorId,
    status: "pending_payment",
    startTimeUtc: slot.startTimeUtc,
    endTimeUtc: slot.endTimeUtc,
    studentTimezone: input.studentTimezone,
    instructorTimezone: slot.timezone,
    holdExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    meetingProvider: "manual",
    meetingUrl: "https://meet.google.com/generated-after-payment"
  };
}

function filterProducts(products: Product[], params: ProductSearchParams) {
  let filtered = products.filter((product) => product.isPublished);
  const q = params.query?.trim().toLowerCase();

  if (q) {
    filtered = filtered.filter((product) => {
      const haystack = [
        product.title,
        product.shortDescription,
        product.fullDescription,
        product.category,
        product.subcategory,
        product.level,
        product.resourceType,
        ...product.tags,
        ...product.searchAliases
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q) || q.split(/\s+/).every((part) => haystack.includes(part));
    });
  }

  if (params.category) {
    filtered = filtered.filter((product) => product.categorySlug === params.category || product.subcategory?.toLowerCase().replace(/\s+/g, "-") === params.category);
  }

  if (params.level) filtered = filtered.filter((product) => product.level === params.level);
  if (params.resourceType) filtered = filtered.filter((product) => product.resourceType === params.resourceType);
  if (params.language) filtered = filtered.filter((product) => product.language === params.language);

  if (params.priceMax) {
    filtered = filtered.filter((product) => {
      const price = demoPrices.find((item) => item.productId === product.id && item.priceType === "material_only");
      return (price?.amount ?? 0) <= Number(params.priceMax);
    });
  }

  if (params.sort === "recent") filtered = filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (params.sort === "price_asc") filtered = filtered.sort((a, b) => (getMaterialPrice(a.id)?.amount ?? 0) - (getMaterialPrice(b.id)?.amount ?? 0));
  if (params.sort === "price_desc") filtered = filtered.sort((a, b) => (getMaterialPrice(b.id)?.amount ?? 0) - (getMaterialPrice(a.id)?.amount ?? 0));

  return filtered;
}

function mapProductRow(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description ?? row.shortDescription ?? "",
    fullDescription: row.full_description ?? row.fullDescription ?? "",
    categoryId: row.category_id ?? row.categoryId ?? "",
    category: row.categories?.name ?? row.category ?? "English",
    categorySlug: row.categories?.slug ?? row.category_slug ?? "english",
    subcategory: row.subcategory ?? null,
    level: row.level ?? "General",
    language: row.language ?? "English",
    resourceType: row.resource_type ?? row.resourceType ?? "PDF",
    productKind: row.product_kind ?? row.productKind ?? "digital_download",
    tags: row.tags ?? [],
    coverImage: row.cover_image ?? row.coverImage ?? "cover-default",
    previewImages: row.preview_images ?? row.previewImages ?? [],
    previewFile: row.preview_file ?? row.previewFile,
    digitalFileName: row.digital_file_name ?? row.digitalFileName ?? "protected-file.zip",
    fileType: row.file_type ?? row.fileType ?? "PDF",
    fileSize: row.file_size ?? row.fileSize ?? "0 MB",
    pageCount: row.page_count ?? row.pageCount ?? 0,
    isPublished: row.is_published ?? row.isPublished ?? false,
    isFeatured: row.is_featured ?? row.isFeatured ?? false,
    licenseText: row.license_text ?? row.licenseText ?? "",
    includes: row.includes ?? [],
    learningObjectives: row.learning_objectives ?? row.learningObjectives ?? [],
    whoIsFor: row.who_is_for ?? row.whoIsFor ?? [],
    contents: row.contents ?? [],
    learningPathIds: row.learning_path_ids ?? row.learningPathIds ?? [],
    searchAliases: row.search_aliases ?? row.searchAliases ?? [],
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.updatedAt ?? new Date().toISOString()
  };
}
