-- ============================================================
-- Village Market — Migration 005: Seller marketing features
-- Social/website links, product highlight flag, restocking flag
-- ============================================================

alter table sellers
  add column if not exists instagram_url text,
  add column if not exists website_url text;

alter table products
  add column if not exists is_highlighted boolean not null default false,
  add column if not exists restocking boolean not null default false;
