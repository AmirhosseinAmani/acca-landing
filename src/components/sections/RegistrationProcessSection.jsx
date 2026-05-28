export default function RegistrationProcessSection({ darkMode, isFa, registrationSteps }) {
  return (
<section className="max-w-7xl mx-auto px-6 pb-32 relative z-10">
        <div className="mb-16">
          <div className={`${darkMode ? 'text-neutral-400' : 'text-neutral-500'} text-sm font-black tracking-[0.3em] uppercase mb-4`}>
            Registration Process
          </div>

          <h2 className="section-title text-5xl md:text-7xl font-black">
            {isFa ? 'مراحل ثبت‌نام' : 'Registration Process'}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {registrationSteps.map((step, index) => (
            <div
              key={step.title}
              className={`${darkMode ? 'darkGlass' : 'glass'} step-card rounded-[36px] p-8 relative overflow-hidden`}
            >
              <div className="text-7xl font-black opacity-10 absolute top-4 left-6">
                0{index + 1}
              </div>

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center text-2xl font-black mb-8">
                  ✦
                </div>

                <h3 className="text-2xl font-black mb-4">
                  {step.title}
                </h3>

                <p className={`${darkMode ? 'text-neutral-300' : 'text-neutral-700'} leading-8 font-medium`}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
  );
}
