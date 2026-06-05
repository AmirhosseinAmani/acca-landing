export default function StatsSection({ darkMode, isFa }) {
  return (
<section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="mb-10 text-center">
          <div className={`${darkMode ? 'text-neutral-400' : 'text-neutral-500'} text-xs font-black tracking-[0.22em] uppercase mb-3 sm:text-sm`}>
            ACCA Statistics
          </div>

          <h2 className="section-title text-4xl md:text-6xl font-black mb-5">
            {isFa ? 'آمار و اعتبار شرکت' : 'Company Statistics'}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            [
            '+1200',
            isFa ? 'دانشجوی بین‌المللی' : 'International Students',
          ],
          [
            '+40',
            isFa ? 'دانشگاه همکار' : 'Partner Universities',
          ],
          [
            '18',
            isFa ? 'کشور تحت پوشش' : 'Countries Covered',
          ],
          [
            '94%',
            isFa ? 'نرخ موفقیت پذیرش' : 'Admission Success Rate',
          ],
          ].map((item, index) => (
            <div
              key={index}
              className={`${darkMode ? 'darkGlass' : 'glass'} stats-card rounded-[28px] p-7 text-center`}
            >
              <div className="text-4xl font-black mb-3 md:text-5xl">
                {item[0]}
              </div>

              <div className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} text-sm font-bold md:text-base`}>
                {item[1]}
              </div>
            </div>
          ))}
        </div>
      </section>
  );
}
