export default function FaqSection({ darkMode, isFa }) {
  return (
<section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="mb-16 text-center">
          <div className={`${darkMode ? 'text-neutral-400' : 'text-neutral-500'} text-sm font-black tracking-[0.3em] uppercase mb-4`}>
            FAQ
          </div>

          <h2 className="section-title text-4xl md:text-6xl font-black mb-8">
            {isFa ? 'سوالات متداول' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="space-y-6">
          {[
            isFa
              ? 'آیا انتقالی پزشکی امکان‌پذیر است؟'
              : 'Is medical transfer possible?',
            isFa
              ? 'دانشگاه‌ها مورد تایید وزارت بهداشت هستند؟'
              : 'Are the universities officially approved?',
            isFa
              ? 'بدون آزمون هم پذیرش انجام می‌شود؟'
              : 'Is admission possible without an entrance exam?',
            isFa
              ? 'اقامت دانشجویی هم انجام می‌دهید؟'
              : 'Do you also provide student residence services?',
          ].map((faq, index) => (
            <details
              key={index}
              className={`${darkMode ? 'darkGlass' : 'glass'} faq-item rounded-[32px] p-8 group transition-all duration-500`}
            >
              <summary className="list-none flex items-center justify-between cursor-pointer">
                <div className="text-xl font-black">
                  {faq}
                </div>

                <div className="text-3xl font-black transition-transform duration-300 group-open:rotate-45">
                  +
                </div>
              </summary>

              <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-white/10 text-neutral-300' : 'border-black/10 text-neutral-700'} leading-[2.1] text-base font-medium`}>
                {index === 0
                  ? (isFa
                      ? 'بله، شما به راحتی میتوانید از دانشگاههای خارج از ترکیه و داخل ترکیه به دانشگاههای دیگه در ترکیه انتقالی بگیرید و شرکت آکا با تجربه بسیار بالایی در پروسه انتقالی گرفتن در شهر استانبول میتواند برای شما یک کلیهی دروساتون رو تطبیق واحد بده و با خیال راحت پروسه انتقالی را انجام بدید. برای مشاوره دقیقتر حتما مشاوره و تماس با ما را فراموش نکنید.'
                      : 'Yes. You can easily transfer from universities inside or outside Turkey to other Turkish universities. ACCA has extensive experience with transfer procedures in Istanbul and can help match your completed courses for a smooth transfer process. Contact us for detailed consultation.')
                  : index === 1
                  ? (isFa
                      ? `لیست دانشگاههای مورد تایید وزارت بهداشت در استانبول شامل موارد زیر میباشد:

• Bahçeşehir University
• İstinye University
• Biruni University
• Medipol University
• Atlas University
• Aydın University
• Altınbaş University
• Okan University`
                      : `The list of Ministry of Health approved universities in Istanbul includes:

• Bahçeşehir University
• İstinye University
• Biruni University
• Medipol University
• Atlas University
• Aydın University
• Altınbaş University
• Okan University`)
                  : index === 2
                  ? (isFa
                      ? 'بله، اگر شما دانشجوی خارجی باشید و دیپلمتون رو از کشورهای غیر از داخل ترکیه گرفته باشید، ثبتنامتون در هر رشتهی در دانشگاههای ترکیه بدون امتحان انجام میشود.'
                      : 'Yes. If you are an international student and received your diploma outside of Turkey, your admission to Turkish universities in most majors can be completed without an entrance exam.')
                  : index === 3
                  ? (isFa
                      ? 'خدمات شرکت آکا به صورت کامل هست. از قبل از ورود به ترکیه، موقع ثبتنام و اخذ اقامت و گرفتن کارت کیملیک و حتی خدمات اکسرا مثل زبان، مدرک زبان ترکی یا همون تومر، ترجمه، خوابگاه و غیره هست.'
                      : 'ACCA provides complete student services — from before your arrival in Turkey to university registration, student residence permit procedures, obtaining your Kimlik card, and extra services such as language support, TOMER Turkish certificate, translation, dormitory assistance, and more.')
                  : (isFa
                      ? 'متن پاسخ این بخش در این قسمت قرار میگیرد.'
                      : 'The answer content for this section will appear here.')
                }
              </div>
            </details>
          ))}
        </div>
      </section>
  );
}
