import { Camera, Clock, Mail, MessageCircle, Phone } from 'lucide-react';
import { useCatalog } from '../data/CatalogContext';
import { useLang } from '../i18n/LanguageContext';
import { weeklySummary } from '../lib/hours';
import { whatsappUrl } from '../lib/whatsapp';
import { FALLBACK_WHATSAPP } from '../ui/states';
import { usePageTitle } from '../ui/usePageTitle';

const INSTAGRAM = 'https://www.instagram.com/order.kaaro';

export default function ContactPage() {
  const { t, lang } = useLang();
  const { catalog } = useCatalog();
  const s = catalog?.settings;
  usePageTitle(t('navContact'));
  const tel = (n: string) => `tel:${n.replace(/\s/g, '')}`;

  return (
    <div className="page mx-auto max-w-2xl">
      <h1 className="text-[32px]">{t('contactUs')}</h1>
      <p className="mt-2 text-lg text-ink-soft">
        {lang === 'hi' ? 'ऑर्डर, सवाल या कोई परेशानी हो, तो सबसे जल्दी WhatsApp पर जवाब मिलता है।' : 'For orders, questions or any problem with an order, WhatsApp is the fastest way to reach us.'}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <a href={whatsappUrl(s?.whatsappNumber ?? FALLBACK_WHATSAPP)} target="_blank" rel="noreferrer" className="card flex items-center gap-3 p-4 hover:border-sage">
          <MessageCircle className="h-6 w-6 text-sage" aria-hidden="true" />
          <span><span className="block font-semibold">WhatsApp</span><span className="text-stone">{t('helpButton')}</span></span>
        </a>
        {s?.contactPhone && (
          <a href={tel(s.contactPhone)} className="card flex items-center gap-3 p-4 hover:border-sage">
            <Phone className="h-6 w-6 text-sage" aria-hidden="true" />
            <span><span className="block font-semibold">{t('call')}</span><span className="text-stone">{s.contactPhone}</span></span>
          </a>
        )}
        {s?.alternatePhone && (
          <a href={tel(s.alternatePhone)} className="card flex items-center gap-3 p-4 hover:border-sage">
            <Phone className="h-6 w-6 text-sage" aria-hidden="true" />
            <span><span className="block font-semibold">{t('alternateNumber')}</span><span className="text-stone">{s.alternatePhone}</span></span>
          </a>
        )}
        {s?.contactEmail && (
          <a href={`mailto:${s.contactEmail}`} className="card flex items-center gap-3 p-4 hover:border-sage">
            <Mail className="h-6 w-6 flex-none text-sage" aria-hidden="true" />
            <span className="min-w-0"><span className="block font-semibold">{t('email')}</span><span className="break-all text-stone">{s.contactEmail}</span></span>
          </a>
        )}
        <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="card flex items-center gap-3 p-4 hover:border-sage">
          <Camera className="h-6 w-6 text-sage" aria-hidden="true" />
          <span><span className="block font-semibold">Instagram</span><span className="text-stone">@order.kaaro</span></span>
        </a>
      </div>

      {s && (
        <section className="card mt-6 p-5">
          <h2 className="flex items-center gap-2 text-xl"><Clock className="h-5 w-5 text-sage" aria-hidden="true" /> {t('storeHours')}</h2>
          <dl className="mt-2 space-y-1">
            {weeklySummary(s.storeHours, lang).map((row) => (
              <div key={row.days} className="flex justify-between gap-4"><dt className="text-stone">{row.days}</dt><dd>{row.hours}</dd></div>
            ))}
          </dl>
          <p className="mt-3 text-stone">{t('location')}</p>
          {s.address && <p className="text-stone">{s.address}</p>}
        </section>
      )}
    </div>
  );
}
