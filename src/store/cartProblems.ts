import type { LineProblem, Quote } from '../data/checkout';
import type { StringKey } from '../i18n/strings';
import { cartStore } from './stores';
import type { CartLine } from './useCart';

export const PROBLEM_TEXT: Record<LineProblem, StringKey> = {
  UNAVAILABLE: 'problemUnavailable',
  OUT_OF_STOCK: 'problemOutOfStock',
  NOT_ENOUGH_STOCK: 'problemNotEnough',
  QUANTITY_LIMIT: 'problemLimit',
};

export type CartProblems = Map<string, { problem: LineProblem; max: number | null }>;

/** Problems per cart line, from the server quote when there is one, else from the catalogue on the phone. */
export function lineProblems(lines: CartLine[], quote: Quote | null): CartProblems {
  const map: CartProblems = new Map();
  for (const q of quote?.lines ?? []) if (q.problem) map.set(q.variant_id, { problem: q.problem, max: q.max_quantity });
  for (const l of lines) {
    if (!l.variant) map.set(l.variantId, { problem: 'UNAVAILABLE', max: null });
    else if (!quote && !l.variant.available) map.set(l.variantId, { problem: 'OUT_OF_STOCK', max: null });
  }
  return map;
}

/** Removes items that can't be bought and lowers quantities to what is allowed. */
export function fixCart(problems: CartProblems) {
  cartStore.set((cart) => {
    const next = { ...cart };
    for (const [variantId, { problem, max }] of problems) {
      if ((problem === 'NOT_ENOUGH_STOCK' || problem === 'QUANTITY_LIMIT') && max && max > 0) next[variantId] = max;
      else delete next[variantId];
    }
    return next;
  });
}
