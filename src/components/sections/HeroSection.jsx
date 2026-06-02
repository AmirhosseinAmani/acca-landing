import { useEffect, useRef } from 'react';

const MOBILE_ASTRONAUT_SRC =
  'https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/a/astronaut.png';

/**
 * HeroSection owns its own scroll tracking so the parent App never re-renders
 * on scroll.  The model-viewer transform is applied via direct DOM mutation.
 */
export default function HeroSection({ darkMode, isFa, isDesktopViewport, MODEL_SRC, onConsultationClick }) {
  const modelViewerRef = useRef(null);

  useEffect(() => {
    if (!isDesktopViewport) return undefined;

    let rAF = 0;

    const update = () => {
      const curr = window.scrollY;
      rAF = 0;

      const el = modelViewerRef.current;
      if (!el) return;
      el.style.transform = `translate3d(0px,${curr * 0.015}px,0px) scale(1.04) rotate(${curr * 0.004}deg)`;
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
<section className="min-h-[72svh] lg:min-h-[58vh] flex items-start lg:items-center px-5 sm:px-6 pt-[108px] pb-6 sm:pt-[112px] md:pt-[120px] lg:pt-6 lg:pb-0 relative z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6 lg:gap-16 items-center w-full">
          <div className="relative z-10 max-w-xl lg:max-w-none">
            <div className={`${darkMode ? 'darkGlass text-white' : 'glass text-neutral-700'} inline-flex items-center gap-3 px-5 py-3 rounded-full mb-8 text-sm font-bold`}>
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              {isFa ? 'مشاوره تحصیلی و پذیرش بین‌المللی' : 'International Educational Consulting'}
            </div>

            <h1 className={`hero-title text-[clamp(3rem,16vw,4.25rem)] md:text-[6rem] font-black ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              {isFa ? 'تحصیل.' : 'Study.'}
              <br />
              {isFa ? 'انتقالی.' : 'Transfer.'}
              <br />
              {isFa ? 'آینده.' : 'Future.'}
            </h1>

            <p className={`mt-6 lg:mt-8 text-base lg:text-lg leading-8 max-w-xl font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              {isFa ? 'تجربه‌ای مدرن از مشاوره تحصیلی، انتقالی پزشکی و مسیر بین‌المللی دانشجویان در ترکیه و اروپا.' : 'A modern experience in educational consulting, medical transfer, and international student pathways in Turkey and Europe.'}
            </p>

            <button
              type="button"
              onClick={onConsultationClick}
              className="mt-8 lg:mt-10 inline-flex items-center gap-3 bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-4 rounded-full text-base font-black transition-all duration-300 hover:scale-[1.04] shadow-[0_8px_32px_rgba(5,150,105,0.35)]"
            >
              {isFa ? 'شروع مشاوره' : 'Start Consultation'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isFa ? 'rotate-180' : ''}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <div className="relative flex items-center justify-center min-h-[170px] sm:min-h-[220px] lg:min-h-[600px] xl:min-h-[660px] w-full">
            <div className="hero-glow" />

            {/* Orbital decoration behind astronaut */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
              {/* outer ring */}
              <div className={`absolute rounded-full border-2 ${darkMode ? 'border-emerald-400/18' : 'border-emerald-600/14'}`} style={{ width: '72%', aspectRatio: '1', maxWidth: 420 }} />
              {/* inner ring */}
              <div className={`absolute rounded-full border-2 ${darkMode ? 'border-emerald-400/25' : 'border-emerald-600/20'}`} style={{ width: '46%', aspectRatio: '1', maxWidth: 270 }} />
              {/* green glow fill */}
              <div className={`absolute rounded-full ${darkMode ? 'bg-emerald-500/8' : 'bg-emerald-500/7'}`} style={{ width: '50%', aspectRatio: '1', maxWidth: 290 }} />

              {/* orbit dots */}
              <div className="absolute" style={{ width: '72%', aspectRatio: '1', maxWidth: 420 }}>
                <div className="absolute top-[10%] right-[8%] w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                <div className="absolute bottom-[18%] left-[6%] w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                <div className="absolute top-[48%] left-[2%] w-2.5 h-2.5 rounded-full bg-emerald-300/70" />
              </div>

              {/* sparkle stars */}
              <svg className="absolute" style={{ width: '80%', height: '80%', maxWidth: 460 }} viewBox="0 0 460 460" fill="none">
                <path d="M380 100 L383 93 L386 100 L393 103 L386 106 L383 113 L380 106 L373 103 Z" fill={darkMode ? '#34d399' : '#059669'} opacity="0.7"/>
                <path d="M60 320 L62 315 L64 320 L69 322 L64 324 L62 329 L60 324 L55 322 Z" fill={darkMode ? '#6ee7b7' : '#10b981'} opacity="0.55"/>
                <path d="M400 360 L402 355.5 L404 360 L408.5 362 L404 364 L402 368.5 L400 364 L395.5 362 Z" fill={darkMode ? '#a7f3d0' : '#059669'} opacity="0.45"/>
              </svg>
            </div>

            {isDesktopViewport ? (
              <model-viewer
                ref={modelViewerRef}
                reveal="auto"
                loading="eager"
                interaction-prompt="none"
                seamless-poster
                tone-mapping="aces"
                environment-image="neutral"
                interpolation-decay="120"
                max-camera-orbit="auto 95deg auto"
                min-camera-orbit="auto 45deg auto"
                render-scale="1"
                src={MODEL_SRC}
                auto-rotate
                camera-controls
                camera-orbit="0deg 78deg 128%"
                field-of-view="19deg"
                disable-zoom
                exposure="0.9"
                shadow-intensity="0"
                className="hero-image relative z-10 lg:mt-32"
                style={{ background: 'transparent' }}
              />
            ) : (
              <div className="hero-mobile-astronaut-wrap relative z-10 flex items-center justify-center">
                <img
                  src={MOBILE_ASTRONAUT_SRC}
                  alt="ACCA EDU astronaut"
                  width="320"
                  height="320"
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  className="hero-mobile-astronaut"
                />
              </div>
            )}
          </div>
        </div>
      </section>
  );
}
