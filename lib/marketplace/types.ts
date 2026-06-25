export type UserRole = "guest" | "student" | "instructor" | "admin" | "super_admin";

export type ProductKind =
  | "digital_download"
  | "live_experience"
  | "bundle"
  | "learning_path"
  | "membership_future"
  | "free_lead_magnet";

export type PriceType =
  | "material_only"
  | "full_experience"
  | "live_class_only_after_material_purchase"
  | "bundle"
  | "free";

export type PurchaseType =
  | "digital_material"
  | "live_experience"
  | "bundle"
  | "subscription_future";

export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "rescheduled"
  | "completed"
  | "no_show"
  | "expired";

export type ProductStatus = "draft" | "published" | "archived";

export type ProductAssetType =
  | "cover"
  | "preview_image"
  | "preview_pdf"
  | "gallery_image"
  | "og_image";

export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string | null;
  isActive: boolean;
};

export type ProductPrice = {
  id: string;
  productId: string;
  priceType: PriceType;
  amount: number;
  currency: string;
  compareAtPrice?: number | null;
  isActive: boolean;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  category: string;
  categorySlug: string;
  subcategory?: string;
  level: string;
  language: string;
  resourceType: string;
  productKind: ProductKind;
  status?: ProductStatus;
  tags: string[];
  coverImage: string;
  previewImages: string[];
  previewFile?: string;
  digitalFileName: string;
  fileType: string;
  fileSize: string;
  pageCount: number;
  fileCount?: number;
  estimatedStudyTime?: string | null;
  whoIsThisFor?: string | null;
  howToUse?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImagePath?: string | null;
  compareAtPrice?: number | null;
  isPublished: boolean;
  isFeatured: boolean;
  licenseText: string;
  includes: string[];
  learningObjectives: string[];
  whoIsFor: string[];
  contents: string[];
  learningPathIds: string[];
  searchAliases: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProductAsset = {
  id: string;
  productId: string;
  assetType: ProductAssetType;
  bucket: string;
  path: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  sortOrder: number;
  isPublicPreview: boolean;
  createdAt: string;
};

export type ProductFile = {
  id: string;
  productId: string;
  bucket: string;
  path: string;
  originalFileName: string;
  displayFileName: string;
  mimeType: string;
  sizeBytes: number;
  checksum?: string | null;
  version: number;
  isActive: boolean;
  availableToPreviousBuyers: boolean;
  uploadedBy?: string | null;
  createdAt: string;
};

export type LiveExperience = {
  id: string;
  productId: string;
  title: string;
  slug: string;
  description: string;
  durationMinutes: number;
  price: number;
  reducedPriceAfterMaterial: number;
  currency: string;
  includesMaterial: boolean;
  includesLiveClass: boolean;
  includesFollowUp: boolean;
  instructorId: string;
  meetingProvider: string;
  isActive: boolean;
};

export type Instructor = {
  id: string;
  name: string;
  email: string;
  bio: string;
  profileImage: string;
  specialties: string[];
  isActive: boolean;
};

export type AvailabilitySlot = {
  id: string;
  instructorId: string;
  startTimeUtc: string;
  endTimeUtc: string;
  timezone: string;
  isAvailable: boolean;
  isBooked: boolean;
};

export type LearningPath = {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  level: string;
  coverImage: string;
  isPublished: boolean;
  items: { productId: string; orderIndex: number; isRequired: boolean }[];
};

export type CartItem = {
  id?: string;
  productId: string;
  experienceId?: string;
  bookingId?: string;
  itemType: "digital_material" | "full_experience" | "live_class_only" | "bundle" | "learning_path";
  quantity: number;
};

export type CheckoutLine = {
  product: Product;
  experience?: LiveExperience;
  booking?: BookingHold;
  itemType: CartItem["itemType"];
  quantity: number;
  unitPrice: number;
  currency: string;
};

export type BookingHold = {
  id: string;
  productId: string;
  experienceId: string;
  instructorId: string;
  status: BookingStatus;
  startTimeUtc: string;
  endTimeUtc: string;
  studentTimezone: string;
  instructorTimezone: string;
  holdExpiresAt: string;
  meetingProvider?: string;
  meetingUrl?: string;
};

export type LibraryItem = {
  accessId: string;
  orderId: string;
  product: Product;
  downloadsUsed: number;
  downloadLimit: number;
  expiresAt?: string | null;
  purchasedAt: string;
};

export type BookingView = {
  id: string;
  product: Product;
  experience: LiveExperience;
  instructor: Instructor;
  status: BookingStatus;
  startTimeUtc: string;
  endTimeUtc: string;
  studentTimezone: string;
  meetingUrl?: string | null;
};
