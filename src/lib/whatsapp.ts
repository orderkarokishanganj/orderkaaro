import { formatRupees } from './pricing';

export interface WhatsAppOrderLine {
  nameEn: string;
  unitEn: string;
  quantity: number;
  lineTotal: number;
}

export interface WhatsAppOrder {
  /** Null when the order could not be saved and is being sent on WhatsApp only. */
  orderNumber: string | null;
  lines: WhatsAppOrderLine[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string | null;
  total: number;
  name: string;
  phone: string;
  address: string;
  landmark?: string;
  pincode?: string;
  notes?: string;
}

/**
 * The message the shop receives. Product names are in English so the order is packed from the
 * same names as the catalogue, whatever language the customer browsed in. *text* is bold in WhatsApp.
 */
export function buildOrderMessage(order: WhatsAppOrder): string {
  const out: string[] = [];
  if (order.orderNumber) {
    out.push(`*New order ${order.orderNumber}*`);
  } else {
    out.push('*New order (not saved online, please confirm prices)*');
  }
  out.push('Order Kaaro, Kishanganj', '', '*Items*');
  order.lines.forEach((l, i) => {
    out.push(`${i + 1}. ${l.nameEn} (${l.unitEn}) × ${l.quantity} = ${formatRupees(l.lineTotal)}`);
  });
  out.push('', `Subtotal: ${formatRupees(order.subtotal)}`);
  out.push(`Delivery: ${order.deliveryFee === 0 ? 'FREE' : formatRupees(order.deliveryFee)}`);
  if (order.discount > 0) {
    out.push(`Coupon${order.couponCode ? ` ${order.couponCode}` : ''}: −${formatRupees(order.discount)}`);
  }
  out.push(`*Total: ${formatRupees(order.total)}*`, 'Payment: Cash or UPI on delivery', '', '*Deliver to*');
  out.push(`Name: ${order.name}`, `Phone: ${order.phone}`, `Address: ${order.address}`);
  if (order.landmark) out.push(`Landmark: ${order.landmark}`);
  if (order.pincode) out.push(`Pincode: ${order.pincode}`);
  if (order.notes) out.push(`Note: ${order.notes}`);
  return out.join('\n');
}

/** wa.me link that opens a chat with the shop with the message typed in. */
export function whatsappUrl(number: string, text?: string): string {
  const digits = number.replace(/\D/g, '');
  return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`;
}
