// Converts the catalogue photos in public/catalog to resized WebP and uploads them to the
// "product-images" Storage bucket at the paths the seed uses (catalog/<folder>/<name>.webp),
// plus a 320px copy under thumbs/ (thumbs/catalog/...) for product grids.
//   npm run images:import            -> live project (needs SUPABASE_SERVICE_ROLE_KEY in .env)
//   npm run images:import -- --test  -> test project (TEST_ variables)
//   npm run images:import -- --dry-run -> convert only, write files to a temp folder, upload nothing
import { createClient } from '@supabase/supabase-js';
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { supabaseEnv } from './lib/env.mjs';
import { loadLegacyCatalog } from './lib/legacy-catalog.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const dryRun = process.argv.includes('--dry-run');
const test = process.argv.includes('--test');

const { products } = loadLegacyCatalog(`${root}public/app.js`);
const images = [...new Map(products.flatMap((p) => p.images).map((img) => [img.storage_path, img])).values()];

let client = null;
if (!dryRun) {
  const env = supabaseEnv({ test, needServiceKey: true });
  client = createClient(env.url, env.serviceKey, { auth: { persistSession: false } });
}
const outDir = join(tmpdir(), 'order-kaaro-webp');

let before = 0;
let after = 0;
let thumbs = 0;
const failures = [];

async function convertAndUpload(img) {
  const source = `${root}public${img.legacy}`;
  before += statSync(source).size;
  const versions = [
    { path: img.storage_path, size: 800, quality: 80 },
    { path: `thumbs/${img.storage_path}`, size: 320, quality: 75 },
  ];
  for (const v of versions) {
    const webp = await sharp(source)
      .rotate()
      .resize({ width: v.size, height: v.size, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: v.quality })
      .toBuffer();
    if (v.size === 800) after += webp.length;
    else thumbs += webp.length;

    if (dryRun) {
      const target = join(outDir, v.path);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, webp);
      continue;
    }
    const { error } = await client.storage.from('product-images').upload(v.path, webp, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: true,
    });
    if (error) failures.push(`${v.path}: ${error.message}`);
  }
}

// A few uploads at a time keeps this quick without hammering the API.
const queue = [...images];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const img = queue.shift();
    try {
      await convertAndUpload(img);
    } catch (err) {
      failures.push(`${img.storage_path}: ${err.message}`);
    }
  }
}));

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;
console.log(`${images.length}/${images.length} images ${dryRun ? `converted into ${outDir}` : 'processed'}: ${mb(before)} -> ${mb(after)} full size, ${mb(thumbs)} thumbnails.`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
