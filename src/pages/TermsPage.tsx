import { useCatalog } from '../data/CatalogContext';
import { useLang } from '../i18n/LanguageContext';
import { weeklySummary } from '../lib/hours';
import { formatRupees } from '../lib/pricing';
import { InfoPage } from '../ui/InfoPage';

// Only states what the shop has confirmed. Delivery fees and hours come live from settings.
export default function TermsPage() {
  const { lang, t } = useLang();
  const { catalog } = useCatalog();
  const hi = lang === 'hi';
  const tiers = [...(catalog?.settings.deliveryTiers ?? [])].sort((a, b) => a.min - b.min);

  const feeRows = tiers.map((tier, i) => {
    const next = tiers[i + 1];
    const range = next
      ? `${formatRupees(tier.min)} – ${formatRupees(next.min - 1)}`
      : hi ? `${formatRupees(tier.min)} या ज़्यादा` : `${formatRupees(tier.min)} and above`;
    return { range: tier.min === 0 && next ? (hi ? `${formatRupees(next.min)} से कम` : `Below ${formatRupees(next.min)}`) : range, fee: tier.fee };
  });

  return (
    <InfoPage
      title={t('navTerms')}
      intro={hi ? 'ऑर्डर कारो से ऑर्डर करने के नियम, आसान भाषा में।' : 'How ordering from Order Kaaro works, in plain language.'}
      sections={[
        {
          heading: hi ? 'ऑर्डर कैसे होता है' : 'Placing an order',
          body: <>
            <p>{hi
              ? 'आप वेबसाइट पर सामान चुनकर ऑर्डर करते हैं और उसे WhatsApp पर हमें भेजते हैं। हम WhatsApp या फ़ोन पर आपका ऑर्डर पक्का करते हैं।'
              : 'You choose items on the website, place the order and send it to us on WhatsApp. We confirm orders with you on WhatsApp or by phone.'}</p>
          </>,
        },
        {
          heading: hi ? 'दाम' : 'Prices',
          body: <p>{hi
            ? 'सभी दाम रुपये (₹) में हैं। ऑर्डर करते समय दाम हमारे सिस्टम से फिर जाँचे जाते हैं, और आपके ऑर्डर में वही दाम लगते हैं जो ऑर्डर करते समय दिखे। दाम समय-समय पर बदल सकते हैं।'
            : 'All prices are in rupees (₹). Prices are checked again by our system when you order, and your order uses the prices shown when you placed it. Prices can change over time.'}</p>,
        },
        {
          heading: hi ? 'डिलीवरी शुल्क' : 'Delivery fee',
          body: feeRows.length ? (
            <ul>
              {feeRows.map((r) => (
                <li key={r.range}>{hi ? `${r.range} का ऑर्डर: ` : `Orders ${r.range}: `}<span className="font-semibold text-ink">{r.fee === 0 ? t('freeDelivery') : formatRupees(r.fee)}</span></li>
              ))}
            </ul>
          ) : <p>{t('loading')}</p>,
        },
        {
          heading: hi ? 'डिलीवरी का समय' : 'Delivery time',
          body: <p>{hi
            ? 'डिलीवरी का समय ट्रैफ़िक और दूरी पर निर्भर करता है, इसलिए हम कोई तय समय का वादा नहीं करते।'
            : 'Delivery time depends on traffic and distance, so we don’t promise a fixed delivery time.'}</p>,
        },
        {
          heading: hi ? 'भुगतान' : 'Payment',
          body: <p>{hi
            ? 'सामान आने पर कैश या UPI से भुगतान करें। वेबसाइट पर कोई ऑनलाइन भुगतान नहीं लिया जाता।'
            : 'Pay cash or UPI when your order arrives. The website never takes payment online.'}</p>,
        },
        {
          heading: hi ? 'कूपन' : 'Coupons',
          body: <p>{hi
            ? 'एक ऑर्डर पर एक कूपन लगता है। हर कूपन की शर्तें (जैसे न्यूनतम ऑर्डर) लगाते समय दिखती हैं। छूट सिर्फ़ सामान पर लगती है, डिलीवरी शुल्क पर नहीं।'
            : 'One coupon per order. Each coupon’s conditions, such as a minimum order, are shown when you apply it. Discounts apply to items, not the delivery fee.'}</p>,
        },
        {
          heading: hi ? 'दुकान का समय' : 'Store hours',
          body: catalog ? (
            <ul>{weeklySummary(catalog.settings.storeHours, lang).map((r) => <li key={r.days}>{r.days}: {r.hours}</li>)}</ul>
          ) : <p>{t('loading')}</p>,
        },
        {
          heading: hi ? 'कोई परेशानी?' : 'Problems with an order',
          body: <p>{hi
            ? 'अगर ऑर्डर में कोई गड़बड़ हो, तो WhatsApp या फ़ोन पर हमसे बात करें।'
            : 'If something is wrong with your order, contact us on WhatsApp or by phone.'}</p>,
        },
      ]}
    />
  );
}
