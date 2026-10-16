import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Only the public anon key belongs in the browser. Row level security decides what it can do.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export type Db = SupabaseClient<Database>;

/** Null when the env vars are missing, so the shop can fall back to WhatsApp-only ordering. */
export const supabase: Db | null = url && anonKey ? createClient<Database>(url, anonKey) : null;

/**
 * Public URL of an image in the product-images Storage bucket. Every photo also has a small
 * 320px copy under thumbs/ (made on upload) for product grids on slow connections.
 */
export function productImageUrl(storagePath: string, size: 'thumb' | 'full' = 'full'): string | null {
  if (!url) return null;
  const path = size === 'thumb' ? `thumbs/${storagePath}` : storagePath;
  return `${url}/storage/v1/object/public/product-images/${path}`;
}
