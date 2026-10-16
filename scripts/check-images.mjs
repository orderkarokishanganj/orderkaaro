// Fails (exit 1) if any product points at an image that does not exist.
//   node scripts/check-images.mjs           -> every seed image has its source file in public/,
//                                              matching letter case exactly (runs before every build)
//   node scripts/check-images.mjs --remote  -> every product_images row in Supabase loads from Storage
//                                              (add --test for the test project)
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { supabaseEnv } from './lib/env.mjs';
import { loadLegacyCatalog } from './lib/legacy-catalog.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const missing = [];

// macOS ignores letter case when opening files, so compare against real directory listings.
function existsExactCase(relativePath) {
  let dir = `${root}public`;
  for (const part of relativePath.replace(/^\//, '').split('/')) {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return false;
    }
    if (!entries.includes(part)) return false;
    dir = `${dir}/${part}`;
  }
  return true;
}

if (process.argv.includes('--remote')) {
  const { url, anonKey } = supabaseEnv({ test: process.argv.includes('--test') });
  const res = await fetch(`${url}/rest/v1/product_images?select=storage_path`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });
  if (!res.ok) {
    console.error(`Could not read product_images: HTTP ${res.status}`);
    process.exit(1);
  }
  const rows = await res.json();
  // Every photo has a full-size copy and a thumbs/ copy used in product grids.
  const paths = rows.flatMap(({ storage_path }) => [storage_path, `thumbs/${storage_path}`]);
  await Promise.all(paths.map(async (path) => {
    const head = await fetch(`${url}/storage/v1/object/public/product-images/${path}`, { method: 'HEAD' });
    if (!head.ok) missing.push(`${path} (HTTP ${head.status})`);
  }));
  console.log(`Checked ${paths.length} image files in Storage.`);
} else {
  const { products } = loadLegacyCatalog(`${root}public/app.js`);
  const images = products.flatMap((p) => p.images.map((img) => ({ ...img, product: p.name_en })));
  for (const img of images) {
    if (!existsExactCase(img.legacy)) missing.push(`${img.product}: public${img.legacy}`);
  }
  console.log(`Checked ${images.length} catalogue images.`);
}

if (missing.length) {
  console.error(`Missing images:\n${missing.join('\n')}`);
  process.exit(1);
}
