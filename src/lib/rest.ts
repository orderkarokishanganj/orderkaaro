// A few plain requests to Supabase's REST API for the customer site. The full supabase-js client
// (lib/supabase.ts) is much larger and is only loaded for live updates and the admin panel.

import { publicReadUrl } from '../data/catalogRequests';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

/** An error returned by the database (for example "STORE_CLOSED" raised by place_order). */
export class DatabaseError extends Error {
  constructor(message: string, public code: string | null, public details: string | null) {
    super(message);
  }
}

async function send<T>(res: Response): Promise<T> {
  const body = await res.text();
  const json = body ? JSON.parse(body) : null;
  if (!res.ok) {
    // PostgREST errors look like { code, message, details, hint }; anything else is a server problem.
    if (json && typeof json.message === 'string') throw new DatabaseError(json.message, json.code ?? null, json.details ?? null);
    throw new Error(`HTTP ${res.status}`);
  }
  return json as T;
}

/** Rows visible to the public key, e.g. select('categories?select=id,slug&order=sort_order'). */
export async function select<T>(path: string): Promise<T[]> {
  if (!url || !anonKey) throw new Error('Supabase is not configured');
  // No custom headers: keeps this a "simple" request that can use the preload in index.html.
  return send<T[]>(await fetch(publicReadUrl(url, anonKey, path)));
}

/** Calls a database function. */
export async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  if (!url || !anonKey) throw new Error('Supabase is not configured');
  return send<T>(await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  }));
}

/**
 * Public URL of an image in the product-images Storage bucket. Every photo also has a small
 * 320px copy under thumbs/ (made on upload) for product grids on slow connections.
 */
export function productImageUrl(storagePath: string, size: 'thumb' | 'full' = 'full'): string | null {
  if (!url) return null;
  const path = size === 'thumb' ? `thumbs/${storagePath}` : storagePath;
  return `${url}/storage/v1/object/public/product-images/${path}`;
}
