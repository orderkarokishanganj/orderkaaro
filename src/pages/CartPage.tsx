import { AlertCircle, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../data/CatalogContext';
import { useQuote } from '../data/useQuote';
import { useLang } from '../i18n/LanguageContext';
import { amountToFreeDelivery, formatRupees, type Totals } from '../lib/pricing';
import { fixCart, lineProblems, PROBLEM_TEXT } from '../store/cartProblems';
import { setCartQuantity } from '../store/stores';
import { useCart } from '../store/useCart';
import { ProductImage } from '../ui/ProductImage';
import { QuantityControl } from '../ui/QuantityControl';
import { EmptyState } from '../ui/states';
import { usePageTitle } from '../ui/usePageTitle';
import { TotalsCard } from '../ui/TotalsCard';

export default function CartPage() {
  const { t, pick } = useLang();
  const { catalog } = useCatalog();
  const { lines, estimate, tiers } = useCart();
  usePageTitle(t('cartTitle'));
  const items = lines.filter((l) => l.variant).map((l) => ({ variant_id: l.variantId, quantity: l.quantity }));
  const { quote, loading, offline } = useQuote(items);

  if (lines.length === 0) {
    return (
      <div className="page">
        <h1 className="mb-4 text-[29px]">{t('cartTitle')}</h1>
        <EmptyState icon={<ShoppingBag className="h-7 w-7" />} title={t('cartEmpty')} text={t('cartEmptyHint')}>
          <Link to="/" className="btn-primary">{t('startShopping')}</Link>
        </EmptyState>
      </div>
    );
  }

  const problems = lineProblems(lines, quote);
  const totals: Totals = quote
    ? { subtotal: quote.subtotal, deliveryFee: quote.delivery_fee, discount: quote.discount, total: quote.total }
    : estimate;
  const belowMinimum = quote ? quote.below_minimum : estimate.subtotal < (catalog?.settings.minOrderValue ?? 0);
  const storeClosed = catalog ? !catalog.settings.storeOpen : false;
  const canCheckout = problems.size === 0 && !belowMinimum && !storeClosed && (quote !== null || offline);

  return (
    <div className="page grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div>
        <h1 className="mb-4 text-[29px]">{t('cartTitle')}</h1>
        {problems.size > 0 && (
          <div role="alert" className="mb-4 flex flex-wrap items-center gap-3 rounded-panel bg-peach p-4 text-clay">
            <AlertCircle className="h-5 w-5 flex-none" aria-hidden="true" />
            <p className="flex-1">{t('cartNeedsFix')}</p>
            <button type="button" onClick={() => fixCart(problems)} className="btn bg-white text-clay hover:bg-oat">{t('removeUnavailable')}</button>
          </div>
        )}
        <ul className="space-y-3">
          {lines.map((line) => {
            const issue = problems.get(line.variantId);
            const quoted = quote?.lines.find((q) => q.variant_id === line.variantId);
            const price = quoted?.unit_price ?? line.variant?.price ?? null;
            return (
              <li key={line.variantId} className={`card flex gap-3 p-3 ${issue ? 'border-clay' : ''}`}>
                <div className="h-20 w-20 flex-none rounded-plate bg-sage-plate p-1.5">
                  {line.product && <ProductImage product={line.product} className="h-full w-full" dimmed={!!issue} />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      {line.product ? (
                        <Link to={`/product/${line.product.slug}`} className="line-clamp-2 font-semibold hover:underline">{pick(line.product.nameEn, line.product.nameHi)}</Link>
                      ) : (
                        <p className="font-semibold text-stone">{t('problemUnavailable')}</p>
                      )}
                      {line.variant && (
                        <p className="text-sm text-stone">{pick(line.variant.unitEn, line.variant.unitHi)}{price !== null && ` · ${formatRupees(price)}`}</p>
                      )}
                    </div>
                    {price !== null && !issue && <p className="flex-none font-semibold">{formatRupees(price * line.quantity)}</p>}
                  </div>
                  {issue && (
                    <p className="text-sm font-semibold text-clay">{t(PROBLEM_TEXT[issue.problem], { n: issue.max ?? 0 })}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-2">
                    {line.product && line.variant ? <QuantityControl product={line.product} variant={line.variant} block={false} /> : <span />}
                    <button
                      type="button"
                      onClick={() => setCartQuantity(line.variantId, 0, 0)}
                      className="flex h-11 w-11 items-center justify-center rounded-full text-stone hover:bg-oat hover:text-clay"
                      aria-label={`${t('remove')}${line.product ? `: ${pick(line.product.nameEn, line.product.nameHi)}` : ''}`}
                    >
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="lg:pt-14">
        <TotalsCard totals={totals} freeIn={amountToFreeDelivery(totals.subtotal, tiers)}>
          <p className="mt-3 min-h-[1.5em] text-sm text-stone" aria-live="polite">
            {loading ? t('checkingPrices') : offline ? t('savedPricesNote') : ''}
          </p>
          {belowMinimum && catalog && (
            <p className="mt-2 text-sm font-semibold text-clay">{t('belowMinimum', { amount: formatRupees(catalog.settings.minOrderValue) })}</p>
          )}
          {storeClosed && <p className="mt-2 text-sm font-semibold text-clay">{t('errStoreClosed')}</p>}
          {canCheckout ? (
            <Link to="/checkout" className="btn-primary mt-3 w-full text-lg">{t('checkout')}</Link>
          ) : (
            <button type="button" disabled className="btn-primary mt-3 w-full text-lg">{t('checkout')}</button>
          )}
          <p className="mt-3 text-center text-sm text-stone">{t('payment')}</p>
        </TotalsCard>
      </aside>
    </div>
  );
}
