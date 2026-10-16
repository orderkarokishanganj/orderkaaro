import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRupees } from '../lib/pricing';
import { usePageTitle } from '../ui/usePageTitle';
import { db, errorText } from './data';
import { useOrderAlerts } from './OrderAlerts';
import { OrdersChart, type DayPoint } from './OrdersChart';
import { formatWhen, type OrderStatus } from './orderStatus';
import { StatusBadge } from './StatusBadge';
import { Spinner } from './ui';

interface Dashboard {
  today_orders: number;
  today_revenue: number;
  week_revenue: number;
  month_revenue: number;
  new_orders: number;
  pending_orders: number;
  out_of_stock: number;
  low_stock: Array<{ product_id: string; name: string; unit: string; stock_qty: number }>;
  top_products: Array<{ name: string; unit: string; quantity: number; revenue: number }>;
  daily: DayPoint[];
  recent: Array<{ id: string; order_number: string; customer_name: string; total: number; status: OrderStatus; created_at: string }>;
}

function Tile({ label, value, to, alert = false }: { label: string; value: string; to?: string; alert?: boolean }) {
  const body = (
    <>
      <p className="text-sm text-stone">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${alert ? 'text-clay' : ''}`}>{value}</p>
    </>
  );
  return to
    ? <Link to={to} className="card block p-4 hover:border-sage">{body}</Link>
    : <div className="card p-4">{body}</div>;
}

export default function DashboardPage() {
  usePageTitle('Dashboard · Admin');
  const { version } = useOrderAlerts();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data: d, error: e } = await db().rpc('admin_dashboard');
    if (e) setError(errorText(e));
    else {
      setData(d as unknown as Dashboard);
      setError(null);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load, version]);

  if (error && !data) {
    return (
      <div className="card p-6 text-center">
        <p className="font-semibold text-clay">{error}</p>
        <button type="button" onClick={load} className="btn-primary mt-3">Try again</button>
      </div>
    );
  }
  if (!data) return <Spinner label="Loading dashboard…" />;

  return (
    <div className="space-y-5">
      <h1 className="text-[26px]">Today</h1>

      {data.new_orders > 0 && (
        <Link to="/admin/orders?status=new" className="flex items-center justify-between gap-3 rounded-panel bg-peach p-4 font-semibold text-clay">
          <span>{data.new_orders} new order{data.new_orders === 1 ? '' : 's'} waiting to be confirmed</span>
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      )}

      <section aria-label="Orders and revenue" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Orders today" value={String(data.today_orders)} to="/admin/orders?range=today" />
        <Tile label="Revenue today" value={formatRupees(data.today_revenue)} />
        <Tile label="Last 7 days" value={formatRupees(data.week_revenue)} />
        <Tile label="This month" value={formatRupees(data.month_revenue)} />
        <Tile label="Orders in progress" value={String(data.pending_orders)} to="/admin/orders?status=open" />
        <Tile label="Sizes out of stock" value={String(data.out_of_stock)} to="/admin/products" alert={data.out_of_stock > 0} />
      </section>
      <p className="-mt-2 text-xs text-stone">Revenue counts every order except cancelled ones.</p>

      <section className="card p-4" aria-labelledby="chart-title">
        <h2 id="chart-title" className="text-lg">Orders per day, last 30 days</h2>
        <OrdersChart data={data.daily} />
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-4" aria-labelledby="recent-title">
          <div className="flex items-baseline justify-between">
            <h2 id="recent-title" className="text-lg">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-sage underline">All orders</Link>
          </div>
          {data.recent.length === 0 ? <p className="mt-2 text-sm text-stone">No orders yet.</p> : (
            <ul className="mt-2 divide-y divide-line">
              {data.recent.map((o) => (
                <li key={o.id}>
                  <Link to={`/admin/orders/${o.id}`} className="flex min-h-[52px] items-center justify-between gap-2 py-2 hover:bg-oat">
                    <span className="min-w-0">
                      <span className="block font-semibold">{o.order_number} · {o.customer_name}</span>
                      <span className="block text-xs text-stone">{formatWhen(o.created_at)}</span>
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
        </section>

        <div className="space-y-5">
          <section className="card p-4" aria-labelledby="low-title">
            <h2 id="low-title" className="text-lg">Low stock</h2>
            {data.low_stock.length === 0 ? (
              <p className="mt-2 text-sm text-stone">Nothing is running low. (Only sizes with stock counting turned on are checked.)</p>
            ) : (
              <ul className="mt-2 divide-y divide-line">
                {data.low_stock.map((s) => (
                  <li key={`${s.product_id}-${s.unit}`}>
                    <Link to={`/admin/products/${s.product_id}`} className="flex min-h-[44px] items-center justify-between gap-2 py-2 hover:bg-oat">
                      <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-clay" aria-hidden="true" /> {s.name} · {s.unit}</span>
                      <span className="font-semibold text-clay">{s.stock_qty} left</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-4" aria-labelledby="top-title">
            <h2 id="top-title" className="text-lg">Top sellers, last 30 days</h2>
            {data.top_products.length === 0 ? <p className="mt-2 text-sm text-stone">No sales yet.</p> : (
              <ol className="mt-2 divide-y divide-line">
                {data.top_products.map((p, i) => (
                  <li key={`${p.name}-${p.unit}`} className="flex items-center justify-between gap-2 py-2">
                    <span>{i + 1}. {p.name} · {p.unit}</span>
                    <span className="text-sm tabular-nums text-stone">{p.quantity} sold · {formatRupees(p.revenue)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
