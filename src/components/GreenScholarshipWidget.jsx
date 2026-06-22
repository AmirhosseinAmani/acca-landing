import { useMemo, useState } from "react";

const PLAN_KEYS = {
  normal: "normal",
  green: "green",
};

function getPlanPercent(planKey) {
  return planKey === PLAN_KEYS.green ? "60%" : "0%";
}

export default function GreenScholarshipWidget({
  isFa = true,
  darkMode = false,
  onConsultationClick,
}) {
  const [selectedPlan, setSelectedPlan] = useState(PLAN_KEYS.green);
  const isDark = darkMode;

  const copy = useMemo(
    () => ({
      badge: "Green Scholarship",
      title: isFa ? "بورسیه سبز" : "Green Scholarship",
      subtitle: isFa
        ? "فرصت ویژه تحصیل اقتصادی در ترکیه"
        : "A Smart Financial Opportunity for Studying in Turkey",
      description: isFa
        ? "بورسیه سبز ACCA ترکیبی از کاهش هزینه تحصیل، فرصت پذیرش در دانشگاه‌های معتبر و برنامه‌ریزی مالی هوشمندانه برای دانشجویان بین‌المللی است."
        : "ACCA Green Scholarship combines lower tuition costs, admission opportunities at top universities, and smart financial planning for international students.",
      lowerCost: isFa ? "تا 60٪ کاهش هزینه" : "Up to 60% Lower Cost",
      lowerCostDesc: isFa
        ? "نسبت به پرداخت شهریه ترمیک و بدون بورسیه."
        : "Compared to standard semester-based tuition payments.",
      universities: isFa ? "دانشگاه‌های معتبر" : "Top Universities",
      universitiesDesc: isFa
        ? "مناسب رشته‌های پزشکی، دندانپزشکی و سلامت."
        : "Suitable for medicine, dentistry, and healthcare majors.",
      consult: isFa ? "دریافت مشاوره بورسیه" : "Get Scholarship Consultation",
      requirements: isFa ? "مشاهده لیست بورسیه" : "View Scholarship List",
      normal: isFa ? "شهریه عادی" : "Normal Tuition",
      green: isFa ? "بورسیه ACCA" : "ACCA Green",
      advantage: isFa ? "مزیت ACCA" : "ACCA Advantage",
      professional: isFa ? "تحصیل حرفه‌ای‌تر" : "Professional Education",
      smarter: isFa ? "با هزینه ارزان‌تر" : "With Lower Costs",
      smartPlan: isFa ? "برنامه مالی هوشمند" : "Smart Financial Plan",
      normalDesc: isFa
        ? "هزینه کل ۴ سال کارشناسی + ۱ سال زبان به‌صورت ترمیک."
        : "Total cost of 4 academic years plus 1 year of language preparation with semester payments.",
      greenDesc: isFa
        ? "معافیت کامل از شهریه کل دوره تحصیل."
        : "Full tuition exemption for the entire academic program.",
    }),
    [isFa]
  );

  const plans = {
    [PLAN_KEYS.normal]: {
      label: copy.normal,
      value: "$12K",
      percent: getPlanPercent(PLAN_KEYS.normal),
      desc: copy.normalDesc,
      variant: "darkGlass",
    },
    [PLAN_KEYS.green]: {
      label: copy.green,
      value: "$4.8K",
      percent: getPlanPercent(PLAN_KEYS.green),
      desc: copy.greenDesc,
      variant: "featured",
    },
  };

  const selectedPercent = plans[selectedPlan]?.percent ?? plans.green.percent;

  return (
    <section
      id="scholarship"
      dir={isFa ? "rtl" : "ltr"}
      className={`pb-24 px-6 lg:px-10 relative z-10 overflow-hidden ${
        "font-['Vazirmatn']"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div
          className={`relative overflow-hidden rounded-[32px] border sm:rounded-[44px] lg:rounded-[52px] ${
            isDark
              ? "border-white/10 shadow-[0_50px_140px_rgba(0,0,0,0.16)]"
              : "border-white/60 shadow-none"
          }`}
        >
          <div
            className="absolute inset-0"
            style={{
              background: isDark
                ? "radial-gradient(circle at top right, rgba(52,211,153,0.22), transparent 30%), linear-gradient(135deg, #041511 0%, #07211D 42%, #0B3E38 72%, #0D5A4F 100%)"
                : "radial-gradient(circle at top right, rgba(16,185,129,0.12), transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.62) 0%, rgba(236,253,245,0.42) 46%, rgba(255,255,255,0.28) 100%)",
            }}
          />

          <div
            className={`absolute right-[-120px] top-[-120px] h-[300px] w-[300px] rounded-full blur-3xl sm:h-[420px] sm:w-[420px] ${
              isDark ? "bg-emerald-400/20" : "bg-emerald-300/12"
            }`}
          />
          <div
            className={`absolute bottom-[-110px] left-[-120px] h-[260px] w-[260px] rounded-full blur-3xl sm:h-[320px] sm:w-[320px] ${
              isDark ? "bg-emerald-300/10" : "bg-white/30"
            }`}
          />

          <div className="relative z-10 grid gap-10 p-5 sm:p-8 md:p-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:p-16 xl:p-20">
            <div className="min-w-0">
              <div
                className={`mb-7 inline-flex max-w-full items-center gap-3 rounded-full border border-emerald-300/20 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] backdrop-blur-xl sm:px-5 sm:text-sm sm:tracking-[0.25em] ${
                  isDark ? "text-emerald-100" : "text-[#16352E]"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 animate-pulse rounded-full ${
                    isDark ? "bg-emerald-400" : "bg-[#245847]"
                  }`}
                />
                <span className="truncate">{copy.badge}</span>
              </div>

              <div className="mb-7 flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
                <div
                  className={`grid h-[94px] w-[94px] shrink-0 place-items-center rounded-[32px] border text-6xl backdrop-blur-2xl sm:h-[122px] sm:w-[122px] sm:text-7xl ${
                    isDark
                      ? "border-emerald-200/15 bg-white/10 shadow-[0_0_50px_rgba(16,185,129,0.28)]"
                      : "border-white/70 bg-white/55 shadow-none"
                  }`}
                >
                  💎
                </div>

                <div className="min-w-0">
                  <h2
                    className={`break-words text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl ${
                      isDark ? "text-white" : "text-[#0F172A]"
                    } ${isFa ? "font-black" : "font-extrabold"}`}
                  >
                    {copy.title}
                  </h2>

                  <p
                    className={`mt-4 text-base font-bold leading-8 sm:text-lg ${
                      isDark ? "text-emerald-200" : "text-[#245847]"
                    }`}
                  >
                    {copy.subtitle}
                  </p>
                </div>
              </div>

              <p
                className={`max-w-2xl text-base font-medium leading-9 sm:text-lg sm:leading-[2.1] ${
                  isDark ? "text-white/75" : "text-[#1F2937]"
                }`}
              >
                {copy.description}
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-12">
                <InfoCard icon="💸" title={copy.lowerCost} desc={copy.lowerCostDesc} isDark={isDark} />
                <InfoCard icon="🏛️" title={copy.universities} desc={copy.universitiesDesc} isDark={isDark} />
              </div>

              <div className="mt-10 hidden flex-col gap-4 sm:mt-12 lg:flex lg:flex-row lg:flex-wrap lg:gap-5">
                <ScholarshipButtons consult={copy.consult} requirements={copy.requirements} isDark={isDark} onConsultationClick={onConsultationClick} />
              </div>
            </div>

            <div className="relative flex min-w-0 justify-center lg:items-center">
              <div
                className={`absolute inset-0 rounded-full opacity-70 blur-[100px] ${
                  isDark ? "bg-emerald-400/20" : "bg-[#245847]/20"
                }`}
              />

              <div className="relative w-full max-w-[560px] min-w-0">
                <div
                  className={`mb-4 inline-flex max-w-full rotate-0 rounded-2xl px-4 py-3 text-sm font-black sm:absolute sm:-top-8 sm:right-8 sm:z-20 sm:mb-0 sm:rotate-[4deg] sm:px-5 ${
                    isDark
                      ? "bg-gradient-to-br from-emerald-300 to-emerald-500 text-[#06241F] shadow-2xl"
                      : "bg-white/80 text-[#245847] shadow-none ring-1 ring-[#245847]/10"
                  }`}
                >
                  <span className="truncate">{copy.smartPlan}</span>
                </div>

                <div
                  className={`rounded-[30px] border p-4 backdrop-blur-3xl sm:rounded-[42px] sm:p-6 lg:p-8 ${
                    isDark
                      ? "border-white/10 bg-white/10 shadow-[0_30px_120px_rgba(0,0,0,0.24),0_0_40px_rgba(52,211,153,0.08)]"
                      : "border-white/70 bg-white/45 shadow-none"
                  }`}
                >
                  <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:mb-6">
                    <PlanCard
                      label={plans.normal.label}
                      value={plans.normal.value}
                      desc={plans.normal.desc}
                      active={selectedPlan === PLAN_KEYS.normal}
                      onClick={() => setSelectedPlan(PLAN_KEYS.normal)}
                      variant={plans.normal.variant}
                      isDark={isDark}
                    />
                    <PlanCard
                      label={plans.green.label}
                      value={plans.green.value}
                      desc={plans.green.desc}
                      active={selectedPlan === PLAN_KEYS.green}
                      onClick={() => setSelectedPlan(PLAN_KEYS.green)}
                      variant={plans.green.variant}
                      isDark={isDark}
                    />
                  </div>

                  <div
                    className={`rounded-[26px] border p-5 sm:rounded-[30px] sm:p-7 ${
                      isDark
                        ? "border-emerald-200/10 bg-gradient-to-r from-emerald-400/20 to-emerald-200/5"
                        : "border-[#245847]/10 bg-gradient-to-r from-[#245847]/12 to-white/20"
                    }`}
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div
                          className={`mb-3 text-xs font-black uppercase tracking-[0.2em] sm:text-sm sm:tracking-[0.25em] ${
                            isDark ? "text-emerald-200" : "text-[#245847]"
                          }`}
                        >
                          {copy.advantage}
                        </div>
                        <div
                          className={`break-words text-2xl font-black leading-tight sm:text-3xl ${
                            isDark ? "text-white" : "text-[#0F172A]"
                          }`}
                        >
                          {copy.professional}
                          <br />
                          {copy.smarter}
                        </div>
                      </div>

                      <div
                        className={`shrink-0 text-center text-6xl font-black leading-none drop-shadow-[0_0_30px_rgba(16,185,129,0.4)] sm:text-7xl ${
                          isDark ? "text-emerald-200" : "text-[#245847]"
                        }`}
                      >
                        {selectedPercent}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:hidden">
              <ScholarshipButtons consult={copy.consult} requirements={copy.requirements} isDark={isDark} onConsultationClick={onConsultationClick} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScholarshipButtons({ consult, requirements, isDark, onConsultationClick }) {
  return (
    <>
      <button
        type="button"
        onClick={onConsultationClick}
        className={`w-full rounded-[22px] px-7 py-4 text-base font-black shadow-[0_20px_80px_rgba(255,255,255,0.18)] transition hover:scale-[1.02] sm:px-9 sm:py-5 sm:text-lg lg:w-auto ${
          isDark
            ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white"
            : "bg-white text-[#06241F]"
        }`}
      >
        {consult}
      </button>

      <a
        href="/scholarships/"
        target="_blank"
        rel="noreferrer"
        className={`w-full rounded-[22px] border px-7 py-4 text-center text-base font-black backdrop-blur-xl transition hover:scale-[1.02] sm:px-9 sm:py-5 sm:text-lg lg:w-auto ${
          isDark
            ? "border-emerald-300/20 bg-emerald-400/10 text-white"
            : "border-[#245847]/20 bg-[#245847]/10 text-[#0F172A]"
        }`}
      >
        {requirements}
      </a>
    </>
  );
}

function InfoCard({ icon, title, desc, isDark }) {
  return (
    <div
      className={`min-w-0 rounded-[26px] border p-5 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 sm:rounded-[30px] sm:p-6 ${
        isDark
          ? "border-white/10 bg-white/8 shadow-[0_10px_40px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_20px_60px_rgba(255,255,255,0.1),0_0_30px_rgba(52,211,153,0.12)]"
          : "border-white/70 bg-white/55 shadow-none"
      }`}
    >
      <div className="mb-4 text-4xl">{icon}</div>
      <h3
        className={`mb-3 break-words text-lg font-black leading-7 sm:text-xl ${
          isDark ? "text-white" : "text-[#111827]"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-sm font-medium leading-7 sm:leading-8 ${
          isDark ? "text-white/65" : "text-[#374151]"
        }`}
      >
        {desc}
      </p>
    </div>
  );
}

function PlanCard({ label, value, desc, active, onClick, variant, isDark }) {
  const isFeatured = variant === "featured";

  const base = isFeatured
    ? isDark
      ? "border-emerald-300/20 bg-gradient-to-br from-emerald-500/35 via-emerald-500/20 to-emerald-800/45 text-white shadow-[0_20px_80px_rgba(16,185,129,0.18)]"
      : "border-emerald-400/20 bg-gradient-to-br from-white/85 via-emerald-50/70 to-white/60 text-[#06241F] shadow-none"
    : isDark
      ? "border-white/10 bg-white/5 text-white"
      : "border-white/70 bg-white/55 text-[#0F172A]";

  const labelColor = isDark ? "text-emerald-200" : "text-[#245847]";
  const descColor = isDark ? "text-white/75" : "text-[#1F2937]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-0 rounded-[24px] border p-5 text-start transition-all duration-300 hover:scale-[1.015] sm:rounded-[28px] sm:p-6 ${isDark ? "hover:shadow-[0_20px_50px_rgba(255,255,255,0.08),0_0_26px_rgba(52,211,153,0.12)]" : "hover:bg-white/75"} ${base} ${
        active ? "ring-2 ring-emerald-300/80" : "ring-0"
      }`}
    >
      <div className={`mb-3 truncate text-xs font-black uppercase tracking-[0.2em] ${labelColor}`}>
        {label}
      </div>
      <div className="mb-4 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(2.35rem,11vw,3.2rem)] font-black leading-none tracking-tight">
        {value}
      </div>
      <p className={`text-sm font-medium leading-7 ${descColor}`}>{desc}</p>
    </button>
  );
}
