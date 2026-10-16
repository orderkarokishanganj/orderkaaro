import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AlertCircle, MessageCircle, RefreshCw, WifiOff } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useCatalog } from '../data/CatalogContext';
import { CheckoutError, ConnectionError, placeOrder, type PlacedOrder } from '../data/checkout';
import { useQuote } from '../data/useQuote';
import { useLang } from '../i18n/LanguageContext';
import type { StringKey } from '../i18n/strings';
import { amountToFreeDelivery, formatRupees, type Totals } from '../lib/pricing';
import { normalizePhone, validateCheckout, type CheckoutErrors, type CheckoutForm } from '../lib/validation';
import { buildOrderMessage, whatsappUrl } from '../lib/whatsapp';
import { lineProblems } from '../store/cartProblems';
import { addPastOrder, clearCart, profileStore, type PastOrder } from '../store/stores';
import { useCart } from '../store/useCart';
import { FALLBACK_WHATSAPP } from '../ui/states';
import { usePageTitle } from '../ui/usePageTitle';
import { TotalsCard } from '../ui/TotalsCard';

const FIELD_ORDER: Array<keyof CheckoutForm> = ['name', 'phone', 'address', 'landmark', 'pincode', 'notes'];

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-semibold">{label}</label>
      {hint && <p id={`${id}-hint`} className="mb-1 text-sm text-stone">{hint}</p>}
      {children}
      {error && <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-clay">{error}</p>}
    </div>
  );
}

export default function CheckoutPage() {
  const { t, pick, lang } = useLang();
  const { catalog } = useCatalog();
  const { lines, estimate, tiers } = useCart();
  const navigate = useNavigate();
  const profile = profileStore.useValue();
  usePageTitle(t('checkoutTitle'));

  const [form, setForm] = useState<CheckoutForm>({
    name: profile.name, phone: profile.phone, address: profile.address, landmark: profile.landmark, pincode: profile.pincode, notes: '',
  });
  const [website, setWebsite] = useState(''); // spam trap: people never see or fill this
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ text: string; cartLink?: boolean } | null>(null);
  const [connectionLost, setConnectionLost] = useState(false);
  const placed = useRef(false);

  const items = lines.filter((l) => l.variant).map((l) => ({ variant_id: l.variantId, quantity: l.quantity }));
  const phone = normalizePhone(form.phone);
  const { quote, loading, setQuote } = useQuote(items, coupon, /^[6-9]\d{9}$/.test(phone) ? phone : null);

  if (lines.length === 0 && !placed.current) return <Navigate to="/cart" replace />;

  const settings = catalog?.settings;
  const whatsappNumber = settings?.whatsappNumber ?? FALLBACK_WHATSAPP;
  const requirePincode = (settings?.deliveryPincodes.length ?? 0) > 0;
  const problems = lineProblems(lines, quote);
  const totals: Totals = quote
    ? { subtotal: quote.subtotal, deliveryFee: quote.delivery_fee, discount: quote.discount, total: quote.total }
    : estimate;

  const update = (field: keyof CheckoutForm) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const showFieldErrors = (next: CheckoutErrors) => {
    setErrors(next);
    const first = FIELD_ORDER.find((f) => next[f]);
    if (first) document.getElementById(`checkout-${first}`)?.focus();
  };

  const saveAndFinish = (order: PastOrder, details: CheckoutForm) => {
    addPastOrder(order);
    profileStore.set({ name: details.name, phone: normalizePhone(details.phone), address: details.address, landmark: details.landmark, pincode: details.pincode });
    placed.current = true;
    clearCart();
    navigate(`/order/${encodeURIComponent(order.ref)}`, { replace: true });
  };

  const finishPlaced = (o: PlacedOrder) => {
    const text = buildOrderMessage({
      orderNumber: o.order_number,
      lines: o.lines.map((l) => ({ nameEn: l.name_en ?? '', unitEn: l.unit_en ?? '', quantity: l.quantity, lineTotal: l.line_total })),
      subtotal: o.subtotal,
      deliveryFee: o.delivery_fee,
      discount: o.discount,
      couponCode: o.coupon?.valid ? o.coupon.code : null,
      total: o.total,
      name: o.name,
      phone: o.phone,
      address: o.address,
      landmark: o.landmark,
      pincode: o.pincode,
      notes: o.notes,
    });
    saveAndFinish({
      ref: o.order_number,
      orderNumber: o.order_number,
      createdAt: o.created_at,
      subtotal: o.subtotal,
      deliveryFee: o.delivery_fee,
      discount: o.discount,
      total: o.total,
      lines: o.lines.map((l) => ({
        variantId: l.variant_id, productId: l.product_id, nameEn: l.name_en ?? '', nameHi: l.name_hi ?? '',
        unitEn: l.unit_en ?? '', unitHi: l.unit_hi ?? '', quantity: l.quantity, unitPrice: l.unit_price ?? 0,
      })),
      whatsappText: text,
    }, form);
  };

  /** Database unreachable: send the order on WhatsApp with phone-side prices, clearly marked unconfirmed. */
  const sendWithoutSaving = () => {
    const result = validateCheckout(form, requirePincode);
    if (!result.ok) return showFieldErrors(result.errors);
    const sellable = lines.filter((l) => l.variant?.available && l.product);
    const d = result.data;
    const text = buildOrderMessage({
      orderNumber: null,
      lines: sellable.map((l) => ({ nameEn: l.product!.nameEn, unitEn: l.variant!.unitEn, quantity: l.quantity, lineTotal: l.variant!.price * l.quantity })),
      subtotal: estimate.subtotal,
      deliveryFee: estimate.deliveryFee,
      discount: 0,
      total: estimate.total,
      ...d,
    });
    window.open(whatsappUrl(whatsappNumber, text), '_blank', 'noopener');
    saveAndFinish({
      ref: `WA-${Date.now()}`,
      orderNumber: null,
      createdAt: new Date().toISOString(),
      subtotal: estimate.subtotal,
      deliveryFee: estimate.deliveryFee,
      discount: 0,
      total: estimate.total,
      lines: sellable.map((l) => ({
        variantId: l.variantId, productId: l.product!.id, nameEn: l.product!.nameEn, nameHi: l.product!.nameHi,
        unitEn: l.variant!.unitEn, unitHi: l.variant!.unitHi, quantity: l.quantity, unitPrice: l.variant!.price,
      })),
      whatsappText: text,
    }, form);
  };

  const handleRefusal = (err: CheckoutError) => {
    if (err.quote) setQuote(err.quote);
    const fieldError: Partial<Record<string, [keyof CheckoutForm, StringKey]>> = {
      INVALID_NAME: ['name', 'errName'],
      INVALID_PHONE: ['phone', 'errPhone'],
      INVALID_ADDRESS: ['address', 'errAddress'],
      INVALID_LANDMARK: ['landmark', 'errLandmark'],
      INVALID_NOTES: ['notes', 'errNotes'],
      INVALID_PINCODE: ['pincode', 'errPincode'],
      PINCODE_NOT_SERVED: ['pincode', 'errPincodeNotServed'],
    };
    const field = fieldError[err.code];
    if (field) return showFieldErrors({ [field[0]]: field[1] });
    switch (err.code) {
      case 'STORE_CLOSED': return setNotice({ text: t('errStoreClosed') });
      case 'TOO_MANY_ORDERS': return setNotice({ text: t('errTooMany') });
      case 'CART_CHANGED': return setNotice({ text: t('errCartChanged'), cartLink: true });
      case 'BELOW_MINIMUM': return setNotice({ text: t('errBelowMinimum', { amount: formatRupees(settings?.minOrderValue ?? 0) }) });
      case 'PRICE_CHANGED': return setNotice({ text: t('errPriceChanged', { amount: formatRupees(err.quote?.total ?? 0) }) });
      case 'COUPON_INVALID': {
        const reason = (err.quote?.coupon?.reason ?? 'COUPON_INVALID') as StringKey;
        return setNotice({ text: t(reason, { amount: formatRupees(err.quote?.coupon?.min_order ?? 0) }) });
      }
      case 'EMPTY_CART': return navigate('/cart');
      default: return setNotice({ text: t('errGeneric') });
    }
  };

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    setNotice(null);
    const result = validateCheckout(form, requirePincode);
    if (!result.ok) return showFieldErrors(result.errors);
    if (settings && !settings.storeOpen) return setNotice({ text: t('errStoreClosed') });

    setSubmitting(true);
    try {
      const order = await placeOrder({
        ...result.data,
        lang,
        items,
        // A rejected code is shown to the customer but not sent: the total on screen already excludes it.
        coupon_code: quote?.coupon?.valid ? coupon : null,
        expected_total: totals.total,
        website,
      });
      setConnectionLost(false);
      finishPlaced(order);
    } catch (err) {
      if (err instanceof ConnectionError) setConnectionLost(true);
      else if (err instanceof CheckoutError) handleRefusal(err);
      else setNotice({ text: t('errGeneric') });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldProps = (field: keyof CheckoutForm) => ({
    id: `checkout-${field}`,
    value: form[field],
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': [errors[field] ? `checkout-${field}-error` : '', ['phone', 'address', 'landmark'].includes(field) ? `checkout-${field}-hint` : '']
      .filter(Boolean).join(' ') || undefined,
    className: `field ${errors[field] ? 'field-error' : ''}`,
  });
  const err = (field: keyof CheckoutForm) => (errors[field] ? t(errors[field] as StringKey) : undefined);
  const couponState = coupon && quote?.coupon ? quote.coupon : null;

  return (
    <form onSubmit={submit} noValidate className="page grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-[29px]">{t('checkoutTitle')}</h1>
          <Link to="/cart" className="inline-flex min-h-[44px] items-center font-semibold text-sage hover:underline">{t('editCart')}</Link>
        </div>

        <Field id="checkout-name" label={t('name')} error={err('name')}>
          <input {...fieldProps('name')} onChange={(e) => update('name')(e.target.value)} autoComplete="name" maxLength={80} />
        </Field>
        <Field id="checkout-phone" label={t('phone')} hint={t('phoneHint')} error={err('phone')}>
          <div className="flex items-center gap-2">
            <span className="flex h-[50px] items-center rounded-2xl border border-line bg-sage-plate px-3 text-stone" aria-hidden="true">+91</span>
            <input {...fieldProps('phone')} onChange={(e) => update('phone')(e.target.value)} type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={16} />
          </div>
        </Field>
        <Field id="checkout-address" label={t('address')} hint={t('addressHint')} error={err('address')}>
          <textarea {...fieldProps('address')} onChange={(e) => update('address')(e.target.value)} autoComplete="street-address" rows={3} maxLength={300} />
        </Field>
        <Field id="checkout-landmark" label={t('landmark')} hint={t('landmarkHint')} error={err('landmark')}>
          <input {...fieldProps('landmark')} onChange={(e) => update('landmark')(e.target.value)} maxLength={120} />
        </Field>
        <Field id="checkout-pincode" label={requirePincode ? t('pincodeRequired') : t('pincodeOptional')} error={err('pincode')}>
          <input {...fieldProps('pincode')} onChange={(e) => update('pincode')(e.target.value)} inputMode="numeric" autoComplete="postal-code" maxLength={6} className={`${fieldProps('pincode').className} max-w-[10rem]`} />
        </Field>
        <Field id="checkout-notes" label={t('notes')} error={err('notes')}>
          <textarea {...fieldProps('notes')} onChange={(e) => update('notes')(e.target.value)} rows={2} maxLength={300} />
        </Field>
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="checkout-website">Website</label>
          <input id="checkout-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>

        <div>
          <label htmlFor="checkout-coupon" className="mb-1 block font-semibold">{t('coupon')}</label>
          {coupon ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-sage-mist px-4 py-2 font-semibold tracking-wide">{coupon}</span>
              <button type="button" className="btn-quiet" onClick={() => { setCoupon(null); setCouponInput(''); }}>{t('removeCoupon')}</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                id="checkout-coupon"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                maxLength={20}
                autoComplete="off"
                className="field max-w-[14rem] uppercase"
              />
              <button type="button" className="btn-outline" disabled={!couponInput} onClick={() => setCoupon(couponInput)}>{t('applyCoupon')}</button>
            </div>
          )}
          <p className="mt-1 min-h-[1.5em] text-sm" aria-live="polite">
            {couponState?.valid && <span className="font-semibold text-sage">{t('couponApplied', { code: couponState.code, amount: formatRupees(couponState.discount) })}</span>}
            {couponState && !couponState.valid && (
              <span className="font-semibold text-clay">{t((couponState.reason ?? 'COUPON_INVALID') as StringKey, { amount: formatRupees(couponState.min_order ?? 0) })}</span>
            )}
          </p>
        </div>
      </div>

      <aside className="space-y-4 lg:pt-14">
        <div className="card p-5">
          <h2 className="mb-2 text-xl">{t('orderSummary')}</h2>
          <ul className="divide-y divide-line">
            {lines.map((l) => {
              const q = quote?.lines.find((x) => x.variant_id === l.variantId);
              const issue = problems.get(l.variantId);
              return (
                <li key={l.variantId} className="flex justify-between gap-3 py-2 text-sm">
                  <span className={issue ? 'text-clay' : ''}>
                    {l.product ? pick(l.product.nameEn, l.product.nameHi) : t('problemUnavailable')}
                    {l.variant && ` · ${pick(l.variant.unitEn, l.variant.unitHi)}`} × {l.quantity}
                  </span>
                  <span className="flex-none">{issue ? '—' : formatRupees(q?.line_total ?? (l.variant ? l.variant.price * l.quantity : 0))}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <TotalsCard totals={totals} freeIn={amountToFreeDelivery(totals.subtotal, tiers)}>
          <p className="mt-2 min-h-[1.5em] text-sm text-stone" aria-live="polite">{loading ? t('checkingPrices') : ''}</p>

          {problems.size > 0 && (
            <p className="mt-2 text-sm font-semibold text-clay">
              {t('cartNeedsFix')} <Link to="/cart" className="underline">{t('editCart')}</Link>
            </p>
          )}

          {notice && (
            <div role="alert" className="mt-3 flex gap-2 rounded-2xl bg-peach p-3 text-sm text-clay">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
              <p>
                {notice.text}
                {notice.cartLink && <> <Link to="/cart" className="font-semibold underline">{t('editCart')}</Link></>}
              </p>
            </div>
          )}

          {connectionLost ? (
            <div role="alert" className="mt-3 rounded-2xl bg-sage-mist p-4">
              <p className="flex items-center gap-2 font-semibold"><WifiOff className="h-5 w-5" aria-hidden="true" /> {t('offlineTitle')}</p>
              <p className="mt-1 text-sm text-ink-soft">{t('offlineText')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={sendWithoutSaving} className="btn-primary">
                  <MessageCircle className="h-5 w-5" aria-hidden="true" /> {t('sendOnWhatsAppAnyway')}
                </button>
                <button type="button" onClick={() => submit()} disabled={submitting} className="btn-outline">
                  <RefreshCw className="h-5 w-5" aria-hidden="true" /> {t('tryAgain')}
                </button>
              </div>
            </div>
          ) : (
            <button type="submit" disabled={submitting || problems.size > 0 || loading} className="btn-primary mt-3 w-full text-lg">
              {submitting ? t('placing') : `${t('placeOrder')} · ${formatRupees(totals.total)}`}
            </button>
          )}
          <p className="mt-3 text-sm text-stone">{t('paymentNote')}</p>
        </TotalsCard>
      </aside>
    </form>
  );
}
