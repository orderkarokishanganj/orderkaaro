import { useEffect, useState } from 'react';
import { Download, Phone, Receipt, Search, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRupees } from '../lib/pricing';
import { usePageTitle } from '../ui/usePageTitle';
import { db, errorText } from './data';
import { formatWhen } from './orderStatus';
import { Spinner, useToast } from './ui';

interface Customer {
  phone: string;
  name: string;
  address: string;
  landmark: string;
  orders: number;
  total_spent: number;
  last_order_at: string;
}

function exportCsv(rows: Customer[]) {
  const cell = (v: string | number) => {
    const s = String(v);
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const lines = [
    'name,phone,address,landmark,orders,total_spent,last_order',
    ...rows.map((c) => [c.name, c.phone, c.address, c.landmark, c.orders, c.total_spent, c.last_order_at].map(cell).join(',')),
  ];
  const url = URL.createObjectURL(new Blob([`\uFEFF${lines.join('\r\n')}\r\n`], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `order-kaaro-customers-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function CustomersPage() {
  usePageTitle('Customers · Admin');
  const toast = useToast();
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<Customer[] | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      const { data, error } = await db().rpc('admin_customers', { p_search: q.trim() || undefined });
      if (error) toast('error', errorText(error));
      else setRows(data);
    }, 300);
    return () => clearTimeout(t);
  }, [q, toast]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-[26px]">Customers</h1>
        <button type="button" className="btn-quiet" disabled={!rows?.length} onClick={() => rows && exportCsv(rows)}><Download className="h-4 w-4" aria-hidden="true" /> Export CSV</button>
      </div>
      <p className="mt-1 text-sm text-stone">Everyone who has ordered, grouped by phone number. Spend leaves out cancelled orders.</p>
      <label className="relative mt-3 block">
        <span className="sr-only">Search customers</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone" aria-hidden="true" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or phone" className="field pl-10" />
      </label>

      {!rows ? <Spinner label="Loading customers…" /> : rows.length === 0 ? (
        <div className="card mt-4 flex flex-col items-center gap-2 p-8 text-center text-stone">
          <Users className="h-8 w-8" aria-hidden="true" />
          <p>{q ? 'No customers match.' : 'No customers yet.'}</p>
        </div>
      ) : (
        <>
          <p className="mt-3 text-sm text-stone" aria-live="polite">{rows.length} customers</p>
          <ul className="mt-2 space-y-2">
            {rows.map((c) => (
              <li key={c.phone} className="card p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{c.name}</p>
                    <p className="tabular-nums text-sm">{c.phone}</p>
                    <p className="truncate text-sm text-stone">{c.address}{c.landmark ? ` · ${c.landmark}` : ''}</p>
                  </div>
                  <div className="flex-none text-right text-sm">
                    <p className="font-semibold tabular-nums">{formatRupees(c.total_spent)}</p>
                    <p className="text-stone">{c.orders} order{c.orders === 1 ? '' : 's'}</p>
                    <p className="text-xs text-stone">Last: {formatWhen(c.last_order_at)}</p>
                  </div>
                </div>
                <div className="mt-2 flex justify-end gap-1">
                  <a href={`tel:+91${c.phone}`} className="btn-quiet min-h-[40px] px-3 text-sm"><Phone className="h-4 w-4" aria-hidden="true" /> Call</a>
                  <Link to={`/admin/orders?status=all&range=all&q=${c.phone}`} className="btn-quiet min-h-[40px] px-3 text-sm"><Receipt className="h-4 w-4" aria-hidden="true" /> Orders</Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
