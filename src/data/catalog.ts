import type { Db } from '../lib/supabase';
import { parseHours, type StoreHours } from '../lib/hours';
import { parseTiers, type DeliveryTier } from '../lib/pricing';

export interface Category {
  id: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  /** Key into CATEGORY_ICONS, chosen in the admin panel. */
  icon: string | null;
  sortOrder: number;
}

export interface Variant {
  id: string;
  productId: string;
  legacyId: string | null;
  unitEn: string;
  unitHi: string;
  price: number;
  mrp: number | null;
  /** Can be added to the cart right now. */
  available: boolean;
  /** Most a customer may order: the per-order limit, or the stock left when stock is counted. */
  maxQuantity: number;
}

export interface ProductImage {
  path: string;
  altEn: string;
  altHi: string;
}

export interface Product {
  id: string;
  slug: string;
  categoryId: string;
  nameEn: string;
  nameHi: string;
  descriptionEn: string;
  descriptionHi: string;
  keywords: string[];
  featured: boolean;
  sortOrder: number;
  variants: Variant[];
  images: ProductImage[];
}

export interface StoreSettings {
  whatsappNumber: string;
  deliveryTiers: DeliveryTier[];
  minOrderValue: number;
  deliveryPincodes: string[];
  storeHours: StoreHours;
  storeOpen: boolean;
  closedMessageEn: string;
  closedMessageHi: string;
  announcementEn: string;
  announcementHi: string;
  contactPhone: string;
  alternatePhone: string;
  contactEmail: string;
  address: string;
  googleReviewUrl: string;
}

export interface Catalog {
  categories: Category[];
  products: Product[];
  settings: StoreSettings;
  fetchedAt: number;
}

const CATALOG_CACHE_KEY = 'ok_catalog_v1';

export async function fetchCatalog(db: Db): Promise<Catalog> {
  const [categories, products, settings] = await Promise.all([
    db.from('categories').select('id, slug, name_en, name_hi, icon, sort_order').order('sort_order'),
    db.from('products')
      .select(`id, slug, category_id, name_en, name_hi, description_en, description_hi, search_keywords, featured, sort_order,
        product_variants (id, legacy_id, unit_en, unit_hi, price, mrp, in_stock, track_stock, stock_qty, max_per_order, sort_order),
        product_images (storage_path, alt_en, alt_hi, is_primary, sort_order)`)
      .order('sort_order'),
    db.from('settings').select('*').single(),
  ]);
  if (categories.error) throw categories.error;
  if (products.error) throw products.error;
  if (settings.error) throw settings.error;

  const s = settings.data;
  return {
    categories: categories.data.map((c) => ({ id: c.id, slug: c.slug, nameEn: c.name_en, nameHi: c.name_hi, icon: c.icon, sortOrder: c.sort_order })),
    products: products.data
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        categoryId: p.category_id,
        nameEn: p.name_en,
        nameHi: p.name_hi,
        descriptionEn: p.description_en,
        descriptionHi: p.description_hi,
        keywords: p.search_keywords,
        featured: p.featured,
        sortOrder: p.sort_order,
        variants: [...p.product_variants]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((v) => {
            const counted = v.track_stock ? Math.max(v.stock_qty ?? 0, 0) : Infinity;
            return {
              id: v.id,
              productId: p.id,
              legacyId: v.legacy_id,
              unitEn: v.unit_en,
              unitHi: v.unit_hi,
              price: v.price,
              mrp: v.mrp,
              available: v.in_stock && counted > 0,
              maxQuantity: Math.min(v.max_per_order, counted),
            };
          }),
        images: [...p.product_images]
          .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
          .map((i) => ({ path: i.storage_path, altEn: i.alt_en, altHi: i.alt_hi })),
      }))
      .filter((p) => p.variants.length > 0),
    settings: {
      whatsappNumber: s.whatsapp_number,
      deliveryTiers: parseTiers(s.delivery_tiers),
      minOrderValue: s.min_order_value,
      deliveryPincodes: s.delivery_pincodes,
      storeHours: parseHours(s.store_hours),
      storeOpen: s.store_open,
      closedMessageEn: s.closed_message_en,
      closedMessageHi: s.closed_message_hi,
      announcementEn: s.announcement_en,
      announcementHi: s.announcement_hi,
      contactPhone: s.contact_phone,
      alternatePhone: s.alternate_phone,
      contactEmail: s.contact_email,
      address: s.address,
      googleReviewUrl: s.google_review_url,
    },
    fetchedAt: Date.now(),
  };
}

export function readCachedCatalog(read: <T>(key: string, fallback: T) => T): Catalog | null {
  const cached = read<Catalog | null>(CATALOG_CACHE_KEY, null);
  return cached && Array.isArray(cached.products) && cached.settings ? cached : null;
}

export { CATALOG_CACHE_KEY };

/** The size shown on cards: the first one in stock, else the first. */
export function defaultVariant(product: Product): Variant {
  return product.variants.find((v) => v.available) ?? product.variants[0];
}
