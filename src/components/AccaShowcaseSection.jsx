import { useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useSpring } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const persianFontStyle = {
  fontFamily: "Vazirmatn, sans-serif",
  fontWeight: 900,
};

// Ordered so C3 is front/center (shown first); the closer to C3 by number,
// the nearer it sits in the carousel ring (C2/C4 flank it, C1/C5 at the back).
const showcaseSlides = [
  {
    titleFa: "نمونه‌کار آکا ادو — مرکزی",
    titleEn: "ACCA EDU showcase — featured",
    image: "/assets/optimized/showcase-c3.webp",
  },
  {
    titleFa: "نمونه‌کار آکا ادو",
    titleEn: "ACCA EDU showcase",
    image: "/assets/optimized/showcase-c4.webp",
  },
  {
    titleFa: "نمونه‌کار آکا ادو",
    titleEn: "ACCA EDU showcase",
    image: "/assets/optimized/showcase-c5.webp",
  },
  {
    titleFa: "نمونه‌کار آکا ادو",
    titleEn: "ACCA EDU showcase",
    image: "/assets/optimized/showcase-c1.webp",
  },
  {
    titleFa: "نمونه‌کار آکا ادو",
    titleEn: "ACCA EDU showcase",
    image: "/assets/optimized/showcase-c2.webp",
  },
];

function getNormalizedIndex(index, length) {
  return ((index % length) + length) % length;
}

function getClosestSlideIndex(rotation, stepAngle, length) {
  return getNormalizedIndex(Math.round(-rotation / stepAngle), length);
}

function SlideCard({ slide, isFa, darkMode, mobile = false, active = false }) {
  const title = isFa ? slide.titleFa : slide.titleEn;

  return (
    <motion.div
      whileHover={mobile ? undefined : { scale: 1.045, y: -10 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      style={mobile ? { aspectRatio: "9 / 16" } : undefined}
      className={`relative overflow-hidden rounded-[34px] border ${mobile ? 'backdrop-blur-md' : 'backdrop-blur-3xl'} ${
        darkMode
          ? "border-white/10 bg-white/[0.075] shadow-2xl shadow-black/35"
          : "border-white/70 bg-white/45 shadow-2xl shadow-black/10"
      } ${mobile ? "w-full max-w-[320px] min-h-[520px]" : "h-[520px] w-[290px]"}`}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${slide.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(24px) brightness(0.42)",
          transform: "scale(1.14)",
          opacity: 0.95,
        }}
      />

      <img
        draggable={false}
        src={slide.image}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />

      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 rounded-[34px] bg-[linear-gradient(135deg,rgba(255,255,255,0.13),transparent_44%,rgba(255,255,255,0.04))]" />

      {active && (
        <div className="absolute inset-0 rounded-[34px] ring-2 ring-[#E7C77D]/75 shadow-[0_0_70px_rgba(231,199,125,0.24)]" />
      )}
    </motion.div>
  );
}

export default function AccaShowcaseSection({ darkMode = false, isFa = true }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const rotationValue = useMotionValue(0);
  const smoothRotation = useSpring(rotationValue, {
    stiffness: 120,
    damping: 24,
    mass: 0.9,
  });

  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);
  const latestRotation = useRef(0);
  const dragVelocity = useRef(0);
  const lastDragX = useRef(0);
  const lastDragTime = useRef(0);

  const active = showcaseSlides[activeSlide];
  const stepAngle = useMemo(() => 360 / showcaseSlides.length, []);
  const radius = 360;

  const setCarouselRotation = (value, immediate = false) => {
    latestRotation.current = value;

    if (immediate) {
      rotationValue.set(value);
      return;
    }

    animate(rotationValue, value, {
      type: "spring",
      stiffness: 120,
      damping: 24,
      mass: 0.9,
    });
  };

  const goToSlide = (index) => {
    const normalizedIndex = getNormalizedIndex(index, showcaseSlides.length);
    setActiveSlide(normalizedIndex);
    setCarouselRotation(-(normalizedIndex * stepAngle));
  };

  const nextSlide = () => goToSlide(activeSlide + 1);
  const prevSlide = () => goToSlide(activeSlide - 1);

  const handleDesktopPointerDown = (event) => {
    isDragging.current = true;
    hasDragged.current = false;
    dragStartX.current = event.clientX;
    dragStartRotation.current = latestRotation.current;
    lastDragX.current = event.clientX;
    lastDragTime.current = event.timeStamp;
    dragVelocity.current = 0;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleDesktopPointerMove = (event) => {
    if (!isDragging.current) return;

    const delta = event.clientX - dragStartX.current;
    if (Math.abs(delta) > 4) hasDragged.current = true;

    const now = event.timeStamp;
    const timeDelta = Math.max(now - lastDragTime.current, 16);
    dragVelocity.current = (event.clientX - lastDragX.current) / timeDelta;
    lastDragX.current = event.clientX;
    lastDragTime.current = now;

    const nextRotation = dragStartRotation.current + delta * 0.28;
    setCarouselRotation(nextRotation, true);
  };

  const handleDesktopPointerUp = (event) => {
    if (!isDragging.current) return;

    isDragging.current = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    const projectedRotation = latestRotation.current + dragVelocity.current * 120;
    const closestIndex = getClosestSlideIndex(projectedRotation, stepAngle, showcaseSlides.length);
    goToSlide(closestIndex);
  };

  const handleCardClick = (index) => {
    if (hasDragged.current) return;
    goToSlide(index);
  };

  const handleMobileDragEnd = (_, info) => {
    if (info.offset.x < -60) {
      isFa ? prevSlide() : nextSlide();
      return;
    }

    if (info.offset.x > 60) {
      isFa ? nextSlide() : prevSlide();
    }
  };

  return (
    <section
      dir={isFa ? "rtl" : "ltr"}
      style={isFa ? persianFontStyle : undefined}
      className={`relative overflow-hidden px-4 pb-24 pt-12 transition-all duration-700 sm:px-6 lg:px-10 ${
        darkMode ? "text-white" : "text-[#1f1f1f]"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: darkMode
              ? "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.035) 36%, rgba(52,211,153,0.045) 62%, transparent 100%)"
              : "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.26) 38%, rgba(231,199,125,0.08) 62%, transparent 100%)",
          }}
        />
        <div
          className={`absolute right-[-18%] top-[12%] h-[360px] w-[360px] rounded-full blur-2xl lg:blur-3xl ${
            darkMode ? "bg-emerald-400/10" : "bg-white/28"
          }`}
        />
        <div
          className={`absolute bottom-[8%] left-[-18%] h-[340px] w-[340px] rounded-full blur-2xl lg:blur-3xl ${
            darkMode ? "bg-[#C6A77D]/10" : "bg-[#C6A77D]/10"
          }`}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div
            className={`${
              darkMode ? "text-neutral-400" : "text-neutral-500"
            } mb-4 text-sm font-black uppercase tracking-[0.3em]`}
          >
            ACCA Showcase
          </div>

          <h2
            style={isFa ? persianFontStyle : undefined}
            className="text-balance text-[clamp(2.25rem,7vw,3.75rem)] font-black leading-[1.05] tracking-[-0.035em]"
          >
            {isFa ? "اسلایدشوهای شرکت آکا" : "ACCA Showcase Slides"}
          </h2>
        </div>

        <div className="lg:hidden">
          <div className="relative mx-auto flex max-w-[340px] justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                className="flex w-full justify-center"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={handleMobileDragEnd}
                initial={{ opacity: 0, x: isFa ? -24 : 24, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: isFa ? 24 : -24, scale: 0.98 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <SlideCard slide={active} isFa={isFa} darkMode={darkMode} mobile active />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div
          className="relative hidden h-[700px] cursor-grab select-none items-center justify-center active:cursor-grabbing lg:flex"
          style={{ perspective: "1800px" }}
          onPointerDown={handleDesktopPointerDown}
          onPointerMove={handleDesktopPointerMove}
          onPointerUp={handleDesktopPointerUp}
          onPointerCancel={handleDesktopPointerUp}
          onPointerLeave={handleDesktopPointerUp}
        >
          <motion.div
            className="relative h-[620px] w-full"
            style={{ transformStyle: "preserve-3d", rotateY: smoothRotation }}
          >
            {showcaseSlides.map((slide, index) => {
              const angle = index * stepAngle;

              return (
                <div
                  key={`${slide.titleEn}-${index}`}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`,
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                  }}
                  onClick={() => handleCardClick(index)}
                >
                  <SlideCard
                    slide={slide}
                    isFa={isFa}
                    darkMode={darkMode}
                    active={activeSlide === index}
                  />
                </div>
              );
            })}
          </motion.div>
        </div>

        <div className="mt-7 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={isFa ? nextSlide : prevSlide}
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full border transition hover:scale-105 ${
              darkMode ? "border-white/10 bg-white/10" : "border-black/5 bg-white/50"
            }`}
            aria-label="Previous slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            {showcaseSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  activeSlide === index
                    ? "w-10 bg-[#E7C77D]"
                    : darkMode
                      ? "w-2 bg-white/25"
                      : "w-2 bg-black/20"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={isFa ? prevSlide : nextSlide}
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full border transition hover:scale-105 ${
              darkMode ? "border-white/10 bg-white/10" : "border-black/5 bg-white/50"
            }`}
            aria-label="Next slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
