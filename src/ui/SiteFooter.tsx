import { Clock, Mail, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../data/CatalogContext';
import { useLang } from '../i18n/LanguageContext';
import { weeklySummary } from '../lib/hours';
import { whatsappUrl } from '../lib/whatsapp';

export function SiteFooter() {
  const { t, lang } = useLang();
  const { catalog } = useCatalog();
  const s = catalog?.settings;

  return (
    <footer className="mt-12 border-t border-line bg-white">
      <div className="page grid gap-8 py-8 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-semibold">Order Kaaro</p>
          <p className="mt-1 text-stone">{t('footerNote')}</p>
          <p className="mt-2 text-sm text-stone">{t('payment')}</p>
        </div>
        {s && (
          <div>
            <h2 className="flex items-center gap-2 font-body text-base font-semibold">
              <Clock className="h-4 w-4 text-sage" aria-hidden="true" /> {t('storeHours')}
            </h2>
            <dl className="mt-2 space-y-1 text-stone">
              {weeklySummary(s.storeHours, lang).map((row) => (
                <div key={row.days} className="flex justify-between gap-4">
                  <dt>{row.days}</dt>
                  <dd className="text-ink">{row.hours}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        {s && (
          <div>
            <h2 className="font-body text-base font-semibold">{t('contactUs')}</h2>
            <ul className="mt-2 space-y-1">
              <li>
                <a href={whatsappUrl(s.whatsappNumber)} target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center gap-2 text-sage hover:underline">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
                </a>
              </li>
              {s.contactPhone && (
                <li>
                  <a href={`tel:${s.contactPhone.replace(/\s/g, '')}`} className="inline-flex min-h-[44px] items-center gap-2 text-sage hover:underline">
                    <Phone className="h-4 w-4" aria-hidden="true" /> {s.contactPhone}
                  </a>
                </li>
              )}
              {s.contactEmail && (
                <li>
                  <a href={`mailto:${s.contactEmail}`} className="inline-flex min-h-[44px] items-center gap-2 break-all text-sage hover:underline">
                    <Mail className="h-4 w-4 flex-none" aria-hidden="true" /> {s.contactEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      <nav aria-label="Footer" className="page flex flex-wrap gap-x-5 gap-y-1 border-t border-line py-4 text-sm">
        <Link to="/about" className="inline-flex min-h-[44px] items-center text-stone hover:text-ink">{t('navAbout')}</Link>
        <Link to="/contact" className="inline-flex min-h-[44px] items-center text-stone hover:text-ink">{t('navContact')}</Link>
        <Link to="/terms" className="inline-flex min-h-[44px] items-center text-stone hover:text-ink">{t('navTerms')}</Link>
        <Link to="/privacy" className="inline-flex min-h-[44px] items-center text-stone hover:text-ink">{t('navPrivacy')}</Link>
        <Link to="/cookies" className="inline-flex min-h-[44px] items-center text-stone hover:text-ink">{t('navCookies')}</Link>
        <span className="inline-flex min-h-[44px] items-center text-stone">© {new Date().getFullYear()} Order Kaaro</span>
      </nav>
    </footer>
  );
}
