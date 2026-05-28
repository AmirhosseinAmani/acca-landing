const APP_VERSION = 'acca-edu-pwa-v1.0.0';
const SHELL_CACHE = `${APP_VERSION}-shell`;
const RUNTIME_CACHE = `${APP_VERSION}-runtime`;

const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/pwa/icon-192.png',
  '/pwa/icon-512.png',
  '/pwa/maskable-icon-512.png',
  '/pwa/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
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
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (url.pathname.startsWith('/data/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isStaticAsset(request, url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function handleNavigation(request) {
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
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await cache.match(request)) || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const cache = await caches.open(RUNTIME_CACHE);

  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || network;
}

function isStaticAsset(request, url) {
  return (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/pwa/') ||
    url.pathname === '/manifest.webmanifest' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    request.destination === 'manifest'
  );
}