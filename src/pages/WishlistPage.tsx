import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../data/CatalogContext';
import { useLang } from '../i18n/LanguageContext';
import { wishlistStore } from '../store/stores';
import { ProductGrid, ProductGridSkeleton } from '../ui/ProductCard';
import { EmptyState, LoadError } from '../ui/states';
import { usePageTitle } from '../ui/usePageTitle';

export default function WishlistPage() {
  const { t } = useLang();
  const { catalog, status, productById } = useCatalog();
  const ids = wishlistStore.useValue();
  usePageTitle(t('wishlistTitle'));

  if (!catalog && ids.length) {
    return <div className="page">{status === 'error' ? <LoadError /> : <ProductGridSkeleton count={4} />}</div>;
  }
  const products = ids.map((id) => productById.get(id)).filter((p) => p !== undefined);

  return (
    <div className="page">
      <h1 className="mb-4 text-[29px]">{t('wishlistTitle')}</h1>
      {products.length ? <ProductGrid products={products} /> : (
        <EmptyState icon={<Heart className="h-7 w-7" />} title={t('wishlistEmpty')} text={t('wishlistHint')}>
          <Link to="/" className="btn-primary">{t('startShopping')}</Link>
        </EmptyState>
      )}
    </div>
  );
}
