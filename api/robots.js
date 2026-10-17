// Vercel function serving /robots.txt (see the rewrite in vercel.json), so the sitemap address
// always matches the domain the site is served from.

/** @param {string} origin */
export function buildRobots(origin) {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /cart',
    'Disallow: /checkout',
    'Disallow: /order/',
    'Disallow: /orders',
    'Disallow: /wishlist',
    'Disallow: /search',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');
}

/** @param {Request} request */
export function GET(request) {
  return new Response(buildRobots(new URL(request.url).origin), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=86400' },
  });
}
