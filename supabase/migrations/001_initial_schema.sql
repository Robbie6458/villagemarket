-- ============================================================
-- Village Market — Initial Schema
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- SELLERS
-- ============================================================

create table sellers (
  id                    uuid primary key default uuid_generate_v4(),
  created_at            timestamptz not null default now(),
  approved_at           timestamptz,
  auth_user_id          uuid references auth.users(id) on delete set null,

  -- Identity
  name                  text not null,
  slug                  text not null unique,
  tagline               text not null,
  bio                   text not null,

  -- Location
  location_label        text not null,
  lat                   float8 not null,
  lng                   float8 not null,

  -- Categories & payments
  categories            text[] not null default '{}',
  accepted_payments     text[] not null default '{}',
  payment_other_label   text,

  -- Photos
  cover_photo_url       text not null default '',
  profile_photo_url     text not null default '',

  -- Selling details
  barter_accepts        text not null default '',
  delivery_available    boolean not null default false,
  delivery_radius_miles integer not null default 0,
  custom_orders_open    boolean not null default false,
  is_available_now      boolean not null default true,
  local_materials       boolean not null default false,

  -- Status flags
  verified              boolean not null default false,
  featured              boolean not null default false,
  community_contributor boolean not null default false,
  is_active             boolean not null default true,
  onboarding_paid       boolean not null default false,

  -- Contact (server-side only, not exposed to public)
  contact_email         text
);

-- ============================================================
-- PRODUCTS
-- ============================================================

create table products (
  id                  uuid primary key default uuid_generate_v4(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  seller_id           uuid not null references sellers(id) on delete cascade,

  title               text not null,
  description         text not null,
  price               numeric(10, 2) not null,
  price_label         text,
  photo_url           text not null default '',
  category            text not null,
  availability_status text not null default 'available'
                        check (availability_status in ('available', 'seasonal', 'made_to_order')),
  is_active           boolean not null default true,
  is_custom_order     boolean not null default false
);

-- Auto-update updated_at on products
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on products
  for each row execute function update_updated_at();

-- ============================================================
-- SELLER APPLICATIONS
-- ============================================================

create table seller_applications (
  id                    uuid primary key default uuid_generate_v4(),
  created_at            timestamptz not null default now(),

  -- Applicant info
  name                  text not null,
  email                 text not null,
  phone                 text not null,
  location              text not null,

  -- What they make
  categories            text[] not null default '{}',
  description           text not null,
  experience            text not null,

  -- Business details
  payment_methods       text[] not null default '{}',
  delivery_available    boolean not null default false,
  delivery_radius_miles integer not null default 0,

  -- Optional fields
  social_links          text,
  referral_source       text,

  -- Admin workflow
  status                text not null default 'pending'
                          check (status in ('pending', 'approved', 'rejected')),
  admin_notes           text
);

-- ============================================================
-- INDEXES
-- ============================================================

create index sellers_slug_idx         on sellers(slug);
create index sellers_active_idx       on sellers(is_active) where is_active = true;
create index sellers_featured_idx     on sellers(featured)  where featured = true;
create index sellers_contributor_idx  on sellers(community_contributor) where community_contributor = true;
create index products_seller_id_idx   on products(seller_id);
create index applications_status_idx  on seller_applications(status);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table sellers           enable row level security;
alter table products          enable row level security;
alter table seller_applications enable row level security;

-- SELLERS --

-- Public: anyone can read active sellers
create policy "sellers_public_read"
  on sellers for select
  using (is_active = true);

-- Sellers can update their own row
create policy "sellers_self_update"
  on sellers for update
  using (auth.uid() = auth_user_id);

-- PRODUCTS --

-- Public: anyone can read active products of active sellers
create policy "products_public_read"
  on products for select
  using (
    is_active = true
    and exists (
      select 1 from sellers
      where sellers.id = products.seller_id
      and sellers.is_active = true
    )
  );

-- Sellers can manage their own products
create policy "products_seller_insert"
  on products for insert
  with check (
    exists (
      select 1 from sellers
      where sellers.id = products.seller_id
      and sellers.auth_user_id = auth.uid()
    )
  );

create policy "products_seller_update"
  on products for update
  using (
    exists (
      select 1 from sellers
      where sellers.id = products.seller_id
      and sellers.auth_user_id = auth.uid()
    )
  );

create policy "products_seller_delete"
  on products for delete
  using (
    exists (
      select 1 from sellers
      where sellers.id = products.seller_id
      and sellers.auth_user_id = auth.uid()
    )
  );

-- SELLER APPLICATIONS --

-- Anyone can submit an application
create policy "applications_public_insert"
  on seller_applications for insert
  with check (true);

-- No public read — admin reads via service role (bypasses RLS)

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Public bucket for all seller and product images
-- Folder convention: seller-images/{seller_id}/cover.jpg
--                    seller-images/{seller_id}/profile.jpg
--                    seller-images/{seller_id}/products/{product_id}.jpg

insert into storage.buckets (id, name, public)
values ('seller-images', 'seller-images', true);

-- Public read
create policy "seller_images_public_read"
  on storage.objects for select
  using (bucket_id = 'seller-images');

-- Sellers can upload to their own folder only
create policy "seller_images_seller_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'seller-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = (
      select id::text from sellers
      where auth_user_id = auth.uid()
      limit 1
    )
  );

-- Sellers can update their own images
create policy "seller_images_seller_update"
  on storage.objects for update
  using (
    bucket_id = 'seller-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = (
      select id::text from sellers
      where auth_user_id = auth.uid()
      limit 1
    )
  );

-- Sellers can delete their own images
create policy "seller_images_seller_delete"
  on storage.objects for delete
  using (
    bucket_id = 'seller-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = (
      select id::text from sellers
      where auth_user_id = auth.uid()
      limit 1
    )
  );
