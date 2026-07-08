-- ============================================================
-- Village Market — Migration 006: VC guest property tracking
-- ============================================================

alter table contact_requests
  add column if not exists vc_property text,
  add column if not exists marketing_opt_in boolean not null default false;

create index if not exists contact_requests_vc_property_idx
  on contact_requests(vc_property)
  where vc_property is not null;
