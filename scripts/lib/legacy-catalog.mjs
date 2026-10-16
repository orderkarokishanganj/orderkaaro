// Reads the old catalogue in public/app.js and shapes it into categories, products
// (one per name) and variants (one per size). Used by the seed generator and the image scripts.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const CATEGORY_ORDER = [
  'Atta, Rice & Grains',
  'Pulses & Dal',
  'Cooking Oils & Ghee',
  'Tea & Beverages',
  'Biscuits & Bakery',
  'Snacks & Instant',
  'Spices & Dry Fruits',
  'Dairy & Household',
];

const UNIT_HI = { kg: 'किलो', g: 'ग्राम', l: 'लीटर', ml: 'मि.ली.', pcs: 'पीस', pc: 'पीस', box: 'डिब्बा', pack: 'पैकेट' };
const UNIT_GRAMS = { kg: 1000, g: 1, l: 1000, ml: 1 };

export function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
}

export function unitToHindi(unit) {
  const m = unit.trim().match(/^([\d.]+)\s*([a-zA-Z]+)$/);
  if (!m) return unit;
  const hi = UNIT_HI[m[2].toLowerCase()];
  return hi ? `${m[1]} ${hi}` : unit;
}

// Sort key so variants list smallest first: weights/volumes by size, then packs and boxes.
function unitSortKey(unit) {
  const m = unit.trim().match(/^([\d.]+)\s*([a-zA-Z]+)$/);
  if (!m) return Number.MAX_SAFE_INTEGER;
  const grams = UNIT_GRAMS[m[2].toLowerCase()];
  return grams ? Number(m[1]) * grams : 1e9 + Number(m[1]);
}

// "/catalog/grains/sooji.png" -> "catalog/grains/sooji.webp" (path in the Storage bucket).
export function storagePathFor(legacyImage) {
  return legacyImage.replace(/^\//, '').toLowerCase().replace(/\.(png|jpe?g|webp)$/, '.webp');
}

function extractArray(source, declaration) {
  const start = source.indexOf(declaration);
  if (start === -1) throw new Error(`Could not find "${declaration}" in public/app.js`);
  const open = source.indexOf('[', start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '[') depth++;
    else if (source[i] === ']' && --depth === 0) {
      return vm.runInNewContext(source.slice(open, i + 1));
    }
  }
  throw new Error(`Unclosed array for "${declaration}"`);
}

function extractObject(source, declaration) {
  const start = source.indexOf(declaration);
  if (start === -1) throw new Error(`Could not find "${declaration}" in public/app.js`);
  const open = source.indexOf('{', start);
  const close = source.indexOf('};', open);
  return vm.runInNewContext(`(${source.slice(open, close + 1)})`);
}

export function loadLegacyCatalog(appJsPath) {
  const source = readFileSync(appJsPath, 'utf8');
  const items = extractArray(source, 'const productsDatabase =');
  const catHi = extractObject(source, 'const catHiMap =');
  const featuredIds = new Set(extractArray(source, 'const featuredIds ='));
  const warnings = [];

  const categories = CATEGORY_ORDER.map((name, i) => ({
    slug: slugify(name),
    name_en: name,
    name_hi: catHi[name],
    sort_order: (i + 1) * 10,
  }));
  const categorySlug = new Map(categories.map((c) => [c.name_en, c.slug]));

  const groups = new Map();
  for (const item of items) {
    if (!categorySlug.has(item.category)) throw new Error(`${item.id}: unknown category "${item.category}"`);
    if (!item.nameHi) throw new Error(`${item.id}: missing Hindi name`);
    if (typeof item.price !== 'number' || typeof item.mrp !== 'number') throw new Error(`${item.id}: missing price or MRP`);
    const key = `${item.category}|${item.name.trim().toLowerCase()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }

  const products = [];
  const usedSlugs = new Set();
  let order = 0;
  for (const group of groups.values()) {
    const first = group[0];
    const variants = [];
    for (const item of group) {
      const dup = variants.find((v) => v.unit_en === item.unit.trim() && v.price === item.price);
      if (dup) {
        warnings.push(`${item.id} duplicates ${dup.legacy_id} (${item.name}, ${item.unit}, ₹${item.price}); imported once.`);
        continue;
      }
      variants.push({
        legacy_id: item.id.toUpperCase(),
        unit_en: item.unit.trim(),
        unit_hi: unitToHindi(item.unit),
        price: item.price,
        mrp: Math.max(item.mrp, item.price),
        image: item.image || null,
      });
    }
    variants.sort((a, b) => unitSortKey(a.unit_en) - unitSortKey(b.unit_en));
    variants.forEach((v, i) => { v.sort_order = i; });

    let slug = slugify(first.name.trim());
    for (let n = 2; usedSlugs.has(slug); n++) slug = `${slugify(first.name.trim())}-${n}`;
    usedSlugs.add(slug);

    const images = [...new Set(variants.map((v) => v.image).filter(Boolean))];
    products.push({
      slug,
      category_slug: categorySlug.get(first.category),
      name_en: first.name.trim(),
      name_hi: first.nameHi.trim(),
      featured: group.some((item) => featuredIds.has(item.id)),
      sort_order: (order += 10),
      variants,
      images: images.map((legacy, i) => ({ legacy, storage_path: storagePathFor(legacy), is_primary: i === 0, sort_order: i })),
    });
  }

  return { categories, products, warnings, legacyCount: items.length };
}
