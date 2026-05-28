import { useEffect, useRef, useState } from 'react';

const PLUS_INITIAL = [
  { x: 420, y: 620 },
  { x: 380, y: 780 },
  { x: 360, y: 840 },
];

function DraggablePlus({ darkMode, initialX, initialY, boardRef }) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const dragRef = useRef(null);

  useEffect(() => {
    function onMouseMove(e) {
      if (!dragRef.current || !boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      setPos({
        x: e.clientX - rect.left - dragRef.current.offsetX,
        y: e.clientY - rect.top - dragRef.current.offsetY,
      });
    }

    function onMouseUp() {
      dragRef.current = null;
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [boardRef]);

  function onMouseDown(e) {
    e.preventDefault();
    const el = e.currentTarget;
    dragRef.current = {
      offsetX: e.clientX - el.getBoundingClientRect().left - el.offsetWidth / 2,
      offsetY: e.clientY - el.getBoundingClientRect().top - el.offsetHeight / 2,
    };
  }

  return (
    <div
      onMouseDown={onMouseDown}
      className="absolute select-none cursor-grab active:cursor-grabbing"
      style={{ left: pos.x, top: pos.y, transform: 'translate(-50%,-50%)' }}
    >
      <span
        className={`text-5xl font-black leading-none ${darkMode ? 'text-white/28' : 'text-black/22'} hover:opacity-70 transition-opacity duration-200`}
        style={{ display: 'block', lineHeight: 1 }}
      >
        +
      </span>
    </div>
  );
}

const roadmapSteps = [
  {
    icon: "📌",
    titleFa: "مشاوره اولیه",
    titleEn: "Initial Consultation",
    descFa:
      "بررسی شرایط مالی، هدف تحصیلی و انتخاب مسیر مناسب مهاجرت.",
    descEn:
      "Reviewing financial conditions, academic goals, and choosing the best migration pathway.",
    desktopClass: "top-[90px] right-[120px] w-[260px] rotate-[-3deg]",
  },
  {
    icon: "🎯",
    titleFa: "انتخاب دانشگاه",
    titleEn: "University Selection",
    descFa:
      "انتخاب دانشگاه براساس آینده شغلی، تاییدیه‌ها و بودجه دانشجو.",
    descEn:
      "Selecting universities based on career opportunities, approvals, and student budget.",
    desktopClass: "top-[280px] right-[470px] w-[280px] rotate-[2deg]",
  },
  {
    icon: "📝",
    titleFa: "اخذ پذیرش",
    titleEn: "Admission Process",
    descFa:
      "ترجمه مدارک، ارسال پرونده و دریافت پذیرش رسمی دانشگاه.",
    descEn:
      "Document translation, file submission, and receiving official university admission.",
    desktopClass: "top-[500px] right-[120px] w-[280px] rotate-[-2deg]",
  },
  {
    icon: "✈️",
    titleFa: "ورود و شروع دانشگاه",
    titleEn: "Arrival & University Start",
    descFa:
      "انجام اقامت، اسکان و شروع رسمی زندگی دانشجویی در ترکیه.",
    descEn:
      "Residence setup, accommodation, and officially starting student life in Turkey.",
    desktopClass: "top-[360px] left-[120px] w-[300px] rotate-[1deg]",
  },
];

export default function MigrationBlueprintSection({ darkMode, isFa }) {
  const boardRef = useRef(null);
  const panelStyle = {
    background: darkMode
      ? "linear-gradient(135deg, rgba(12,18,32,0.82), rgba(20,28,48,0.58))"
      : "linear-gradient(135deg, rgba(255,248,240,0.92), rgba(244,236,224,0.72))",
    border: darkMode
      ? "1px solid rgba(255,255,255,0.06)"
      : "1px solid rgba(0,0,0,0.04)",
  };

  const gridStyle = {
    backgroundImage: darkMode
      ? "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)"
      : "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
    backgroundSize: "42px 42px",
  };

  return (
    <section className="max-w-7xl mx-auto px-6 pb-32 relative z-10">
      <div className="mb-20 text-center">
        <div
          className={`${
            darkMode ? "text-neutral-400" : "text-neutral-500"
          } text-sm font-black tracking-[0.3em] uppercase mb-4`}
        >
          Migration Blueprint
        </div>

        <h2 className="section-title text-5xl md:text-7xl font-black mb-8">
          {isFa
            ? "نقشه مهاجرت تحصیلی"
            : "Educational Migration Roadmap"}
        </h2>

        <p
          className={`${
            darkMode ? "text-neutral-300" : "text-neutral-700"
          } max-w-3xl mx-auto text-lg leading-9 font-medium`}
        >
          {isFa
            ? "مسیر مهاجرت تحصیلی به‌صورت یک برد استراتژیک و نقشه عملیاتی طراحی شده تا دانشجو دقیقاً بداند در هر مرحله چه اتفاقی می‌افتد."
            : "The educational migration process is designed as a strategic board and operational roadmap so students clearly understand every step ahead."}
        </p>
      </div>

      <div ref={boardRef} className="relative overflow-hidden rounded-[34px] lg:rounded-[48px]" style={panelStyle}>
        <div className="absolute inset-0" style={gridStyle} />

        <svg
          className="absolute inset-0 hidden h-full w-full lg:block"
          viewBox="0 0 1400 920"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="boardPathMigration" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={darkMode ? "#7dd3fc" : "#7c3aed"} />
              <stop offset="50%" stopColor={darkMode ? "#c084fc" : "#ec4899"} />
              <stop offset="100%" stopColor={darkMode ? "#67e8f9" : "#6366f1"} />
            </linearGradient>
          </defs>

          <path
            d="M1120 170 C980 190 870 240 760 320"
            stroke="url(#boardPathMigration)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="14 16"
            opacity="0.9"
          />

          <path
            d="M720 390 C590 450 470 500 340 560"
            stroke="url(#boardPathMigration)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="14 16"
            opacity="0.9"
          />

          <path
            d="M350 640 C480 700 650 720 860 720"
            stroke="url(#boardPathMigration)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="14 16"
            opacity="0.9"
          />
        </svg>

        <div className="relative z-10 lg:min-h-[920px]">
          <div className="lg:hidden px-4 py-6 sm:px-6 sm:py-8">
            <div
              className={`absolute top-12 bottom-12 ${
                isFa ? "right-8" : "left-8"
              } border-l-2 border-dashed ${
                darkMode ? "border-white/20" : "border-black/15"
              }`}
            />

            <div className="space-y-5">
              {roadmapSteps.map((step, index) => (
                <div
                  key={step.titleEn}
                  className={`relative ${isFa ? "pr-12" : "pl-12"}`}
                >
                  <div
                    className={`absolute top-7 ${
                      isFa ? "right-0" : "left-0"
                    } flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black ${
                      darkMode
                        ? "border-white/15 bg-white/10 text-white"
                        : "border-black/10 bg-white/70 text-neutral-900"
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div
                    className={`${
                      darkMode ? "darkGlass" : "glass"
                    } rounded-[28px] p-6 shadow-xl transition-all duration-500`}
                  >
                    <div className="mb-4 text-4xl">{step.icon}</div>
                    <h3 className="mb-3 text-xl font-black leading-tight">
                      {isFa ? step.titleFa : step.titleEn}
                    </h3>
                    <p
                      className={`${
                        darkMode ? "text-neutral-300" : "text-neutral-700"
                      } text-sm font-medium leading-7`}
                    >
                      {isFa ? step.descFa : step.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            {roadmapSteps.map((step) => (
              <div
                key={step.titleEn}
                className={`${
                  darkMode ? "darkGlass" : "glass"
                } absolute ${step.desktopClass} rounded-[34px] p-8 hover:scale-[1.03] transition-all duration-500`}
              >
                <div className="text-5xl mb-5">{step.icon}</div>
                <h3 className="text-2xl font-black mb-4">
                  {isFa ? step.titleFa : step.titleEn}
                </h3>
                <p
                  className={`${
                    darkMode ? "text-neutral-300" : "text-neutral-700"
                  } leading-8 font-medium`}
                >
                  {isFa ? step.descFa : step.descEn}
                </p>
              </div>
            ))}

            {PLUS_INITIAL.map((init, i) => (
              <DraggablePlus
                key={i}
                darkMode={darkMode}
                initialX={init.x}
                initialY={init.y}
                boardRef={boardRef}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
