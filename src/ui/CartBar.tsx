import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LanguageContext';
import { amountToFreeDelivery, formatRupees, freeDeliveryMin } from '../lib/pricing';
import { useCart } from '../store/useCart';

/** Floating bar on shopping screens: item count, total so far and distance to free delivery. */
export function CartBar() {
  const { t } = useLang();
  const { count, estimate, tiers } = useCart();
  if (count === 0) return null;

  const toFree = amountToFreeDelivery(estimate.subtotal, tiers);
  const freeMin = freeDeliveryMin(tiers);
  const progress = freeMin ? Math.min(100, Math.round((estimate.subtotal / freeMin) * 100)) : 100;
  const feeLabel = estimate.deliveryFee === 0 ? t('freeDelivery') : t('deliveryFeeShort', { fee: formatRupees(estimate.deliveryFee) });
  const hint = toFree === null ? null : toFree === 0 ? t('freeDeliveryUnlocked') : t('toFreeDelivery', { amount: formatRupees(toFree) });

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-xl rounded-[24px] bg-sage py-3 pl-5 pr-2.5 text-white shadow-float">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0" aria-live="polite">
            <p className="text-[17px] font-semibold leading-tight">
              {count === 1 ? t('itemsCountOne') : t('itemsCount', { n: count })} · {formatRupees(estimate.subtotal)}
            </p>
            <p className="truncate text-[13px] text-sage-soft">
              {feeLabel}{hint ? ` · ${hint}` : ''}
            </p>
          </div>
          <Link to="/cart" className="flex min-h-[48px] flex-none items-center rounded-full bg-white px-5 font-semibold text-sage hover:bg-sage-soft">
            {t('viewCart')}
          </Link>
        </div>
        {freeMin !== null && (
          <div className="mr-2.5 mt-2.5 h-[3px] overflow-hidden rounded-full bg-white/25" aria-hidden="true">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
