import { useState } from 'react';
import { ArrowLeft, Heart, PackageSearch, Share2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useCatalog } from '../data/CatalogContext';
import { defaultVariant } from '../data/catalog';
import { useLang } from '../i18n/LanguageContext';
import { discountPercent, formatRupees } from '../lib/pricing';
import { whatsappUrl } from '../lib/whatsapp';
import { toggleWishlist, wishlistStore } from '../store/stores';
import { ProductGrid } from '../ui/ProductCard';
import { ProductImage } from '../ui/ProductImage';
import { QuantityControl } from '../ui/QuantityControl';
import { EmptyState, LoadError, SectionTitle } from '../ui/states';
import { usePageTitle } from '../ui/usePageTitle';

export default function ProductPage() {
  const { slug = '' } = useParams();
  const { t, pick } = useLang();
  const { catalog, status, productBySlug, categoryById } = useCatalog();
  const wishlist = wishlistStore.useValue();
  const product = productBySlug.get(slug);
  const [chosenId, setChosenId] = useState<string | null>(null);
  usePageTitle(product ? pick(product.nameEn, product.nameHi) : catalog ? t('productNotFound') : null);

  if (!catalog) {
    return (
      <div className="page">
        {status === 'error' ? <LoadError /> : <div className="h-80 animate-pulse rounded-panel bg-sage-mist" role="status" aria-label={t('loading')} />}
      </div>
    );
  }
  if (!product) {
    return (
      <div className="page">
        <EmptyState icon={<PackageSearch className="h-7 w-7" />} title={t('productNotFound')}>
          <Link to="/" className="btn-primary">{t('backToShop')}</Link>
        </EmptyState>
      </div>
    );
  }

  const variant = product.variants.find((v) => v.id === chosenId) ?? defaultVariant(product);
  const category = categoryById.get(product.categoryId);
  const off = discountPercent(variant.price, variant.mrp);
  const saved = wishlist.includes(product.id);
  const name = pick(product.nameEn, product.nameHi);
  const description = pick(product.descriptionEn, product.descriptionHi);
  const related = catalog.products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.variants.some((v) => v.available))
    .slice(0, 4);
  const shareText = `${product.nameEn} (${variant.unitEn}) ${formatRupees(variant.price)} at Order Kaaro: ${window.location.origin}/product/${product.slug}`;

  return (
    <div className="page">
      {category && (
        <Link to={`/category/${category.slug}`} className="mb-2 inline-flex min-h-[44px] items-center gap-1 text-sage hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {pick(category.nameEn, category.nameHi)}
        </Link>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="relative rounded-panel bg-sage-plate p-6">
          <ProductImage product={product} size="full" className="mx-auto aspect-square w-full max-w-sm" dimmed={!variant.available} eager />
          {off && (
            <span className="absolute left-4 top-4 rounded-full bg-peach px-3 text-sm font-semibold leading-7 text-clay">
              {t('percentOff', { n: off })}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-[28px]">{name}</h1>
            {pick(product.nameHi, product.nameEn) !== name && <p className="text-stone">{pick(product.nameHi, product.nameEn)}</p>}
          </div>

          {product.variants.length > 1 && (
            <fieldset>
              <legend className="mb-2 font-semibold">{t('chooseSize')}</legend>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <label
                    key={v.id}
                    className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border px-4 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-ink ${
                      v.id === variant.id ? 'border-sage bg-sage text-white' : 'border-line bg-white hover:border-sage'
                    } ${v.available ? '' : 'opacity-60'}`}
                  >
                    <input type="radio" name="size" value={v.id} checked={v.id === variant.id} onChange={() => setChosenId(v.id)} className="sr-only" />
                    <span className="font-medium">{pick(v.unitEn, v.unitHi)}</span>
                    <span className="text-sm">{formatRupees(v.price)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div>
            <div className="flex items-baseline gap-3">
              <span className="font-display text-[32px] font-semibold">{formatRupees(variant.price)}</span>
              {variant.mrp && variant.mrp > variant.price && (
                <span className="text-stone">
                  {t('mrp')} <span className="line-through">{formatRupees(variant.mrp)}</span>
                </span>
              )}
            </div>
            <p className="text-stone">{pick(variant.unitEn, variant.unitHi)}</p>
          </div>

          <div className="max-w-sm">
            <QuantityControl product={product} variant={variant} />
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => toggleWishlist(product.id)} aria-pressed={saved} className="btn-quiet">
              <Heart className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} aria-hidden="true" /> {saved ? t('saved') : t('save')}
            </button>
            {/* No number: WhatsApp lets the customer pick who to share with. */}
            <a href={whatsappUrl('', shareText)} target="_blank" rel="noreferrer" className="btn-quiet">
              <Share2 className="h-5 w-5" aria-hidden="true" /> {t('shareOnWhatsApp')}
            </a>
          </div>

          <p className="text-sm text-stone">{t('payment')}</p>
          {description && <p className="whitespace-pre-line text-ink-soft">{description}</p>}
        </div>
      </div>

      {related.length > 0 && category && (
        <section className="mt-10" aria-labelledby="related-title">
          <SectionTitle><span id="related-title">{t('moreIn', { category: pick(category.nameEn, category.nameHi) })}</span></SectionTitle>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
