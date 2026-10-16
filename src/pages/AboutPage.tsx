import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../data/CatalogContext';
import { useLang } from '../i18n/LanguageContext';
import { whatsappUrl } from '../lib/whatsapp';
import { InfoPage } from '../ui/InfoPage';
import { FALLBACK_WHATSAPP } from '../ui/states';

const FOUNDERS = [
  { name: 'Prem Kumar Saha', en: 'Founder', hi: 'संस्थापक' },
  { name: 'Divyanshu Jain', en: 'Co-founder', hi: 'सह-संस्थापक' },
  { name: 'Prianshu Gupta', en: 'Co-founder', hi: 'सह-संस्थापक' },
  { name: 'Harshit Agarwal', en: 'Co-founder', hi: 'सह-संस्थापक' },
];

export default function AboutPage() {
  const { lang, t } = useLang();
  const { catalog } = useCatalog();
  const hi = lang === 'hi';
  const whatsapp = whatsappUrl(catalog?.settings.whatsappNumber ?? FALLBACK_WHATSAPP);

  return (
    <InfoPage
      title={t('navAbout')}
      intro={hi
        ? 'ऑर्डर कारो किशनगंज की किराना दुकान है जो आपके घर तक सामान पहुँचाती है। आप वेबसाइट पर सामान चुनते हैं, ऑर्डर WhatsApp पर भेजते हैं, और सामान आने पर कैश या UPI से भुगतान करते हैं।'
        : 'Order Kaaro is a Kishanganj grocery store that delivers to your door. You pick your groceries on the website, send the order on WhatsApp, and pay cash or UPI when it arrives.'}
      sections={[
        {
          heading: hi ? 'हम क्यों शुरू हुए' : 'Why we started',
          body: <p>{hi
            ? 'जून 2026 में किशनगंज में शुरू हुआ ऑर्डर कारो इस सोच पर बना है कि रोज़ का सामान मँगवाना एक मैसेज भेजने जितना आसान होना चाहिए। न भीड़, न लाइन, और दाम पहले से साफ़।'
            : 'Order Kaaro started in Kishanganj in June 2026 with one idea: ordering everyday groceries should be as easy as sending a message. No crowds, no queues, and prices you can see before you order.'}</p>,
        },
        {
          heading: hi ? 'हम क्या बेचते हैं' : 'What we sell',
          body: <p>{hi
            ? 'आटा, चावल, दाल, तेल व घी, चाय, बिस्कुट, स्नैक्स, मसाले और घरेलू सामान। अगर कुछ वेबसाइट पर नहीं दिख रहा, तो WhatsApp पर पूछ लीजिए।'
            : 'Atta, rice, dal, oils and ghee, tea, biscuits, snacks, spices and household essentials. If you can’t see something on the website, ask us on WhatsApp.'}</p>,
        },
        {
          heading: hi ? 'हमारी टीम' : 'The team',
          body: (
            <ul className="space-y-1">
              {FOUNDERS.map((f) => <li key={f.name}><span className="font-semibold text-ink">{f.name}</span>, {hi ? f.hi : f.en}</li>)}
            </ul>
          ),
        },
      ]}
    >
      <div className="mt-6 flex flex-wrap gap-2">
        <Link to="/" className="btn-primary">{t('startShopping')}</Link>
        <a href={whatsapp} target="_blank" rel="noreferrer" className="btn-outline">
          <MessageCircle className="h-5 w-5" aria-hidden="true" /> {t('helpButton')}
        </a>
      </div>
    </InfoPage>
  );
}
