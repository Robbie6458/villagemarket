-- ============================================================
-- Village Market — Badges
-- Adds founding_maker and monthly_supporter flags to sellers
-- ============================================================

alter table sellers
  add column founding_maker    boolean not null default false,
  add column monthly_supporter boolean not null default false;

create index sellers_founding_idx   on sellers(founding_maker)    where founding_maker = true;
create index sellers_supporter_idx  on sellers(monthly_supporter) where monthly_supporter = true;
