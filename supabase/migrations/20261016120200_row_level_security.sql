-- Row level security. Customers (anon) may read the visible catalogue and settings and nothing
-- else; orders are only created through place_order(). Staff manage catalogue, stock and orders.
-- Owners additionally manage settings, coupons and admins, and read the activity log.

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.settings enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.order_counters enable row level security;
alter table public.price_history enable row level security;
alter table public.activity_log enable row level security;

-- Tables nobody writes to directly (only triggers and security definer functions do).
revoke insert, update, delete on public.order_status_history, public.coupon_redemptions,
  public.order_counters, public.price_history, public.activity_log from anon, authenticated;
-- Customers never touch these tables directly.
revoke all on public.orders, public.order_items, public.coupons, public.admin_users from anon;

-- ---------------------------------------------------------------------------
-- Catalogue: public reads what is visible; admins read and write everything.
-- ---------------------------------------------------------------------------
create policy "categories: public reads active" on public.categories
  for select to anon, authenticated using (active);
create policy "categories: admins read all" on public.categories
  for select to authenticated using ((select public.is_admin()));
create policy "categories: admins insert" on public.categories
  for insert to authenticated with check ((select public.is_admin()));
create policy "categories: admins update" on public.categories
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "categories: admins delete" on public.categories
  for delete to authenticated using ((select public.is_admin()));

create policy "products: public reads visible" on public.products
  for select to anon, authenticated
  using (active and deleted_at is null
         and exists (select 1 from public.categories c where c.id = category_id and c.active));
create policy "products: admins read all" on public.products
  for select to authenticated using ((select public.is_admin()));
create policy "products: admins insert" on public.products
  for insert to authenticated with check ((select public.is_admin()));
create policy "products: admins update" on public.products
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "products: admins delete" on public.products
  for delete to authenticated using ((select public.is_admin()));

create policy "variants: public reads visible" on public.product_variants
  for select to anon, authenticated
  using (active and deleted_at is null
         and exists (select 1 from public.products p
                     join public.categories c on c.id = p.category_id
                     where p.id = product_id and p.active and p.deleted_at is null and c.active));
create policy "variants: admins read all" on public.product_variants
  for select to authenticated using ((select public.is_admin()));
create policy "variants: admins insert" on public.product_variants
  for insert to authenticated with check ((select public.is_admin()));
create policy "variants: admins update" on public.product_variants
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "variants: admins delete" on public.product_variants
  for delete to authenticated using ((select public.is_admin()));

create policy "images: public reads visible" on public.product_images
  for select to anon, authenticated
  using (exists (select 1 from public.products p
                 join public.categories c on c.id = p.category_id
                 where p.id = product_id and p.active and p.deleted_at is null and c.active));
create policy "images: admins read all" on public.product_images
  for select to authenticated using ((select public.is_admin()));
create policy "images: admins insert" on public.product_images
  for insert to authenticated with check ((select public.is_admin()));
create policy "images: admins update" on public.product_images
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "images: admins delete" on public.product_images
  for delete to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Settings: everyone reads (the storefront needs fees, hours, number); only owners change.
-- ---------------------------------------------------------------------------
revoke insert, delete on public.settings from anon, authenticated;
create policy "settings: public reads" on public.settings
  for select to anon, authenticated using (true);
create policy "settings: owners update" on public.settings
  for update to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));

-- ---------------------------------------------------------------------------
-- Coupons: customers check codes through validate_coupon(); staff can see them, owners manage.
-- ---------------------------------------------------------------------------
create policy "coupons: admins read" on public.coupons
  for select to authenticated using ((select public.is_admin()));
create policy "coupons: owners insert" on public.coupons
  for insert to authenticated with check ((select public.is_owner()));
create policy "coupons: owners update" on public.coupons
  for update to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "coupons: owners delete" on public.coupons
  for delete to authenticated using ((select public.is_owner()));

create policy "redemptions: admins read" on public.coupon_redemptions
  for select to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Orders: admins read and update (status, items). Nobody deletes; cancel instead.
-- ---------------------------------------------------------------------------
revoke insert, delete on public.orders from authenticated;
create policy "orders: admins read" on public.orders
  for select to authenticated using ((select public.is_admin()));
create policy "orders: admins update" on public.orders
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "order items: admins read" on public.order_items
  for select to authenticated using ((select public.is_admin()));
create policy "order items: admins insert" on public.order_items
  for insert to authenticated with check ((select public.is_admin()));
create policy "order items: admins update" on public.order_items
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "order items: admins delete" on public.order_items
  for delete to authenticated using ((select public.is_admin()));

create policy "status history: admins read" on public.order_status_history
  for select to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Audit tables
-- ---------------------------------------------------------------------------
create policy "price history: admins read" on public.price_history
  for select to authenticated using ((select public.is_admin()));
create policy "activity log: owners read" on public.activity_log
  for select to authenticated using ((select public.is_owner()));

-- ---------------------------------------------------------------------------
-- Admin accounts: each admin sees their own row; owners see and manage everyone.
-- ---------------------------------------------------------------------------
create policy "admins: read self or owner reads all" on public.admin_users
  for select to authenticated using (user_id = auth.uid() or (select public.is_owner()));
create policy "admins: owners insert" on public.admin_users
  for insert to authenticated with check ((select public.is_owner()));
create policy "admins: owners update" on public.admin_users
  for update to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));
create policy "admins: owners delete" on public.admin_users
  for delete to authenticated using ((select public.is_owner()));

-- ---------------------------------------------------------------------------
-- Functions: only the customer-facing ones are callable without logging in.
-- ---------------------------------------------------------------------------
revoke execute on function public.next_order_number() from public, anon, authenticated;
revoke execute on function public.record_price_change() from public, anon, authenticated;
revoke execute on function public.log_activity() from public, anon, authenticated;
revoke execute on function public.protect_last_owner() from public, anon, authenticated;
revoke execute on function public.handle_order_status() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: product photos are public to view; only admins upload, replace or delete.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "product images: public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');
create policy "product images: admins upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "product images: admins update" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "product images: admins delete" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Realtime: the storefront hears catalogue and settings changes; admins hear new orders.
-- (Realtime respects the policies above.)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.categories, public.products,
      public.product_variants, public.product_images, public.settings, public.orders;
  end if;
end;
$$;
