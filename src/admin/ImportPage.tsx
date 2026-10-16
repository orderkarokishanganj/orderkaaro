import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, FileUp, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatRupees } from '../lib/pricing';
import { usePageTitle } from '../ui/usePageTitle';
import { checkImport, exportProductsCsv, type CheckedRow } from './csv';
import { db, errorText, fetchCategories, fetchProducts, type AdminCategory, type AdminProduct } from './data';
import { Spinner, useToast } from './ui';

export default function ImportPage() {
  const toast = useToast();
  const navigate = useNavigate();
  usePageTitle('Import products · Admin');
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<{ headerError: string | null; rows: CheckedRow[] } | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts()])
      .then(([c, p]) => { setCategories(c); setProducts(p); })
      .catch((err) => toast('error', errorText(err)));
  }, [toast]);

  const existing = useMemo(() => {
    const variantIds = new Set(products.flatMap((p) => p.product_variants.map((v) => v.id)));
    const slugUnits = new Set(products.flatMap((p) => p.product_variants.map((v) => `${p.slug}|${v.unit_en.toLowerCase()}`)));
    const slugs = new Set(products.map((p) => p.slug));
    return { variantIds, slugUnits, slugs };
  }, [products]);

  const readFile = async (file: File) => {
    if (!categories) return;
    if (file.size > 5 * 1024 * 1024) return toast('error', 'That file is larger than 5 MB.');
    setFileName(file.name);
    setResult(checkImport(await file.text(), new Set(categories.map((c) => c.slug))));
  };

  const okRows = result?.rows.filter((r) => r.data) ?? [];
  const badRows = result?.rows.filter((r) => r.errors.length) ?? [];
  const actionFor = (r: CheckedRow) => {
    const d = r.data!;
    if ((d.variant_id && existing.variantIds.has(d.variant_id)) || existing.slugUnits.has(`${d.product_slug}|${d.unit_en.toLowerCase()}`)) return 'Update';
    return existing.slugs.has(d.product_slug) ? 'New size' : 'New product';
  };

  const runImport = async () => {
    setImporting(true);
    const { data, error } = await db().rpc('admin_import_products', {
      p_rows: okRows.map((r) => ({ ...r.data!, variant_id: r.data!.variant_id || null })),
    });
    setImporting(false);
    if (error) return toast('error', errorText(error));
    const s = data as { created_products: number; created_variants: number; updated_variants: number };
    const n = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
    toast('success', `Imported: ${n(s.created_products, 'new product', 'new products')}, ${n(s.created_variants, 'new size', 'new sizes')}, ${n(s.updated_variants, 'size updated', 'sizes updated')}.`);
    navigate('/admin/products');
  };

  if (!categories) return <Spinner />;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/admin/products" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white" aria-label="Back to products"><ArrowLeft className="h-5 w-5" aria-hidden="true" /></Link>
        <h1 className="text-[26px]">Import products from CSV</h1>
      </div>

      <section className="card space-y-2 p-4 text-sm text-ink-soft">
        <p><strong className="text-ink">Easiest way:</strong> export your products, change the file in Excel or Google Sheets, save it as CSV, and import it here.</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>One row per size. Rows with a <code>variant_id</code> update that size; leave it empty to add a new product or size.</li>
          <li>Use the category’s web address in <code>category_slug</code>, e.g. <code>pulses-dal</code>.</li>
          <li>Use <code>yes</code> or <code>no</code> for in_stock, track_stock, active and featured. Separate keywords with <code>|</code>.</li>
          <li>Every row is checked first. If any row has a problem, nothing is changed.</li>
        </ul>
        <button type="button" className="btn-quiet" onClick={() => exportProductsCsv(products, categories)}>Download current products as CSV</button>
      </section>

      <label className="card flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed p-6 text-center hover:border-sage">
        <FileUp className="h-8 w-8 text-sage" aria-hidden="true" />
        <span className="font-semibold">{fileName ?? 'Choose a CSV file'}</span>
        <span className="text-sm text-stone">Excel: File → Save As → CSV UTF-8</span>
        <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); e.target.value = ''; }} />
      </label>

      {result?.headerError && (
        <p role="alert" className="flex gap-2 rounded-2xl bg-danger-bg p-4 font-semibold text-danger-ink"><AlertTriangle className="h-5 w-5 flex-none" aria-hidden="true" /> {result.headerError}</p>
      )}

      {result && !result.headerError && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4"><p className="text-sm text-stone">Rows ready</p><p className="font-display text-3xl text-sage">{okRows.length}</p></div>
            <div className="card p-4"><p className="text-sm text-stone">Rows with problems</p><p className={`font-display text-3xl ${badRows.length ? 'text-clay' : ''}`}>{badRows.length}</p></div>
          </div>

          {badRows.length > 0 && (
            <section className="card p-4" aria-labelledby="problems-title">
              <h2 id="problems-title" className="text-lg text-clay">Fix these rows, then choose the file again</h2>
              <ul className="mt-2 max-h-80 divide-y divide-line overflow-y-auto text-sm">
                {badRows.map((r) => (
                  <li key={r.line} className="py-2"><span className="font-semibold">Line {r.line}:</span> {r.errors.join('; ')}</li>
                ))}
              </ul>
            </section>
          )}

          {okRows.length > 0 && (
            <section className="card p-4" aria-labelledby="preview-title">
              <h2 id="preview-title" className="text-lg">Preview</h2>
              <div className="mt-2 max-h-96 overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-white text-stone">
                    <tr><th className="py-1 pr-2">Line</th><th className="pr-2">Product</th><th className="pr-2">Size</th><th className="pr-2 text-right">Price</th><th>Change</th></tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {okRows.slice(0, 200).map((r) => (
                      <tr key={r.line}>
                        <td className="py-1.5 pr-2 text-stone">{r.line}</td>
                        <td className="pr-2">{r.data!.name_en}</td>
                        <td className="pr-2">{r.data!.unit_en}</td>
                        <td className="pr-2 text-right">{formatRupees(r.data!.price)}</td>
                        <td className={actionFor(r) === 'Update' ? 'text-stone' : 'font-semibold text-sage'}>{actionFor(r)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {okRows.length > 200 && <p className="mt-2 text-sm text-stone">…and {okRows.length - 200} more rows.</p>}
              </div>
            </section>
          )}

          <div className="flex justify-end">
            <button type="button" className="btn-primary" disabled={importing || badRows.length > 0 || okRows.length === 0} onClick={runImport}>
              {importing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
              Import {okRows.length} rows
            </button>
          </div>
        </>
      )}
    </div>
  );
}
