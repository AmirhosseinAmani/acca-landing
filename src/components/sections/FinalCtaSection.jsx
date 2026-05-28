export default function FinalCtaSection({ darkMode, isFa, onConsultationClick }) {
  return (
<section className="max-w-7xl mx-auto px-6 pb-32 relative z-10">
        <div className={`${darkMode ? 'darkGlass' : 'glass'} rounded-[48px] p-14 md:p-20 text-center relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-20 blur-3xl bg-gradient-to-r from-white/20 to-transparent" />

          <div className="relative z-10">
            <div className={`${darkMode ? 'text-neutral-400' : 'text-neutral-500'} text-sm font-black tracking-[0.3em] uppercase mb-6`}>
              Future Starts Here
            </div>

            <h2 className="section-title text-5xl md:text-8xl font-black leading-none">
              {isFa ? 'آینده تحصیلی خودتو' : 'Start Your Academic Future'}
              <br />
              {isFa ? 'با ACCA شروع کن.' : 'With ACCA.'}
            </h2>

            <p className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} max-w-3xl mx-auto mt-10 text-xl leading-9 font-medium`}>
              {isFa ? 'تجربه‌ای مدرن از مشاوره تحصیلی، انتقالی پزشکی، اخذ پذیرش و توسعه مسیر بین‌المللی دانشجویان در ترکیه و اروپا.' : 'A modern experience in educational consulting, medical transfer, admissions, and international student pathway development in Turkey and Europe.'}
            </p>

            <div className="mt-12 flex justify-center flex-wrap gap-5">
              <button
                type="button"
                onClick={onConsultationClick}
                className="bg-black text-white px-10 py-5 rounded-3xl font-black text-lg"
              >
                <span className="inline-flex items-center gap-2">
                <span>💬</span>
                {isFa ? 'شروع مشاوره' : 'Start Consultation'}
              </span>
              </button>

              <a
                href="?page=universities"
                target="_blank"
                rel="noreferrer"
                className={`${darkMode ? 'darkGlass text-white' : 'glass text-black'} px-10 py-5 rounded-3xl font-black text-lg`}
              >
                <span className="inline-flex items-center gap-2">
                <span>🏛️</span>
                {isFa ? 'مشاهده دانشگاه‌ها' : 'View Universities'}
              </span>
              </a>
            </div>
          </div>
        </div>
      </section>
  );
}
