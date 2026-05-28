export default function TestimonialsSection({ darkMode, isFa }) {
  return (
<section id="testimonials" className="py-24 px-6 lg:px-10 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-[#C6A77D] tracking-[0.35em] uppercase text-sm mb-5 font-black">
            <span>Student Stories</span>
          </div>

          <h2 className={`text-4xl lg:text-6xl font-black leading-tight ${darkMode ? 'text-white' : 'text-[#0D1B2A]'}`}>
            {isFa ? 'تجربه دانشجویان ACCA' : 'ACCA Student Experiences'}
          </h2>

          <div className={`${darkMode ? 'darkGlass' : 'glass'} mt-16 rounded-[38px] border border-white/60 p-12 shadow-[0_30px_80px_rgba(0,0,0,0.05)] relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-40" />

            <div className="relative z-10">
              <div className="text-6xl mb-8">
                🎓
              </div>

              <p className={`text-2xl lg:text-3xl leading-[2] font-medium max-w-4xl mx-auto ${darkMode ? 'text-white/90' : 'text-[#243B53]'}`}>
                {isFa ? '«با کمک ACCA تونستم در یکی از بهترین دانشگاه‌های ترکیه پذیرش بگیرم و مسیر مهاجرت تحصیلیم خیلی سریع و حرفه‌ای انجام شد.»' : '“With ACCA, I successfully got admitted to one of the top universities in Turkey and my educational migration process became fast and professional.”'}
              </p>

              <div className="mt-10 text-[#C6A77D] font-black text-2xl">
                پریسا محمدی
              </div>

              <div className={`mt-2 ${darkMode ? 'text-neutral-300' : 'text-[#52606D]'} text-lg font-medium`}>
                İstinye University Student
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
