export default function StatsSection({ darkMode, isFa }) {
  return (
<section className="max-w-7xl mx-auto px-6 pb-32 relative z-10">
        <div className="mb-16 text-center">
          <div className={`${darkMode ? 'text-neutral-400' : 'text-neutral-500'} text-sm font-black tracking-[0.3em] uppercase mb-4`}>
            ACCA Statistics
          </div>

          <h2 className="section-title text-5xl md:text-7xl font-black mb-8">
            {isFa ? 'آمار و اعتبار شرکت' : 'Company Statistics'}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
              className={`${darkMode ? 'darkGlass' : 'glass'} stats-card rounded-[36px] p-10 text-center`}
            >
              <div className="text-6xl font-black mb-4">
                {item[0]}
              </div>

              <div className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} text-lg font-bold`}>
                {item[1]}
              </div>
            </div>
          ))}
        </div>
      </section>
  );
}
