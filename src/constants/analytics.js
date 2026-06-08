/* ------------------------------------------------------------------ *
 * Analytics / conversion-tracking configuration — single source of truth.
 *
 * Every id is read from a Vite env var so it can be set per-environment and
 * kept out of source control. When a value is empty the matching tag is
 * simply NOT injected, so the site behaves exactly as before — tracking is
 * fully inert until you provide ids. This never blocks or changes rendering.
 *
 * HOW TO ACTIVATE (copy .env.example → .env, or set these in your host):
 *   VITE_GTM_ID               existing GTM container, e.g. "GTM-XXXXXXX"
 *   VITE_GA4_ID               GA4 measurement id,      e.g. "G-XXXXXXXXXX"
 *   VITE_ADS_CONVERSION_ID    Google Ads conversion id, e.g. "AW-123456789"
 *   VITE_ADS_LABEL_WHATSAPP   Ads conversion label for the WhatsApp action
 *   VITE_ADS_LABEL_LEAD       Ads conversion label for the consultation form
 *   VITE_ADS_LABEL_INSTAGRAM  Ads conversion label for the Instagram action
 *
 * Use GTM *or* gtag (GA4 / Ads), not both, to measure the same conversion
 * twice. If you point events at your GTM container, configure the Google Ads
 * conversion tags inside GTM. If you set GA4_ID / ADS_CONVERSION_ID instead,
 * gtag fires the conversions directly from the site.
 * ------------------------------------------------------------------ */

// `import.meta.env` is always defined under Vite; the `|| {}` guard keeps the
// module safe if it is ever imported from a plain Node context (prerender).
const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

export const GTM_ID = env.VITE_GTM_ID || '';
export const GA4_ID = env.VITE_GA4_ID || '';
export const ADS_CONVERSION_ID = env.VITE_ADS_CONVERSION_ID || '';

export const ADS_LABELS = {
  whatsapp: env.VITE_ADS_LABEL_WHATSAPP || '',
  lead: env.VITE_ADS_LABEL_LEAD || '',
  instagram: env.VITE_ADS_LABEL_INSTAGRAM || '',
};

// True when at least one tag is configured — used to short-circuit all work.
export const ANALYTICS_ENABLED = Boolean(GTM_ID || GA4_ID || ADS_CONVERSION_ID);
