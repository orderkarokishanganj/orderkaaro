import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// The full client: admin panel and live updates. The customer site's first load uses lib/rest.ts.
// Only the public anon key belongs in the browser. Row level security decides what it can do.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export type Db = SupabaseClient<Database>;

/** Null when the env vars are missing, so the shop can fall back to WhatsApp-only ordering. */
export const supabase: Db | null = url && anonKey ? createClient<Database>(url, anonKey) : null;

// The image URL helper lives with the lightweight REST helpers so the customer site can use it
// without loading this client.
export { productImageUrl } from './rest';
