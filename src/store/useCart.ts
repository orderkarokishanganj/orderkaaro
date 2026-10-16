import { useMemo } from 'react';
import { useCatalog } from '../data/CatalogContext';
import type { Product, Variant } from '../data/catalog';
import { cartTotals, type DeliveryTier } from '../lib/pricing';
import { cartStore } from './stores';

const NO_TIERS: DeliveryTier[] = [];

export interface CartLine {
  variantId: string;
  quantity: number;
  /** Null when the item is no longer in the catalogue (hidden or removed). */
  product: Product | null;
  variant: Variant | null;
}

/**
 * The cart joined with the catalogue. "estimate" uses prices on this phone; checkout always
 * re-prices on the server (quote_cart) before an order is placed.
 */
export function useCart() {
  const cart = cartStore.useValue();
  const { variantById, catalog } = useCatalog();
  const tiers = catalog?.settings.deliveryTiers ?? NO_TIERS;

  return useMemo(() => {
    const lines: CartLine[] = Object.entries(cart).map(([variantId, quantity]) => {
      const hit = variantById.get(variantId);
      return { variantId, quantity, product: hit?.product ?? null, variant: hit?.variant ?? null };
    });
    const sellable = lines.filter((l) => l.variant?.available);
    const estimate = cartTotals(
      sellable.map((l) => ({ price: l.variant!.price, quantity: Math.min(l.quantity, l.variant!.maxQuantity) })),
      tiers,
    );
    return {
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      estimate,
      tiers,
      quantityOf: (variantId: string) => cart[variantId] ?? 0,
    };
  }, [cart, variantById, tiers]);
}
