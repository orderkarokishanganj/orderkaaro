import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import type { Tables } from '../lib/database.types';
import { formatRupees } from '../lib/pricing';
import { usePageTitle } from '../ui/usePageTitle';
import { useAdminAuth } from './auth';
import { db, errorText } from './data';
import { indiaInputToIso, isoToIndiaInput } from './time';
import { AdminField, ConfirmDialog, Spinner, Switch, useToast } from './ui';

type Coupon = Tables<'coupons'>;

interface Draft {
  id?: string;
  code: string;
  description: string;
  type: 'percent' | 'flat';
  value: string;
  min_order: string;
  max_discount: string;
  starts_at: string;
  expires_at: string;
  usage_limit_total: string;
  usage_limit_per_phone: string;
  active: boolean;
}

const emptyDraft = (): Draft => ({
  code: '', description: '', type: 'percent', value: '', min_order: '0', max_discount: '', starts_at: '', expires_at: '',
  usage_limit_total: '', usage_limit_per_phone: '1', active: true,
});

const whole = (v: string) => /^\d+$/.test(v.trim());

function validate(d: Draft): Record<string, string> {
  const e: Record<string, string> = {};
  if (!/^[A-Z0-9]{3,20}$/.test(d.code)) e.code = '3 to 20 capital letters or numbers, e.g. WELCOME10.';
  if (!whole(d.value) || Number(d.value) <= 0) e.value = 'A whole number above 0.';
  else if (d.type === 'percent' && Number(d.value) > 100) e.value = 'A percentage can’t be over 100.';
  if (!whole(d.min_order)) e.min_order = 'Whole rupees, 0 for no minimum.';
  if (d.max_discount && (!whole(d.max_discount) || Number(d.max_discount) <= 0)) e.max_discount = 'Whole rupees above 0, or leave empty.';
  if (d.usage_limit_total && (!whole(d.usage_limit_total) || Number(d.usage_limit_total) <= 0)) e.usage_limit_total = 'A number above 0, or leave empty.';
  if (d.usage_limit_per_phone && (!whole(d.usage_limit_per_phone) || Number(d.usage_limit_per_phone) <= 0)) e.usage_limit_per_phone = 'A number above 0, or leave empty.';
  if (d.starts_at && d.expires_at && d.starts_at >= d.expires_at) e.expires_at = 'Must be after the start.';
  return e;
}

function summary(c: Coupon): string {
  const off = c.type === 'percent' ? `${c.value}% off${c.max_discount ? ` (up to ${formatRupees(c.max_discount)})` : ''}` : `${formatRupees(c.value)} off`;
  return `${off}${c.min_order ? ` on ${formatRupees(c.min_order)}+` : ''}`;
}

function state(c: Coupon): { label: string; tone: string } {
  const now = Date.now();
  if (!c.active) return { label: 'Off', tone: 'bg-out-bg text-out-ink' };
  if (c.expires_at && new Date(c.expires_at).getTime() <= now) return { label: 'Expired', tone: 'bg-out-bg text-out-ink' };
  if (c.starts_at && new Date(c.starts_at).getTime() > now) return { label: 'Scheduled', tone: 'bg-peach text-clay' };
  return { label: 'Active', tone: 'bg-sage-mist text-sage-dark' };
}

export default function CouponsPage() {
  const { state: auth } = useAdminAuth();
  const toast = useToast();
  usePageTitle('Coupons · Admin');
  const isOwner = auth.status === 'ready' && auth.role === 'owner';
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [stats, setStats] = useState<Map<string, { uses: number; discount_total: number }>>(new Map());
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<Coupon | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [c, s] = await Promise.all([
      db().from('coupons').select('*').order('created_at', { ascending: false }),
      db().rpc('admin_coupon_stats'),
    ]);
    if (c.error || s.error) return setLoadError(errorText(c.error ?? s.error));
    setCoupons(c.data);
    setStats(new Map(s.data.map((r) => [r.coupon_id, { uses: r.uses, discount_total: r.discount_total }])));
    setLoadError(null);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (!isOwner) return <p className="card p-6 text-center">Only the owner can manage coupons.</p>;
  if (loadError && !coupons) return <p className="card p-6 text-center font-semibold text-clay">{loadError}</p>;
  if (!coupons) return <Spinner label="Loading coupons…" />;

  const update = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const save = async () => {
    if (!draft) return;
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length) return;
    const values = {
      code: draft.code,
      description: draft.description.trim(),
      type: draft.type,
      value: Number(draft.value),
      min_order: Number(draft.min_order),
      max_discount: draft.type === 'percent' && draft.max_discount ? Number(draft.max_discount) : null,
      starts_at: indiaInputToIso(draft.starts_at),
      expires_at: indiaInputToIso(draft.expires_at),
      usage_limit_total: draft.usage_limit_total ? Number(draft.usage_limit_total) : null,
      usage_limit_per_phone: draft.usage_limit_per_phone ? Number(draft.usage_limit_per_phone) : null,
      active: draft.active,
    };
    setBusy(true);
    const { error } = draft.id
      ? await db().from('coupons').update(values).eq('id', draft.id)
      : await db().from('coupons').insert(values);
    setBusy(false);
    if (error) return toast('error', /coupons_code_key/.test(error.message) ? 'A coupon with this code already exists.' : errorText(error));
    toast('success', `${values.code} saved.`);
    setDraft(null);
    load();
  };

  const toggle = async (c: Coupon, active: boolean) => {
    setCoupons((list) => list?.map((x) => (x.id === c.id ? { ...x, active } : x)) ?? null);
    const { error } = await db().from('coupons').update({ active }).eq('id', c.id);
    if (error) {
      toast('error', errorText(error));
      load();
    } else toast('success', `${c.code} turned ${active ? 'on' : 'off'}.`);
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    const { error } = await db().from('coupons').delete().eq('id', deleting.id);
    setBusy(false);
    if (error) return toast('error', errorText(error));
    toast('success', `${deleting.code} deleted.`);
    setDeleting(null);
    load();
  };

  const edit = (c: Coupon) => {
    setErrors({});
    setDraft({
      id: c.id, code: c.code, description: c.description, type: c.type, value: String(c.value), min_order: String(c.min_order),
      max_discount: c.max_discount ? String(c.max_discount) : '', starts_at: isoToIndiaInput(c.starts_at), expires_at: isoToIndiaInput(c.expires_at),
      usage_limit_total: c.usage_limit_total ? String(c.usage_limit_total) : '', usage_limit_per_phone: c.usage_limit_per_phone ? String(c.usage_limit_per_phone) : '',
      active: c.active,
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-[26px]">Coupons</h1>
        <button type="button" className="btn-primary" onClick={() => { setErrors({}); setDraft(emptyDraft()); }}><Plus className="h-5 w-5" aria-hidden="true" /> New coupon</button>
      </div>
      <p className="mt-1 text-sm text-stone">Customers type the code at checkout. The discount applies to items, not delivery, and is checked by the database.</p>

      {coupons.length === 0 ? (
        <div className="card mt-4 flex flex-col items-center gap-2 p-8 text-center text-stone">
          <Tag className="h-8 w-8" aria-hidden="true" />
          <p>No coupons yet.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {coupons.map((c) => {
            const st = state(c);
            const use = stats.get(c.id);
            return (
              <li key={c.id} className="card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-lg font-semibold tracking-wide">{c.code}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${st.tone}`}>{st.label}</span>
                    </p>
                    <p className="text-sm">{summary(c)}</p>
                    {c.description && <p className="text-sm text-stone">{c.description}</p>}
                    <p className="mt-1 text-xs text-stone">
                      Used {use?.uses ?? 0}{c.usage_limit_total ? ` of ${c.usage_limit_total}` : ''} times · {formatRupees(use?.discount_total ?? 0)} given
                      {c.usage_limit_per_phone ? ` · ${c.usage_limit_per_phone} per phone` : ''}
                      {c.expires_at ? ` · ends ${new Date(c.expires_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}` : ''}
                    </p>
                  </div>
                  <Switch checked={c.active} onChange={(v) => toggle(c, v)} label={`Turn ${c.code} on`} hideLabel />
                </div>
                <div className="mt-1 flex justify-end gap-1">
                  <button type="button" onClick={() => edit(c)} className="btn-quiet min-h-[40px] px-3 text-sm"><Pencil className="h-4 w-4" aria-hidden="true" /> Edit</button>
                  {(use?.uses ?? 0) === 0 && (
                    <button type="button" onClick={() => setDeleting(c)} className="btn min-h-[40px] px-3 text-sm text-danger-ink hover:bg-danger-bg"><Trash2 className="h-4 w-4" aria-hidden="true" /> Delete</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog open={draft !== null} title={draft?.id ? `Edit ${draft.code}` : 'New coupon'} confirmLabel="Save coupon" busy={busy} onConfirm={save} onCancel={() => setDraft(null)}>
        {draft && (
          <div className="mt-3 grid max-h-[65vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
            <AdminField id="c-code" label="Code" error={errors.code}>
              <input id="c-code" className="field font-mono uppercase" value={draft.code} maxLength={20} onChange={(e) => update({ code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })} />
            </AdminField>
            <AdminField id="c-desc" label="Note for yourself (optional)">
              <input id="c-desc" className="field" value={draft.description} maxLength={200} onChange={(e) => update({ description: e.target.value })} />
            </AdminField>
            <fieldset className="sm:col-span-2">
              <legend className="mb-1 text-sm font-semibold">Discount type</legend>
              <div className="flex gap-2">
                {(['percent', 'flat'] as const).map((t) => (
                  <button key={t} type="button" aria-pressed={draft.type === t} onClick={() => update({ type: t })}
                    className={`btn min-h-[44px] flex-1 border ${draft.type === t ? 'border-sage bg-sage text-white' : 'border-line bg-white'}`}>
                    {t === 'percent' ? '% off' : '₹ off'}
                  </button>
                ))}
              </div>
            </fieldset>
            <AdminField id="c-value" label={draft.type === 'percent' ? 'Percent off' : 'Rupees off'} error={errors.value}>
              <input id="c-value" className="field" inputMode="numeric" value={draft.value} onChange={(e) => update({ value: e.target.value })} />
            </AdminField>
            {draft.type === 'percent' ? (
              <AdminField id="c-max" label="Maximum discount ₹ (optional)" error={errors.max_discount}>
                <input id="c-max" className="field" inputMode="numeric" value={draft.max_discount} onChange={(e) => update({ max_discount: e.target.value })} />
              </AdminField>
            ) : <div className="hidden sm:block" />}
            <AdminField id="c-min" label="Minimum order ₹" hint="Items total, before delivery" error={errors.min_order}>
              <input id="c-min" className="field" inputMode="numeric" value={draft.min_order} onChange={(e) => update({ min_order: e.target.value })} />
            </AdminField>
            <AdminField id="c-total" label="Total uses allowed (optional)" error={errors.usage_limit_total}>
              <input id="c-total" className="field" inputMode="numeric" value={draft.usage_limit_total} onChange={(e) => update({ usage_limit_total: e.target.value })} />
            </AdminField>
            <AdminField id="c-phone" label="Uses per phone number (optional)" error={errors.usage_limit_per_phone}>
              <input id="c-phone" className="field" inputMode="numeric" value={draft.usage_limit_per_phone} onChange={(e) => update({ usage_limit_per_phone: e.target.value })} />
            </AdminField>
            <AdminField id="c-start" label="Starts (optional)" hint="India time">
              <input id="c-start" type="datetime-local" className="field" value={draft.starts_at} onChange={(e) => update({ starts_at: e.target.value })} />
            </AdminField>
            <AdminField id="c-end" label="Ends (optional)" hint="India time" error={errors.expires_at}>
              <input id="c-end" type="datetime-local" className="field" value={draft.expires_at} onChange={(e) => update({ expires_at: e.target.value })} />
            </AdminField>
            <div className="sm:col-span-2"><Switch checked={draft.active} onChange={(v) => update({ active: v })} label="Coupon is on" /></div>
          </div>
        )}
      </ConfirmDialog>

      <ConfirmDialog open={deleting !== null} title={`Delete ${deleting?.code ?? ''}?`} text="It has never been used. To keep its history instead, switch it off." confirmLabel="Delete coupon" danger busy={busy} onConfirm={remove} onCancel={() => setDeleting(null)} />
    </div>
  );
}
