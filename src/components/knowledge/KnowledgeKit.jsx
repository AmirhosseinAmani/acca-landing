import { useEffect, useRef, useState } from 'react';
import { ArrowUp, GraduationCap, List, MessageCircle, Moon, Sparkles, Sun } from 'lucide-react';
import { scrollToId, tt } from './knowledgeUtils';
import { BackButton, MainNav } from '../SiteNav';
import { COMPANY_WHATSAPP_URL } from '../../constants/contact';

/* ----------------------------------------------------------------------------
 * KnowledgeKit — shared, Safari-friendly UI building blocks for the ACCA EDU
 * knowledge surfaces (blog + glossary). Animation is transform/opacity only,
 * runs once, and is fully disabled under prefers-reduced-motion. Heavy
 * backdrop-blur is kept to the floating header alone to protect Safari paint.
 * Pure helpers/hooks live in ./knowledgeUtils.
 * ------------------------------------------------------------------------- */

const EASE = [0.22, 1, 0.36, 1];

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  return reduce;
}

/** Fade + rise into view. Renders a static element under reduced-motion.
 *  Extra props (id, aria-*, etc.) are forwarded to the rendered element so
 *  in-page anchors and the table of contents keep working. */
export function Reveal({ children, className, delay = 0, y = 18, as = 'div', style, ...rest }) {
  const reduce = usePrefersReducedMotion();
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const isVisible = reduce || visible;
  const Tag = as;

  useEffect(() => {
    if (reduce) return undefined;
    const node = ref.current;
    if (!node || typeof window === 'undefined') return undefined;
    if (!('IntersectionObserver' in window)) {
      const id = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(id);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduce]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0)' : `translate3d(0, ${y}px, 0)`,
        transition: reduce
          ? 'none'
          : `opacity 600ms cubic-bezier(${EASE.join(',')}), transform 600ms cubic-bezier(${EASE.join(',')})`,
        transitionDelay: isVisible && delay ? `${delay}s` : undefined,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Thin top reading-progress bar driven by document scroll. */
export function ReadingProgress({ darkMode, isFa }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{ transform: `scaleX(${progress})` }}
      className={`${darkMode ? 'bg-[#C6A768]' : 'bg-[#071A3D]'} ${isFa ? 'origin-right' : 'origin-left'} fixed inset-x-0 top-0 z-[70] h-[3px]`}
    />
  );
}

/** Soft, mostly-static gradient aurora. Gradients are blur-free (cheap paint);
 *  a single slow drift is added only when motion is allowed. */
export function AuroraBackground({ darkMode }) {
  const blobs = [
    {
      style: { background: 'radial-gradient(circle, rgba(198,167,104,0.20), transparent 62%)', top: '-10rem', insetInlineEnd: '-8rem', width: '42rem', height: '42rem' },
    },
    {
      style: { background: 'radial-gradient(circle, rgba(7,26,61,0.18), transparent 60%)', top: '24rem', insetInlineStart: '-10rem', width: '38rem', height: '38rem' },
    },
    {
      style: { background: darkMode ? 'radial-gradient(circle, rgba(56,189,248,0.10), transparent 60%)' : 'radial-gradient(circle, rgba(16,185,129,0.10), transparent 60%)', bottom: '-6rem', insetInlineStart: '30%', width: '34rem', height: '34rem' },
    },
  ];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {blobs.map((blob, index) => (
        <div
          key={index}
          className="absolute rounded-full"
          style={blob.style}
        />
      ))}
    </div>
  );
}

/** Floating glass header shared across knowledge pages. */
export function KnowledgeHeader({
  darkMode,
  isFa,
  ACCA_LOGO_SRC,
  activeNav,
  backFallback = '/',
  onToggleDarkMode,
  onToggleLanguage,
  onConsultationClick,
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-[60] px-3 py-3 sm:px-6 sm:py-4">
      <div
        className={`${darkMode ? 'border-white/10 bg-[#07111f]/80 text-white' : 'border-black/5 bg-white/80 text-neutral-950'} mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full border px-4 py-2.5 backdrop-blur-xl transition-shadow duration-300 sm:px-6 ${scrolled ? 'shadow-[0_18px_50px_rgba(7,26,61,0.18)]' : 'shadow-[0_8px_30px_rgba(7,26,61,0.08)]'}`}
      >
        <div className="flex shrink-0 items-center gap-2">
          <a href="/" className="flex shrink-0 items-center gap-3" aria-label={tt('بازگشت به صفحه اصلی آکا', 'Back to ACCA home', isFa)}>
            <img src={ACCA_LOGO_SRC} alt="ACCA EDU" width="150" height="44" className="h-9 w-auto object-contain sm:h-10" />
          </a>
          <BackButton fallback={backFallback} isFa={isFa} darkMode={darkMode} />
        </div>

        <MainNav active={activeNav} isFa={isFa} darkMode={darkMode} />

        <div className="flex items-center gap-2">
          {onConsultationClick && (
            <button
              type="button"
              onClick={onConsultationClick}
              className="hidden items-center gap-2 rounded-full bg-[#071A3D] px-4 py-2.5 text-xs font-black text-white shadow-[0_10px_26px_rgba(7,26,61,0.28)] transition hover:bg-[#0a2350] xl:inline-flex"
            >
              <GraduationCap size={15} />
              {tt('بررسی پرونده', 'Free review', isFa)}
            </button>
          )}
          <button
            type="button"
            onClick={onToggleLanguage}
            className={`${darkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-black/[0.06] text-black hover:bg-black/10'} h-10 rounded-full px-3.5 text-xs font-black transition`}
          >
            {isFa ? 'EN' : 'FA'}
          </button>
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? tt('حالت روشن', 'Light mode', isFa) : tt('حالت تاریک', 'Dark mode', isFa)}
            className={`${darkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-black/[0.06] text-black hover:bg-black/10'} flex h-10 w-10 items-center justify-center rounded-full transition`}
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </header>
  );
}

/** Sticky in-page table of contents with Apple-style tap feedback.
 *  Clicking an item smooth-scrolls and flashes the destination (see scrollToId). */
export function TableOfContents({ items, activeId, darkMode, isFa }) {
  return (
    <nav aria-label={tt('فهرست مطالب', 'Table of contents', isFa)} className="flex flex-col gap-1">
      <p className={`${darkMode ? 'text-white/45' : 'text-neutral-400'} mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em]`}>
        <List size={14} />
        {tt('در این صفحه', 'On this page', isFa)}
      </p>
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToId(item.id)}
            aria-current={isActive ? 'true' : undefined}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-start text-[13px] font-bold leading-6 transition duration-300 ease-out active:scale-[0.97] ${
              isActive
                ? (darkMode ? 'bg-white/10 text-white' : 'bg-[#071A3D]/[0.06] text-[#071A3D]')
                : (darkMode ? 'text-white/55 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')
            }`}
          >
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300 ${isActive ? 'scale-125 bg-[#C6A768]' : (darkMode ? 'bg-white/20' : 'bg-black/15')}`} />
            <span className="line-clamp-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/** Floating "back to top" affordance, appears after the first viewport. */
export function BackToTop({ darkMode, isFa }) {
  const [show, setShow] = useState(false);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })}
      aria-label={tt('بازگشت به بالا', 'Back to top', isFa)}
      className={`${darkMode ? 'bg-white text-[#071A3D]' : 'bg-[#071A3D] text-white'} fixed bottom-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-[0_16px_40px_rgba(7,26,61,0.3)] transition ${isFa ? 'left-6' : 'right-6'}`}
    >
      <ArrowUp size={20} />
    </button>
  );
}

/** Shared lead-generation CTA band. Topic is contextual per article/term. */
export function LeadCta({ darkMode, isFa, onConsultationClick, topic }) {
  return (
    <Reveal
      as="section"
      className={`${darkMode ? 'bg-[#071A3D]' : 'bg-[#071A3D]'} relative overflow-hidden rounded-[32px] p-6 text-white sm:p-9`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(120% 120% at 100% 0%, rgba(198,167,104,0.35), transparent 55%)' }}
      />
      <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-black text-[#E9D9B3]">
            <Sparkles size={14} />
            {tt('مشاوره رایگان آکا', 'Free ACCA guidance', isFa)}
          </div>
          <h2 className="mt-4 text-2xl font-black leading-9 sm:text-3xl">
            {topic || tt('پرونده‌ات را با کارشناس آکا بررسی کن', 'Have an ACCA advisor review your case', isFa)}
          </h2>
          <p className="mt-3 text-sm font-semibold leading-8 text-white/75">
            {tt(
              'هر دانشجو شرایط خودش را دارد. قبل از تصمیم، مسیر دقیق پذیرش و اقامت خودت را با تیم آکا بررسی کن.',
              'Every student is different. Check your exact admission and residence path with the ACCA team before you act.',
              isFa
            )}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onConsultationClick}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#C6A768] px-6 py-3.5 text-sm font-black text-[#071A3D] shadow-[0_16px_40px_rgba(198,167,104,0.3)] transition hover:brightness-105"
          >
            <GraduationCap size={18} />
            {tt('شروع بررسی رایگان', 'Start free review', isFa)}
          </button>
          <a
            href={COMPANY_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-500/15 px-6 py-3.5 text-sm font-black text-white ring-1 ring-emerald-300/30 backdrop-blur-sm transition hover:bg-emerald-500/25"
          >
            <MessageCircle size={18} />
            {tt('ارتباط از طریق واتساپ', 'Contact on WhatsApp', isFa)}
          </a>
        </div>
      </div>
    </Reveal>
  );
}
