import { Shield, Mail, Phone, MapPin, Clock } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <main>
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-primary-50" />

        <div className="container-custom section-padding relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Shield className="w-4 h-4" />
              Legal
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-4">
              Privacy{' '}
              <span className="text-primary-500">Policy</span>
            </h1>
            <p className="text-lg text-gray-500">
              Last Updated: <span className="font-semibold">May 23, 2026</span>
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              {/* Introduction */}
              <div className="mb-12">
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-600 leading-relaxed">
                  Welcome to Order Kaaro. We respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains what information we collect, how we use it, and your rights regarding that information.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  By using our website, creating an account, or making a purchase, you agree to the practices described in this policy. If you do not agree, please refrain from using our services.
                </p>
              </div>

              {/* Information We Collect */}
              <div className="mb-12">
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-3">2.1 Information You Provide Directly</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Account Information:</strong> Name, email address, username, and password when you register for an account.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Purchase Information:</strong> Billing address, shipping address, phone number, and order details when you place an order.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Payment Information:</strong> Credit/debit card numbers, expiration dates, and security codes. Note: Payment details are processed securely by our third-party payment processor and are not stored on our servers.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Communications:</strong> Messages you send us via contact forms, email, or customer support.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-3">2.2 Information Collected Automatically</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Cookies and Tracking Technologies:</strong> We use cookies, pixel tags, and similar technologies to recognize your browser, remember your preferences, and understand how you interact with our store.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Usage Data:</strong> IP address, browser type, device type, operating system, pages visited, referring URLs, and time spent on pages.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>Analytics Data:</strong> Aggregated behavioral data collected through analytics tools (such as Google Analytics) to help us understand shopping patterns and improve our services.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* How We Use Your Information */}
              <div className="mb-12">
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">We use the information we collect to:</p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    Process and fulfill your orders, including sending order confirmations and shipping updates
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    Create and manage your account
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    Process payments and prevent fraudulent transactions
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    Communicate with you about your orders, account, and inquiries
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    Send promotional emails and marketing communications (only with your consent)
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    Personalize your shopping experience and show relevant products
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    Analyze website traffic and usage to improve our store
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    Comply with legal obligations and resolve disputes
                  </li>
                </ul>
              </div>

              {/* Cookies */}
              <div className="mb-12">
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">4. Cookies</h2>
                <p className="text-gray-600 leading-relaxed mb-4">We use the following types of cookies:</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-primary-50 rounded-xl p-5">
                    <h4 className="font-bold text-gray-900 mb-2">Essential Cookies</h4>
                    <p className="text-sm text-gray-600">Required for the website to function, including keeping items in your cart and maintaining your session.</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-5">
                    <h4 className="font-bold text-gray-900 mb-2">Analytics Cookies</h4>
                    <p className="text-sm text-gray-600">Help us understand how visitors use our site (e.g., Google Analytics). These do not identify you personally.</p>
                  </div>
                  <div className="bg-accent-50 rounded-xl p-5">
                    <h4 className="font-bold text-gray-900 mb-2">Marketing Cookies</h4>
                    <p className="text-sm text-gray-600">Used to deliver relevant advertisements and track campaign effectiveness.</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mt-4">
                  You can manage or disable cookies through your browser settings. Note that disabling certain cookies may affect website functionality. You may also opt out of analytics tracking via Google's opt-out tools.
                </p>
              </div>

              {/* Sharing Your Information */}
              <div className="mb-12">
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">5. Sharing Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We do <strong>not sell, rent, or trade</strong> your personal information to third parties. We may share your data with:
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Payment Processors:</strong> To securely handle your transactions (e.g., Stripe, Razorpay, PayPal).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Shipping & Logistics Partners:</strong> To fulfill and deliver your orders.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Analytics Providers:</strong> To help us analyse site traffic and performance.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Email Service Providers:</strong> To send transactional and marketing emails.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Legal Authorities:</strong> When required by law, court order, or to protect our rights and the safety of others.</span>
                  </li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  All third-party service providers are contractually required to handle your data securely and only for the purposes we specify.
                </p>
              </div>

              {/* Data Retention */}
              <div className="mb-12">
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
                <p className="text-gray-600 leading-relaxed">
                  We retain your personal information for as long as your account is active or as needed to provide services to you. We may also retain certain data as required by law or for legitimate business purposes such as fraud prevention and dispute resolution.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  You may request deletion of your account and associated data at any time (see Section 9).
                </p>
              </div>

              {/* Data Security */}
              <div className="mb-12">
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">7. Data Security</h2>
                <p className="text-gray-600 leading-relaxed mb-4">We implement industry-standard security measures to protect your information, including:</p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    SSL/TLS encryption for all data transmitted on our website
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    Secure, encrypted storage for sensitive data
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    Regular security audits and access controls
                  </li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                </p>
              </div>

              {/* Children's Privacy */}
              <div className="mb-12">
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our store is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with their information, please contact us and we will promptly delete it.
                </p>
              </div>

              {/* Your Rights */}
              <div className="mb-12">
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">9. Your Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Depending on your location, you may have the following rights regarding your personal data:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong className="text-gray-900">Access:</strong>
                      <span className="text-gray-600"> Request a copy of the personal data we hold about you.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong className="text-gray-900">Correction:</strong>
                      <span className="text-gray-600"> Request that we correct inaccurate or incomplete information.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong className="text-gray-900">Deletion:</strong>
                      <span className="text-gray-600"> Request that we delete your personal data ("right to be forgotten").</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong className="text-gray-900">Opt-Out:</strong>
                      <span className="text-gray-600"> Unsubscribe from marketing emails at any time.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong className="text-gray-900">Data Portability:</strong>
                      <span className="text-gray-600"> Request your data in a portable format.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong className="text-gray-900">Restriction:</strong>
                      <span className="text-gray-600"> Request that we limit how we use your data.</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mt-4">
                  If you are located in the European Union or the UK, these rights are granted under the GDPR. If you are in California, you may have additional rights under the CCPA.
                </p>
                <p className="text-gray-600 leading-relaxed mt-2">
                  To exercise any of these rights, please contact us at the details below.
                </p>
              </div>

              {/* Third-Party Links */}
              <div className="mb-12">
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">10. Third-Party Links</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our website may contain links to third-party websites. We are not responsible for the privacy practices of those sites. We encourage you to review their privacy policies before providing any personal information.
                </p>
              </div>

              {/* Changes to This Policy */}
              <div className="mb-12">
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. When we do, we will revise the "Last Updated" date at the top of this page. Significant changes will be communicated via email or a prominent notice on our website. Continued use of our store after changes constitutes acceptance of the updated policy.
                </p>
              </div>

              {/* Contact Us */}
              <div className="bg-gradient-to-br from-primary-50 to-green-50 rounded-3xl p-8">
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <a
                    href="tel:+919942089120"
                    className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-semibold text-gray-900">+91 99420 89120</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-md">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-semibold text-gray-900">Kishanganj, Bihar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
};

export default PrivacyPage;
