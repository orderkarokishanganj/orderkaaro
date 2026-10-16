// Loads .env (if present) and returns Supabase settings for the live or test project.
export function loadEnv() {
  try {
    process.loadEnvFile('.env');
  } catch {
    // No .env file: rely on variables already set in the shell or CI.
  }
}

/** @param {{ test?: boolean, needServiceKey?: boolean }} options */
export function supabaseEnv({ test = false, needServiceKey = false } = {}) {
  loadEnv();
  const prefix = test ? 'TEST_' : '';
  const url = process.env[`${prefix}SUPABASE_URL`] || (test ? undefined : process.env.VITE_SUPABASE_URL);
  const anonKey = process.env[`${prefix}SUPABASE_ANON_KEY`] || (test ? undefined : process.env.VITE_SUPABASE_ANON_KEY);
  const serviceKey = process.env[`${prefix}SUPABASE_SERVICE_ROLE_KEY`];
  const missing = [];
  if (!url) missing.push(`${prefix}SUPABASE_URL`);
  if (needServiceKey && !serviceKey) missing.push(`${prefix}SUPABASE_SERVICE_ROLE_KEY`);
  if (!needServiceKey && !anonKey) missing.push(`${prefix}SUPABASE_ANON_KEY`);
  if (missing.length) {
    console.error(`Missing ${missing.join(', ')}. Add them to .env (see .env.example).`);
    process.exit(1);
  }
  return { url: url.replace(/\/+$/, ''), anonKey, serviceKey };
}
