import { Cookie, Phone, Globe, FileText, Clock, Shield, Settings, Ban, Database, Lock, RefreshCw, Mail } from 'lucide-react';

const CookiePage = () => {
  return (
    <main>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative pt-28 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-primary-50" />

          <div className="container-custom section-padding relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Cookie className="w-4 h-4" />
                Legal
              </div>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-4">
                Order{' '}
                <span className="text-primary-500">Kaaro</span>
              </h1>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-700 mb-4">
                Cookie Policy
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Effective Date: <span className="font-semibold text-gray-700">May 23, 2026</span>
                </span>
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Last Updated: <span className="font-semibold text-gray-700">May 23, 2026</span>
                </span>
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Version 1.0
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">

                {/* Section 1 - Introduction */}
                <div className="mb-12">
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                  <p className="text-gray-600 leading-relaxed">
                    This Cookie Policy ("Policy") is issued by Order Kaaro ("Company", "we", "us", or "our") and applies to all users ("you" or "User") who access or use the Order Kaaro website, mobile interface, and WhatsApp-based ordering service (collectively, the "Platform").
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    This Policy explains what cookies and similar tracking technologies are, how we use them on the Platform, the legal basis for their use, and the choices available to you regarding their management or deletion. This Policy should be read in conjunction with our Privacy Policy, which is incorporated herein by reference.
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    By continuing to use the Platform after being presented with this Policy, you acknowledge that you have read, understood, and consent to the use of cookies as described herein, to the extent permitted by applicable law.
                  </p>
                </div>

                {/* Section 2 - Definitions */}
                <div className="mb-12">
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">2. Definitions</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    For the purposes of this Policy, the following terms shall have the meanings ascribed to them below:
                  </p>
                  <div className="space-y-3">
                    {[
                      { term: "Cookie", def: "A small text file placed on your device (computer, smartphone, tablet, or other internet-enabled device) by a website server when you visit or interact with a website." },
                      { term: "Session Cookie", def: "A temporary cookie that is deleted from your device at the end of your browser session." },
                      { term: "Persistent Cookie", def: "A cookie that remains on your device for a specified period or until manually deleted." },
                      { term: "First-Party Cookie", def: "A cookie set directly by the Platform or the Company." },
                      { term: "Third-Party Cookie", def: "A cookie set by a domain other than the Platform, typically by a third-party service provider." },
                      { term: "Personal Data", def: "Any information relating to an identified or identifiable natural person, as defined under applicable data protection laws." },
                      { term: "Platform", def: "The Order Kaaro website, mobile-accessible interface, and associated WhatsApp-based ordering services." },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                        <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span><strong className="text-gray-900">{item.term}</strong> <span className="text-gray-600">means {item.def}</span></span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3 - What Are Cookies */}
                <div className="mb-12">
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">3. What Are Cookies and How Do They Work?</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Cookies are small data files, typically consisting of letters and numbers, that are stored on your device when you visit a website. They are widely used by website operators to make their websites function more efficiently, to improve user experience, and to provide reporting information.
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    Cookies set by the website operator — in this case, Order Kaaro — are called "first-party cookies." Cookies set by parties other than the website operator are called "third-party cookies." Third-party cookies enable features or functionality to be provided on or through the Platform by a third party, such as analytics, advertising, and interactive content.
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    In addition to cookies, we may also use similar technologies such as web beacons, pixel tags, local storage objects, and other tracking technologies (collectively referred to as "Tracking Technologies") that function in a substantially similar manner to cookies for the purposes described in this Policy.
                  </p>
                </div>

                {/* Section 4 - Categories of Cookies */}
                <div className="mb-12">
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">4. Categories of Cookies We Use</h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    We use the following categories of cookies on the Platform:
                  </p>

                  {/* 4.1 Strictly Necessary */}
                  <div className="bg-red-50 rounded-2xl p-6 mb-6 border-l-4 border-red-500">
                    <h3 className="font-display text-xl font-bold text-gray-900 mb-2">4.1 Strictly Necessary Cookies</h3>
                    <p className="text-gray-600 leading-relaxed mb-3">
                      These cookies are essential for the Platform to function and cannot be switched off in our systems. They are usually set in response to actions made by you, such as setting your privacy preferences, logging in, or placing an order.
                    </p>
                    <div className="bg-white rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700"><strong>Legal Basis:</strong> These cookies are deployed on the basis of our legitimate interest in providing a functioning service, and no separate consent is required for their use.</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Examples of use include:</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>Maintaining your authenticated session during use of the Platform</li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>Enabling secure transmission of order and payment information</li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>Storing temporary cart or order data during the ordering process</li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>Ensuring the Platform operates correctly across different devices and browsers</li>
                    </ul>
                  </div>

                  {/* 4.2 Performance and Analytics */}
                  <div className="bg-blue-50 rounded-2xl p-6 mb-6 border-l-4 border-blue-500">
                    <h3 className="font-display text-xl font-bold text-gray-900 mb-2">4.2 Performance and Analytics Cookies</h3>
                    <p className="text-gray-600 leading-relaxed mb-3">
                      These cookies allow us to count visits and traffic sources so we can measure and improve the performance of the Platform. All information collected by these cookies is aggregated and therefore anonymous.
                    </p>
                    <div className="bg-white rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700"><strong>Legal Basis:</strong> These cookies are deployed on the basis of your consent, which you may withdraw at any time.</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Examples of use include:</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>Tracking the number of unique visitors to the Platform</li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>Identifying which pages or features receive the most user engagement</li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>Analysing user navigation patterns to improve service design</li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>Monitoring error rates and technical performance of the Platform</li>
                    </ul>
                  </div>

                  {/* 4.3 Functionality and Preference */}
                  <div className="bg-green-50 rounded-2xl p-6 mb-6 border-l-4 border-green-500">
                    <h3 className="font-display text-xl font-bold text-gray-900 mb-2">4.3 Functionality and Preference Cookies</h3>
                    <p className="text-gray-600 leading-relaxed mb-3">
                      These cookies enable the Platform to provide enhanced functionality and personalisation. If you do not permit these cookies, some or all of these features may not function properly.
                    </p>
                    <div className="bg-white rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700"><strong>Legal Basis:</strong> These cookies are deployed on the basis of your consent, which you may withdraw at any time.</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Examples of use include:</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>Remembering your saved delivery address and contact information</li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>Storing your previously ordered items for faster re-ordering</li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>Retaining your language or regional preferences</li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>Customising interface settings based on your prior interactions</li>
                    </ul>
                  </div>

                  {/* 4.4 Marketing and Targeting */}
                  <div className="bg-orange-50 rounded-2xl p-6 border-l-4 border-orange-500">
                    <h3 className="font-display text-xl font-bold text-gray-900 mb-2">4.4 Marketing and Targeting Cookies</h3>
                    <p className="text-gray-600 leading-relaxed mb-3">
                      These cookies may be set through the Platform by our advertising partners. They do not directly store Personal Data but are based on uniquely identifying your browser and internet device.
                    </p>
                    <div className="bg-white rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700"><strong>Legal Basis:</strong> These cookies are deployed solely on the basis of your explicit, informed consent. You may withdraw your consent at any time.</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Examples of use include:</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>Delivering targeted promotional offers and discounts based on user behaviour</li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>Limiting the frequency with which you see a particular advertisement</li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>Measuring the effectiveness of marketing campaigns</li>
                      <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>Sharing data with advertising partners to enable interest-based advertising</li>
                    </ul>
                  </div>
                </div>

                {/* Section 5 - Duration */}
                <div className="mb-12">
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">5. Duration of Cookies</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">The cookies we use fall into two duration categories:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-primary-50 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-primary-600" />
                        <h4 className="font-bold text-gray-900">Session Cookies</h4>
                      </div>
                      <p className="text-sm text-gray-600">Temporary cookies that expire at the end of your browser session and are deleted when you close your browser. Used primarily for authentication and order management.</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="w-5 h-5 text-green-600" />
                        <h4 className="font-bold text-gray-900">Persistent Cookies</h4>
                      </div>
                      <p className="text-sm text-gray-600">Remain on your device until they expire or are deleted. Used for analytics, preference storage, and marketing, with durations ranging from 30 days to 24 months.</p>
                    </div>
                  </div>
                </div>

                {/* Section 6 - Third-Party Cookies */}
                <div className="mb-12">
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">6. Third-Party Cookies</h2>
                  <p className="text-gray-600 leading-relaxed">
                    In addition to our own cookies, we may allow certain third-party service providers to place cookies on the Platform in connection with analytics, performance monitoring, and marketing services. These third parties are subject to their own privacy and cookie policies, and we encourage you to review their policies independently.
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    We do not control the placement or use of third-party cookies and accept no liability for the manner in which such third parties process any data collected through their cookies. However, we require all third-party service providers to comply with applicable data protection laws and to maintain appropriate security measures.
                  </p>
                </div>

                {/* Section 7 - Your Rights */}
                <div className="mb-12">
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">7. Your Rights and Choices</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    You have the following rights in relation to cookies and tracking technologies:
                  </p>

                  {/* 7.1 Consent */}
                  <div className="bg-gray-50 rounded-xl p-5 mb-4">
                    <h3 className="font-display text-lg font-bold text-gray-900 mb-2">7.1 Consent and Withdrawal</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Where we rely on your consent as the legal basis for processing cookie data, you have the right to withdraw your consent at any time. Withdrawal of consent will not affect the lawfulness of any processing carried out prior to withdrawal. You may update your cookie preferences at any time by visiting the Cookie Settings section of the Platform.
                    </p>
                  </div>

                  {/* 7.2 Browser Controls */}
                  <div className="bg-gray-50 rounded-xl p-5 mb-4">
                    <h3 className="font-display text-lg font-bold text-gray-900 mb-2">7.2 Browser-Level Controls</h3>
                    <p className="text-gray-600 leading-relaxed mb-3">
                      Most web browsers allow you to control cookies through their settings. You can typically set your browser to refuse cookies, delete existing cookies, or notify you when cookies are being set. Please note that restricting or disabling certain cookies may impact the functionality of the Platform.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {[
                        { browser: "Google Chrome", path: "Settings > Privacy and Security > Cookies and other site data" },
                        { browser: "Mozilla Firefox", path: "Settings > Privacy & Security > Cookies and Site Data" },
                        { browser: "Safari", path: "Preferences > Privacy > Manage Website Data" },
                        { browser: "Microsoft Edge", path: "Settings > Cookies and site permissions" },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3">
                          <p className="font-semibold text-gray-900 text-sm">{item.browser}</p>
                          <p className="text-xs text-gray-500">{item.path}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 7.3 Opt-Out */}
                  <div className="bg-gray-50 rounded-xl p-5 mb-4">
                    <h3 className="font-display text-lg font-bold text-gray-900 mb-2">7.3 Opt-Out of Analytics</h3>
                    <p className="text-gray-600 leading-relaxed">
                      You may opt out of analytics tracking by adjusting your preferences in the Cookie Settings section of the Platform or by using browser-based opt-out mechanisms provided by relevant analytics service providers.
                    </p>
                  </div>

                  {/* 7.4 Do Not Track */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="font-display text-lg font-bold text-gray-900 mb-2">7.4 Do Not Track</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not wish to have your online activity tracked. As there is no consistent industry standard for responding to DNT signals, our Platform does not currently alter its data collection practices in response to DNT signals. However, you may use the cookie controls described in this Policy to manage your preferences directly.
                    </p>
                  </div>
                </div>

                {/* Section 8 - Data Retention */}
                <div className="mb-12">
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Data collected through cookies is retained only for as long as necessary to fulfil the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements. The retention period for cookie-based data varies by cookie category and is described in Section 5 of this Policy.
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    Where Personal Data is collected through cookies, it is handled in accordance with our Privacy Policy, which sets out our data retention schedule in full.
                  </p>
                </div>

                {/* Section 9 - Data Security */}
                <div className="mb-12">
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">9. Data Security</h2>
                  <div className="flex items-start gap-4 bg-blue-50 rounded-xl p-5">
                    <Lock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-600 leading-relaxed">
                      We implement appropriate technical and organisational measures to protect the data collected through cookies against unauthorised access, accidental loss, destruction, or alteration. However, no method of electronic transmission or storage is completely secure, and we cannot guarantee the absolute security of such data.
                    </p>
                  </div>
                </div>

                {/* Section 10 - Changes to Policy */}
                <div className="mb-12">
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
                  <p className="text-gray-600 leading-relaxed">
                    We reserve the right to amend this Cookie Policy at any time at our sole discretion. We will notify you of any material changes by updating the "Last Updated" date at the top of this Policy and, where appropriate, by providing notice through the Platform. Your continued use of the Platform following the posting of changes constitutes your acceptance of such changes, to the extent permitted by applicable law.
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    We encourage you to review this Policy periodically to stay informed about how we use cookies.
                  </p>
                </div>

                {/* Section 11 - Contact */}
                <div className="mb-12">
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    If you have any questions, concerns, or requests regarding this Cookie Policy or our use of cookies and tracking technologies, please contact us using the following details:
                  </p>
                  <div className="bg-gradient-to-br from-primary-50 to-green-50 rounded-2xl p-6">
                    <p className="font-display font-bold text-xl text-gray-900 mb-4">Order Kaaro</p>
                    <div className="space-y-3">
                      <a
                        href="https://wa.me/919942089120?text=I%20want%20to%20order"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-primary-600 transition-colors"
                      >
                        <Phone className="w-5 h-5 text-green-600" />
                        <span>WhatsApp: +91 99420 89120</span>
                      </a>
                      <a
                        href="https://orderkaaro.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-700 hover:text-primary-600 transition-colors"
                      >
                        <Globe className="w-5 h-5 text-primary-600" />
                        <span>Website: orderkaaro.in</span>
                      </a>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                      We aim to respond to all legitimate enquiries within 10 (ten) business days of receipt.
                    </p>
                  </div>
                </div>

                {/* Section 12 - Governing Law */}
                <div className="mb-12">
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">12. Governing Law</h2>
                  <div className="bg-gray-900 rounded-2xl p-6 text-gray-300">
                    <p className="leading-relaxed">
                      This Cookie Policy shall be governed by and construed in accordance with the laws of the Republic of India, including but not limited to the Information Technology Act, 2000, the Information Technology (Amendment) Act, 2008, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
                    </p>
                    <p className="leading-relaxed mt-4">
                      Any disputes arising out of or in connection with this Policy shall be subject to the exclusive jurisdiction of the competent courts located in Bihar, India.
                    </p>
                  </div>
                </div>

                {/* Copyright */}
                <div className="text-center border-t border-gray-200 pt-8">
                  <p className="text-gray-500 text-sm">
                    &copy; 2026 Order Kaaro. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default CookiePage;
