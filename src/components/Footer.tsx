import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin, Phone, Heart } from 'lucide-react';

const CATALOGUE_URL = '/Catelog.html';

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
  { href: CATALOGUE_URL, label: 'Order Now' },
];

const socialLinks = [
  {
    href: 'https://www.instagram.com/order.kaaro',
    icon: Instagram,
    label: 'Instagram',
  },
  {
    href: 'https://wa.me/919942089120?text=I%20want%20to%20order',
    icon: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.212 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    label: 'WhatsApp',
  },
  {
    href: 'mailto:orderkarokishanganj@gmail.com',
    icon: Mail,
    label: 'Email',
  },
];

const Footer = () => {
  return (
    <footer className="relative bg-gray-900 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-green-500" />

      <div className="container-custom relative z-10">
        {/* Main Footer Content */}
        <div className="py-16 md:py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/10 bg-white group-hover:shadow-xl group-hover:shadow-primary-500/30 transition-shadow">
                  <img
                    src="/logo.jpeg"
                    alt="Order Kaaro logo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <span className="font-display font-bold text-xl text-white block">
                    Order <span className="text-primary-400">Kaaro</span>
                  </span>
                  <span className="text-xs text-gray-400">Ghar Baithe Order Karo</span>
                </div>
              </Link>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
                Your trusted WhatsApp-based grocery delivery partner. Fresh produce, daily essentials, lightning-fast delivery.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="w-10 h-10 bg-gray-800 hover:bg-primary-500 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display font-bold text-white text-lg mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    {'href' in link ? (
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-primary-400 transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-gray-400 hover:text-primary-400 transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-display font-bold text-white text-lg mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="tel:+919942089120"
                    className="flex items-center gap-3 text-gray-400 hover:text-primary-400 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-gray-800 group-hover:bg-primary-500/20 rounded-lg flex items-center justify-center transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>+91 99420 89120</span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+917857033161"
                    className="flex items-center gap-3 text-gray-400 hover:text-primary-400 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-gray-800 group-hover:bg-primary-500/20 rounded-lg flex items-center justify-center transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-sm">+91 78570 33161 (Alt)</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:orderkarokishanganj@gmail.com"
                    className="flex items-center gap-3 text-gray-400 hover:text-primary-400 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-gray-800 group-hover:bg-primary-500/20 rounded-lg flex items-center justify-center transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-sm">orderkarokishanganj@gmail.com</span>
                  </a>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span>Kishanganj, Bihar, India</span>
                </li>
              </ul>
            </div>

            {/* Business Hours */}
            <div>
              <h4 className="font-display font-bold text-white text-lg mb-6">Business Hours</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-400">
                  <span>Mon - Sat</span>
                  <span className="text-white">9:00 AM - 9:00 PM</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Sunday</span>
                  <span className="text-white">10:00 AM - 6:00 PM</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gradient-to-br from-primary-500/10 to-green-500/10 rounded-xl border border-primary-500/20">
                <p className="text-sm text-gray-300 mb-3">Order now via WhatsApp</p>
                <a
                  href="https://wa.me/919942089120?text=I%20want%20to%20order"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.212 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Start Chat
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              {new Date().getFullYear()} Order Kaaro. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/cookies" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Cookie Settings
              </Link>
            </div>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
