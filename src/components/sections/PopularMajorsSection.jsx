export default function PopularMajorsSection({ darkMode, isFa, majors }) {
  return (
<section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="mb-10 text-center">
          <div className={`${darkMode ? 'text-neutral-400' : 'text-neutral-500'} text-xs font-black tracking-[0.22em] uppercase mb-3 sm:text-sm`}>
            Popular Majors
          </div>

          <h2 className="section-title text-4xl md:text-6xl font-black mb-5">
            {isFa ? 'معرفی رشته‌های محبوب' : 'Popular Majors'}
          </h2>

          <p className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} max-w-3xl mx-auto text-base leading-7 font-semibold`}>
            {isFa ? 'مقایسه رشته‌های محبوب مهندسی و علوم سلامت براساس مدت تحصیل، سختی مسیر آموزشی و آینده شغلی.' : 'Compare popular engineering and healthcare majors based on study duration, academic difficulty, and career potential.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {majors.map((major, index) => {
            const href = createProgramFilterHref(major.programFilters);

            return (
            <a
              key={index}
              href={href}
              aria-label={`${isFa ? 'مشاهده رشته' : 'View program'} ${major.title}`}
              className={`${darkMode ? 'darkGlass' : 'glass'} block rounded-[28px] p-6 relative overflow-hidden group transition-all duration-500 hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/55`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${major.color} opacity-70`} />

              <div className="absolute top-0 left-0 w-52 h-52 bg-white/10 rounded-full blur-3xl opacity-70" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="text-5xl leading-none">
                    {major.icon}
                  </div>

                  <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xl text-xs font-black">
                    {major.category}
                  </div>
                </div>

                <h3 className="text-2xl font-black mb-5 leading-tight">
                  {major.title}
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} font-bold`}>
                      {isFa ? 'مدت تحصیل' : 'Study Duration'}
                    </span>

                    <span className="text-xl font-black">
                      {major.duration}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} font-bold`}>
                      {isFa ? 'سختی رشته' : 'Difficulty'}
                    </span>

                    <span className="text-lg font-black">
                      {major.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} font-bold`}>
                      {isFa ? 'آینده شغلی' : 'Career Outlook'}
                    </span>

                    <span className="text-lg font-black text-emerald-400">
                      {major.quality}
                    </span>
                  </div>
                </div>

                {/* Click affordance — makes it obvious the whole card is a link */}
                <div className={`${darkMode ? 'border-white/10 text-emerald-300' : 'border-black/10 text-emerald-700'} mt-6 flex items-center justify-between gap-3 border-t pt-4 text-sm font-black`}>
                  <span>{isFa ? 'مشاهده رشته و شهریه‌ها' : 'View programs & tuition'}</span>
                  <span className={`${darkMode ? 'bg-emerald-400/15' : 'bg-emerald-600/12'} ${isFa ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'} inline-flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={isFa ? 'rotate-180' : ''} aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </a>
          );
          })}
        </div>
      </section>
  );
}

function createProgramFilterHref(programFilters = []) {
  const params = new URLSearchParams({ page: 'programs' });

  programFilters.forEach((program) => {
    params.append('program', program);
  });

  return `?${params.toString()}`;
}
