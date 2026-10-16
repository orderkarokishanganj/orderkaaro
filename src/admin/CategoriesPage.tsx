import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowDown, ArrowUp, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { CATEGORY_ICONS } from '../lib/categoryIcons';
import { usePageTitle } from '../ui/usePageTitle';
import { db, errorText, fetchCategories, slugify, type AdminCategory } from './data';
import { AdminField, ConfirmDialog, Spinner, Switch, useToast } from './ui';

interface EditState {
  id?: string;
  name_en: string;
  name_hi: string;
  slug: string;
  icon: string | null;
  slugTouched: boolean;
}

export default function CategoriesPage() {
  const toast = useToast();
  usePageTitle('Categories · Admin');
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [counts, setCounts] = useState<Map<string, number>>(new Map());
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<AdminCategory | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const orderBeforeDrag = useRef<string[]>([]);

  const load = useCallback(async () => {
    try {
      const [cats, products] = await Promise.all([
        fetchCategories(),
        db().from('products').select('category_id').is('deleted_at', null),
      ]);
      if (products.error) throw products.error;
      const map = new Map<string, number>();
      for (const p of products.data) map.set(p.category_id, (map.get(p.category_id) ?? 0) + 1);
      setCategories(cats);
      setCounts(map);
      setLoadError(null);
    } catch (err) {
      setLoadError(errorText(err));
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const saveOrder = async (list: AdminCategory[]) => {
    const { error } = await db().rpc('admin_reorder_categories', { p_ids: list.map((c) => c.id) });
    if (error) {
      toast('error', errorText(error));
      load();
    } else toast('success', 'Order saved. The shop shows categories in this order.');
  };

  const move = (index: number, to: number) => {
    if (!categories || to < 0 || to >= categories.length) return;
    const next = [...categories];
    const [item] = next.splice(index, 1);
    next.splice(to, 0, item);
    setCategories(next);
    saveOrder(next);
  };

  // Drag by the handle (mouse or finger); the list reorders live under the pointer.
  const onHandleDown = (e: PointerEvent<HTMLButtonElement>, id: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    orderBeforeDrag.current = categories?.map((c) => c.id) ?? [];
    setDragId(id);
  };
  const onHandleMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!dragId || !categories || !listRef.current) return;
    const rows = [...listRef.current.children] as HTMLElement[];
    let target = rows.findIndex((row) => e.clientY < row.getBoundingClientRect().top + row.offsetHeight / 2);
    if (target === -1) target = rows.length - 1;
    const from = categories.findIndex((c) => c.id === dragId);
    if (target === from || target === -1) return;
    const next = [...categories];
    const [item] = next.splice(from, 1);
    next.splice(target, 0, item);
    setCategories(next);
  };
  const onHandleUp = () => {
    if (!dragId || !categories) return;
    setDragId(null);
    if (categories.map((c) => c.id).join() !== orderBeforeDrag.current.join()) saveOrder(categories);
  };

  const toggleActive = async (c: AdminCategory, active: boolean) => {
    setCategories((list) => list?.map((x) => (x.id === c.id ? { ...x, active } : x)) ?? null);
    const { error } = await db().from('categories').update({ active }).eq('id', c.id);
    if (error) {
      toast('error', errorText(error));
      load();
    } else toast('success', active ? `${c.name_en} is shown in the shop.` : `${c.name_en} and its products are hidden from the shop.`);
  };

  const saveCategory = async () => {
    if (!editing) return;
    const errors: Record<string, string> = {};
    if (!editing.name_en.trim()) errors.name_en = 'Enter the English name.';
    if (!editing.name_hi.trim()) errors.name_hi = 'Enter the Hindi name.';
    const slug = editing.slug.trim() || slugify(editing.name_en);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) errors.slug = 'Use lowercase letters, numbers and dashes only.';
    setEditErrors(errors);
    if (Object.keys(errors).length) return;

    setBusy(true);
    const values = { name_en: editing.name_en.trim(), name_hi: editing.name_hi.trim(), slug, icon: editing.icon };
    const { error } = editing.id
      ? await db().from('categories').update(values).eq('id', editing.id)
      : await db().from('categories').insert({ ...values, sort_order: ((categories?.length ?? 0) + 1) * 10 });
    setBusy(false);
    if (error) return toast('error', errorText(error));
    toast('success', `${values.name_en} saved.`);
    setEditing(null);
    load();
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    const { error } = await db().rpc('admin_delete_category', { p_id: deleting.id });
    setBusy(false);
    if (error) return toast('error', errorText(error));
    toast('success', `${deleting.name_en} deleted.`);
    setDeleting(null);
    load();
  };

  if (loadError && !categories) {
    return (
      <div className="card p-6 text-center">
        <p className="font-semibold text-clay">{loadError}</p>
        <button type="button" onClick={load} className="btn-primary mt-3">Try again</button>
      </div>
    );
  }
  if (!categories) return <Spinner label="Loading categories…" />;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-[26px]">Categories</h1>
        <button type="button" className="btn-primary" onClick={() => { setEditErrors({}); setEditing({ name_en: '', name_hi: '', slug: '', icon: null, slugTouched: false }); }}>
          <Plus className="h-5 w-5" aria-hidden="true" /> Add category
        </button>
      </div>
      <p className="mt-1 text-sm text-stone">Drag the handle (or use the arrows) to change the order customers see.</p>

      <ul ref={listRef} className="mt-4 space-y-2">
        {categories.map((c, i) => {
          const Icon = c.icon ? CATEGORY_ICONS[c.icon]?.icon : undefined;
          const count = counts.get(c.id) ?? 0;
          return (
            <li key={c.id} className={`card flex flex-col gap-1 p-2 sm:flex-row sm:items-center ${dragId === c.id ? 'shadow-float ring-2 ring-sage' : ''} ${c.active ? '' : 'bg-out-bg'}`}>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <button
                  type="button"
                  onPointerDown={(e) => onHandleDown(e, c.id)}
                  onPointerMove={onHandleMove}
                  onPointerUp={onHandleUp}
                  onPointerCancel={onHandleUp}
                  className="flex h-11 w-9 flex-none cursor-grab touch-none items-center justify-center text-stone active:cursor-grabbing"
                  aria-label={`Drag to reorder ${c.name_en}`}
                >
                  <GripVertical className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sage-mist text-sage" aria-hidden="true">
                  {Icon ? <Icon className="h-5 w-5" /> : <span className="text-sm font-semibold">{c.name_en[0]}</span>}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="break-words font-semibold">{c.name_en}</p>
                  <p className="break-words text-sm text-stone">{c.name_hi} · {count} products{c.active ? '' : ' · hidden'}</p>
                </div>
                <div className="hidden flex-col sm:flex">
                  <button type="button" disabled={i === 0} onClick={() => move(i, i - 1)} className="flex h-6 w-8 items-center justify-center rounded disabled:opacity-30" aria-label={`Move ${c.name_en} up`}><ArrowUp className="h-4 w-4" aria-hidden="true" /></button>
                  <button type="button" disabled={i === categories.length - 1} onClick={() => move(i, i + 1)} className="flex h-6 w-8 items-center justify-center rounded disabled:opacity-30" aria-label={`Move ${c.name_en} down`}><ArrowDown className="h-4 w-4" aria-hidden="true" /></button>
                </div>
              </div>
              {/* On phones the controls get their own line so names stay readable. */}
              <div className="flex items-center justify-end gap-1 border-t border-line pt-1 sm:border-0 sm:pt-0">
                <Switch checked={c.active} onChange={(v) => toggleActive(c, v)} label="Shown" />
                <button type="button" onClick={() => { setEditErrors({}); setEditing({ id: c.id, name_en: c.name_en, name_hi: c.name_hi, slug: c.slug, icon: c.icon, slugTouched: true }); }}
                  className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-oat" aria-label={`Edit ${c.name_en}`}><Pencil className="h-5 w-5" aria-hidden="true" /></button>
                <button type="button" onClick={() => setDeleting(c)} className="flex h-11 w-11 items-center justify-center rounded-full text-danger-ink hover:bg-danger-bg" aria-label={`Delete ${c.name_en}`}>
                  <Trash2 className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={editing !== null}
        title={editing?.id ? 'Edit category' : 'Add category'}
        confirmLabel={editing?.id ? 'Save' : 'Add category'}
        busy={busy}
        onConfirm={saveCategory}
        onCancel={() => setEditing(null)}
      >
        {editing && (
          <div className="mt-3 space-y-3">
            <AdminField id="cat-name-en" label="Name (English)" error={editErrors.name_en}>
              <input id="cat-name-en" className="field" value={editing.name_en} maxLength={80}
                onChange={(e) => { const v = e.target.value; setEditing((ed) => ed && { ...ed, name_en: v, ...(ed.slugTouched ? {} : { slug: slugify(v) }) }); }} />
            </AdminField>
            <AdminField id="cat-name-hi" label="Name (Hindi)" error={editErrors.name_hi}>
              <input id="cat-name-hi" lang="hi" className="field" value={editing.name_hi} maxLength={80} onChange={(e) => { const v = e.target.value; setEditing((ed) => ed && { ...ed, name_hi: v }); }} />
            </AdminField>
            <AdminField id="cat-slug" label="Web address" hint={`…/category/${editing.slug || 'from-the-name'}`} error={editErrors.slug}>
              <input id="cat-slug" className="field" value={editing.slug} maxLength={80}
                onChange={(e) => { const v = e.target.value.toLowerCase().replace(/\s+/g, '-'); setEditing((ed) => ed && { ...ed, slug: v, slugTouched: true }); }} />
            </AdminField>
            <fieldset>
              <legend className="mb-1 text-sm font-semibold">Icon (optional)</legend>
              <div className="grid grid-cols-6 gap-1.5">
                <button type="button" onClick={() => setEditing((ed) => ed && { ...ed, icon: null })} aria-pressed={editing.icon === null}
                  className={`flex h-11 items-center justify-center rounded-xl border text-xs ${editing.icon === null ? 'border-sage bg-sage-mist' : 'border-line'}`}>None</button>
                {Object.entries(CATEGORY_ICONS).map(([key, { icon: Icon, label }]) => (
                  <button key={key} type="button" onClick={() => setEditing((ed) => ed && { ...ed, icon: key })} aria-pressed={editing.icon === key} aria-label={label} title={label}
                    className={`flex h-11 items-center justify-center rounded-xl border ${editing.icon === key ? 'border-sage bg-sage-mist text-sage' : 'border-line text-stone'}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete ${deleting?.name_en ?? ''}?`}
        text={deleting && (counts.get(deleting.id) ?? 0) > 0
          ? `It still has ${counts.get(deleting.id)} products. Move them to another category first (Products → select → Move to…), or hide the category instead.`
          : 'This cannot be undone.'}
        confirmLabel="Delete category"
        danger
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
