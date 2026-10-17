import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext';
import { useCart } from '../store/useCart';
import { CartBar } from './CartBar';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import { StoreNotice } from './StoreNotice';

// Screens where the floating cart bar would get in the way of their own buttons.
const NO_CART_BAR = [/^\/cart/, /^\/checkout/, /^\/order\//];

export function Layout() {
  const { t } = useLang();
  const { pathname } = useLocation();
  const { count } = useCart();
  const showCartBar = count > 0 && !NO_CART_BAR.some((re) => re.test(pathname));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        {t('skipToContent')}
      </a>
      <SiteHeader showSearch={!pathname.startsWith('/checkout')} />
      <StoreNotice />
      {/* At least a screen tall, so the footer never jumps down while a page loads. */}
      <main id="main" className={`min-h-screen flex-1 pt-4 ${showCartBar ? 'pb-32' : 'pb-8'}`}>
        <Suspense fallback={<p className="page text-stone" role="status">{t('loading')}</p>}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
      {showCartBar && <CartBar />}
    </div>
  );
}
