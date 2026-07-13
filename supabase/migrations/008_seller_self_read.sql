-- ============================================================
-- Village Market — Migration 008: sellers can read their own draft
-- ============================================================
-- The only SELECT policy on sellers/products was "public read where active".
-- A newly-approved seller is is_active=false, so they couldn't read their own
-- row in the dashboard — it showed "account setup in progress" forever.
-- These permissive policies let a signed-in seller always read their own
-- seller row and products, active or not. Public visibility is unchanged
-- (RLS SELECT policies combine with OR).

create policy "sellers_self_read"
  on sellers for select
  using (auth.uid() = auth_user_id);

create policy "products_seller_read"
  on products for select
  using (
    exists (
      select 1 from sellers
      where sellers.id = products.seller_id
      and sellers.auth_user_id = auth.uid()
    )
  );
