import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_TITLE = 'Order Kaaro | Groceries in Kishanganj on WhatsApp';
const DEFAULT_DESCRIPTION = typeof document === 'undefined'
  ? ''
  : document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
// Personal or admin pages that search engines should not list.
const PRIVATE_PAGES = /^\/(admin|cart|checkout|order|orders|wishlist|search|review)(\/|$)/;

interface PageMeta {
  /** Search result snippet and link preview text. Defaults to the shop description. */
  description?: string;
  /** schema.org data for this page; removed again when the page closes. */
  jsonLd?: object | object[] | null;
  /** Keep this page out of search results (for example "not found" pages). */
  noindex?: boolean;
}

function setTag(selector: string, create: () => HTMLElement, attr: string, value: string | null) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (value === null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/** Sets <meta name|property="…" content="…">; null removes the tag. */
function meta(key: 'name' | 'property', name: string, value: string | null) {
  setTag(`meta[${key}="${name}"]`, () => {
    const el = document.createElement('meta');
    el.setAttribute(key, name);
    return el;
  }, 'content', value);
}

/** Sets the tab title, description, canonical address and link-preview tags for a page. */
export function usePageTitle(title: string | null, { description, jsonLd, noindex = false }: PageMeta = {}) {
  const { pathname } = useLocation();
  const jsonText = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    const fullTitle = title ? `${title} | Order Kaaro` : SITE_TITLE;
    const text = description ?? DEFAULT_DESCRIPTION;
    const hidden = noindex || PRIVATE_PAGES.test(pathname);
    const url = `${window.location.origin}${pathname}`;
    document.title = fullTitle;
    meta('name', 'description', text);
    meta('name', 'robots', hidden ? 'noindex' : null);
    setTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', hidden ? null : url);
    meta('property', 'og:title', fullTitle);
    meta('property', 'og:description', text);
    meta('property', 'og:url', url);
    meta('name', 'twitter:title', fullTitle);
    meta('name', 'twitter:description', text);
  }, [title, description, noindex, pathname]);

  useEffect(() => {
    if (!jsonText) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = jsonText;
    document.head.appendChild(script);
    return () => script.remove();
  }, [jsonText]);
}
