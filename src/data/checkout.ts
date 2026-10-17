import { DatabaseError, rpc, supabaseConfigured } from '../lib/rest';

// Shapes returned by quote_cart() and place_order() in supabase/migrations/*_checkout_functions.sql.
export type LineProblem = 'UNAVAILABLE' | 'OUT_OF_STOCK' | 'NOT_ENOUGH_STOCK' | 'QUANTITY_LIMIT';

export interface QuoteLine {
  variant_id: string;
  product_id: string | null;
  name_en: string | null;
  name_hi: string | null;
  unit_en: string | null;
  unit_hi: string | null;
  unit_price: number | null;
  mrp: number | null;
  quantity: number;
  line_total: number;
  problem: LineProblem | null;
  max_quantity: number | null;
}

export interface Quote {
  lines: QuoteLine[];
  problems: number;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  coupon: { valid: boolean; code: string; reason: string | null; discount: number; min_order?: number; description?: string } | null;
  free_delivery_min: number | null;
  min_order_value: number;
  below_minimum: boolean;
  store_open?: boolean;
}

export interface PlacedOrder extends Quote {
  order_id: string;
  order_number: string;
  created_at: string;
  name: string;
  phone: string;
  address: string;
  landmark: string;
  pincode: string;
  notes: string;
}

export interface OrderPayload {
  name: string;
  phone: string;
  address: string;
  landmark: string;
  pincode: string;
  notes: string;
  lang: 'en' | 'hi';
  items: Array<{ variant_id: string; quantity: number }>;
  coupon_code: string | null;
  expected_total: number;
  website: string;
}

// Error codes raised on purpose by the database. Anything else means the system could not be reached.
const BUSINESS_CODES = new Set([
  'STORE_CLOSED', 'INVALID_NAME', 'INVALID_PHONE', 'INVALID_ADDRESS', 'INVALID_LANDMARK', 'INVALID_NOTES',
  'INVALID_PINCODE', 'PINCODE_NOT_SERVED', 'TOO_MANY_ORDERS', 'EMPTY_CART', 'CART_CHANGED', 'BELOW_MINIMUM',
  'COUPON_INVALID', 'PRICE_CHANGED', 'INVALID_ITEMS', 'TOO_MANY_ITEMS', 'SPAM', 'INVALID_ORDER',
]);

/** The shop said no for a reason the customer can act on (fresh quote attached when useful). */
export class CheckoutError extends Error {
  constructor(public code: string, public quote: Quote | null) {
    super(code);
  }
}

/** The database could not be reached; the customer can still order on WhatsApp. */
export class ConnectionError extends Error {}

function toError(error: DatabaseError): Error {
  if (BUSINESS_CODES.has(error.message)) {
    let quote: Quote | null = null;
    try {
      const parsed = error.details ? JSON.parse(error.details) : null;
      if (parsed && Array.isArray(parsed.lines)) quote = parsed as Quote;
    } catch {
      // Detail is not a quote (e.g. the closed message).
    }
    return new CheckoutError(error.message, quote);
  }
  return new ConnectionError(error.message);
}

async function call<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  if (!supabaseConfigured) throw new ConnectionError('Supabase is not configured');
  try {
    return await rpc<T>(fn, args);
  } catch (err) {
    throw err instanceof DatabaseError ? toError(err) : new ConnectionError(String(err));
  }
}

export async function quoteCart(items: Array<{ variant_id: string; quantity: number }>, couponCode?: string | null, phone?: string | null): Promise<Quote> {
  return call<Quote>('quote_cart', { p_items: items, p_coupon_code: couponCode || undefined, p_phone: phone || undefined });
}

export async function placeOrder(payload: OrderPayload): Promise<PlacedOrder> {
  return call<PlacedOrder>('place_order', { p_order: payload });
}
