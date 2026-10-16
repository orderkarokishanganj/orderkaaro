import { MessageCircle, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../data/CatalogContext';
import type { Product } from '../data/catalog';
import { useLang } from '../i18n/LanguageContext';
import { formatTime, hoursStatus } from '../lib/hours';
import { formatRupees, freeDeliveryMin } from '../lib/pricing';
import { whatsappUrl } from '../lib/whatsapp';
import { ProductGrid, ProductGridSkeleton } from '../ui/ProductCard';
import { CategoryIcon } from '../ui/CategoryIcon';
import { ProductImage } from '../ui/ProductImage';
import { LoadError, SectionTitle } from '../ui/states';
import { usePageTitle } from '../ui/usePageTitle';

const byShelf = (a: Product, b: Product) =>
  Number(b.variants.some((v) => v.available)) - Number(a.variants.some((v) => v.available)) || a.sortOrder - b.sortOrder;

export default function HomePage() {
  const { t, pick, lang } = useLang();
  const { catalog, status } = useCatalog();
  usePageTitle(null);

  if (!catalog) {
    return (
      <div className="page">
        {status === 'error' ? <LoadError /> : (
          <div role="status" aria-label={t('loading')}>
            <div className="mb-6 h-56 animate-pulse rounded-panel bg-sage-mist" />
            <ProductGridSkeleton />
          </div>
        )}
      </div>
    );
  }

  const { settings, categories, products } = catalog;
  const freeMin = freeDeliveryMin(settings.deliveryTiers);
  const { openNow, today } = hoursStatus(settings.storeHours);
  const featured = products.filter((p) => p.featured).sort(byShelf);
  const essentials = (featured.length ? featured : [...products].sort(byShelf)).slice(0, 8);
  const heroProducts = essentials.filter((p) => p.images.length).slice(0, 3);

  return (
    <div className="page space-y-8">
      <section className="rounded-panel bg-sage-mist px-5 pb-5 pt-6" aria-labelledby="hero-title">
        <h1 id="hero-title" className="max-w-xl text-[29px] tracking-tight">{t('heroTitle')}</h1>
        <p className="mt-2 max-w-xl text-ink-soft">{t('heroSub')}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {freeMin !== null && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-sage">
              <Truck className="h-4 w-4" aria-hidden="true" /> {t('freeDeliveryOn', { amount: formatRupees(freeMin) })}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-sage">
            <span className={`h-2 w-2 rounded-full ${openNow ? 'bg-sage' : 'bg-stone'}`} aria-hidden="true" />
            {openNow && today ? t('openNow', { time: formatTime(today.close, lang) }) : t('closedNow')}
          </span>
        </div>
        {heroProducts.length > 0 && (
          <div className="mt-5 flex" aria-hidden="true">
            {heroProducts.map((p, i) => (
              <span key={p.id} className={`flex h-[88px] w-[88px] items-center justify-center rounded-full ${i % 2 ? 'bg-oat' : 'bg-white'} ${i ? '-ml-3' : ''}`}>
                <ProductImage product={p} className="h-16 w-16" eager />
              </span>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="categories-title">
        <SectionTitle><span id="categories-title">{t('shopByCategory')}</span></SectionTitle>
        <ul className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c.id}>
              <Link to={`/category/${c.slug}`} className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line bg-white px-4 font-medium hover:border-sage">
                <CategoryIcon icon={c.icon} />
                {pick(c.nameEn, c.nameHi)}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="card px-5 py-4" aria-labelledby="how-title">
        <h2 id="how-title" className="text-xl">{t('howItWorks')}</h2>
        <ol className="mt-2 divide-y divide-line">
          {[t('step1'), t('step2'), t('step3')].map((step, i) => (
            <li key={step} className="flex items-center gap-3 py-2.5">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-sage-mist font-display font-semibold text-sage" aria-hidden="true">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="essentials-title">
        <SectionTitle><span id="essentials-title">{t('dailyEssentials')}</span></SectionTitle>
        <ProductGrid products={essentials} eagerCount={4} />
      </section>

      {categories.map((c) => {
        const items = products.filter((p) => p.categoryId === c.id).sort(byShelf);
        if (!items.length) return null;
        return (
          <section key={c.id} aria-labelledby={`cat-${c.slug}`}>
            <SectionTitle action={
              <Link to={`/category/${c.slug}`} className="inline-flex min-h-[44px] items-center font-semibold text-sage hover:underline">
                {t('seeAll')} ({items.length})
              </Link>
            }>
              <span id={`cat-${c.slug}`}>{pick(c.nameEn, c.nameHi)}</span>
            </SectionTitle>
            <ProductGrid products={items.slice(0, 4)} />
          </section>
        );
      })}

      <section className="rounded-panel bg-sage-mist p-5">
        <h2 className="text-xl">{t('helpTitle')}</h2>
        <p className="mt-1 text-ink-soft">{t('helpText')}</p>
        <a href={whatsappUrl(settings.whatsappNumber)} target="_blank" rel="noreferrer" className="btn-primary mt-3">
          <MessageCircle className="h-5 w-5" aria-hidden="true" /> {t('helpButton')}
        </a>
      </section>
    </div>
  );
}
