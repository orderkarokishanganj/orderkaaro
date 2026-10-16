-- Admin functions for orders, the dashboard, customers, admins and the activity log.
-- Dates are counted in India time (Asia/Kolkata).

-- ---------------------------------------------------------------------------
-- Status changes can carry a note (e.g. "customer asked to deliver after 6 PM").
-- The note is passed through a transaction-local setting read by the status trigger.
-- ---------------------------------------------------------------------------
create or replace function public.handle_order_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if old.status in ('delivered', 'cancelled')
     or (new.status <> 'cancelled' and public.order_status_rank(new.status) < public.order_status_rank(old.status)) then
    raise exception 'INVALID_STATUS_CHANGE' using detail = format('Cannot change an order from %s to %s.', old.status, new.status);
  end if;

  if new.status = 'cancelled' then
    new.cancelled_at := coalesce(new.cancelled_at, now());
    if old.stock_applied then
      update public.product_variants v
      set stock_qty = v.stock_qty + i.quantity
      from public.order_items i
      where i.order_id = new.id and i.variant_id = v.id and v.track_stock;
      new.stock_applied := false;
    end if;
  else
    if public.order_status_rank(new.status) >= 1 then
      new.confirmed_at := coalesce(new.confirmed_at, now());
    end if;
    if public.order_status_rank(new.status) >= 2 then
      new.out_for_delivery_at := coalesce(new.out_for_delivery_at, now());
    end if;
    if new.status = 'delivered' then
      new.delivered_at := coalesce(new.delivered_at, now());
    end if;
    if not old.stock_applied then
      update public.product_variants v
      set stock_qty = greatest(v.stock_qty - i.quantity, 0)
      from public.order_items i
      where i.order_id = new.id and i.variant_id = v.id and v.track_stock;
      new.stock_applied := true;
    end if;
  end if;

  insert into public.order_status_history (order_id, from_status, to_status, changed_by, note)
  values (new.id, old.status, new.status, auth.uid(), left(coalesce(current_setting('ok.status_note', true), ''), 300));
  return new;
end;
$$;

create function public.admin_set_order_status(p_order_id uuid, p_status public.order_status, p_note text default '')
returns void
language plpgsql security invoker set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;
  perform set_config('ok.status_note', coalesce(p_note, ''), true);
  update public.orders set status = p_status where id = p_order_id;
  if not found then
    raise exception 'NOT_FOUND';
  end if;
  perform set_config('ok.status_note', '', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- Edit an order's items (e.g. swap an out-of-stock item). Allowed while the order is new or
-- confirmed. p_items: [{line_id, quantity}] keeps an existing line (price at order time) with a
-- new quantity; [{variant_id, quantity}] adds a line at today's price. Lines left out are removed.
-- Subtotal, delivery fee (current tiers), coupon discount and stock are all recalculated.
-- ---------------------------------------------------------------------------
-- Runs with elevated rights (it also updates coupon usage, which admins cannot write directly);
-- the is_admin() check below guards it.
create function public.admin_update_order_items(p_order_id uuid, p_items jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders;
  v_item jsonb;
  v_keep uuid[] := '{}';
  v_line uuid;
  v_qty integer;
  v_variant record;
  v_subtotal integer;
  v_fee integer;
  v_discount integer;
  v_coupon public.coupons;
  s public.settings;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_ORDER';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'NOT_FOUND';
  end if;
  if v_order.status not in ('new', 'confirmed') then
    raise exception 'ORDER_LOCKED';
  end if;

  -- Give back stock for the old items; the new items take it again below.
  if v_order.stock_applied then
    update public.product_variants v set stock_qty = v.stock_qty + i.quantity
    from public.order_items i where i.order_id = p_order_id and i.variant_id = v.id and v.track_stock;
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'quantity')::integer;
    if v_qty is null or v_qty < 1 or v_qty > 999 then
      raise exception 'INVALID_QUANTITY';
    end if;
    v_line := nullif(v_item ->> 'line_id', '')::uuid;
    if v_line is not null then
      update public.order_items set quantity = v_qty, line_total = unit_price * v_qty
      where id = v_line and order_id = p_order_id and quantity is distinct from v_qty;
      if not exists (select 1 from public.order_items where id = v_line and order_id = p_order_id) then
        raise exception 'LINE_NOT_FOUND';
      end if;
      v_keep := v_keep || v_line;
    else
      select v.id, v.product_id, p.name_en, p.name_hi, v.unit_en, v.unit_hi, v.price, v.mrp into v_variant
      from public.product_variants v join public.products p on p.id = v.product_id
      where v.id = (v_item ->> 'variant_id')::uuid and v.deleted_at is null and p.deleted_at is null;
      if v_variant.id is null then
        raise exception 'VARIANT_NOT_FOUND';
      end if;
      insert into public.order_items (order_id, product_id, variant_id, name_en, name_hi, unit_en, unit_hi, unit_price, mrp, quantity, line_total)
      values (p_order_id, v_variant.product_id, v_variant.id, v_variant.name_en, v_variant.name_hi, v_variant.unit_en, v_variant.unit_hi,
              v_variant.price, v_variant.mrp, v_qty, v_variant.price * v_qty)
      returning id into v_line;
      v_keep := v_keep || v_line;
    end if;
  end loop;

  delete from public.order_items where order_id = p_order_id and not (id = any (v_keep));

  select coalesce(sum(line_total), 0) into v_subtotal from public.order_items where order_id = p_order_id;
  select * into s from public.settings where id;
  v_fee := public.delivery_fee_for(v_subtotal, s.delivery_tiers);
  if v_order.coupon_id is not null then
    select * into v_coupon from public.coupons where id = v_order.coupon_id;
    v_discount := case
      when v_coupon.type = 'percent' then least(round(v_subtotal * v_coupon.value / 100.0)::integer, coalesce(v_coupon.max_discount, v_subtotal))
      else least(v_coupon.value, v_subtotal) end;
  else
    v_discount := least(v_order.discount, v_subtotal);
  end if;

  update public.orders set subtotal = v_subtotal, delivery_fee = v_fee, discount = v_discount, total = v_subtotal + v_fee - v_discount
  where id = p_order_id;
  update public.coupon_redemptions set discount = v_discount where order_id = p_order_id;

  if v_order.stock_applied then
    update public.product_variants v set stock_qty = greatest(v.stock_qty - i.quantity, 0)
    from public.order_items i where i.order_id = p_order_id and i.variant_id = v.id and v.track_stock;
  end if;

  return jsonb_build_object('subtotal', v_subtotal, 'delivery_fee', v_fee, 'discount', v_discount, 'total', v_subtotal + v_fee - v_discount);
end;
$$;

-- ---------------------------------------------------------------------------
-- Dashboard numbers. Revenue leaves out cancelled orders.
-- ---------------------------------------------------------------------------
create function public.admin_dashboard() returns jsonb
language plpgsql stable security invoker set search_path = public as $$
declare
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;

  with o as (
    select *, (created_at at time zone 'Asia/Kolkata')::date as day from public.orders
  ), sellable as (
    select v.*, p.name_en as product_name
    from public.product_variants v join public.products p on p.id = v.product_id
    where v.deleted_at is null and p.deleted_at is null
  )
  select jsonb_build_object(
    'today_orders', (select count(*) from o where day = v_today),
    'today_revenue', (select coalesce(sum(total), 0) from o where day = v_today and status <> 'cancelled'),
    'week_revenue', (select coalesce(sum(total), 0) from o where day > v_today - 7 and status <> 'cancelled'),
    'month_revenue', (select coalesce(sum(total), 0) from o where day >= date_trunc('month', v_today)::date and status <> 'cancelled'),
    'new_orders', (select count(*) from o where status = 'new'),
    'pending_orders', (select count(*) from o where status in ('new', 'confirmed', 'out_for_delivery')),
    'out_of_stock', (select count(*) from sellable where not in_stock or (track_stock and stock_qty <= 0)),
    'low_stock', (select coalesce(jsonb_agg(jsonb_build_object('product_id', product_id, 'name', product_name, 'unit', unit_en, 'stock_qty', stock_qty) order by stock_qty), '[]')
                  from sellable where track_stock and stock_qty > 0 and stock_qty <= low_stock_threshold and in_stock),
    'top_products', (select coalesce(jsonb_agg(t), '[]') from (
                       select i.name_en as name, i.unit_en as unit, sum(i.quantity)::integer as quantity, sum(i.line_total)::integer as revenue
                       from public.order_items i join public.orders x on x.id = i.order_id
                       where x.status <> 'cancelled' and x.created_at > now() - interval '30 days'
                       group by i.name_en, i.unit_en order by sum(i.quantity) desc, sum(i.line_total) desc limit 5) t),
    'daily', (select jsonb_agg(jsonb_build_object('day', d.day, 'orders', coalesce(c.orders, 0), 'revenue', coalesce(c.revenue, 0)) order by d.day)
              from (select (v_today - g)::date as day from generate_series(0, 29) g) d
              left join (select day, count(*) as orders, coalesce(sum(total) filter (where status <> 'cancelled'), 0) as revenue from o group by day) c on c.day = d.day),
    'recent', (select coalesce(jsonb_agg(r), '[]') from (
                 select id, order_number, customer_name, total, status, created_at from public.orders order by created_at desc limit 8) r)
  ) into v_result;
  return v_result;
end;
$$;

-- ---------------------------------------------------------------------------
-- Customers, built from orders (no customer accounts). One row per phone number.
-- ---------------------------------------------------------------------------
create function public.admin_customers(p_search text default null)
returns table (phone text, name text, address text, landmark text, orders integer, total_spent integer, last_order_at timestamptz)
language plpgsql stable security invoker set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;
  -- Group every order first, then search, so totals always cover all of a customer's orders.
  return query
    with c as (
      select o.customer_phone as phone,
             (array_agg(o.customer_name order by o.created_at desc))[1] as name,
             (array_agg(o.address order by o.created_at desc))[1] as address,
             (array_agg(o.landmark order by o.created_at desc))[1] as landmark,
             count(*)::integer as orders,
             coalesce(sum(o.total) filter (where o.status <> 'cancelled'), 0)::integer as total_spent,
             max(o.created_at) as last_order_at,
             string_agg(distinct o.customer_name, ' ') as all_names
      from public.orders o
      group by o.customer_phone
    )
    select c.phone, c.name, c.address, c.landmark, c.orders, c.total_spent, c.last_order_at
    from c
    where p_search is null or trim(p_search) = ''
       or c.all_names ilike '%' || trim(p_search) || '%'
       or (regexp_replace(p_search, '\D', '', 'g') <> '' and c.phone like '%' || regexp_replace(p_search, '\D', '', 'g') || '%')
    order by c.last_order_at desc
    limit 1000;
end;
$$;

-- ---------------------------------------------------------------------------
-- Coupon usage (cancelled orders do not count).
-- ---------------------------------------------------------------------------
create function public.admin_coupon_stats()
returns table (coupon_id uuid, uses integer, discount_total integer)
language plpgsql stable security invoker set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;
  return query
    select r.coupon_id, count(*)::integer, coalesce(sum(r.discount), 0)::integer
    from public.coupon_redemptions r join public.orders o on o.id = r.order_id
    where o.status <> 'cancelled'
    group by r.coupon_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin accounts (owners only). Logins themselves are created in Supabase Authentication.
-- ---------------------------------------------------------------------------
create function public.admin_list_admins()
returns table (user_id uuid, email text, role public.admin_role, display_name text, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then
    raise exception 'NOT_OWNER';
  end if;
  return query
    select a.user_id, u.email::text, a.role, a.display_name, a.created_at
    from public.admin_users a join auth.users u on u.id = a.user_id
    order by a.role, u.email;
end;
$$;

create function public.admin_add_admin(p_email text, p_role public.admin_role, p_name text default '')
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid;
begin
  if not public.is_owner() then
    raise exception 'NOT_OWNER';
  end if;
  select id into v_user from auth.users where lower(email) = lower(trim(p_email));
  if v_user is null then
    raise exception 'USER_NOT_FOUND';
  end if;
  insert into public.admin_users (user_id, role, display_name)
  values (v_user, p_role, left(coalesce(trim(p_name), ''), 80))
  on conflict (user_id) do update set role = excluded.role, display_name = excluded.display_name;
  return v_user;
end;
$$;

-- ---------------------------------------------------------------------------
-- Activity log with who did it (owners only), newest first, page by page.
-- ---------------------------------------------------------------------------
create function public.admin_activity_log(p_table text default null, p_before timestamptz default null, p_limit integer default 50)
returns table (id bigint, created_at timestamptz, actor_name text, actor_email text, table_name text, record_id text, action text, changes jsonb)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then
    raise exception 'NOT_OWNER';
  end if;
  return query
    select l.id, l.created_at, coalesce(nullif(a.display_name, ''), u.email::text, 'System'), u.email::text,
           l.table_name, l.record_id, l.action, l.changes
    from public.activity_log l
    left join public.admin_users a on a.user_id = l.actor
    left join auth.users u on u.id = l.actor
    where (p_table is null or l.table_name = p_table)
      and (p_before is null or l.created_at < p_before)
    order by l.created_at desc, l.id desc
    limit least(greatest(coalesce(p_limit, 50), 1), 200);
end;
$$;

revoke execute on function public.admin_set_order_status(uuid, public.order_status, text) from public, anon;
revoke execute on function public.admin_update_order_items(uuid, jsonb) from public, anon;
revoke execute on function public.admin_dashboard() from public, anon;
revoke execute on function public.admin_customers(text) from public, anon;
revoke execute on function public.admin_coupon_stats() from public, anon;
revoke execute on function public.admin_list_admins() from public, anon;
revoke execute on function public.admin_add_admin(text, public.admin_role, text) from public, anon;
revoke execute on function public.admin_activity_log(text, timestamptz, integer) from public, anon;
grant execute on function public.admin_set_order_status(uuid, public.order_status, text) to authenticated;
grant execute on function public.admin_update_order_items(uuid, jsonb) to authenticated;
grant execute on function public.admin_dashboard() to authenticated;
grant execute on function public.admin_customers(text) to authenticated;
grant execute on function public.admin_coupon_stats() to authenticated;
grant execute on function public.admin_list_admins() to authenticated;
grant execute on function public.admin_add_admin(text, public.admin_role, text) to authenticated;
grant execute on function public.admin_activity_log(text, timestamptz, integer) to authenticated;
