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
    dataSource: 'از دیتای شهریه دانشگاه',
    scholarshipFullPeriodNote: '\u0627\u06cc\u0646 \u0647\u0632\u06cc\u0646\u0647 \u0628\u0631\u0627\u06cc \u06a9\u0644 \u062f\u0648\u0631\u0647 \u062a\u062d\u0635\u06cc\u0644 \u0645\u06cc\u200c\u0628\u0627\u0634\u062f.',
    scholarshipUnavailable: '\u0641\u0639\u0644\u0627\u064b \u0645\u0648\u062c\u0648\u062f \u0646\u06cc\u0633\u062a',
    scholarshipUnavailableNote: '\u0628\u0631\u0627\u06cc \u0627\u06cc\u0646 \u0627\u0646\u062a\u062e\u0627\u0628 \u062f\u0631 \u0644\u06cc\u0633\u062a \u0628\u0648\u0631\u0633\u06cc\u0647 ACCA 100 \u0642\u06cc\u0645\u062a\u06cc \u062b\u0628\u062a \u0646\u0634\u062f\u0647 \u0627\u0633\u062a.',
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
    dataSource: 'From university tuition data',
    scholarshipFullPeriodNote: 'This fee is for the full study period.',
    scholarshipUnavailable: 'Currently unavailable',
    scholarshipUnavailableNote: 'No ACCA 100 scholarship price is registered for this selection yet.',
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

    fetch('/data/calculator-programs.json')
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;

        const nextRows = (data.rows || [])
          .filter(
            (row) =>
              row.university &&
              row.degree &&
              row.program &&
              row.country === 'Turkey' &&
              row.city === 'İstanbul'
          )
          .map(normalizeProgramRow);
        const preferredRow = getPreferredDefaultRow(nextRows);

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
        programRows: selectedRows.length ? selectedRows : rowsForMajor,
      }),
    [degree, major, programLanguage, rowsForMajor, selectedRows, university]
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
      className="relative overflow-visible px-4 py-20"
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
                        {displayProgram(item, isFa)}
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
                    className={`${!hasRealFee && isScholarshipPayment ? 'text-2xl leading-tight md:text-3xl' : 'text-5xl tracking-tight md:text-6xl'} min-h-[64px] font-black`}
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

              <h1 className="max-w-xl whitespace-pre-line text-6xl font-black leading-[1.1] tracking-tight xl:text-7xl">
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
  const candidates = rows
    .map((row) => parseFee(row[feeKey]))
    .filter((fee) => fee && fee.amount > 0)
    .sort((a, b) => a.amount - b.amount);

  return candidates[0] || null;
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

function displayProgram(value, isFa) {
  return isFa ? translateAcademicText(value) : value;
}

function translateAcademicText(value) {
  if (!value) return '—';

  const cleaned = String(value)
    .replace(/[._]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const exact = exactAcademicTranslations[cleaned.toLowerCase()];

  if (exact) return exact;

  return academicPhraseTranslations.reduce(
    (text, [english, persian]) => replacePhrase(text, english, persian),
    cleaned
  );
}

function replacePhrase(text, english, persian) {
  const escaped = english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), persian);
}

function normalize(value) {
  return String(value || '').trim().toLocaleLowerCase('en-US');
}

const exactAcademicTranslations = {
  media: 'رسانه',
  bachelor: 'کارشناسی',
  agriculture: 'کشاورزی',
  architecture: 'معماری',
  business: 'کسب‌وکار',
  communication: 'ارتباطات',
  conservatory: 'کنسرواتوار',
  dentistry: 'دندانپزشکی',
  education: 'آموزش',
  engineering: 'مهندسی',
  humanities: 'علوم انسانی',
  medicine: 'پزشکی',
  pharmacy: 'داروسازی',
};

const academicPhraseTranslations = [
  ['Turkish Language and Literature', 'زبان و ادبیات ترکی'],
  ['Information Systems Engineering', 'مهندسی سیستم‌های اطلاعات'],
  ['Educational Administration Supervision Economics and Planning', 'مدیریت آموزشی، نظارت، اقتصاد و برنامه‌ریزی'],
  ['Radio, TV and Cinema', 'رادیو، تلویزیون و سینما'],
  ['Radio-TV Cinema', 'رادیو، تلویزیون و سینما'],
  ['Public Relations and Publicity', 'روابط عمومی و تبلیغات'],
  ['Psycological Guidance and Counselling', 'راهنمایی و مشاوره روان‌شناختی'],
  ['Psychological Guidance and Counselling', 'راهنمایی و مشاوره روان‌شناختی'],
  ['Pre-School Education', 'آموزش پیش‌دبستانی'],
  ['Interior Architecture and Environmental Design', 'معماری داخلی و طراحی محیطی'],
  ['Interior Architecture & Environmental Design', 'معماری داخلی و طراحی محیطی'],
  ['Interior Architecture', 'معماری داخلی'],
  ['Tourism Management', 'مدیریت گردشگری'],
  ['Special Education', 'آموزش ویژه'],
  ['Public Health Nursing', 'پرستاری سلامت عمومی'],
  ['Veterinary Internal Medicine', 'پزشکی داخلی دامپزشکی'],
  ['Curriculum and Instruction', 'برنامه درسی و آموزش'],
  ['Department of Surgery', 'گروه جراحی'],
  ['Department of', 'گروه'],
  ['Institute Of Graduate Pgrograms', 'موسسه برنامه‌های تحصیلات تکمیلی'],
  ['Institute Of Graduate Programs', 'موسسه برنامه‌های تحصیلات تکمیلی'],
  ['Graduate School of Health Science', 'دانشکده تحصیلات تکمیلی علوم سلامت'],
  ['Graduate School of Natural and Applied Sciences', 'دانشکده تحصیلات تکمیلی علوم طبیعی و کاربردی'],
  ['Graduate School of Natural Sciences', 'دانشکده تحصیلات تکمیلی علوم طبیعی'],
  ['Graduate School of Science and Engineering', 'دانشکده تحصیلات تکمیلی علوم و مهندسی'],
  ['Graduate School of Social Science', 'دانشکده تحصیلات تکمیلی علوم اجتماعی'],
  ['Artificial Intelligence Engineering and Data Science', 'مهندسی هوش مصنوعی و علم داده'],
  ['Artificial Intelligence and Data Engineering', 'هوش مصنوعی و مهندسی داده'],
  ['Artificial Intelligence Engineering', 'مهندسی هوش مصنوعی'],
  ['Artificial Intelligence', 'هوش مصنوعی'],
  ['Computer Science and Software Engineering', 'علوم کامپیوتر و مهندسی نرم‌افزار'],
  ['Computer Science', 'علوم کامپیوتر'],
  ['Information Technology', 'فناوری اطلاعات'],
  ['Information Science', 'علوم اطلاعات'],
  ['Information Systems', 'سیستم‌های اطلاعات'],
  ['Software Engineering', 'مهندسی نرم‌افزار'],
  ['Electrical and Electronics Engineering', 'مهندسی برق و الکترونیک'],
  ['Electronics Engineering', 'مهندسی الکترونیک'],
  ['Electrical Engineering', 'مهندسی برق'],
  ['Industrial Engineering', 'مهندسی صنایع'],
  ['Civil Engineering', 'مهندسی عمران'],
  ['Mechanical Engineering', 'مهندسی مکانیک'],
  ['Biomedical Engineering', 'مهندسی پزشکی'],
  ['Environmental Engineering', 'مهندسی محیط زیست'],
  ['Chemical Engineering', 'مهندسی شیمی'],
  ['Computer Engineering', 'مهندسی کامپیوتر'],
  ['Architecture and Design', 'معماری و طراحی'],
  ['Architecture Design', 'طراحی معماری'],
  ['Architecture, Design and Fine Arts', 'معماری، طراحی و هنرهای زیبا'],
  ['Fine Arts and Design', 'هنرهای زیبا و طراحی'],
  ['Fine Arts', 'هنرهای زیبا'],
  ['Art and Design', 'هنر و طراحی'],
  ['Arts and Sciences', 'هنر و علوم'],
  ['Arts and Science', 'هنر و علوم'],
  ['Administrative and Social Sciences', 'علوم اداری و اجتماعی'],
  ['Economics and Administrative Sciences', 'علوم اقتصادی و اداری'],
  ['Economics, Administrative and Social Sciences', 'اقتصاد، علوم اداری و اجتماعی'],
  ['Economics and Social Sciences', 'اقتصاد و علوم اجتماعی'],
  ['Business Administration', 'مدیریت کسب‌وکار'],
  ['Business and Management Science', 'علوم کسب‌وکار و مدیریت'],
  ['Business and Social Science', 'کسب‌وکار و علوم اجتماعی'],
  ['Business, Social & Decision Sciences', 'کسب‌وکار، علوم اجتماعی و تصمیم‌گیری'],
  ['Health Sciences', 'علوم سلامت'],
  ['Health Science', 'علوم سلامت'],
  ['Health Programs', 'برنامه‌های سلامت'],
  ['Educational Sciences', 'علوم تربیتی'],
  ['Educational Programs', 'برنامه‌های آموزشی'],
  ['Applied Science', 'علوم کاربردی'],
  ['Natural Sciences', 'علوم طبیعی'],
  ['Social Sciences', 'علوم اجتماعی'],
  ['Theology', 'الهیات'],
  ['Aviation and Space Sciences', 'علوم هوانوردی و فضایی'],
  ['Civil Aviation', 'هوانوردی غیرنظامی'],
  ['Maritime Management', 'مدیریت دریایی'],
  ['Maritime Studies', 'مطالعات دریایی'],
  ['Nursing', 'پرستاری'],
  ['Physiotherapy and Rehabilitation', 'فیزیوتراپی و توانبخشی'],
  ['Nutrition and Dietetics', 'تغذیه و رژیم‌درمانی'],
  ['Molecular Biology and Genetics', 'زیست‌شناسی مولکولی و ژنتیک'],
  ['Psychology', 'روان‌شناسی'],
  ['Pharmacy Services', 'خدمات داروسازی'],
  ['Clinical Pharmacy', 'داروسازی بالینی'],
  ['Pharmacy', 'داروسازی'],
  ['Medicine', 'پزشکی'],
  ['Dentistry', 'دندانپزشکی'],
  ['Veterinary', 'دامپزشکی'],
  ['Toxicology', 'سم‌شناسی'],
  ['Pedodontics', 'دندانپزشکی کودکان'],
  ['Electrical and Electronic Engineering', 'مهندسی برق و الکترونیک'],
  ['Electrical and Electronic', 'برق و الکترونیک'],
  ['English Language Teaching', 'آموزش زبان انگلیسی'],
  ['Child Development', 'رشد کودک'],
  ['Human Resources Management', 'مدیریت منابع انسانی'],
  ['Human Resource Management', 'مدیریت منابع انسانی'],
  ['Health Management', 'مدیریت سلامت'],
  ['Aviation Management', 'مدیریت هوانوردی'],
  ['Sports Science', 'علوم ورزشی'],
  ['Gastronomy and Culinary Arts', 'گاسترونومی و هنرهای آشپزی'],
  ['Human Resources', 'منابع انسانی'],
  ['Human Resource', 'منابع انسانی'],
  ['Industrial Design', 'طراحی صنعتی'],
  ['Industrial Engineering', 'مهندسی صنایع'],
  ['Industrial', 'صنعتی'],
  ['History of Art', 'تاریخ هنر'],
  ['History', 'تاریخ'],
  ['Sociology', 'جامعه‌شناسی'],
  ['Philosophy', 'فلسفه'],
  ['Mathematics', 'ریاضیات'],
  ['Mathematical', 'ریاضی'],
  ['Physics', 'فیزیک'],
  ['Chemistry', 'شیمی'],
  ['Biology', 'زیست‌شناسی'],
  ['Genetics', 'ژنتیک'],
  ['Biochemistry', 'بیوشیمی'],
  ['Biotechnology', 'بیوتکنولوژی'],
  ['Statistics', 'آمار'],
  ['Accounting', 'حسابداری'],
  ['Finance', 'امور مالی'],
  ['Marketing', 'بازاریابی'],
  ['Banking', 'بانکداری'],
  ['Insurance', 'بیمه'],
  ['International Relations', 'روابط بین‌الملل'],
  ['International Trade', 'تجارت بین‌الملل'],
  ['International', 'بین‌الملل'],
  ['Political Science', 'علوم سیاسی'],
  ['Public Administration', 'مدیریت دولتی'],
  ['Journalism', 'روزنامه‌نگاری'],
  ['Visual Arts', 'هنرهای تجسمی'],
  ['Visual Communication', 'ارتباطات تجسمی'],
  ['Graphic Design', 'طراحی گرافیک'],
  ['Fashion Design', 'طراحی مد'],
  ['Game Design', 'طراحی بازی'],
  ['Animation', 'انیمیشن'],
  ['Photography', 'عکاسی'],
  ['Theater', 'تئاتر'],
  ['Music', 'موسیقی'],
  ['Sports Management', 'مدیریت ورزشی'],
  ['Physical Education', 'تربیت بدنی'],
  ['Sports', 'ورزش'],
  ['Gastronomy', 'گاسترونومی'],
  ['Culinary', 'آشپزی'],
  ['Logistics', 'لجستیک'],
  ['Supply Chain', 'زنجیره تأمین'],
  ['Real Estate', 'املاک و مستغلات'],
  ['Urban Planning', 'شهرسازی'],
  ['Landscape', 'منظر'],
  ['Main Campus', 'پردیس اصلی'],
  ['Campus', 'پردیس'],
  ['Health', 'سلامت'],
  ['Audiology', 'شنوایی‌شناسی'],
  ['Ergotherapy', 'کاردرمانی'],
  ['Optometry', 'بینایی‌سنجی'],
  ['Perfusion', 'پرفیوژن'],
  ['Physiotherapy', 'فیزیوتراپی'],
  ['Radiotherapy', 'پرتودرمانی'],
  ['Orthopedics', 'ارتوپدی'],
  ['Aviation', 'هوانوردی'],
  ['Language Teaching', 'آموزش زبان'],
  ['Teaching', 'آموزش'],
  ['Tourism', 'گردشگری'],
  ['Management', 'مدیریت'],
  ['Economics', 'اقتصاد'],
  ['Administration', 'مدیریت'],
  ['Communication', 'ارتباطات'],
  ['Administrative', 'اداری'],
  ['Commercial', 'بازرگانی'],
  ['Environmental', 'محیط زیست'],
  ['Performing', 'اجرایی'],
  ['Applied', 'کاربردی'],
  ['Natural', 'طبیعی'],
  ['Decision', 'تصمیم‌گیری'],
  ['Studies', 'مطالعات'],
  ['Programs', 'برنامه‌ها'],
  ['Program', 'برنامه'],
  ['School', 'مدرسه'],
  ['College', 'کالج'],
  ['Faculty', 'دانشکده'],
  ['Media', 'رسانه'],
  ['Education', 'آموزش'],
  ['Counselling', 'مشاوره'],
  ['Counseling', 'مشاوره'],
  ['Architecture', 'معماری'],
  ['Engineering', 'مهندسی'],
  ['Informatics', 'انفورماتیک'],
  ['Science', 'علوم'],
  ['Sciences', 'علوم'],
  ['Design', 'طراحی'],
  ['Arts', 'هنرها'],
  ['Art', 'هنر'],
  ['Law', 'حقوق'],
  ['Language', 'زبان'],
  ['Literature', 'ادبیات'],
  ['Turkish', 'ترکی'],
  ['English', 'انگلیسی'],
  ['Faculty of', 'دانشکده'],
  ['College of', 'کالج'],
  ['School of', 'مدرسه'],
  ['and', 'و'],
  ['of', ''],
].sort((a, b) => b[0].length - a[0].length);
