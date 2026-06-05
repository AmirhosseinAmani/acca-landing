/* ============================================================================
 * Site navigation helpers.
 *
 * The site uses full-page (query-param) navigation, so the browser's own
 * history already tracks "where I came from" for EVERY link (header, content,
 * anywhere). goBack() therefore returns the visitor to the exact previous page
 * AND scroll position — falling back to a sensible URL only on a cold deep-link
 * with no in-site history.
 * ========================================================================== */

/** The three main content pages that cross-link to each other everywhere. */
export const MAIN_NAV = [
  { key: 'blog', href: '?page=blog', fa: 'بلاگ', en: 'Blog' },
  { key: 'universities', href: '?page=universities', fa: 'دانشگاه‌ها', en: 'Universities' },
  { key: 'programs', href: '?page=programs', fa: 'رشته‌ها و شهریه‌ها', en: 'Programs & Tuition' },
];

/** Go back to the exact previous in-site page, or `fallback` on a cold entry. */
export function goBack(fallback = '/') {
  if (typeof window === 'undefined') return;

  const referrer = document.referrer || '';
  const cameFromSite = referrer.startsWith(window.location.origin) && window.history.length > 1;

  if (cameFromSite) {
    window.history.back();
  } else {
    window.location.href = fallback;
  }
}
