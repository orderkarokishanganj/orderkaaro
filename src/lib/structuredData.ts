// schema.org data for search engines (JSON-LD). Built only from what the shop has entered in
// settings and the catalogue: nothing here is made up (no ratings, no price range, no delivery promises).
import type { Category, Product, StoreSettings } from '../data/catalog';
import { DAYS, type DayKey } from './hours';

type JsonLd = Record<string, unknown>;

const DAY_NAME: Record<DayKey, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};
export const INSTAGRAM_URL = 'https://www.instagram.com/order.kaaro';

/** Indian phone number in international form (+91…), or null if it isn't a 10-digit mobile. */
export function internationalPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  return /^\d{10}$/.test(digits) ? `+91${digits}` : null;
}

export function storeJsonLd(settings: StoreSettings, origin: string): JsonLd {
  const hours = DAYS.flatMap((day) => {
    const h = settings.storeHours[day];
    return h ? [{ '@type': 'OpeningHoursSpecification', dayOfWeek: DAY_NAME[day], opens: h.open, closes: h.close }] : [];
  });
  const phone = internationalPhone(settings.contactPhone) ?? internationalPhone(settings.whatsappNumber);
  return {
    '@context': 'https://schema.org',
    '@type': 'GroceryStore',
    '@id': `${origin}/#store`,
    name: 'Order Kaaro',
    url: `${origin}/`,
    logo: `${origin}/icons/icon-512.png`,
    image: `${origin}/icons/share.jpg`,
    ...(phone && { telephone: phone }),
    ...(settings.contactEmail && { email: settings.contactEmail }),
    address: {
      '@type': 'PostalAddress',
      ...(settings.address && { streetAddress: settings.address }),
      addressLocality: 'Kishanganj',
      addressRegion: 'Bihar',
      addressCountry: 'IN',
    },
    ...(hours.length && { openingHoursSpecification: hours }),
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, UPI',
    sameAs: [INSTAGRAM_URL],
  };
}

export function productJsonLd(product: Product, category: Category | undefined, origin: string, imageUrl: string | null): JsonLd[] {
  const url = `${origin}/product/${product.slug}`;
  const offer = (v: Product['variants'][number]) => ({
    '@type': 'Offer',
    name: v.unitEn,
    price: v.price,
    priceCurrency: 'INR',
    availability: v.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    url,
    seller: { '@id': `${origin}/#store` },
  });
  const prices = product.variants.map((v) => v.price);
  const item: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nameEn,
    ...(product.nameHi && product.nameHi !== product.nameEn && { alternateName: product.nameHi }),
    ...(product.descriptionEn && { description: product.descriptionEn }),
    ...(imageUrl && { image: imageUrl }),
    ...(category && { category: category.nameEn }),
    url,
    offers: product.variants.length === 1
      ? offer(product.variants[0])
      : {
          '@type': 'AggregateOffer',
          priceCurrency: 'INR',
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          offerCount: product.variants.length,
          offers: product.variants.map(offer),
        },
  };
  const crumbs = [
    { name: 'Home', url: `${origin}/` },
    ...(category ? [{ name: category.nameEn, url: `${origin}/category/${category.slug}` }] : []),
    { name: product.nameEn, url },
  ];
  const breadcrumb: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
  };
  return [item, breadcrumb];
}
