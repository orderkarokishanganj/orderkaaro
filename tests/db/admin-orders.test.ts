import { beforeAll, describe, expect, it } from 'vitest';
import { as, createDb, createUser, one, placeOrder, rows, superuser, user, variantId, type Actor, type Db } from './harness';

let db: Db;
let ownerId: string;
let staffId: string;
let atta: string; // Rs 250
let salt: string; // Rs 30
let phone = 9100000000;
const nextPhone = () => String(++phone);

beforeAll(async () => {
  db = await createDb();
  ownerId = await createUser(db, 'owner@example.com', 'owner');
  staffId = await createUser(db, 'staff@example.com', 'staff');
  await db.query(`update public.admin_users set display_name = 'Shop Owner' where user_id = $1`, [ownerId]);
  atta = await variantId(db, 'P001');
  salt = await variantId(db, 'P076');
});

const call = async <T>(actor: Actor, sql: string, params: unknown[] = []) => (await one<{ r: T }>(db, actor, `select ${sql} as r`, params)).r;
const items = async (orderId: string) => rows<{ id: string; name_en: string; quantity: number; unit_price: number }>(db, superuser,
  'select id, name_en, quantity, unit_price from public.order_items where order_id = $1 order by created_at, name_en', [orderId]);

describe('admin_set_order_status', () => {
  it('changes status with a note in the history', async () => {
    const o = await placeOrder(db, { phone: nextPhone(), items: [{ variant_id: salt, quantity: 1 }] });
    await call(user(staffId), `public.admin_set_order_status($1, 'confirmed', 'Deliver after 6 PM')`, [o.order_id]);
    const h = await rows<{ to_status: string; note: string; changed_by: string }>(db, superuser,
      'select to_status, note, changed_by from public.order_status_history where order_id = $1 order by id', [o.order_id]);
    expect(h).toEqual([
      { to_status: 'new', note: '', changed_by: null },
      { to_status: 'confirmed', note: 'Deliver after 6 PM', changed_by: staffId },
    ]);
    await expect(call(user(staffId), `public.admin_set_order_status($1, 'new')`, [o.order_id])).rejects.toThrow('INVALID_STATUS_CHANGE');
  });
});

describe('admin_update_order_items', () => {
  it('changes quantities, swaps items and recalculates totals and stock', async () => {
    await db.query(`update public.product_variants set track_stock = true, stock_qty = 10 where legacy_id in ('P001', 'P076')`);
    const o = await placeOrder(db, { phone: nextPhone(), items: [{ variant_id: atta, quantity: 3 }] }); // 750 + 20
    await call(user(ownerId), `public.admin_set_order_status($1, 'confirmed')`, [o.order_id]); // atta stock 10 -> 7
    const [line] = await items(o.order_id!);

    // Customer wants 1 atta instead of 3, plus 2 salt.
    const totals = await call<Record<string, number>>(user(staffId), 'public.admin_update_order_items($1, $2::jsonb)',
      [o.order_id, JSON.stringify([{ line_id: line.id, quantity: 1 }, { variant_id: salt, quantity: 2 }])]);
    expect(totals).toEqual({ subtotal: 310, delivery_fee: 30, discount: 0, total: 340 });
    expect((await items(o.order_id!)).map((i) => [i.name_en, i.quantity, i.unit_price])).toEqual([
      ['Aashirvaad Shud Chakki Atta', 1, 250],
      ['Tata Salt', 2, 30],
    ]);
    const stock = await rows<{ legacy_id: string; stock_qty: number }>(db, superuser,
      `select legacy_id, stock_qty from public.product_variants where legacy_id in ('P001', 'P076') order by legacy_id`);
    expect(stock).toEqual([{ legacy_id: 'P001', stock_qty: 9 }, { legacy_id: 'P076', stock_qty: 8 }]);
    const saved = await one<{ total: number }>(db, superuser, 'select total from public.orders where id = $1', [o.order_id]);
    expect(saved.total).toBe(340);
    await db.query(`update public.product_variants set track_stock = false, stock_qty = null where legacy_id in ('P001', 'P076')`);
  });

  it('keeps the price at order time for existing lines and recomputes coupon discounts', async () => {
    await db.query(`insert into public.coupons (code, type, value, max_discount) values ('TENPC', 'percent', 10, 100)`);
    const o = await placeOrder(db, { phone: nextPhone(), coupon_code: 'TENPC', items: [{ variant_id: atta, quantity: 2 }] }); // 500, -50
    await db.query(`update public.product_variants set price = 260 where legacy_id = 'P001'`);
    const [line] = await items(o.order_id!);
    const totals = await call<Record<string, number>>(user(staffId), 'public.admin_update_order_items($1, $2::jsonb)',
      [o.order_id, JSON.stringify([{ line_id: line.id, quantity: 4 }])]);
    expect(totals).toEqual({ subtotal: 1000, delivery_fee: 0, discount: 100, total: 900 }); // still Rs 250 each; 10% capped at 100
    const { discount } = await one<{ discount: number }>(db, superuser, 'select discount from public.coupon_redemptions where order_id = $1', [o.order_id]);
    expect(discount).toBe(100);
    await db.query(`update public.product_variants set price = 250 where legacy_id = 'P001'`);
  });

  it('refuses delivered or cancelled orders and empty edits', async () => {
    const o = await placeOrder(db, { phone: nextPhone(), items: [{ variant_id: salt, quantity: 1 }] });
    await expect(call(user(staffId), 'public.admin_update_order_items($1, $2::jsonb)', [o.order_id, '[]'])).rejects.toThrow('EMPTY_ORDER');
    await call(user(staffId), `public.admin_set_order_status($1, 'delivered')`, [o.order_id]);
    const [line] = await items(o.order_id!);
    await expect(call(user(staffId), 'public.admin_update_order_items($1, $2::jsonb)', [o.order_id, JSON.stringify([{ line_id: line.id, quantity: 2 }])]))
      .rejects.toThrow('ORDER_LOCKED');
  });
});

describe('admin_dashboard and admin_customers', () => {
  it('counts orders, revenue (without cancelled), stock and a 30-day series', async () => {
    const d = await call<Record<string, unknown>>(user(staffId), 'public.admin_dashboard()');
    const allToday = await one<{ n: number; revenue: number }>(db, superuser,
      `select count(*)::int as n, coalesce(sum(total) filter (where status <> 'cancelled'), 0)::int as revenue from public.orders`);
    expect(d.today_orders).toBe(allToday.n);
    expect(d.today_revenue).toBe(allToday.revenue);
    expect(d.daily).toHaveLength(30);
    expect((d.daily as Array<{ orders: number }>).at(-1)!.orders).toBe(allToday.n);
    expect((d.top_products as Array<{ name: string }>)[0].name).toBe('Aashirvaad Shud Chakki Atta');
    expect(d.recent).toHaveLength(Math.min(8, allToday.n));
  });

  it('groups customers by phone with order count and spend', async () => {
    const p = nextPhone();
    await placeOrder(db, { phone: p, name: 'Old Name', items: [{ variant_id: salt, quantity: 1 }] });
    await placeOrder(db, { phone: p, name: 'Ravi Kumar', items: [{ variant_id: salt, quantity: 2 }] });
    const c = await rows<{ phone: string; name: string; orders: number; total_spent: number }>(db, user(staffId),
      'select phone, name, orders, total_spent from public.admin_customers($1)', ['ravi']);
    expect(c).toEqual([{ phone: p, name: 'Ravi Kumar', orders: 2, total_spent: 30 + 50 + 60 + 50 }]);
    expect(await rows(db, user(staffId), 'select * from public.admin_customers($1)', [p.slice(-4)])).toHaveLength(1);
  });
});

describe('admins and activity log (owner only)', () => {
  it('adds an admin by email; staff cannot', async () => {
    await createUser(db, 'New.Helper@Example.com');
    await expect(call(user(staffId), `public.admin_add_admin('new.helper@example.com', 'staff')`)).rejects.toThrow('NOT_OWNER');
    await expect(call(user(ownerId), `public.admin_add_admin('nobody@example.com', 'staff')`)).rejects.toThrow('USER_NOT_FOUND');
    await call(user(ownerId), `public.admin_add_admin(' new.helper@example.com ', 'staff', 'Helper')`);
    const admins = await rows<{ email: string; role: string; display_name: string }>(db, user(ownerId), 'select email, role, display_name from public.admin_list_admins()');
    expect(admins).toEqual(expect.arrayContaining([{ email: 'New.Helper@Example.com', role: 'staff', display_name: 'Helper' }]));
    await expect(as(db, user(staffId), (tx) => tx.query('select * from public.admin_list_admins()'))).rejects.toThrow('NOT_OWNER');
  });

  it('shows who changed what', async () => {
    await as(db, user(ownerId), (tx) => tx.query(`update public.settings set announcement_en = 'Closed on Holi'`));
    const log = await rows<{ actor_name: string; table_name: string; action: string; changes: Record<string, { new: unknown }> }>(db, user(ownerId),
      `select actor_name, table_name, action, changes from public.admin_activity_log('settings')`);
    expect(log[0]).toMatchObject({ actor_name: 'Shop Owner', table_name: 'settings', action: 'update' });
    expect(log[0].changes.announcement_en.new).toBe('Closed on Holi');
    await expect(as(db, user(staffId), (tx) => tx.query('select * from public.admin_activity_log()'))).rejects.toThrow('NOT_OWNER');
  });

  it('reports coupon usage without cancelled orders', async () => {
    const stats = await rows<{ uses: number; discount_total: number }>(db, user(staffId), `
      select s.uses, s.discount_total from public.admin_coupon_stats() s join public.coupons c on c.id = s.coupon_id where c.code = 'TENPC'`);
    expect(stats).toEqual([{ uses: 1, discount_total: 100 }]);
  });
});
