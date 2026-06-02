import { useMemo, useState } from 'react';
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react';

const programRows = [
  {
    university: 'Acibadem University',
    faculty: 'Faculty of Medicine',
    program: 'Medicine',
    degree: 'Bachelor',
    language: 'English',
    tuition: '$22,000',
    deposit: '$1,000',
  },
  {
    university: 'Medipol University',
    faculty: 'Faculty of Dentistry',
    program: 'Dentistry',
    degree: 'Bachelor',
    language: 'English',
    tuition: '$18,000',
    deposit: '$1,000',
  },
  {
    university: 'Bahcesehir University',
    faculty: 'Faculty of Engineering',
    program: 'Software Engineering',
    degree: 'Bachelor',
    language: 'English',
    tuition: '$8,500',
    deposit: '$1,000',
  },
  {
    university: 'Istanbul Aydin University',
    faculty: 'Faculty of Health Sciences',
    program: 'Nursing',
    degree: 'Bachelor',
    language: 'Turkish',
    tuition: '$4,500',
    deposit: '$500',
  },
  {
    university: 'Istinye University',
    faculty: 'Faculty of Pharmacy',
    program: 'Pharmacy',
    degree: 'Bachelor',
    language: 'English',
    tuition: '$11,000',
    deposit: '$1,000',
  },
  {
    university: 'Biruni University',
    faculty: 'Faculty of Engineering',
    program: 'Computer Engineering',
    degree: 'Bachelor',
    language: 'English',
    tuition: '$6,000',
    deposit: '$500',
  },
  {
    university: 'Atlas University',
    faculty: 'Faculty of Health Sciences',
    program: 'Physiotherapy and Rehabilitation',
    degree: 'Bachelor',
    language: 'Turkish',
    tuition: '$4,000',
    deposit: '$500',
  },
  {
    university: 'Yeditepe University',
    faculty: 'Faculty of Architecture',
    program: 'Architecture',
    degree: 'Bachelor',
    language: 'English',
    tuition: '$9,000',
    deposit: '$1,000',
  },
];

export default function ProgramsPage({
  darkMode,
  isFa,
  ACCA_LOGO_SRC,
  onConsultationClick,
}) {
  const [query, setQuery] = useState('');
  const [faculty, setFaculty] = useState('all');

  const faculties = useMemo(
    () => ['all', ...new Set(programRows.map((row) => row.faculty))],
    []
  );

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return programRows.filter((row) => {
      const matchesFaculty = faculty === 'all' || row.faculty === faculty;
      const searchable = [
        row.university,
        row.faculty,
        row.program,
        row.degree,
        row.language,
      ]
        .join(' ')
        .toLowerCase();

      return matchesFaculty && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [faculty, query]);

  return (
    <div
      className={`${darkMode ? 'bg-[#050816] text-white' : 'bg-[#F7F1E8] text-neutral-950'} min-h-screen overflow-hidden px-5 py-6 sm:px-6 sm:py-8`}
      dir={isFa ? 'rtl' : 'ltr'}
    >
      <div className={`${darkMode ? 'darkGlass' : 'glass'} mx-auto flex max-w-7xl items-center justify-between rounded-full px-5 py-3 sm:px-7 sm:py-4`}>
        <a href="/" aria-label={isFa ? 'بازگشت به صفحه اصلی ACCA EDU' : 'Back to ACCA EDU home'}>
          <img
            src={ACCA_LOGO_SRC}
            alt="ACCA EDU Logo"
            className="h-10 w-auto object-contain sm:h-11"
          />
        </a>

        <a
          href="/"
          className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black`}
        >
          <ArrowLeft size={16} className={isFa ? 'rotate-180' : ''} />
          {isFa ? 'بازگشت' : 'Back'}
        </a>
      </div>

      <main className="mx-auto max-w-7xl pb-20 pt-14 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <div className={`${darkMode ? 'text-emerald-300' : 'text-emerald-700'} mb-5 text-sm font-black uppercase tracking-[0.35em]`}>
              ACCA PROGRAMS
            </div>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              {isFa ? 'رشته‌ها و شهریه‌ها' : 'Programs and Tuition'}
            </h1>

            <p className={`${darkMode ? 'text-white/62' : 'text-black/60'} mt-7 max-w-2xl text-lg font-medium leading-9`}>
              {isFa
                ? 'جدول برنامه‌های دانشگاهی برای بررسی سریع رشته، دانشکده، مقطع، شهریه سالانه و دپوزیت اولیه.'
                : 'A fast program table for comparing major, faculty, degree, annual tuition, and initial deposit.'}
            </p>
          </div>

          <div className={`${darkMode ? 'darkGlass' : 'glass'} rounded-[34px] p-4 sm:p-5`}>
            <div className="grid gap-3 sm:grid-cols-[1fr_260px]">
              <label className={`${darkMode ? 'bg-white/8 border-white/10' : 'bg-white/75 border-black/10'} flex items-center gap-3 rounded-[24px] border px-5 py-4`}>
                <Search size={20} className={darkMode ? 'text-white/45' : 'text-black/40'} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={isFa ? 'جستجوی رشته یا دانشگاه' : 'Search program or university'}
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:opacity-45"
                />
              </label>

              <label className={`${darkMode ? 'bg-white/8 border-white/10' : 'bg-white/75 border-black/10'} flex items-center gap-3 rounded-[24px] border px-5 py-4`}>
                <SlidersHorizontal size={20} className={darkMode ? 'text-white/45' : 'text-black/40'} />
                <select
                  value={faculty}
                  onChange={(event) => setFaculty(event.target.value)}
                  className={`${darkMode ? 'text-white' : 'text-black'} min-w-0 flex-1 bg-transparent text-sm font-black outline-none`}
                >
                  {faculties.map((item) => (
                    <option key={item} value={item}>
                      {item === 'all' ? (isFa ? 'همه دانشکده‌ها' : 'All Faculties') : item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        <section className={`${darkMode ? 'darkGlass' : 'glass'} mt-10 overflow-hidden rounded-[36px]`}>
          <div className="hidden lg:grid grid-cols-[1.25fr_1fr_1fr_0.7fr_0.75fr_0.7fr] gap-4 border-b border-black/5 px-7 py-5 text-sm font-black uppercase tracking-[0.14em] opacity-55">
            <div>{isFa ? 'دانشگاه / رشته' : 'University / Program'}</div>
            <div>{isFa ? 'دانشکده' : 'Faculty'}</div>
            <div>{isFa ? 'مقطع و زبان' : 'Degree and Language'}</div>
            <div>{isFa ? 'شهریه' : 'Tuition'}</div>
            <div>{isFa ? 'دپوزیت' : 'Deposit'}</div>
            <div>{isFa ? 'اقدام' : 'Action'}</div>
          </div>

          <div className="divide-y divide-black/5">
            {filteredRows.map((row) => (
              <article
                key={`${row.university}-${row.program}`}
                className="grid gap-5 px-5 py-6 sm:px-7 lg:grid-cols-[1.25fr_1fr_1fr_0.7fr_0.75fr_0.7fr] lg:items-center"
              >
                <div>
                  <div className="text-lg font-black">{row.program}</div>
                  <div className={`${darkMode ? 'text-white/55' : 'text-black/55'} mt-2 text-sm font-bold`}>
                    {row.university}
                  </div>
                </div>

                <Info label={isFa ? 'دانشکده' : 'Faculty'} value={row.faculty} darkMode={darkMode} />
                <Info label={isFa ? 'مقطع و زبان' : 'Degree and Language'} value={`${row.degree} / ${row.language}`} darkMode={darkMode} />
                <Info label={isFa ? 'شهریه' : 'Tuition'} value={row.tuition} darkMode={darkMode} strong />
                <Info label={isFa ? 'دپوزیت' : 'Deposit'} value={row.deposit} darkMode={darkMode} strong />

                <button
                  type="button"
                  onClick={onConsultationClick}
                  className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} rounded-[20px] px-5 py-3 text-sm font-black transition hover:scale-[1.02]`}
                >
                  {isFa ? 'مشاوره' : 'Consult'}
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Info({ label, value, darkMode, strong = false }) {
  return (
    <div>
      <div className={`${darkMode ? 'text-white/35' : 'text-black/35'} mb-1 text-xs font-black uppercase tracking-[0.16em] lg:hidden`}>
        {label}
      </div>
      <div className={`${strong ? 'font-black' : 'font-bold'} ${darkMode ? 'text-white/78' : 'text-black/72'} text-sm leading-7`}>
        {value}
      </div>
    </div>
  );
}
