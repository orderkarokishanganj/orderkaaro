import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { defaultVariant, type Product } from '../data/catalog';
import { useLang } from '../i18n/LanguageContext';
import { discountPercent, formatRupees } from '../lib/pricing';
import { toggleWishlist, wishlistStore } from '../store/stores';
import { ProductImage } from './ProductImage';
import { QuantityControl } from './QuantityControl';

/** headingLevel: 3 under a section title, 2 when the grid sits straight under the page's h1. */
export function ProductCard({ product, eager = false, headingLevel = 3 }: { product: Product; eager?: boolean; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const { t, pick } = useLang();
  const wishlist = wishlistStore.useValue();
  const variant = defaultVariant(product);
  const off = discountPercent(variant.price, variant.mrp);
  const saved = wishlist.includes(product.id);
  const name = pick(product.nameEn, product.nameHi);
  const sizes = product.variants.length;

  return (
    <article className="card relative flex flex-col gap-1 p-2 pb-3">
      <Link to={`/product/${product.slug}`} className="relative block rounded-plate bg-sage-plate">
        <ProductImage product={product} className="mx-auto h-32 w-full p-3" dimmed={!variant.available} eager={eager} />
        {off && (
          <span className="absolute left-2 top-2 rounded-full bg-peach px-2 text-xs font-semibold leading-6 text-clay">
            {t('percentOff', { n: off })}
          </span>
        )}
      </Link>
      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        aria-pressed={saved}
        aria-label={`${saved ? t('saved') : t('save')}: ${name}`}
        className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-sage"
      >
        <Heart className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} aria-hidden="true" />
      </button>
      <Link to={`/product/${product.slug}`} className="px-1 pt-1">
        <Heading className="line-clamp-2 min-h-[2.6em] font-body text-[15px] font-semibold leading-snug">{name}</Heading>
      </Link>
      <div className="px-1 text-sm text-stone">
        {pick(variant.unitEn, variant.unitHi)}
        {sizes > 1 && (
          <Link to={`/product/${product.slug}`} className="ml-1 text-sage underline-offset-2 hover:underline">
            · {pick(`${sizes} sizes`, `${sizes} साइज़`)}
          </Link>
        )}
      </div>
      <div className="flex items-baseline gap-2 px-1 pb-1">
        <span className="font-display text-xl font-semibold">{formatRupees(variant.price)}</span>
        {variant.mrp && variant.mrp > variant.price && (
          <span className="text-sm text-stone line-through">
            <span className="sr-only">{t('mrp')} </span>{formatRupees(variant.mrp)}
          </span>
        )}
      </div>
      <QuantityControl product={product} variant={variant} />
    </article>
  );
}

export function ProductGrid({ products, eagerCount = 0, headingLevel }: { products: Product[]; eagerCount?: number; headingLevel?: 2 | 3 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} eager={i < eagerCount} headingLevel={headingLevel} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card animate-pulse p-2 pb-3">
          <div className="h-32 rounded-plate bg-sage-plate" />
          <div className="mx-1 mt-3 h-4 rounded bg-sage-plate" />
          <div className="mx-1 mt-2 h-4 w-1/2 rounded bg-sage-plate" />
          <div className="mt-4 h-11 rounded-full bg-sage-plate" />
        </div>
      ))}
    </div>
  );
}
