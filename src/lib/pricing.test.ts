import { describe, expect, it } from 'vitest';
import { amountToFreeDelivery, cartTotals, deliveryFee, discountPercent, formatRupees, freeDeliveryMin, parseTiers } from './pricing';

// The tiers the owner confirmed: free on Rs 800+, Rs 20 for 500-799, Rs 30 for 200-499, Rs 50 below.
const tiers = [
  { min: 0, fee: 50 },
  { min: 200, fee: 30 },
  { min: 500, fee: 20 },
  { min: 800, fee: 0 },
];

describe('deliveryFee', () => {
  it.each([
    [0, 0],
    [1, 50],
    [199, 50],
    [200, 30],
    [499, 30],
    [500, 20],
    [799, 20],
    [800, 0],
    [5000, 0],
  ])('subtotal %i costs %i', (subtotal, fee) => {
    expect(deliveryFee(subtotal, tiers)).toBe(fee);
  });

  it('does not depend on tier order', () => {
    expect(deliveryFee(650, [...tiers].reverse())).toBe(20);
  });
});

describe('free delivery', () => {
  it('finds the threshold the homepage advertises', () => {
    expect(freeDeliveryMin(tiers)).toBe(800);
    expect(freeDeliveryMin([{ min: 0, fee: 40 }])).toBeNull();
  });

  it('says how much more is needed', () => {
    expect(amountToFreeDelivery(380, tiers)).toBe(420);
    expect(amountToFreeDelivery(900, tiers)).toBe(0);
    expect(amountToFreeDelivery(100, [{ min: 0, fee: 40 }])).toBeNull();
  });
});

describe('cartTotals', () => {
  it('adds lines, delivery and a coupon discount', () => {
    expect(cartTotals([{ price: 250, quantity: 3 }], tiers)).toEqual({ subtotal: 750, deliveryFee: 20, discount: 0, total: 770 });
    expect(cartTotals([{ price: 250, quantity: 2 }], tiers, 50)).toEqual({ subtotal: 500, deliveryFee: 20, discount: 50, total: 470 });
  });

  it('never discounts more than the items cost', () => {
    expect(cartTotals([{ price: 30, quantity: 1 }], tiers, 40)).toEqual({ subtotal: 30, deliveryFee: 50, discount: 30, total: 50 });
  });
});

describe('helpers', () => {
  it('computes discount percent from MRP', () => {
    expect(discountPercent(250, 276)).toBe(9);
    expect(discountPercent(15, 25)).toBe(40);
    expect(discountPercent(100, 100)).toBeNull();
    expect(discountPercent(100, null)).toBeNull();
  });

  it('formats rupees the Indian way', () => {
    expect(formatRupees(1450)).toBe('₹1,450');
    expect(formatRupees(125000)).toBe('₹1,25,000');
  });

  it('parses tiers from settings and ignores junk', () => {
    expect(parseTiers([{ min: 0, fee: 50 }, { min: 'x', fee: 1 }, null])).toEqual([{ min: 0, fee: 50 }]);
    expect(parseTiers('nope')).toEqual([]);
  });
});
