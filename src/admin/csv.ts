import { z } from 'zod';
import type { AdminCategory, AdminProduct } from './data';

// One row per size. variant_id is filled in on export so re-importing updates the same sizes;
// leave it empty to add new products or sizes. Keywords are separated by "|".
export const CSV_COLUMNS = [
  'variant_id', 'product_slug', 'category_slug', 'name_en', 'name_hi', 'unit_en', 'unit_hi', 'price', 'mrp',
  'in_stock', 'track_stock', 'stock_qty', 'max_per_order', 'active', 'featured', 'keywords', 'description_en', 'description_hi',
] as const;
type Column = (typeof CSV_COLUMNS)[number];

const TEXT_COLUMNS = new Set<Column>(['name_en', 'name_hi', 'unit_en', 'unit_hi', 'keywords', 'description_en', 'description_hi']);

function cell(value: string, guard: boolean): string {
  // Spreadsheet apps run cells starting with = + - @ as formulas; prefix them so they stay text.
  const safe = guard && /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(rows: Array<Record<Column, string>>): string {
  const lines = [CSV_COLUMNS.join(',')];
  for (const row of rows) lines.push(CSV_COLUMNS.map((c) => cell(row[c] ?? '', TEXT_COLUMNS.has(c))).join(','));
  // The byte-order mark makes Excel read Hindi correctly.
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

export function productsToRows(products: AdminProduct[], categories: AdminCategory[]): Array<Record<Column, string>> {
  const slugOf = new Map(categories.map((c) => [c.id, c.slug]));
  const yes = (b: boolean) => (b ? 'yes' : 'no');
  return products.flatMap((p) => p.product_variants.map((v) => ({
    variant_id: v.id,
    product_slug: p.slug,
    category_slug: slugOf.get(p.category_id) ?? '',
    name_en: p.name_en,
    name_hi: p.name_hi,
    unit_en: v.unit_en,
    unit_hi: v.unit_hi,
    price: String(v.price),
    mrp: v.mrp === null ? '' : String(v.mrp),
    in_stock: yes(v.in_stock),
    track_stock: yes(v.track_stock),
    stock_qty: v.stock_qty === null ? '' : String(v.stock_qty),
    max_per_order: String(v.max_per_order),
    active: yes(p.active),
    featured: yes(p.featured),
    keywords: p.search_keywords.join('|'),
    description_en: p.description_en,
    description_hi: p.description_hi,
  })));
}

export function exportProductsCsv(products: AdminProduct[], categories: AdminCategory[]) {
  const blob = new Blob([toCsv(productsToRows(products, categories))], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `order-kaaro-products-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** RFC 4180 CSV: quoted fields, doubled quotes, commas and line breaks inside quotes, CRLF or LF. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"' && field === '') quoted = true;
    else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += ch;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const yesNo = z.string().trim().toLowerCase().refine((v) => ['', 'yes', 'no', 'true', 'false', '1', '0', 'y', 'n'].includes(v), 'use yes or no')
  .transform((v) => (v === '' ? undefined : ['yes', 'true', '1', 'y'].includes(v)));
const whole = (label: string) => z.string().trim().regex(/^\d+$/, `${label} must be a whole number`).transform(Number);
const optionalWhole = (label: string) => z.string().trim().regex(/^\d*$/, `${label} must be a whole number`).transform((v) => (v === '' ? null : Number(v)));
const text = (label: string, max: number, required = true) =>
  z.string().trim().max(max, `${label} is too long`).refine((v) => !required || v.length > 0, `${label} is missing`)
    .transform((v) => v.replace(/^'(?=[=+\-@])/, '')); // undo the export's formula guard

const rowSchema = z.object({
  variant_id: z.string().trim().refine((v) => v === '' || /^[0-9a-f-]{36}$/i.test(v), 'variant_id is not valid'),
  product_slug: z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'product_slug: lowercase letters, numbers and dashes only'),
  category_slug: z.string().trim().min(1, 'category_slug is missing'),
  name_en: text('name_en', 120),
  name_hi: text('name_hi', 120),
  unit_en: text('unit_en', 40),
  unit_hi: text('unit_hi', 40),
  price: whole('price'),
  mrp: optionalWhole('mrp'),
  in_stock: yesNo,
  track_stock: yesNo,
  stock_qty: optionalWhole('stock_qty'),
  max_per_order: optionalWhole('max_per_order'),
  active: yesNo,
  featured: yesNo,
  keywords: text('keywords', 1000, false).transform((v) => v.split('|').map((k) => k.trim()).filter(Boolean)),
  description_en: text('description_en', 2000, false),
  description_hi: text('description_hi', 2000, false),
});
export type ImportRow = z.output<typeof rowSchema>;

export interface CheckedRow {
  /** Spreadsheet line number, so the owner can find it (header is line 1). */
  line: number;
  data: ImportRow | null;
  errors: string[];
}

/** Checks every row before anything is saved. Returns a header problem, or one result per row. */
export function checkImport(text: string, categorySlugs: Set<string>): { headerError: string | null; rows: CheckedRow[] } {
  const table = parseCsv(text);
  if (table.length < 2) return { headerError: 'The file has no product rows.', rows: [] };
  const header = table[0].map((h) => h.trim().toLowerCase());
  const missing = ['product_slug', 'category_slug', 'name_en', 'name_hi', 'unit_en', 'unit_hi', 'price'].filter((c) => !header.includes(c));
  if (missing.length) return { headerError: `Missing columns: ${missing.join(', ')}. Export a CSV first to see the format.`, rows: [] };
  if (table.length - 1 > 2000) return { headerError: 'Import at most 2000 rows at a time.', rows: [] };

  const seen = new Map<string, number>();
  const rows = table.slice(1).map((cells, i): CheckedRow => {
    const line = i + 2;
    const raw = Object.fromEntries(CSV_COLUMNS.map((c) => [c, cells[header.indexOf(c)] ?? '']));
    const parsed = rowSchema.safeParse(raw);
    if (!parsed.success) return { line, data: null, errors: [...new Set(parsed.error.issues.map((x) => x.message))] };
    const d = parsed.data;
    const errors: string[] = [];
    if (!categorySlugs.has(d.category_slug)) errors.push(`no category "${d.category_slug}"`);
    if (d.mrp !== null && d.mrp < d.price) errors.push('mrp is below price');
    if (d.track_stock && d.stock_qty === null) errors.push('stock_qty is needed when track_stock is yes');
    if (d.max_per_order !== null && (d.max_per_order < 1 || d.max_per_order > 999)) errors.push('max_per_order must be 1 to 999');
    const key = `${d.product_slug}|${d.unit_en.toLowerCase()}`;
    if (seen.has(key)) errors.push(`same product and size as line ${seen.get(key)}`);
    else seen.set(key, line);
    return { line, data: errors.length ? null : d, errors };
  });
  return { headerError: null, rows };
}
