/**
 * Study-in-Turkey Roadmap.
 *
 * Consolidates what used to be two near-identical sections ("Registration
 * Process" + "Migration Blueprint") into ONE futuristic, Apple-UI styled board:
 *   - a glass "blueprint" panel (grid texture + corner glows + connector line),
 *   - four numbered step cards arranged as a connected flow on desktop and a
 *     vertical timeline on mobile,
 *   - each step carries its OWN call-to-action so visitors can move straight to
 *     what that step unlocks (consultation, universities, programs, residence).
 *
 * `registrationSteps` (from App.jsx) provides localized title/desc/icon plus
 * the per-step CTA (`ctaType: 'consult'` → opens the modal, otherwise an href).
 */
export default function RegistrationProcessSection({
  darkMode,
  isFa,
  registrationSteps,
  onConsultationClick,
}) {
  const panelStyle = {
    background: darkMode
      ? 'linear-gradient(135deg, rgba(12,18,32,0.82), rgba(20,28,48,0.55))'
      : 'linear-gradient(135deg, rgba(255,248,240,0.94), rgba(244,236,224,0.72))',
    border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
  };

  const gridStyle = {
    backgroundImage: darkMode
      ? 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)'
      : 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
    backgroundSize: '42px 42px',
  };

  return (
    <section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
      <div className="mb-14 text-center">
        <div className={`${darkMode ? 'text-neutral-400' : 'text-neutral-500'} text-sm font-black tracking-[0.3em] uppercase mb-4`}>
          Your Roadmap
        </div>

        <h2 className="section-title text-4xl md:text-6xl font-black mb-6">
          {isFa ? 'مسیر تحصیل در ترکیه' : 'Your Study-in-Turkey Roadmap'}
        </h2>

        <p className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} max-w-3xl mx-auto text-lg leading-9 font-semibold`}>
          {isFa
            ? 'از اولین مشاوره تا اقامت دانشجویی؛ هر مرحله یک قدم روشن با اقدام مشخص است تا دقیقاً بدانید بعد از این چه کاری انجام دهید.'
            : 'From the first consultation to student residence — every stage is one clear step with a defined action, so you always know exactly what to do next.'}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[34px] lg:rounded-[48px]" style={panelStyle}>
        <div className="absolute inset-0" style={gridStyle} aria-hidden="true" />

        {/* Corner glows for the futuristic depth */}
        <div className={`pointer-events-none absolute -top-24 ${isFa ? '-left-24' : '-right-24'} h-64 w-64 rounded-full blur-3xl ${darkMode ? 'bg-emerald-400/14' : 'bg-emerald-400/12'}`} aria-hidden="true" />
        <div className={`pointer-events-none absolute -bottom-24 ${isFa ? '-right-24' : '-left-24'} h-64 w-64 rounded-full blur-3xl ${darkMode ? 'bg-indigo-400/12' : 'bg-indigo-400/10'}`} aria-hidden="true" />

        {/* Connector flow line behind the node row (desktop only) */}
        <div className="pointer-events-none absolute inset-x-16 top-[118px] hidden lg:block" aria-hidden="true">
          <div className="h-[3px] w-full rounded-full bg-gradient-to-r from-emerald-400/10 via-emerald-400/55 to-indigo-400/30" />
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-6 p-5 sm:p-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-5 lg:p-12">
          {registrationSteps.map((step, index) => (
            <RoadmapStepCard
              key={step.title}
              step={step}
              index={index}
              isFa={isFa}
              darkMode={darkMode}
              onConsultationClick={onConsultationClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function RoadmapStepCard({ step, index, isFa, darkMode, onConsultationClick }) {
  return (
    <div
      className={`${darkMode ? 'darkGlass' : 'glass'} group relative flex flex-col rounded-[30px] p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(0,0,0,0.16)]`}
    >
      {/* Numbered node — the connector line passes through this row */}
      <div className="mb-6 flex items-center justify-between">
        <div className="relative">
          <div
            className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg font-black text-white shadow-[0_10px_30px_rgba(16,185,129,0.45)]`}
          >
            {index + 1}
          </div>
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-emerald-300/40 transition-transform duration-500 group-hover:scale-110" />
        </div>

        <div className="text-4xl leading-none">{step.icon}</div>
      </div>

      <h3 className="mb-3 text-xl font-black leading-tight">{step.title}</h3>

      <p className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} mb-7 text-sm font-medium leading-7`}>
        {step.desc}
      </p>

      {/* Per-step CTA, pinned to the bottom */}
      <div className="mt-auto">
        <StepCta step={step} isFa={isFa} darkMode={darkMode} onConsultationClick={onConsultationClick} />
      </div>
    </div>
  );
}

function StepCta({ step, isFa, darkMode, onConsultationClick }) {
  const className = `inline-flex w-full items-center justify-between gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-all duration-300 ${
    step.ctaType === 'consult'
      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_10px_30px_rgba(5,150,105,0.32)]'
      : darkMode
        ? 'border border-white/12 bg-white/8 text-white hover:bg-white/14'
        : 'border border-black/10 bg-white/70 text-neutral-900 hover:bg-white'
  }`;

  const arrow = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${isFa ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'} transition-transform duration-300`}
      aria-hidden="true"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );

  if (step.ctaType === 'consult') {
    return (
      <button type="button" onClick={onConsultationClick} className={className}>
        <span>{step.ctaLabel}</span>
        {arrow}
      </button>
    );
  }

  return (
    <a href={step.ctaHref} className={className}>
      <span>{step.ctaLabel}</span>
      {arrow}
    </a>
  );
}
