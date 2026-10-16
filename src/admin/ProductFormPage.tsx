import { useEffect, useRef, useState, type DragEvent, type FormEvent } from 'react';
import { ArrowLeft, Camera, ImagePlus, Loader2, Plus, Star, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { discountPercent, formatRupees } from '../lib/pricing';
import { productImageUrl } from '../lib/supabase';
import { usePageTitle } from '../ui/usePageTitle';
import { db, errorText, fetchCategories, slugify, suggestHindiUnit, type AdminCategory } from './data';
import { removeImages, uploadProductImage } from './images';
import { AdminField, ConfirmDialog, Spinner, Switch, useToast } from './ui';

interface VariantDraft {
  key: string;
  id?: string;
  unit_en: string;
  unit_hi: string;
  price: string;
  mrp: string;
  in_stock: boolean;
  track_stock: boolean;
  stock_qty: string;
  low_stock_threshold: string;
  max_per_order: string;
}

interface ImageDraft {
  storage_path: string;
  is_primary: boolean;
  alt_en: string;
  alt_hi: string;
}

interface Draft {
  name_en: string;
  name_hi: string;
  slug: string;
  category_id: string;
  description_en: string;
  description_hi: string;
  keywords: string;
  featured: boolean;
  active: boolean;
  variants: VariantDraft[];
  images: ImageDraft[];
}

type History = Array<{ unit_en: string; old_price: number | null; new_price: number; old_mrp: number | null; new_mrp: number | null; changed_at: string; changed_by_name: string }>;

const newVariant = (): VariantDraft => ({
  key: Math.random().toString(36).slice(2),
  unit_en: '', unit_hi: '', price: '', mrp: '', in_stock: true, track_stock: false, stock_qty: '', low_stock_threshold: '5', max_per_order: '20',
});

const emptyDraft = (): Draft => ({
  name_en: '', name_hi: '', slug: '', category_id: '', description_en: '', description_hi: '', keywords: '',
  featured: false, active: true, variants: [newVariant()], images: [],
});

const isWhole = (v: string) => /^\d+$/.test(v.trim());

/** Same rules as the database, checked before saving so mistakes are shown next to the field. */
function validate(d: Draft): Record<string, string> {
  const e: Record<string, string> = {};
  if (!d.name_en.trim()) e.name_en = 'Enter the English name.';
  if (!d.name_hi.trim()) e.name_hi = 'Enter the Hindi name.';
  if (!d.category_id) e.category_id = 'Choose a category.';
  if (d.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.slug)) e.slug = 'Use lowercase letters, numbers and dashes only.';
  if (!d.variants.length) e.variants = 'Add at least one size.';
  const units = new Set<string>();
  d.variants.forEach((v, i) => {
    const k = (f: string) => `v${i}.${f}`;
    if (!v.unit_en.trim()) e[k('unit_en')] = 'Enter the size, e.g. 1 kg.';
    else if (units.has(v.unit_en.trim().toLowerCase())) e[k('unit_en')] = 'This size is listed twice.';
    units.add(v.unit_en.trim().toLowerCase());
    if (!v.unit_hi.trim()) e[k('unit_hi')] = 'Enter the size in Hindi.';
    if (!isWhole(v.price)) e[k('price')] = 'Whole rupees, e.g. 120.';
    if (v.mrp.trim() && !isWhole(v.mrp)) e[k('mrp')] = 'Whole rupees, or leave empty.';
    else if (v.mrp.trim() && isWhole(v.price) && Number(v.mrp) < Number(v.price)) e[k('mrp')] = 'MRP can’t be less than the price.';
    if (v.track_stock && !isWhole(v.stock_qty)) e[k('stock_qty')] = 'How many are in stock?';
    if (!isWhole(v.max_per_order) || Number(v.max_per_order) < 1 || Number(v.max_per_order) > 999) e[k('max_per_order')] = '1 to 999.';
    if (!isWhole(v.low_stock_threshold)) e[k('low_stock_threshold')] = 'A number, e.g. 5.';
  });
  return e;
}

export default function ProductFormPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  usePageTitle(isNew ? 'Add product · Admin' : 'Edit product · Admin');

  const [draft, setDraft] = useState<Draft | null>(isNew ? emptyDraft() : null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [history, setHistory] = useState<History | null>(null);
  const [leaving, setLeaving] = useState(false);
  const dirty = useRef(false);
  // Photos uploaded while editing; removed from Storage if the form is left without saving.
  const unsavedUploads = useRef<string[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch((err) => setLoadError(errorText(err)));
    if (isNew) return;
    (async () => {
      const { data, error } = await db().from('products')
        .select(`id, slug, category_id, name_en, name_hi, description_en, description_hi, search_keywords, featured, active, deleted_at,
          product_variants (id, unit_en, unit_hi, price, mrp, in_stock, track_stock, stock_qty, low_stock_threshold, max_per_order, sort_order, deleted_at),
          product_images (storage_path, alt_en, alt_hi, is_primary, sort_order)`)
        .eq('id', id).maybeSingle();
      if (error) return setLoadError(errorText(error));
      if (!data || data.deleted_at) return setLoadError('This product does not exist or was deleted.');
      setDraft({
        name_en: data.name_en, name_hi: data.name_hi, slug: data.slug, category_id: data.category_id,
        description_en: data.description_en, description_hi: data.description_hi, keywords: data.search_keywords.join(', '),
        featured: data.featured, active: data.active,
        variants: data.product_variants.filter((v) => !v.deleted_at).sort((a, b) => a.sort_order - b.sort_order).map((v) => ({
          key: v.id, id: v.id, unit_en: v.unit_en, unit_hi: v.unit_hi, price: String(v.price), mrp: v.mrp === null ? '' : String(v.mrp),
          in_stock: v.in_stock, track_stock: v.track_stock, stock_qty: v.stock_qty === null ? '' : String(v.stock_qty),
          low_stock_threshold: String(v.low_stock_threshold), max_per_order: String(v.max_per_order),
        })),
        images: [...data.product_images].sort((a, b) => a.sort_order - b.sort_order)
          .map((i) => ({ storage_path: i.storage_path, is_primary: i.is_primary, alt_en: i.alt_en, alt_hi: i.alt_hi })),
      });
      const h = await db().rpc('admin_price_history', { p_product_id: id });
      if (!h.error) setHistory(h.data);
    })();
  }, [id, isNew]);

  useEffect(() => () => {
    if (unsavedUploads.current.length) removeImages(unsavedUploads.current);
  }, []);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  if (loadError) {
    return (
      <div className="card p-6 text-center">
        <p className="font-semibold text-clay">{loadError}</p>
        <Link to="/admin/products" className="btn-primary mt-3">Back to products</Link>
      </div>
    );
  }
  if (!draft) return <Spinner label="Loading product…" />;

  const set = (patch: Partial<Draft>) => {
    dirty.current = true;
    setDraft((d) => (d ? { ...d, ...patch } : d));
  };
  const setVariant = (key: string, patch: Partial<VariantDraft>) =>
    set({ variants: draft.variants.map((v) => (v.key === key ? { ...v, ...patch } : v)) });

  const addFiles = async (files: FileList | File[]) => {
    const list = [...files].filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    if (!draft.name_en.trim()) {
      setErrors((e) => ({ ...e, name_en: 'Enter the English name before adding photos (it names the photo files).' }));
      return;
    }
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const path = await uploadProductImage(file, draft.name_en);
        unsavedUploads.current.push(path);
        dirty.current = true;
        setDraft((d) => d ? { ...d, images: [...d.images, { storage_path: path, is_primary: d.images.length === 0, alt_en: '', alt_hi: '' }] } : d);
      } catch (err) {
        toast('error', (err as Error).message);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const removeImage = (path: string) => {
    const rest = draft.images.filter((i) => i.storage_path !== path);
    if (rest.length && !rest.some((i) => i.is_primary)) rest[0] = { ...rest[0], is_primary: true };
    set({ images: rest });
    // A photo uploaded in this session and never saved can go straight away.
    if (unsavedUploads.current.includes(path)) {
      unsavedUploads.current = unsavedUploads.current.filter((p) => p !== path);
      removeImages([path]);
    }
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length) {
      toast('error', 'Please fix the fields marked in red.');
      const first = Object.keys(found)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setSaving(true);
    const { data, error } = await db().rpc('admin_save_product', {
      p: {
        id: id ?? null,
        slug: draft.slug.trim(),
        category_id: draft.category_id,
        name_en: draft.name_en.trim(),
        name_hi: draft.name_hi.trim(),
        description_en: draft.description_en.trim(),
        description_hi: draft.description_hi.trim(),
        search_keywords: draft.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        featured: draft.featured,
        active: draft.active,
        variants: draft.variants.map((v) => ({
          id: v.id ?? null,
          unit_en: v.unit_en.trim(),
          unit_hi: v.unit_hi.trim(),
          price: Number(v.price),
          mrp: v.mrp.trim() ? Number(v.mrp) : null,
          in_stock: v.in_stock,
          track_stock: v.track_stock,
          stock_qty: v.track_stock ? Number(v.stock_qty) : null,
          low_stock_threshold: Number(v.low_stock_threshold),
          max_per_order: Number(v.max_per_order),
        })),
        images: draft.images.map((i) => ({ storage_path: i.storage_path, is_primary: i.is_primary, alt_en: i.alt_en, alt_hi: i.alt_hi })),
      },
    });
    setSaving(false);
    if (error) return toast('error', errorText(error));
    const result = data as { id: string; slug: string; removed_paths: string[] };
    unsavedUploads.current = [];
    dirty.current = false;
    await removeImages(result.removed_paths ?? []);
    toast('success', `${draft.name_en.trim()} saved.`);
    navigate('/admin/products');
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const field = (key: string) => ({ id: `f-${key}`, 'aria-invalid': errors[key] ? true : undefined });

  return (
    <form onSubmit={save} noValidate className="mx-auto max-w-3xl space-y-5 pb-28">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => (dirty.current ? setLeaving(true) : navigate('/admin/products'))} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white" aria-label="Back to products">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <h1 className="text-[26px]">{isNew ? 'Add product' : draft.name_en || 'Edit product'}</h1>
      </div>

      <section className="card space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField id="f-name_en" label="Name (English)" error={errors.name_en}>
            <input {...field('name_en')} className="field" value={draft.name_en} maxLength={120}
              onChange={(e) => set({ name_en: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })} />
          </AdminField>
          <AdminField id="f-name_hi" label="Name (Hindi)" error={errors.name_hi}>
            <input {...field('name_hi')} lang="hi" className="field" value={draft.name_hi} maxLength={120} onChange={(e) => set({ name_hi: e.target.value })} />
          </AdminField>
          <AdminField id="f-category_id" label="Category" error={errors.category_id}>
            <select {...field('category_id')} className="field" value={draft.category_id} onChange={(e) => set({ category_id: e.target.value })}>
              <option value="">Choose…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name_en}{c.active ? '' : ' (hidden)'}</option>)}
            </select>
          </AdminField>
          <AdminField id="f-slug" label="Web address" hint={`orderkaaro…/product/${draft.slug || 'filled-in-from-the-name'}`} error={errors.slug}>
            <input {...field('slug')} className="field" value={draft.slug} maxLength={80}
              onChange={(e) => { setSlugTouched(true); set({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }); }} />
          </AdminField>
        </div>
        <AdminField id="f-keywords" label="Search words (optional)" hint="Other names customers type, separated by commas: toor, tuvar, arhar">
          <input id="f-keywords" className="field" value={draft.keywords} onChange={(e) => set({ keywords: e.target.value })} />
        </AdminField>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField id="f-description_en" label="Description, English (optional)">
            <textarea id="f-description_en" className="field" rows={3} maxLength={2000} value={draft.description_en} onChange={(e) => set({ description_en: e.target.value })} />
          </AdminField>
          <AdminField id="f-description_hi" label="Description, Hindi (optional)">
            <textarea id="f-description_hi" lang="hi" className="field" rows={3} maxLength={2000} value={draft.description_hi} onChange={(e) => set({ description_hi: e.target.value })} />
          </AdminField>
        </div>
        <div className="flex flex-wrap gap-x-6">
          <Switch checked={draft.active} onChange={(v) => set({ active: v })} label="Show in shop" />
          <Switch checked={draft.featured} onChange={(v) => set({ featured: v })} label="Featured on home page" />
        </div>
      </section>

      <section className="card space-y-3 p-4" aria-labelledby="sizes-title">
        <div className="flex items-center justify-between">
          <h2 id="sizes-title" className="text-xl">Sizes and prices</h2>
          <button type="button" className="btn-quiet" onClick={() => set({ variants: [...draft.variants, newVariant()] })}><Plus className="h-4 w-4" aria-hidden="true" /> Add size</button>
        </div>
        {errors.variants && <p className="text-sm font-semibold text-clay">{errors.variants}</p>}
        {draft.variants.map((v, i) => {
          const k = (f: string) => `v${i}.${f}`;
          const off = isWhole(v.price) && isWhole(v.mrp) ? discountPercent(Number(v.price), Number(v.mrp)) : null;
          return (
            <fieldset key={v.key} className="rounded-2xl border border-line p-3">
              <legend className="px-1 text-sm font-semibold">Size {i + 1}{v.unit_en ? `: ${v.unit_en}` : ''}</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <AdminField id={`f-${k('unit_en')}`} label="Size (English)" error={errors[k('unit_en')]}>
                  <input {...field(k('unit_en'))} className="field" placeholder="1 kg" value={v.unit_en} maxLength={40}
                    onChange={(e) => setVariant(v.key, { unit_en: e.target.value, ...(v.unit_hi === '' || v.unit_hi === suggestHindiUnit(v.unit_en) ? { unit_hi: suggestHindiUnit(e.target.value) } : {}) })} />
                </AdminField>
                <AdminField id={`f-${k('unit_hi')}`} label="Size (Hindi)" error={errors[k('unit_hi')]}>
                  <input {...field(k('unit_hi'))} lang="hi" className="field" placeholder="1 किलो" value={v.unit_hi} maxLength={40} onChange={(e) => setVariant(v.key, { unit_hi: e.target.value })} />
                </AdminField>
                <AdminField id={`f-${k('price')}`} label="Price ₹" error={errors[k('price')]}>
                  <input {...field(k('price'))} className="field" inputMode="numeric" value={v.price} onChange={(e) => setVariant(v.key, { price: e.target.value })} />
                </AdminField>
                <AdminField id={`f-${k('mrp')}`} label="MRP ₹" hint={off ? `Shows ${off}% off` : 'Optional'} error={errors[k('mrp')]}>
                  <input {...field(k('mrp'))} className="field" inputMode="numeric" value={v.mrp} onChange={(e) => setVariant(v.key, { mrp: e.target.value })} />
                </AdminField>
              </div>
              <div className="mt-2 flex flex-wrap items-end gap-x-6 gap-y-2">
                <Switch checked={v.in_stock} onChange={(val) => setVariant(v.key, { in_stock: val })} label="In stock" />
                <Switch checked={v.track_stock} onChange={(val) => setVariant(v.key, { track_stock: val })} label="Count stock" />
                {v.track_stock && (
                  <>
                    <AdminField id={`f-${k('stock_qty')}`} label="Units in stock" error={errors[k('stock_qty')]}>
                      <input {...field(k('stock_qty'))} className="field w-28" inputMode="numeric" value={v.stock_qty} onChange={(e) => setVariant(v.key, { stock_qty: e.target.value })} />
                    </AdminField>
                    <AdminField id={`f-${k('low_stock_threshold')}`} label="Warn when at or below" error={errors[k('low_stock_threshold')]}>
                      <input {...field(k('low_stock_threshold'))} className="field w-28" inputMode="numeric" value={v.low_stock_threshold} onChange={(e) => setVariant(v.key, { low_stock_threshold: e.target.value })} />
                    </AdminField>
                  </>
                )}
                <AdminField id={`f-${k('max_per_order')}`} label="Max per order" error={errors[k('max_per_order')]}>
                  <input {...field(k('max_per_order'))} className="field w-28" inputMode="numeric" value={v.max_per_order} onChange={(e) => setVariant(v.key, { max_per_order: e.target.value })} />
                </AdminField>
                {draft.variants.length > 1 && (
                  <button type="button" onClick={() => set({ variants: draft.variants.filter((x) => x.key !== v.key) })} className="btn ml-auto min-h-[40px] px-3 text-sm text-danger-ink hover:bg-danger-bg">
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove size
                  </button>
                )}
              </div>
            </fieldset>
          );
        })}
      </section>

      <section className="card space-y-3 p-4" aria-labelledby="photos-title">
        <h2 id="photos-title" className="text-xl">Photos</h2>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-5 text-center ${dragging ? 'border-sage bg-sage-mist' : 'border-line'}`}
        >
          <p className="text-sm text-stone">Drop photos here, take one with the camera, or choose from the phone. They are resized automatically.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <label className="btn-primary cursor-pointer">
              <Camera className="h-5 w-5" aria-hidden="true" /> Take photo
              <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} />
            </label>
            <label className="btn-outline cursor-pointer">
              <ImagePlus className="h-5 w-5" aria-hidden="true" /> Choose photos
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} />
            </label>
          </div>
          {uploading > 0 && <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Uploading {uploading} photo{uploading > 1 ? 's' : ''}…</p>}
        </div>
        {draft.images.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {draft.images.map((img) => (
              <li key={img.storage_path} className={`relative rounded-2xl border-2 p-1 ${img.is_primary ? 'border-sage' : 'border-line'}`}>
                <img src={productImageUrl(img.storage_path, 'thumb') ?? ''} alt="" className="aspect-square w-full rounded-xl bg-sage-plate object-contain" />
                <div className="mt-1 flex justify-between gap-1">
                  <button type="button" onClick={() => set({ images: draft.images.map((x) => ({ ...x, is_primary: x.storage_path === img.storage_path })) })}
                    aria-pressed={img.is_primary} className={`btn min-h-[40px] flex-1 px-2 text-xs ${img.is_primary ? 'bg-sage text-white' : 'bg-sage-mist text-sage'}`}>
                    <Star className="h-4 w-4" aria-hidden="true" /> {img.is_primary ? 'Main' : 'Make main'}
                  </button>
                  <button type="button" onClick={() => removeImage(img.storage_path)} className="flex h-10 w-10 items-center justify-center rounded-full text-danger-ink hover:bg-danger-bg" aria-label="Remove photo">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!isNew && (
        <section className="card p-4" aria-labelledby="history-title">
          <h2 id="history-title" className="text-xl">Price history</h2>
          {!history ? <Spinner /> : history.length === 0 ? <p className="mt-1 text-sm text-stone">No price changes yet.</p> : (
            <ul className="mt-2 divide-y divide-line text-sm">
              {history.map((h, i) => (
                <li key={i} className="flex flex-wrap justify-between gap-2 py-2">
                  <span><span className="font-semibold">{h.unit_en}</span>: {h.old_price === null ? '—' : formatRupees(h.old_price)} → {formatRupees(h.new_price)}
                    {h.old_mrp !== h.new_mrp && ` (MRP ${h.old_mrp === null ? '—' : formatRupees(h.old_mrp)} → ${h.new_mrp === null ? '—' : formatRupees(h.new_mrp)})`}</span>
                  <span className="text-stone">{h.changed_by_name} · {new Date(h.changed_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className="fixed inset-x-0 bottom-[72px] z-30 border-t border-line bg-white/95 px-4 py-3 backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-3xl justify-end gap-2">
          <button type="button" className="btn-quiet" onClick={() => (dirty.current ? setLeaving(true) : navigate('/admin/products'))}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving || uploading > 0}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} {isNew ? 'Add product' : 'Save changes'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={leaving}
        title="Leave without saving?"
        text="Your changes to this product will be lost."
        confirmLabel="Leave"
        danger
        onConfirm={() => { dirty.current = false; navigate('/admin/products'); }}
        onCancel={() => setLeaving(false)}
      />
    </form>
  );
}
