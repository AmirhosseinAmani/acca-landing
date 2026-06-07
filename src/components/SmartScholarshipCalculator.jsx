import React, { useEffect, useMemo, useRef, useState } from 'react';

function useAnimatedFee(fee) {
  const targetAmount = fee?.amount ?? 0;
  const stateRef = useRef({ displayed: targetAmount, animId: null });
  const [displayed, setDisplayed] = useState(targetAmount);

  useEffect(() => {
    const state = stateRef.current;
    if (state.animId !== null) {
      cancelAnimationFrame(state.animId);
      state.animId = null;
    }

    const from = state.displayed;
    const to = targetAmount;
    if (from === to) return undefined;

    const DURATION = 520;
    const startTime = performance.now();
    const startFrom = from;

    const tick = (now) => {
      const t = Math.min((now - startTime) / DURATION, 1);
      const eased = 1 - (1 - t) ** 3;
      const next = Math.round(startFrom + (to - startFrom) * eased);
      state.displayed = next;
      setDisplayed(next);
      if (t < 1) {
        state.animId = requestAnimationFrame(tick);
      } else {
        state.displayed = to;
        state.animId = null;
      }
    };

    state.animId = requestAnimationFrame(tick);
    return () => {
      if (state.animId !== null) {
        cancelAnimationFrame(state.animId);
        state.animId = null;
      }
    };
  }, [targetAmount]);

  if (!fee) return null;
  return { amount: displayed, currency: fee.currency };
}
import { ChevronDown, Search } from 'lucide-react';
import { findScholarshipPriceForSelection } from '../data/scholarships';

const PAYMENT_TYPES = {
  scholarship: 'scholarship',
  cash: 'cash',
  semester: 'semester',
};

const labels = {
  fa: {
    badge: 'SCHOLARSHIP CALCULATOR',
    title: 'محاسبه هوشمند\nبورسیه',
    subtitle: 'برآورد سریع شهریه براساس دیتای واقعی رشته‌ها و دانشگاه‌ها',
    university: 'دانشگاه',
    degree: 'مقطع',
    major: 'رشته',
    programLanguage: '\u0632\u0628\u0627\u0646 \u0631\u0634\u062a\u0647',
    paymentType: 'نوع پرداخت',
    finalTuition: 'شهریه نهایی',
    dataSource: 'همگام با لیست رشته‌ها و شهریه‌ها',
    scholarshipFullPeriodNote: '\u0627\u06cc\u0646 \u0647\u0632\u06cc\u0646\u0647 \u0628\u0631\u0627\u06cc \u06a9\u0644 \u062f\u0648\u0631\u0647 \u062a\u062d\u0635\u06cc\u0644 \u0645\u06cc\u200c\u0628\u0627\u0634\u062f.',
    scholarshipUnavailable: 'قیمت هنوز مشخص نشده',
    scholarshipUnavailableNote: 'برای این دانشگاه، مقطع، رشته و زبان، قیمت مستقیمی در لیست بورسیه ثبت نشده است.',
    loading: 'در حال بارگذاری دیتا...',
    empty: 'دیتایی برای این انتخاب پیدا نشد',
    programsList: 'لیست تخصصی رشته‌ها و شهریه‌ها',
    options: {
      scholarship: 'بورسیه ACCA 100%',
      cash: 'پرداخت نقدی',
      semester: 'پرداخت ترمیک',
    },
  },
  en: {
    badge: 'SCHOLARSHIP CALCULATOR',
    title: 'Smart Scholarship\nCalculator',
    subtitle: 'Quick tuition estimation from the live university programs data',
    university: 'University',
    degree: 'Degree',
    major: 'Major',
    programLanguage: 'Program Language',
    paymentType: 'Payment Type',
    finalTuition: 'Final Tuition',
    dataSource: 'Synced with the Programs & Tuition list',
    scholarshipFullPeriodNote: 'This fee is for the full study period.',
    scholarshipUnavailable: 'Price not specified yet',
    scholarshipUnavailableNote: 'No direct scholarship price is registered for this university, degree, program, and language.',
    loading: 'Loading data...',
    empty: 'No tuition data found for this selection',
    programsList: 'Specialized Programs & Tuition List',
    options: {
      scholarship: 'ACCA 100% Scholarship',
      cash: 'Direct Payment',
      semester: 'Semester Tuition',
    },
  },
};

const degreeTranslations = {
  Associate: 'کاردانی',
  Bachelor: 'کارشناسی',
  Diploma: 'دیپلم',
  'Integrated PHD': 'دکتری پیوسته',
  Master: 'کارشناسی ارشد',
  'Master non Thesis': 'کارشناسی ارشد بدون پایان‌نامه',
  'Master Non Thesis': 'کارشناسی ارشد بدون پایان‌نامه',
  'Master with Thesis': 'کارشناسی ارشد با پایان‌نامه',
  'Master With Thesis': 'کارشناسی ارشد با پایان‌نامه',
  PHD: 'دکتری',
  PhD: 'دکتری',
};

const languageTranslations = {
  Arabic: 'عربی',
  Chinese: 'چینی',
  English: 'انگلیسی',
  'English / Turkish': 'انگلیسی / ترکی',
  'English, Turkish': 'انگلیسی، ترکی',
  French: 'فرانسوی',
  German: 'آلمانی',
  Germany: 'آلمانی',
  Russian: 'روسی',
  Turkish: 'ترکی',
  'Turkish / English': 'ترکی / انگلیسی',
  'Turkish + English': 'ترکی + انگلیسی',
  'Turkish - Russian': 'ترکی - روسی',
  '30% Arabic': '۳۰٪ عربی',
  '30% English': '۳۰٪ انگلیسی',
  '30% Germany': '۳۰٪ آلمانی',
};

const currencyTranslations = {
  USD: 'دلار',
  EUR: 'یورو',
  GBP: 'پوند',
  TRY: 'لیر',
  TL: 'لیر',
  CAD: 'دلار کانادا',
};

export default function SmartScholarshipCalculator({
  darkMode = false,
  language = 'fa',
  programsHref = '?page=programs',
}) {
  const sectionRef = useRef(null);
  const [shouldLoadData, setShouldLoadData] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [university, setUniversity] = useState('');
  const [degree, setDegree] = useState('');
  const [major, setMajor] = useState('');
  const [programLanguage, setProgramLanguage] = useState('');
  const [paymentType, setPaymentType] = useState(PAYMENT_TYPES.semester);
  const [translateProgramName, setTranslateProgramName] = useState(null);

  const isFa = language === 'fa';
  const t = labels[language];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const tryLoadData = () => {
      const rect = section.getBoundingClientRect();
      const userHasScrolled = window.scrollY > Math.min(240, window.innerHeight * 0.25);
      if (userHasScrolled && rect.top < window.innerHeight * 1.15) {
        setShouldLoadData(true);
      }
    };

    const frame = window.requestAnimationFrame(tryLoadData);
    window.addEventListener('scroll', tryLoadData, { passive: true });
    window.addEventListener('resize', tryLoadData);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', tryLoadData);
      window.removeEventListener('resize', tryLoadData);
    };
  }, []);

  useEffect(() => {
    if (!shouldLoadData) return undefined;

    let active = true;

    Promise.all([
      fetch('/data/programs.json').then((response) => response.json()),
      import('../lib/academicTranslations'),
    ])
      .then(([data, translationModule]) => {
        if (!active) return;

        const nextRows = (data.rows || [])
          .filter(
            (row) =>
              row.university &&
              row.degree &&
              row.program &&
              normalizeLocation(row.country) === 'turkey' &&
              normalizeLocation(row.city) === 'istanbul'
          )
          .map(normalizeProgramRow);
        const preferredRow = getPreferredDefaultRow(nextRows);

        setTranslateProgramName(() => translationModule.translateAcademicText);
        setRows(nextRows);
        setUniversity(preferredRow?.university || '');
        setDegree(preferredRow?.degree || '');
        setMajor(preferredRow?.program || '');
        setProgramLanguage(preferredRow?.language || '');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [shouldLoadData]);

  const universityOptions = useMemo(
    () => uniqueSorted(rows.map((row) => row.university)),
    [rows]
  );

  const rowsForUniversity = useMemo(
    () => rows.filter((row) => row.university === university),
    [rows, university]
  );

  const degreeOptions = useMemo(
    () => uniqueSorted(rowsForUniversity.map((row) => row.degree)),
    [rowsForUniversity]
  );

  const rowsForDegree = useMemo(
    () => rowsForUniversity.filter((row) => row.degree === degree),
    [degree, rowsForUniversity]
  );

  const majorOptions = useMemo(
    () => uniqueSorted(rowsForDegree.map((row) => row.program)),
    [rowsForDegree]
  );

  const rowsForMajor = useMemo(
    () => rowsForDegree.filter((row) => row.program === major),
    [major, rowsForDegree]
  );

  const languageOptions = useMemo(
    () => uniqueSorted(rowsForMajor.map((row) => row.language).filter(Boolean)),
    [rowsForMajor]
  );

  const selectedRows = useMemo(
    () => rowsForMajor.filter((row) => !programLanguage || row.language === programLanguage),
    [programLanguage, rowsForMajor]
  );

  const selectedScholarshipFee = useMemo(
    () =>
      findScholarshipPriceForSelection({
        university,
        major,
        degree,
        language: programLanguage,
      }),
    [degree, major, programLanguage, university]
  );

  const selectedFee = useMemo(
    () =>
      paymentType === PAYMENT_TYPES.scholarship
        ? selectedScholarshipFee
        : findBestFee(selectedRows, paymentType),
    [paymentType, selectedRows, selectedScholarshipFee]
  );

  const animatedFee = useAnimatedFee(selectedFee);
  const totalCost = formatFee(animatedFee ?? selectedFee, isFa);
  const hasRealFee = Boolean(selectedFee);
  const isScholarshipPayment = paymentType === PAYMENT_TYPES.scholarship;
  const tuitionDisplay = loading
    ? ''
    : hasRealFee
      ? totalCost
      : isScholarshipPayment
        ? t.scholarshipUnavailable
        : '—';
  const tuitionNote = loading
    ? '\u00a0'
    : hasRealFee
      ? isScholarshipPayment
        ? t.scholarshipFullPeriodNote
        : t.dataSource
      : isScholarshipPayment
        ? t.scholarshipUnavailableNote
        : t.empty;

  const handleUniversityChange = (nextUniversity) => {
    const nextUniversityRows = rows.filter((row) => row.university === nextUniversity);
    const nextDegree = uniqueSorted(nextUniversityRows.map((row) => row.degree))[0] || '';
    const nextMajor =
      uniqueSorted(
        nextUniversityRows
          .filter((row) => row.degree === nextDegree)
          .map((row) => row.program)
      )[0] || '';

    const nextLanguage = uniqueSorted(
      nextUniversityRows
        .filter((row) => row.degree === nextDegree && row.program === nextMajor)
        .map((row) => row.language)
        .filter(Boolean)
    )[0] || '';

    setUniversity(nextUniversity);
    setDegree(nextDegree);
    setMajor(nextMajor);
    setProgramLanguage(nextLanguage);
  };

  const handleDegreeChange = (nextDegree) => {
    const nextMajor =
      uniqueSorted(
        rowsForUniversity
          .filter((row) => row.degree === nextDegree)
          .map((row) => row.program)
      )[0] || '';

    const nextLanguage = uniqueSorted(
      rowsForUniversity
        .filter((row) => row.degree === nextDegree && row.program === nextMajor)
        .map((row) => row.language)
        .filter(Boolean)
    )[0] || '';

    setDegree(nextDegree);
    setMajor(nextMajor);
    setProgramLanguage(nextLanguage);
  };

  const handleMajorChange = (nextMajor) => {
    const nextLanguage = uniqueSorted(
      rowsForDegree
        .filter((row) => row.program === nextMajor)
        .map((row) => row.language)
        .filter(Boolean)
    )[0] || '';

    setMajor(nextMajor);
    setProgramLanguage(nextLanguage);
  };

  return (
    <section
      ref={sectionRef}
      onFocusCapture={() => setShouldLoadData(true)}
      dir={isFa ? 'rtl' : 'ltr'}
      className="relative overflow-visible px-4 pb-24"
    >
      <div className="flex items-center justify-center">
        <section className={`${darkMode ? 'darkGlass' : 'glass'} w-full max-w-5xl rounded-[42px] p-4 md:p-6`}>
          <div className="grid items-center gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className={`${darkMode ? 'bg-white/5' : 'bg-white/50'} rounded-[34px] border border-white/10 p-5 md:p-7`}>
              <div className="mb-6 text-center lg:hidden">
                <div className={`${darkMode ? 'text-white/40' : 'text-black/35'} mb-3 text-[11px] font-black uppercase tracking-[0.28em]`}>
                  {t.badge}
                </div>

                <h1 className="whitespace-pre-line text-3xl font-black leading-[1.15] tracking-tight sm:text-4xl">
                  {t.title}
                </h1>

                <p className={`${darkMode ? 'text-white/55' : 'text-black/50'} mx-auto mt-3 max-w-xs text-sm font-medium leading-7`}>
                  {t.subtitle}
                </p>
              </div>

              <div className="space-y-5">
                <Field label={t.university}>
                  <Select
                    darkMode={darkMode}
                    isFa={isFa}
                    value={university}
                    onChange={handleUniversityChange}
                    loading={loading}
                    loadingLabel={t.loading}
                  >
                    {universityOptions.map((item) => (
                      <Option key={item} value={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </Field>

                <Field label={t.degree}>
                  <Select
                    darkMode={darkMode}
                    isFa={isFa}
                    value={degree}
                    onChange={handleDegreeChange}
                    loading={loading}
                    loadingLabel={t.loading}
                  >
                    {degreeOptions.map((item) => (
                      <Option key={item} value={item}>
                        {displayDegree(item, isFa)}
                      </Option>
                    ))}
                  </Select>
                </Field>

                <Field label={t.major}>
                  <Select
                    darkMode={darkMode}
                    isFa={isFa}
                    value={major}
                    onChange={handleMajorChange}
                    loading={loading}
                    loadingLabel={t.loading}
                  >
                    {majorOptions.map((item) => (
                      <Option key={item} value={item}>
                        {displayProgram(item, isFa, translateProgramName)}
                      </Option>
                    ))}
                  </Select>
                </Field>

                <Field label={t.programLanguage}>
                  <Select
                    darkMode={darkMode}
                    isFa={isFa}
                    value={programLanguage}
                    onChange={setProgramLanguage}
                    loading={loading}
                    loadingLabel={t.loading}
                  >
                    {languageOptions.map((item) => (
                      <Option key={item} value={item}>
                        {displayLanguage(item, isFa)}
                      </Option>
                    ))}
                  </Select>
                </Field>

                <Field label={t.paymentType}>
                  <Select darkMode={darkMode} isFa={isFa} value={paymentType} onChange={setPaymentType}>
                    <Option value={PAYMENT_TYPES.scholarship}>{t.options.scholarship}</Option>
                    <Option value={PAYMENT_TYPES.cash}>{t.options.cash}</Option>
                    <Option value={PAYMENT_TYPES.semester}>{t.options.semester}</Option>
                  </Select>
                </Field>

                <div className={`${darkMode ? 'bg-white/5' : 'bg-white/70'} rounded-[28px] border border-white/10 p-6 text-center`}>
                  <div className="mb-3 text-sm font-black text-emerald-400">
                    {t.finalTuition}
                  </div>

                  <div
                    className={`${!hasRealFee && isScholarshipPayment ? 'text-2xl leading-tight md:text-3xl' : 'text-4xl leading-none tracking-tight sm:text-5xl md:text-6xl'} flex min-h-[88px] items-center justify-center font-black tabular-nums md:min-h-[104px]`}
                  >
                    {tuitionDisplay}
                  </div>

                  <div className="mt-3 min-h-5 text-sm font-medium opacity-55">
                    {tuitionNote}
                  </div>
                </div>

                <a
                  href={programsHref}
                  className={`w-full rounded-[22px] py-4 text-base font-black transition-all ${
                    darkMode ? 'bg-white text-black' : 'bg-[#121726] text-white'
                  } inline-flex items-center justify-center text-center`}
                >
                  {t.programsList}
                </a>
              </div>
            </div>

            <div className="hidden flex-col items-center justify-center px-8 text-center lg:flex">
              <div className={`${darkMode ? 'text-white/35' : 'text-black/35'} mb-8 text-sm font-black uppercase tracking-[0.35em]`}>
                {t.badge}
              </div>

              <h1 className="max-w-xl whitespace-pre-line text-5xl font-black leading-[1.1] tracking-tight md:text-6xl">
                {t.title}
              </h1>

              <p className={`${darkMode ? 'text-white/55' : 'text-black/50'} mt-8 max-w-md text-lg font-medium leading-9`}>
                {t.subtitle}
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-3 block text-sm font-bold opacity-70">{label}</span>
      {children}
    </label>
  );
}

function Option({ children }) {
  return children;
}

function Select({ darkMode, isFa, children, value, onChange, loading, loadingLabel }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const options = React.Children.toArray(children);
  const selectedOption = options.find((option) => option.props.value === value);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) =>
      String(option.props.children || '').toLowerCase().includes(q) ||
      String(option.props.value || '').toLowerCase().includes(q)
    );
  }, [options, search]);

  const closeDropdown = () => {
    setOpen(false);
    setSearch('');
  };

  useEffect(() => {
    if (!open) return undefined;
    function handleOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeDropdown();
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => (open ? closeDropdown() : setOpen(true))}
        disabled={loading || !options.length}
        className={`group flex w-full items-center justify-between rounded-[22px] border px-5 py-4 text-base font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-55 ${
          darkMode
            ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
            : 'border-black/5 bg-white/80 text-black hover:bg-white'
        }`}
      >
        <span className="truncate">
          {loading ? loadingLabel : selectedOption?.props.children || '—'}
        </span>

        <div
          className={`transition-all duration-300 ${
            open ? 'rotate-180 opacity-100' : 'opacity-60'
          } group-hover:opacity-100`}
        >
          <ChevronDown size={18} />
        </div>
      </button>

      <div
        className={`absolute left-0 right-0 top-[calc(100%+12px)] z-50 origin-top transition-all duration-300 ${
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-2 scale-95 opacity-0'
        }`}
      >
        <div
          className={`rounded-[26px] border shadow-2xl backdrop-blur-3xl ${
            darkMode
              ? 'border-white/10 bg-[#111827]/90'
              : 'border-white/70 bg-white/95'
          }`}
        >
          <div className={`${darkMode ? 'border-white/10' : 'border-black/8'} border-b p-2`}>
            <label className={`${darkMode ? 'bg-white/8' : 'bg-black/[0.04]'} flex items-center gap-2 rounded-[16px] px-3 py-2`}>
              <Search size={15} className="shrink-0 opacity-45" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isFa ? 'جستجو...' : 'Search...'}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:opacity-40"
              />
            </label>
          </div>
          <div className="max-h-[240px] space-y-1 overflow-y-auto p-2">
            {filteredOptions.length ? filteredOptions.map((option) => {
              const isSelected = option.props.value === value;

              return (
                <button
                  key={option.props.value}
                  type="button"
                  onClick={() => {
                    onChange(option.props.value);
                    closeDropdown();
                  }}
                  className={`flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-left text-sm font-semibold transition-all duration-200 md:text-base ${
                    isSelected
                      ? darkMode
                        ? 'bg-white text-black'
                        : 'bg-[#161925] text-white'
                      : darkMode
                        ? 'text-white/80 hover:bg-white/10 hover:text-white'
                        : 'text-black/75 hover:bg-black/5 hover:text-black'
                  }`}
                >
                  <span>{option.props.children}</span>
                  {isSelected && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                </button>
              );
            }) : (
              <div className="px-4 py-3 text-center text-sm opacity-45">{isFa ? 'موردی پیدا نشد' : 'No results'}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function normalizeProgramRow(row) {
  return {
    ...row,
    cashFees: row.cashFees || '',
    tuitionFee: row.tuitionFee || row.semesters?.[0]?.discountedFee || '',
  };
}

function getPreferredDefaultRow(rows) {
  return (
    rows.find(
      (row) =>
        row.country === 'Turkey' &&
        row.city === 'İstanbul' &&
        row.university === 'ISTANBUL MEDIPOL UNIVERSITY' &&
        normalize(row.program) === 'medicine'
    ) ||
    rows.find(
      (row) =>
        row.country === 'Turkey' &&
        row.city === 'İstanbul' &&
        normalize(row.program) === 'medicine'
    ) ||
    rows[0]
  );
}

function findBestFee(rows, paymentType) {
  if (paymentType === PAYMENT_TYPES.scholarship) return null;

  const feeKey = paymentType === PAYMENT_TYPES.cash ? 'cashFees' : 'tuitionFee';
  const primaryRow = rows[0];
  const fee = primaryRow ? parseFee(primaryRow[feeKey]) : null;

  return fee && fee.amount > 0 ? fee : null;
}

function parseFee(value) {
  const text = String(value || '').trim();
  const match = text.match(/([\d.,]+)/);
  if (!match) return null;

  const amount = Number(match[1].replace(/,/g, ''));
  if (!Number.isFinite(amount)) return null;

  const currency = text
    .replace(match[1], '')
    .trim()
    .replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '')
    .toUpperCase();

  return { amount, currency };
}

function formatFee(fee, isFa) {
  if (!fee) return '';

  const amount = new Intl.NumberFormat(isFa ? 'fa-IR' : 'en-US', {
    maximumFractionDigits: 2,
  }).format(fee.amount);
  const currency = isFa ? currencyTranslations[fee.currency] || fee.currency : fee.currency;

  return currency ? `${amount} ${currency}` : amount;
}

function uniqueSorted(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    String(a).localeCompare(String(b), undefined, { sensitivity: 'base' })
  );
}

function displayDegree(value, isFa) {
  return isFa ? degreeTranslations[value] || value : value;
}

function displayLanguage(value, isFa) {
  return isFa ? languageTranslations[value] || value : value;
}

function displayProgram(value, isFa, translateProgramName) {
  return isFa && translateProgramName ? translateProgramName(value) : value;
}

function normalize(value) {
  return String(value || '').trim().toLocaleLowerCase('en-US');
}

function normalizeLocation(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/\u0131/g, 'i');
}
