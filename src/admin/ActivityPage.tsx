import { useCallback, useEffect, useState } from 'react';
import { History } from 'lucide-react';
import type { Json } from '../lib/database.types';
import { usePageTitle } from '../ui/usePageTitle';
import { useAdminAuth } from './auth';
import { db, errorText } from './data';
import { formatWhen } from './orderStatus';
import { Spinner, useToast } from './ui';

const AREAS: Record<string, string> = {
  products: 'Product',
  product_variants: 'Size / price / stock',
  product_images: 'Photo',
  categories: 'Category',
  orders: 'Order',
  order_items: 'Order item',
  coupons: 'Coupon',
  settings: 'Settings',
  admin_users: 'Admin account',
};
// Fields worth showing in a one-line summary; technical ones are left out.
const HIDDEN = new Set(['id', 'created_at', 'updated_at', 'product_id', 'category_id', 'variant_id', 'order_id', 'coupon_id', 'user_id', 'stock_applied', 'sort_order', 'client_ip']);

interface Entry {
  id: number;
  created_at: string;
  actor_name: string;
  table_name: string;
  record_id: string | null;
  action: string;
  changes: Json;
}

const show = (v: unknown) => {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)) return formatWhen(v);
  return typeof v === 'object' ? JSON.stringify(v) : String(v);
};

function describe(e: Entry): string {
  const c = (e.changes ?? {}) as Record<string, unknown>;
  if (e.action === 'update') {
    return Object.entries(c)
      .filter(([k]) => !HIDDEN.has(k))
      .map(([k, v]) => {
        const { old: before, new: after } = v as { old: unknown; new: unknown };
        return `${k.replace(/_/g, ' ')}: ${show(before)} → ${show(after)}`;
      })
      .join(' · ') || 'Details changed';
  }
  const label = c.name_en ?? c.code ?? c.order_number ?? c.unit_en ?? c.storage_path ?? '';
  return `${e.action === 'insert' ? 'Added' : 'Removed'}${label ? ` “${show(label)}”` : ''}`;
}

export default function ActivityPage() {
  const { state } = useAdminAuth();
  const toast = useToast();
  usePageTitle('Activity log · Admin');
  const isOwner = state.status === 'ready' && state.role === 'owner';
  const [area, setArea] = useState('');
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [more, setMore] = useState(false);

  const load = useCallback(async (before?: string) => {
    const { data, error } = await db().rpc('admin_activity_log', { p_table: area || undefined, p_before: before, p_limit: 50 });
    if (error) return toast('error', errorText(error));
    setEntries((list) => (before && list ? [...list, ...data] : data));
    setMore(data.length === 50);
  }, [area, toast]);
  useEffect(() => {
    if (isOwner) load();
  }, [load, isOwner]);

  if (!isOwner) return <p className="card p-6 text-center">Only the owner can see the activity log.</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-[26px]">Activity log</h1>
      <p className="mt-1 text-sm text-stone">Changes made in this admin panel. Customer orders appear here only when an admin changes them.</p>
      <label className="mt-3 block max-w-xs">
        <span className="sr-only">Show changes to</span>
        <select className="field" value={area} onChange={(e) => { setEntries(null); setArea(e.target.value); }}>
          <option value="">Everything</option>
          {Object.entries(AREAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>

      {!entries ? <Spinner /> : entries.length === 0 ? (
        <div className="card mt-4 flex flex-col items-center gap-2 p-8 text-center text-stone">
          <History className="h-8 w-8" aria-hidden="true" />
          <p>No changes recorded yet.</p>
        </div>
      ) : (
        <ol className="mt-4 space-y-2">
          {entries.map((e) => (
            <li key={e.id} className="card p-3">
              <p className="text-sm"><span className="font-semibold">{e.actor_name}</span> · {AREAS[e.table_name] ?? e.table_name} · <span className="text-stone">{formatWhen(e.created_at)}</span></p>
              <p className="mt-1 break-words text-sm text-ink-soft">{describe(e)}</p>
            </li>
          ))}
        </ol>
      )}
      {more && entries && (
        <div className="mt-4 text-center">
          <button type="button" className="btn-quiet" onClick={() => load(entries[entries.length - 1].created_at)}>Show older changes</button>
        </div>
      )}
    </div>
  );
}
