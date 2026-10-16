import { PGlite, type Transaction } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (path: string) => readFileSync(`${root}${path}`, 'utf8');

export type Db = PGlite;
export type Tx = Transaction;

/** A fresh database with the Supabase stand-ins, every migration and (by default) the seed. */
export async function createDb({ seed = true }: { seed?: boolean } = {}): Promise<Db> {
  const db = new PGlite();
  await db.exec(read('tests/db/supabase-stubs.sql'));
  const migrations = readdirSync(`${root}supabase/migrations`).filter((f) => f.endsWith('.sql')).sort();
  for (const file of migrations) {
    await db.exec(read(`supabase/migrations/${file}`));
  }
  if (seed) {
    await db.exec(read('supabase/seed.sql'));
  }
  return db;
}

export type Actor =
  | { role: 'anon'; ip?: string }
  | { role: 'authenticated'; userId: string }
  | { role: 'superuser' };

export const anon: Actor = { role: 'anon' };
export const superuser: Actor = { role: 'superuser' };
export const user = (userId: string): Actor => ({ role: 'authenticated', userId });

/** Run queries as a customer (anon), a logged-in user, or the database owner, in one transaction. */
export async function as<T>(db: Db, actor: Actor, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    if (actor.role === 'anon') {
      await tx.exec('set local role anon');
      if (actor.ip) {
        await tx.query(`select set_config('request.headers', $1, true)`, [JSON.stringify({ 'x-forwarded-for': actor.ip })]);
      }
    } else if (actor.role === 'authenticated') {
      await tx.exec('set local role authenticated');
      await tx.query(`select set_config('request.jwt.claim.sub', $1, true)`, [actor.userId]);
    }
    return fn(tx);
  });
}

export async function rows<T = Record<string, unknown>>(db: Db, actor: Actor, sql: string, params: unknown[] = []): Promise<T[]> {
  return as(db, actor, async (tx) => (await tx.query<T>(sql, params)).rows);
}

export async function one<T = Record<string, unknown>>(db: Db, actor: Actor, sql: string, params: unknown[] = []): Promise<T> {
  const result = await rows<T>(db, actor, sql, params);
  if (result.length !== 1) throw new Error(`Expected one row, got ${result.length}: ${sql}`);
  return result[0];
}

/** Creates a login (auth.users row) and, if a role is given, an admin_users row. Returns the user id. */
export async function createUser(db: Db, email: string, role?: 'owner' | 'staff'): Promise<string> {
  const { id } = await one<{ id: string }>(db, superuser, 'insert into auth.users (email) values ($1) returning id', [email]);
  if (role) {
    await db.query('insert into public.admin_users (user_id, role, display_name) values ($1, $2, $3)', [id, role, email]);
  }
  return id;
}

/** Looks up a variant id by its old catalogue id (e.g. P001). */
export async function variantId(db: Db, legacyId: string): Promise<string> {
  const { id } = await one<{ id: string }>(db, superuser, 'select id from public.product_variants where legacy_id = $1', [legacyId]);
  return id;
}

export interface Quote {
  lines: Array<{
    variant_id: string;
    name_en: string;
    unit_price: number | null;
    quantity: number;
    line_total: number;
    problem: string | null;
    max_quantity: number | null;
  }>;
  problems: number;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  coupon: { valid: boolean; code: string; reason: string | null; discount: number } | null;
  free_delivery_min: number | null;
  below_minimum: boolean;
  order_number?: string;
  order_id?: string;
}

export async function quote(db: Db, items: Array<{ variant_id: string; quantity: number }>, coupon?: string, phone?: string): Promise<Quote> {
  const r = await one<{ q: Quote }>(db, anon, 'select public.quote_cart($1::jsonb, $2, $3) as q', [JSON.stringify(items), coupon ?? null, phone ?? null]);
  return r.q;
}

export interface OrderInput {
  name?: string;
  phone?: string;
  address?: string;
  landmark?: string;
  pincode?: string;
  notes?: string;
  lang?: string;
  items: Array<{ variant_id: string; quantity: number }>;
  coupon_code?: string;
  expected_total?: number;
  website?: string;
}

export async function placeOrder(db: Db, order: OrderInput, actor: Actor = anon): Promise<Quote> {
  const payload = { name: 'Test Customer', phone: '9876543210', address: 'Ward 5, near the post office', ...order };
  const r = await one<{ o: Quote }>(db, actor, 'select public.place_order($1::jsonb) as o', [JSON.stringify(payload)]);
  return r.o;
}
