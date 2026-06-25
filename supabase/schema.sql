create extension if not exists pgcrypto;

-- LANCELOT Academic Marketplace schema.
-- Run in Supabase SQL Editor. Buckets are also declared here for convenience.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  role text not null default 'student' check (role in ('student','instructor','admin','super_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  )
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  )
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  parent_id uuid references public.categories(id),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  short_description text,
  full_description text,
  category_id uuid references public.categories(id),
  level text,
  language text default 'en',
  resource_type text,
  product_kind text not null default 'digital_download' check (product_kind in ('digital_download','live_experience','bundle','learning_path','membership_future','free_lead_magnet')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  tags text[] not null default '{}',
  cover_image text,
  preview_images text[] not null default '{}',
  preview_file text,
  digital_file_name text,
  file_type text,
  file_size text,
  price numeric(12,2),
  currency text not null default 'USD',
  compare_at_price numeric(12,2),
  page_count int default 0,
  file_count int default 0,
  estimated_study_time text,
  includes text[] not null default '{}',
  learning_objectives text[] not null default '{}',
  who_is_for text[] not null default '{}',
  who_is_this_for text,
  how_to_use text,
  contents text[] not null default '{}',
  learning_path_ids text[] not null default '{}',
  search_aliases text[] not null default '{}',
  seo_title text,
  seo_description text,
  og_image_path text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  license_text text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  published_at timestamptz,
  archived_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  price_type text not null check (price_type in ('material_only','full_experience','live_class_only_after_material_purchase','bundle','free')),
  amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  compare_at_price numeric(12,2),
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.product_assets (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  asset_type text not null check (asset_type in ('cover','preview_image','preview_pdf','watermark_preview','gallery_image','og_image')),
  bucket text not null,
  path text not null,
  original_file_name text,
  mime_type text,
  size_bytes bigint,
  is_public_preview boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  bucket text not null default 'protected-products',
  path text not null,
  file_name text,
  original_file_name text,
  display_file_name text,
  file_type text,
  mime_type text,
  file_size bigint,
  size_bytes bigint,
  checksum text,
  version int not null default 1,
  is_active boolean not null default true,
  available_to_previous_buyers boolean not null default true,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists status text not null default 'draft';
alter table public.products add column if not exists price numeric(12,2);
alter table public.products add column if not exists currency text not null default 'USD';
alter table public.products add column if not exists compare_at_price numeric(12,2);
alter table public.products add column if not exists file_count int default 0;
alter table public.products add column if not exists estimated_study_time text;
alter table public.products add column if not exists who_is_this_for text;
alter table public.products add column if not exists how_to_use text;
alter table public.products add column if not exists seo_title text;
alter table public.products add column if not exists seo_description text;
alter table public.products add column if not exists og_image_path text;
alter table public.products add column if not exists updated_by uuid references public.profiles(id);
alter table public.products add column if not exists published_at timestamptz;
alter table public.products add column if not exists archived_at timestamptz;
alter table public.product_assets add column if not exists original_file_name text;
alter table public.product_assets add column if not exists mime_type text;
alter table public.product_assets add column if not exists size_bytes bigint;
alter table public.product_files add column if not exists original_file_name text;
alter table public.product_files add column if not exists display_file_name text;
alter table public.product_files add column if not exists mime_type text;
alter table public.product_files add column if not exists size_bytes bigint;
alter table public.product_files add column if not exists uploaded_by uuid references public.profiles(id);

create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  name text not null,
  email text not null,
  bio text,
  profile_image text,
  specialties text[] not null default '{}',
  timezone text not null default 'America/Bogota',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.live_experiences (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  slug text unique,
  description text,
  duration_minutes int not null default 60,
  price numeric(12,2) not null,
  reduced_price_after_material numeric(12,2),
  currency text not null default 'USD',
  includes_material boolean not null default true,
  includes_live_class boolean not null default true,
  includes_follow_up boolean not null default false,
  instructor_id uuid references public.instructors(id),
  meeting_provider text default 'manual',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.instructors(id) on delete cascade,
  start_time_utc timestamptz not null,
  end_time_utc timestamptz not null,
  timezone text not null default 'America/Bogota',
  is_available boolean not null default true,
  is_booked boolean not null default false,
  created_at timestamptz not null default now(),
  check (end_time_utc > start_time_utc)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  email text not null,
  status text not null default 'pending' check (status in ('pending','paid','failed','cancelled','refunded','partially_refunded')),
  subtotal numeric(12,2) not null default 0,
  discount_total numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'USD',
  payment_provider text,
  payment_reference text,
  checkout_session_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  product_id uuid references public.products(id),
  experience_id uuid references public.live_experiences(id),
  instructor_id uuid references public.instructors(id),
  order_id uuid references public.orders(id),
  status text not null default 'pending_payment' check (status in ('pending_payment','confirmed','cancelled','rescheduled','completed','no_show','expired')),
  start_time_utc timestamptz not null,
  end_time_utc timestamptz not null,
  student_timezone text,
  instructor_timezone text,
  meeting_provider text,
  meeting_url text,
  calendar_event_id text,
  student_notes text,
  admin_notes text,
  hold_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time_utc > start_time_utc)
);

create unique index if not exists bookings_one_active_instructor_slot
  on public.bookings (instructor_id, start_time_utc, end_time_utc)
  where status in ('pending_payment','confirmed');

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  experience_id uuid references public.live_experiences(id),
  booking_id uuid references public.bookings(id),
  item_type text not null check (item_type in ('digital_material','full_experience','live_class_only','bundle','learning_path')),
  title_snapshot text,
  price_snapshot numeric(12,2) not null default 0,
  currency text not null default 'USD',
  quantity int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.download_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  order_id uuid references public.orders(id),
  product_id uuid references public.products(id),
  product_file_id uuid references public.product_files(id),
  download_limit int not null default 5,
  downloads_used int not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create table if not exists public.download_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  order_id uuid references public.orders(id),
  product_id uuid references public.products(id),
  product_file_id uuid references public.product_files(id),
  ip_address text,
  user_agent text,
  downloaded_at timestamptz not null default now()
);

create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  category_id uuid references public.categories(id),
  level text,
  cover_image text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_path_items (
  id uuid primary key default gen_random_uuid(),
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  product_id uuid not null references public.products(id),
  order_index int not null default 0,
  is_required boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  anonymous_id text,
  email text,
  status text not null default 'active' check (status in ('active','converted','abandoned','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid references public.products(id),
  experience_id uuid references public.live_experiences(id),
  booking_id uuid references public.bookings(id),
  item_type text,
  price_snapshot numeric(12,2),
  quantity int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null check (discount_type in ('percentage','fixed_amount')),
  discount_value numeric(12,2) not null,
  max_redemptions int,
  redemptions_used int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  applies_to_product_id uuid references public.products(id),
  applies_to_category_id uuid references public.categories(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  source_product_id uuid references public.products(id),
  topic_interest text,
  level_interest text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  anonymous_id text,
  event_type text not null,
  product_id uuid references public.products(id),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.search_aliases (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  product_id uuid references public.products(id),
  category_id uuid references public.categories(id),
  learning_path_id uuid references public.learning_paths(id),
  created_at timestamptz not null default now()
);

create table if not exists public.search_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  anonymous_id text,
  query text not null,
  results_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  order_id uuid references public.orders(id),
  product_id uuid references public.products(id),
  booking_id uuid references public.bookings(id),
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open','in_review','resolved','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  email text not null,
  template text not null,
  status text not null default 'queued',
  provider_message_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text unique not null,
  event_type text,
  payload jsonb not null default '{}',
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id int primary key default 1,
  default_currency text not null default 'USD',
  supported_currencies text[] not null default '{USD,COP,EUR}',
  tax_enabled boolean not null default false,
  tax_percentage numeric(5,2) not null default 0,
  business_name text not null default 'LANCELOT',
  business_email text not null default 'consulta@lancelotmet.com',
  support_email text not null default 'consulta@lancelotmet.com',
  default_timezone text not null default 'America/Bogota',
  check (id = 1)
);

-- Indexes
create index if not exists products_slug_idx on public.products(slug);
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_level_idx on public.products(level);
create index if not exists products_is_published_idx on public.products(is_published);
create index if not exists products_created_at_idx on public.products(created_at);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_checkout_session_id_idx on public.orders(checkout_session_id);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists download_access_user_product_idx on public.download_access(user_id, product_id);
create index if not exists download_logs_user_product_idx on public.download_logs(user_id, product_id);
create index if not exists bookings_user_id_idx on public.bookings(user_id);
create index if not exists bookings_instructor_id_idx on public.bookings(instructor_id);
create index if not exists bookings_start_time_idx on public.bookings(start_time_utc);
create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists availability_instructor_start_idx on public.availability_slots(instructor_id, start_time_utc);
create index if not exists user_events_event_type_idx on public.user_events(event_type);
create index if not exists user_events_product_id_idx on public.user_events(product_id);
create index if not exists search_logs_query_idx on public.search_logs(query);

-- Enable RLS everywhere in public marketplace tables.
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_prices enable row level security;
alter table public.product_assets enable row level security;
alter table public.product_files enable row level security;
alter table public.instructors enable row level security;
alter table public.live_experiences enable row level security;
alter table public.availability_slots enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.download_access enable row level security;
alter table public.download_logs enable row level security;
alter table public.bookings enable row level security;
alter table public.learning_paths enable row level security;
alter table public.learning_path_items enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.coupons enable row level security;
alter table public.leads enable row level security;
alter table public.user_events enable row level security;
alter table public.search_aliases enable row level security;
alter table public.search_logs enable row level security;
alter table public.support_tickets enable row level security;
alter table public.email_logs enable row level security;
alter table public.payment_events enable row level security;
alter table public.audit_logs enable row level security;
alter table public.site_settings enable row level security;

-- Policies
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own_except_role" on public.profiles;
create policy "profiles_update_own_except_role" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid() and role = public.current_user_role());

drop policy if exists "profiles_super_admin_all" on public.profiles;
create policy "profiles_super_admin_all" on public.profiles
for all using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "categories_public_active" on public.categories;
create policy "categories_public_active" on public.categories
for select using (is_active = true);
drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all" on public.categories
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products_public_published" on public.products;
create policy "products_public_published" on public.products
for select using (status = 'published' and is_published = true and deleted_at is null);
drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all" on public.products
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_prices_public_active_for_published" on public.product_prices;
create policy "product_prices_public_active_for_published" on public.product_prices
for select using (
  is_active = true and exists (
    select 1 from public.products p where p.id = product_id and p.status = 'published' and p.is_published = true and p.deleted_at is null
  )
);
drop policy if exists "product_prices_admin_all" on public.product_prices;
create policy "product_prices_admin_all" on public.product_prices
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_assets_public_previews" on public.product_assets;
create policy "product_assets_public_previews" on public.product_assets
for select using (
  is_public_preview = true and exists (
    select 1 from public.products p where p.id = product_id and p.status = 'published' and p.is_published = true and p.deleted_at is null
  )
);
drop policy if exists "product_assets_admin_all" on public.product_assets;
create policy "product_assets_admin_all" on public.product_assets
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_files_admin_only" on public.product_files;
create policy "product_files_admin_only" on public.product_files
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "instructors_public_active" on public.instructors;
create policy "instructors_public_active" on public.instructors
for select using (is_active = true);
drop policy if exists "instructors_manage_own_or_admin" on public.instructors;
create policy "instructors_manage_own_or_admin" on public.instructors
for all using (public.is_admin() or user_id = auth.uid()) with check (public.is_admin() or user_id = auth.uid());

drop policy if exists "experiences_public_active" on public.live_experiences;
create policy "experiences_public_active" on public.live_experiences
for select using (
  is_active = true and exists (select 1 from public.products p where p.id = product_id and p.status = 'published' and p.is_published = true)
);
drop policy if exists "experiences_admin_all" on public.live_experiences;
create policy "experiences_admin_all" on public.live_experiences
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "availability_public_available_future" on public.availability_slots;
create policy "availability_public_available_future" on public.availability_slots
for select using (is_available = true and is_booked = false and start_time_utc > now());
drop policy if exists "availability_instructor_or_admin_all" on public.availability_slots;
create policy "availability_instructor_or_admin_all" on public.availability_slots
for all using (
  public.is_admin() or exists (
    select 1 from public.instructors i where i.id = instructor_id and i.user_id = auth.uid()
  )
) with check (
  public.is_admin() or exists (
    select 1 from public.instructors i where i.id = instructor_id and i.user_id = auth.uid()
  )
);

drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin" on public.orders
for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all" on public.orders
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order_items_select_if_own_order" on public.order_items;
create policy "order_items_select_if_own_order" on public.order_items
for select using (
  public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
drop policy if exists "order_items_admin_all" on public.order_items;
create policy "order_items_admin_all" on public.order_items
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "download_access_select_own_or_admin" on public.download_access;
create policy "download_access_select_own_or_admin" on public.download_access
for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "download_access_admin_all" on public.download_access;
create policy "download_access_admin_all" on public.download_access
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "download_logs_select_own_or_admin" on public.download_logs;
create policy "download_logs_select_own_or_admin" on public.download_logs
for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "download_logs_admin_all" on public.download_logs;
create policy "download_logs_admin_all" on public.download_logs
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "bookings_select_by_owner_instructor_or_admin" on public.bookings;
create policy "bookings_select_by_owner_instructor_or_admin" on public.bookings
for select using (
  user_id = auth.uid() or public.is_admin() or exists (
    select 1 from public.instructors i where i.id = instructor_id and i.user_id = auth.uid()
  )
);
drop policy if exists "bookings_admin_all" on public.bookings;
create policy "bookings_admin_all" on public.bookings
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "learning_paths_public_published" on public.learning_paths;
create policy "learning_paths_public_published" on public.learning_paths
for select using (is_published = true);
drop policy if exists "learning_paths_admin_all" on public.learning_paths;
create policy "learning_paths_admin_all" on public.learning_paths
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "learning_path_items_public_for_published_paths" on public.learning_path_items;
create policy "learning_path_items_public_for_published_paths" on public.learning_path_items
for select using (
  exists (select 1 from public.learning_paths lp where lp.id = learning_path_id and lp.is_published = true)
  and exists (select 1 from public.products p where p.id = product_id and p.is_published = true)
);
drop policy if exists "learning_path_items_admin_all" on public.learning_path_items;
create policy "learning_path_items_admin_all" on public.learning_path_items
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "carts_own_or_admin" on public.carts;
create policy "carts_own_or_admin" on public.carts
for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
drop policy if exists "cart_items_own_cart_or_admin" on public.cart_items;
create policy "cart_items_own_cart_or_admin" on public.cart_items
for all using (
  public.is_admin() or exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
) with check (
  public.is_admin() or exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())
);

drop policy if exists "coupons_admin_only" on public.coupons;
create policy "coupons_admin_only" on public.coupons
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "leads_insert_public_admin_select" on public.leads;
create policy "leads_insert_public_admin_select" on public.leads
for insert with check (true);
drop policy if exists "leads_admin_select" on public.leads;
create policy "leads_admin_select" on public.leads
for select using (public.is_admin());

drop policy if exists "user_events_insert_limited" on public.user_events;
create policy "user_events_insert_limited" on public.user_events
for insert with check (user_id is null or user_id = auth.uid());
drop policy if exists "user_events_admin_select" on public.user_events;
create policy "user_events_admin_select" on public.user_events
for select using (public.is_admin());

drop policy if exists "search_aliases_public_select" on public.search_aliases;
create policy "search_aliases_public_select" on public.search_aliases
for select using (true);
drop policy if exists "search_aliases_admin_all" on public.search_aliases;
create policy "search_aliases_admin_all" on public.search_aliases
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "search_logs_insert_public" on public.search_logs;
create policy "search_logs_insert_public" on public.search_logs
for insert with check (user_id is null or user_id = auth.uid());
drop policy if exists "search_logs_admin_select" on public.search_logs;
create policy "search_logs_admin_select" on public.search_logs
for select using (public.is_admin());

drop policy if exists "support_tickets_own_or_admin" on public.support_tickets;
create policy "support_tickets_own_or_admin" on public.support_tickets
for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "support_tickets_insert_own" on public.support_tickets;
create policy "support_tickets_insert_own" on public.support_tickets
for insert with check (user_id is null or user_id = auth.uid());
drop policy if exists "support_tickets_admin_all" on public.support_tickets;
create policy "support_tickets_admin_all" on public.support_tickets
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "email_logs_admin_only" on public.email_logs;
create policy "email_logs_admin_only" on public.email_logs
for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "payment_events_admin_only" on public.payment_events;
create policy "payment_events_admin_only" on public.payment_events
for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "audit_logs_admin_select" on public.audit_logs;
create policy "audit_logs_admin_select" on public.audit_logs
for select using (public.is_admin());
drop policy if exists "audit_logs_admin_insert" on public.audit_logs;
create policy "audit_logs_admin_insert" on public.audit_logs
for insert with check (public.is_admin());
drop policy if exists "site_settings_public_select" on public.site_settings;
create policy "site_settings_public_select" on public.site_settings
for select using (true);
drop policy if exists "site_settings_admin_all" on public.site_settings;
create policy "site_settings_admin_all" on public.site_settings
for all using (public.is_admin()) with check (public.is_admin());

-- Storage buckets.
insert into storage.buckets (id, name, public)
values
  ('public-assets', 'public-assets', true),
  ('product-previews', 'product-previews', false),
  ('protected-products', 'protected-products', false),
  ('user-uploads-future', 'user-uploads-future', false)
on conflict (id) do nothing;

drop policy if exists "public read public assets" on storage.objects;
create policy "public read public assets" on storage.objects
for select using (bucket_id = 'public-assets');

drop policy if exists "public read product previews" on storage.objects;
create policy "public read product previews" on storage.objects
for select using (bucket_id = 'product-previews');

drop policy if exists "admin manage marketplace storage" on storage.objects;
create policy "admin manage marketplace storage" on storage.objects
for all using (public.is_admin()) with check (public.is_admin());

-- Seed
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

insert into public.categories (id, name, slug, description, is_active)
values
  ('00000000-0000-0000-0000-000000000101', 'English', 'english', 'Grammar, pronunciation, speaking, writing and class packs.', true),
  ('00000000-0000-0000-0000-000000000102', 'Grammar', 'grammar', 'Visual grammar systems for English learners.', true),
  ('00000000-0000-0000-0000-000000000103', 'Pronunciation', 'pronunciation', 'Sound, rhythm and articulation resources.', true),
  ('00000000-0000-0000-0000-000000000104', 'Learning Mindsets', 'learning-mindsets', 'Mindset and neuroeducation resources.', true)
on conflict (id) do nothing;

insert into public.instructors (id, name, email, bio, specialties, timezone, is_active)
values (
  '00000000-0000-0000-0000-000000000201',
  'LANCELOT Instructor',
  'consulta@lancelotmet.com',
  'Senior academic mentor specialized in English learning, mindset and guided practice.',
  array['English grammar','Pronunciation','Learning strategy','Mindset'],
  'America/Bogota',
  true
) on conflict (id) do nothing;

insert into public.products (
  id, title, slug, short_description, full_description, category_id, level, language, resource_type,
  product_kind, tags, cover_image, preview_images, preview_file, digital_file_name, file_type, file_size,
  price, currency, compare_at_price, page_count, file_count, estimated_study_time,
  includes, learning_objectives, who_is_for, who_is_this_for, how_to_use, contents, search_aliases,
  seo_title, seo_description, status, is_published, is_featured, license_text
)
values
  (
    '00000000-0000-0000-0000-000000001001',
    'Past Perfect B1 - Complete Class Pack',
    'past-perfect-b1-complete-class-pack',
    'A premium complete class pack to teach Past Perfect with timelines, guided practice and speaking tasks.',
    'This LANCELOT class pack turns Past Perfect from a memorized rule into a visual, usable thinking tool.',
    '00000000-0000-0000-0000-000000000101',
    'B1',
    'English',
    'Complete Class Pack',
    'digital_download',
    array['past perfect','had eaten','pasado perfecto','grammar','b1'],
    'cover-past-perfect',
    array['preview-past-perfect-1','preview-past-perfect-2'],
    'past-perfect-b1-preview.pdf',
    'lancelot-past-perfect-b1-complete-class-pack.zip',
    'PDF + PNG + DOCX + ZIP',
    '42 MB',
    12,
    'USD',
    18,
    34,
    6,
    '60-90 minutes',
    array['Lesson guide','10 premium infographics','Practice worksheet','Answer key','Speaking activity','Mini assessment'],
    array['Understand Past Perfect through sequence and timeline logic.','Use Past Perfect to explain events before another past action.'],
    array['B1 English learners','Private tutors','Schools building grammar workshops'],
    'B1 English learners, private tutors, and schools building grammar workshops.',
    'Use this pack as a complete class, a guided self-study sequence, or a review lesson before assessment.',
    array['Teacher lesson flow','Student worksheet','Visual grammar guide','Mini assessment rubric'],
    array['had eaten','pasado perfecto','past perfect timeline'],
    'Past Perfect B1 Complete Class Pack | LANCELOT',
    'Download a premium B1 English class pack on Past Perfect with lesson guide, worksheets, infographics, speaking practice and answer key.',
    'published',
    true,
    true,
    'By purchasing this digital material, you receive a limited, non-exclusive, non-transferable license for personal, educational, or internal classroom use.'
  ),
  (
    '00000000-0000-0000-0000-000000001002',
    'Present Perfect vs Past Simple - B1 Visual Guide',
    'present-perfect-vs-past-simple-b1-visual-guide',
    'A visual guide that helps B1 learners choose between life experience, result and finished time.',
    'A concise visual pack for the most common B1 grammar contrast.',
    '00000000-0000-0000-0000-000000000101',
    'B1',
    'English',
    'Infographic Pack',
    'digital_download',
    array['present perfect','past simple','grammar','b1'],
    'cover-present-perfect',
    array['preview-present-perfect-1','preview-present-perfect-2'],
    'present-perfect-vs-past-simple-preview.pdf',
    'lancelot-present-perfect-vs-past-simple-b1.zip',
    'PDF + PNG',
    '18 MB',
    8,
    'USD',
    12,
    16,
    4,
    '45 minutes',
    array['Comparison map','6 infographics','Practice worksheet','Answer key'],
    array['Separate finished time from life experience.','Recognize result-focused sentences.'],
    array['B1 learners','Teachers needing a clean tense contrast'],
    'B1 learners and teachers who need a clear tense contrast.',
    'Use this as a visual explanation, classroom reference, or review worksheet.',
    array['Visual tense comparison','Signal words','Practice set'],
    array['have been','ever never','finished time'],
    'Present Perfect vs Past Simple B1 Visual Guide | LANCELOT',
    'Download a B1 visual guide comparing Present Perfect and Past Simple with infographics and practice.',
    'published',
    true,
    true,
    'By purchasing this digital material, you receive a limited, non-exclusive, non-transferable license.'
  )
on conflict (id) do nothing;

insert into public.product_prices (product_id, price_type, amount, currency, compare_at_price, is_active)
values
  ('00000000-0000-0000-0000-000000001001', 'material_only', 12, 'USD', 18, true),
  ('00000000-0000-0000-0000-000000001001', 'full_experience', 49, 'USD', 68, true),
  ('00000000-0000-0000-0000-000000001001', 'live_class_only_after_material_purchase', 39, 'USD', null, true),
  ('00000000-0000-0000-0000-000000001002', 'material_only', 8, 'USD', 12, true),
  ('00000000-0000-0000-0000-000000001002', 'full_experience', 45, 'USD', null, true)
on conflict do nothing;

insert into public.live_experiences (
  id, product_id, title, slug, description, duration_minutes, price, reduced_price_after_material,
  currency, includes_material, includes_live_class, includes_follow_up, instructor_id, meeting_provider, is_active
)
values (
  '00000000-0000-0000-0000-000000002001',
  '00000000-0000-0000-0000-000000001001',
  'Past Perfect B1 - Full LANCELOT Experience',
  'past-perfect-b1-full-lancelot-experience',
  'A live guided LANCELOT session on Past Perfect B1 with personalized correction and recommendations.',
  60,
  49,
  39,
  'USD',
  true,
  true,
  true,
  '00000000-0000-0000-0000-000000000201',
  'manual',
  true
) on conflict (id) do nothing;

insert into public.availability_slots (instructor_id, start_time_utc, end_time_utc, timezone, is_available, is_booked)
values
  ('00000000-0000-0000-0000-000000000201', now() + interval '2 days', now() + interval '2 days 1 hour', 'America/Bogota', true, false),
  ('00000000-0000-0000-0000-000000000201', now() + interval '3 days', now() + interval '3 days 1 hour', 'America/Bogota', true, false)
on conflict do nothing;

-- Legacy appointment module retained.
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  service text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  notes text,
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled')),
  google_event_id text,
  calendar_html_link text
);

create unique index if not exists appointments_active_starts_at_key
  on public.appointments (starts_at)
  where status <> 'cancelled';

alter table public.appointments enable row level security;
drop policy if exists "Allow public appointment reads for availability" on public.appointments;
drop policy if exists "Allow public appointment inserts" on public.appointments;
drop policy if exists "Allow public appointment updates" on public.appointments;
