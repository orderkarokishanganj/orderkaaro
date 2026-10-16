import { useEffect, useState } from 'react';
import { ArrowLeft, Printer, Share2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { formatRupees } from '../lib/pricing';
import { buildOrderMessage, whatsappUrl } from '../lib/whatsapp';
import { usePageTitle } from '../ui/usePageTitle';
import { db, errorText } from './data';
import { formatWhen } from './orderStatus';
import { Spinner } from './ui';

interface Slip {
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  landmark: string;
  pincode: string;
  notes: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  order_items: Array<{ name_en: string; name_hi: string; unit_en: string; unit_price: number; quantity: number; line_total: number; created_at: string }>;
}

/** A plain page to print or send to whoever packs and delivers the order. */
export default function PackingSlipPage() {
  const { id = '' } = useParams();
  const [slip, setSlip] = useState<Slip | null>(null);
  const [error, setError] = useState<string | null>(null);
  usePageTitle(slip ? `Slip ${slip.order_number}` : 'Packing slip');

  useEffect(() => {
    db().from('orders')
      .select('order_number, created_at, customer_name, customer_phone, address, landmark, pincode, notes, subtotal, delivery_fee, discount, total, coupon_code, order_items (name_en, name_hi, unit_en, unit_price, quantity, line_total, created_at)')
      .eq('id', id).maybeSingle()
      .then(({ data, error: e }) => {
        if (e) setError(errorText(e));
        else if (!data) setError('This order does not exist.');
        else {
          const s = data as unknown as Slip;
          s.order_items.sort((a, b) => a.created_at.localeCompare(b.created_at));
          setSlip(s);
        }
      });
  }, [id]);

  if (error) return <p className="card p-6 text-center font-semibold text-clay">{error}</p>;
  if (!slip) return <Spinner />;

  const text = buildOrderMessage({
    orderNumber: slip.order_number,
    lines: slip.order_items.map((i) => ({ nameEn: i.name_en, unitEn: i.unit_en, quantity: i.quantity, lineTotal: i.line_total })),
    subtotal: slip.subtotal,
    deliveryFee: slip.delivery_fee,
    discount: slip.discount,
    couponCode: slip.coupon_code,
    total: slip.total,
    name: slip.customer_name,
    phone: slip.customer_phone,
    address: slip.address,
    landmark: slip.landmark,
    pincode: slip.pincode,
    notes: slip.notes,
  });

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Order ${slip.order_number}`, text });
        return;
      } catch {
        // Cancelled or not allowed: fall back to WhatsApp.
      }
    }
    window.open(whatsappUrl('', text), '_blank', 'noopener');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex flex-wrap items-center gap-2 print:hidden">
        <Link to={`/admin/orders/${id}`} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white" aria-label="Back to order"><ArrowLeft className="h-5 w-5" aria-hidden="true" /></Link>
        <button type="button" onClick={() => window.print()} className="btn-primary"><Printer className="h-5 w-5" aria-hidden="true" /> Print</button>
        <button type="button" onClick={share} className="btn-outline"><Share2 className="h-5 w-5" aria-hidden="true" /> Share</button>
      </div>

      <article className="rounded-card border border-line bg-white p-6 text-ink print:rounded-none print:border-0 print:p-0">
        <header className="flex items-start justify-between gap-4 border-b border-ink pb-3">
          <div>
            <p className="font-display text-2xl font-semibold">Order Kaaro</p>
            <p className="text-sm">Kishanganj · Packing slip</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">{slip.order_number}</p>
            <p className="text-sm">{formatWhen(slip.created_at)}</p>
          </div>
        </header>

        <section className="mt-3">
          <p className="text-lg font-semibold">{slip.customer_name} · {slip.customer_phone}</p>
          <p className="whitespace-pre-line">{slip.address}</p>
          {slip.landmark && <p>Landmark: {slip.landmark}</p>}
          {slip.pincode && <p>Pincode: {slip.pincode}</p>}
          {slip.notes && <p className="mt-1 font-semibold">Note: {slip.notes}</p>}
        </section>

        <table className="mt-4 w-full text-left">
          <thead className="border-b border-ink text-sm">
            <tr><th className="w-8 py-1" aria-label="Packed" /><th>Item</th><th className="text-right">Qty</th><th className="text-right">Amount</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {slip.order_items.map((i, n) => (
              <tr key={n}>
                <td className="py-2 align-top"><span className="inline-block h-5 w-5 rounded border-2 border-ink" aria-hidden="true" /></td>
                <td className="py-2">{i.name_en} · {i.unit_en}<span className="block text-sm text-stone">{i.name_hi} · {formatRupees(i.unit_price)} each</span></td>
                <td className="py-2 text-right text-lg font-semibold tabular-nums">{i.quantity}</td>
                <td className="py-2 text-right tabular-nums">{formatRupees(i.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="mt-3 space-y-1 border-t border-ink pt-2 tabular-nums">
          <div className="flex justify-between"><dt>Items</dt><dd>{formatRupees(slip.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd>{slip.delivery_fee === 0 ? 'Free' : formatRupees(slip.delivery_fee)}</dd></div>
          {slip.discount > 0 && <div className="flex justify-between"><dt>Coupon {slip.coupon_code}</dt><dd>−{formatRupees(slip.discount)}</dd></div>}
          <div className="flex justify-between text-xl font-bold"><dt>Collect</dt><dd>{formatRupees(slip.total)}</dd></div>
        </dl>
        <p className="mt-2 text-sm">Payment: cash or UPI on delivery.</p>
      </article>
    </div>
  );
}
