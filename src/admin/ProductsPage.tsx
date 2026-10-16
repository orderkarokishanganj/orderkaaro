import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, Download, Package, Pencil, Plus, Search, Trash2, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatRupees } from '../lib/pricing';
import { productImageUrl } from '../lib/supabase';
import { usePageTitle } from '../ui/usePageTitle';
import { exportProductsCsv } from './csv';
import { db, errorText, fetchCategories, fetchProducts, isAvailable, isLowStock, type AdminCategory, type AdminProduct, type AdminVariant } from './data';
import { removeImages } from './images';
import { ConfirmDialog, Spinner, Switch, useToast } from './ui';

const PAGE_SIZE = 20;
type StockFilter = 'all' | 'in' | 'out' | 'low';
type ShownFilter = 'all' | 'active' | 'hidden';
type Sort = 'order' | 'name' | 'price' | 'updated';

function PriceInput({ variant, onSave }: { variant: AdminVariant; onSave: (price: number) => Promise<void> }) {
  const [value, setValue] = useState(String(variant.price));
  const [busy, setBusy] = useState(false);
  useEffect(() => setValue(String(variant.price)), [variant.price]);
  const commit = async () => {
    const next = Number(value);
    if (!Number.isInteger(next) || next < 0) {
      setValue(String(variant.price));
      return;
    }
    if (next === variant.price) return;
    setBusy(true);
    await onSave(next);
    setBusy(false);
  };
  return (
    <label className="flex items-center gap-1">
      <span className="sr-only">Price for {variant.unit_en}</span>
      <span className="text-stone">₹</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        disabled={busy}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        className="h-11 w-20 rounded-xl border border-line bg-white px-2 text-right font-semibold focus:border-sage focus:outline-none disabled:opacity-60"
      />
    </label>
  );
}

export default function ProductsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  usePageTitle('Products · Admin');
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [stock, setStock] = useState<StockFilter>('all');
  const [shown, setShown] = useState<ShownFilter>('all');
  const [sort, setSort] = useState<Sort>('order');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<AdminProduct | null>(null);
  const [bulkPrice, setBulkPrice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(p);
      setCategories(c);
      setLoadError(null);
    } catch (err) {
      setLoadError(errorText(err));
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const categoryName = useMemo(() => new Map(categories.map((c) => [c.id, c.name_en])), [categories]);

  const filtered = useMemo(() => {
    if (!products) return [];
    const term = q.trim().toLowerCase();
    const list = products.filter((p) => {
      if (term && ![p.name_en, p.name_hi, p.slug, ...p.search_keywords, ...p.product_variants.map((v) => v.legacy_id ?? '')]
        .some((s) => s.toLowerCase().includes(term))) return false;
      if (category !== 'all' && p.category_id !== category) return false;
      if (shown === 'active' && !p.active) return false;
      if (shown === 'hidden' && p.active) return false;
      if (stock === 'in' && !p.product_variants.some(isAvailable)) return false;
      if (stock === 'out' && p.product_variants.some(isAvailable)) return false;
      if (stock === 'low' && !p.product_variants.some(isLowStock)) return false;
      return true;
    });
    const minPrice = (p: AdminProduct) => Math.min(...p.product_variants.map((v) => v.price));
    const sorters: Record<Sort, (a: AdminProduct, b: AdminProduct) => number> = {
      order: (a, b) => a.sort_order - b.sort_order,
      name: (a, b) => a.name_en.localeCompare(b.name_en),
      price: (a, b) => minPrice(a) - minPrice(b),
      updated: (a, b) => b.updated_at.localeCompare(a.updated_at),
    };
    return list.sort(sorters[sort]);
  }, [products, q, category, shown, stock, sort]);

  useEffect(() => setPage(0), [q, category, shown, stock, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  /** Changes the screen immediately, and puts it back if the database says no. */
  const patchVariant = async (productId: string, variantId: string, patch: Partial<AdminVariant>, success: string) => {
    const before = products;
    setProducts((list) => list?.map((p) => p.id !== productId ? p : {
      ...p, product_variants: p.product_variants.map((v) => (v.id === variantId ? { ...v, ...patch } : v)),
    }) ?? null);
    const { error } = await db().from('product_variants').update(patch).eq('id', variantId);
    if (error) {
      setProducts(before);
      toast('error', errorText(error));
    } else toast('success', success);
  };

  const patchProduct = async (productId: string, patch: { active?: boolean }, success: string) => {
    const before = products;
    setProducts((list) => list?.map((p) => (p.id === productId ? { ...p, ...patch } : p)) ?? null);
    const { error } = await db().from('products').update(patch).eq('id', productId);
    if (error) {
      setProducts(before);
      toast('error', errorText(error));
    } else toast('success', success);
  };

  const duplicate = async (p: AdminProduct) => {
    setBusy(true);
    const { data, error } = await db().rpc('admin_save_product', {
      p: {
        slug: '',
        category_id: p.category_id,
        name_en: `${p.name_en} (copy)`,
        name_hi: p.name_hi,
        description_en: p.description_en,
        description_hi: p.description_hi,
        search_keywords: p.search_keywords,
        featured: false,
        active: false,
        variants: p.product_variants.map((v) => ({
          unit_en: v.unit_en, unit_hi: v.unit_hi, price: v.price, mrp: v.mrp, in_stock: v.in_stock, track_stock: v.track_stock,
          stock_qty: v.stock_qty, low_stock_threshold: v.low_stock_threshold, max_per_order: v.max_per_order,
        })),
        images: p.product_images.map((i) => ({ storage_path: i.storage_path, alt_en: i.alt_en, alt_hi: i.alt_hi, is_primary: i.is_primary })),
      },
    });
    setBusy(false);
    if (error) return toast('error', errorText(error));
    toast('success', 'Copy created. It is hidden until you switch it on.');
    navigate(`/admin/products/${(data as { id: string }).id}`);
  };

  const remove = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    const { data, error } = await db().rpc('admin_delete_product', { p_id: confirmDelete.id });
    setBusy(false);
    if (error) return toast('error', errorText(error));
    await removeImages((data as string[]) ?? []);
    toast('success', `${confirmDelete.name_en} deleted.`);
    setConfirmDelete(null);
    setSelected((s) => {
      const next = new Set(s);
      next.delete(confirmDelete.id);
      return next;
    });
    load();
  };

  // ---------------------------------------------------------------------------
  // Bulk actions on the selected products
  // ---------------------------------------------------------------------------
  const ids = [...selected];
  const runBulk = async (action: () => Promise<{ error: unknown }>, success: string) => {
    setBusy(true);
    const { error } = await action();
    setBusy(false);
    if (error) return toast('error', errorText(error));
    toast('success', success);
    setSelected(new Set());
    load();
  };
  const bulkStock = (inStock: boolean) =>
    runBulk(async () => db().from('product_variants').update({ in_stock: inStock }).in('product_id', ids).is('deleted_at', null),
      `${ids.length} products marked ${inStock ? 'in stock' : 'out of stock'}.`);
  const bulkShown = (active: boolean) =>
    runBulk(async () => db().from('products').update({ active }).in('id', ids), `${ids.length} products ${active ? 'shown' : 'hidden'}.`);
  const bulkCategory = (categoryId: string) =>
    runBulk(async () => db().from('products').update({ category_id: categoryId }).in('id', ids),
      `${ids.length} products moved to ${categoryName.get(categoryId)}.`);
  const applyBulkPrice = async () => {
    const percent = Number(bulkPrice);
    const variantIds = (products ?? []).filter((p) => selected.has(p.id)).flatMap((p) => p.product_variants.map((v) => v.id));
    await runBulk(async () => db().rpc('admin_adjust_prices', { p_variant_ids: variantIds, p_percent: percent }),
      `Prices changed by ${percent > 0 ? '+' : ''}${percent}% on ${variantIds.length} sizes.`);
    setBulkPrice(null);
  };

  if (loadError && !products) {
    return (
      <div className="card p-6 text-center">
        <p className="font-semibold text-clay">{loadError}</p>
        <button type="button" onClick={load} className="btn-primary mt-3">Try again</button>
      </div>
    );
  }
  if (!products) return <Spinner label="Loading products…" />;

  const allOnPageSelected = visible.length > 0 && visible.every((p) => selected.has(p.id));

  return (
    <div className={selected.size ? 'pb-40' : ''}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-[26px]">Products <span className="text-lg text-stone">({products.length})</span></h1>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => exportProductsCsv(products, categories)} className="btn-quiet"><Download className="h-4 w-4" aria-hidden="true" /> Export CSV</button>
          <Link to="/admin/products/import" className="btn-quiet"><Upload className="h-4 w-4" aria-hidden="true" /> Import CSV</Link>
          <Link to="/admin/products/new" className="btn-primary"><Plus className="h-5 w-5" aria-hidden="true" /> Add product</Link>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <label className="relative lg:col-span-2">
          <span className="sr-only">Search products</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone" aria-hidden="true" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, Hindi name, old id…" className="field pl-10" />
        </label>
        <label><span className="sr-only">Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="field">
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
          </select>
        </label>
        <label><span className="sr-only">Stock</span>
          <select value={stock} onChange={(e) => setStock(e.target.value as StockFilter)} className="field">
            <option value="all">Any stock</option>
            <option value="in">In stock</option>
            <option value="out">Out of stock</option>
            <option value="low">Low stock</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label><span className="sr-only">Shown or hidden</span>
            <select value={shown} onChange={(e) => setShown(e.target.value as ShownFilter)} className="field">
              <option value="all">Shown + hidden</option>
              <option value="active">Shown</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>
          <label><span className="sr-only">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field">
              <option value="order">Shop order</option>
              <option value="name">Name A–Z</option>
              <option value="price">Price low–high</option>
              <option value="updated">Recently changed</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-stone">
        <label className="inline-flex min-h-[44px] items-center gap-2">
          <input
            type="checkbox"
            className="h-5 w-5 accent-sage"
            checked={allOnPageSelected}
            onChange={(e) => setSelected((s) => {
              const next = new Set(s);
              visible.forEach((p) => (e.target.checked ? next.add(p.id) : next.delete(p.id)));
              return next;
            })}
          />
          Select page
        </label>
        <span aria-live="polite">{filtered.length} shown</span>
      </div>

      {visible.length === 0 ? (
        <div className="card mt-2 flex flex-col items-center gap-2 p-8 text-center text-stone">
          <Package className="h-8 w-8" aria-hidden="true" />
          <p>No products match these filters.</p>
        </div>
      ) : (
        <ul className="mt-1 space-y-3">
          {visible.map((p) => {
            const image = p.product_images.find((i) => i.is_primary) ?? p.product_images[0];
            return (
              <li key={p.id} className={`card p-3 ${p.active ? '' : 'bg-out-bg'}`}>
                <div className="flex gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 flex-none accent-sage"
                    aria-label={`Select ${p.name_en}`}
                    checked={selected.has(p.id)}
                    onChange={(e) => setSelected((s) => {
                      const next = new Set(s);
                      if (e.target.checked) next.add(p.id);
                      else next.delete(p.id);
                      return next;
                    })}
                  />
                  <div className="h-16 w-16 flex-none overflow-hidden rounded-plate bg-sage-plate">
                    {image && <img src={productImageUrl(image.storage_path, 'thumb') ?? ''} alt="" loading="lazy" className="h-full w-full object-contain" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/admin/products/${p.id}`} className="font-semibold hover:underline">{p.name_en}</Link>
                    <p className="text-sm text-stone">{p.name_hi} · {categoryName.get(p.category_id)}</p>
                    <div className="mt-1 flex flex-wrap gap-1 text-xs font-semibold">
                      {!p.active && <span className="rounded-full bg-white px-2 py-0.5 text-out-ink">Hidden</span>}
                      {p.featured && <span className="rounded-full bg-sage-mist px-2 py-0.5 text-sage">Featured</span>}
                    </div>
                  </div>
                  <Switch checked={p.active} label={`Show ${p.name_en} in the shop`} hideLabel
                    onChange={(v) => patchProduct(p.id, { active: v }, `${p.name_en} ${v ? 'shown in' : 'hidden from'} the shop.`)} />
                </div>

                <ul className="mt-2 divide-y divide-line border-t border-line">
                  {p.product_variants.map((v) => (
                    <li key={v.id} className="flex flex-wrap items-center justify-between gap-x-3 py-1">
                      <span className="min-w-[5rem] font-medium">{v.unit_en}</span>
                      <span className="text-sm text-stone">MRP {v.mrp ? formatRupees(v.mrp) : '—'}</span>
                      {v.track_stock && (
                        <span className={`text-sm font-semibold ${isLowStock(v) ? 'text-clay' : (v.stock_qty ?? 0) === 0 ? 'text-out-ink' : 'text-stone'}`}>
                          {v.stock_qty ?? 0} left
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <PriceInput variant={v} onSave={(price) => {
                          if (v.mrp !== null && price > v.mrp) {
                            toast('error', `Price can't be above MRP (${formatRupees(v.mrp)}).`);
                            return Promise.resolve();
                          }
                          return patchVariant(p.id, v.id, { price }, `${p.name_en} ${v.unit_en}: now ${formatRupees(price)}.`);
                        }} />
                        <Switch checked={v.in_stock} label="In stock"
                          onChange={(val) => patchVariant(p.id, v.id, { in_stock: val }, `${p.name_en} ${v.unit_en} marked ${val ? 'in stock' : 'out of stock'}.`)} />
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-1 flex flex-wrap justify-end gap-1">
                  <Link to={`/admin/products/${p.id}`} className="btn-quiet min-h-[40px] px-3 text-sm"><Pencil className="h-4 w-4" aria-hidden="true" /> Edit</Link>
                  <button type="button" disabled={busy} onClick={() => duplicate(p)} className="btn-quiet min-h-[40px] px-3 text-sm"><Copy className="h-4 w-4" aria-hidden="true" /> Duplicate</button>
                  <button type="button" disabled={busy} onClick={() => setConfirmDelete(p)} className="btn min-h-[40px] px-3 text-sm text-danger-ink hover:bg-danger-bg"><Trash2 className="h-4 w-4" aria-hidden="true" /> Delete</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Pages" className="mt-4 flex items-center justify-center gap-3">
          <button type="button" className="btn-quiet" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
          <span className="text-sm">Page {page + 1} of {pages}</span>
          <button type="button" className="btn-quiet" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
        </nav>
      )}

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-[72px] z-40 px-3 md:bottom-4">
          <div className="mx-auto max-w-4xl rounded-panel bg-ink p-3 text-white shadow-float">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold">{selected.size} selected</span>
              <button type="button" onClick={() => setSelected(new Set())} className="underline">Clear</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={busy} onClick={() => bulkStock(true)} className="btn min-h-[40px] bg-white/10 px-3 text-sm hover:bg-white/20">In stock</button>
              <button type="button" disabled={busy} onClick={() => bulkStock(false)} className="btn min-h-[40px] bg-white/10 px-3 text-sm hover:bg-white/20">Out of stock</button>
              <button type="button" disabled={busy} onClick={() => bulkShown(true)} className="btn min-h-[40px] bg-white/10 px-3 text-sm hover:bg-white/20">Show</button>
              <button type="button" disabled={busy} onClick={() => bulkShown(false)} className="btn min-h-[40px] bg-white/10 px-3 text-sm hover:bg-white/20">Hide</button>
              <button type="button" disabled={busy} onClick={() => setBulkPrice('')} className="btn min-h-[40px] bg-white/10 px-3 text-sm hover:bg-white/20">Change price %</button>
              <label className="flex items-center">
                <span className="sr-only">Move to category</span>
                <select
                  disabled={busy}
                  value=""
                  onChange={(e) => e.target.value && bulkCategory(e.target.value)}
                  className="min-h-[40px] rounded-full bg-white/10 px-3 text-sm text-white [&>option]:text-ink"
                >
                  <option value="">Move to…</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                </select>
              </label>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title={`Delete ${confirmDelete?.name_en ?? ''}?`}
        text="It disappears from the shop and this list. Past orders keep their details. Its photos are deleted."
        confirmLabel="Delete product"
        danger
        busy={busy}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        open={bulkPrice !== null}
        title={`Change prices of ${selected.size} products`}
        text="Every size of the selected products changes by this percentage, rounded to whole rupees. Prices can't go above MRP."
        confirmLabel="Change prices"
        busy={busy}
        onConfirm={applyBulkPrice}
        onCancel={() => setBulkPrice(null)}
      >
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-semibold">Change by (%)</span>
          <input type="number" inputMode="decimal" value={bulkPrice ?? ''} onChange={(e) => setBulkPrice(e.target.value)} placeholder="e.g. 5 or -10" className="field max-w-[10rem]" />
        </label>
      </ConfirmDialog>
    </div>
  );
}
