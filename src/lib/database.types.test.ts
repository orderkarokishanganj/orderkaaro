import { createClient } from '@supabase/supabase-js';
import { describe, expectTypeOf, it } from 'vitest';
import type { Database, Json } from './database.types';

// Compile-time checks that the generated types work with supabase-js queries and RPCs.
// Nothing here talks to a server: the client is created but never awaited.
const client = createClient<Database>('http://localhost:54321', 'anon-key');

describe('database types', () => {
  it('type nested catalogue queries', () => {
    const query = client.from('products').select('id, name_en, name_hi, product_variants(id, price, mrp, in_stock), categories(slug)');
    expectTypeOf(query).resolves.toHaveProperty('data');
    type Row = NonNullable<Awaited<typeof query>['data']>[number];
    expectTypeOf<Row['name_hi']>().toEqualTypeOf<string>();
    expectTypeOf<Row['product_variants'][number]['mrp']>().toEqualTypeOf<number | null>();
    expectTypeOf<NonNullable<Row['categories']>['slug']>().toEqualTypeOf<string>();
  });

  it('type the checkout RPCs and enums', () => {
    const quote = client.rpc('quote_cart', { p_items: [], p_coupon_code: 'TENOFF' });
    expectTypeOf(quote).resolves.toHaveProperty('data');
    expectTypeOf<Awaited<typeof quote>['data']>().toMatchTypeOf<Json | null>();
    client.rpc('place_order', { p_order: { name: 'A' } });
    // @ts-expect-error functions that are not exposed are not callable
    client.rpc('next_order_number');
    // @ts-expect-error place_order needs its payload
    client.rpc('place_order', {});
    expectTypeOf<Database['public']['Enums']['order_status']>().toEqualTypeOf<'new' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled'>();
  });
});
