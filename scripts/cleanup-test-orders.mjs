// Deletes orders created by testing: only orders whose customer name starts with "TEST "
// (order items, status history and coupon use go with them). Real orders are never touched.
//   node scripts/cleanup-test-orders.mjs            -> list what would be deleted
//   node scripts/cleanup-test-orders.mjs --delete   -> delete them
import { createClient } from '@supabase/supabase-js';
import { supabaseEnv } from './lib/env.mjs';

const { url, serviceKey } = supabaseEnv({ test: process.argv.includes('--test'), needServiceKey: true });
const db = createClient(url, serviceKey, { auth: { persistSession: false } });

const { data, error } = await db.from('orders').select('id, order_number, customer_name, total, created_at').like('customer_name', 'TEST %');
if (error) {
  console.error(error.message);
  process.exit(1);
}
for (const o of data) console.log(`${o.order_number}  ${o.customer_name}  ₹${o.total}  ${o.created_at}`);
if (!process.argv.includes('--delete')) {
  console.log(`${data.length} test order(s). Run again with --delete to remove them.`);
  process.exit(0);
}
if (data.length) {
  const { error: delError } = await db.from('orders').delete().in('id', data.map((o) => o.id));
  if (delError) {
    console.error(delError.message);
    process.exit(1);
  }
}
console.log(`Deleted ${data.length} test order(s).`);
