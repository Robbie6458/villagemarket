-- ============================================================
-- Village Market — Migration 007: Order fulfillment preferences
-- How a maker prefers transactions to happen (pickup, delivery days, etc.)
-- ============================================================

alter table sellers
  add column if not exists fulfillment_preferences text;
