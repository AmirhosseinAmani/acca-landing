import {
  ADS_CONVERSION_ID,
  ADS_LABELS,
  ANALYTICS_ENABLED,
  GA4_ID,
  GTM_ID,
} from '../constants/analytics';

/* ------------------------------------------------------------------ *
 * analytics.js — lightweight, dependency-free conversion tracking.
 *
 * What it does:
 *   1. Injects Google Tag Manager and/or gtag.js — but only the ones that
 *      are configured in constants/analytics.js (env-driven).
 *   2. Mirrors every event to BOTH the GTM dataLayer and gtag, so the same
 *      call works whether you wire conversions through GTM or directly.
 *   3. Auto-tracks outbound WhatsApp / Instagram / Telegram link clicks with
 *      ONE delegated listener — no need to touch every <a> on the site.
 *
 * Form (lead) conversions are fired explicitly from the consultation modal,
 * because a successful submit is not a link click.
 *
 * Everything is a no-op when no ids are configured, so this is safe to ship
 * before the Google Ads / GA4 ids exist. Nothing here can break rendering.
 * ------------------------------------------------------------------ */

let initialised = false;

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

// Canonical gtag shim. gtag.js reads the pushed `arguments`, so keep this form.
function gtag() {
  ensureDataLayer().push(arguments);
}

function injectScript(src) {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

// Standard Google Tag Manager bootstrap (the official inline snippet).
function loadGtm(id) {
  ensureDataLayer().push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  injectScript(`https://www.googletagmanager.com/gtm.js?id=${id}`);
}

// Standard gtag.js bootstrap. One loader script covers every configured id.
function loadGtag() {
  const loaderId = GA4_ID || ADS_CONVERSION_ID;
  injectScript(`https://www.googletagmanager.com/gtag/js?id=${loaderId}`);
  gtag('js', new Date());
  if (GA4_ID) gtag('config', GA4_ID);
  if (ADS_CONVERSION_ID) gtag('config', ADS_CONVERSION_ID);
}

/**
 * Send a named event to every configured destination (GTM dataLayer + gtag).
 * Safe to call anywhere; does nothing when analytics is disabled.
 */
export function trackEvent(name, params = {}) {
  if (!ANALYTICS_ENABLED) return;
  ensureDataLayer().push({ event: name, ...params });
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
}

// Fire a Google Ads conversion directly via gtag (only if id + label exist).
function fireAdsConversion(label) {
  if (!ADS_CONVERSION_ID || !label) return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'conversion', {
    send_to: `${ADS_CONVERSION_ID}/${label}`,
  });
}

export function trackWhatsApp() {
  trackEvent('whatsapp_click', { method: 'whatsapp' });
  fireAdsConversion(ADS_LABELS.whatsapp);
}

export function trackInstagram() {
  trackEvent('instagram_click', { method: 'instagram' });
  fireAdsConversion(ADS_LABELS.instagram);
}

export function trackTelegram() {
  // Tracked as engagement only (no Ads conversion configured for Telegram).
  trackEvent('telegram_click', { method: 'telegram' });
}

/** Fire on a successful consultation-form submit (the primary lead action). */
export function trackLead(params = {}) {
  trackEvent('generate_lead', { ...params });
  fireAdsConversion(ADS_LABELS.lead);
}

// One capture-phase listener handles every messaging/social outbound link,
// so new links added anywhere on the site are tracked automatically.
function handleDelegatedClick(event) {
  const anchor = event.target.closest && event.target.closest('a[href]');
  if (!anchor) return;
  const href = anchor.getAttribute('href') || '';
  if (/wa\.me|api\.whatsapp\.com|whatsapp:/i.test(href)) trackWhatsApp();
  else if (/instagram\.com/i.test(href)) trackInstagram();
  else if (/t\.me|telegram\.me/i.test(href)) trackTelegram();
}

/**
 * Boot analytics once, from the client entry (main.jsx). Injects only the
 * configured tags and starts auto-tracking outbound social/messaging links.
 */
export function initAnalytics() {
  if (initialised) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  initialised = true;
  if (!ANALYTICS_ENABLED) return;

  ensureDataLayer();
  if (GTM_ID) loadGtm(GTM_ID);
  if (GA4_ID || ADS_CONVERSION_ID) loadGtag();

  document.addEventListener('click', handleDelegatedClick, { capture: true });
}
