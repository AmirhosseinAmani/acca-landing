const DEFAULT_GTM_ID = 'GTM-MGFQ7ZGX';
const CONSENT_VERSION = 1;
const CONSENT_STORAGE_KEY = `acca:tracking-consent:v${CONSENT_VERSION}`;
const ATTRIBUTION_STORAGE_KEY = 'acca:tracking-attribution:v1';
const RUNTIME_KEY = '__accaTrackingRuntimeV1';

export const TRACKING_CONSENT_EVENT = 'acca:tracking-consent-change';

const requestedGtmId = String(import.meta.env.VITE_GTM_ID || DEFAULT_GTM_ID).trim();
const requestedMetaPixelId = String(import.meta.env.VITE_META_PIXEL_ID || '').trim();
const GTM_ID = /^GTM-[A-Z0-9]+$/i.test(requestedGtmId) ? requestedGtmId : '';
const META_PIXEL_ID = /^\d{5,25}$/.test(requestedMetaPixelId) ? requestedMetaPixelId : '';

const SAFE_STRING_PARAMS = new Set([
  'content_category',
  'content_id',
  'content_name',
  'content_type',
  'contact_method',
  'cta_location',
  'language',
  'method',
  'page_path',
  'page_type',
  'search_category',
  'source',
]);
const SAFE_NUMBER_PARAMS = new Set(['filter_count', 'result_count', 'value']);
const SAFE_BOOLEAN_PARAMS = new Set(['is_featured']);
const SENSITIVE_PARAM_NAME = /(?:age|email|first.?name|gpa|last.?name|phone|contact.?value|username|user.?data|address|full.?url)/i;
const EMAIL_LIKE_VALUE = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/;
const PHONE_LIKE_VALUE = /(?:^|\D)\+?\d[\d\s().-]{7,}\d(?:$|\D)/;

function createRuntime() {
  return {
    attribution: null,
    consent: null,
    consentStorageUnavailable: false,
    delegatedClickAttached: false,
    googleDefaultQueued: false,
    gtmLoaded: false,
    initialised: false,
    lastGtmPageKey: '',
    lastMetaPageKey: '',
    metaInitialised: false,
    metaConsentGranted: false,
    metaLoaded: false,
    pendingPageParams: null,
    pendingViewContentParams: null,
    reloadScheduled: false,
    seenEventIds: new Set(),
    storageListenerAttached: false,
  };
}

const serverRuntime = createRuntime();

function getRuntime() {
  if (typeof window === 'undefined') return serverRuntime;
  if (!window[RUNTIME_KEY]) window[RUNTIME_KEY] = createRuntime();
  return window[RUNTIME_KEY];
}

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

// GTM understands the same array-like commands produced by the canonical
// gtag() shim. Queueing these commands does not create a network request.
function pushGoogleCommand() {
  ensureDataLayer().push(arguments);
}

function queueGoogleConsentDefault() {
  const runtime = getRuntime();
  if (runtime.googleDefaultQueued || typeof window === 'undefined') return;
  runtime.googleDefaultQueued = true;
  pushGoogleCommand('consent', 'default', {
    ad_personalization: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500,
  });
}

function googleConsentState(consent) {
  return {
    ad_personalization: consent.marketing ? 'granted' : 'denied',
    ad_storage: consent.marketing ? 'granted' : 'denied',
    ad_user_data: consent.marketing ? 'granted' : 'denied',
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    functionality_storage: 'granted',
    personalization_storage: consent.marketing ? 'granted' : 'denied',
    security_storage: 'granted',
  };
}

function loadGoogleTagManager() {
  const runtime = getRuntime();
  if (runtime.gtmLoaded || !GTM_ID || typeof document === 'undefined') return;

  const existingScript = document.querySelector(
    `script[data-acca-gtm], script[src*="googletagmanager.com/gtm.js?id=${GTM_ID}"]`
  );
  if (existingScript) {
    runtime.gtmLoaded = true;
    return;
  }

  runtime.gtmLoaded = true;
  ensureDataLayer().push({
    'gtm.start': Date.now(),
    event: 'gtm.js',
  });

  const script = document.createElement('script');
  script.async = true;
  script.dataset.accaGtm = 'true';
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
  document.head.appendChild(script);
}

function ensureMetaQueue() {
  if (typeof window.fbq === 'function') return window.fbq;

  const fbq = function (...args) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;
  return fbq;
}

function loadMetaPixel() {
  const runtime = getRuntime();
  if (!META_PIXEL_ID || typeof document === 'undefined') return;

  const fbq = ensureMetaQueue();
  if (!runtime.metaInitialised) {
    runtime.metaInitialised = true;
    fbq('init', META_PIXEL_ID);
  }
  if (!runtime.metaConsentGranted) {
    runtime.metaConsentGranted = true;
    fbq('consent', 'grant');
  }

  if (runtime.metaLoaded) return;
  runtime.metaLoaded = true;
  if (document.querySelector('script[data-acca-meta-pixel]')) return;

  const script = document.createElement('script');
  script.async = true;
  script.dataset.accaMetaPixel = 'true';
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
}

function expireCookie(name) {
  if (typeof document === 'undefined') return;
  const hostname = window.location.hostname;
  const parentDomain = hostname.split('.').slice(-2).join('.');
  const domains = ['', hostname, `.${hostname}`, parentDomain ? `.${parentDomain}` : ''];
  domains.forEach((domain) => {
    const domainPart = domain ? ` Domain=${domain};` : '';
    document.cookie = `${name}=; Max-Age=0; Path=/;${domainPart} SameSite=Lax`;
  });
}

function clearTrackingCookies({ analytics, marketing }) {
  if (typeof document === 'undefined') return;
  const cookieNames = document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0].trim())
    .filter(Boolean);

  if (!analytics) {
    cookieNames
      .filter((name) => name === '_ga' || name === '_gid' || name === '_gat' || name.startsWith('_ga_'))
      .forEach(expireCookie);
  }
  if (!marketing) {
    cookieNames
      .filter((name) => name === '_fbp' || name === '_fbc' || name.startsWith('_gcl_'))
      .forEach(expireCookie);
  }
}

function normalizeConsent(value) {
  if (!value || value.version !== CONSENT_VERSION) return null;
  if (typeof value.analytics !== 'boolean' || typeof value.marketing !== 'boolean') return null;
  return {
    analytics: value.analytics,
    marketing: value.marketing,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null,
    version: CONSENT_VERSION,
  };
}

function readStoredConsent() {
  if (typeof window === 'undefined') return { readable: false, value: null };
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return { readable: true, value: raw ? normalizeConsent(JSON.parse(raw)) : null };
  } catch {
    return { readable: false, value: null };
  }
}

function publicConsent(consent) {
  return consent ? { ...consent } : null;
}

export function getTrackingConsent() {
  const runtime = getRuntime();
  if (runtime.consentStorageUnavailable) return publicConsent(runtime.consent);
  const stored = readStoredConsent();
  if (stored.readable) runtime.consent = stored.value;
  return publicConsent(stored.readable ? stored.value : runtime.consent);
}

function sanitizeLabel(value, maxLength = 120) {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  const cleaned = Array.from(String(value))
    .filter((character) => {
      const codePoint = character.codePointAt(0);
      return codePoint > 31 && codePoint !== 127;
    })
    .join('')
    .trim()
    .slice(0, maxLength);
  if (!cleaned || EMAIL_LIKE_VALUE.test(cleaned) || PHONE_LIKE_VALUE.test(cleaned)) return '';
  return cleaned;
}

function sanitizeEventParams(params = {}) {
  if (!params || typeof params !== 'object' || Array.isArray(params)) return {};
  const safe = {};

  Object.entries(params).forEach(([key, value]) => {
    if (SENSITIVE_PARAM_NAME.test(key)) return;
    if (SAFE_STRING_PARAMS.has(key)) {
      const cleaned = sanitizeLabel(value);
      if (cleaned) safe[key] = cleaned;
      return;
    }
    if (SAFE_NUMBER_PARAMS.has(key)) {
      const number = Number(value);
      if (Number.isFinite(number) && number >= 0) safe[key] = number;
      return;
    }
    if (SAFE_BOOLEAN_PARAMS.has(key) && typeof value === 'boolean') {
      safe[key] = value;
      return;
    }
    if (key === 'currency' && /^[A-Z]{3}$/.test(String(value).toUpperCase())) {
      safe.currency = String(value).toUpperCase();
      return;
    }
    if (key === 'content_ids' && Array.isArray(value)) {
      const ids = value.map((entry) => sanitizeLabel(entry, 80)).filter(Boolean).slice(0, 20);
      if (ids.length) safe.content_ids = ids;
    }
  });

  return safe;
}

function sanitizeAttributionValue(value, maxLength = 160) {
  const cleaned = sanitizeLabel(value, maxLength);
  return cleaned.replace(/[^\p{L}\p{N}\s._~+\-/]/gu, '');
}

function safePageUrl(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    if (!/^https?:$/.test(parsed.protocol)) return '';
    return `${parsed.origin}${parsed.pathname}`.slice(0, 500);
  } catch {
    return '';
  }
}

function currentAttribution() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const snapshot = {};
  ['source', 'medium', 'campaign', 'content', 'term'].forEach((key) => {
    const value = sanitizeAttributionValue(params.get(`utm_${key}`) || '');
    if (value) snapshot[`utm_${key}`] = value;
  });

  const fbclid = String(params.get('fbclid') || '').trim();
  if (/^[A-Za-z0-9._~-]{8,300}$/.test(fbclid)) snapshot.fbclid = fbclid;

  const landingPage = safePageUrl(window.location.href);
  if (landingPage) snapshot.landing_page = landingPage;
  if (document.referrer) {
    try {
      const referrer = new URL(document.referrer);
      if (/^https?:$/.test(referrer.protocol)) snapshot.referrer = referrer.origin;
    } catch {
      // Ignore malformed referrers.
    }
  }
  return snapshot;
}

function sanitizeStoredAttribution(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const snapshot = {};
  ['source', 'medium', 'campaign', 'content', 'term'].forEach((key) => {
    const cleaned = sanitizeAttributionValue(value[`utm_${key}`] || '');
    if (cleaned) snapshot[`utm_${key}`] = cleaned;
  });
  const fbclid = String(value.fbclid || '').trim();
  if (/^[A-Za-z0-9._~-]{8,300}$/.test(fbclid)) snapshot.fbclid = fbclid;

  const landingPage = value.landing_page ? safePageUrl(value.landing_page) : '';
  if (landingPage) snapshot.landing_page = landingPage;
  try {
    const referrer = new URL(String(value.referrer || ''));
    if (/^https?:$/.test(referrer.protocol)) snapshot.referrer = referrer.origin;
  } catch {
    // Ignore malformed stored attribution.
  }
  return snapshot;
}

function readSessionAttribution() {
  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    return raw ? sanitizeStoredAttribution(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function persistAttribution() {
  const runtime = getRuntime();
  const consent = runtime.consent;
  if (!consent?.analytics && !consent?.marketing) return {};

  const stored = readSessionAttribution();
  const firstTouch = runtime.attribution || currentAttribution();
  const snapshot = { ...firstTouch, ...stored };
  runtime.attribution = snapshot;
  try {
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // In-memory attribution still works when storage is unavailable.
  }
  return snapshot;
}

function readCookie(name) {
  if (typeof document === 'undefined') return '';
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  if (!cookie) return '';
  const value = cookie.slice(prefix.length);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function getAttributionSnapshot() {
  const consent = getRuntime().consent || getTrackingConsent();
  if (!consent?.analytics && !consent?.marketing) return {};

  const snapshot = { ...persistAttribution() };
  if (consent.marketing) {
    const fbp = sanitizeLabel(readCookie('_fbp'), 255);
    const cookieFbc = sanitizeLabel(readCookie('_fbc'), 350);
    const derivedFbc = !cookieFbc && snapshot.fbclid
      ? `fb.1.${Date.now()}.${snapshot.fbclid}`
      : '';
    if (fbp) snapshot.fbp = fbp;
    if (cookieFbc || derivedFbc) snapshot.fbc = cookieFbc || derivedFbc;
  }
  return snapshot;
}

function currentPageKey() {
  if (typeof window === 'undefined') return '';
  // This value is used only for in-memory deduplication and is never sent as an
  // event parameter. It keeps the automatic post-consent PageView and App's
  // route-aware PageView from double-counting the same document.
  return `${window.location.pathname}${window.location.search}`;
}

function activeConsent() {
  return getRuntime().consent;
}

function rememberEventId(eventName, eventId) {
  if (!eventId) return false;
  const runtime = getRuntime();
  const key = `${eventName}:${eventId}`;
  if (runtime.seenEventIds.has(key)) return true;
  runtime.seenEventIds.add(key);
  if (runtime.seenEventIds.size > 250) {
    const oldest = runtime.seenEventIds.values().next().value;
    runtime.seenEventIds.delete(oldest);
  }
  return false;
}

function normalizeEventId(value) {
  const cleaned = String(value || '').trim();
  return /^[A-Za-z0-9._:-]{8,100}$/.test(cleaned) ? cleaned : '';
}

function extractEventId(params, options) {
  return normalizeEventId(
    options?.eventId || params?.eventId || params?.eventID || params?.event_id
  );
}

function sendEvent({ dataLayerEvent, metaEvent, metaMode = 'track', params = {}, eventId = '' }) {
  const consent = activeConsent();
  if (!consent?.analytics && !consent?.marketing) return;
  if (rememberEventId(dataLayerEvent, eventId)) return;

  const safeParams = sanitizeEventParams(params);
  loadGoogleTagManager();
  ensureDataLayer().push({
    event: dataLayerEvent,
    ...safeParams,
    ...(eventId ? { event_id: eventId } : {}),
  });

  if (!consent.marketing || !META_PIXEL_ID || !metaEvent) return;
  loadMetaPixel();
  if (eventId) window.fbq(metaMode, metaEvent, safeParams, { eventID: eventId });
  else window.fbq(metaMode, metaEvent, safeParams);
}

export function createEventId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `acca_${crypto.randomUUID()}`;
  }
  const random = Math.random().toString(36).slice(2, 12);
  return `acca_${Date.now().toString(36)}_${random}`;
}

export function trackPageView(params = {}) {
  const runtime = getRuntime();
  const safeParams = sanitizeEventParams(params);
  const consent = activeConsent();
  if (!consent?.analytics && !consent?.marketing) {
    runtime.pendingPageParams = safeParams;
    return;
  }
  runtime.pendingPageParams = null;
  const pageKey = currentPageKey();

  if (runtime.lastGtmPageKey !== pageKey) {
    runtime.lastGtmPageKey = pageKey;
    loadGoogleTagManager();
    ensureDataLayer().push({ event: 'page_view', ...safeParams });
  }

  if (consent.marketing && META_PIXEL_ID && runtime.lastMetaPageKey !== pageKey) {
    runtime.lastMetaPageKey = pageKey;
    loadMetaPixel();
    window.fbq('track', 'PageView', safeParams);
  }
}

export function trackViewContent(params = {}) {
  const runtime = getRuntime();
  const safeParams = sanitizeEventParams(params);
  const consent = activeConsent();
  if (!consent?.analytics && !consent?.marketing) {
    runtime.pendingViewContentParams = safeParams;
    return;
  }
  runtime.pendingViewContentParams = null;
  sendEvent({ dataLayerEvent: 'view_content', metaEvent: 'ViewContent', params: safeParams });
}

export function trackSearch(params = {}) {
  sendEvent({ dataLayerEvent: 'search', metaEvent: 'Search', params });
}

export function trackConsultationOpen(params = {}) {
  sendEvent({
    dataLayerEvent: 'consultation_open',
    metaEvent: 'ConsultationOpen',
    metaMode: 'trackCustom',
    params,
  });
}

export function trackLeadFormStart(params = {}) {
  sendEvent({
    dataLayerEvent: 'lead_form_start',
    metaEvent: 'LeadFormStart',
    metaMode: 'trackCustom',
    params,
  });
}

export function trackLead(params = {}, options = {}) {
  const eventId = extractEventId(params, options) || createEventId();
  sendEvent({ dataLayerEvent: 'generate_lead', metaEvent: 'Lead', params, eventId });
  return eventId;
}

function trackOutboundContact(method) {
  sendEvent({
    dataLayerEvent: 'outbound_contact',
    metaEvent: 'Contact',
    params: { contact_method: method },
  });
}

function trackOutboundCustom(dataLayerEvent, metaEvent, method) {
  sendEvent({
    dataLayerEvent,
    metaEvent,
    metaMode: 'trackCustom',
    params: { contact_method: method },
  });
}

function handleDelegatedClick(event) {
  const target = event.target instanceof Element ? event.target : null;
  const anchor = target?.closest('a[href]');
  if (!anchor) return;
  const href = String(anchor.getAttribute('href') || '').trim().toLowerCase();

  if (/^(?:tel:)/.test(href)) trackOutboundContact('phone');
  else if (/^(?:mailto:)/.test(href)) trackOutboundContact('email');
  else if (/wa\.me|api\.whatsapp\.com|whatsapp:/.test(href)) trackOutboundContact('whatsapp');
  else if (/instagram\.com/.test(href)) trackOutboundCustom('instagram_click', 'InstagramClick', 'instagram');
  else if (/t\.me|telegram\.me|telegram:/.test(href)) trackOutboundCustom('telegram_click', 'TelegramClick', 'telegram');
}

function applyConsent(consent, { pageView = true } = {}) {
  const runtime = getRuntime();
  runtime.consent = consent;
  queueGoogleConsentDefault();
  pushGoogleCommand('consent', 'update', googleConsentState(consent));

  if (consent.analytics || consent.marketing) {
    persistAttribution();
    loadGoogleTagManager();
  } else {
    try {
      window.sessionStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
    } catch {
      // Storage may be unavailable in private browsing.
    }
  }

  if (consent.marketing) loadMetaPixel();
  else if (runtime.metaInitialised && typeof window.fbq === 'function') {
    runtime.metaConsentGranted = false;
    window.fbq('consent', 'revoke');
  }

  clearTrackingCookies(consent);
  if (pageView && (consent.analytics || consent.marketing)) {
    const pendingPageParams = runtime.pendingPageParams || {};
    const pendingViewContentParams = runtime.pendingViewContentParams;
    trackPageView(pendingPageParams);
    if (pendingViewContentParams) trackViewContent(pendingViewContentParams);
  }
}

function revokedGrantedCategory(previousConsent, nextConsent) {
  return Boolean(
    (previousConsent?.analytics && !nextConsent.analytics) ||
    (previousConsent?.marketing && !nextConsent.marketing)
  );
}

function scheduleReloadAfterRevocation() {
  const runtime = getRuntime();
  if (runtime.reloadScheduled) return;
  runtime.reloadScheduled = true;
  window.setTimeout(() => window.location.reload(), 0);
}

export function setTrackingConsent({ analytics = false, marketing = false } = {}) {
  if (typeof window === 'undefined') return null;
  initAnalytics();
  const previousConsent = getRuntime().consent;
  const consent = {
    analytics: Boolean(analytics),
    marketing: Boolean(marketing),
    updatedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };

  const runtime = getRuntime();
  runtime.consent = consent;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
    runtime.consentStorageUnavailable = false;
  } catch {
    runtime.consentStorageUnavailable = true;
    // Runtime consent still applies if persistent storage is unavailable.
  }

  applyConsent(consent);
  window.dispatchEvent(new CustomEvent(TRACKING_CONSENT_EVENT, { detail: publicConsent(consent) }));
  if (revokedGrantedCategory(previousConsent, consent)) scheduleReloadAfterRevocation();
  return publicConsent(consent);
}

function attachStorageListener() {
  const runtime = getRuntime();
  if (runtime.storageListenerAttached) return;
  runtime.storageListenerAttached = true;
  window.addEventListener('storage', (event) => {
    if (event.key !== CONSENT_STORAGE_KEY) return;
    const previousConsent = runtime.consent;
    let nextConsent;
    try {
      nextConsent = event.newValue ? normalizeConsent(JSON.parse(event.newValue)) : null;
    } catch {
      nextConsent = null;
    }
    const effectiveConsent = nextConsent || {
      analytics: false,
      marketing: false,
      updatedAt: null,
      version: CONSENT_VERSION,
    };
    applyConsent(effectiveConsent);
    window.dispatchEvent(new CustomEvent(TRACKING_CONSENT_EVENT, {
      detail: publicConsent(nextConsent),
    }));
    if (revokedGrantedCategory(previousConsent, effectiveConsent)) scheduleReloadAfterRevocation();
  });
}

export function initAnalytics() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  const runtime = getRuntime();
  if (runtime.initialised) return publicConsent(runtime.consent);
  runtime.initialised = true;
  runtime.attribution = currentAttribution();

  queueGoogleConsentDefault();
  if (!runtime.delegatedClickAttached) {
    runtime.delegatedClickAttached = true;
    document.addEventListener('click', handleDelegatedClick, { capture: true });
  }
  attachStorageListener();

  const consent = getTrackingConsent();
  // App owns the route-aware initial PageView. Deferring it until React mounts
  // preserves page_type/content metadata and avoids a generic duplicate.
  if (consent) applyConsent(consent, { pageView: false });
  else clearTrackingCookies({ analytics: false, marketing: false });
  return publicConsent(consent);
}

// Temporary compatibility for callers that have not migrated to initAnalytics.
export const initDeferredAnalytics = initAnalytics;
