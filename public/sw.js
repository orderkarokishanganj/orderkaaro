// Bump the version whenever caching rules change; old caches are deleted on activate.
const CACHE_NAME = 'orderkaaro-v4';

// Saved on install so the app shell still opens offline. The product list itself is kept by
// the app (localStorage) and refreshed from Supabase whenever there is a connection.
const OFFLINE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Images and Vite's content-hashed bundles never change at the same URL,
// so they can be served from cache. Everything else (HTML, the app shell,
// manifest) must come from the network so customers always get the latest version.
function isCacheFirst(url) {
  return url.pathname.startsWith('/assets/') ||
    /\.(png|jpe?g|webp|gif|svg|ico|woff2?)$/i.test(url.pathname);
}

function putInCache(request, response) {
  if (response.ok && response.type === 'basic') {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  }
  return response;
}

async function networkFirst(request) {
  try {
    return putInCache(request, await fetch(request));
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Offline navigation to a route we never cached: fall back to the app shell.
    if (request.mode === 'navigate') {
      const shell = await caches.match('/');
      if (shell) return shell;
    }
    throw err;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  return putInCache(request, await fetch(request));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // The update check must always ask the server.
  if (url.pathname === '/version.json') return;
  // Leave other sites (fonts, WhatsApp) and video range requests to the browser.
  if (url.origin !== self.location.origin) return;
  if (request.headers.has('range') || url.pathname.endsWith('.mp4')) return;

  event.respondWith(isCacheFirst(url) ? cacheFirst(request) : networkFirst(request));
});
