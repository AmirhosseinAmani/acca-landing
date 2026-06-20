const DEFAULT_GTM_ID = 'GTM-MGFQ7ZGX';
const GTM_ID = import.meta.env.VITE_GTM_ID || DEFAULT_GTM_ID;
const GTM_LOAD_DELAY_MS = 6000;

let analyticsLoaded = false;
let loadTimer = 0;

function loadGoogleTagManager() {
  if (analyticsLoaded || typeof window === 'undefined' || !GTM_ID) return;
  analyticsLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'gtm.start': Date.now(),
    event: 'gtm.js',
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
  script.fetchPriority = 'low';
  document.head.appendChild(script);
}

function runWhenIdle(callback) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: 2500 });
    return;
  }

  window.setTimeout(callback, 0);
}

export function initDeferredAnalytics() {
  if (typeof window === 'undefined' || !GTM_ID) return;

  const cleanupIntentListeners = () => {
    window.removeEventListener('pointerdown', loadFromIntent);
    window.removeEventListener('keydown', loadFromIntent);
    window.removeEventListener('touchstart', loadFromIntent);
  };

  const scheduleLoad = () => {
    window.clearTimeout(loadTimer);
    loadTimer = window.setTimeout(() => {
      runWhenIdle(loadGoogleTagManager);
    }, GTM_LOAD_DELAY_MS);
  };

  function loadFromIntent() {
    cleanupIntentListeners();
    window.clearTimeout(loadTimer);
    runWhenIdle(loadGoogleTagManager);
  }

  window.addEventListener('pointerdown', loadFromIntent, { once: true, passive: true });
  window.addEventListener('keydown', loadFromIntent, { once: true });
  window.addEventListener('touchstart', loadFromIntent, { once: true, passive: true });

  if (document.readyState === 'complete') {
    scheduleLoad();
  } else {
    window.addEventListener('load', scheduleLoad, { once: true });
  }
}
