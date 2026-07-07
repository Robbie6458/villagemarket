-- ============================================================
-- Village Market — Migration 002: Delivery fees + contact requests
-- ============================================================

-- Add delivery fee fields to sellers
alter table sellers
  add column if not exists delivery_fee         numeric(10,2),
  add column if not exists delivery_fee_label   text;

-- Contact requests table — for 48h tip follow-up emails
create table if not exists contact_requests (
  id                  uuid primary key default uuid_generate_v4(),
  created_at          timestamptz not null default now(),

  buyer_name          text not null,
  buyer_email         text not null,
  seller_id           uuid references sellers(id) on delete set null,
  seller_name         text not null,

  tip_email_sent_at   timestamptz
);

create index contact_requests_pending_idx
  on contact_requests(created_at)
  where tip_email_sent_at is null;

-- RLS
alter table contact_requests enable row level security;

-- Anyone (including unauthenticated buyers) can submit
create policy "contact_requests_public_insert"
  on contact_requests for insert
  with check (true);

-- No public read — admin only via service role
