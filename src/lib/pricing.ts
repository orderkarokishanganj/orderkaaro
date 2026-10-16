// The one place the storefront works out delivery fees and totals. The database applies the
// same rule in delivery_fee_for(); tests/db/pricing-parity.test.ts keeps the two identical.
// The homepage offer, the cart, checkout and the WhatsApp message all read from here.

export interface DeliveryTier {
  min: number;
  fee: number;
}

/** Reads delivery tiers from the settings row, dropping anything malformed. */
export function parseTiers(value: unknown): DeliveryTier[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((t): t is DeliveryTier =>
      typeof t === 'object' && t !== null &&
      Number.isInteger((t as DeliveryTier).min) && Number.isInteger((t as DeliveryTier).fee))
    .map((t) => ({ min: t.min, fee: t.fee }));
}

/** Fee for a subtotal: the tier with the highest "min" not above the subtotal. Empty cart is free. */
export function deliveryFee(subtotal: number, tiers: DeliveryTier[]): number {
  if (subtotal <= 0) return 0;
  let best: DeliveryTier | null = null;
  for (const tier of tiers) {
    if (tier.min <= subtotal && (!best || tier.min > best.min)) best = tier;
  }
  return best ? best.fee : 0;
}

/** Smallest subtotal with free delivery, or null when delivery is never free. */
export function freeDeliveryMin(tiers: DeliveryTier[]): number | null {
  const free = tiers.filter((t) => t.fee === 0).map((t) => t.min);
  return free.length ? Math.min(...free) : null;
}

/** Rupees still needed for free delivery: 0 once reached, null when delivery is never free. */
export function amountToFreeDelivery(subtotal: number, tiers: DeliveryTier[]): number | null {
  const min = freeDeliveryMin(tiers);
  if (min === null) return null;
  return Math.max(min - subtotal, 0);
}

/** Whole-number discount % from MRP, or null when there is no saving. */
export function discountPercent(price: number, mrp: number | null | undefined): number | null {
  if (!mrp || mrp <= price) return null;
  const pct = Math.round(((mrp - price) / mrp) * 100);
  return pct > 0 ? pct : null;
}

export interface Totals {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

/** Totals for cart lines. The discount comes from a server-validated coupon and never exceeds the items. */
export function cartTotals(lines: Array<{ price: number; quantity: number }>, tiers: DeliveryTier[], discount = 0): Totals {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const fee = deliveryFee(subtotal, tiers);
  const safeDiscount = Math.min(Math.max(discount, 0), subtotal);
  return { subtotal, deliveryFee: fee, discount: safeDiscount, total: subtotal + fee - safeDiscount };
}

export function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
