import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { readJson, writeJson } from '../lib/storage';
import { buildIndex, type Searchable } from '../lib/search';
import { supabaseConfigured } from '../lib/rest';
import { migrateLegacyData } from '../store/stores';
import { CATALOG_CACHE_KEY, fetchCatalog, readCachedCatalog, type Catalog, type Category, type Product, type Variant } from './catalog';

interface SearchItem extends Searchable {
  product: Product;
}

export interface CatalogValue {
  status: 'loading' | 'ready' | 'error';
  catalog: Catalog | null;
  /** Showing the copy saved on this phone while fresh data loads (or when offline). */
  fromCache: boolean;
  refresh: () => void;
  categoryById: Map<string, Category>;
  categoryBySlug: Map<string, Category>;
  productBySlug: Map<string, Product>;
  productById: Map<string, Product>;
  variantById: Map<string, { product: Product; variant: Variant }>;
  searchIndex: ReturnType<typeof buildIndex<SearchItem>>;
}

const CatalogContext = createContext<CatalogValue | null>(null);

// Data older than this is fetched again when the customer comes back to the tab.
const REFRESH_AFTER_MS = 2 * 60 * 1000;
// Wait before opening the live connection so it doesn't compete with the first page load.
const LIVE_UPDATES_AFTER_MS = 4000;

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog | null>(() => readCachedCatalog(readJson));
  const [fromCache, setFromCache] = useState(() => catalog !== null);
  const [failed, setFailed] = useState(false);
  const loading = useRef(false);

  const load = useCallback(async () => {
    if (!supabaseConfigured || loading.current) {
      if (!supabaseConfigured) setFailed(true);
      return;
    }
    loading.current = true;
    try {
      const fresh = await fetchCatalog();
      setCatalog(fresh);
      setFromCache(false);
      setFailed(false);
      writeJson(CATALOG_CACHE_KEY, fresh);
      migrateLegacyData(fresh);
    } catch {
      setFailed(true);
    } finally {
      loading.current = false;
    }
  }, []);

  useEffect(() => {
    load();
    if (!supabaseConfigured) return;

    // Price, stock and visibility changes made in the admin panel arrive within seconds. The live
    // connection needs the full Supabase client, so it is downloaded after the page has loaded.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(load, 800);
    };
    let stopLive: (() => void) | undefined;
    let stopped = false;
    const startLive = setTimeout(async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        if (stopped || !supabase) return;
        const db = supabase;
        const channel = db.channel('catalog-changes');
        for (const table of ['categories', 'products', 'product_variants', 'product_images', 'settings']) {
          channel.on('postgres_changes', { event: '*', schema: 'public', table }, schedule);
        }
        channel.subscribe();
        stopLive = () => db.removeChannel(channel);
      } catch {
        // Offline or the download failed: the timed refresh below still keeps prices current.
      }
    }, LIVE_UPDATES_AFTER_MS);

    // Hiding a product sends no event to customers (they can no longer see the row),
    // so also refresh when the tab comes back into view and every few minutes.
    let lastLoad = Date.now();
    const maybeRefresh = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastLoad > REFRESH_AFTER_MS) {
        lastLoad = Date.now();
        load();
      }
    };
    document.addEventListener('visibilitychange', maybeRefresh);
    const interval = setInterval(() => {
      lastLoad = Date.now();
      if (document.visibilityState === 'visible') load();
    }, 5 * 60 * 1000);

    return () => {
      stopped = true;
      clearTimeout(startLive);
      stopLive?.();
      clearTimeout(timer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', maybeRefresh);
    };
  }, [load]);

  const value = useMemo<CatalogValue>(() => {
    const categories = catalog?.categories ?? [];
    const products = catalog?.products ?? [];
    const categoryById = new Map(categories.map((c) => [c.id, c]));
    const variantById = new Map<string, { product: Product; variant: Variant }>();
    for (const product of products) for (const variant of product.variants) variantById.set(variant.id, { product, variant });
    return {
      status: catalog ? 'ready' : failed ? 'error' : 'loading',
      catalog,
      fromCache,
      refresh: load,
      categoryById,
      categoryBySlug: new Map(categories.map((c) => [c.slug, c])),
      productBySlug: new Map(products.map((p) => [p.slug, p])),
      productById: new Map(products.map((p) => [p.id, p])),
      variantById,
      searchIndex: buildIndex<SearchItem>(products
        .filter((p) => categoryById.has(p.categoryId))
        .map((p) => {
          const c = categoryById.get(p.categoryId)!;
          return { id: p.id, nameEn: p.nameEn, nameHi: p.nameHi, keywords: p.keywords, categoryEn: c.nameEn, categoryHi: c.nameHi, sortOrder: p.sortOrder, product: p };
        })),
    };
  }, [catalog, failed, fromCache, load]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

// Provider and hook live together on purpose; this only affects dev hot reload.
// eslint-disable-next-line react-refresh/only-export-components
export function useCatalog(): CatalogValue {
  const value = useContext(CatalogContext);
  if (!value) throw new Error('useCatalog must be used inside CatalogProvider');
  return value;
}
