export const DIGITAL_LICENSE =
  "By purchasing this digital material, you receive a limited, non-exclusive, non-transferable license for personal, educational, or internal classroom use. You may not resell, redistribute, reproduce, upload, share publicly, modify for resale, or include this material in another commercial product without written authorization from LANCELOT.";

export const PRODUCT_LEGAL_NOTICE =
  "This material is for personal and educational use only. It may not be resold, redistributed, copied, modified for resale, uploaded to other platforms, or used as part of another commercial product without written permission from LANCELOT.";

export const CHECKOUT_LICENSE_ACK =
  "I understand and accept that this is a digital product and that the material may not be resold, redistributed, copied, uploaded, or shared publicly.";

export const LIVE_CLASS_POLICY =
  "Live LANCELOT sessions are personal and non-transferable. Meeting links may not be shared with third parties. Recording is only permitted with written authorization from LANCELOT. Rescheduling must be requested within the minimum notice period defined by LANCELOT; missed sessions may be marked as no-show.";

export const legalPages = {
  "terms-of-use": {
    title: "Terms of Use",
    body: [
      "LANCELOT Academic Marketplace provides digital academic materials and live educational experiences for personal, educational, and internal classroom use.",
      "Users must not attempt to bypass checkout, download controls, booking controls, or access permissions. All purchases, bookings, downloads, coupons, and account access are validated by backend services and Supabase security rules.",
      "LANCELOT may update products, learning paths, prices, availability, refund conditions, and booking policies as the platform evolves."
    ]
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "LANCELOT collects the information required to create accounts, process purchases, deliver downloads, manage bookings, send transactional emails, and provide support.",
      "Download events, booking events, and marketplace events may be recorded for security, analytics, support, and product improvement.",
      "Production deployments should configure Supabase, payment, email, and storage providers with least-privilege credentials and proper data retention rules."
    ]
  },
  license: {
    title: "Digital Product License",
    body: [DIGITAL_LICENSE, PRODUCT_LEGAL_NOTICE]
  },
  refunds: {
    title: "Refund Policy",
    body: [
      "Digital materials are delivered after payment validation. Because access is granted immediately, refunds may be limited unless a technical issue prevents access and LANCELOT cannot resolve it.",
      "Live class refunds or rescheduling depend on the configured booking policy, minimum notice period, no-show rules, and any special promotion terms applied to the purchase."
    ]
  },
  "live-class-policy": {
    title: "Live Class Booking Policy",
    body: [
      LIVE_CLASS_POLICY,
      "A booking is confirmed only after payment validation. Pending holds expire automatically if payment is not completed within the configured window.",
      "The selected time is stored in UTC and displayed in the student's local timezone and the instructor's timezone."
    ]
  },
  copyright: {
    title: "Copyright Notice",
    body: [
      "All LANCELOT materials, previews, learning paths, product copy, class frameworks, and downloadable assets are protected intellectual property.",
      "Unauthorized resale, redistribution, copying, uploading, public sharing, or use inside another commercial product is prohibited without written authorization from LANCELOT."
    ]
  }
} as const;

export type LegalPageSlug = keyof typeof legalPages;
