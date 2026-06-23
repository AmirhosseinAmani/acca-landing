export default function FeaturedUniversitiesSection({ darkMode, isFa, universityCards }) {
  return (
<section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="mb-10 text-center">
          <div className={`${darkMode ? 'text-neutral-400' : 'text-neutral-500'} text-xs font-black tracking-[0.22em] uppercase mb-3 sm:text-sm`}>
            University Explorer
          </div>

          <h2 className="section-title text-4xl md:text-6xl font-black mb-5">
            {isFa ? 'دانشگاه‌های منتخب ACCA' : 'Featured Universities'}
          </h2>

          <p className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} max-w-3xl mx-auto text-base leading-7 font-semibold`}>
            {isFa ? 'بررسی دانشگاه‌های محبوب ترکیه براساس شهریه، تاییدیه و کیفیت آموزشی.' : 'Explore popular Turkish universities based on tuition, approvals, and educational quality.'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {universityCards.map((uni) => (
            <a
              key={uni.name}
              href={uni.href || '/universities/'}
              className={`${darkMode ? 'darkGlass' : 'glass'} group block rounded-[28px] p-6 transition-all duration-500 hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/55`}
              aria-label={`${isFa ? 'مشاهده پروفایل' : 'View profile'} ${uni.name}`}
            >
              <div className="flex items-center justify-between mb-5 gap-4">
                <div>
                  <div className="text-xl font-black mb-1">
                    {uni.name}
                  </div>

                  <div className="text-sm text-emerald-400 font-bold">
                    {uni.ranking}
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-white/10 border-white/10' : 'bg-white/85 border-black/10'} flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] border p-2.5`}>
                  {uni.logo ? (
                    <img
                      src={uni.logo}
                      alt={`${uni.name} logo`}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-2xl font-black">
                      {uni.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <p className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} mb-5 text-sm font-medium leading-6`}>
                {uni.description}
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} font-bold`}>
                    {isFa ? 'شهریه' : 'Tuition'}
                  </span>

                  <span className="font-black text-lg">
                    {uni.tuition}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} font-bold`}>
                    {isFa ? 'وضعیت تایید' : 'Approval'}
                  </span>

                  <span className="text-emerald-400 font-black">
                    {uni.ministry}
                  </span>
                </div>
              </div>

              {/* Click affordance — makes it obvious the whole card is a link */}
              <div className={`${darkMode ? 'border-white/10 text-emerald-300' : 'border-black/10 text-emerald-700'} mt-6 flex items-center justify-between gap-3 border-t pt-4 text-sm font-black`}>
                <span>{isFa ? 'مشاهده پروفایل دانشگاه' : 'View university profile'}</span>
                <span className={`${darkMode ? 'bg-emerald-400/15' : 'bg-emerald-600/12'} ${isFa ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'} inline-flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={isFa ? 'rotate-180' : ''} aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
  );
}
