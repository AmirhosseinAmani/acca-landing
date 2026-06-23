import { COMPANY_WHATSAPP_URL } from '../../constants/contact';
import { SEO_LANDING_BY_SLUG } from '../../data/seoLandingPages';

/**
 * Renders one SEO landing page (Persian, RTL) from the shared seoLandingPages
 * data. Intentionally a clean, "normal" page — eyebrow, H1, summary, supporting
 * points, a short body and a couple of CTAs + related links — matching the
 * prerendered static shell so crawlers and hydrated users see the same content.
 */
export default function SeoLandingPage({
  slug,
  data,
  darkMode,
  ACCA_LOGO_SRC,
  onToggleDarkMode,
}) {
  const page = data || SEO_LANDING_BY_SLUG[slug];
  if (!page) return null;

  const related = (page.related || [])
    .map((relatedSlug) => SEO_LANDING_BY_SLUG[relatedSlug])
    .filter(Boolean);

  const cardClass = darkMode
    ? 'border-white/10 bg-white/5 text-white'
    : 'border-black/8 bg-white/80 text-neutral-900';

  return (
    <div
      dir="rtl"
      className={`${darkMode ? 'bg-[#050816] text-white' : 'bg-[#f7f1e8] text-neutral-950'} min-h-screen overflow-hidden px-5 py-6 sm:px-6 sm:py-8`}
    >
      <div className={`${darkMode ? 'darkGlass' : 'glass'} mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-full px-5 py-4 sm:px-7`}>
        <a href="/" aria-label="بازگشت به صفحه اصلی ACCA EDU">
          <img
            src={ACCA_LOGO_SRC}
            alt="ACCA EDU Logo"
            width="160"
            height="44"
            className="h-10 w-auto object-contain sm:h-11"
          />
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'حالت روشن' : 'حالت تاریک'}
            className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} grid h-11 w-11 place-items-center rounded-full text-base font-black`}
          >
            {darkMode ? '☀' : '☾'}
          </button>

          <a
            href="/"
            className={`${darkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-black/5 text-black hover:bg-black/10'} rounded-full px-4 py-3 text-xs font-black transition sm:px-6 sm:text-sm`}
          >
            بازگشت
          </a>
        </div>
      </div>

      <main className="mx-auto mt-10 max-w-3xl pb-24">
        <p className={`${darkMode ? 'text-emerald-300' : 'text-emerald-700'} text-sm font-black tracking-[0.18em]`}>
          {page.eyebrow}
        </p>

        <h1 className="mt-4 text-3xl font-black leading-[1.25] md:text-5xl">
          {page.h1}
        </h1>

        <p className={`${darkMode ? 'text-white/70' : 'text-neutral-700'} mt-6 text-lg font-medium leading-9`}>
          {page.summary}
        </p>

        {page.points?.length > 0 && (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {page.points.map((point) => (
              <li
                key={point}
                className={`${cardClass} flex items-start gap-3 rounded-2xl border p-4 text-sm font-bold leading-7`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}

        {page.body?.map((paragraph) => (
          <p key={paragraph} className={`${darkMode ? 'text-white/70' : 'text-neutral-700'} mt-6 text-base font-medium leading-9`}>
            {paragraph}
          </p>
        ))}

        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href={page.primaryHref}
            className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-7 py-4 text-sm font-black text-white transition hover:bg-emerald-800 sm:text-base"
          >
            {page.primaryLabel}
          </a>
          <a
            href={COMPANY_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${darkMode ? 'border-white/15 bg-white/8 text-white hover:bg-white/12' : 'border-black/10 bg-white/70 text-neutral-900 hover:bg-white'} inline-flex items-center justify-center rounded-full border px-7 py-4 text-sm font-black transition sm:text-base`}
          >
            ارتباط از طریق واتساپ
          </a>
        </div>

        {related.length > 0 && (
          <nav aria-label="صفحات مرتبط" className="mt-12">
            <p className={`${darkMode ? 'text-white/45' : 'text-black/45'} mb-3 text-xs font-black uppercase tracking-[0.2em]`}>
              صفحات مرتبط
            </p>
            <ul className="flex flex-col gap-2">
              {related.map((relatedPage) => (
                <li key={relatedPage.slug}>
                  <a
                    href={`/${relatedPage.slug}/`}
                    className={`${darkMode ? 'text-emerald-300 hover:text-emerald-200' : 'text-emerald-700 hover:text-emerald-800'} text-sm font-black underline-offset-4 hover:underline`}
                  >
                    {relatedPage.h1}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </main>
    </div>
  );
}
