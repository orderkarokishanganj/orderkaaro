import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Phone } from 'lucide-react';

 const CATALOGUE_URL = '/catalogue';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

 type NavLink =
  | { to: string; label: string; href?: undefined }
  | { href: string; label: string; to?: undefined };

const navLinks: NavLink[] = [
  { to: '/', label: 'Home' },
  { href: CATALOGUE_URL, label: 'Order Now' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'glass shadow-2xl py-3'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="container-custom flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-lg ring-1 ring-black/5 group-hover:shadow-primary-500/30 transition-all duration-300 group-hover:scale-110 bg-white">
              <img
                src="/logo.jpeg"
                alt="Order Kaaro logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className={`font-display font-bold text-xl leading-none ${
                isScrolled ? 'text-gray-900' : 'text-gray-900'
              }`}>
                Order <span className="text-primary-500">Kaaro</span>
              </span>
              <span className="text-[10px] text-gray-500 tracking-wide">Ghar Baithe Order Karo</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              'href' in link ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="relative px-5 py-2 font-medium transition-colors duration-300 rounded-full text-gray-700 hover:text-primary-600"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-5 py-2 font-medium transition-colors duration-300 rounded-full ${
                    location.pathname === link.to
                      ? 'text-primary-600'
                      : isScrolled
                      ? 'text-gray-700 hover:text-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  {link.label}
                  {location.pathname === link.to && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
                  )}
                </Link>
              )
            ))}
          
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="https://wa.me/919942089120?text=I%20want%20to%20order"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.212 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="hidden xl:inline">Chat</span>
            </a>
            <Link
              to={CATALOGUE_URL}
              className="btn-primary flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 bg-gray-100 hover:bg-gray-200"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-500 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-0 right-0 w-80 max-w-[85vw] h-full bg-white shadow-2xl transform transition-transform duration-500 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6 pt-24">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link, index) => (
                'href' in link ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center px-5 py-3 rounded-xl font-medium transition-all duration-300 text-gray-700 hover:bg-gray-50"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                      location.pathname === link.to
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {link.label}
                  </Link>
                )
              ))}
              <Link
                to={CATALOGUE_URL}
                className="flex items-center px-5 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300"
              >
                Order Now
              </Link>
            </nav>

            <div className="mt-8 space-y-3">
              <a
                href="https://wa.me/919942089120?text=I%20want%20to%20order"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.212 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Support
              </a>
              <a
                href="tel:+919942089120"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all duration-300"
              >
                <Phone className="w-5 h-5" />
                +91 99420 89120
              </a>
              <a
                href="tel:+917857033161"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium transition-all duration-300 text-sm"
              >
                <Phone className="w-4 h-4" />
                +91 78570 33161 (Alternate)
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
