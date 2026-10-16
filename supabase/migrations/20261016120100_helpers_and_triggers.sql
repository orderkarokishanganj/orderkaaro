-- Helper functions and triggers: timestamps, slugs, admin checks, delivery fees,
-- price history, activity log, owner protection, order status workflow and stock.

-- ---------------------------------------------------------------------------
-- Generic helpers
-- ---------------------------------------------------------------------------
create function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create function public.slugify(value text) returns text
language sql immutable as $$
  select coalesce(nullif(trim(both '-' from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g')), ''), 'item');
$$;

-- Fill products.slug from the English name when it is left empty, adding -2, -3... if taken.
create function public.products_fill_slug() returns trigger
language plpgsql as $$
declare
  base text;
  candidate text;
  n integer := 1;
begin
  if new.slug is null or new.slug = '' then
    base := public.slugify(new.name_en);
    candidate := base;
    while exists (select 1 from public.products p where p.slug = candidate and p.id <> new.id) loop
      n := n + 1;
      candidate := base || '-' || n;
    end loop;
    new.slug := candidate;
  end if;
  return new;
end;
$$;

create trigger products_fill_slug before insert or update of slug, name_en on public.products
  for each row execute function public.products_fill_slug();

-- ---------------------------------------------------------------------------
-- Admin checks (used by row level security)
-- ---------------------------------------------------------------------------
create function public.current_admin_role() returns public.admin_role
language sql stable security definer set search_path = public as $$
  select role from public.admin_users where user_id = auth.uid();
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid() and role = 'owner');
$$;

-- ---------------------------------------------------------------------------
-- Delivery fees. src/lib/pricing.ts implements the same rule; tests keep them in step.
-- ---------------------------------------------------------------------------
create function public.valid_delivery_tiers(tiers jsonb) returns boolean
language plpgsql immutable as $$
declare
  tier jsonb;
  has_zero boolean := false;
begin
  if jsonb_typeof(tiers) <> 'array' or jsonb_array_length(tiers) = 0 or jsonb_array_length(tiers) > 10 then
    return false;
  end if;
  for tier in select * from jsonb_array_elements(tiers) loop
    if jsonb_typeof(tier -> 'min') <> 'number' or jsonb_typeof(tier -> 'fee') <> 'number'
       or (tier ->> 'min')::numeric < 0 or (tier ->> 'fee')::numeric < 0
       or (tier ->> 'min')::numeric <> trunc((tier ->> 'min')::numeric)
       or (tier ->> 'fee')::numeric <> trunc((tier ->> 'fee')::numeric) then
      return false;
    end if;
    if (tier ->> 'min')::integer = 0 then
      has_zero := true;
    end if;
  end loop;
  return has_zero;
end;
$$;

alter table public.settings
  add constraint settings_delivery_tiers_valid check (public.valid_delivery_tiers(delivery_tiers));

create function public.delivery_fee_for(subtotal integer, tiers jsonb) returns integer
language sql immutable as $$
  select case
    when subtotal <= 0 then 0
    else coalesce((
      select (t ->> 'fee')::integer
      from jsonb_array_elements(tiers) t
      where (t ->> 'min')::integer <= subtotal
      order by (t ->> 'min')::integer desc
      limit 1
    ), 0)
  end;
$$;

-- ---------------------------------------------------------------------------
-- Price history: every change to a variant's price or MRP.
-- ---------------------------------------------------------------------------
create function public.record_price_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.price is distinct from old.price or new.mrp is distinct from old.mrp then
    insert into public.price_history (variant_id, old_price, new_price, old_mrp, new_mrp, changed_by)
    values (new.id, old.price, new.price, old.mrp, new.mrp, auth.uid());
  end if;
  return new;
end;
$$;

create trigger product_variants_price_history after update of price, mrp on public.product_variants
  for each row execute function public.record_price_change();

-- ---------------------------------------------------------------------------
-- Activity log: who changed what, for the owner's audit screen.
-- ---------------------------------------------------------------------------
create function public.log_activity() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  diff jsonb := '{}';
  old_row jsonb;
  new_row jsonb;
  key text;
begin
  -- Only admin actions are logged; seed imports and maintenance scripts run without a user.
  if auth.uid() is null then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    old_row := to_jsonb(old);
    new_row := to_jsonb(new);
    for key in select jsonb_object_keys(new_row) loop
      if key not in ('updated_at') and new_row -> key is distinct from old_row -> key then
        diff := diff || jsonb_build_object(key, jsonb_build_object('old', old_row -> key, 'new', new_row -> key));
      end if;
    end loop;
    if diff = '{}' then
      return new;
    end if;
    insert into public.activity_log (actor, table_name, record_id, action, changes)
    values (auth.uid(), tg_table_name, new_row ->> coalesce(tg_argv[0], 'id'), 'update', diff);
    return new;
  elsif tg_op = 'INSERT' then
    new_row := to_jsonb(new);
    insert into public.activity_log (actor, table_name, record_id, action, changes)
    values (auth.uid(), tg_table_name, new_row ->> coalesce(tg_argv[0], 'id'), 'insert', new_row);
    return new;
  else
    old_row := to_jsonb(old);
    insert into public.activity_log (actor, table_name, record_id, action, changes)
    values (auth.uid(), tg_table_name, old_row ->> coalesce(tg_argv[0], 'id'), 'delete', old_row);
    return old;
  end if;
end;
$$;

create trigger categories_activity after insert or update or delete on public.categories
  for each row execute function public.log_activity();
create trigger products_activity after insert or update or delete on public.products
  for each row execute function public.log_activity();
create trigger product_variants_activity after insert or update or delete on public.product_variants
  for each row execute function public.log_activity();
create trigger product_images_activity after insert or update or delete on public.product_images
  for each row execute function public.log_activity();
create trigger coupons_activity after insert or update or delete on public.coupons
  for each row execute function public.log_activity();
create trigger settings_activity after update on public.settings
  for each row execute function public.log_activity();
create trigger admin_users_activity after insert or update or delete on public.admin_users
  for each row execute function public.log_activity('user_id');
-- Orders are created by customers through place_order(); only admin changes are logged.
create trigger orders_activity after update on public.orders
  for each row execute function public.log_activity();
create trigger order_items_activity after insert or update or delete on public.order_items
  for each row execute function public.log_activity();

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------
create trigger admin_users_updated_at before update on public.admin_users
  for each row execute function public.set_updated_at();
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger product_variants_updated_at before update on public.product_variants
  for each row execute function public.set_updated_at();
create trigger settings_updated_at before update on public.settings
  for each row execute function public.set_updated_at();
create trigger coupons_updated_at before update on public.coupons
  for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Never leave the shop without an owner.
-- ---------------------------------------------------------------------------
create function public.protect_last_owner() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.role = 'owner' and (tg_op = 'DELETE' or new.role <> 'owner') then
    if (select count(*) from public.admin_users where role = 'owner' and user_id <> old.user_id) = 0 then
      raise exception 'LAST_OWNER' using detail = 'Add another owner before removing or demoting this one.';
    end if;
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger admin_users_protect_last_owner before update or delete on public.admin_users
  for each row execute function public.protect_last_owner();

-- ---------------------------------------------------------------------------
-- Order numbers: OK + date in India + daily count, e.g. OK261016-007.
-- ---------------------------------------------------------------------------
create function public.next_order_number() returns text
language plpgsql security definer set search_path = public as $$
declare
  today date := (now() at time zone 'Asia/Kolkata')::date;
  n integer;
begin
  insert into public.order_counters as c (day, last_number) values (today, 1)
  on conflict (day) do update set last_number = c.last_number + 1
  returning last_number into n;
  return 'OK' || to_char(today, 'YYMMDD') || '-' || lpad(n::text, 3, '0');
end;
$$;

-- ---------------------------------------------------------------------------
-- Order status workflow: new -> confirmed -> out_for_delivery -> delivered, or cancelled.
-- Steps can be skipped forwards but never undone; delivered and cancelled are final.
-- Stock on tracked variants is taken when an order leaves "new" and given back on cancel.
-- ---------------------------------------------------------------------------
create function public.order_status_rank(s public.order_status) returns integer
language sql immutable as $$
  select case s when 'new' then 0 when 'confirmed' then 1 when 'out_for_delivery' then 2 when 'delivered' then 3 else 99 end;
$$;

create function public.handle_order_status() returns trigger
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

  insert into public.order_status_history (order_id, from_status, to_status, changed_by)
  values (new.id, old.status, new.status, auth.uid());
  return new;
end;
$$;

create trigger orders_status_workflow before update of status on public.orders
  for each row execute function public.handle_order_status();
