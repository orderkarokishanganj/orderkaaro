import { beforeAll, describe, expect, it } from 'vitest';
import { anon, as, createDb, createUser, one, rows, superuser, user, type Actor, type Db } from './harness';

let db: Db;
let staffId: string;
let customerId: string;
let grains: string; // category id
let pulses: string;

beforeAll(async () => {
  db = await createDb();
  await createUser(db, 'owner@example.com', 'owner');
  staffId = await createUser(db, 'staff@example.com', 'staff');
  customerId = await createUser(db, 'someone@example.com');
  grains = (await one<{ id: string }>(db, superuser, `select id from public.categories where slug = 'atta-rice-grains'`)).id;
  pulses = (await one<{ id: string }>(db, superuser, `select id from public.categories where slug = 'pulses-dal'`)).id;
});

const call = async <T>(actor: Actor, sql: string, params: unknown[] = []) =>
  (await one<{ r: T }>(db, actor, `select ${sql} as r`, params)).r;

const product = (overrides: Record<string, unknown> = {}) => ({
  name_en: 'Test Poha',
  name_hi: 'टेस्ट पोहा',
  category_id: grains,
  search_keywords: ['chura', ' poha '],
  variants: [
    { unit_en: '500 g', unit_hi: '500 ग्राम', price: 40, mrp: 50 },
    { unit_en: '1 kg', unit_hi: '1 किलो', price: 75, mrp: 90, track_stock: true, stock_qty: 12 },
  ],
  images: [
    { storage_path: 'products/test-poha-a1.webp', is_primary: false },
    { storage_path: 'products/test-poha-b2.webp', is_primary: true },
  ],
  ...overrides,
});

const save = (actor: Actor, p: unknown) => call<{ id: string; slug: string; removed_paths: string[] }>(actor, 'public.admin_save_product($1::jsonb)', [JSON.stringify(p)]);

describe('who can use admin functions', () => {
  it('refuses customers and logged-in non-admins', async () => {
    await expect(save(anon, product())).rejects.toThrow(/permission denied/);
    await expect(save(user(customerId), product())).rejects.toThrow('NOT_ADMIN');
    await expect(call(user(customerId), `public.admin_adjust_prices(array[]::uuid[], 10)`)).rejects.toThrow('NOT_ADMIN');
    await expect(call(anon, `public.admin_import_products('[]'::jsonb)`)).rejects.toThrow(/permission denied/);
  });
});

describe('admin_save_product', () => {
  it('creates a product with sizes, photos, a slug and a primary photo', async () => {
    const saved = await save(user(staffId), product());
    expect(saved.slug).toBe('test-poha');
    expect(saved.removed_paths).toEqual([]);
    const variants = await rows<{ unit_en: string; sort_order: number; track_stock: boolean; stock_qty: number | null }>(db, superuser,
      'select unit_en, sort_order, track_stock, stock_qty from public.product_variants where product_id = $1 order by sort_order', [saved.id]);
    expect(variants).toEqual([
      { unit_en: '500 g', sort_order: 0, track_stock: false, stock_qty: null },
      { unit_en: '1 kg', sort_order: 1, track_stock: true, stock_qty: 12 },
    ]);
    const images = await rows<{ storage_path: string; is_primary: boolean }>(db, superuser,
      'select storage_path, is_primary from public.product_images where product_id = $1 order by sort_order', [saved.id]);
    expect(images).toEqual([
      { storage_path: 'products/test-poha-a1.webp', is_primary: false },
      { storage_path: 'products/test-poha-b2.webp', is_primary: true },
    ]);
    const { search_keywords } = await one<{ search_keywords: string[] }>(db, superuser, 'select search_keywords from public.products where id = $1', [saved.id]);
    expect(search_keywords).toEqual(['chura', 'poha']);
  });

  it('updates in place, hides removed sizes and reports photos no product uses', async () => {
    const created = await save(user(staffId), product({ name_en: 'Test Sooji', images: [
      { storage_path: 'products/test-sooji-1.webp' },
      { storage_path: 'catalog/grains/sooji.webp' }, // shared with another product
    ] }));
    const [small] = await rows<{ id: string }>(db, superuser, 'select id from public.product_variants where product_id = $1 order by sort_order', [created.id]);
    const updated = await save(user(staffId), product({
      id: created.id,
      name_en: 'Test Sooji Fine',
      variants: [{ id: small.id, unit_en: '500 g', unit_hi: '500 ग्राम', price: 45, mrp: 50 }],
      images: [],
    }));
    expect(updated.removed_paths).toEqual(['products/test-sooji-1.webp']); // the shared one stays
    const v = await rows<{ unit_en: string; price: number; active: boolean }>(db, superuser,
      'select unit_en, price, active from public.product_variants where product_id = $1 order by sort_order, unit_en', [created.id]);
    expect(v).toEqual(expect.arrayContaining([{ unit_en: '500 g', price: 45, active: true }, { unit_en: '1 kg', price: 75, active: false }]));
    const history = await rows(db, superuser, 'select * from public.price_history where variant_id = $1', [small.id]);
    expect(history).toHaveLength(1);
  });

  it('rejects bad data with the database constraints', async () => {
    await expect(save(user(staffId), product({ variants: [] }))).rejects.toThrow('NO_VARIANTS');
    await expect(save(user(staffId), product({ variants: [{ unit_en: '1 kg', unit_hi: '1 किलो', price: 100, mrp: 80 }] }))).rejects.toThrow(/check/);
    await expect(save(user(staffId), product({ slug: 'Bad Slug!' }))).rejects.toThrow(/products_slug_check/);
  });
});

describe('admin_delete_product', () => {
  it('hides the product, frees its slug and removes its photos', async () => {
    const created = await save(user(staffId), product({ name_en: 'Test Delete Me', images: [{ storage_path: 'products/delete-me.webp' }] }));
    const removed = await call<string[]>(user(staffId), 'public.admin_delete_product($1)', [created.id]);
    expect(removed).toEqual(['products/delete-me.webp']);
    const p = await one<{ slug: string; active: boolean; deleted: boolean }>(db, superuser,
      'select slug, active, deleted_at is not null as deleted from public.products where id = $1', [created.id]);
    expect(p).toMatchObject({ active: false, deleted: true });
    expect(p.slug).toMatch(/^test-delete-me-deleted-/);
    expect(await rows(db, anon, `select 1 from public.products where id = $1`, [created.id])).toEqual([]);
    // The slug can be used again.
    await expect(save(user(staffId), product({ name_en: 'Test Delete Me', images: [] }))).resolves.toMatchObject({ slug: 'test-delete-me' });
  });
});

describe('admin_adjust_prices', () => {
  it('changes prices by a percentage and records history', async () => {
    const ids = (await rows<{ id: string }>(db, superuser, `select id from public.product_variants where legacy_id in ('P006', 'P007') order by legacy_id`)).map((r) => r.id);
    // P006 Rs 130 (MRP 149), P007 Rs 65 (MRP 75): -10% -> 117 and 59 (rounded)
    expect(await call<number>(user(staffId), 'public.admin_adjust_prices($1::uuid[], -10)', [ids])).toBe(2);
    const prices = (await rows<{ price: number }>(db, superuser, `select price from public.product_variants where legacy_id in ('P006', 'P007') order by legacy_id`)).map((r) => r.price);
    expect(prices).toEqual([117, 59]);
    const { n } = await one<{ n: number }>(db, superuser, 'select count(*)::int as n from public.price_history where variant_id = any ($1::uuid[]) and changed_by = $2', [ids, staffId]);
    expect(n).toBe(2);
  });

  it('refuses to go above MRP and changes nothing', async () => {
    const ids = (await rows<{ id: string }>(db, superuser, `select id from public.product_variants where legacy_id in ('P001', 'P076')`)).map((r) => r.id);
    await expect(call(user(staffId), 'public.admin_adjust_prices($1::uuid[], 20)', [ids])).rejects.toThrow('PRICE_ABOVE_MRP');
    const { price } = await one<{ price: number }>(db, superuser, `select price from public.product_variants where legacy_id = 'P001'`);
    expect(price).toBe(250);
    await expect(call(user(staffId), 'public.admin_adjust_prices($1::uuid[], 0)', [ids])).rejects.toThrow('INVALID_PERCENT');
  });
});

describe('categories', () => {
  it('reorders categories', async () => {
    const ids = (await rows<{ id: string }>(db, superuser, 'select id from public.categories order by sort_order')).map((r) => r.id);
    await call(user(staffId), 'public.admin_reorder_categories($1::uuid[])', [[...ids].reverse()]);
    const after = (await rows<{ id: string }>(db, superuser, 'select id from public.categories order by sort_order')).map((r) => r.id);
    expect(after).toEqual([...ids].reverse());
  });

  it('will not delete a category that still has products', async () => {
    await expect(call(user(staffId), 'public.admin_delete_category($1)', [pulses])).rejects.toThrow('CATEGORY_NOT_EMPTY');
    const { id } = await one<{ id: string }>(db, superuser, `insert into public.categories (slug, name_en, name_hi) values ('test-empty', 'Empty', 'खाली') returning id`);
    const p = await save(user(staffId), product({ name_en: 'Test In Empty', category_id: id, images: [] }));
    await call(user(staffId), 'public.admin_delete_product($1)', [p.id]); // deleted products don't block
    await call(user(staffId), 'public.admin_delete_category($1)', [id]);
    expect(await rows(db, superuser, `select 1 from public.categories where id = $1`, [id])).toEqual([]);
  });
});

describe('admin_import_products', () => {
  const row = (o: Record<string, unknown>) => ({
    product_slug: 'test-import-dal', category_slug: 'pulses-dal', name_en: 'Test Import Dal', name_hi: 'टेस्ट दाल',
    unit_en: '1 kg', unit_hi: '1 किलो', price: 100, mrp: 120, ...o,
  });
  const runImport = (rowsIn: unknown[]) => call<Record<string, number>>(user(staffId), 'public.admin_import_products($1::jsonb)', [JSON.stringify(rowsIn)]);

  it('creates products and sizes, then updates them by slug and unit', async () => {
    expect(await runImport([row({}), row({ unit_en: '500 g', unit_hi: '500 ग्राम', price: 52, mrp: 60 })]))
      .toEqual({ created_products: 1, created_variants: 2, updated_variants: 0 });
    expect(await runImport([row({ price: 95 })])).toEqual({ created_products: 0, created_variants: 0, updated_variants: 1 });
    const { price } = await one<{ price: number }>(db, superuser, `
      select v.price from public.product_variants v join public.products p on p.id = v.product_id
      where p.slug = 'test-import-dal' and v.unit_en = '1 kg'`);
    expect(price).toBe(95);
  });

  it('rolls everything back and names the bad row', async () => {
    const before = await one<{ n: number }>(db, superuser, 'select count(*)::int as n from public.product_variants');
    const bad = runImport([row({ product_slug: 'test-import-ok', unit_en: '2 kg', unit_hi: '2 किलो' }), row({ category_slug: 'nope' })]);
    await expect(bad).rejects.toThrow('IMPORT_ROW');
    try {
      await bad;
    } catch (e) {
      expect(JSON.parse((e as { detail: string }).detail)).toMatchObject({ row: 2, error: 'unknown category "nope"' });
    }
    const after = await one<{ n: number }>(db, superuser, 'select count(*)::int as n from public.product_variants');
    expect(after.n).toBe(before.n);
  });
});

describe('admin_price_history', () => {
  it('lists changes with the admin name', async () => {
    const { id } = await one<{ id: string }>(db, superuser, `select product_id as id from public.product_variants where legacy_id = 'P006'`);
    const history = await rows<{ new_price: number; changed_by_name: string }>(db, user(staffId), 'select * from public.admin_price_history($1)', [id]);
    expect(history).toEqual(expect.arrayContaining([expect.objectContaining({ new_price: 117, changed_by_name: 'staff@example.com' })]));
    await expect(as(db, user(customerId), (tx) => tx.query('select * from public.admin_price_history($1)', [id]))).rejects.toThrow('NOT_ADMIN');
  });
});
