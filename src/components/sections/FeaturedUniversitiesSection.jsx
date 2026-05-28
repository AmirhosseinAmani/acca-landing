export default function FeaturedUniversitiesSection({ darkMode, isFa, universityCards }) {
  return (
<section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="mb-16 text-center">
          <div className={`${darkMode ? 'text-neutral-400' : 'text-neutral-500'} text-sm font-black tracking-[0.3em] uppercase mb-4`}>
            University Explorer
          </div>

          <h2 className="section-title text-5xl md:text-7xl font-black mb-8">
            {isFa ? 'دانشگاه‌های منتخب ACCA' : 'Featured Universities'}
          </h2>

          <p className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} max-w-3xl mx-auto text-lg leading-9 font-medium`}>
            {isFa ? 'بررسی دانشگاه‌های محبوب ترکیه براساس شهریه، تاییدیه و کیفیت آموزشی.' : 'Explore popular Turkish universities based on tuition, approvals, and educational quality.'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-28">
          {universityCards.map((uni, index) => (
            <div
              key={index}
              className={`${darkMode ? 'darkGlass' : 'glass'} rounded-[38px] p-8 hover:scale-[1.03] transition-all duration-500`}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-2xl font-black mb-2">
                    {uni.name}
                  </div>

                  <div className="text-emerald-400 font-bold">
                    {uni.ranking}
                  </div>
                </div>

                <div className="text-5xl">
                  🏛️
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} font-bold`}>
                    {isFa ? 'شهریه' : 'Tuition'}
                  </span>

                  <span className="font-black text-xl">
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
            </div>
          ))}
        </div>
      </section>
  );
}
