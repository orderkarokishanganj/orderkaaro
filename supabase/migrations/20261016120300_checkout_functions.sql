-- Checkout: server-side cart pricing, coupon validation and order placement.
-- The storefront never decides prices: it calls quote_cart() to show the cart and
-- place_order() to save it. Errors are raised with a short code as the message
-- (e.g. CART_CHANGED) and, where useful, a fresh quote as JSON in the detail.

create function public.normalize_phone(value text) returns text
language sql immutable as $$
  select case
    when d ~ '^91[0-9]{10}$' then substr(d, 3)
    when d ~ '^0[0-9]{10}$' then substr(d, 2)
    else d
  end
  from (select regexp_replace(coalesce(value, ''), '[^0-9]', '', 'g') as d) x;
$$;

-- ---------------------------------------------------------------------------
-- Coupons
-- ---------------------------------------------------------------------------
create function public.coupon_check(p_code text, p_subtotal integer, p_phone text)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  c public.coupons;
  v_code text := upper(trim(coalesce(p_code, '')));
  used integer;
  disc integer;
begin
  select * into c from public.coupons where code = v_code;
  if not found or not c.active then
    return jsonb_build_object('valid', false, 'code', v_code, 'reason', 'COUPON_INVALID', 'discount', 0);
  end if;
  if c.starts_at is not null and now() < c.starts_at then
    return jsonb_build_object('valid', false, 'code', v_code, 'reason', 'COUPON_NOT_STARTED', 'discount', 0);
  end if;
  if c.expires_at is not null and now() >= c.expires_at then
    return jsonb_build_object('valid', false, 'code', v_code, 'reason', 'COUPON_EXPIRED', 'discount', 0);
  end if;
  if p_subtotal < c.min_order then
    return jsonb_build_object('valid', false, 'code', v_code, 'reason', 'COUPON_MIN_ORDER', 'discount', 0, 'min_order', c.min_order);
  end if;
  if c.usage_limit_total is not null then
    select count(*) into used
    from public.coupon_redemptions r join public.orders o on o.id = r.order_id
    where r.coupon_id = c.id and o.status <> 'cancelled';
    if used >= c.usage_limit_total then
      return jsonb_build_object('valid', false, 'code', v_code, 'reason', 'COUPON_USED_UP', 'discount', 0);
    end if;
  end if;
  if c.usage_limit_per_phone is not null and p_phone is not null and p_phone <> '' then
    select count(*) into used
    from public.coupon_redemptions r join public.orders o on o.id = r.order_id
    where r.coupon_id = c.id and r.customer_phone = public.normalize_phone(p_phone) and o.status <> 'cancelled';
    if used >= c.usage_limit_per_phone then
      return jsonb_build_object('valid', false, 'code', v_code, 'reason', 'COUPON_PHONE_LIMIT', 'discount', 0);
    end if;
  end if;

  if c.type = 'percent' then
    disc := least(round(p_subtotal * c.value / 100.0)::integer, coalesce(c.max_discount, p_subtotal));
  else
    disc := least(c.value, p_subtotal);
  end if;

  return jsonb_build_object('valid', true, 'code', c.code, 'coupon_id', c.id, 'discount', disc,
                            'description', c.description, 'reason', null);
end;
$$;

-- Customer-facing check, used to show "coupon applied" before checkout.
create function public.validate_coupon(p_code text, p_subtotal integer, p_phone text default null)
returns jsonb
language sql stable security definer set search_path = public as $$
  select public.coupon_check(p_code, greatest(coalesce(p_subtotal, 0), 0), p_phone) - 'coupon_id';
$$;

-- ---------------------------------------------------------------------------
-- quote_cart: current prices, stock and totals for a cart.
-- p_items: [{"variant_id": "<uuid>", "quantity": 2}, ...]
-- Each line has "problem": null, UNAVAILABLE, OUT_OF_STOCK, NOT_ENOUGH_STOCK or QUANTITY_LIMIT.
-- Lines with a problem are left out of the totals.
-- ---------------------------------------------------------------------------
create function public.quote_cart(p_items jsonb, p_coupon_code text default null, p_phone text default null)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  s public.settings;
  item jsonb;
  rec record;
  lines jsonb := '[]';
  v_subtotal integer := 0;
  v_problems integer := 0;
  v_problem text;
  v_max integer;
  v_fee integer;
  v_coupon jsonb := null;
  v_discount integer := 0;
  v_free_min integer;
begin
  select * into s from public.settings where id;

  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'INVALID_ITEMS';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception 'TOO_MANY_ITEMS';
  end if;
  for item in select * from jsonb_array_elements(p_items) loop
    if jsonb_typeof(item) <> 'object'
       or coalesce(item ->> 'variant_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       or jsonb_typeof(item -> 'quantity') <> 'number'
       or (item ->> 'quantity') !~ '^[0-9]{1,3}$'
       or (item ->> 'quantity')::integer < 1 then
      raise exception 'INVALID_ITEMS';
    end if;
  end loop;

  for rec in
    with req as (
      select (e ->> 'variant_id')::uuid as vid, (e ->> 'quantity')::integer as qty, n
      from jsonb_array_elements(p_items) with ordinality as x(e, n)
    ), merged as (
      select vid, sum(qty)::integer as qty, min(n) as n from req group by vid
    )
    select m.vid, m.qty, v.id as variant_id, v.product_id, p.name_en, p.name_hi, v.unit_en, v.unit_hi,
           v.price, v.mrp, v.in_stock, v.track_stock, v.stock_qty, v.max_per_order,
           coalesce(v.active and v.deleted_at is null and p.active and p.deleted_at is null and c.active, false) as visible
    from merged m
    left join public.product_variants v on v.id = m.vid
    left join public.products p on p.id = v.product_id
    left join public.categories c on c.id = p.category_id
    order by m.n
  loop
    v_problem := null;
    v_max := null;
    if not rec.visible then
      v_problem := 'UNAVAILABLE';
    elsif not rec.in_stock or (rec.track_stock and rec.stock_qty <= 0) then
      v_problem := 'OUT_OF_STOCK';
    elsif rec.track_stock and rec.stock_qty < rec.qty then
      v_problem := 'NOT_ENOUGH_STOCK';
      v_max := least(rec.stock_qty, rec.max_per_order);
    elsif rec.qty > rec.max_per_order then
      v_problem := 'QUANTITY_LIMIT';
      v_max := rec.max_per_order;
    end if;

    if v_problem is null then
      v_subtotal := v_subtotal + rec.price * rec.qty;
    else
      v_problems := v_problems + 1;
    end if;

    lines := lines || jsonb_build_array(jsonb_build_object(
      'variant_id', rec.vid,
      'product_id', rec.product_id,
      'name_en', rec.name_en,
      'name_hi', rec.name_hi,
      'unit_en', rec.unit_en,
      'unit_hi', rec.unit_hi,
      'unit_price', case when rec.visible then rec.price end,
      'mrp', case when rec.visible then rec.mrp end,
      'quantity', rec.qty,
      'line_total', case when v_problem is null then rec.price * rec.qty else 0 end,
      'problem', v_problem,
      'max_quantity', v_max
    ));
  end loop;

  v_fee := public.delivery_fee_for(v_subtotal, s.delivery_tiers);
  select min((t ->> 'min')::integer) into v_free_min
  from jsonb_array_elements(s.delivery_tiers) t where (t ->> 'fee')::integer = 0;

  if p_coupon_code is not null and trim(p_coupon_code) <> '' then
    v_coupon := public.coupon_check(p_coupon_code, v_subtotal, p_phone);
    if (v_coupon ->> 'valid')::boolean then
      v_discount := (v_coupon ->> 'discount')::integer;
    end if;
  end if;

  return jsonb_build_object(
    'lines', lines,
    'problems', v_problems,
    'subtotal', v_subtotal,
    'delivery_fee', v_fee,
    'discount', v_discount,
    'total', v_subtotal + v_fee - v_discount,
    'coupon', v_coupon,
    'free_delivery_min', v_free_min,
    'min_order_value', s.min_order_value,
    'below_minimum', v_subtotal < s.min_order_value,
    'store_open', s.store_open,
    'closed_message_en', s.closed_message_en,
    'closed_message_hi', s.closed_message_hi
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- place_order: validate, re-price on the server, save, and return the order number.
-- p_order: {"name", "phone", "address", "landmark", "pincode", "notes", "lang",
--           "items": [...], "coupon_code", "expected_total", "website" (spam trap, must be empty)}
-- ---------------------------------------------------------------------------
create function public.place_order(p_order jsonb)
returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  s public.settings;
  v_name text := trim(coalesce(p_order ->> 'name', ''));
  v_phone text := public.normalize_phone(p_order ->> 'phone');
  v_address text := trim(coalesce(p_order ->> 'address', ''));
  v_landmark text := trim(coalesce(p_order ->> 'landmark', ''));
  v_pincode text := trim(coalesce(p_order ->> 'pincode', ''));
  v_notes text := trim(coalesce(p_order ->> 'notes', ''));
  v_lang text := case when p_order ->> 'lang' = 'hi' then 'hi' else 'en' end;
  v_coupon text := nullif(upper(trim(coalesce(p_order ->> 'coupon_code', ''))), '');
  v_ip text;
  v_quote jsonb;
  v_line jsonb;
  v_coupon_ok boolean;
  v_order public.orders;
begin
  if p_order is null or jsonb_typeof(p_order) <> 'object' then
    raise exception 'INVALID_ORDER';
  end if;
  if coalesce(p_order ->> 'website', '') <> '' then
    raise exception 'SPAM';
  end if;

  select * into s from public.settings where id;
  if not s.store_open then
    raise exception 'STORE_CLOSED'
      using detail = jsonb_build_object('en', s.closed_message_en, 'hi', s.closed_message_hi)::text;
  end if;

  if char_length(v_name) not between 2 and 80 then raise exception 'INVALID_NAME'; end if;
  if v_phone !~ '^[6-9][0-9]{9}$' then raise exception 'INVALID_PHONE'; end if;
  if char_length(v_address) not between 5 and 300 then raise exception 'INVALID_ADDRESS'; end if;
  if char_length(v_landmark) > 120 then raise exception 'INVALID_LANDMARK'; end if;
  if char_length(v_notes) > 300 then raise exception 'INVALID_NOTES'; end if;
  if v_pincode <> '' and v_pincode !~ '^[1-9][0-9]{5}$' then raise exception 'INVALID_PINCODE'; end if;
  if cardinality(s.delivery_pincodes) > 0 and not (v_pincode = any (s.delivery_pincodes)) then
    raise exception 'PINCODE_NOT_SERVED';
  end if;

  -- Spam protection: at most 3 orders per phone in 10 minutes and 10 per day,
  -- and 5 per network address in 10 minutes (address comes from the API gateway).
  if (select count(*) from public.orders where customer_phone = v_phone and created_at > now() - interval '10 minutes') >= 3
     or (select count(*) from public.orders where customer_phone = v_phone and created_at > now() - interval '1 day') >= 10 then
    raise exception 'TOO_MANY_ORDERS';
  end if;
  begin
    v_ip := nullif(trim(split_part(coalesce(current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for', ''), ',', 1)), '');
  exception when others then
    v_ip := null;
  end;
  if v_ip is not null
     and (select count(*) from public.orders where client_ip = v_ip and created_at > now() - interval '10 minutes') >= 5 then
    raise exception 'TOO_MANY_ORDERS';
  end if;

  -- Lock the coupon so two orders cannot both take its last use.
  if v_coupon is not null then
    perform 1 from public.coupons where code = v_coupon for update;
  end if;

  v_quote := public.quote_cart(p_order -> 'items', v_coupon, v_phone);
  if jsonb_array_length(v_quote -> 'lines') = 0 then
    raise exception 'EMPTY_CART';
  end if;
  if (v_quote ->> 'problems')::integer > 0 then
    raise exception 'CART_CHANGED' using detail = v_quote::text;
  end if;
  if (v_quote ->> 'below_minimum')::boolean then
    raise exception 'BELOW_MINIMUM' using detail = v_quote::text;
  end if;
  v_coupon_ok := coalesce((v_quote -> 'coupon' ->> 'valid')::boolean, false);
  if v_coupon is not null and not v_coupon_ok then
    raise exception 'COUPON_INVALID' using detail = v_quote::text;
  end if;
  if jsonb_typeof(p_order -> 'expected_total') = 'number'
     and (p_order ->> 'expected_total')::numeric <> (v_quote ->> 'total')::numeric then
    raise exception 'PRICE_CHANGED' using detail = v_quote::text;
  end if;

  insert into public.orders (order_number, customer_name, customer_phone, address, landmark, pincode, notes, lang,
                             subtotal, delivery_fee, discount, total, coupon_id, coupon_code, client_ip)
  values (public.next_order_number(), v_name, v_phone, v_address, v_landmark, v_pincode, v_notes, v_lang,
          (v_quote ->> 'subtotal')::integer, (v_quote ->> 'delivery_fee')::integer,
          (v_quote ->> 'discount')::integer, (v_quote ->> 'total')::integer,
          case when v_coupon_ok then (v_quote -> 'coupon' ->> 'coupon_id')::uuid end,
          case when v_coupon_ok then v_quote -> 'coupon' ->> 'code' end,
          v_ip)
  returning * into v_order;

  for v_line in select * from jsonb_array_elements(v_quote -> 'lines') loop
    insert into public.order_items (order_id, product_id, variant_id, name_en, name_hi, unit_en, unit_hi,
                                    unit_price, mrp, quantity, line_total)
    values (v_order.id, (v_line ->> 'product_id')::uuid, (v_line ->> 'variant_id')::uuid,
            v_line ->> 'name_en', v_line ->> 'name_hi', v_line ->> 'unit_en', v_line ->> 'unit_hi',
            (v_line ->> 'unit_price')::integer, (v_line ->> 'mrp')::integer,
            (v_line ->> 'quantity')::integer, (v_line ->> 'line_total')::integer);
  end loop;

  if v_order.coupon_id is not null then
    insert into public.coupon_redemptions (coupon_id, order_id, customer_phone, discount)
    values (v_order.coupon_id, v_order.id, v_phone, v_order.discount);
  end if;

  insert into public.order_status_history (order_id, from_status, to_status) values (v_order.id, null, 'new');

  return (v_quote - 'store_open' - 'closed_message_en' - 'closed_message_hi') || jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'created_at', v_order.created_at,
    'name', v_order.customer_name,
    'phone', v_order.customer_phone,
    'address', v_order.address,
    'landmark', v_order.landmark,
    'pincode', v_order.pincode,
    'notes', v_order.notes
  );
end;
$$;

revoke execute on function public.coupon_check(text, integer, text) from public, anon, authenticated;
revoke execute on function public.quote_cart(jsonb, text, text) from public;
revoke execute on function public.validate_coupon(text, integer, text) from public;
revoke execute on function public.place_order(jsonb) from public;
grant execute on function public.quote_cart(jsonb, text, text) to anon, authenticated;
grant execute on function public.validate_coupon(text, integer, text) to anon, authenticated;
grant execute on function public.place_order(jsonb) to anon, authenticated;
