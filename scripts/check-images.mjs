// Fails (exit 1) if any product_images row in Supabase does not load from Storage, checking both
// the full photo and its thumbs/ copy.
//   npm run images:check            -> live project
//   npm run images:check -- --test  -> test project
import { supabaseEnv } from './lib/env.mjs';

const { url, anonKey } = supabaseEnv({ test: process.argv.includes('--test') });
const res = await fetch(`${url}/rest/v1/product_images?select=storage_path`, {
  headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
});
if (!res.ok) {
  console.error(`Could not read product_images: HTTP ${res.status}`);
  process.exit(1);
}
const rows = await res.json();
const paths = rows.flatMap(({ storage_path }) => [storage_path, `thumbs/${storage_path}`]);
const missing = [];
await Promise.all(paths.map(async (path) => {
  const head = await fetch(`${url}/storage/v1/object/public/product-images/${path}`, { method: 'HEAD' });
  if (!head.ok) missing.push(`${path} (HTTP ${head.status})`);
}));
console.log(`Checked ${paths.length} image files in Storage.`);
if (missing.length) {
  console.error(`Missing:\n${missing.join('\n')}`);
  process.exit(1);
}
