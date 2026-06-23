/* ============================================================================
 * Canonical URL routing — single source of truth.
 *
 * The site's SPA state is driven by a `page` value plus optional params
 * (?page=blog&post=…). For SEO every indexable view also has ONE canonical
 * clean URL (/blog/<slug>/). This module maps between the two and is imported
 * by:
 *   - App.jsx                         (routing + <link rel=canonical>)
 *   - lib/navigation.js               (building internal links)
 *   - scripts/prerender-static-pages  (static SSG + sitemap)
 *
 * It MUST stay free of browser globals and React so the Node build can import
 * it directly.
 * ========================================================================== */

export const SITE_ORIGIN = 'https://www.accaco.com';

// Section pages that own a clean base path.
export const CLEAN_PAGE_PATH = {
  programs: '/programs/',
  universities: '/universities/',
  'istanbul-map': '/istanbul-university-map/',
  scholarships: '/scholarships/',
  blog: '/blog/',
  glossary: '/glossary/',
};

// A few blog posts are ALSO surfaced as bespoke marketing pages (via App.jsx's
// STATIC_ROUTE_ALIASES). Those marketing URLs are the canonical home for that
// content, so the /blog/<slug>/ view must point its canonical there instead of
// at itself — otherwise the two URLs compete as duplicate content.
export const BLOG_CANONICAL_OVERRIDE = {
  'student-residence-e-ikamet-2026': '/residence-permit/',
  'address-registration-nvi-turkey-student-warning': '/accommodation/',
};

/**
 * Build the clean PATH for an internal navigation target. Faceting params are
 * intentionally ignored — links always point at the canonical view.
 */
export function routePath({ page, post, term, section } = {}) {
  if (post) return `/blog/${encodeURIComponent(post)}/`;
  if (term) return `/glossary/${encodeURIComponent(term)}/`;
  if (page && CLEAN_PAGE_PATH[page]) return CLEAN_PAGE_PATH[page];
  if (section) return `/?section=${encodeURIComponent(section)}`;
  return '/';
}

/** Absolute canonical URL for an internal target. */
export function routeUrl(target) {
  return `${SITE_ORIGIN}${routePath(target)}`;
}

/**
 * Canonical clean PATH for the CURRENT view, or null when the view should keep
 * its existing (query-param) canonical — i.e. faceted program/university
 * filters and university profile pages, which are out of scope here.
 *
 * `params` is anything exposing `.get(key)` (URLSearchParams) or a plain object.
 */
export function cleanCanonicalPath(page, params) {
  const get = (key) => {
    if (!params) return null;
    if (typeof params.get === 'function') return params.get(key);
    return params[key] ?? null;
  };

  if (page === 'blog') {
    const post = get('post');
    if (!post) return '/blog/';
    return BLOG_CANONICAL_OVERRIDE[post] || `/blog/${encodeURIComponent(post)}/`;
  }
  if (page === 'glossary') {
    const term = get('term');
    return term ? `/glossary/${encodeURIComponent(term)}/` : '/glossary/';
  }
  if (page === 'scholarships') return '/scholarships/';
  if (page === 'programs') {
    const faceted = get('university') || get('program') || get('search') || get('department') || get('query') || get('q');
    return faceted ? null : '/programs/';
  }
  if (page === 'universities') {
    const faceted = get('profile') || get('university');
    return faceted ? null : '/universities/';
  }
  if (page === 'istanbul-map') return '/istanbul-university-map/';
  return null;
}

/**
 * Resolve a clean pathname into the router alias used by App.jsx. Returns null
 * for the home shell and unknown paths (so the SPA renders its default view).
 * Only owns the dynamic content routes (blog/glossary/scholarships); bespoke
 * marketing routes live in App.jsx's STATIC_ROUTE_ALIASES.
 */
export function parseCleanPath(pathname = '/') {
  const normalized = `/${String(pathname || '/').replace(/^\/+/, '').replace(/\/+$/, '')}`;
  if (normalized === '/') return null;

  const segments = normalized.slice(1).split('/').filter(Boolean);
  const [head, slug] = segments;

  if (head === 'blog') {
    return slug
      ? { page: 'blog', post: decodeURIComponent(slug), canonicalPath: `/blog/${slug}/` }
      : { page: 'blog', canonicalPath: '/blog/' };
  }
  if (head === 'glossary') {
    return slug
      ? { page: 'glossary', term: decodeURIComponent(slug), canonicalPath: `/glossary/${slug}/` }
      : { page: 'glossary', canonicalPath: '/glossary/' };
  }
  if (head === 'scholarships' && !slug) {
    return { page: 'scholarships', canonicalPath: '/scholarships/' };
  }
  if (head === 'istanbul-university-map' && !slug) {
    return { page: 'istanbul-map', canonicalPath: '/istanbul-university-map/' };
  }
  return null;
}
