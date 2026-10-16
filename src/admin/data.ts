import type { PostgrestError } from '@supabase/supabase-js';
import { supabase, type Db } from '../lib/supabase';

export interface AdminVariant {
  id: string;
  legacy_id: string | null;
  unit_en: string;
  unit_hi: string;
  price: number;
  mrp: number | null;
  in_stock: boolean;
  track_stock: boolean;
  stock_qty: number | null;
  low_stock_threshold: number;
  max_per_order: number;
  sort_order: number;
}

export interface AdminImage {
  storage_path: string;
  alt_en: string;
  alt_hi: string;
  is_primary: boolean;
  sort_order: number;
}

export interface AdminProduct {
  id: string;
  slug: string;
  category_id: string;
  name_en: string;
  name_hi: string;
  description_en: string;
  description_hi: string;
  search_keywords: string[];
  featured: boolean;
  active: boolean;
  sort_order: number;
  updated_at: string;
  product_variants: AdminVariant[];
  product_images: AdminImage[];
}

export interface AdminCategory {
  id: string;
  slug: string;
  name_en: string;
  name_hi: string;
  icon: string | null;
  active: boolean;
  sort_order: number;
}

export function db(): Db {
  if (!supabase) throw new Error('The shop database is not configured.');
  return supabase;
}

export async function fetchCategories(): Promise<AdminCategory[]> {
  const { data, error } = await db().from('categories').select('id, slug, name_en, name_hi, icon, active, sort_order').order('sort_order');
  if (error) throw error;
  return data;
}

/** Every product that has not been deleted, hidden ones included, with its current sizes and photos. */
export async function fetchProducts(): Promise<AdminProduct[]> {
  const { data, error } = await db()
    .from('products')
    .select(`id, slug, category_id, name_en, name_hi, description_en, description_hi, search_keywords, featured, active, sort_order, updated_at,
      product_variants (id, legacy_id, unit_en, unit_hi, price, mrp, in_stock, track_stock, stock_qty, low_stock_threshold, max_per_order, sort_order, deleted_at),
      product_images (storage_path, alt_en, alt_hi, is_primary, sort_order)`)
    .is('deleted_at', null)
    .order('sort_order');
  if (error) throw error;
  return data.map((p) => ({
    ...p,
    product_variants: p.product_variants.filter((v) => !v.deleted_at).sort((a, b) => a.sort_order - b.sort_order),
    product_images: [...p.product_images].sort((a, b) => a.sort_order - b.sort_order),
  }));
}

/** "In stock" as customers see it: switched on, and units left when stock is counted. */
export function isAvailable(v: AdminVariant): boolean {
  return v.in_stock && (!v.track_stock || (v.stock_qty ?? 0) > 0);
}

export function isLowStock(v: AdminVariant): boolean {
  return v.track_stock && v.stock_qty !== null && v.stock_qty > 0 && v.stock_qty <= v.low_stock_threshold;
}

const FRIENDLY: Record<string, string> = {
  NOT_ADMIN: 'Your account is not an admin.',
  NOT_FOUND: 'This item no longer exists. Refresh the page.',
  NO_VARIANTS: 'Add at least one size.',
  VARIANT_NOT_FOUND: 'A size was changed by someone else. Refresh the page and try again.',
  INVALID_PERCENT: 'Enter a percentage between −90 and 500, not 0.',
  INVALID_IMPORT: 'The file has no rows, or more than 2000.',
};

/** Turns database errors into messages the shop owner can act on. */
export function errorText(err: unknown): string {
  const e = err as Partial<PostgrestError> & { message?: string };
  const message = e?.message ?? String(err);
  if (FRIENDLY[message]) return FRIENDLY[message];
  if (message === 'PRICE_ABOVE_MRP') return `Prices can't go above MRP. Too high for: ${e.details}.`;
  if (message === 'CATEGORY_NOT_EMPTY') return `This category still has ${e.details} products. Move them to another category first.`;
  if (message === 'IMPORT_ROW') {
    try {
      const d = JSON.parse(e.details ?? '{}');
      return `Row ${d.row}: ${d.error}. Nothing was imported.`;
    } catch {
      return 'A row could not be imported. Nothing was changed.';
    }
  }
  if (/products_slug_key|categories_slug_key/.test(message)) return 'Another item already uses this web address (slug). Choose a different one.';
  if (/slug_check/.test(message)) return 'The web address (slug) can only use lowercase letters, numbers and dashes.';
  if (/product_variants_check|mrp/.test(message)) return 'MRP must be equal to or more than the price.';
  if (/stock_qty/.test(message)) return 'Stock must be a number of 0 or more when stock counting is on.';
  if (/Failed to fetch|NetworkError|fetch/i.test(message)) return 'Could not reach the database. Check your internet and try again.';
  return message;
}

const UNIT_HI: Record<string, string> = { kg: 'किलो', g: 'ग्राम', gm: 'ग्राम', l: 'लीटर', ltr: 'लीटर', ml: 'मि.ली.', pc: 'पीस', pcs: 'पीस', box: 'डिब्बा', pack: 'पैकेट', packet: 'पैकेट', dozen: 'दर्जन' };

/** Suggests the Hindi unit: "500 g" -> "500 ग्राम". Returns "" when unsure. */
export function suggestHindiUnit(unit: string): string {
  const m = unit.trim().match(/^([\d.]+)\s*([a-zA-Z]+)$/);
  const hi = m ? UNIT_HI[m[2].toLowerCase()] : undefined;
  return m && hi ? `${m[1]} ${hi}` : '';
}

export function slugify(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}
