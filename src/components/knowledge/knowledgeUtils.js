import { useEffect, useState } from 'react';

/* Pure helpers + hooks shared by the knowledge surfaces (blog + glossary).
 * Kept in a non-component module so Fast Refresh stays happy. */

/** Pick the Persian or English string for the active language. */
export function tt(fa, en, isFa) {
  return isFa ? fa : en;
}

/** Locale-aware long date. */
export function formatDate(value, isFa) {
  try {
    return new Intl.DateTimeFormat(isFa ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

/** Compact relative time ("2 days ago" / "۲ روز پیش"). */
export function timeAgo(value, isFa) {
  try {
    const diff = (Date.now() - new Date(value).getTime()) / 1000;
    const rtf = new Intl.RelativeTimeFormat(isFa ? 'fa-IR' : 'en-US', { numeric: 'auto' });
    const units = [
      ['year', 31536000],
      ['month', 2592000],
      ['week', 604800],
      ['day', 86400],
      ['hour', 3600],
      ['minute', 60],
    ];
    for (const [unit, secs] of units) {
      if (Math.abs(diff) >= secs) return rtf.format(Math.round(-diff / secs), unit);
    }
    return rtf.format(0, 'second');
  } catch {
    return '';
  }
}

/** Smooth-scroll to an in-page element while clearing the fixed header, then
 *  play a soft Apple-style focus flash on the destination. */
export function scrollToId(id, offset = 104) {
  if (typeof window === 'undefined') return;
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top, left: 0, behavior: reduce ? 'auto' : 'smooth' });

  if (reduce || typeof el.animate !== 'function') return;
  try {
    el.animate(
      [
        { backgroundColor: 'rgba(198, 167, 104, 0.16)' },
        { backgroundColor: 'rgba(198, 167, 104, 0)' },
      ],
      { duration: 950, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    );
  } catch {
    // Web Animations API unavailable — scrolling already happened.
  }
}

/** Tracks the most in-view section id for a sticky table of contents. */
export function useActiveId(ids) {
  const key = ids.join('|');
  const [active, setActive] = useState(ids[0] || null);

  useEffect(() => {
    if (typeof window === 'undefined' || !ids.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-22% 0px -68% 0px', threshold: [0, 0.25, 0.5, 1] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return active;
}
