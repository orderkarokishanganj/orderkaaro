import { describe, expect, it } from 'vitest';
import { buildOrderMessage, whatsappUrl, type WhatsAppOrder } from './whatsapp';

const order: WhatsAppOrder = {
  orderNumber: 'OK261016-007',
  lines: [
    { nameEn: 'Aashirvaad Shud Chakki Atta', unitEn: '5 kg', quantity: 3, lineTotal: 750 },
    { nameEn: 'Tata Salt', unitEn: '1 kg', quantity: 1, lineTotal: 30 },
  ],
  subtotal: 780,
  deliveryFee: 20,
  discount: 0,
  total: 800,
  name: 'Ravi Kumar',
  phone: '9876543210',
  address: 'Ward 5, Line Mohalla',
  landmark: 'Near Durga Mandir',
};

describe('buildOrderMessage', () => {
  it('lists the order number, items, totals and delivery details', () => {
    expect(buildOrderMessage(order)).toBe([
      '*New order OK261016-007*',
      'Order Kaaro, Kishanganj',
      '',
      '*Items*',
      '1. Aashirvaad Shud Chakki Atta (5 kg) × 3 = ₹750',
      '2. Tata Salt (1 kg) × 1 = ₹30',
      '',
      'Subtotal: ₹780',
      'Delivery: ₹20',
      '*Total: ₹800*',
      'Payment: Cash or UPI on delivery',
      '',
      '*Deliver to*',
      'Name: Ravi Kumar',
      'Phone: 9876543210',
      'Address: Ward 5, Line Mohalla',
      'Landmark: Near Durga Mandir',
    ].join('\n'));
  });

  it('shows free delivery, coupons and notes', () => {
    const msg = buildOrderMessage({ ...order, deliveryFee: 0, discount: 50, couponCode: 'WELCOME10', total: 730, notes: 'Call before coming' });
    expect(msg).toContain('Delivery: FREE');
    expect(msg).toContain('Coupon WELCOME10: −₹50');
    expect(msg).toContain('*Total: ₹730*');
    expect(msg).toContain('Note: Call before coming');
  });

  it('flags orders that could not be saved', () => {
    expect(buildOrderMessage({ ...order, orderNumber: null })).toMatch(/^\*New order \(not saved online, please confirm prices\)\*/);
  });
});

describe('whatsappUrl', () => {
  it('encodes the message for wa.me', () => {
    expect(whatsappUrl('919942089120', 'Hi & bye\nOK')).toBe('https://wa.me/919942089120?text=Hi%20%26%20bye%0AOK');
    expect(whatsappUrl('+91 99420 89120')).toBe('https://wa.me/919942089120');
  });
});
