import { ArrowLeft, PackageSearch } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useCatalog } from '../data/CatalogContext';
import { useLang } from '../i18n/LanguageContext';
import { ProductGrid, ProductGridSkeleton } from '../ui/ProductCard';
import { EmptyState, LoadError } from '../ui/states';
import { usePageTitle } from '../ui/usePageTitle';

export default function CategoryPage() {
  const { slug = '' } = useParams();
  const { t, pick } = useLang();
  const { catalog, status, categoryBySlug } = useCatalog();
  const category = categoryBySlug.get(slug);
  usePageTitle(category ? pick(category.nameEn, category.nameHi) : catalog ? t('categoryNotFound') : null, {
    description: category
      ? `Buy ${category.nameEn} in Kishanganj from Order Kaaro. Order on WhatsApp and pay cash or UPI on delivery.`
      : undefined,
    noindex: Boolean(catalog && !category),
  });

  if (!catalog) {
    return <div className="page">{status === 'error' ? <LoadError /> : <ProductGridSkeleton count={8} />}</div>;
  }
  if (!category) {
    return (
      <div className="page">
        <EmptyState icon={<PackageSearch className="h-7 w-7" />} title={t('categoryNotFound')}>
          <Link to="/" className="btn-primary">{t('backToShop')}</Link>
        </EmptyState>
      </div>
    );
  }

  const items = catalog.products
    .filter((p) => p.categoryId === category.id)
    .sort((a, b) => Number(b.variants.some((v) => v.available)) - Number(a.variants.some((v) => v.available)) || a.sortOrder - b.sortOrder);

  return (
    <div className="page">
      <Link to="/" className="mb-2 inline-flex min-h-[44px] items-center gap-1 text-sage hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t('backToShop')}
      </Link>
      <h1 className="text-[29px]">{pick(category.nameEn, category.nameHi)}</h1>
      <p className="mb-4 text-stone">{t('productsCount', { n: items.length })}</p>
      <nav aria-label={t('shopByCategory')} className="-mx-4 mb-5 overflow-x-auto px-4">
        <ul className="flex gap-2 pb-1">
          {catalog.categories.map((c) => (
            <li key={c.id} className="flex-none">
              <Link
                to={`/category/${c.slug}`}
                aria-current={c.id === category.id ? 'page' : undefined}
                className={`inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full border px-4 font-medium ${
                  c.id === category.id ? 'border-sage bg-sage text-white' : 'border-line bg-white hover:border-sage'
                }`}
              >
                {pick(c.nameEn, c.nameHi)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {items.length ? <ProductGrid products={items} eagerCount={4} headingLevel={2} /> : (
        <EmptyState icon={<PackageSearch className="h-7 w-7" />} title={t('categoryNotFound')}>
          <Link to="/" className="btn-primary">{t('backToShop')}</Link>
        </EmptyState>
      )}
    </div>
  );
}
