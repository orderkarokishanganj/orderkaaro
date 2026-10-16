import { describe, expect, it } from 'vitest';
import { normalizePhone, validateCheckout, type CheckoutForm } from './validation';

const form: CheckoutForm = { name: 'Ravi Kumar', phone: '98765 43210', address: 'Ward 5, Line Mohalla', landmark: '', pincode: '', notes: '' };

describe('normalizePhone', () => {
  it.each([
    ['9876543210', '9876543210'],
    ['+91 98765 43210', '9876543210'],
    ['098765-43210', '9876543210'],
    ['12345', '12345'],
  ])('%s -> %s', (input, out) => expect(normalizePhone(input)).toBe(out));
});

describe('validateCheckout', () => {
  it('accepts a valid form and cleans it up', () => {
    expect(validateCheckout({ ...form, name: '  Ravi Kumar ' }, false)).toEqual({
      ok: true,
      data: { name: 'Ravi Kumar', phone: '9876543210', address: 'Ward 5, Line Mohalla', landmark: '', pincode: '', notes: '' },
    });
  });

  it.each([
    [{ phone: '12345' }, 'phone', 'errPhone'],
    [{ phone: '5876543210' }, 'phone', 'errPhone'],
    [{ name: 'R' }, 'name', 'errName'],
    [{ address: 'abc' }, 'address', 'errAddress'],
    [{ pincode: '85510' }, 'pincode', 'errPincode'],
    [{ landmark: 'x'.repeat(121) }, 'landmark', 'errLandmark'],
  ])('rejects %j', (override, field, key) => {
    const result = validateCheckout({ ...form, ...override }, false);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[field as keyof CheckoutForm]).toBe(key);
  });

  it('requires a pincode only when the shop limits delivery areas', () => {
    expect(validateCheckout(form, false).ok).toBe(true);
    const result = validateCheckout(form, true);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.pincode).toBe('errPincodeRequired');
  });
});
