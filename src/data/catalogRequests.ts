// The three reads behind the catalogue. index.html preloads exactly these addresses (see
// vite.config.ts) so they download alongside the app instead of after it, which matters on slow data.
// No settings from the environment here: vite.config.ts imports this file too.

const PRODUCT_COLUMNS = [
  'id,slug,category_id,name_en,name_hi,description_en,description_hi,search_keywords,featured,sort_order',
  'product_variants(id,legacy_id,unit_en,unit_hi,price,mrp,in_stock,track_stock,stock_qty,max_per_order,sort_order)',
  'product_images(storage_path,alt_en,alt_hi,is_primary,sort_order)',
].join(',');

export const CATALOG_REQUESTS = {
  categories: 'categories?select=id,slug,name_en,name_hi,icon,sort_order&order=sort_order',
  products: `products?select=${PRODUCT_COLUMNS}&order=sort_order`,
  settings: 'settings?select=*&limit=1',
} as const;

/**
 * Address of a public read. The public key goes in the address rather than a header so the browser
 * can send it without a CORS preflight and reuse the preloaded response. It is the same public key
 * the app ships with; row level security decides what it may read.
 */
export function publicReadUrl(supabaseUrl: string, anonKey: string, path: string): string {
  return `${supabaseUrl}/rest/v1/${path}&apikey=${encodeURIComponent(anonKey)}`;
}
