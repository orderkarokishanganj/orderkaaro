import { useMemo } from 'react';
import { MessageCircle, SearchX } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCatalog } from '../data/CatalogContext';
import { useLang } from '../i18n/LanguageContext';
import { search } from '../lib/search';
import { whatsappUrl } from '../lib/whatsapp';
import { ProductGrid, ProductGridSkeleton } from '../ui/ProductCard';
import { EmptyState, LoadError } from '../ui/states';
import { usePageTitle } from '../ui/usePageTitle';

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = (params.get('q') ?? '').trim();
  const { t, pick } = useLang();
  const { catalog, status, searchIndex } = useCatalog();
  usePageTitle(query ? t('searchResults', { q: query }) : t('searchTitle'));

  const results = useMemo(() => search(searchIndex, query).map((r) => r.product), [searchIndex, query]);

  if (!catalog) {
    return <div className="page">{status === 'error' ? <LoadError /> : <ProductGridSkeleton />}</div>;
  }

  if (!query) {
    return (
      <div className="page">
        <h1 className="text-[29px]">{t('searchTitle')}</h1>
        <p className="mt-1 text-stone">{t('searchHint')}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {catalog.categories.map((c) => (
            <li key={c.id}>
              <Link to={`/category/${c.slug}`} className="inline-flex min-h-[44px] items-center rounded-full border border-line bg-white px-4 font-medium hover:border-sage">
                {pick(c.nameEn, c.nameHi)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="text-[26px]" aria-live="polite">{t('searchResults', { q: query })}</h1>
      <p className="mb-4 text-stone">{t('productsCount', { n: results.length })}</p>
      {results.length ? <ProductGrid products={results} eagerCount={4} headingLevel={2} /> : (
        <EmptyState icon={<SearchX className="h-7 w-7" />} title={t('noResults', { q: query })} text={t('noResultsHint')}>
          <a
            href={whatsappUrl(catalog.settings.whatsappNumber, `Hi, do you have ${query}?`)}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" /> {t('askOnWhatsApp')}
          </a>
        </EmptyState>
      )}
    </div>
  );
}
