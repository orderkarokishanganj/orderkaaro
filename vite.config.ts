import { defineConfig, loadEnv, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { GET as robots } from './api/robots.js';
import { GET as sitemap } from './api/sitemap.js';
import { CATALOG_REQUESTS, publicReadUrl } from './src/data/catalogRequests';
import { en, hi } from './src/i18n/strings';

// Each build gets a version stamp. The app compares it with /version.json to offer a refresh
// when a newer version has been deployed (see src/ui/UpdatePrompt.tsx).
const appVersion = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || new Date().toISOString();

function versionFile(): Plugin {
  return {
    name: 'order-kaaro-version-file',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version: appVersion }) });
    },
  };
}

// Link previews (WhatsApp, Facebook) need a full address for the share image. Vercel provides
// the production domain at build time; VITE_SITE_URL overrides it. Without either, paths stay relative.
const siteUrl = (process.env.VITE_SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')).replace(/\/$/, '');

function siteUrlInHtml(): Plugin {
  return {
    name: 'order-kaaro-site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl),
  };
}

// A plain-HTML first screen inside #root: the header outline and, on the home page, the heading.
// Slow phones show it as soon as the HTML and CSS arrive instead of a blank page while the app
// downloads; React replaces it on start. Text comes from the app's own strings so they never differ.
function appShell(): Plugin {
  const esc = (text: string) => text.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  const both = (key: 'tagline' | 'heroTitle' | 'heroSub') => `data-hi="${esc(hi[key])}">${esc(en[key])}`;
  const shell = `<div id="shell" class="flex min-h-screen flex-col" aria-busy="true">
      <header class="page pt-2">
        <div class="flex h-11 items-center justify-center text-center leading-none">
          <span><span class="block font-display text-[28px] font-semibold tracking-tight">Order Kaaro</span><span class="mt-1 block font-system text-[11px] uppercase tracking-[0.14em] text-stone" ${both('tagline')}</span></span>
        </div>
        <div class="mt-2 h-11"></div>
        <div class="mt-3 h-[52px] rounded-full border border-line bg-white"></div>
      </header>
      <main class="min-h-screen pt-4">
        <section id="shell-home" class="page"><div class="rounded-panel bg-sage-mist px-5 pb-5 pt-6">
          <h1 class="max-w-xl text-[29px] tracking-tight" ${both('heroTitle')}</h1>
          <p class="mt-2 max-w-xl text-ink-soft" ${both('heroSub')}</p>
        </div></section>
      </main>
    </div>
    <script>
      (function () {
        // The admin panel has its own layout; other pages get the header only.
        var path = location.pathname;
        if (path === '/admin' || path.indexOf('/admin/') === 0) return document.getElementById('shell').remove();
        if (path !== '/') document.getElementById('shell-home').remove();
        var lang = null;
        try { lang = JSON.parse(localStorage.getItem('ok_lang')) || localStorage.getItem('orderkaaro_lang'); } catch (e) {}
        if (lang === 'hi') {
          document.documentElement.lang = 'hi';
          document.querySelectorAll('#root [data-hi]').forEach(function (el) { el.textContent = el.getAttribute('data-hi'); });
        }
      })();
    </script>`;
  return {
    name: 'order-kaaro-app-shell',
    transformIndexHtml: (html) => html.replace('<!--app-shell-->', shell),
  };
}

// Starts the catalogue download with the page rather than after the app has loaded and run.
// The addresses must match what src/data/catalog.ts fetches, or the browser downloads twice.
function preloadCatalog(): Plugin {
  return {
    name: 'order-kaaro-preload-catalog',
    transformIndexHtml() {
      const { VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: key } = process.env;
      if (!url || !key) return [];
      return Object.values(CATALOG_REQUESTS).map((path) => ({
        tag: 'link',
        attrs: { rel: 'preload', as: 'fetch', crossorigin: 'anonymous', href: publicReadUrl(url, key, path) },
        injectTo: 'head' as const,
      }));
    },
  };
}

// On Vercel, /robots.txt and /sitemap.xml are functions in api/. This serves the same functions
// from `npm run dev` and `npm run preview` so local checks (Lighthouse, e2e tests) see them too.
function seoFiles(): Plugin {
  const routes: Record<string, (request: Request) => Response | Promise<Response>> = { '/robots.txt': robots, '/sitemap.xml': sitemap };
  const middleware: Connect.NextHandleFunction = async (req, res, next) => {
    const handler = routes[req.url?.split('?')[0] ?? ''];
    if (!handler) return next();
    const response = await handler(new Request(`http://${req.headers.host}${req.url}`));
    res.setHeader('Content-Type', response.headers.get('Content-Type') ?? 'text/plain');
    res.end(await response.text());
  };
  return {
    name: 'order-kaaro-seo-files',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // The sitemap function reads the public Supabase settings from the environment, as on Vercel.
  Object.assign(process.env, { ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env });
  return {
    plugins: [react(), versionFile(), siteUrlInHtml(), appShell(), preloadCatalog(), seoFiles()],
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
    server: {
      middlewareMode: false,
    },
  };
});
