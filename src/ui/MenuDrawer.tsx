import { useEffect, useRef } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../data/CatalogContext';
import { useLang } from '../i18n/LanguageContext';
import type { StringKey } from '../i18n/strings';
import { whatsappUrl } from '../lib/whatsapp';

const LINKS: Array<[string, StringKey]> = [
  ['/', 'navHome'],
  ['/orders', 'navOrders'],
  ['/wishlist', 'navWishlist'],
  ['/about', 'navAbout'],
  ['/contact', 'navContact'],
  ['/terms', 'navTerms'],
  ['/privacy', 'navPrivacy'],
];

export function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, pick } = useLang();
  const { catalog } = useCatalog();
  const panel = useRef<HTMLDivElement>(null);
  const settings = catalog?.settings;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('a, button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panel.current) {
        const focusable = panel.current.querySelectorAll<HTMLElement>('a, button');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={t('menu')}
        className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col gap-1 overflow-y-auto bg-oat p-4"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-2xl font-semibold">{t('brand')}</span>
          <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sage-mist" aria-label={t('closeMenu')}>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label={t('menu')}>
          <ul className="flex flex-col">
            {LINKS.map(([to, key]) => (
              <li key={to}>
                <Link to={to} onClick={onClose} className="flex min-h-[48px] items-center rounded-2xl px-3 text-lg hover:bg-sage-mist">
                  {t(key)}
                </Link>
              </li>
            ))}
            {catalog?.categories.map((c) => (
              <li key={c.id}>
                <Link to={`/category/${c.slug}`} onClick={onClose} className="flex min-h-[44px] items-center rounded-2xl px-3 pl-6 text-stone hover:bg-sage-mist hover:text-ink">
                  {pick(c.nameEn, c.nameHi)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {settings && (
          <div className="mt-4 flex flex-col gap-2">
            <a href={whatsappUrl(settings.whatsappNumber)} className="btn-primary" target="_blank" rel="noreferrer">
              <MessageCircle className="h-5 w-5" aria-hidden="true" /> {t('helpButton')}
            </a>
            {settings.contactPhone && (
              <a href={`tel:${settings.contactPhone.replace(/\s/g, '')}`} className="btn-quiet">
                <Phone className="h-5 w-5" aria-hidden="true" /> {settings.contactPhone}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
