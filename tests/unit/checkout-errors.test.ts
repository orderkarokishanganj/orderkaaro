import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The customer site talks to Supabase with plain fetch (src/lib/rest.ts). These check that shop
// rejections and connection problems still reach the checkout as the right kind of error.
async function load() {
  vi.resetModules();
  vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'public-anon-key');
  return import('../../src/data/checkout');
}

const reply = (status: number, body: string) => vi.fn(async () => new Response(body, { status }));

describe('checkout requests', () => {
  beforeEach(() => vi.unstubAllGlobals());
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('posts to the database function with the public key and returns its result', async () => {
    const fetch = reply(200, JSON.stringify({ total: 280 }));
    vi.stubGlobal('fetch', fetch);
    const { quoteCart } = await load();
    await expect(quoteCart([{ variant_id: 'v1', quantity: 1 }])).resolves.toEqual({ total: 280 });
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://example.supabase.co/rest/v1/rpc/quote_cart');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ p_items: [{ variant_id: 'v1', quantity: 1 }] });
    expect((init.headers as Record<string, string>).apikey).toBe('public-anon-key');
  });

  it('turns a shop rejection into a CheckoutError with the fresh quote', async () => {
    const quote = { lines: [], total: 300 };
    vi.stubGlobal('fetch', reply(400, JSON.stringify({ code: 'P0001', message: 'PRICE_CHANGED', details: JSON.stringify(quote) })));
    const { placeOrder, CheckoutError } = await load();
    const error = await placeOrder({} as never).catch((e) => e);
    expect(error).toBeInstanceOf(CheckoutError);
    expect(error.code).toBe('PRICE_CHANGED');
    expect(error.quote).toEqual(quote);
  });

  it('treats unknown database errors, server pages and network failures as connection problems', async () => {
    for (const fetch of [
      reply(500, JSON.stringify({ code: '42501', message: 'permission denied' })),
      reply(502, '<html>Bad gateway</html>'),
      vi.fn(async () => { throw new TypeError('Failed to fetch'); }),
    ]) {
      vi.stubGlobal('fetch', fetch);
      const { quoteCart, ConnectionError } = await load();
      await expect(quoteCart([])).rejects.toBeInstanceOf(ConnectionError);
    }
  });
});
