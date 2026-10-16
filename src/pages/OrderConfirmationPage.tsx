import { CheckCircle2, MessageCircle, PackageSearch } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useCatalog } from '../data/CatalogContext';
import { useLang } from '../i18n/LanguageContext';
import { formatRupees } from '../lib/pricing';
import { whatsappUrl } from '../lib/whatsapp';
import { ordersStore } from '../store/stores';
import { EmptyState, FALLBACK_WHATSAPP } from '../ui/states';
import { usePageTitle } from '../ui/usePageTitle';

export default function OrderConfirmationPage() {
  const { ref = '' } = useParams();
  const { t, pick } = useLang();
  const { catalog } = useCatalog();
  const order = ordersStore.useValue().find((o) => o.ref === ref);
  usePageTitle(order?.orderNumber ? `${t('orderPlaced')} ${order.orderNumber}` : t('orderPlaced'));

  if (!order) {
    return (
      <div className="page">
        <EmptyState icon={<PackageSearch className="h-7 w-7" />} title={t('orderNotFound')}>
          <Link to="/orders" className="btn-outline">{t('navOrders')}</Link>
          <Link to="/" className="btn-primary">{t('continueShopping')}</Link>
        </EmptyState>
      </div>
    );
  }

  const link = whatsappUrl(catalog?.settings.whatsappNumber ?? FALLBACK_WHATSAPP, order.whatsappText);

  return (
    <div className="page mx-auto max-w-xl space-y-4">
      <div className="card flex flex-col items-center gap-3 px-6 py-8 text-center">
        <CheckCircle2 className="h-14 w-14 text-sage" aria-hidden="true" />
        {order.orderNumber ? (
          <>
            <h1 className="text-[28px]">{t('orderPlaced')}</h1>
            <p className="text-stone">{t('orderNumber')}</p>
            <p className="font-display text-3xl font-semibold tracking-wide">{order.orderNumber}</p>
            <p className="mt-2 text-ink-soft">{t('confirmNext')}</p>
          </>
        ) : (
          <>
            <h1 className="text-[28px]">{t('notSavedTitle')}</h1>
            <p className="text-ink-soft">{t('notSavedText')}</p>
          </>
        )}
        <a href={link} target="_blank" rel="noreferrer" className="btn-primary mt-2 w-full text-lg">
          <MessageCircle className="h-5 w-5" aria-hidden="true" /> {t('sendOnWhatsApp')}
        </a>
      </div>

      <div className="card p-5">
        <h2 className="mb-2 text-xl">{t('orderSummary')}</h2>
        <ul className="divide-y divide-line text-sm">
          {order.lines.map((l) => (
            <li key={l.variantId} className="flex justify-between gap-3 py-2">
              <span>{pick(l.nameEn, l.nameHi)} · {pick(l.unitEn, l.unitHi)} × {l.quantity}</span>
              <span className="flex-none">{formatRupees(l.unitPrice * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-line pt-3">
          <div className="flex justify-between"><dt>{t('delivery')}</dt><dd>{order.deliveryFee === 0 ? t('freeDelivery') : formatRupees(order.deliveryFee)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between text-sage"><dt>{t('discount')}</dt><dd>−{formatRupees(order.discount)}</dd></div>}
          <div className="flex justify-between text-lg font-semibold"><dt>{t('total')}</dt><dd className="font-display">{formatRupees(order.total)}</dd></div>
        </dl>
        <p className="mt-3 text-sm text-stone">{t('payment')}</p>
      </div>

      <Link to="/" className="btn-outline w-full">{t('continueShopping')}</Link>
    </div>
  );
}
