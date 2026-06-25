import { DIGITAL_LICENSE } from "./legal";
import type {
  AvailabilitySlot,
  BookingView,
  Category,
  Instructor,
  LearningPath,
  LibraryItem,
  LiveExperience,
  Product,
  ProductPrice
} from "./types";

const now = new Date("2026-06-25T12:00:00.000Z").toISOString();

export const demoCategories: Category[] = [
  { id: "cat-english", name: "English", slug: "english", isActive: true, description: "Grammar, pronunciation, speaking, writing and complete class packs." },
  { id: "cat-grammar", name: "Grammar", slug: "grammar", parentId: "cat-english", isActive: true, description: "Visual grammar systems for understanding and practice." },
  { id: "cat-pronunciation", name: "Pronunciation", slug: "pronunciation", parentId: "cat-english", isActive: true, description: "Sound, rhythm and articulation resources." },
  { id: "cat-mindsets", name: "Learning Mindsets", slug: "learning-mindsets", isActive: true, description: "Mindset and neuroeducation resources for better learning." },
  { id: "cat-math", name: "Mathematics", slug: "mathematics", isActive: true, description: "Future math resources." },
  { id: "cat-programming", name: "Programming", slug: "programming", isActive: true, description: "Future coding resources." }
];

export const demoProducts: Product[] = [
  {
    id: "prod-past-perfect-b1",
    title: "Past Perfect B1 - Complete Class Pack",
    slug: "past-perfect-b1-complete-class-pack",
    shortDescription: "A premium complete class pack to teach Past Perfect with timelines, guided practice and speaking tasks.",
    fullDescription:
      "This LANCELOT class pack turns Past Perfect from a memorized rule into a visual, usable thinking tool. It includes a teacher-ready lesson guide, visual explanations, controlled practice, communicative tasks and a mini assessment designed for B1 learners.",
    categoryId: "cat-english",
    category: "English",
    categorySlug: "english",
    subcategory: "Grammar",
    level: "B1",
    language: "English",
    resourceType: "Complete Class Pack",
    productKind: "digital_download",
    tags: ["past perfect", "had eaten", "pasado perfecto", "grammar", "b1", "timelines"],
    coverImage: "cover-past-perfect",
    previewImages: ["preview-past-perfect-1", "preview-past-perfect-2", "preview-past-perfect-3"],
    previewFile: "past-perfect-b1-preview.pdf",
    digitalFileName: "lancelot-past-perfect-b1-complete-class-pack.zip",
    fileType: "PDF + PNG + DOCX + ZIP",
    fileSize: "42 MB",
    pageCount: 34,
    isPublished: true,
    isFeatured: true,
    licenseText: DIGITAL_LICENSE,
    includes: ["Lesson guide", "10 premium infographics", "Practice worksheet", "Answer key", "Speaking activity", "Mini assessment"],
    learningObjectives: [
      "Understand Past Perfect through sequence and timeline logic.",
      "Use Past Perfect to explain events that happened before another past action.",
      "Compare Past Perfect with Past Simple in meaningful contexts."
    ],
    whoIsFor: ["B1 English learners", "Private tutors", "Schools building grammar workshops", "Self-study students who need structure"],
    contents: ["Teacher lesson flow", "Student worksheet", "Visual grammar guide", "Error correction prompts", "Mini assessment rubric"],
    learningPathIds: ["path-b1-grammar"],
    searchAliases: ["had eaten", "pasado perfecto", "past perfect timeline", "before another past action"],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prod-present-perfect-vs-past-simple",
    title: "Present Perfect vs Past Simple - B1 Visual Guide",
    slug: "present-perfect-vs-past-simple-b1-visual-guide",
    shortDescription: "A visual guide that helps B1 learners choose between life experience, result and finished time.",
    fullDescription:
      "A concise visual pack for the most common B1 grammar contrast. Designed for fast explanation, review lessons, homework support and classroom wall references.",
    categoryId: "cat-english",
    category: "English",
    categorySlug: "english",
    subcategory: "Grammar",
    level: "B1",
    language: "English",
    resourceType: "Infographic Pack",
    productKind: "digital_download",
    tags: ["present perfect", "past simple", "grammar", "b1", "visual guide"],
    coverImage: "cover-present-perfect",
    previewImages: ["preview-present-perfect-1", "preview-present-perfect-2"],
    previewFile: "present-perfect-vs-past-simple-preview.pdf",
    digitalFileName: "lancelot-present-perfect-vs-past-simple-b1.zip",
    fileType: "PDF + PNG",
    fileSize: "18 MB",
    pageCount: 16,
    isPublished: true,
    isFeatured: true,
    licenseText: DIGITAL_LICENSE,
    includes: ["Comparison map", "6 infographics", "Practice worksheet", "Answer key"],
    learningObjectives: ["Separate finished time from life experience.", "Recognize result-focused sentences.", "Avoid common B1 tense mistakes."],
    whoIsFor: ["B1 learners", "Teachers needing a clean tense contrast", "Visual learners"],
    contents: ["Visual tense comparison", "Signal words", "Practice set", "Answer key"],
    learningPathIds: ["path-b1-grammar"],
    searchAliases: ["have been", "ever never", "finished time", "present perfect past simple"],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prod-english-is-music",
    title: "English Is Music - Pronunciation Starter Pack",
    slug: "english-is-music-pronunciation-starter-pack",
    shortDescription: "A pronunciation starter pack built around rhythm, stress, linking and sound awareness.",
    fullDescription:
      "English is not only grammar. It is rhythm, stress, sound and movement. This starter pack introduces learners to the musical side of English with guided exercises and classroom-ready visuals.",
    categoryId: "cat-pronunciation",
    category: "English",
    categorySlug: "english",
    subcategory: "Pronunciation",
    level: "A2-B1",
    language: "English",
    resourceType: "Lesson Pack",
    productKind: "digital_download",
    tags: ["pronunciation", "rhythm", "stress", "linking", "a2", "b1"],
    coverImage: "cover-english-music",
    previewImages: ["preview-music-1", "preview-music-2"],
    previewFile: "english-is-music-preview.pdf",
    digitalFileName: "lancelot-english-is-music-starter-pack.zip",
    fileType: "PDF + Audio prompts future + PNG",
    fileSize: "26 MB",
    pageCount: 24,
    isPublished: true,
    isFeatured: false,
    licenseText: DIGITAL_LICENSE,
    includes: ["Lesson guide", "Pronunciation maps", "Rhythm drills", "Speaking practice", "Reflection sheet"],
    learningObjectives: ["Hear stress patterns.", "Practice connected speech.", "Improve confidence in spoken English."],
    whoIsFor: ["A2-B1 learners", "Pronunciation workshops", "Teachers building speaking fluency"],
    contents: ["Stress guide", "Linking exercises", "Rhythm practice", "Class flow"],
    learningPathIds: ["path-english-is-music"],
    searchAliases: ["english rhythm", "word stress", "connected speech", "pronunciation starter"],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prod-growth-mindset",
    title: "Growth Mindset for English Learners",
    slug: "growth-mindset-for-english-learners",
    shortDescription: "A reflective PDF guide to help learners turn mistakes, fear and repetition into progress.",
    fullDescription:
      "A mindset and neuroeducation guide for English learners who need a better relationship with errors, feedback and practice. Built as a premium lead-in to LANCELOT learning routes.",
    categoryId: "cat-mindsets",
    category: "Learning Mindsets",
    categorySlug: "learning-mindsets",
    subcategory: "Mindset for Learning",
    level: "General",
    language: "English",
    resourceType: "PDF Guide",
    productKind: "digital_download",
    tags: ["mindset", "learning", "english learners", "motivation", "neuroeducation"],
    coverImage: "cover-growth-mindset",
    previewImages: ["preview-mindset-1", "preview-mindset-2"],
    previewFile: "growth-mindset-preview.pdf",
    digitalFileName: "lancelot-growth-mindset-for-english-learners.pdf",
    fileType: "PDF",
    fileSize: "12 MB",
    pageCount: 20,
    isPublished: true,
    isFeatured: false,
    licenseText: DIGITAL_LICENSE,
    includes: ["PDF guide", "Reflection prompts", "Practice plan", "Teacher discussion prompts"],
    learningObjectives: ["Reframe mistakes as data.", "Build a sustainable study routine.", "Connect effort with feedback."],
    whoIsFor: ["Self-study learners", "Teachers", "Learning coaches"],
    contents: ["Mindset guide", "Reflection pages", "Action plan"],
    learningPathIds: ["path-mindsets"],
    searchAliases: ["growth mindset", "fear of mistakes", "learn better", "neuroeducation"],
    createdAt: now,
    updatedAt: now
  }
];

export const demoPrices: ProductPrice[] = [
  { id: "price-past-material", productId: "prod-past-perfect-b1", priceType: "material_only", amount: 12, currency: "USD", compareAtPrice: 18, isActive: true },
  { id: "price-past-full", productId: "prod-past-perfect-b1", priceType: "full_experience", amount: 49, currency: "USD", compareAtPrice: 68, isActive: true },
  { id: "price-past-live-only", productId: "prod-past-perfect-b1", priceType: "live_class_only_after_material_purchase", amount: 39, currency: "USD", isActive: true },
  { id: "price-present-material", productId: "prod-present-perfect-vs-past-simple", priceType: "material_only", amount: 8, currency: "USD", compareAtPrice: 12, isActive: true },
  { id: "price-present-full", productId: "prod-present-perfect-vs-past-simple", priceType: "full_experience", amount: 45, currency: "USD", isActive: true },
  { id: "price-music-material", productId: "prod-english-is-music", priceType: "material_only", amount: 10, currency: "USD", isActive: true },
  { id: "price-music-full", productId: "prod-english-is-music", priceType: "full_experience", amount: 50, currency: "USD", isActive: true },
  { id: "price-mindset-material", productId: "prod-growth-mindset", priceType: "material_only", amount: 7, currency: "USD", isActive: true },
  { id: "price-mindset-full", productId: "prod-growth-mindset", priceType: "full_experience", amount: 37, currency: "USD", isActive: true }
];

export const demoInstructor: Instructor = {
  id: "inst-sandra",
  name: "LANCELOT Instructor",
  email: "consulta@lancelotmet.com",
  bio: "Senior academic mentor specialized in English learning, mindset and guided practice.",
  profileImage: "instructor-lancelot",
  specialties: ["English grammar", "Pronunciation", "Learning strategy", "Mindset"],
  isActive: true
};

export const demoExperiences: LiveExperience[] = demoProducts.map((product) => {
  const fullPrice = demoPrices.find((price) => price.productId === product.id && price.priceType === "full_experience")?.amount ?? 49;
  const reducedPrice = demoPrices.find((price) => price.productId === product.id && price.priceType === "live_class_only_after_material_purchase")?.amount ?? Math.max(fullPrice - 10, 25);

  return {
    id: `exp-${product.id.replace("prod-", "")}`,
    productId: product.id,
    title: `${product.title} - Full LANCELOT Experience`,
    slug: `${product.slug}-live-experience`,
    description: `Learn ${product.title.replace(" - Complete Class Pack", "")} with a live guided LANCELOT session, personalized correction and post-class recommendations.`,
    durationMinutes: 60,
    price: fullPrice,
    reducedPriceAfterMaterial: reducedPrice,
    currency: "USD",
    includesMaterial: true,
    includesLiveClass: true,
    includesFollowUp: true,
    instructorId: demoInstructor.id,
    meetingProvider: "manual",
    isActive: true
  };
});

export const demoLearningPaths: LearningPath[] = [
  {
    id: "path-b1-grammar",
    title: "B1 Grammar Mastery",
    slug: "b1-grammar-mastery",
    description: "A structured route for B1 learners who need grammar they can actually use.",
    categoryId: "cat-english",
    level: "B1",
    coverImage: "path-b1-grammar",
    isPublished: true,
    items: [
      { productId: "prod-present-perfect-vs-past-simple", orderIndex: 1, isRequired: true },
      { productId: "prod-past-perfect-b1", orderIndex: 2, isRequired: true }
    ]
  },
  {
    id: "path-english-is-music",
    title: "English Is Music",
    slug: "english-is-music",
    description: "Pronunciation foundations through rhythm, stress and connected speech.",
    categoryId: "cat-pronunciation",
    level: "A2-B1",
    coverImage: "path-english-is-music",
    isPublished: true,
    items: [{ productId: "prod-english-is-music", orderIndex: 1, isRequired: true }]
  },
  {
    id: "path-mindsets",
    title: "Mindsets for Better Learning",
    slug: "mindsets-for-better-learning",
    description: "Tools for confidence, consistency and smarter learning.",
    categoryId: "cat-mindsets",
    level: "General",
    coverImage: "path-mindsets",
    isPublished: true,
    items: [{ productId: "prod-growth-mindset", orderIndex: 1, isRequired: true }]
  }
];

export const demoAvailabilitySlots: AvailabilitySlot[] = Array.from({ length: 9 }).map((_, index) => {
  const start = new Date(Date.UTC(2026, 5, 26 + Math.floor(index / 3), 14 + (index % 3) * 2, 0, 0));
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    id: `slot-${index + 1}`,
    instructorId: demoInstructor.id,
    startTimeUtc: start.toISOString(),
    endTimeUtc: end.toISOString(),
    timezone: "America/Bogota",
    isAvailable: true,
    isBooked: index === 4
  };
});

export const demoLibrary: LibraryItem[] = [
  {
    accessId: "access-demo-past",
    orderId: "order-demo-paid",
    product: demoProducts[0],
    downloadsUsed: 1,
    downloadLimit: 5,
    expiresAt: "2026-12-31T23:59:59.000Z",
    purchasedAt: "2026-06-24T15:30:00.000Z"
  }
];

export const demoBookings: BookingView[] = [
  {
    id: "booking-demo-1",
    product: demoProducts[0],
    experience: demoExperiences[0],
    instructor: demoInstructor,
    status: "confirmed",
    startTimeUtc: "2026-06-28T15:00:00.000Z",
    endTimeUtc: "2026-06-28T16:00:00.000Z",
    studentTimezone: "America/Bogota",
    meetingUrl: "https://meet.google.com/lancelot-demo"
  }
];
