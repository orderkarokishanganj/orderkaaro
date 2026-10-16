import { useCatalog } from '../data/CatalogContext';
import { useLang } from '../i18n/LanguageContext';
import { InfoPage } from '../ui/InfoPage';

// Describes exactly what the site does today. Update it if analytics, ads or online payment are ever added.
export default function PrivacyPage() {
  const { lang, t } = useLang();
  const { catalog } = useCatalog();
  const hi = lang === 'hi';
  const email = catalog?.settings.contactEmail;

  return (
    <InfoPage
      title={t('navPrivacy')}
      intro={hi ? 'हम आपकी कौन सी जानकारी रखते हैं, क्यों, और आप उसे कैसे हटवा सकते हैं।' : 'What information we keep, why, and how to have it removed.'}
      sections={[
        {
          heading: hi ? 'ऑर्डर करते समय हम क्या लेते हैं' : 'What we collect when you order',
          body: <>
            <ul>
              <li>{hi ? 'आपका नाम, मोबाइल नंबर, पता, पास की पहचान, पिनकोड और नोट (अगर दिया हो)' : 'Your name, mobile number, address, landmark, and pincode and note if you add them'}</li>
              <li>{hi ? 'ऑर्डर किया गया सामान, दाम और कुल राशि' : 'The items you ordered, their prices and the total'}</li>
              <li>{hi ? 'आपके इंटरनेट कनेक्शन का पता (IP), ताकि नकली या बार-बार के स्पैम ऑर्डर रोके जा सकें' : 'Your internet connection’s address (IP), so we can block fake or repeated spam orders'}</li>
            </ul>
            <p>{hi ? 'वेबसाइट पर कोई अकाउंट या पासवर्ड नहीं बनता और हम कोई भुगतान जानकारी नहीं लेते।' : 'There are no customer accounts or passwords on the website, and we never collect payment details.'}</p>
          </>,
        },
        {
          heading: hi ? 'हम इसका इस्तेमाल कैसे करते हैं' : 'How we use it',
          body: <p>{hi
            ? 'सिर्फ़ आपका ऑर्डर पक्का करने, पहुँचाने और ऑर्डर के बारे में आपसे बात करने के लिए। हम आपकी जानकारी बेचते नहीं हैं और विज्ञापन के लिए किसी को नहीं देते।'
            : 'Only to confirm and deliver your order and to contact you about it. We do not sell your information or share it for advertising.'}</p>,
        },
        {
          heading: hi ? 'जानकारी कहाँ रहती है' : 'Where it is stored',
          body: <>
            <p>{hi
              ? 'ऑर्डर हमारे डेटाबेस में सुरक्षित रहते हैं, जो Supabase नाम की सेवा पर चलता है। इन्हें सिर्फ़ दुकान के अधिकृत लोग देख सकते हैं।'
              : 'Orders are kept in our database, run on a service called Supabase. Only authorised shop staff can see them.'}</p>
            <p>{hi
              ? 'जब आप ऑर्डर WhatsApp पर भेजते हैं, तो वह मैसेज WhatsApp से होकर जाता है और उस पर WhatsApp की गोपनीयता नीति लागू होती है।'
              : 'When you send your order on WhatsApp, that message goes through WhatsApp and WhatsApp’s own privacy policy applies to it.'}</p>
          </>,
        },
        {
          heading: hi ? 'आपके फ़ोन पर' : 'On your phone',
          body: <p>{hi
            ? 'आपका कार्ट, पसंदीदा सामान, डिलीवरी की जानकारी, भाषा और पिछले ऑर्डर आपके ब्राउज़र में ही सेव रहते हैं, ताकि अगली बार भरना न पड़े। ब्राउज़र में इस साइट का डेटा मिटाकर आप इन्हें कभी भी हटा सकते हैं।'
            : 'Your cart, saved items, delivery details, language and past orders are saved in your own browser so you don’t have to type them again. You can remove them any time by clearing this site’s data in your browser.'}</p>,
        },
        {
          heading: hi ? 'ट्रैकिंग' : 'Tracking',
          body: <p>{hi
            ? 'हम विज्ञापन या एनालिटिक्स ट्रैकर इस्तेमाल नहीं करते।'
            : 'We don’t use advertising or analytics trackers.'}</p>,
        },
        {
          heading: hi ? 'अपनी जानकारी के बारे में पूछें' : 'Questions or removal',
          body: <p>
            {hi ? 'अपनी जानकारी देखने या हटवाने के लिए हमें WhatsApp पर मैसेज करें' : 'To ask about or remove your information, message us on WhatsApp'}
            {email ? <>{hi ? ' या ईमेल करें: ' : ' or email '}<a href={`mailto:${email}`}>{email}</a></> : ''}.
          </p>,
        },
      ]}
    />
  );
}
