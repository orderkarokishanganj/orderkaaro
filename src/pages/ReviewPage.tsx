import { ExternalLink, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../data/CatalogContext';
import { useLang } from '../i18n/LanguageContext';
import { usePageTitle } from '../ui/usePageTitle';

// Used until settings load. The owner can change the link in the admin panel's settings.
const DEFAULT_REVIEW_LINK = 'https://g.page/r/Caa1t0LPjd8YEBM/review';

/** Linked from the QR code on receipts. Sends customers to Google with no pre-written text. */
export default function ReviewPage() {
  const { lang, t } = useLang();
  const { catalog } = useCatalog();
  const link = catalog?.settings.googleReviewUrl || DEFAULT_REVIEW_LINK;
  const hi = lang === 'hi';
  usePageTitle(hi ? 'धन्यवाद' : 'Thank you');

  return (
    <div className="page">
      <div className="card mx-auto flex max-w-md flex-col items-center px-6 py-10 text-center">
        <img src="/logo.jpeg" alt="Order Kaaro" width={80} height={80} className="h-20 w-20 rounded-2xl object-cover" />
        <h1 className="mt-5 text-[32px]">{hi ? 'धन्यवाद!' : 'Thank you!'}</h1>
        <p className="mt-1 text-lg">{hi ? 'ऑर्डर कारो से ऑर्डर करने के लिए शुक्रिया।' : 'Thank you for ordering from Order Kaaro.'}</p>
        <p className="mt-2 text-stone">
          {hi
            ? 'आपकी सच्ची राय किशनगंज के दूसरे परिवारों को हमें ढूँढने में मदद करती है, और हमें बेहतर बनाती है।'
            : 'Your honest feedback helps other families in Kishanganj find us, and helps us get better.'}
        </p>
        <div className="my-6 flex gap-1" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((n) => <Star key={n} className="h-8 w-8 text-clay" strokeWidth={1.5} />)}
        </div>
        <a href={link} className="btn-primary w-full text-lg">
          {hi ? 'Google पर रिव्यू लिखें' : 'Write a review on Google'} <ExternalLink className="h-5 w-5" aria-hidden="true" />
        </a>
        <Link to="/" className="mt-4 inline-flex min-h-[44px] items-center font-semibold text-sage hover:underline">{t('continueShopping')}</Link>
      </div>
    </div>
  );
}
