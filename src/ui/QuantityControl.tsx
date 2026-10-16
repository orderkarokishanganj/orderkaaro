import { Minus, Plus } from 'lucide-react';
import type { Product, Variant } from '../data/catalog';
import { useLang } from '../i18n/LanguageContext';
import { cartStore, setCartQuantity } from '../store/stores';

interface Props {
  product: Product;
  variant: Variant;
  /** Full-width button (cards) or compact (cart rows). */
  block?: boolean;
}

/** Add button, then a − qty + stepper; "Out of stock" when the size can't be bought. */
export function QuantityControl({ product, variant, block = true }: Props) {
  const { t, pick } = useLang();
  const cart = cartStore.useValue();
  const qty = cart[variant.id] ?? 0;
  const name = `${pick(product.nameEn, product.nameHi)} ${pick(variant.unitEn, variant.unitHi)}`;
  const width = block ? 'w-full' : 'w-[120px]';

  if (!variant.available) {
    return (
      <div className={`${width} flex min-h-[44px] items-center justify-center rounded-full bg-out-bg px-3 text-sm font-semibold text-out-ink`}>
        {t('outOfStock')}
      </div>
    );
  }

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => setCartQuantity(variant.id, 1, variant.maxQuantity)}
        className={`btn-outline ${width}`}
        aria-label={`${t('add')}: ${name}`}
      >
        {t('add')}
      </button>
    );
  }

  const atMax = qty >= variant.maxQuantity;
  return (
    <div className={`${width} flex min-h-[44px] items-center justify-between rounded-full bg-sage text-white`}>
      <button
        type="button"
        onClick={() => setCartQuantity(variant.id, qty - 1, variant.maxQuantity)}
        className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sage-dark"
        aria-label={`${t('decrease')}: ${name}`}
      >
        <Minus className="h-5 w-5" aria-hidden="true" />
      </button>
      <span className="font-semibold" aria-live="polite" aria-label={t('inCart', { n: qty })}>{qty}</span>
      <button
        type="button"
        onClick={() => setCartQuantity(variant.id, qty + 1, variant.maxQuantity)}
        disabled={atMax}
        className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sage-dark disabled:opacity-40"
        aria-label={atMax ? t('limitReached') : `${t('increase')}: ${name}`}
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
