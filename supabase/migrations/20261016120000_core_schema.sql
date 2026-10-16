-- Order Kaaro core schema: catalogue, orders, coupons, settings, admins and audit tables.
-- Money is stored in whole rupees (integers), matching how the shop prices items.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.admin_role as enum ('owner', 'staff');
create type public.order_status as enum ('new', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled');
create type public.coupon_type as enum ('percent', 'flat');

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.admin_role not null default 'staff',
  display_name text not null default '' check (char_length(display_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_en text not null check (char_length(name_en) between 1 and 80),
  name_hi text not null check (char_length(name_hi) between 1 and 80),
  icon text check (icon is null or char_length(icon) <= 40),
  image_path text check (image_path is null or char_length(image_path) <= 300),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid not null references public.categories (id) on delete restrict,
  name_en text not null check (char_length(name_en) between 1 and 120),
  name_hi text not null check (char_length(name_hi) between 1 and 120),
  description_en text not null default '' check (char_length(description_en) <= 2000),
  description_hi text not null default '' check (char_length(description_hi) <= 2000),
  -- Extra search words: Hindi, English and common spellings ("arhar", "toor", "tuvar").
  search_keywords text[] not null default '{}',
  featured boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products (category_id, sort_order);

-- Every product has at least one variant: the size/unit actually sold, with its own price and stock.
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  -- Id from the old public/app.js catalogue (e.g. P001), kept so old carts can be mapped.
  legacy_id text unique,
  unit_en text not null check (char_length(unit_en) between 1 and 40),
  unit_hi text not null check (char_length(unit_hi) between 1 and 40),
  price integer not null check (price >= 0 and price <= 1000000),
  mrp integer check (mrp is null or (mrp >= price and mrp <= 1000000)),
  in_stock boolean not null default true,
  -- When track_stock is on, stock_qty counts units and is reduced when an order is confirmed.
  track_stock boolean not null default false,
  stock_qty integer check (stock_qty is null or stock_qty >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  max_per_order integer not null default 20 check (max_per_order between 1 and 999),
  sort_order integer not null default 0,
  active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not track_stock or stock_qty is not null)
);
create index product_variants_product_idx on public.product_variants (product_id, sort_order);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  -- Path inside the "product-images" Storage bucket. Lowercase only, so case bugs cannot return.
  storage_path text not null check (storage_path ~ '^[a-z0-9][a-z0-9/_.-]*$' and char_length(storage_path) <= 300),
  alt_en text not null default '' check (char_length(alt_en) <= 200),
  alt_hi text not null default '' check (char_length(alt_hi) <= 200),
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images (product_id, sort_order);
create unique index product_images_one_primary on public.product_images (product_id) where is_primary;

-- ---------------------------------------------------------------------------
-- Store settings (a single row)
-- ---------------------------------------------------------------------------
create table public.settings (
  id boolean primary key default true check (id),
  whatsapp_number text not null check (whatsapp_number ~ '^91[6-9][0-9]{9}$'),
  -- Delivery fee tiers: [{"min": 0, "fee": 50}, ...]. The fee for a subtotal is the tier with the
  -- highest "min" not above the subtotal. Free delivery = the lowest tier whose fee is 0.
  delivery_tiers jsonb not null,
  min_order_value integer not null default 0 check (min_order_value >= 0),
  -- Empty means no pincode restriction.
  delivery_pincodes text[] not null default '{}',
  -- {"mon": {"open": "09:00", "close": "21:00"}, ..., "sun": {...}}; a missing day means closed.
  store_hours jsonb not null default '{}',
  store_open boolean not null default true,
  closed_message_en text not null default '' check (char_length(closed_message_en) <= 300),
  closed_message_hi text not null default '' check (char_length(closed_message_hi) <= 300),
  announcement_en text not null default '' check (char_length(announcement_en) <= 300),
  announcement_hi text not null default '' check (char_length(announcement_hi) <= 300),
  contact_phone text not null default '' check (char_length(contact_phone) <= 20),
  alternate_phone text not null default '' check (char_length(alternate_phone) <= 20),
  contact_email text not null default '' check (char_length(contact_email) <= 120),
  address text not null default '' check (char_length(address) <= 300),
  google_review_url text not null default '' check (char_length(google_review_url) <= 300),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Coupons
-- ---------------------------------------------------------------------------
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{3,20}$'),
  description text not null default '' check (char_length(description) <= 200),
  type public.coupon_type not null,
  value integer not null check (value > 0),
  min_order integer not null default 0 check (min_order >= 0),
  max_discount integer check (max_discount is null or max_discount > 0),
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit_total integer check (usage_limit_total is null or usage_limit_total > 0),
  usage_limit_per_phone integer check (usage_limit_per_phone is null or usage_limit_per_phone > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (type <> 'percent' or value <= 100),
  check (starts_at is null or expires_at is null or starts_at < expires_at)
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status public.order_status not null default 'new',
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  customer_phone text not null check (customer_phone ~ '^[6-9][0-9]{9}$'),
  address text not null check (char_length(address) between 5 and 300),
  landmark text not null default '' check (char_length(landmark) <= 120),
  pincode text not null default '' check (pincode = '' or pincode ~ '^[1-9][0-9]{5}$'),
  notes text not null default '' check (char_length(notes) <= 300),
  lang text not null default 'en' check (lang in ('en', 'hi')),
  subtotal integer not null check (subtotal >= 0),
  delivery_fee integer not null check (delivery_fee >= 0),
  discount integer not null default 0 check (discount >= 0),
  total integer not null check (total >= 0),
  coupon_id uuid references public.coupons (id) on delete set null,
  coupon_code text,
  -- True once confirmed orders have taken stock off tracked variants (undone on cancel).
  stock_applied boolean not null default false,
  client_ip text,
  confirmed_at timestamptz,
  out_for_delivery_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total = subtotal + delivery_fee - discount)
);
create index orders_created_idx on public.orders (created_at desc);
create index orders_status_idx on public.orders (status, created_at desc);
create index orders_phone_idx on public.orders (customer_phone, created_at desc);

-- Prices and names are copied at order time, so editing a product never changes past orders.
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  name_en text not null,
  name_hi text not null,
  unit_en text not null,
  unit_hi text not null,
  unit_price integer not null check (unit_price >= 0),
  mrp integer,
  quantity integer not null check (quantity between 1 and 999),
  line_total integer not null check (line_total = unit_price * quantity),
  created_at timestamptz not null default now()
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_variant_idx on public.order_items (variant_id);

create table public.order_status_history (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  changed_by uuid references auth.users (id) on delete set null,
  note text not null default '' check (char_length(note) <= 300),
  changed_at timestamptz not null default now()
);
create index order_status_history_order_idx on public.order_status_history (order_id, changed_at);

create table public.coupon_redemptions (
  id bigint generated always as identity primary key,
  coupon_id uuid not null references public.coupons (id) on delete cascade,
  order_id uuid not null unique references public.orders (id) on delete cascade,
  customer_phone text not null,
  discount integer not null check (discount >= 0),
  created_at timestamptz not null default now()
);
create index coupon_redemptions_coupon_idx on public.coupon_redemptions (coupon_id, customer_phone);

-- Daily counter behind order numbers like OK261016-007.
create table public.order_counters (
  day date primary key,
  last_number integer not null default 0
);

-- ---------------------------------------------------------------------------
-- Audit
-- ---------------------------------------------------------------------------
create table public.price_history (
  id bigint generated always as identity primary key,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  old_price integer,
  new_price integer not null,
  old_mrp integer,
  new_mrp integer,
  changed_by uuid references auth.users (id) on delete set null,
  changed_at timestamptz not null default now()
);
create index price_history_variant_idx on public.price_history (variant_id, changed_at desc);

create table public.activity_log (
  id bigint generated always as identity primary key,
  actor uuid references auth.users (id) on delete set null,
  table_name text not null,
  record_id text,
  action text not null check (action in ('insert', 'update', 'delete')),
  changes jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index activity_log_created_idx on public.activity_log (created_at desc);
create index activity_log_record_idx on public.activity_log (table_name, record_id);
