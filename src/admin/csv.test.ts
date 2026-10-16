import { describe, expect, it } from 'vitest';
import { checkImport, parseCsv, productsToRows, toCsv } from './csv';
import type { AdminCategory, AdminProduct } from './data';

const categories: AdminCategory[] = [{ id: 'c1', slug: 'pulses-dal', name_en: 'Pulses & Dal', name_hi: 'दाल व चना', icon: null, active: true, sort_order: 10 }];
const product: AdminProduct = {
  id: 'p1', slug: 'arhar-dal', category_id: 'c1', name_en: 'Arhar Dal, "Premium"', name_hi: 'अरहर दाल', description_en: 'Line one\nline two',
  description_hi: '', search_keywords: ['toor', 'tuvar'], featured: true, active: true, sort_order: 10, updated_at: '',
  product_images: [],
  product_variants: [{ id: '11111111-1111-1111-1111-111111111111', legacy_id: 'P006', unit_en: '1 kg', unit_hi: '1 किलो', price: 130, mrp: 149,
    in_stock: true, track_stock: false, stock_qty: null, low_stock_threshold: 5, max_per_order: 20, sort_order: 0 }],
};

describe('CSV round trip', () => {
  it('exports what it can import back unchanged', () => {
    const csv = toCsv(productsToRows([product], categories));
    expect(csv.startsWith('﻿variant_id,product_slug')).toBe(true);
    const { headerError, rows } = checkImport(csv, new Set(['pulses-dal']));
    expect(headerError).toBeNull();
    expect(rows).toHaveLength(1);
    expect(rows[0].errors).toEqual([]);
    expect(rows[0].data).toMatchObject({
      variant_id: '11111111-1111-1111-1111-111111111111', name_en: 'Arhar Dal, "Premium"', description_en: 'Line one\nline two',
      price: 130, mrp: 149, in_stock: true, track_stock: false, stock_qty: null, featured: true, keywords: ['toor', 'tuvar'],
    });
  });

  it('guards against spreadsheet formulas and restores the text on import', () => {
    const rows = productsToRows([{ ...product, name_en: '=HYPERLINK("x")' }], categories);
    const csv = toCsv(rows);
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    expect(checkImport(csv, new Set(['pulses-dal'])).rows[0].data?.name_en).toBe('=HYPERLINK("x")');
  });
});

describe('parseCsv', () => {
  it('handles quotes, commas, line breaks and CRLF', () => {
    expect(parseCsv('a,b\r\n"x, y","say ""hi""\nthere"\r\n')).toEqual([['a', 'b'], ['x, y', 'say "hi"\nthere']]);
  });
});

describe('checkImport', () => {
  const header = 'product_slug,category_slug,name_en,name_hi,unit_en,unit_hi,price,mrp,track_stock,stock_qty\n';

  it('reports problems per row with the spreadsheet line number', () => {
    const csv = header + [
      'poha,pulses-dal,Poha,पोहा,500 g,500 ग्राम,40,50,no,',
      'poha,pulses-dal,Poha,पोहा,500 g,500 ग्राम,40,50,no,',
      'Bad Slug,pulses-dal,X,X,1 kg,1 किलो,10,,no,',
      'rice,nowhere,Rice,चावल,1 kg,1 किलो,ten,5,yes,',
      'sooji,pulses-dal,Sooji,सूजी,1 kg,1 किलो,60,50,yes,',
    ].join('\n');
    const { rows } = checkImport(csv, new Set(['pulses-dal']));
    expect(rows.map((r) => [r.line, r.errors])).toEqual([
      [2, []],
      [3, ['same product and size as line 2']],
      [4, ['product_slug: lowercase letters, numbers and dashes only']],
      [5, ['price must be a whole number']],
      [6, ['mrp is below price', 'stock_qty is needed when track_stock is yes']],
    ]);
  });

  it('explains a wrong header', () => {
    expect(checkImport('name,price\nx,1', new Set()).headerError).toMatch(/Missing columns: product_slug/);
    expect(checkImport(header, new Set()).headerError).toBe('The file has no product rows.');
  });
});
