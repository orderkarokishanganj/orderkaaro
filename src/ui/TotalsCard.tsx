import type { ReactNode } from 'react';
import { useLang } from '../i18n/LanguageContext';
import { formatRupees, type Totals } from '../lib/pricing';

export function TotalsCard({ totals, freeIn, children }: { totals: Totals; freeIn: number | null; children?: ReactNode }) {
  const { t } = useLang();
  return (
    <div className="card p-5">
      <dl className="space-y-2">
        <div className="flex justify-between"><dt>{t('subtotal')}</dt><dd>{formatRupees(totals.subtotal)}</dd></div>
        <div className="flex justify-between">
          <dt>{t('delivery')}</dt>
          <dd className={totals.deliveryFee === 0 ? 'font-semibold text-sage' : ''}>
            {totals.deliveryFee === 0 ? t('freeDelivery') : formatRupees(totals.deliveryFee)}
          </dd>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-sage"><dt>{t('discount')}</dt><dd>−{formatRupees(totals.discount)}</dd></div>
        )}
        <div className="flex justify-between border-t border-line pt-2 text-lg font-semibold">
          <dt>{t('total')}</dt><dd className="font-display">{formatRupees(totals.total)}</dd>
        </div>
      </dl>
      {freeIn !== null && freeIn > 0 && (
        <p className="mt-3 rounded-2xl bg-sage-mist px-3 py-2 text-sm">{t('toFreeDelivery', { amount: formatRupees(freeIn) })}</p>
      )}
      {children}
    </div>
  );
}
