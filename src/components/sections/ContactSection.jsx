import {
  COMPANY_EMAIL,
  COMPANY_EMAIL_URL,
  COMPANY_INSTAGRAM_URL,
  COMPANY_LINKEDIN_URL,
  COMPANY_MAP_EMBED_URL,
  COMPANY_MAPS_URL,
  COMPANY_OFFICE_ADDRESS,
  COMPANY_PHONE_DISPLAY,
  COMPANY_TELEGRAM_URL,
  COMPANY_WEBSITE_URL,
  COMPANY_WHATSAPP_URL,
} from '../../constants/contact';

export default function ContactSection({ darkMode, isFa, onConsultationClick }) {
  const cardClass = `${darkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white/88 border-black/10 text-black shadow-[0_14px_44px_rgba(0,0,0,0.08)] hover:bg-white'} rounded-[28px] border p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1`;
  const mutedTextClass = darkMode ? 'text-neutral-300' : 'text-black/78';

  return (
<section id="contact" className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className={`${darkMode ? 'darkGlass' : 'glass'} rounded-[52px] overflow-hidden relative`}>
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white/10 via-transparent to-emerald-400/10" />

          <div className="relative z-10 grid lg:grid-cols-[1fr_0.9fr] gap-0 items-stretch">
            <div className="p-10 md:p-16 lg:p-20 flex flex-col justify-center">
              <div className={`${darkMode ? 'text-neutral-400' : 'text-black/60'} text-sm font-black tracking-[0.3em] uppercase mb-5`}>
                Contact ACCA
              </div>

              <h2 className={`${darkMode ? 'text-white' : 'text-black'} section-title text-4xl md:text-6xl font-black mb-10 leading-tight`}>
                {isFa ? 'ارتباط با' : 'Contact'}
                <br />
                {isFa ? 'شرکت ما' : 'Our Company'}
              </h2>

              <p className={`${mutedTextClass} text-lg leading-9 font-semibold max-w-2xl mb-12`}>
                {isFa ? 'برای دریافت مشاوره تخصصی، بررسی شرایط پذیرش و انتخاب بهترین مسیر تحصیلی با تیم ACCA در ارتباط باشید.' : 'Contact the ACCA team for professional consultation, admission evaluation, and selecting the best academic pathway.'}
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-12">
                <a
                  href={COMPANY_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClass}
                >
                  <div className="text-3xl mb-4">📍</div>
                  <div className="font-black text-lg mb-3">Office Address</div>
                  <div className={`${mutedTextClass} leading-8 text-sm font-medium`}>
                    {COMPANY_OFFICE_ADDRESS}
                  </div>
                </a>

                <a
                  href={COMPANY_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClass}
                >
                  <div className="text-3xl mb-4">📞</div>
                  <div className="font-black text-lg mb-3">WhatsApp / Contact</div>
                  <div className={`${mutedTextClass} leading-8 text-sm font-medium`}>
                    {COMPANY_PHONE_DISPLAY}
                  </div>
                </a>

                <a
                  href={COMPANY_WEBSITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClass}
                >
                  <div className="text-3xl mb-4">🌐</div>
                  <div className="font-black text-lg mb-3">Website</div>
                  <div className={`${mutedTextClass} leading-8 text-sm font-medium`}>
                    Accaco.com
                  </div>
                </a>

                <a
                  href={COMPANY_INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClass}
                >
                  <div className="text-3xl mb-4">📷</div>
                  <div className="font-black text-lg mb-3">Instagram</div>
                  <div className={`${mutedTextClass} leading-8 text-sm font-medium`}>
                    @Acca_edu
                  </div>
                </a>

                <a
                  href={COMPANY_TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={isFa ? 'کانال تلگرام ACCA EDU' : 'ACCA EDU Telegram channel'}
                  className={cardClass}
                >
                  <div className="text-3xl mb-4">✈️</div>
                  <div className="font-black text-lg mb-3">Telegram</div>
                  <div className={`${mutedTextClass} leading-8 text-sm font-medium`}>
                    @Acca_edu_tr
                  </div>
                </a>

                <a
                  href={COMPANY_EMAIL_URL}
                  aria-label={isFa ? 'ارسال ایمیل به ACCA EDU' : 'Email ACCA EDU'}
                  className={cardClass}
                >
                  <div className="text-3xl mb-4">✉️</div>
                  <div className="font-black text-lg mb-3">Email</div>
                  <div className={`${mutedTextClass} leading-8 text-sm font-medium break-all`}>
                    {COMPANY_EMAIL}
                  </div>
                </a>

                {COMPANY_LINKEDIN_URL && (
                  <a
                    href={COMPANY_LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={isFa ? 'لینکدین ACCA EDU' : 'ACCA EDU on LinkedIn'}
                    className={cardClass}
                  >
                    <div className="text-3xl mb-4">💼</div>
                    <div className="font-black text-lg mb-3">LinkedIn</div>
                    <div className={`${mutedTextClass} leading-8 text-sm font-medium`}>
                      ACCA EDU
                    </div>
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-5">
                <button
                  type="button"
                  onClick={onConsultationClick}
                  className="bg-black text-white px-9 py-5 rounded-[24px] font-black text-lg hover:scale-105 transition-all duration-300"
                >
                  {isFa ? 'رزرو مشاوره' : 'Book Consultation'}
                </button>

                <a
                  href={COMPANY_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${darkMode ? 'darkGlass text-white' : 'glass text-black'} px-9 py-5 rounded-[24px] font-black text-lg hover:scale-105 transition-all duration-300`}
                >
                  {isFa ? 'ارتباط واتساپ' : 'WhatsApp Contact'}
                </a>
              </div>
            </div>

            <div className="relative min-h-[720px] overflow-hidden">
              <div className={`${darkMode ? 'bg-[#07130f]' : 'bg-[#edf4ec]'} absolute inset-0`} />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-transparent to-cyan-400/10" />

              <iframe
                title="ACCA Office Map"
                src={COMPANY_MAP_EMBED_URL}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />

              <div className={`${darkMode ? 'bg-[#020617]/42' : 'bg-white/8'} absolute inset-0 pointer-events-none`} />

              <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-[86%]">
                <div className={`${darkMode ? 'border-white/85 bg-emerald-400 shadow-[0_18px_60px_rgba(16,185,129,0.42)]' : 'border-white bg-emerald-600 shadow-[0_18px_60px_rgba(5,150,105,0.38)]'} relative flex h-14 w-14 items-center justify-center rounded-full border-4`}>
                  <div className="h-4 w-4 rounded-full bg-white" />
                  <div className={`${darkMode ? 'bg-emerald-400' : 'bg-emerald-600'} absolute left-1/2 top-[38px] h-7 w-7 -translate-x-1/2 rotate-45 rounded-br-[6px]`} />
                </div>
              </div>

              <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-8 pb-12">
                <h3 className={`${darkMode ? 'text-white' : 'text-black'} text-4xl md:text-5xl font-black mb-6 leading-tight`}>
                  {isFa ? 'دفتر مرکزی ACCA' : 'ACCA Headquarters'}
                </h3>

                <p className={`${darkMode ? 'text-white/80' : 'text-black'} text-lg leading-9 max-w-md font-bold mb-10`}>
                  Istanbul / Esenyurt
                  <br />
                  Terrace Lotus Plaza
                </p>

                <a
                  href={COMPANY_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${darkMode ? 'bg-white text-black shadow-[0_20px_80px_rgba(255,255,255,0.18)]' : 'bg-black text-white shadow-[0_20px_80px_rgba(0,0,0,0.16)]'} inline-flex items-center gap-3 px-10 py-5 rounded-[24px] font-black text-lg hover:scale-105 transition-all duration-300`}
                >
                  {isFa ? 'مشاهده در Google Maps' : 'Open in Google Maps'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
