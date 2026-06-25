import { z } from "zod";
import { ALLOWED_UPLOAD_MIME_TYPES, CURRENCIES, LEVELS, RESOURCE_TYPES } from "./admin-products";

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  experienceId: z.string().optional(),
  bookingId: z.string().optional(),
  itemType: z.enum(["digital_material", "full_experience", "live_class_only", "bundle", "learning_path"]),
  quantity: z.coerce.number().int().min(1).max(20).default(1)
});

export const createCheckoutSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(120).optional(),
  items: z.array(checkoutItemSchema).min(1),
  couponCode: z.string().max(80).optional(),
  licenseAccepted: z.literal(true),
  paymentProvider: z.enum(["demo", "stripe", "mercado_pago_future", "wompi_future"]).default("demo"),
  studentTimezone: z.string().max(80).default("America/Bogota")
});

export const bookingHoldSchema = z.object({
  productId: z.string().min(1),
  experienceId: z.string().min(1),
  slotId: z.string().min(1),
  email: z.string().email(),
  studentTimezone: z.string().max(80).default("America/Bogota"),
  studentNotes: z.string().max(1000).optional()
});

export const downloadRequestSchema = z.object({
  productId: z.string().min(1),
  orderId: z.string().optional(),
  fileId: z.string().optional()
});

export const eventSchema = z.object({
  userId: z.string().optional(),
  anonymousId: z.string().max(160).optional(),
  eventType: z.enum([
    "product_viewed",
    "preview_opened",
    "added_to_cart",
    "checkout_started",
    "purchase_completed",
    "download_requested",
    "booking_started",
    "booking_completed",
    "free_resource_downloaded"
  ]),
  productId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export const adminProductSchema = z.object({
  title: z.string().min(4).max(180),
  slug: z.string().min(4).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDescription: z.string().min(20).max(260),
  fullDescription: z.string().min(40).max(5000),
  categoryId: z.string().min(1),
  level: z.string().min(1).max(40),
  language: z.string().min(2).max(40).default("en"),
  resourceType: z.string().min(2).max(80),
  productKind: z.enum(["digital_download", "live_experience", "bundle", "learning_path", "membership_future", "free_lead_magnet"]),
  tags: z.array(z.string().max(50)).default([]),
  price: z.coerce.number().min(0).max(10000),
  currency: z.string().length(3).default("USD"),
  isPublished: z.coerce.boolean().default(false),
  isFeatured: z.coerce.boolean().default(false)
});

const commaList = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
    return value.split("\n").flatMap((line) => line.split(",")).map((item) => item.trim()).filter(Boolean);
  });

export const seoSchema = z.object({
  seoTitle: z.string().max(180).optional().default(""),
  seoDescription: z.string().max(320).optional().default(""),
  ogImagePath: z.string().max(500).optional().default("")
});

export const pricingSchema = z.object({
  price: z.coerce.number().min(0).max(100000),
  currency: z.enum(CURRENCIES).default("USD"),
  compareAtPrice: z.coerce.number().min(0).max(100000).optional().nullable(),
  isFreeResource: z.coerce.boolean().default(false),
  allowCoupons: z.coerce.boolean().default(true)
}).superRefine((value, ctx) => {
  if (!value.isFreeResource && value.price <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Paid products require a price greater than 0.", path: ["price"] });
  }
});

export const liveExperienceSchema = z.object({
  enabled: z.coerce.boolean().default(false),
  title: z.string().max(180).optional().default(""),
  description: z.string().max(1500).optional().default(""),
  durationMinutes: z.coerce.number().int().min(15).max(300).default(60),
  price: z.coerce.number().min(0).max(100000).default(0),
  instructorId: z.string().optional().default(""),
  includesMaterial: z.coerce.boolean().default(true),
  includesLiveClass: z.coerce.boolean().default(true),
  includesFollowUp: z.coerce.boolean().default(false),
  meetingProvider: z.string().max(80).default("manual"),
  isActive: z.coerce.boolean().default(true)
}).superRefine((value, ctx) => {
  if (value.enabled && value.price <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Full experience price must be greater than 0.", path: ["price"] });
  }
});

export const createProductSchema = z.object({
  title: z.string().min(4).max(180),
  slug: z.string().min(4).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDescription: z.string().min(20).max(300),
  fullDescription: z.string().min(40).max(8000),
  categoryId: z.string().min(1),
  subcategory: z.string().max(120).optional().default(""),
  level: z.enum(LEVELS).or(z.string().min(1).max(40)),
  language: z.string().min(2).max(40).default("English"),
  resourceType: z.enum(RESOURCE_TYPES).or(z.string().min(2).max(80)),
  productKind: z.enum(["digital_download", "live_experience", "bundle", "learning_path", "membership_future", "free_lead_magnet"]).default("digital_download"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  tags: commaList,
  learningObjectives: commaList,
  includes: commaList,
  whoIsThisFor: z.string().max(2000).optional().default(""),
  whoIsFor: commaList,
  howToUse: z.string().max(3000).optional().default(""),
  estimatedStudyTime: z.string().max(80).optional().default(""),
  pageCount: z.coerce.number().int().min(0).max(10000).default(0),
  fileCount: z.coerce.number().int().min(0).max(1000).default(0),
  requiredLevel: z.string().max(80).optional().default(""),
  recommendedPreviousKnowledge: z.string().max(1000).optional().default(""),
  licenseText: z.string().min(40).max(4000),
  isFeatured: z.coerce.boolean().default(false),
  pricing: pricingSchema,
  seo: seoSchema,
  liveExperience: liveExperienceSchema.optional()
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().min(1)
});

export const uploadFileSchema = z.object({
  productId: z.string().min(1),
  assetType: z.enum(["cover", "preview_image", "preview_pdf", "gallery_image", "og_image", "premium_file"]),
  fileName: z.string().min(1).max(240),
  mimeType: z.enum(ALLOWED_UPLOAD_MIME_TYPES),
  sizeBytes: z.coerce.number().int().min(1),
  version: z.coerce.number().int().min(1).max(999).optional()
});

export const registerFileSchema = uploadFileSchema.extend({
  bucket: z.enum(["public-assets", "product-previews", "protected-products"]),
  path: z.string().min(4).max(700),
  originalFileName: z.string().min(1).max(240),
  displayFileName: z.string().max(240).optional(),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isPublicPreview: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  availableToPreviousBuyers: z.coerce.boolean().default(true)
});

export const publishProductSchema = z.object({
  licenseConfirmed: z.literal(true),
  previewChecked: z.literal(true)
});

export const supportTicketSchema = z.object({
  email: z.string().email(),
  orderId: z.string().optional(),
  productId: z.string().optional(),
  bookingId: z.string().optional(),
  subject: z.string().min(4).max(160),
  message: z.string().min(10).max(3000)
});
