import { describe, expect, it } from 'vitest';
import { buildRobots } from '../../api/robots.js';
import { buildSitemap, STATIC_PAGES } from '../../api/sitemap.js';
import type { Category, Product, StoreSettings } from '../../src/data/catalog';
import { internationalPhone, productJsonLd, storeJsonLd } from '../../src/lib/structuredData';

describe('sitemap', () => {
  it('lists public pages, categories and products with escaped addresses', () => {
    const xml = buildSitemap('https://shop.example', {
      categories: [{ slug: 'pulses-dal', updated_at: '2026-10-16T08:00:00Z' }],
      products: [{ slug: 'arhar-dal', updated_at: '2026-10-17T09:30:00Z' }, { slug: 'a&b' }],
    });
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml.match(/<url>/g)).toHaveLength(STATIC_PAGES.length + 3);
    expect(xml).toContain('<loc>https://shop.example/</loc>');
    expect(xml).toContain('<loc>https://shop.example/category/pulses-dal</loc><lastmod>2026-10-16</lastmod>');
    expect(xml).toContain('<loc>https://shop.example/product/arhar-dal</loc><lastmod>2026-10-17</lastmod>');
    expect(xml).toContain('<loc>https://shop.example/product/a&#38;b</loc></url>');
    expect(xml).not.toMatch(/\/(cart|checkout|admin|orders|wishlist)/);
  });
});

describe('robots.txt', () => {
  it('keeps private pages out and points at the sitemap on the same domain', () => {
    const txt = buildRobots('https://shop.example');
    for (const path of ['/admin', '/cart', '/checkout', '/order/']) expect(txt).toContain(`Disallow: ${path}\n`);
    expect(txt).toContain('Sitemap: https://shop.example/sitemap.xml');
  });
});

const settings: StoreSettings = {
  whatsappNumber: '919942089120', deliveryTiers: [], minOrderValue: 0, deliveryPincodes: [],
  storeHours: { mon: { open: '09:00', close: '21:00' }, sun: { open: '10:00', close: '18:00' } },
  storeOpen: true, closedMessageEn: '', closedMessageHi: '', announcementEn: '', announcementHi: '',
  contactPhone: '', alternatePhone: '', contactEmail: '', address: '', googleReviewUrl: '',
};

describe('structured data', () => {
  it('formats Indian phone numbers', () => {
    expect(internationalPhone('919942089120')).toBe('+919942089120');
    expect(internationalPhone('099420 89120')).toBe('+919942089120');
    expect(internationalPhone('12345')).toBeNull();
  });

  it('describes the store from settings only', () => {
    const ld = storeJsonLd(settings, 'https://shop.example');
    expect(ld['@type']).toBe('GroceryStore');
    expect(ld.telephone).toBe('+919942089120');
    expect(ld).not.toHaveProperty('email');
    expect(ld).not.toHaveProperty('aggregateRating');
    expect(ld.address).not.toHaveProperty('streetAddress');
    expect(ld.openingHoursSpecification).toEqual([
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Monday', opens: '09:00', closes: '21:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '10:00', closes: '18:00' },
    ]);
  });

  it('gives products an offer per size and a breadcrumb', () => {
    const category: Category = { id: 'c', slug: 'pulses-dal', nameEn: 'Pulses', nameHi: 'दालें', icon: null, sortOrder: 0 };
    const variant = (id: string, price: number, available: boolean) => ({
      id, productId: 'p', legacyId: null, unitEn: id, unitHi: id, price, mrp: null, available, maxQuantity: 5,
    });
    const product: Product = {
      id: 'p', slug: 'arhar-dal', categoryId: 'c', nameEn: 'Arhar Dal', nameHi: 'अरहर दाल', descriptionEn: '', descriptionHi: '',
      keywords: [], featured: false, sortOrder: 0, images: [], variants: [variant('500 g', 70, true), variant('1 kg', 130, false)],
    };
    const [item, crumbs] = productJsonLd(product, category, 'https://shop.example', null);
    expect(item).not.toHaveProperty('image');
    expect(item.offers).toMatchObject({ '@type': 'AggregateOffer', lowPrice: 70, highPrice: 130, offerCount: 2 });
    const offers = (item.offers as { offers: { availability: string }[] }).offers;
    expect(offers.map((o) => o.availability)).toEqual(['https://schema.org/InStock', 'https://schema.org/OutOfStock']);
    expect(crumbs.itemListElement).toHaveLength(3);
  });
});
