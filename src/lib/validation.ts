import { z } from 'zod';

/** "+91 98765-43210", "098765 43210" and "9876543210" all become "9876543210". */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (/^91\d{10}$/.test(digits)) return digits.slice(2);
  if (/^0\d{10}$/.test(digits)) return digits.slice(1);
  return digits;
}

// Same limits as the database constraints in supabase/migrations. Messages are i18n keys.
export const checkoutSchema = z.object({
  name: z.string().trim().min(2, 'errName').max(80, 'errName'),
  phone: z.string().transform(normalizePhone).pipe(z.string().regex(/^[6-9]\d{9}$/, 'errPhone')),
  address: z.string().trim().min(5, 'errAddress').max(300, 'errAddress'),
  landmark: z.string().trim().max(120, 'errLandmark'),
  pincode: z.string().trim().regex(/^(?:[1-9]\d{5})?$/, 'errPincode'),
  notes: z.string().trim().max(300, 'errNotes'),
});

export type CheckoutForm = z.input<typeof checkoutSchema>;
export type CheckoutDetails = z.output<typeof checkoutSchema>;
export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

export function validateCheckout(form: CheckoutForm, requirePincode: boolean):
  { ok: true; data: CheckoutDetails } | { ok: false; errors: CheckoutErrors } {
  const result = checkoutSchema.safeParse(form);
  const errors: CheckoutErrors = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof CheckoutForm;
      errors[field] ??= issue.message;
    }
  }
  if (requirePincode && !form.pincode.trim()) errors.pincode ??= 'errPincodeRequired';
  if (!result.success || Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, data: result.data };
}
