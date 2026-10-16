import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext';
import { EmptyState } from '../ui/states';
import { usePageTitle } from '../ui/usePageTitle';

export default function NotFoundPage() {
  const { t } = useLang();
  usePageTitle(t('notFoundTitle'));
  return (
    <div className="page">
      <EmptyState icon={<Compass className="h-7 w-7" />} title={t('notFoundTitle')} text={t('notFoundText')}>
        <Link to="/" className="btn-primary">{t('backToShop')}</Link>
      </EmptyState>
    </div>
  );
}
