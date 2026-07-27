import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { MessageCircle, Palette } from 'lucide-react';
import { COMPANY_WHATSAPP_URL } from '../../constants/contact';
import { loadAstronautConfig, saveAstronautConfig } from '../../lib/astronautConfig';

const MOBILE_ASTRONAUT_SRC =
  '/assets/optimized/astronaut-384.webp';
const HeroAstronautScene = lazy(() => import('./HeroAstronautScene'));
const AstronautCustomizerModal = lazy(() => import('./AstronautCustomizerModal'));

/**
 * HeroSection owns its own scroll tracking so the parent App never re-renders
 * on scroll.  The astronaut shell transform is applied via direct DOM mutation.
 */
export default function HeroSection({ darkMode, isFa, isDesktopViewport, onConsultationClick }) {
  const astronautShellRef = useRef(null);
  const [astroConfig, setAstroConfig] = useState(() => loadAstronautConfig());
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const handleAstronautSave = (nextConfig) => {
    setAstroConfig(nextConfig);
    saveAstronautConfig(nextConfig);
    setCustomizerOpen(false);
  };
  const heroTrustItems = isFa
    ? ['مشاوره رایگان ۲۴ ساعته', 'پذیرش دانشگاه', 'راهنمای ثبت‌نام', 'اقامت دانشجویی', 'مسکن و خوابگاه', 'بیمه سلامت', 'ورود و اسکان']
    : ['Free 24-hour consultation', 'University admission', 'Registration guidance', 'Student residence', 'Housing support', 'Insurance guidance', 'Arrival support'];

  useEffect(() => {
    if (!isDesktopViewport) return undefined;

    let rAF = 0;

    const update = () => {
      const curr = window.scrollY;
      rAF = 0;

      const el = astronautShellRef.current;
      if (!el) return;
      el.style.transform = `translate3d(0px,${-18 + curr * 0.008}px,0px) scale(1.02) rotate(${curr * 0.003}deg)`;
      el.style.filter = 'saturate(1.16) contrast(1.06)';
    };

    const onScroll = () => { if (!rAF) rAF = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // set initial position

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rAF) cancelAnimationFrame(rAF);
    };
  }, [isDesktopViewport]);

  return (
<section className="min-h-[64svh] lg:min-h-[52vh] flex items-start px-5 sm:px-6 pt-[96px] pb-5 sm:pt-[104px] md:pt-[112px] lg:pt-[124px] lg:pb-6 xl:pt-[132px] relative z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-5 lg:gap-12 items-center w-full">
          <div className="relative z-10 max-w-xl lg:max-w-none">
            <div className={`${darkMode ? 'darkGlass text-white' : 'glass text-neutral-700'} inline-flex max-w-full items-center gap-3 px-4 py-2.5 rounded-full mb-5 text-xs font-bold sm:text-sm`}>
              <div className="w-3 h-3 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
              <span className="min-w-0 leading-tight">
                {isFa ? 'پذیرش، اقامت و مسیر ورود دانشجو به ترکیه' : 'Admission, residence and student arrival in Turkey'}
              </span>
            </div>

            <h1
              style={isFa ? { lineHeight: '1.2' } : undefined}
              className={`hero-title text-4xl font-black leading-[1.12] sm:text-5xl md:text-6xl xl:text-7xl ${darkMode ? 'text-white' : 'text-neutral-900'}`}
            >
              {isFa ? 'تحصیل در ترکیه،' : 'Study in Turkey,'}
              <br />
              {isFa ? 'از پذیرش دانشگاه' : 'from university admission'}
              <br />
              {isFa ? 'تا اقامت دانشجویی' : 'to student residence'}
            </h1>

            <p className={`mt-4 lg:mt-5 text-sm lg:text-base leading-7 max-w-xl font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              {isFa
                ? 'آکا ادو مسیر دانشجو را از انتخاب دانشگاه و رشته تا ثبت‌نام، اقامت دانشجویی، بیمه، مسکن و ورود به ترکیه قدم‌به‌قدم منظم می‌کند.'
                : 'ACCA EDU guides students from university and program selection to registration, student residence, insurance, housing and arrival in Turkey.'}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-7">
              <button
                type="button"
                onClick={onConsultationClick}
                className="inline-flex items-center gap-3 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3.5 rounded-full text-sm font-black transition-all duration-300 hover:scale-[1.04] shadow-[0_8px_32px_rgba(5,150,105,0.35)] sm:px-7 sm:text-base"
              >
                {isFa ? 'بررسی رایگان شرایط' : 'Free eligibility review'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isFa ? 'rotate-180' : ''}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>

              <a
                href={COMPANY_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${darkMode ? 'bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-300/20 hover:bg-emerald-500/22' : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-700/12 hover:bg-emerald-100'} inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-black shadow-[0_10px_30px_rgba(5,150,105,0.10)] transition sm:px-6`}
              >
                <MessageCircle size={18} aria-hidden="true" />
                {isFa ? 'ارتباط از طریق واتساپ' : 'Contact on WhatsApp'}
              </a>

              <a
                href="/blog/"
                className={`${darkMode ? 'border-white/15 bg-white/8 text-white hover:bg-white/12' : 'border-black/10 bg-white/70 text-neutral-900 hover:bg-white'} inline-flex items-center gap-2 rounded-full border px-5 py-3.5 text-sm font-black shadow-[0_10px_30px_rgba(7,26,61,0.08)] transition sm:px-6`}
              >
                {isFa ? 'راهنمای اقامت دانشجویی' : 'Student residence guide'}
              </a>
            </div>

            {/* Service highlights — a plain check-list, intentionally NOT styled
                as buttons so visitors don't mistake them for clickable links. */}
            <ul className="mt-5 flex max-w-xl flex-wrap items-center gap-x-3.5 gap-y-1.5" aria-label={isFa ? 'خدمات کلیدی آکا' : 'ACCA key services'}>
              {heroTrustItems.map((item) => (
                <li
                  key={item}
                  className={`${darkMode ? 'text-white/65' : 'text-neutral-600'} inline-flex select-none items-center gap-1.5 text-[12px] font-bold leading-5`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-emerald-600" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex items-center justify-center min-h-[150px] sm:min-h-[190px] lg:min-h-[520px] xl:min-h-[580px] w-full">
            <div className="hero-glow" />

            {/* Orbital decoration behind astronaut */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
              {/* outer ring */}
              <div className={`absolute rounded-full border-2 ${darkMode ? 'border-emerald-400/18' : 'border-emerald-600/14'}`} style={{ width: '46%', aspectRatio: '1', maxWidth: 272 }} />
              {/* inner ring */}
              <div className={`absolute rounded-full border-2 ${darkMode ? 'border-emerald-400/25' : 'border-emerald-600/20'}`} style={{ width: '29%', aspectRatio: '1', maxWidth: 168 }} />
              {/* green glow fill */}
              <div className={`absolute rounded-full ${darkMode ? 'bg-emerald-500/8' : 'bg-emerald-500/7'}`} style={{ width: '31%', aspectRatio: '1', maxWidth: 182 }} />

              {/* orbit dots */}
              <div className="absolute" style={{ width: '46%', aspectRatio: '1', maxWidth: 272 }}>
                <div className="absolute top-[10%] right-[8%] w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                <div className="absolute bottom-[18%] left-[6%] w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                <div className="absolute top-[48%] left-[2%] w-2.5 h-2.5 rounded-full bg-emerald-300/70" />
              </div>

              {/* sparkle stars */}
              <svg className="absolute" style={{ width: '52%', height: '52%', maxWidth: 304 }} viewBox="0 0 460 460" fill="none">
                <path d="M380 100 L383 93 L386 100 L393 103 L386 106 L383 113 L380 106 L373 103 Z" fill={darkMode ? '#34d399' : '#059669'} opacity="0.7"/>
                <path d="M60 320 L62 315 L64 320 L69 322 L64 324 L62 329 L60 324 L55 322 Z" fill={darkMode ? '#6ee7b7' : '#10b981'} opacity="0.55"/>
                <path d="M400 360 L402 355.5 L404 360 L408.5 362 L404 364 L402 368.5 L400 364 L395.5 362 Z" fill={darkMode ? '#a7f3d0' : '#059669'} opacity="0.45"/>
              </svg>
            </div>

            {isDesktopViewport ? (
              <div ref={astronautShellRef} className="hero-astronaut-shell relative z-10">
                <Suspense
                  fallback={(
                    <div className="hero-astronaut-loader" aria-hidden="true" />
                  )}
                >
                  <HeroAstronautScene
                    darkMode={darkMode}
                    config={astroConfig}
                    fallbackSrc={MOBILE_ASTRONAUT_SRC}
                    fallbackAlt={isFa ? 'راهنمای هوشمند آکا برای تحصیل در ترکیه' : 'ACCA EDU study in Turkey guide'}
                  />
                </Suspense>
              </div>
            ) : (
              <div className="hero-mobile-astronaut-wrap relative z-10 flex items-center justify-center">
                <Suspense
                  fallback={(
                    <img
                      src={MOBILE_ASTRONAUT_SRC}
                      srcSet="/assets/optimized/astronaut-384.webp 384w, /assets/optimized/astronaut-640.webp 640w"
                      sizes="(max-width: 480px) 78vw, 300px"
                      alt={isFa ? 'راهنمای هوشمند آکا برای تحصیل در ترکیه' : 'ACCA EDU study in Turkey guide'}
                      width="384"
                      height="384"
                      fetchPriority="high"
                      loading="eager"
                      decoding="async"
                      className="hero-mobile-astronaut"
                    />
                  )}
                >
                  <HeroAstronautScene
                    darkMode={darkMode}
                    config={astroConfig}
                    fallbackSrc={MOBILE_ASTRONAUT_SRC}
                    fallbackAlt={isFa ? 'راهنمای هوشمند آکا برای تحصیل در ترکیه' : 'ACCA EDU study in Turkey guide'}
                  />
                </Suspense>
              </div>
            )}

            {/* Game-style character customizer — popup button "near the astronaut" */}
            <button
              type="button"
              onClick={() => setCustomizerOpen(true)}
              aria-label={isFa ? 'شخصی‌سازی فضانورد' : 'Customize astronaut'}
              className={`${darkMode ? 'darkGlass text-white' : 'glass text-neutral-800'} absolute bottom-0 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-xs font-black shadow-[0_10px_30px_rgba(7,26,61,0.16)] transition hover:scale-[1.06] lg:bottom-2`}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <Palette className="h-3.5 w-3.5" aria-hidden="true" />
              {isFa ? 'شخصی‌سازی فضانورد' : 'Customize astronaut'}
            </button>
          </div>
        </div>

        {customizerOpen && (
          <Suspense fallback={null}>
            <AstronautCustomizerModal
              open={customizerOpen}
              onClose={() => setCustomizerOpen(false)}
              onSave={handleAstronautSave}
              config={astroConfig}
              darkMode={darkMode}
              isFa={isFa}
            />
          </Suspense>
        )}
      </section>
  );
}
