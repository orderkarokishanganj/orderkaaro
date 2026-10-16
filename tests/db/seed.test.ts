import { beforeAll, describe, expect, it } from 'vitest';
import { anon, createDb, one, rows, superuser, type Db } from './harness';

let db: Db;
beforeAll(async () => {
  db = await createDb();
});

describe('seed', () => {
  it('imports the cleaned catalogue', async () => {
    const counts = await one<{ categories: number; products: number; variants: number; images: number }>(db, superuser, `
      select (select count(*)::int from public.categories) as categories,
             (select count(*)::int from public.products) as products,
             (select count(*)::int from public.product_variants) as variants,
             (select count(*)::int from public.product_images) as images`);
    expect(counts).toEqual({ categories: 8, products: 125, variants: 161, images: 124 });
  });

  it('fixes the bad legacy rows and drops removed items', async () => {
    const legacy = (await rows<{ legacy_id: string }>(db, superuser, 'select legacy_id from public.product_variants')).map((r) => r.legacy_id);
    expect(legacy).toContain('P075'); // Amrit Bhog Sooji stays
    expect(legacy).toContain('P126'); // Kaju, previously lowercase p126
    expect(legacy).not.toContain('P084'); // duplicate Sooji, removed by the owner
    expect(legacy).not.toContain('P081'); // exact duplicate of P014
    expect(legacy.filter((id) => id.startsWith('B'))).toEqual([]); // combo packs removed

    const kaju = await one<{ name_en: string; name_hi: string; category: string }>(db, superuser, `
      select p.name_en, p.name_hi, c.name_en as category
      from public.product_variants v join public.products p on p.id = v.product_id
      join public.categories c on c.id = p.category_id where v.legacy_id = 'P126'`);
    expect(kaju).toEqual({ name_en: 'Kaju', name_hi: 'काजू', category: 'Spices & Dry Fruits' });
  });

  it('groups sizes of the same product into variants, smallest first', async () => {
    const sizes = await rows<{ unit_en: string; unit_hi: string; price: number }>(db, superuser, `
      select v.unit_en, v.unit_hi, v.price from public.product_variants v
      join public.products p on p.id = v.product_id where p.slug = 'rajbari-tea-pouch' order by v.sort_order`);
    expect(sizes).toEqual([
      { unit_en: '250 g', unit_hi: '250 ग्राम', price: 125 },
      { unit_en: '500 g', unit_hi: '500 ग्राम', price: 250 },
      { unit_en: '1 kg', unit_hi: '1 किलो', price: 500 },
    ]);
  });

  it('gives every product a Hindi name and every variant a sane MRP', async () => {
    const bad = await rows(db, superuser, `
      select p.slug from public.products p
      join public.product_variants v on v.product_id = p.id
      where p.name_hi = '' or v.unit_hi = '' or v.mrp < v.price`);
    expect(bad).toEqual([]);
  });

  it('stores lowercase webp image paths', async () => {
    const paths = (await rows<{ storage_path: string }>(db, superuser, 'select storage_path from public.product_images')).map((r) => r.storage_path);
    for (const path of paths) {
      expect(path).toMatch(/^catalog\/[a-z0-9/_.-]+\.webp$/);
    }
  });

  it('stores the confirmed business settings', async () => {
    const s = await one<{ whatsapp_number: string; delivery_tiers: unknown; min_order_value: number; store_open: boolean }>(db, anon,
      'select whatsapp_number, delivery_tiers, min_order_value, store_open from public.settings');
    expect(s).toEqual({
      whatsapp_number: '919942089120',
      delivery_tiers: [{ min: 0, fee: 50 }, { min: 200, fee: 30 }, { min: 500, fee: 20 }, { min: 800, fee: 0 }],
      min_order_value: 0,
      store_open: true,
    });
  });

  it('can be run twice without duplicating anything', async () => {
    const again = await createDb();
    const { readFileSync } = await import('node:fs');
    await again.exec(readFileSync(new URL('../../supabase/seed.sql', import.meta.url), 'utf8'));
    const { n } = await one<{ n: number }>(again, superuser, 'select count(*)::int as n from public.product_variants');
    expect(n).toBe(161);
  });
});
