export default function PartnerScholarshipSection({ darkMode, isFa, scholarshipComparison }) {
  return (
<section id="partners" className="max-w-7xl mx-auto px-6 pb-32 relative z-10">

      <div className="pb-28 pt-10">
        <div className="mb-20 text-center">
          <div className={`${darkMode ? 'text-neutral-400' : 'text-neutral-500'} text-sm font-black tracking-[0.3em] uppercase mb-4`}>
            B2B Partner Network
          </div>

          <h2 className="section-title text-5xl md:text-7xl font-black mb-8">
            {isFa ? 'شبکه همکاری بین‌المللی ACCA' : 'International Partner Ecosystem'}
          </h2>

          <p className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} max-w-4xl mx-auto text-lg leading-9 font-medium`}>
            {isFa
              ? 'ACCA تنها یک شرکت مشاوره تحصیلی نیست؛ بلکه یک زیرساخت عملیاتی بین‌المللی برای آژانس‌ها، دانشگاه‌ها، نمایندگان منطقه‌ای و شبکه‌های جذب دانشجو است.'
              : 'ACCA is not just an educational agency — it is an operational infrastructure connecting universities, agencies, regional representatives, and international student recruitment networks.'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-28">
          {[
            {
              icon: '🌍',
              title: isFa ? 'شبکه بین‌المللی' : 'Global Network',
              desc: isFa
                ? 'همکاری با آژانس‌ها و نمایندگان منطقه‌ای در ایران، ترکیه و کشورهای اروپایی.'
                : 'Partnerships with agencies and regional representatives across Turkey, Iran, and Europe.',
            },
            {
              icon: '🏛️',
              title: isFa ? 'همکاری دانشگاهی' : 'University Partnerships',
              desc: isFa
                ? 'اتصال مستقیم به دانشگاه‌های خصوصی معتبر استانبول و سیستم پذیرش سریع.'
                : 'Direct integration with Istanbul private universities and fast-track admission systems.',
            },
            {
              icon: '⚡',
              title: isFa ? 'زیرساخت عملیاتی' : 'Operational Infrastructure',
              desc: isFa
                ? 'پشتیبانی کامل فرآیند پذیرش، انتقالی، اقامت و خدمات دانشجویی.'
                : 'Complete operational support for admission, transfer, residence, and student services.',
            },
          ].map((item, index) => (
            <div
              key={index}
              className={`${darkMode ? 'darkGlass' : 'glass'} rounded-[40px] p-10 relative overflow-hidden hover:scale-[1.03] transition-all duration-500`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />

              <div className="relative z-10">
                <div className="text-6xl mb-8">{item.icon}</div>

                <h3 className="text-3xl font-black mb-6 leading-tight">
                  {item.title}
                </h3>

                <p className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} leading-9 font-medium text-lg`}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-16 text-center">
          <div className={`${darkMode ? 'text-neutral-400' : 'text-neutral-500'} text-sm font-black tracking-[0.3em] uppercase mb-4`}>
            Scholarship Comparison
          </div>

          <h2 className="section-title text-5xl md:text-7xl font-black mb-8">
            {isFa ? 'مقایسه پرداخت شهریه' : 'Tuition Comparison'}
          </h2>

          <p className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} max-w-3xl mx-auto text-lg leading-9 font-medium`}>
            {isFa ? 'مقایسه هزینه کل دوره کارشناسی ۴ ساله به‌همراه ۱ سال دوره زبان؛ از پرداخت ترمیک عادی تا خرید صندلی بورسیه ۱۰۰٪ و پرداخت نقدی مستقیم به دانشگاه.' : 'Compare the total cost of a 4-year bachelor program plus 1 year of language preparation, from regular semester tuition to ACCA 100% scholarship seats and direct cash payment discounts.'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {scholarshipComparison.map((item) => (
            <div
              key={item.title}
              className={`${darkMode ? 'darkGlass' : 'glass'} pricing-card ${item.featured ? 'pricing-featured scale-[1.03]' : ''} rounded-[42px] p-10`}
            >
              <div className="pricing-glow" />

              <div className="relative z-10">
                {item.featured && (
                  <div className="inline-flex mb-6 px-5 py-2 rounded-full bg-white text-black text-sm font-black">
                    {isFa ? 'پیشنهاد ویژه ACCA' : 'Featured ACCA Offer'}
                  </div>
                )}

                <h3 className="text-3xl font-black mb-4">
                  {item.title}
                </h3>

                <div className="text-6xl font-black tracking-tight mb-6">
                  {item.price}
                </div>

                <p className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} leading-8 mb-10 font-medium`}>
                  {item.desc}
                </p>

                <div className="space-y-4 mb-10">
                  {item.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 text-base font-bold"
                    >
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      {feature}
                    </div>
                  ))}
                </div>

                <a
                  href={item.ctaHref || '?page=programs'}
                  className="inline-flex w-full items-center justify-center bg-black text-white py-4 rounded-2xl font-black text-lg"
                >
                  {item.ctaLabel || (isFa ? 'لیست شهریه‌ها' : 'Tuition List')}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
