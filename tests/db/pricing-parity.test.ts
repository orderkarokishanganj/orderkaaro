import { beforeAll, describe, expect, it } from 'vitest';
import { deliveryFee, type DeliveryTier } from '../../src/lib/pricing';
import { createDb, one, superuser, type Db } from './harness';

// The storefront (src/lib/pricing.ts) and the database (delivery_fee_for) must always agree,
// or the cart would show one total and the saved order another.
let db: Db;
beforeAll(async () => {
  db = await createDb({ seed: false });
});

const tierSets: DeliveryTier[][] = [
  [{ min: 0, fee: 50 }, { min: 200, fee: 30 }, { min: 500, fee: 20 }, { min: 800, fee: 0 }],
  [{ min: 0, fee: 30 }, { min: 499, fee: 0 }],
  [{ min: 0, fee: 40 }],
  [{ min: 800, fee: 0 }, { min: 0, fee: 25 }],
];

describe('delivery fee parity', () => {
  it.each(tierSets.map((t) => [JSON.stringify(t), t] as const))('matches the database for %s', async (_label, tiers) => {
    const subtotals = [0, 1, 50, 199, 200, 201, 498, 499, 500, 650, 799, 800, 801, 2500];
    const { fees } = await one<{ fees: number[] }>(db, superuser,
      'select array_agg(public.delivery_fee_for(s, $1::jsonb) order by ord) as fees from unnest($2::int[]) with ordinality as x(s, ord)',
      [JSON.stringify(tiers), subtotals]);
    expect(fees).toEqual(subtotals.map((s) => deliveryFee(s, tiers)));
  });
});
