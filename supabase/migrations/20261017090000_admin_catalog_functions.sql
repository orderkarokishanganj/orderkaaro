-- Admin catalogue operations. Each runs in one transaction, so a product is never left
-- half-saved. They run with the caller's rights (security invoker): row level security still
-- decides what is allowed, and each also checks is_admin() up front for a clear error.

-- Categories can show an icon on the storefront (a name from a fixed list in the app).
alter table public.categories add constraint categories_icon_name check (icon is null or icon ~ '^[a-z0-9-]{1,40}$');

-- ---------------------------------------------------------------------------
-- Paths of images that no product uses any more (safe to delete from Storage).
-- ---------------------------------------------------------------------------
create function public.unused_image_paths(p_paths text[]) returns text[]
language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(distinct path), '{}')
  from unnest(p_paths) as path
  where not exists (select 1 from public.product_images i where i.storage_path = path);
$$;

-- ---------------------------------------------------------------------------
-- Save a product with all its sizes and photos.
-- p: {id?, slug, category_id, name_en, name_hi, description_en, description_hi, search_keywords: [],
--     featured, active, sort_order?, variants: [{id?, unit_en, unit_hi, price, mrp, in_stock,
--     track_stock, stock_qty, low_stock_threshold, max_per_order}], images: [{storage_path, alt_en, alt_hi, is_primary}]}
-- Sizes left out are hidden (kept for price history); photos left out are removed.
-- Returns {id, slug, removed_paths}: removed_paths are Storage files no product uses any more.
-- ---------------------------------------------------------------------------
create function public.admin_save_product(p jsonb) returns jsonb
language plpgsql security invoker set search_path = public as $$
declare
  v_id uuid := nullif(p ->> 'id', '')::uuid;
  v_slug text;
  v_variant jsonb;
  v_vid uuid;
  v_keep uuid[] := '{}';
  v_image jsonb;
  v_paths text[] := '{}';
  v_old_paths text[];
  v_primary text;
  i integer := 0;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;
  if jsonb_typeof(p -> 'variants') <> 'array' or jsonb_array_length(p -> 'variants') = 0 then
    raise exception 'NO_VARIANTS';
  end if;

  if v_id is null then
    insert into public.products (slug, category_id, name_en, name_hi, description_en, description_hi,
                                 search_keywords, featured, active, sort_order)
    values (coalesce(trim(p ->> 'slug'), ''), (p ->> 'category_id')::uuid, trim(p ->> 'name_en'), trim(p ->> 'name_hi'),
            coalesce(trim(p ->> 'description_en'), ''), coalesce(trim(p ->> 'description_hi'), ''),
            coalesce(array(select trim(k) from jsonb_array_elements_text(coalesce(p -> 'search_keywords', '[]')) k where trim(k) <> ''), '{}'),
            coalesce((p ->> 'featured')::boolean, false), coalesce((p ->> 'active')::boolean, true),
            coalesce((p ->> 'sort_order')::integer, (select coalesce(max(sort_order), 0) + 10 from public.products)))
    returning id, slug into v_id, v_slug;
  else
    update public.products set
      slug = coalesce(trim(p ->> 'slug'), slug),
      category_id = (p ->> 'category_id')::uuid,
      name_en = trim(p ->> 'name_en'),
      name_hi = trim(p ->> 'name_hi'),
      description_en = coalesce(trim(p ->> 'description_en'), ''),
      description_hi = coalesce(trim(p ->> 'description_hi'), ''),
      search_keywords = coalesce(array(select trim(k) from jsonb_array_elements_text(coalesce(p -> 'search_keywords', '[]')) k where trim(k) <> ''), '{}'),
      featured = coalesce((p ->> 'featured')::boolean, featured),
      active = coalesce((p ->> 'active')::boolean, active),
      sort_order = coalesce((p ->> 'sort_order')::integer, sort_order)
    where id = v_id and deleted_at is null
    returning slug into v_slug;
    if not found then
      raise exception 'NOT_FOUND';
    end if;
  end if;

  for v_variant in select * from jsonb_array_elements(p -> 'variants') loop
    v_vid := nullif(v_variant ->> 'id', '')::uuid;
    if v_vid is not null then
      update public.product_variants set
        unit_en = trim(v_variant ->> 'unit_en'),
        unit_hi = trim(v_variant ->> 'unit_hi'),
        price = (v_variant ->> 'price')::integer,
        mrp = nullif(v_variant ->> 'mrp', '')::integer,
        in_stock = coalesce((v_variant ->> 'in_stock')::boolean, true),
        track_stock = coalesce((v_variant ->> 'track_stock')::boolean, false),
        stock_qty = nullif(v_variant ->> 'stock_qty', '')::integer,
        low_stock_threshold = coalesce((v_variant ->> 'low_stock_threshold')::integer, 5),
        max_per_order = coalesce((v_variant ->> 'max_per_order')::integer, 20),
        sort_order = i,
        active = true,
        deleted_at = null
      where id = v_vid and product_id = v_id;
      if not found then
        raise exception 'VARIANT_NOT_FOUND';
      end if;
    else
      insert into public.product_variants (product_id, unit_en, unit_hi, price, mrp, in_stock, track_stock, stock_qty,
                                           low_stock_threshold, max_per_order, sort_order)
      values (v_id, trim(v_variant ->> 'unit_en'), trim(v_variant ->> 'unit_hi'), (v_variant ->> 'price')::integer,
              nullif(v_variant ->> 'mrp', '')::integer, coalesce((v_variant ->> 'in_stock')::boolean, true),
              coalesce((v_variant ->> 'track_stock')::boolean, false), nullif(v_variant ->> 'stock_qty', '')::integer,
              coalesce((v_variant ->> 'low_stock_threshold')::integer, 5), coalesce((v_variant ->> 'max_per_order')::integer, 20), i)
      returning id into v_vid;
    end if;
    v_keep := v_keep || v_vid;
    i := i + 1;
  end loop;

  update public.product_variants set active = false, deleted_at = now()
  where product_id = v_id and deleted_at is null and not (id = any (v_keep));

  -- Photos: only touch rows that changed (keeps the activity log readable). One is primary:
  -- the one marked, else the first.
  select coalesce(array_agg(storage_path), '{}') into v_old_paths from public.product_images where product_id = v_id;
  select coalesce(array_agg(e ->> 'storage_path' order by n), '{}') into v_paths
  from jsonb_array_elements(coalesce(p -> 'images', '[]')) with ordinality as x(e, n);
  select coalesce((select e ->> 'storage_path' from jsonb_array_elements(coalesce(p -> 'images', '[]')) e
                   where (e ->> 'is_primary')::boolean limit 1), v_paths[1])
  into v_primary;

  delete from public.product_images where product_id = v_id and not (storage_path = any (v_paths));
  update public.product_images set is_primary = false
  where product_id = v_id and is_primary and storage_path is distinct from v_primary;
  i := 0;
  for v_image in select * from jsonb_array_elements(coalesce(p -> 'images', '[]')) loop
    if exists (select 1 from public.product_images where product_id = v_id and storage_path = v_image ->> 'storage_path') then
      update public.product_images set
        sort_order = i,
        is_primary = (storage_path = v_primary),
        alt_en = coalesce(v_image ->> 'alt_en', alt_en),
        alt_hi = coalesce(v_image ->> 'alt_hi', alt_hi)
      where product_id = v_id and storage_path = v_image ->> 'storage_path'
        and (sort_order, is_primary, alt_en, alt_hi) is distinct from
            (i, storage_path = v_primary, coalesce(v_image ->> 'alt_en', alt_en), coalesce(v_image ->> 'alt_hi', alt_hi));
    else
      insert into public.product_images (product_id, storage_path, alt_en, alt_hi, is_primary, sort_order)
      values (v_id, v_image ->> 'storage_path', coalesce(v_image ->> 'alt_en', ''), coalesce(v_image ->> 'alt_hi', ''),
              v_image ->> 'storage_path' = v_primary, i);
    end if;
    i := i + 1;
  end loop;

  return jsonb_build_object('id', v_id, 'slug', v_slug,
    'removed_paths', to_jsonb(public.unused_image_paths(array(select unnest(v_old_paths) except select unnest(v_paths)))));
end;
$$;

-- ---------------------------------------------------------------------------
-- Delete a product. It is kept in the database (hidden, slug freed) so past orders and price
-- history stay intact; its photos are removed. Returns Storage files no product uses any more.
-- ---------------------------------------------------------------------------
create function public.admin_delete_product(p_id uuid) returns text[]
language plpgsql security invoker set search_path = public as $$
declare
  v_paths text[];
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;
  select coalesce(array_agg(storage_path), '{}') into v_paths from public.product_images where product_id = p_id;
  delete from public.product_images where product_id = p_id;
  update public.products
  set deleted_at = now(), active = false, featured = false, slug = slug || '-deleted-' || left(id::text, 8)
  where id = p_id and deleted_at is null;
  if not found then
    raise exception 'NOT_FOUND';
  end if;
  return public.unused_image_paths(v_paths);
end;
$$;

-- ---------------------------------------------------------------------------
-- Change prices of many sizes by a percentage, rounded to whole rupees.
-- Refuses (changing nothing) if any new price would be above that size's MRP.
-- ---------------------------------------------------------------------------
create function public.admin_adjust_prices(p_variant_ids uuid[], p_percent numeric) returns integer
language plpgsql security invoker set search_path = public as $$
declare
  v_over text;
  v_count integer;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;
  if p_percent is null or p_percent < -90 or p_percent > 500 or p_percent = 0 then
    raise exception 'INVALID_PERCENT';
  end if;
  select string_agg(p.name_en || ' (' || v.unit_en || ')', ', ') into v_over
  from public.product_variants v join public.products p on p.id = v.product_id
  where v.id = any (p_variant_ids) and v.mrp is not null and round(v.price * (1 + p_percent / 100.0)) > v.mrp;
  if v_over is not null then
    raise exception 'PRICE_ABOVE_MRP' using detail = v_over;
  end if;
  update public.product_variants
  set price = greatest(round(price * (1 + p_percent / 100.0))::integer, 0)
  where id = any (p_variant_ids) and deleted_at is null;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
create function public.admin_reorder_categories(p_ids uuid[]) returns void
language plpgsql security invoker set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;
  update public.categories c set sort_order = x.n * 10
  from unnest(p_ids) with ordinality as x(id, n)
  where c.id = x.id;
end;
$$;

-- Refuses while the category still has products (they must be moved first). Products that were
-- deleted earlier are removed for good, since nothing can show them any more.
create function public.admin_delete_category(p_id uuid) returns void
language plpgsql security invoker set search_path = public as $$
declare
  v_count integer;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;
  select count(*) into v_count from public.products where category_id = p_id and deleted_at is null;
  if v_count > 0 then
    raise exception 'CATEGORY_NOT_EMPTY' using detail = v_count::text;
  end if;
  delete from public.products where category_id = p_id;
  delete from public.categories where id = p_id;
  if not found then
    raise exception 'NOT_FOUND';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- CSV import: one row per size. Rows with variant_id update that size; others match by product
-- slug and unit, or create the product and size. All rows succeed or nothing changes; an error
-- names the row (counting the first data row as 1).
-- ---------------------------------------------------------------------------
create function public.admin_import_products(p_rows jsonb) returns jsonb
language plpgsql security invoker set search_path = public as $$
declare
  v_row jsonb;
  n integer := 0;
  v_category uuid;
  v_product uuid;
  v_variant uuid;
  v_seen uuid[] := '{}';
  v_created_products integer := 0;
  v_created_variants integer := 0;
  v_updated_variants integer := 0;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 or jsonb_array_length(p_rows) > 2000 then
    raise exception 'INVALID_IMPORT';
  end if;

  for v_row in select * from jsonb_array_elements(p_rows) loop
    n := n + 1;
    begin
      select id into v_category from public.categories where slug = v_row ->> 'category_slug';
      if v_category is null then
        raise exception 'unknown category "%"', v_row ->> 'category_slug';
      end if;

      select id into v_product from public.products where slug = v_row ->> 'product_slug' and deleted_at is null;
      if v_product is null then
        insert into public.products (slug, category_id, name_en, name_hi, description_en, description_hi,
                                     search_keywords, featured, active, sort_order)
        values (v_row ->> 'product_slug', v_category, trim(v_row ->> 'name_en'), trim(v_row ->> 'name_hi'),
                coalesce(trim(v_row ->> 'description_en'), ''), coalesce(trim(v_row ->> 'description_hi'), ''),
                coalesce(array(select trim(k) from jsonb_array_elements_text(coalesce(v_row -> 'keywords', '[]')) k where trim(k) <> ''), '{}'),
                coalesce((v_row ->> 'featured')::boolean, false), coalesce((v_row ->> 'active')::boolean, true),
                (select coalesce(max(sort_order), 0) + 10 from public.products))
        returning id into v_product;
        v_created_products := v_created_products + 1;
      elsif not (v_product = any (v_seen)) then
        -- Product details come from the first row of each product.
        update public.products set
          category_id = v_category,
          name_en = trim(v_row ->> 'name_en'),
          name_hi = trim(v_row ->> 'name_hi'),
          description_en = coalesce(trim(v_row ->> 'description_en'), ''),
          description_hi = coalesce(trim(v_row ->> 'description_hi'), ''),
          search_keywords = coalesce(array(select trim(k) from jsonb_array_elements_text(coalesce(v_row -> 'keywords', '[]')) k where trim(k) <> ''), '{}'),
          featured = coalesce((v_row ->> 'featured')::boolean, featured),
          active = coalesce((v_row ->> 'active')::boolean, active)
        where id = v_product;
      end if;
      v_seen := v_seen || v_product;

      v_variant := nullif(v_row ->> 'variant_id', '')::uuid;
      if v_variant is null then
        select id into v_variant from public.product_variants
        where product_id = v_product and lower(unit_en) = lower(trim(v_row ->> 'unit_en')) and deleted_at is null;
      elsif not exists (select 1 from public.product_variants where id = v_variant and product_id = v_product) then
        raise exception 'variant_id does not belong to product "%"', v_row ->> 'product_slug';
      end if;

      if v_variant is null then
        insert into public.product_variants (product_id, unit_en, unit_hi, price, mrp, in_stock, track_stock, stock_qty, max_per_order, sort_order)
        values (v_product, trim(v_row ->> 'unit_en'), trim(v_row ->> 'unit_hi'), (v_row ->> 'price')::integer,
                nullif(v_row ->> 'mrp', '')::integer, coalesce((v_row ->> 'in_stock')::boolean, true),
                coalesce((v_row ->> 'track_stock')::boolean, false), nullif(v_row ->> 'stock_qty', '')::integer,
                coalesce((v_row ->> 'max_per_order')::integer, 20),
                (select coalesce(max(sort_order), -1) + 1 from public.product_variants where product_id = v_product));
        v_created_variants := v_created_variants + 1;
      else
        update public.product_variants set
          unit_en = trim(v_row ->> 'unit_en'),
          unit_hi = trim(v_row ->> 'unit_hi'),
          price = (v_row ->> 'price')::integer,
          mrp = nullif(v_row ->> 'mrp', '')::integer,
          in_stock = coalesce((v_row ->> 'in_stock')::boolean, in_stock),
          track_stock = coalesce((v_row ->> 'track_stock')::boolean, track_stock),
          stock_qty = nullif(v_row ->> 'stock_qty', '')::integer,
          max_per_order = coalesce((v_row ->> 'max_per_order')::integer, max_per_order),
          active = true,
          deleted_at = null
        where id = v_variant;
        v_updated_variants := v_updated_variants + 1;
      end if;
    exception when others then
      raise exception 'IMPORT_ROW' using detail = jsonb_build_object('row', n, 'error', sqlerrm)::text;
    end;
  end loop;

  return jsonb_build_object('created_products', v_created_products, 'created_variants', v_created_variants,
                            'updated_variants', v_updated_variants);
end;
$$;

-- ---------------------------------------------------------------------------
-- Price history for one product, with the admin's display name.
-- ---------------------------------------------------------------------------
create function public.admin_price_history(p_product_id uuid)
returns table (variant_id uuid, unit_en text, old_price integer, new_price integer, old_mrp integer, new_mrp integer,
               changed_at timestamptz, changed_by_name text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;
  return query
    select ph.variant_id, v.unit_en, ph.old_price, ph.new_price, ph.old_mrp, ph.new_mrp, ph.changed_at,
           coalesce(nullif(a.display_name, ''), case when ph.changed_by is null then 'System' else 'Admin' end)
    from public.price_history ph
    join public.product_variants v on v.id = ph.variant_id
    left join public.admin_users a on a.user_id = ph.changed_by
    where v.product_id = p_product_id
    order by ph.changed_at desc, ph.id desc
    limit 200;
end;
$$;

-- Admin save/delete run with the caller's rights and need this helper; it only says whether a path is used.
revoke execute on function public.unused_image_paths(text[]) from public, anon;
grant execute on function public.unused_image_paths(text[]) to authenticated;
revoke execute on function public.admin_save_product(jsonb) from public, anon;
revoke execute on function public.admin_delete_product(uuid) from public, anon;
revoke execute on function public.admin_adjust_prices(uuid[], numeric) from public, anon;
revoke execute on function public.admin_reorder_categories(uuid[]) from public, anon;
revoke execute on function public.admin_delete_category(uuid) from public, anon;
revoke execute on function public.admin_import_products(jsonb) from public, anon;
revoke execute on function public.admin_price_history(uuid) from public, anon;
grant execute on function public.admin_save_product(jsonb) to authenticated;
grant execute on function public.admin_delete_product(uuid) to authenticated;
grant execute on function public.admin_adjust_prices(uuid[], numeric) to authenticated;
grant execute on function public.admin_reorder_categories(uuid[]) to authenticated;
grant execute on function public.admin_delete_category(uuid) to authenticated;
grant execute on function public.admin_import_products(jsonb) to authenticated;
grant execute on function public.admin_price_history(uuid) to authenticated;
