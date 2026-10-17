// Vercel function serving /sitemap.xml (see the rewrite in vercel.json). It lists the shop's public
// pages, every visible category and every visible product, read live from Supabase with the public
// key, so new products appear without a redeploy.

/** Pages that are always there. Personal pages (cart, checkout, orders, wishlist) are left out. */
export const STATIC_PAGES = ['/', '/about', '/contact', '/terms', '/privacy', '/cookies'];

/** @param {string} text */
const escapeXml = (text) => text.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * @param {string} origin e.g. "https://example.com"
 * @param {{ categories: { slug: string, updated_at?: string }[], products: { slug: string, updated_at?: string }[] }} catalog
 */
export function buildSitemap(origin, { categories, products }) {
  /** @type {{ path: string, lastmod?: string }[]} */
  const pages = [
    ...STATIC_PAGES.map((path) => ({ path })),
    ...categories.map((c) => ({ path: `/category/${c.slug}`, lastmod: c.updated_at })),
    ...products.map((p) => ({ path: `/product/${p.slug}`, lastmod: p.updated_at })),
  ];
  const urls = pages.map(({ path, lastmod }) => {
    const date = lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : '';
    return `  <url><loc>${escapeXml(origin + path)}</loc>${date}</url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

/**
 * @param {string} path REST path and query, e.g. "categories?select=slug"
 * @returns {Promise<any[]>}
 */
async function readTable(path) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const res = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`Supabase ${path.split('?')[0]}: HTTP ${res.status}`);
  return /** @type {Promise<any[]>} */ (res.json());
}

/** @param {Request} request */
export async function GET(request) {
  const origin = new URL(request.url).origin;
  try {
    const [categories, products] = await Promise.all([
      readTable('categories?select=slug,updated_at&order=sort_order'),
      // Only products that have at least one size, matching what the shop shows.
      readTable('products?select=slug,updated_at,product_variants!inner(id)&order=sort_order'),
    ]);
    return new Response(buildSitemap(origin, { categories, products }), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    // Better a short sitemap than an error page: search engines will come back later.
    return new Response(buildSitemap(origin, { categories: [], products: [] }), {
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=300' },
    });
  }
}
