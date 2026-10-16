import { useState } from 'react';
import { MessageCircle, Receipt, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCatalog } from '../data/CatalogContext';
import { useLang } from '../i18n/LanguageContext';
import { formatRupees } from '../lib/pricing';
import { whatsappUrl } from '../lib/whatsapp';
import { cartStore, ordersStore, type PastOrder } from '../store/stores';
import { EmptyState, FALLBACK_WHATSAPP } from '../ui/states';
import { usePageTitle } from '../ui/usePageTitle';

export default function OrdersPage() {
  const { t, pick, lang } = useLang();
  const { catalog, variantById } = useCatalog();
  const orders = ordersStore.useValue();
  const navigate = useNavigate();
  const [status, setStatus] = useState<{ ref: string; text: string } | null>(null);
  usePageTitle(t('ordersTitle'));

  /** Puts the order's items back in the cart at today's prices, skipping what can't be bought now. */
  const orderAgain = (order: PastOrder) => {
    let missing = 0;
    let added = 0;
    cartStore.set((cart) => {
      const next = { ...cart };
      for (const line of order.lines) {
        const hit = variantById.get(line.variantId);
        if (!hit || !hit.variant.available) {
          missing++;
          continue;
        }
        next[line.variantId] = Math.min((next[line.variantId] ?? 0) + line.quantity, hit.variant.maxQuantity);
        added++;
      }
      return next;
    });
    if (added === 0) return setStatus({ ref: order.ref, text: t('reorderNone') });
    if (missing === 0) navigate('/cart');
    else setStatus({ ref: order.ref, text: t('reorderSome', { n: missing }) });
  };

  if (orders.length === 0) {
    return (
      <div className="page">
        <h1 className="mb-4 text-[29px]">{t('ordersTitle')}</h1>
        <EmptyState icon={<Receipt className="h-7 w-7" />} title={t('ordersEmpty')} text={t('ordersNote')}>
          <Link to="/" className="btn-primary">{t('startShopping')}</Link>
        </EmptyState>
      </div>
    );
  }

  const dateFormat = new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' });

  return (
    <div className="page mx-auto max-w-2xl">
      <h1 className="text-[29px]">{t('ordersTitle')}</h1>
      <p className="mb-4 text-stone">{t('ordersNote')}</p>
      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order.ref} className="card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Link to={`/order/${encodeURIComponent(order.ref)}`} className="font-display text-lg font-semibold hover:underline">
                {order.orderNumber ?? t('notSavedBadge')}
              </Link>
              <span className="text-sm text-stone">{dateFormat.format(new Date(order.createdAt))}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
              {order.lines.map((l) => `${pick(l.nameEn, l.nameHi)} × ${l.quantity}`).join(', ')}
            </p>
            <p className="mt-1 font-semibold">{t('total')}: {formatRupees(order.total)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => orderAgain(order)} className="btn-outline" disabled={!catalog}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t('orderAgain')}
              </button>
              <a href={whatsappUrl(catalog?.settings.whatsappNumber ?? FALLBACK_WHATSAPP, order.whatsappText)} target="_blank" rel="noreferrer" className="btn-quiet">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> {t('resend')}
              </a>
            </div>
            {status?.ref === order.ref && (
              <p role="status" className="mt-2 text-sm font-semibold text-clay">
                {status.text} <Link to="/cart" className="underline">{t('viewCart')}</Link>
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
