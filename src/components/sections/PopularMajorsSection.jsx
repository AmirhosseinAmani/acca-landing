export default function PopularMajorsSection({ darkMode, isFa, majors }) {
  return (
<section className="max-w-7xl mx-auto px-6 pb-32 relative z-10">
        <div className="mb-16 text-center">
          <div className={`${darkMode ? 'text-neutral-400' : 'text-neutral-500'} text-sm font-black tracking-[0.3em] uppercase mb-4`}>
            Popular Majors
          </div>

          <h2 className="section-title text-5xl md:text-7xl font-black mb-8">
            {isFa ? 'معرفی رشته‌های محبوب' : 'Popular Majors'}
          </h2>

          <p className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} max-w-3xl mx-auto text-lg leading-9 font-medium`}>
            {isFa ? 'مقایسه رشته‌های محبوب مهندسی و علوم سلامت براساس مدت تحصیل، سختی مسیر آموزشی و آینده شغلی.' : 'Compare popular engineering and healthcare majors based on study duration, academic difficulty, and career potential.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {majors.map((major, index) => {
            const href = createProgramFilterHref(major.programFilters);

            return (
            <a
              key={index}
              href={href}
              aria-label={`${isFa ? 'مشاهده رشته' : 'View program'} ${major.title}`}
              className={`${darkMode ? 'darkGlass' : 'glass'} block rounded-[40px] p-8 relative overflow-hidden group transition-all duration-500 hover:scale-[1.03] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/55`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${major.color} opacity-70`} />

              <div className="absolute top-0 left-0 w-52 h-52 bg-white/10 rounded-full blur-3xl opacity-70" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-7xl leading-none">
                    {major.icon}
                  </div>

                  <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl text-sm font-black">
                    {major.category}
                  </div>
                </div>

                <h3 className="text-3xl font-black mb-8 leading-tight">
                  {major.title}
                </h3>

                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} font-bold`}>
                      {isFa ? 'مدت تحصیل' : 'Study Duration'}
                    </span>

                    <span className="text-xl font-black">
                      {major.duration}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
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
