import type { ReactNode } from 'react';
import { MessageCircle, RefreshCw, WifiOff } from 'lucide-react';
import { useCatalog } from '../data/CatalogContext';
import { useLang } from '../i18n/LanguageContext';
import { whatsappUrl } from '../lib/whatsapp';

// Used if settings could not be loaded at all (first visit while offline).
export const FALLBACK_WHATSAPP = '919942089120';

export function EmptyState({ icon, title, text, children }: { icon: ReactNode; title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="card mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-mist text-sage" aria-hidden="true">{icon}</div>
      <h2 className="text-xl">{title}</h2>
      {text && <p className="text-stone">{text}</p>}
      {children && <div className="mt-2 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

/** Shown when the catalogue could not be loaded and nothing is saved on the phone. */
export function LoadError() {
  const { t } = useLang();
  const { refresh, catalog } = useCatalog();
  return (
    <EmptyState icon={<WifiOff className="h-7 w-7" />} title={t('loadFailed')} text={t('loadFailedText')}>
      <button type="button" onClick={refresh} className="btn-primary">
        <RefreshCw className="h-5 w-5" aria-hidden="true" /> {t('tryAgain')}
      </button>
      <a href={whatsappUrl(catalog?.settings.whatsappNumber ?? FALLBACK_WHATSAPP)} target="_blank" rel="noreferrer" className="btn-outline">
        <MessageCircle className="h-5 w-5" aria-hidden="true" /> {t('helpButton')}
      </a>
    </EmptyState>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-[22px]">{children}</h2>
      {action}
    </div>
  );
}
