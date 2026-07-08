-- ============================================================
-- Village Market — Migration 004: Product photo gallery
-- Replaces single photo_url with an ordered photo_urls array
-- ============================================================

alter table products add column if not exists photo_urls text[] not null default '{}';

update products
set photo_urls = array[photo_url]
where photo_urls = '{}' and photo_url is not null and photo_url != '';

alter table products drop column if exists photo_url;
