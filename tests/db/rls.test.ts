import { beforeAll, describe, expect, it } from 'vitest';
import { anon, as, createDb, createUser, one, placeOrder, rows, superuser, user, variantId, type Db } from './harness';

let db: Db;
let ownerId: string;
let staffId: string;
let customerLoginId: string;

beforeAll(async () => {
  db = await createDb();
  ownerId = await createUser(db, 'owner@example.com', 'owner');
  staffId = await createUser(db, 'staff@example.com', 'staff');
  customerLoginId = await createUser(db, 'someone@example.com');
});

const exec = (actor: Parameters<typeof as>[1], sql: string, params: unknown[] = []) =>
  as(db, actor, async (tx) => { await tx.query(sql, params); });

describe('customers (not logged in)', () => {
  it('can read the visible catalogue and settings', async () => {
    const { n } = await one<{ n: number }>(db, anon, 'select count(*)::int as n from public.products');
    expect(n).toBe(125);
    const { v } = await one<{ v: number }>(db, anon, 'select count(*)::int as v from public.product_variants');
    expect(v).toBe(161);
    const s = await rows(db, anon, 'select whatsapp_number from public.settings');
    expect(s).toHaveLength(1);
  });

  it('cannot see hidden products, their sizes or images', async () => {
    await db.query(`update public.products set active = false where slug = 'tata-salt'`);
    try {
      expect(await rows(db, anon, `select 1 from public.products where slug = 'tata-salt'`)).toEqual([]);
      expect(await rows(db, anon, `select 1 from public.product_variants where legacy_id = 'P076'`)).toEqual([]);
      expect(await rows(db, anon, `select 1 from public.product_images i join public.products p on p.id = i.product_id where p.slug = 'tata-salt'`)).toEqual([]);
    } finally {
      await db.query(`update public.products set active = true where slug = 'tata-salt'`);
    }
  });

  it('cannot see products in a hidden category', async () => {
    await db.query(`update public.categories set active = false where slug = 'tea-beverages'`);
    try {
      const { n } = await one<{ n: number }>(db, anon, `
        select count(*)::int as n from public.products p join public.categories c on c.id = p.category_id where c.slug = 'tea-beverages'`);
      expect(n).toBe(0);
    } finally {
      await db.query(`update public.categories set active = true where slug = 'tea-beverages'`);
    }
  });

  it('cannot change the catalogue, settings or prices', async () => {
    await expect(exec(anon, `insert into public.categories (slug, name_en, name_hi) values ('x', 'X', 'X')`)).rejects.toThrow();
    // Updates that match no visible-and-writable rows silently change nothing.
    await exec(anon, `update public.product_variants set price = 1 where legacy_id = 'P001'`);
    await exec(anon, `update public.settings set whatsapp_number = '919000000000'`);
    const v = await one<{ price: number }>(db, superuser, `select price from public.product_variants where legacy_id = 'P001'`);
    expect(v.price).toBe(250);
    const s = await one<{ whatsapp_number: string }>(db, superuser, 'select whatsapp_number from public.settings');
    expect(s.whatsapp_number).toBe('919942089120');
  });

  it('cannot read or write orders, coupons or admin data directly', async () => {
    await placeOrder(db, { items: [{ variant_id: await variantId(db, 'P001'), quantity: 1 }], phone: '9111111111' });
    await expect(rows(db, anon, 'select * from public.orders')).rejects.toThrow(/permission denied/);
    await expect(rows(db, anon, 'select * from public.coupons')).rejects.toThrow(/permission denied/);
    await expect(rows(db, anon, 'select * from public.admin_users')).rejects.toThrow(/permission denied/);
    await expect(rows(db, anon, 'select * from public.activity_log')).resolves.toEqual([]);
    await expect(exec(anon, `insert into public.orders (order_number, customer_name, customer_phone, address, subtotal, delivery_fee, total)
                             values ('X', 'Fake', '9876543210', 'Somewhere', 0, 0, 0)`)).rejects.toThrow(/permission denied/);
  });

  it('cannot call internal functions', async () => {
    await expect(rows(db, anon, 'select public.next_order_number()')).rejects.toThrow(/permission denied/);
    await expect(rows(db, anon, `select public.coupon_check('X', 100, null)`)).rejects.toThrow(/permission denied/);
  });

  it('cannot upload product photos', async () => {
    await expect(exec(anon, `insert into storage.objects (bucket_id, name) values ('product-images', 'x.webp')`)).rejects.toThrow(/row-level security/);
  });
});

describe('logged-in users who are not admins', () => {
  it('cannot write anything or read orders', async () => {
    const someone = user(customerLoginId);
    await expect(exec(someone, `insert into public.categories (slug, name_en, name_hi) values ('x', 'X', 'X')`)).rejects.toThrow(/row-level security/);
    await expect(exec(someone, `insert into public.admin_users (user_id, role) values ($1, 'owner')`, [customerLoginId])).rejects.toThrow(/row-level security/);
    await expect(exec(someone, `insert into storage.objects (bucket_id, name) values ('product-images', 'x.webp')`)).rejects.toThrow(/row-level security/);
    await exec(someone, `update public.product_variants set price = 1 where legacy_id = 'P001'`);
    expect((await one<{ price: number }>(db, superuser, `select price from public.product_variants where legacy_id = 'P001'`)).price).toBe(250);
    expect(await rows(db, someone, 'select * from public.orders')).toEqual([]);
  });
});

describe('staff', () => {
  it('can change prices and stock, and every price change is recorded', async () => {
    const staff = user(staffId);
    await exec(staff, `update public.product_variants set price = 240, in_stock = false where legacy_id = 'P001'`);
    const v = await one<{ price: number; in_stock: boolean }>(db, superuser, `select price, in_stock from public.product_variants where legacy_id = 'P001'`);
    expect(v).toEqual({ price: 240, in_stock: false });
    const h = await one<{ old_price: number; new_price: number; changed_by: string }>(db, superuser, `
      select old_price, new_price, changed_by from public.price_history ph
      join public.product_variants v on v.id = ph.variant_id where v.legacy_id = 'P001'`);
    expect(h).toEqual({ old_price: 250, new_price: 240, changed_by: staffId });
    await db.query(`update public.product_variants set price = 250, in_stock = true where legacy_id = 'P001'`);
  });

  it('can see hidden products and read orders', async () => {
    await db.query(`update public.products set active = false where slug = 'besan'`);
    expect(await rows(db, user(staffId), `select 1 from public.products where slug = 'besan'`)).toHaveLength(1);
    await db.query(`update public.products set active = true where slug = 'besan'`);
    expect((await rows(db, user(staffId), 'select * from public.orders')).length).toBeGreaterThan(0);
  });

  it('can upload product photos', async () => {
    await exec(user(staffId), `insert into storage.objects (bucket_id, name) values ('product-images', 'catalog/test.webp')`);
  });

  it('cannot change settings, coupons or admins, or read the activity log', async () => {
    const staff = user(staffId);
    await exec(staff, `update public.settings set store_open = false`);
    expect((await one<{ store_open: boolean }>(db, superuser, 'select store_open from public.settings')).store_open).toBe(true);
    await expect(exec(staff, `insert into public.coupons (code, type, value) values ('STAFF10', 'percent', 10)`)).rejects.toThrow(/row-level security/);
    await expect(exec(staff, `update public.admin_users set role = 'owner' where user_id = $1`, [staffId])).resolves.toBeUndefined();
    expect((await one<{ role: string }>(db, superuser, 'select role from public.admin_users where user_id = $1', [staffId])).role).toBe('staff');
    expect(await rows(db, staff, 'select * from public.activity_log')).toEqual([]);
  });
});

describe('owner', () => {
  it('can change settings and coupons, and sees the activity log', async () => {
    const owner = user(ownerId);
    await exec(owner, `update public.settings set announcement_en = 'Diwali hours: open till 10 PM'`);
    await exec(owner, `insert into public.coupons (code, type, value, min_order) values ('WELCOME10', 'percent', 10, 300)`);
    const log = await rows<{ table_name: string; actor: string }>(db, owner, `select table_name, actor from public.activity_log where actor = $1`, [ownerId]);
    expect(log.map((l) => l.table_name)).toEqual(expect.arrayContaining(['settings', 'coupons']));
  });

  it('can add staff but cannot remove the last owner', async () => {
    const owner = user(ownerId);
    const newStaff = await createUser(db, 'helper@example.com');
    await exec(owner, `insert into public.admin_users (user_id, role) values ($1, 'staff')`, [newStaff]);
    await expect(exec(owner, `delete from public.admin_users where user_id = $1`, [ownerId])).rejects.toThrow(/LAST_OWNER/);
    await expect(exec(owner, `update public.admin_users set role = 'staff' where user_id = $1`, [ownerId])).rejects.toThrow(/LAST_OWNER/);
  });

  it('rejects invalid delivery tiers', async () => {
    await expect(exec(user(ownerId), `update public.settings set delivery_tiers = '[{"min": 100, "fee": 20}]'`)).rejects.toThrow(/settings_delivery_tiers_valid/);
    await expect(exec(user(ownerId), `update public.settings set delivery_tiers = '[{"min": 0, "fee": -5}]'`)).rejects.toThrow(/settings_delivery_tiers_valid/);
  });
});
