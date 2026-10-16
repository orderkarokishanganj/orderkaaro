import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { anon, as, createDb, createUser, one, placeOrder, quote, rows, superuser, user, variantId, type Db } from './harness';

let db: Db;
let ownerId: string;
let atta: string; // P001 Aashirvaad atta 5 kg, Rs 250
let salt: string; // P076 Tata salt 1 kg, Rs 30
let maggi: string; // P094 Maggi, Rs 15

// Each test uses its own phone number so the per-phone spam limit never interferes.
let phoneCounter = 9000000000;
const nextPhone = () => String(++phoneCounter);

beforeAll(async () => {
  db = await createDb();
  ownerId = await createUser(db, 'owner@example.com', 'owner');
  atta = await variantId(db, 'P001');
  salt = await variantId(db, 'P076');
  maggi = await variantId(db, 'P094');
});

beforeEach(async () => {
  await db.query(`update public.settings set store_open = true, min_order_value = 0, delivery_pincodes = '{}'`);
  await db.query(`update public.product_variants set in_stock = true, track_stock = false, stock_qty = null, max_per_order = 20, active = true`);
  await db.query(`update public.products set active = true, deleted_at = null`);
});

describe('quote_cart', () => {
  it.each([
    [[{ id: 'maggi', qty: 1 }], 15, 50],
    [[{ id: 'maggi', qty: 13 }, { id: 'salt', qty: 1 }], 225, 30],
    [[{ id: 'atta', qty: 2 }], 500, 20],
    [[{ id: 'atta', qty: 3 }], 750, 20],
    [[{ id: 'atta', qty: 3 }, { id: 'salt', qty: 2 }], 810, 0],
  ])('charges the right delivery fee for %j', async (cart, subtotal, fee) => {
    const ids: Record<string, string> = { atta, salt, maggi };
    const q = await quote(db, cart.map((c) => ({ variant_id: ids[c.id], quantity: c.qty })));
    expect(q.subtotal).toBe(subtotal);
    expect(q.delivery_fee).toBe(fee);
    expect(q.total).toBe(subtotal + fee);
    expect(q.free_delivery_min).toBe(800);
  });

  it('merges repeated lines', async () => {
    const q = await quote(db, [{ variant_id: salt, quantity: 1 }, { variant_id: salt, quantity: 2 }]);
    expect(q.lines).toHaveLength(1);
    expect(q.lines[0].quantity).toBe(3);
  });

  it('flags hidden, out of stock and over-limit items and leaves them out of the total', async () => {
    await db.query(`update public.products set active = false where slug = 'tata-salt'`);
    await db.query(`update public.product_variants set in_stock = false where legacy_id = 'P094'`);
    await db.query(`update public.product_variants set max_per_order = 2 where legacy_id = 'P001'`);
    const q = await quote(db, [{ variant_id: atta, quantity: 3 }, { variant_id: salt, quantity: 1 }, { variant_id: maggi, quantity: 1 }]);
    expect(q.lines.map((l) => [l.problem, l.max_quantity])).toEqual([['QUANTITY_LIMIT', 2], ['UNAVAILABLE', null], ['OUT_OF_STOCK', null]]);
    expect(q.problems).toBe(3);
    expect(q.subtotal).toBe(0);
  });

  it('uses tracked stock counts', async () => {
    await db.query(`update public.product_variants set track_stock = true, stock_qty = 2 where legacy_id = 'P001'`);
    const q = await quote(db, [{ variant_id: atta, quantity: 3 }]);
    expect(q.lines[0]).toMatchObject({ problem: 'NOT_ENOUGH_STOCK', max_quantity: 2 });
  });

  it('rejects malformed items', async () => {
    await expect(quote(db, [{ variant_id: 'not-a-uuid', quantity: 1 }])).rejects.toThrow('INVALID_ITEMS');
    await expect(quote(db, [{ variant_id: atta, quantity: 0 }])).rejects.toThrow('INVALID_ITEMS');
  });
});

describe('place_order', () => {
  it('saves the order with server prices and returns an order number', async () => {
    const phone = nextPhone();
    const o = await placeOrder(db, { phone, items: [{ variant_id: atta, quantity: 3 }], landmark: 'Opp. temple', expected_total: 770 });
    expect(o.order_number).toMatch(/^OK\d{6}-\d{3}$/);
    expect(o).toMatchObject({ subtotal: 750, delivery_fee: 20, discount: 0, total: 770 });

    const saved = await one<{ status: string; total: number; landmark: string; items: number }>(db, superuser, `
      select o.status, o.total, o.landmark, (select count(*)::int from public.order_items i where i.order_id = o.id) as items
      from public.orders o where o.order_number = $1`, [o.order_number]);
    expect(saved).toEqual({ status: 'new', total: 770, landmark: 'Opp. temple', items: 1 });

    const next = await placeOrder(db, { phone: nextPhone(), items: [{ variant_id: salt, quantity: 1 }] });
    expect(Number(next.order_number!.slice(-3))).toBe(Number(o.order_number!.slice(-3)) + 1);
  });

  it('accepts phone numbers with +91 or spaces', async () => {
    const o = await placeOrder(db, { phone: '+91 91234 56780', items: [{ variant_id: salt, quantity: 1 }] });
    const { customer_phone } = await one<{ customer_phone: string }>(db, superuser, 'select customer_phone from public.orders where id = $1', [o.order_id]);
    expect(customer_phone).toBe('9123456780');
  });

  it.each([
    [{ phone: '12345' }, 'INVALID_PHONE'],
    [{ phone: '5876543210' }, 'INVALID_PHONE'],
    [{ name: 'A' }, 'INVALID_NAME'],
    [{ address: 'abc' }, 'INVALID_ADDRESS'],
    [{ pincode: '85510' }, 'INVALID_PINCODE'],
    [{ website: 'http://spam' }, 'SPAM'],
  ])('rejects %j with %s', async (override, code) => {
    await expect(placeOrder(db, { phone: nextPhone(), items: [{ variant_id: salt, quantity: 1 }], ...override })).rejects.toThrow(code);
  });

  it('refuses orders while the store is closed', async () => {
    await db.query(`update public.settings set store_open = false, closed_message_en = 'Back tomorrow'`);
    await expect(placeOrder(db, { phone: nextPhone(), items: [{ variant_id: salt, quantity: 1 }] })).rejects.toThrow('STORE_CLOSED');
  });

  it('refuses a cart that changed, and when the total differs from what the customer saw', async () => {
    await db.query(`update public.product_variants set in_stock = false where legacy_id = 'P076'`);
    await expect(placeOrder(db, { phone: nextPhone(), items: [{ variant_id: salt, quantity: 1 }] })).rejects.toThrow('CART_CHANGED');
    await expect(placeOrder(db, { phone: nextPhone(), items: [{ variant_id: atta, quantity: 1 }], expected_total: 250 })).rejects.toThrow('PRICE_CHANGED');
    await expect(placeOrder(db, { phone: nextPhone(), items: [] })).rejects.toThrow('EMPTY_CART');
  });

  it('enforces the minimum order and delivery pincodes when set', async () => {
    await db.query(`update public.settings set min_order_value = 100`);
    await expect(placeOrder(db, { phone: nextPhone(), items: [{ variant_id: salt, quantity: 1 }] })).rejects.toThrow('BELOW_MINIMUM');
    await db.query(`update public.settings set min_order_value = 0, delivery_pincodes = '{855107}'`);
    await expect(placeOrder(db, { phone: nextPhone(), pincode: '855101', items: [{ variant_id: salt, quantity: 1 }] })).rejects.toThrow('PINCODE_NOT_SERVED');
    await expect(placeOrder(db, { phone: nextPhone(), pincode: '855107', items: [{ variant_id: salt, quantity: 1 }] })).resolves.toBeTruthy();
  });

  it('limits orders per phone and per network address', async () => {
    const phone = nextPhone();
    for (let i = 0; i < 3; i++) await placeOrder(db, { phone, items: [{ variant_id: salt, quantity: 1 }] });
    await expect(placeOrder(db, { phone, items: [{ variant_id: salt, quantity: 1 }] })).rejects.toThrow('TOO_MANY_ORDERS');

    const fromIp = { role: 'anon' as const, ip: '203.0.113.7' };
    for (let i = 0; i < 5; i++) await placeOrder(db, { phone: nextPhone(), items: [{ variant_id: salt, quantity: 1 }] }, fromIp);
    await expect(placeOrder(db, { phone: nextPhone(), items: [{ variant_id: salt, quantity: 1 }] }, fromIp)).rejects.toThrow('TOO_MANY_ORDERS');
  });
});

describe('coupons', () => {
  beforeAll(async () => {
    await db.query(`
      insert into public.coupons (code, type, value, min_order, max_discount, usage_limit_total, usage_limit_per_phone, expires_at, active) values
        ('TENOFF', 'percent', 10, 300, 50, null, null, null, true),
        ('FLAT40', 'flat', 40, 0, null, null, 1, null, true),
        ('ONCE', 'flat', 20, 0, null, 1, null, null, true),
        ('OLD', 'flat', 20, 0, null, null, null, now() - interval '1 day', true),
        ('OFF', 'flat', 20, 0, null, null, null, null, false)`);
  });

  it('applies percent discounts with a cap, and the minimum order', async () => {
    expect((await quote(db, [{ variant_id: atta, quantity: 1 }], 'tenoff')).coupon).toMatchObject({ valid: false, reason: 'COUPON_MIN_ORDER' });
    const q = await quote(db, [{ variant_id: atta, quantity: 2 }], 'tenoff');
    expect(q).toMatchObject({ subtotal: 500, delivery_fee: 20, discount: 50, total: 470 });
    const capped = await quote(db, [{ variant_id: atta, quantity: 3 }], 'TENOFF');
    expect(capped.discount).toBe(50);
  });

  it('never discounts more than the items cost', async () => {
    const q = await quote(db, [{ variant_id: salt, quantity: 1 }], 'FLAT40');
    expect(q).toMatchObject({ subtotal: 30, discount: 30, delivery_fee: 50, total: 50 });
  });

  it('rejects expired, disabled and unknown codes', async () => {
    for (const code of ['OLD', 'OFF', 'NOPE']) {
      const q = await quote(db, [{ variant_id: salt, quantity: 1 }], code);
      expect(q.coupon?.valid).toBe(false);
      expect(q.discount).toBe(0);
    }
    await expect(placeOrder(db, { phone: nextPhone(), coupon_code: 'OLD', items: [{ variant_id: salt, quantity: 1 }] })).rejects.toThrow('COUPON_INVALID');
  });

  it('enforces total and per-phone usage limits, ignoring cancelled orders', async () => {
    const first = await placeOrder(db, { phone: nextPhone(), coupon_code: 'ONCE', items: [{ variant_id: atta, quantity: 1 }] });
    expect(first.discount).toBe(20);
    await expect(placeOrder(db, { phone: nextPhone(), coupon_code: 'ONCE', items: [{ variant_id: atta, quantity: 1 }] })).rejects.toThrow('COUPON_INVALID');
    await as(db, user(ownerId), (tx) => tx.query(`update public.orders set status = 'cancelled' where id = $1`, [first.order_id]));
    await expect(placeOrder(db, { phone: nextPhone(), coupon_code: 'ONCE', items: [{ variant_id: atta, quantity: 1 }] })).resolves.toBeTruthy();

    const phone = nextPhone();
    await placeOrder(db, { phone, coupon_code: 'FLAT40', items: [{ variant_id: atta, quantity: 1 }] });
    const again = await quote(db, [{ variant_id: atta, quantity: 1 }], 'FLAT40', phone);
    expect(again.coupon).toMatchObject({ valid: false, reason: 'COUPON_PHONE_LIMIT' });
  });

  it('lets customers check a code without seeing coupon internals', async () => {
    const r = await one<{ c: Record<string, unknown> }>(db, anon, `select public.validate_coupon('TENOFF', 500) as c`);
    expect(r.c).toMatchObject({ valid: true, discount: 50 });
    expect(r.c).not.toHaveProperty('coupon_id');
  });
});

describe('order status and stock', () => {
  const setStatus = (orderId: string, status: string) =>
    as(db, user(ownerId), (tx) => tx.query(`update public.orders set status = $2 where id = $1`, [orderId, status]));
  const stock = async () => (await one<{ stock_qty: number }>(db, superuser, `select stock_qty from public.product_variants where legacy_id = 'P001'`)).stock_qty;

  it('takes stock when confirmed and gives it back when cancelled', async () => {
    await db.query(`update public.product_variants set track_stock = true, stock_qty = 10 where legacy_id = 'P001'`);
    const o = await placeOrder(db, { phone: nextPhone(), items: [{ variant_id: atta, quantity: 3 }] });
    expect(await stock()).toBe(10); // placing does not reserve stock
    await setStatus(o.order_id!, 'confirmed');
    expect(await stock()).toBe(7);
    await setStatus(o.order_id!, 'out_for_delivery'); // no double count
    expect(await stock()).toBe(7);
    await setStatus(o.order_id!, 'cancelled');
    expect(await stock()).toBe(10);

    const history = await rows<{ from_status: string | null; to_status: string; changed_by: string | null }>(db, superuser, `
      select from_status, to_status, changed_by from public.order_status_history where order_id = $1 order by id`, [o.order_id]);
    expect(history.map((h) => `${h.from_status}->${h.to_status}`)).toEqual(['null->new', 'new->confirmed', 'confirmed->out_for_delivery', 'out_for_delivery->cancelled']);
    expect(history.slice(1).every((h) => h.changed_by === ownerId)).toBe(true);
  });

  it('timestamps each step and blocks going backwards or reopening', async () => {
    const o = await placeOrder(db, { phone: nextPhone(), items: [{ variant_id: salt, quantity: 1 }] });
    await setStatus(o.order_id!, 'delivered'); // skipping steps forward is allowed
    const t = await one<{ confirmed_at: string | null; delivered_at: string | null }>(db, superuser,
      'select confirmed_at, delivered_at from public.orders where id = $1', [o.order_id]);
    expect(t.confirmed_at).not.toBeNull();
    expect(t.delivered_at).not.toBeNull();
    await expect(setStatus(o.order_id!, 'confirmed')).rejects.toThrow('INVALID_STATUS_CHANGE');
    await expect(setStatus(o.order_id!, 'cancelled')).rejects.toThrow('INVALID_STATUS_CHANGE');
  });
});
