import { useCallback, useEffect, useState } from 'react';
import { Receipt, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { formatRupees } from '../lib/pricing';
import { usePageTitle } from '../ui/usePageTitle';
import { db, errorText } from './data';
import { useOrderAlerts } from './OrderAlerts';
import { formatWhen, STATUS, type OrderStatus } from './orderStatus';
import { StatusBadge } from './StatusBadge';
import { Spinner } from './ui';

const PAGE = 50;
const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'open', label: 'In progress' },
  { value: 'all', label: 'All' },
  ...(Object.keys(STATUS) as OrderStatus[]).map((s) => ({ value: s, label: STATUS[s].label })),
];
const RANGES = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'all', label: 'All time' },
];

interface Row {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  total: number;
  created_at: string;
  order_items: Array<{ count: number }>;
}

/** Start of a date range in India time, as an ISO timestamp. */
function rangeStart(range: string): string | null {
  const now = new Date();
  const todayIndia = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const midnight = new Date(`${todayIndia.getFullYear()}-${String(todayIndia.getMonth() + 1).padStart(2, '0')}-${String(todayIndia.getDate()).padStart(2, '0')}T00:00:00+05:30`);
  if (range === 'today') return midnight.toISOString();
  if (range === '7d') return new Date(midnight.getTime() - 6 * 86400000).toISOString();
  if (range === '30d') return new Date(midnight.getTime() - 29 * 86400000).toISOString();
  return null;
}

export default function OrdersPage() {
  usePageTitle('Orders · Admin');
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? 'open';
  const range = params.get('range') ?? 'all';
  const [q, setQ] = useState(params.get('q') ?? '');
  const { version, markSeen } = useOrderAlerts();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
    setLimit(PAGE);
  };

  const load = useCallback(async () => {
    let query = db().from('orders')
      .select('id, order_number, status, customer_name, customer_phone, total, created_at, order_items(count)')
      .order('created_at', { ascending: false })
      .range(0, limit);
    if (status === 'open') query = query.in('status', ['new', 'confirmed', 'out_for_delivery']);
    else if (status !== 'all') query = query.eq('status', status as OrderStatus);
    const start = rangeStart(range);
    if (start) query = query.gte('created_at', start);
    // Only letters, digits, spaces and dashes reach the filter.
    const term = (params.get('q') ?? '').replace(/[^\p{L}\p{N} -]/gu, '').trim();
    if (term) query = query.or(`order_number.ilike.%${term}%,customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%`);
    const { data, error: e } = await query;
    if (e) return setError(errorText(e));
    setError(null);
    setHasMore(data.length > limit);
    setRows((data as unknown as Row[]).slice(0, limit));
  }, [status, range, limit, params]);

  useEffect(() => {
    load();
  }, [load, version]);
  useEffect(() => markSeen(), [markSeen, version]);

  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get('q') ?? '') !== q) setParam('q', q);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const chip = (active: boolean) =>
    `inline-flex min-h-[40px] flex-none items-center whitespace-nowrap rounded-full border px-3 text-sm font-semibold ${active ? 'border-sage bg-sage text-white' : 'border-line bg-white hover:border-sage'}`;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-[26px]">Orders</h1>

      <label className="relative mt-3 block">
        <span className="sr-only">Search orders</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone" aria-hidden="true" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order number, name or phone" className="field pl-10" />
      </label>

      <div className="-mx-4 mt-3 overflow-x-auto px-4" role="group" aria-label="Status">
        <div className="flex gap-2 pb-1">
          {STATUS_FILTERS.map((f) => (
            <button key={f.value} type="button" aria-pressed={status === f.value} onClick={() => setParam('status', f.value)} className={chip(status === f.value)}>{f.label}</button>
          ))}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Date">
        {RANGES.map((r) => (
          <button key={r.value} type="button" aria-pressed={range === r.value} onClick={() => setParam('range', r.value)} className={chip(range === r.value)}>{r.label}</button>
        ))}
      </div>

      {error && !rows && (
        <div className="card mt-4 p-6 text-center">
          <p className="font-semibold text-clay">{error}</p>
          <button type="button" onClick={load} className="btn-primary mt-3">Try again</button>
        </div>
      )}
      {!rows && !error && <Spinner label="Loading orders…" />}
      {rows && rows.length === 0 && (
        <div className="card mt-4 flex flex-col items-center gap-2 p-8 text-center text-stone">
          <Receipt className="h-8 w-8" aria-hidden="true" />
          <p>No orders match these filters.</p>
        </div>
      )}
      {rows && rows.length > 0 && (
        <ul className="mt-4 space-y-2">
          {rows.map((o) => (
            <li key={o.id}>
              <Link to={`/admin/orders/${o.id}`} className={`card flex items-center justify-between gap-3 p-3 hover:border-sage ${o.status === 'new' ? 'border-clay' : ''}`}>
                <span className="min-w-0">
                  <span className="block font-semibold">{o.order_number}</span>
                  <span className="block truncate text-sm">{o.customer_name} · {o.customer_phone}</span>
                  <span className="block text-xs text-stone">{formatWhen(o.created_at)} · {o.order_items[0]?.count ?? 0} items</span>
                </span>
                <span className="flex flex-none flex-col items-end gap-1">
                  <span className="font-semibold tabular-nums">{formatRupees(o.total)}</span>
                  <StatusBadge status={o.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {hasMore && (
        <div className="mt-4 text-center">
          <button type="button" className="btn-quiet" onClick={() => setLimit((l) => l + PAGE)}>Show more orders</button>
        </div>
      )}
    </div>
  );
}
