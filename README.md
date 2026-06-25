# LANCELOT Academic Marketplace

Next.js portal for LANCELOTMET.COM: digital academic marketplace, secure buyer library, and live class booking platform by product.

## Included MVP

- Professional marketplace home.
- Search and filters by topic, category, level, resource type and sort.
- Product page with free preview, SEO metadata, license, related resources and two purchase paths: Material Only and Full LANCELOT Experience.
- Local cart prepared for persisted Supabase carts.
- Backend checkout with Zod validation, pending order, demo payment and Stripe-ready architecture.
- Idempotent payment webhook using `payment_events`.
- `download_access` unlocked only after an order becomes `paid`.
- Secure download endpoint that validates access and signs private Supabase Storage URLs.
- My Library and My Bookings.
- Basic admin for products, experiences, bookings and metrics.
- Supabase schema with RLS, roles, private storage buckets, policies and seed data.
- Legal pages: Terms, Privacy, License, Refund Policy, Live Class Policy and Copyright.
- Legacy appointment module remains available at `/citas`.

## Main Routes

- `/`: marketplace home.
- `/marketplace`: catalog, search and filters.
- `/marketplace/english/b1/past-perfect-b1-complete-class-pack`: demo product.
- `/cart`: cart.
- `/checkout`: checkout.
- `/my-library`: purchased materials.
- `/my-bookings`: live class bookings.
- `/admin/products`: digital product publishing admin.
- `/admin/products/new`: create product draft.
- `/admin/products/[id]/files`: upload cover, previews and protected premium files.
- `/admin/products/[id]/preview`: admin buyer-facing preview.
- `/admin/products/[id]/publish`: readiness checklist and publication.
- `/admin/marketplace`: admin dashboard.
- `/login`: Supabase Auth.

## Install

```bash
npm install
copy .env.local.example .env.local
npm run dev
```

Alternate port:

```bash
npm run dev:3001
```

## Environment

Public:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Backend only:

- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `MERCADO_PAGO_PUBLIC_KEY`
- `MERCADO_PAGO_ACCESS_TOKEN`
- `MERCADO_PAGO_USE_SANDBOX`
- `RESEND_API_KEY` or `EMAIL_PROVIDER_KEY`
- `ADMIN_ACCESS_TOKEN`
- `APP_URL`
- `DEFAULT_CURRENCY`
- `DEFAULT_TIMEZONE`

Never import the service role key into client components. Browser Supabase lives in `lib/supabase/browser.ts`; server/admin Supabase lives in `lib/supabase/server.ts`.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in SQL Editor.
3. Confirm RLS is enabled on all public tables.
4. Confirm buckets:
   - `public-assets`: public.
   - `product-previews`: private or watermarked preview-only.
   - `protected-products`: private required.
   - `user-uploads-future`: private.
5. Upload premium files to `protected-products`.
6. Create `product_files` records with bucket, path, version and `is_active=true`.

By default, local development uses marketplace demo data even if `.env.local` contains Supabase keys. After running `supabase/schema.sql`, set:

```txt
MARKETPLACE_DEMO_MODE=false
USE_REAL_SUPABASE_MARKETPLACE=true
```

Then restart the dev server to exercise the real Supabase tables, RLS and private storage flow.

## Security Model

- Published products and preview assets can be public.
- `product_files` is admin-only.
- Downloads go through `/api/download/request`.
- The endpoint validates active access, paid order, download limit and expiration before signing a URL.
- Paid orders are assigned by webhook or backend demo payment, not by frontend state.
- Bookings are confirmed only after payment validation.
- Mercado Pago Checkout Pro is supported through `/api/checkout` and `/api/webhooks/payment?provider=mercado_pago`.
- Middleware protects `/admin/marketplace` when `ADMIN_ACCESS_TOKEN` is set.
- Critical inputs use Zod.
- Critical backend actions write audit logs when Supabase is configured.

## Admin Product Upload Flow

Open:

```txt
http://127.0.0.1:3001/admin/products?adminToken=change-this-token
```

In production, prefer Supabase Auth with an `admin` or `super_admin` profile role. The local admin token remains useful for setup and development.

The owner workflow is:

1. Go to `/admin/products`.
2. Click `Create new product`.
3. Complete basic information, academic content, price, license, SEO and optional Full LANCELOT Experience.
4. Save as draft.
5. Open `/admin/products/[id]/files`.
6. Enter the admin token or use a valid admin session.
7. Upload:
   - Cover image to `product-previews`.
   - Preview images/PDF to `product-previews`.
   - Premium digital file to `protected-products`.
8. Open `/admin/products/[id]/preview`.
9. Open `/admin/products/[id]/publish`.
10. Confirm license/private-file checkbox and preview checkbox.
11. Publish.

Premium files are never uploaded to a public bucket. The browser asks `/api/admin/products/upload-url` for a signed upload URL, uploads with the temporary token, then calls `/api/admin/products/register-file` to create either `product_assets` or `product_files`.

Allowed files:

- PDF
- ZIP
- PPTX
- DOCX
- PNG
- JPG/JPEG
- WEBP

Blocked files:

- EXE, BAT, CMD, SH, JS, PHP, PY, JAR, MSI, DMG, APP and unknown binaries.

MVP limits:

- Cover image: 5 MB.
- Preview image: 5 MB.
- Preview PDF: 20 MB.
- Premium file: 200 MB.

Publication is blocked unless the checklist passes:

- Basic information complete.
- Category selected.
- Level selected.
- Price or free resource configured.
- Cover uploaded.
- Preview uploaded.
- Premium file uploaded for paid downloadable products.
- License text added.
- SEO fields added.
- Premium file stored in `protected-products`.
- Product preview checked.

Important endpoints:

- `POST /api/admin/products`
- `PATCH /api/admin/products/[id]`
- `POST /api/admin/products/upload-url`
- `POST /api/admin/products/register-file`
- `POST /api/admin/products/[id]/publish`
- `POST /api/admin/products/[id]/archive`
- `POST /api/admin/products/[id]/duplicate`
- `GET /api/admin/storage/cleanup-orphans` for `super_admin` review only.

## Payments

Demo mode:

- Without Supabase, checkout creates a demo order.
- With Supabase, checkout creates `orders` and `order_items`.
- It redirects to `/api/payment/simulate?orderId=...`.
- `markOrderPaid` performs the production transition: order `paid`, download access created, booking confirmed.

Stripe:

- Configure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
- Use `/api/webhooks/payment`.
- The webhook verifies signature and uses `payment_events.event_id` for idempotency.

Mercado Pago and Wompi are prepared through the provider field and order model.

## Operations

- Keep separate Supabase projects for development and production.
- Protect service role, payment keys and webhook secrets.
- Schedule PostgreSQL and private storage backups.
- Do not delete paid orders; use `refunded` or `cancelled`.
- Do not delete premium files with active buyers; use `product_files.version`.
- Add scheduled jobs for expired booking holds, abandoned carts, class reminders, download expiration and daily reports.

## Testing

```bash
npm run typecheck
npm run build
npm run test
```

`npm run test` runs HTTP smoke tests against `TEST_BASE_URL` or `http://127.0.0.1:3000`. Start `npm run dev` first to validate endpoints.

## Legacy Google Calendar

The old appointment module remains at `/citas` and `/admin/citas`. Calendar variables:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_CALENDAR_ID`
- `APPOINTMENT_NOTIFY_EMAILS`
