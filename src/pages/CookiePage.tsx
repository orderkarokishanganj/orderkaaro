import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext';
import { InfoPage } from '../ui/InfoPage';

export default function CookiePage() {
  const { lang, t } = useLang();
  const hi = lang === 'hi';

  return (
    <InfoPage
      title={t('navCookies')}
      intro={hi ? 'छोटा जवाब: ग्राहकों के लिए हम कुकीज़ इस्तेमाल नहीं करते।' : 'Short answer: we don’t use cookies for customers.'}
      sections={[
        {
          heading: hi ? 'आपके ब्राउज़र में क्या सेव होता है' : 'What is saved in your browser',
          body: <>
            <p>{hi ? 'साइट को आसान बनाने के लिए कुछ चीज़ें आपके ब्राउज़र की “लोकल स्टोरेज” में रखी जाती हैं:' : 'To make the site easier to use, a few things are kept in your browser’s “local storage”:'}</p>
            <ul>
              <li>{hi ? 'आपका कार्ट और पसंदीदा सामान' : 'Your cart and saved items'}</li>
              <li>{hi ? 'आपकी डिलीवरी की जानकारी, अगली बार भरने के लिए' : 'Your delivery details, to fill in next time'}</li>
              <li>{hi ? 'इस फ़ोन से किए गए ऑर्डर' : 'Orders placed from this phone'}</li>
              <li>{hi ? 'आपकी चुनी हुई भाषा' : 'Your chosen language'}</li>
              <li>{hi ? 'सामान की सूची की एक कॉपी, ताकि धीमे इंटरनेट पर भी दुकान जल्दी खुले' : 'A copy of the product list, so the shop opens quickly even on slow internet'}</li>
            </ul>
            <p>{hi ? 'यह जानकारी आपके फ़ोन से बाहर नहीं जाती, जब तक आप ऑर्डर न करें।' : 'None of this leaves your phone unless you place an order.'}</p>
          </>,
        },
        {
          heading: hi ? 'इसे कैसे हटाएँ' : 'How to remove it',
          body: <p>{hi ? 'अपने ब्राउज़र की सेटिंग में जाकर इस साइट का डेटा मिटा दें।' : 'Clear this site’s data in your browser settings.'}</p>,
        },
        {
          heading: hi ? 'और जानें' : 'More',
          body: <p>{hi ? 'हम आपकी कौन सी जानकारी रखते हैं, यह ' : 'For what we keep when you order, see our '}<Link to="/privacy">{t('navPrivacy')}</Link>{hi ? ' पेज पर लिखा है।' : ' page.'}</p>,
        },
      ]}
    />
  );
}
