import { useState } from 'react';
import { MapPin, Menu, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext';
import { useCart } from '../store/useCart';
import { LanguageToggle } from './LanguageToggle';
import { MenuDrawer } from './MenuDrawer';
import { SearchBox } from './SearchBox';

export function SiteHeader({ showSearch = true }: { showSearch?: boolean }) {
  const { t, lang } = useLang();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="page pt-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sage-mist"
          aria-label={t('menu')}
          aria-haspopup="dialog"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <Link to="/" className="text-center leading-none">
          <span className="block font-display text-[28px] font-semibold tracking-tight">Order Kaaro</span>
          <span className={`mt-1 block text-[11px] uppercase tracking-[0.14em] text-stone ${lang === 'en' ? 'font-system' : ''}`}>{t('tagline')}</span>
        </Link>
        <Link to="/cart" className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-sage-mist" aria-label={`${t('cart')}: ${count}`}>
          <ShoppingBag className="h-6 w-6" aria-hidden="true" />
          {count > 0 && (
            <span className="absolute right-0.5 top-0.5 min-w-[20px] rounded-full bg-sage px-1 text-center text-xs font-semibold leading-5 text-white" aria-hidden="true">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Link>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm text-stone">
          <MapPin className="h-4 w-4 text-sage" aria-hidden="true" /> {t('location')}
        </span>
        <LanguageToggle />
      </div>
      {showSearch && (
        <div className="mt-3">
          <SearchBox />
        </div>
      )}
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
