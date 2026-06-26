// ACCA EDU service worker.
//
// IMPORTANT: this is intentionally NETWORK-FIRST for everything. A previous
// version cached the app shell and hashed /assets chunks with a fixed cache
// name and a stale-while-revalidate strategy. After a new deploy that left
// users with a stale index.html / stale chunk references, which made dynamic
// imports fail ("Failed to fetch dynamically imported module") and served the
// old build (e.g. the old map). Network-first guarantees a freshly deployed
// build is always used; the cache is only a best-effort offline fallback.
//
// Bump APP_VERSION on any strategy change so activate() purges old caches.
const APP_VERSION = 'acca-edu-pwa-v1.2.0';
const SHELL_CACHE = `${APP_VERSION}-shell`;
const RUNTIME_CACHE = `${APP_VERSION}-runtime`;

// Static, rarely-changing files that are safe to precache for offline use.
// NOTE: index.html and /assets/* are deliberately NOT precached — they change
// every deploy and must always come from the network.
const APP_SHELL = [
  '/offline.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/maskable-icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // addAll fails atomically if any file 404s; tolerate missing icons.
      .then((cache) => Promise.allSettled(APP_SHELL.map((u) => cache.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: always fetch the freshly-deployed index.html so its chunk
  // references match what is on the server. Fall back to a cached shell / the
  // offline page only when the network is unavailable.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  // Everything else (hashed /assets, data, images, fonts): network-first. A
  // deploy can never be broken by a stale cached chunk. Successful responses
  // are cached purely so the offline fallback has something to serve. Immutable
  // hashed assets are still fast because the browser's own HTTP cache serves
  // them, so network-first here adds no real round-trip on repeat loads.
  event.respondWith(networkFirst(request));
});

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(SHELL_CACHE);
    cache.put('/index.html', response.clone());
    return response;
  } catch {
    return (
      (await caches.match('/index.html')) ||
      (await caches.match('/offline.html')) ||
      Response.error()
    );
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    // Cache only genuinely successful (200, non-opaque) responses for offline.
    if (response && response.ok && response.type === 'basic') {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    // Always return a real Response (even a 4xx/5xx) — never undefined, which
    // is what previously broke dynamic imports.
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || Response.error();
  }
}
