/* ============================================================================
 * Global scroll restoration.
 *
 * The site uses full-page navigation, and its pages render lazily (code-split
 * chunks, Suspense, images, in-view animations). The browser's native
 * scrollRestoration runs once — too early — so "Back" lands at the top instead
 * of where the visitor was. We take it over: save scroll per URL, and on a
 * back/forward (or reload) navigation restore it with a few retries while the
 * page grows. Manual scrolling cancels the restore so we never fight the user.
 * ========================================================================== */

const KEY = 'acca:scrollpos';
const MAX_ENTRIES = 40;

function urlKey() {
  return window.location.pathname + window.location.search; // ignore #hash
}
function readMap() {
  try {
    return JSON.parse(window.sessionStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}
function writeMap(map) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* storage unavailable (private mode) — non-fatal */
  }
}
function savePosition() {
  const map = readMap();
  map[urlKey()] = { y: window.scrollY, t: Date.now() };
  const keys = Object.keys(map);
  if (keys.length > MAX_ENTRIES) {
    keys
      .sort((a, b) => (map[a].t || 0) - (map[b].t || 0))
      .slice(0, keys.length - MAX_ENTRIES)
      .forEach((k) => delete map[k]);
  }
  writeMap(map);
}

export function initScrollRestoration() {
  if (typeof window === 'undefined') return;
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  let pending = 0;
  window.addEventListener(
    'scroll',
    () => {
      if (pending) return;
      pending = window.setTimeout(() => {
        pending = 0;
        savePosition();
      }, 200);
    },
    { passive: true }
  );
  // Use pagehide / visibilitychange (NOT beforeunload) so the browser's
  // back-forward cache keeps working — bfcache makes Back instant.
  window.addEventListener('pagehide', savePosition);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') savePosition();
  });

  // Only restore when the visitor is returning to this page.
  let navType = 'navigate';
  try {
    const entry = performance.getEntriesByType('navigation')[0];
    if (entry?.type) navType = entry.type;
  } catch {
    /* Performance API unavailable */
  }
  if (navType !== 'back_forward' && navType !== 'reload') return;

  const saved = readMap()[urlKey()];
  if (!saved || typeof saved.y !== 'number' || saved.y <= 0) return;

  let cancelled = false;
  const restore = () => {
    if (!cancelled) window.scrollTo(0, saved.y);
  };
  const cancel = () => {
    cancelled = true;
  };

  restore();
  [50, 150, 300, 600, 1000, 1500].forEach((delay) => window.setTimeout(restore, delay));
  // The moment the visitor scrolls themselves, stop restoring.
  window.addEventListener('wheel', cancel, { passive: true, once: true });
  window.addEventListener('touchmove', cancel, { passive: true, once: true });
  window.addEventListener('keydown', cancel, { once: true });
}
