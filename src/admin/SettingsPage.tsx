import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { DAYS, parseHours, type DayKey } from '../lib/hours';
import { formatRupees, freeDeliveryMin, parseTiers } from '../lib/pricing';
import { usePageTitle } from '../ui/usePageTitle';
import { useAdminAuth } from './auth';
import { db, errorText } from './data';
import { AdminField, ConfirmDialog, Spinner, Switch, useToast } from './ui';

const DAY_NAMES: Record<DayKey, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };

interface Form {
  store_open: boolean;
  closed_message_en: string;
  closed_message_hi: string;
  announcement_en: string;
  announcement_hi: string;
  whatsapp: string; // 10 digits; saved as 91XXXXXXXXXX
  min_order_value: string;
  pincodes: string;
  tiers: Array<{ min: string; fee: string }>;
  hours: Record<DayKey, { open: boolean; from: string; to: string }>;
  contact_phone: string;
  alternate_phone: string;
  contact_email: string;
  address: string;
  google_review_url: string;
}

const whole = (v: string) => /^\d+$/.test(v.trim());

function validate(f: Form): Record<string, string> {
  const e: Record<string, string> = {};
  if (!/^[6-9]\d{9}$/.test(f.whatsapp)) e.whatsapp = 'A 10-digit Indian mobile number.';
  if (!whole(f.min_order_value)) e.min_order_value = 'Whole rupees, 0 for no minimum.';
  const pins = f.pincodes.split(',').map((p) => p.trim()).filter(Boolean);
  if (pins.some((p) => !/^[1-9]\d{5}$/.test(p))) e.pincodes = 'Six-digit pincodes separated by commas, or leave empty for no limit.';
  const mins = f.tiers.map((t) => t.min.trim());
  if (f.tiers.some((t) => !whole(t.min) || !whole(t.fee))) e.tiers = 'Every row needs whole rupee amounts.';
  else if (!mins.includes('0')) e.tiers = 'One row must start at ₹0.';
  else if (new Set(mins.map(Number)).size !== mins.length) e.tiers = 'Two rows start at the same amount.';
  for (const d of DAYS) {
    const h = f.hours[d];
    if (h.open && (!h.from || !h.to || h.from >= h.to)) e[`hours-${d}`] = 'Closing time must be after opening time.';
  }
  if (f.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.contact_email)) e.contact_email = 'This does not look like an email address.';
  if (f.google_review_url && !/^https:\/\//.test(f.google_review_url)) e.google_review_url = 'Paste the full link starting with https://';
  return e;
}

export default function SettingsPage() {
  const { state } = useAdminAuth();
  const toast = useToast();
  usePageTitle('Store settings · Admin');
  const isOwner = state.status === 'ready' && state.role === 'owner';
  const [form, setForm] = useState<Form | null>(null);
  const [savedWhatsapp, setSavedWhatsapp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [confirmNumber, setConfirmNumber] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await db().from('settings').select('*').single();
    if (error) return setLoadError(errorText(error));
    const hours = parseHours(data.store_hours);
    const whatsapp = data.whatsapp_number.replace(/^91/, '');
    setSavedWhatsapp(whatsapp);
    setForm({
      store_open: data.store_open,
      closed_message_en: data.closed_message_en,
      closed_message_hi: data.closed_message_hi,
      announcement_en: data.announcement_en,
      announcement_hi: data.announcement_hi,
      whatsapp,
      min_order_value: String(data.min_order_value),
      pincodes: data.delivery_pincodes.join(', '),
      tiers: parseTiers(data.delivery_tiers).sort((a, b) => a.min - b.min).map((t) => ({ min: String(t.min), fee: String(t.fee) })),
      hours: Object.fromEntries(DAYS.map((d) => [d, hours[d] ? { open: true, from: hours[d]!.open, to: hours[d]!.close } : { open: false, from: '09:00', to: '21:00' }])) as Form['hours'],
      contact_phone: data.contact_phone,
      alternate_phone: data.alternate_phone,
      contact_email: data.contact_email,
      address: data.address,
      google_review_url: data.google_review_url,
    });
    setLoadError(null);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (!isOwner) return <p className="card p-6 text-center">Only the owner can change store settings.</p>;
  if (loadError && !form) return <p className="card p-6 text-center font-semibold text-clay">{loadError}</p>;
  if (!form) return <Spinner label="Loading settings…" />;

  const set = (patch: Partial<Form>) => setForm((f) => (f ? { ...f, ...patch } : f));
  const tiersPreview = (() => {
    const tiers = form.tiers.filter((t) => whole(t.min) && whole(t.fee)).map((t) => ({ min: Number(t.min), fee: Number(t.fee) }));
    const free = freeDeliveryMin(tiers);
    return free === null ? 'Delivery is never free with these tiers.' : `The shop will advertise: Free delivery on ${formatRupees(free)}+`;
  })();

  const persist = async () => {
    setConfirmNumber(false);
    setBusy(true);
    const { error } = await db().from('settings').update({
      store_open: form.store_open,
      closed_message_en: form.closed_message_en.trim(),
      closed_message_hi: form.closed_message_hi.trim(),
      announcement_en: form.announcement_en.trim(),
      announcement_hi: form.announcement_hi.trim(),
      whatsapp_number: `91${form.whatsapp}`,
      min_order_value: Number(form.min_order_value),
      delivery_pincodes: form.pincodes.split(',').map((p) => p.trim()).filter(Boolean),
      delivery_tiers: form.tiers.map((t) => ({ min: Number(t.min), fee: Number(t.fee) })).sort((a, b) => a.min - b.min),
      store_hours: Object.fromEntries(DAYS.filter((d) => form.hours[d].open).map((d) => [d, { open: form.hours[d].from, close: form.hours[d].to }])),
      contact_phone: form.contact_phone.trim(),
      alternate_phone: form.alternate_phone.trim(),
      contact_email: form.contact_email.trim(),
      address: form.address.trim(),
      google_review_url: form.google_review_url.trim(),
    }).eq('id', true);
    setBusy(false);
    if (error) return toast('error', errorText(error));
    toast('success', 'Settings saved. The shop updates within a few seconds.');
    load();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return toast('error', 'Please fix the fields marked in red.');
    if (form.whatsapp !== savedWhatsapp) return setConfirmNumber(true);
    persist();
  };

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-3xl space-y-4 pb-28">
      <h1 className="text-[26px]">Store settings</h1>

      <section className={`card space-y-3 p-4 ${form.store_open ? '' : 'border-clay'}`} aria-labelledby="open-title">
        <h2 id="open-title" className="text-lg">Taking orders</h2>
        <Switch checked={form.store_open} onChange={(v) => set({ store_open: v })} label={form.store_open ? 'Open: customers can place orders' : 'Closed: checkout is blocked'} />
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField id="s-closed-en" label="Message while closed (English)">
            <input id="s-closed-en" className="field" maxLength={300} value={form.closed_message_en} onChange={(e) => set({ closed_message_en: e.target.value })} placeholder="Back tomorrow at 9 AM" />
          </AdminField>
          <AdminField id="s-closed-hi" label="Message while closed (Hindi)">
            <input id="s-closed-hi" lang="hi" className="field" maxLength={300} value={form.closed_message_hi} onChange={(e) => set({ closed_message_hi: e.target.value })} placeholder="कल सुबह 9 बजे से" />
          </AdminField>
        </div>
      </section>

      <section className="card space-y-3 p-4" aria-labelledby="fees-title">
        <h2 id="fees-title" className="text-lg">Delivery fees</h2>
        <p className="text-sm text-stone">Each row applies from that items total upwards. A fee of 0 means free delivery.</p>
        <ul className="space-y-2">
          {form.tiers.map((t, i) => (
            <li key={i} className="flex items-end gap-2">
              <AdminField id={`t-min-${i}`} label="Items total from ₹">
                <input id={`t-min-${i}`} className="field w-32" inputMode="numeric" value={t.min} onChange={(e) => set({ tiers: form.tiers.map((x, j) => (j === i ? { ...x, min: e.target.value } : x)) })} />
              </AdminField>
              <AdminField id={`t-fee-${i}`} label="Delivery fee ₹">
                <input id={`t-fee-${i}`} className="field w-28" inputMode="numeric" value={t.fee} onChange={(e) => set({ tiers: form.tiers.map((x, j) => (j === i ? { ...x, fee: e.target.value } : x)) })} />
              </AdminField>
              {form.tiers.length > 1 && (
                <button type="button" onClick={() => set({ tiers: form.tiers.filter((_, j) => j !== i) })} className="mb-0.5 flex h-11 w-11 items-center justify-center rounded-full text-danger-ink hover:bg-danger-bg" aria-label="Remove this row">
                  <Trash2 className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
        {errors.tiers && <p className="text-sm font-semibold text-clay">{errors.tiers}</p>}
        <button type="button" className="btn-quiet" onClick={() => set({ tiers: [...form.tiers, { min: '', fee: '' }] })}><Plus className="h-4 w-4" aria-hidden="true" /> Add row</button>
        <p className="rounded-2xl bg-sage-mist p-3 text-sm font-semibold">{tiersPreview}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField id="s-min" label="Minimum order ₹" hint="0 means no minimum" error={errors.min_order_value}>
            <input id="s-min" className="field" inputMode="numeric" value={form.min_order_value} onChange={(e) => set({ min_order_value: e.target.value })} />
          </AdminField>
          <AdminField id="s-pins" label="Delivery pincodes (optional)" hint="Leave empty to deliver anywhere. If set, customers must enter one of these." error={errors.pincodes}>
            <input id="s-pins" className="field" inputMode="numeric" value={form.pincodes} onChange={(e) => set({ pincodes: e.target.value })} placeholder="855107, 855108" />
          </AdminField>
        </div>
      </section>

      <section className="card space-y-2 p-4" aria-labelledby="hours-title">
        <h2 id="hours-title" className="text-lg">Store hours</h2>
        <p className="text-sm text-stone">Shown in the shop. Use “Taking orders” above to actually stop orders.</p>
        <ul className="divide-y divide-line">
          {DAYS.map((d) => {
            const h = form.hours[d];
            const setDay = (patch: Partial<typeof h>) => set({ hours: { ...form.hours, [d]: { ...h, ...patch } } });
            return (
              <li key={d} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                <span className="w-24 font-semibold">{DAY_NAMES[d]}</span>
                <Switch checked={h.open} onChange={(v) => setDay({ open: v })} label={h.open ? 'Open' : 'Closed'} />
                {h.open && (
                  <span className="flex items-center gap-2">
                    <label><span className="sr-only">{DAY_NAMES[d]} opens</span><input type="time" className="field w-32" value={h.from} onChange={(e) => setDay({ from: e.target.value })} /></label>
                    <span aria-hidden="true">–</span>
                    <label><span className="sr-only">{DAY_NAMES[d]} closes</span><input type="time" className="field w-32" value={h.to} onChange={(e) => setDay({ to: e.target.value })} /></label>
                  </span>
                )}
                {errors[`hours-${d}`] && <p className="w-full text-sm font-semibold text-clay">{errors[`hours-${d}`]}</p>}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card space-y-3 p-4" aria-labelledby="ann-title">
        <h2 id="ann-title" className="text-lg">Announcement banner</h2>
        <p className="text-sm text-stone">Shown at the top of every shop page. Leave empty to hide it.</p>
        <AdminField id="s-ann-en" label="English">
          <input id="s-ann-en" className="field" maxLength={300} value={form.announcement_en} onChange={(e) => set({ announcement_en: e.target.value })} />
        </AdminField>
        <AdminField id="s-ann-hi" label="Hindi">
          <input id="s-ann-hi" lang="hi" className="field" maxLength={300} value={form.announcement_hi} onChange={(e) => set({ announcement_hi: e.target.value })} />
        </AdminField>
      </section>

      <section className="card space-y-3 p-4" aria-labelledby="contact-title">
        <h2 id="contact-title" className="text-lg">Contact details</h2>
        <AdminField id="s-wa" label="WhatsApp number that receives orders" error={errors.whatsapp}>
          <div className="flex items-center gap-2">
            <span className="flex h-[50px] items-center rounded-2xl border border-line bg-sage-plate px-3 text-stone" aria-hidden="true">+91</span>
            <input id="s-wa" className="field" inputMode="numeric" maxLength={10} value={form.whatsapp} onChange={(e) => set({ whatsapp: e.target.value.replace(/\D/g, '') })} />
          </div>
        </AdminField>
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField id="s-phone" label="Phone shown in the shop">
            <input id="s-phone" className="field" maxLength={20} value={form.contact_phone} onChange={(e) => set({ contact_phone: e.target.value })} />
          </AdminField>
          <AdminField id="s-alt" label="Alternate phone (optional)">
            <input id="s-alt" className="field" maxLength={20} value={form.alternate_phone} onChange={(e) => set({ alternate_phone: e.target.value })} />
          </AdminField>
          <AdminField id="s-email" label="Email (optional)" error={errors.contact_email}>
            <input id="s-email" type="email" className="field" maxLength={120} value={form.contact_email} onChange={(e) => set({ contact_email: e.target.value })} />
          </AdminField>
          <AdminField id="s-review" label="Google review link" error={errors.google_review_url}>
            <input id="s-review" className="field" maxLength={300} value={form.google_review_url} onChange={(e) => set({ google_review_url: e.target.value })} />
          </AdminField>
        </div>
        <AdminField id="s-address" label="Shop address (optional)">
          <textarea id="s-address" className="field" rows={2} maxLength={300} value={form.address} onChange={(e) => set({ address: e.target.value })} />
        </AdminField>
      </section>

      <div className="fixed inset-x-0 bottom-[72px] z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-3xl justify-end gap-2">
          <button type="button" className="btn-quiet" onClick={load} disabled={busy}>Undo changes</button>
          <button type="submit" className="btn-primary" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Save settings</button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmNumber}
        title="Change the order WhatsApp number?"
        text={`New orders will go to +91 ${form.whatsapp} instead of +91 ${savedWhatsapp}. Make sure WhatsApp is set up on the new number.`}
        confirmLabel="Change number"
        busy={busy}
        onConfirm={persist}
        onCancel={() => setConfirmNumber(false)}
      />
    </form>
  );
}
