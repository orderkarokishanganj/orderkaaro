// Converts the catalogue photos in public/catalog to resized WebP and uploads them to the
// "product-images" Storage bucket at the paths the seed uses (catalog/<folder>/<name>.webp).
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
const failures = [];

async function convertAndUpload(img) {
  const source = `${root}public${img.legacy}`;
  before += statSync(source).size;
  const webp = await sharp(source)
    .rotate()
    .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  after += webp.length;

  if (dryRun) {
    const target = join(outDir, img.storage_path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, webp);
    return;
  }
  const { error } = await client.storage.from('product-images').upload(img.storage_path, webp, {
    contentType: 'image/webp',
    cacheControl: '31536000',
    upsert: true,
  });
  if (error) failures.push(`${img.storage_path}: ${error.message}`);
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
console.log(`${images.length - failures.length}/${images.length} images ${dryRun ? `converted into ${outDir}` : 'uploaded'}: ${mb(before)} -> ${mb(after)}.`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
