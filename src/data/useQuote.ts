import { useEffect, useState } from 'react';
import { CheckoutError, quoteCart, type Quote } from './checkout';

export interface QuoteState {
  quote: Quote | null;
  loading: boolean;
  /** The server could not be reached; the page falls back to prices saved on the phone. */
  offline: boolean;
}

/** Server prices for the cart, refreshed shortly after the cart, coupon or phone changes. */
export function useQuote(items: Array<{ variant_id: string; quantity: number }>, coupon: string | null = null, phone: string | null = null): QuoteState & { setQuote: (q: Quote) => void } {
  const key = JSON.stringify([items, coupon, phone]);
  const [state, setState] = useState<QuoteState>({ quote: null, loading: items.length > 0, offline: false });

  useEffect(() => {
    if (items.length === 0) {
      setState({ quote: null, loading: false, offline: false });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    const timer = setTimeout(async () => {
      try {
        const quote = await quoteCart(items, coupon, phone);
        if (!cancelled) setState({ quote, loading: false, offline: false });
      } catch (err) {
        if (cancelled) return;
        // A malformed cart (e.g. an id from an old version) behaves like an unreachable server:
        // the cart page shows local data and flags unknown items itself.
        setState((s) => ({ quote: err instanceof CheckoutError ? s.quote : null, loading: false, offline: true }));
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // `key` captures items, coupon and phone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { ...state, setQuote: (quote) => setState({ quote, loading: false, offline: false }) };
}
