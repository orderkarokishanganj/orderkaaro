import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Loader2, MessageCircle, Minus, Pencil, Phone, Plus, Printer, Search, Trash2, XCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { formatRupees } from '../lib/pricing';
import { whatsappUrl } from '../lib/whatsapp';
import { usePageTitle } from '../ui/usePageTitle';
import { db, errorText, fetchProducts, type AdminProduct } from './data';
import { useOrderAlerts } from './OrderAlerts';
import { formatWhen, NEXT, NEXT_LABEL, STATUS, type OrderStatus } from './orderStatus';
import { StatusBadge } from './StatusBadge';
import { ConfirmDialog, Spinner, useToast } from './ui';

interface Item {
  id: string;
  variant_id: string | null;
  name_en: string;
  name_hi: string;
  unit_en: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  address: string;
  landmark: string;
  pincode: string;
  notes: string;
  lang: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  created_at: string;
  order_items: Item[];
  order_status_history: Array<{ id: number; from_status: OrderStatus | null; to_status: OrderStatus; note: string; changed_at: string }>;
}

interface EditLine {
  key: string;
  line_id?: string;
  variant_id?: string;
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

/** A friendly message to the customer, in the language they ordered in. */
function customerMessage(o: Order): string {
  const hi = o.lang === 'hi';
  const total = formatRupees(o.total);
  switch (o.status) {
    case 'out_for_delivery':
      return hi ? `नमस्ते ${o.customer_name}, आपका ऑर्डर ${o.order_number} रास्ते में है।` : `Namaste ${o.customer_name}, your Order Kaaro order ${o.order_number} is on the way.`;
    case 'delivered':
      return hi
        ? `ऑर्डर कारो से ऑर्डर करने के लिए धन्यवाद! पसंद आया हो तो यहाँ रिव्यू दें: ${window.location.origin}/review`
        : `Thank you for ordering from Order Kaaro! If you liked it, please leave a review: ${window.location.origin}/review`;
    case 'cancelled':
      return hi ? `नमस्ते ${o.customer_name}, आपका ऑर्डर ${o.order_number} रद्द कर दिया गया है।` : `Namaste ${o.customer_name}, your Order Kaaro order ${o.order_number} has been cancelled.`;
    default:
      return hi
        ? `नमस्ते ${o.customer_name}, आपका ऑर्डर कारो ऑर्डर ${o.order_number} पक्का हो गया है। कुल ${total}। डिलीवरी पर कैश या UPI से भुगतान करें।`
        : `Namaste ${o.customer_name}, your Order Kaaro order ${o.order_number} is confirmed. Total ${total}. Please pay cash or UPI on delivery.`;
  }
}

export default function OrderDetailPage() {
  const { id = '' } = useParams();
  const toast = useToast();
  const { version } = useOrderAlerts();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [editing, setEditing] = useState<EditLine[] | null>(null);
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [pick, setPick] = useState('');
  usePageTitle(order ? `${order.order_number} · Admin` : 'Order · Admin');

  const load = useCallback(async () => {
    const { data, error: e } = await db().from('orders')
      .select(`id, order_number, status, customer_name, customer_phone, address, landmark, pincode, notes, lang, subtotal, delivery_fee, discount, total, coupon_code, created_at,
        order_items (id, variant_id, name_en, name_hi, unit_en, unit_price, quantity, line_total, created_at),
        order_status_history (id, from_status, to_status, note, changed_at)`)
      .eq('id', id).maybeSingle();
    if (e) return setError(errorText(e));
    if (!data) return setError('This order does not exist.');
    const o = data as unknown as Order;
    o.order_items.sort((a, b) => a.created_at.localeCompare(b.created_at));
    o.order_status_history.sort((a, b) => a.id - b.id);
    setOrder(o);
    setError(null);
  }, [id]);
  useEffect(() => {
    if (!editing) load();
    // Reload when orders change elsewhere, but never over unsaved item edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, version]);

  if (error) {
    return (
      <div className="card p-6 text-center">
        <p className="font-semibold text-clay">{error}</p>
        <Link to="/admin/orders" className="btn-primary mt-3">Back to orders</Link>
      </div>
    );
  }
  if (!order) return <Spinner label="Loading order…" />;

  const setStatus = async (next: OrderStatus, noteText = note) => {
    setBusy(true);
    const { error: e } = await db().rpc('admin_set_order_status', { p_order_id: order.id, p_status: next, p_note: noteText.trim() });
    setBusy(false);
    if (e) return toast('error', e.message === 'INVALID_STATUS_CHANGE' ? 'That status change is not allowed for this order.' : errorText(e));
    toast('success', `${order.order_number}: ${STATUS[next].label}.`);
    setNote('');
    setCancelOpen(false);
    load();
  };

  const startEdit = async () => {
    setEditing(order.order_items.map((i) => ({ key: i.id, line_id: i.id, name: i.name_en, unit: i.unit_en, price: i.unit_price, quantity: i.quantity })));
    if (!products) fetchProducts().then(setProducts).catch((e) => toast('error', errorText(e)));
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!editing.length) return toast('error', 'An order needs at least one item. Cancel the order instead.');
    setBusy(true);
    const { error: e } = await db().rpc('admin_update_order_items', {
      p_order_id: order.id,
      p_items: editing.map((l) => (l.line_id ? { line_id: l.line_id, quantity: l.quantity } : { variant_id: l.variant_id, quantity: l.quantity })),
    });
    setBusy(false);
    if (e) return toast('error', e.message === 'ORDER_LOCKED' ? 'Only new or confirmed orders can be changed.' : errorText(e));
    toast('success', 'Order items updated. Totals recalculated.');
    setEditing(null);
    load();
  };

  const next = NEXT[order.status];
  const canEdit = order.status === 'new' || order.status === 'confirmed';
  const term = pick.trim().toLowerCase();
  const matches = term && products
    ? products.filter((p) => p.name_en.toLowerCase().includes(term) || p.name_hi.includes(pick.trim())).slice(0, 6)
    : [];
  const editTotal = editing?.reduce((s, l) => s + l.price * l.quantity, 0) ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-8">
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/admin/orders" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white" aria-label="Back to orders"><ArrowLeft className="h-5 w-5" aria-hidden="true" /></Link>
        <h1 className="text-[26px]">{order.order_number}</h1>
        <StatusBadge status={order.status} />
        <span className="text-sm text-stone">{formatWhen(order.created_at)}</span>
      </div>

      {(next || order.status !== 'delivered' && order.status !== 'cancelled') && (
        <section className="card space-y-3 p-4" aria-label="Update status">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Note with the status change (optional)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="e.g. Customer asked for delivery after 6 PM" className="field" />
          </label>
          <div className="flex flex-wrap gap-2">
            {next && (
              <button type="button" disabled={busy} onClick={() => setStatus(next)} className="btn-primary flex-1 text-lg sm:flex-none">
                {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} {NEXT_LABEL[next]}
              </button>
            )}
            {order.status === 'new' && (
              <button type="button" disabled={busy} onClick={() => setStatus('out_for_delivery')} className="btn-outline">Skip to out for delivery</button>
            )}
            <button type="button" disabled={busy} onClick={() => setCancelOpen(true)} className="btn text-danger-ink hover:bg-danger-bg">
              <XCircle className="h-5 w-5" aria-hidden="true" /> Cancel order
            </button>
          </div>
        </section>
      )}

      <section className="card p-4" aria-labelledby="customer-title">
        <h2 id="customer-title" className="text-lg">Customer</h2>
        <p className="mt-1 text-lg font-semibold">{order.customer_name}</p>
        <p className="tabular-nums">{order.customer_phone}</p>
        <p className="mt-2 whitespace-pre-line">{order.address}</p>
        {order.landmark && <p className="text-stone">Landmark: {order.landmark}</p>}
        {order.pincode && <p className="text-stone">Pincode: {order.pincode}</p>}
        {order.notes && <p className="mt-2 rounded-2xl bg-peach p-3 text-clay">Note: {order.notes}</p>}
        <p className="mt-2 text-xs text-stone">Ordered in {order.lang === 'hi' ? 'Hindi' : 'English'}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={`tel:+91${order.customer_phone}`} className="btn-primary"><Phone className="h-5 w-5" aria-hidden="true" /> Call</a>
          <a href={whatsappUrl(`91${order.customer_phone}`, customerMessage(order))} target="_blank" rel="noreferrer" className="btn-outline">
            <MessageCircle className="h-5 w-5" aria-hidden="true" /> WhatsApp customer
          </a>
        </div>
      </section>

      <section className="card p-4" aria-labelledby="items-title">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="items-title" className="text-lg">Items</h2>
          <div className="flex gap-2">
            <Link to={`/admin/orders/${order.id}/slip`} className="btn-quiet min-h-[40px] px-3 text-sm"><Printer className="h-4 w-4" aria-hidden="true" /> Packing slip</Link>
            {canEdit && !editing && <button type="button" onClick={startEdit} className="btn-quiet min-h-[40px] px-3 text-sm"><Pencil className="h-4 w-4" aria-hidden="true" /> Edit items</button>}
          </div>
        </div>

        {!editing ? (
          <>
            <ul className="mt-2 divide-y divide-line">
              {order.order_items.map((i) => (
                <li key={i.id} className="flex justify-between gap-3 py-2">
                  <span>{i.name_en} · {i.unit_en}<span className="block text-xs text-stone">{i.name_hi} · {formatRupees(i.unit_price)} each</span></span>
                  <span className="flex-none text-right tabular-nums">× {i.quantity}<span className="block font-semibold">{formatRupees(i.line_total)}</span></span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-1 border-t border-line pt-2 tabular-nums">
              <div className="flex justify-between"><dt>Items</dt><dd>{formatRupees(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Delivery</dt><dd>{order.delivery_fee === 0 ? 'Free' : formatRupees(order.delivery_fee)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between"><dt>Coupon {order.coupon_code}</dt><dd>−{formatRupees(order.discount)}</dd></div>}
              <div className="flex justify-between text-lg font-semibold"><dt>Total to collect</dt><dd>{formatRupees(order.total)}</dd></div>
            </dl>
            <p className="mt-1 text-sm text-stone">Cash or UPI on delivery.</p>
          </>
        ) : (
          <div className="mt-2 space-y-3">
            <p className="text-sm text-stone">Existing items keep the price they were ordered at; added items use today’s price. Delivery fee and coupon are recalculated when you save.</p>
            <ul className="divide-y divide-line">
              {editing.map((l) => (
                <li key={l.key} className="flex items-center justify-between gap-2 py-2">
                  <span className="min-w-0">{l.name} · {l.unit}<span className="block text-xs text-stone">{formatRupees(l.price)} each{l.line_id ? '' : ' · new'}</span></span>
                  <span className="flex flex-none items-center gap-1">
                    <button type="button" aria-label={`One less ${l.name}`} disabled={l.quantity <= 1} onClick={() => setEditing(editing.map((x) => x.key === l.key ? { ...x, quantity: x.quantity - 1 } : x))} className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-mist text-sage disabled:opacity-40"><Minus className="h-4 w-4" aria-hidden="true" /></button>
                    <span className="w-8 text-center font-semibold tabular-nums">{l.quantity}</span>
                    <button type="button" aria-label={`One more ${l.name}`} onClick={() => setEditing(editing.map((x) => x.key === l.key ? { ...x, quantity: Math.min(999, x.quantity + 1) } : x))} className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-mist text-sage"><Plus className="h-4 w-4" aria-hidden="true" /></button>
                    <button type="button" aria-label={`Remove ${l.name}`} onClick={() => setEditing(editing.filter((x) => x.key !== l.key))} className="flex h-10 w-10 items-center justify-center rounded-full text-danger-ink hover:bg-danger-bg"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                  </span>
                </li>
              ))}
            </ul>
            <div>
              <label className="relative block">
                <span className="mb-1 block text-sm font-semibold">Add a product</span>
                <Search className="pointer-events-none absolute bottom-3.5 left-3 h-5 w-5 text-stone" aria-hidden="true" />
                <input value={pick} onChange={(e) => setPick(e.target.value)} placeholder={products ? 'Search products' : 'Loading products…'} disabled={!products} className="field pl-10" />
              </label>
              {matches.length > 0 && (
                <ul className="mt-1 divide-y divide-line rounded-2xl border border-line bg-white">
                  {matches.flatMap((p) => p.product_variants.map((v) => (
                    <li key={v.id}>
                      <button type="button" className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-oat"
                        onClick={() => {
                          const existing = editing.find((x) => x.variant_id === v.id);
                          setEditing(existing
                            ? editing.map((x) => (x === existing ? { ...x, quantity: x.quantity + 1 } : x))
                            : [...editing, { key: `new-${v.id}`, variant_id: v.id, name: p.name_en, unit: v.unit_en, price: v.price, quantity: 1 }]);
                          setPick('');
                        }}>
                        <span>{p.name_en} · {v.unit_en}{!v.in_stock && <span className="ml-1 text-xs text-clay">(out of stock)</span>}</span>
                        <span className="font-semibold">{formatRupees(v.price)}</span>
                      </button>
                    </li>
                  )))}
                </ul>
              )}
            </div>
            <p className="font-semibold">Items total: {formatRupees(editTotal)}</p>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-quiet" onClick={() => setEditing(null)} disabled={busy}>Cancel</button>
              <button type="button" className="btn-primary" onClick={saveEdit} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Save items</button>
            </div>
          </div>
        )}
      </section>

      <section className="card p-4" aria-labelledby="history-title">
        <h2 id="history-title" className="text-lg">History</h2>
        <ol className="mt-2 space-y-2">
          {order.order_status_history.map((h) => (
            <li key={h.id} className="flex gap-3">
              <span className="mt-1.5 h-2.5 w-2.5 flex-none rounded-full bg-sage" aria-hidden="true" />
              <span>
                <span className="font-semibold">{h.from_status ? STATUS[h.to_status].label : 'Order placed'}</span>
                <span className="text-sm text-stone"> · {formatWhen(h.changed_at)}</span>
                {h.note && <span className="block text-sm">“{h.note}”</span>}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <ConfirmDialog
        open={cancelOpen}
        title={`Cancel ${order.order_number}?`}
        text="The customer is not told automatically. Use “WhatsApp customer” afterwards to let them know. Counted stock goes back."
        confirmLabel="Cancel order"
        danger
        busy={busy}
        onConfirm={() => setStatus('cancelled')}
        onCancel={() => setCancelOpen(false)}
      >
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-semibold">Reason (optional)</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="e.g. Customer did not answer" className="field" />
        </label>
      </ConfirmDialog>
    </div>
  );
}
