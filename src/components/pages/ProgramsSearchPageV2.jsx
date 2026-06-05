import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getUniversityLogo, getUniversityWebsite, isStudyFansUrl } from '../../data/universityLogoMap';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Moon,
  Printer,
  RotateCcw,
  Search,
  Sun,
  X,
} from 'lucide-react';
import PriceRangeSlider from '../PriceRangeSlider';
import { BackButton, MainNav } from '../SiteNav';

const EXPORT_LIMIT = 100;
const AVAILABLE_STATUS = 'Available';

const filterFields = [
  { key: 'country', rowKey: 'country', labelFa: 'کشور', labelEn: 'Country' },
  { key: 'city', rowKey: 'city', labelFa: 'شهر', labelEn: 'City' },
  { key: 'status', rowKey: 'status', labelFa: 'وضعیت', labelEn: 'Status' },
  { key: 'university', rowKey: 'university', labelFa: 'دانشگاه', labelEn: 'University' },
  { key: 'degree', rowKey: 'degree', labelFa: 'مقطع', labelEn: 'Degree' },
  { key: 'faculty', rowKey: 'faculty', labelFa: 'دانشکده', labelEn: 'Faculty' },
  { key: 'language', rowKey: 'language', labelFa: 'زبان', labelEn: 'Language' },
  { key: 'department', rowKey: 'program', labelFa: 'رشته', labelEn: 'Program' },
];

const PRINT_PAYLOAD_KEY = 'accaProgramsPrintPayload';

// Country values as stored in programs.json
// Turkey = mainland Turkey, KKTC = Northern Cyprus (Kuzey Kıbrıs Türk Cumhuriyeti)
const DEFAULT_COUNTRIES = ['Turkey', 'KKTC'];

function createInitialFilters() {
  const filters = Object.fromEntries(
    filterFields.map((field) => [field.key, getEmptyFilterValue(field.key)])
  );
  // Default: show only Turkey + Cyprus programs on every entry path.
  // createInitialFiltersFromUrl() overrides this only if the URL
  // explicitly carries a ?country= param, so deep-links still work.
  filters.country = DEFAULT_COUNTRIES;
  return filters;
}

function createInitialFiltersFromUrl() {
  const filters = createInitialFilters();

  if (typeof window === 'undefined') return filters;

  const params = new URLSearchParams(window.location.search);

  filterFields.forEach((field) => {
    const values = collectFilterParams(params, field.key, field.rowKey);

    if (!values.length) return;

    filters[field.key] = values;
  });

  return filters;
}

function collectFilterParams(params, ...keys) {
  const uniqueKeys = Array.from(new Set(keys.filter(Boolean)));
  return dedupeFilterValues(
    uniqueKeys.flatMap((key) => params.getAll(key)).flatMap(splitFilterParam).filter(Boolean)
  );
}

function splitFilterParam(value) {
  return String(value || '')
    .split('|')
    .flatMap((part) => part.split(','))
    .map((part) => part.trim());
}

function getEmptyFilterValue() {
  return [];
}

function dedupeFilterValues(values) {
  const seen = new Set();
  const uniqueValues = [];

  values.forEach((value) => {
    const normalized = normalize(value);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    uniqueValues.push(value);
  });

  return uniqueValues;
}

function createEmptyPriceRange() {
  return { min: '', max: '' };
}

function createInitialPriceRangeFromUrl() {
  if (typeof window === 'undefined') return createEmptyPriceRange();

  const params = new URLSearchParams(window.location.search);
  const rangeValue = params.get('priceRange');
  const [rangeMin, rangeMax] = rangeValue ? splitFilterParam(rangeValue) : [];

  return {
    min: params.get('minPrice') || rangeMin || '',
    max: params.get('maxPrice') || rangeMax || '',
  };
}

function getInitialSearchQueryFromUrl() {
  if (typeof window === 'undefined') return '';

  const params = new URLSearchParams(window.location.search);
  return params.get('search') || params.get('query') || params.get('q') || '';
}

const copy = {
  fa: {
    eyebrow: 'رشته‌ها و دانشگاه‌ها',
    title: 'جستجوی کامل رشته‌ها',
    description: 'فیلترها از کشور شروع می‌شوند و هر انتخاب، گزینه‌های بعدی را دقیق‌تر و محدودتر می‌کند.',
    back: 'بازگشت',
    filters: 'فیلتر جستجو',
    activeFilters: (count) => `${formatNumber(count, true)} فیلتر فعال`,
    reset: 'ریست فیلترها',
    searchPlaceholder: 'جستجو در رشته، دانشگاه، شهر، هزینه...',
    print: 'چاپ',
    export: 'دریافت خروجی',
    exportNote: (limit) => `خروجی حداکثر ${formatNumber(limit, true)} ردیف اول`,
    show: 'نمایش',
    rows: 'ردیف',
    loading: 'در حال بارگذاری...',
    noResults: 'نتیجه‌ای برای این فیلترها پیدا نشد.',
    consult: 'مشاوره',
    website: 'وب‌سایت',
    all: (label) => `همه ${label}`,
    search: 'جستجو...',
    moreOptions: 'برای دیدن گزینه‌های بیشتر جستجو کنید.',
    noOptions: 'گزینه‌ای پیدا نشد.',
    clearFilter: 'پاک کردن فیلتر',
    priceRange: '\u0645\u062d\u062f\u0648\u062f\u0647 \u0634\u0647\u0631\u06cc\u0647',
    minPrice: '\u062d\u062f\u0627\u0642\u0644',
    maxPrice: '\u062d\u062f\u0627\u06a9\u062b\u0631',
    clearPriceRange: '\u062d\u0630\u0641 \u0645\u062d\u062f\u0648\u062f\u0647',
    firstRows: (shown, total) =>
      `چاپ و خروجی: ${formatNumber(shown, true)} ردیف اول از ${formatNumber(total, true)} نتیجه`,
    summary: (from, to, total) =>
      `نمایش ${formatNumber(from, true)} تا ${formatNumber(to, true)} از ${formatNumber(total, true)} ردیف`,
    headers: {
      program: 'رشته',
      university: 'دانشگاه',
      location: 'موقعیت',
      status: 'وضعیت',
      degree: 'مقطع',
      faculty: 'دانشکده',
      years: 'مدت',
      language: 'زبان',
      tuition: 'شهریه',
      deposit: 'دپوزیت',
      prep: 'دوره زبان',
      cash: 'نقدی',
      action: 'اقدام',
    },
  },
  en: {
    eyebrow: 'PROGRAMS & UNIVERSITIES',
    title: 'Programs Search',
    description: 'Filters cascade from country to program so each choice narrows the next options.',
    back: 'Back',
    filters: 'Search Filter',
    activeFilters: (count) => `${count} active filters`,
    reset: 'Reset Filters',
    searchPlaceholder: 'Search program, university, city, fees...',
    print: 'Print',
    export: 'Export CSV',
    exportNote: (limit) => `Exports first ${limit} rows max`,
    show: 'Show',
    rows: 'entries',
    loading: 'Loading...',
    noResults: 'No matching programs found.',
    consult: 'Consult',
    website: 'Website',
    all: (label) => `All ${label}`,
    search: 'Search...',
    moreOptions: 'Search to reveal more options.',
    noOptions: 'No options found.',
    clearFilter: 'Clear filter',
    priceRange: 'Tuition Range',
    minPrice: 'Minimum',
    maxPrice: 'Maximum',
    clearPriceRange: 'Clear range',
    firstRows: (shown, total) => `Export and print: first ${shown} rows from ${total} results`,
    summary: (from, to, total) => `Showing ${from} to ${to} of ${total} entries`,
    headers: {
      program: 'Program',
      university: 'University',
      location: 'Location',
      status: 'Status',
      degree: 'Degree',
      faculty: 'Faculty',
      years: 'Years',
      language: 'Language',
      tuition: 'Tuition',
      deposit: 'Deposit',
      prep: 'Prep',
      cash: 'Cash',
      action: 'Action',
    },
  },
};

const csvColumns = [
  { key: 'program', en: 'Program', fa: 'رشته', value: (row, isFa) => displayValue('program', row.program, isFa) },
  { key: 'university', en: 'University', fa: 'دانشگاه', value: (row) => row.university },
  { key: 'country', en: 'Country', fa: 'کشور', value: (row, isFa) => displayValue('country', row.country, isFa) },
  { key: 'city', en: 'City', fa: 'شهر', value: (row, isFa) => displayValue('city', row.city, isFa) },
  { key: 'status', en: 'Status', fa: 'وضعیت', value: (row, isFa) => displayValue('status', row.status, isFa) },
  { key: 'degree', en: 'Degree', fa: 'مقطع', value: (row, isFa) => displayValue('degree', row.degree, isFa) },
  { key: 'faculty', en: 'Faculty', fa: 'دانشکده', value: (row, isFa) => displayValue('faculty', row.faculty, isFa) },
  { key: 'years', en: 'Years', fa: 'مدت', value: (row, isFa) => displayYears(row.years, isFa) },
  { key: 'language', en: 'Language', fa: 'زبان', value: (row, isFa) => displayValue('language', row.language, isFa) },
  { key: 'tuitionFee', en: 'Tuition Fee', fa: 'شهریه', value: (row, isFa) => displayFee(row.tuitionFee, isFa) },
  { key: 'depositFee', en: 'Deposit Fee', fa: 'دپوزیت', value: (row, isFa) => displayFee(row.depositFee, isFa) },
  { key: 'prepSchoolFee', en: 'Prep School Fee', fa: 'دوره زبان', value: (row, isFa) => displayFee(row.prepSchoolFee, isFa) },
  { key: 'cashFees', en: 'Cash Fee', fa: 'پرداخت نقدی', value: (row, isFa) => displayFee(row.cashFees, isFa) },
  { key: 'campusAddress', en: 'Campus Address', fa: 'آدرس', value: (row, isFa) => displayValue('address', row.campusAddress, isFa) },
];

export default function ProgramsSearchPageV2(props) {
  const isPrintPreview =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('print') === '1';

  if (isPrintPreview) {
    return <ProgramsPrintPreview {...props} />;
  }

  return <ProgramsSearchWorkspace {...props} />;
}

function ProgramsSearchWorkspace({
  darkMode,
  isFa,
  ACCA_LOGO_SRC,
  onConsultationClick,
  onToggleDarkMode,
  onToggleLanguage,
}) {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState(() => createInitialFiltersFromUrl());
  const [query, setQuery] = useState(() => getInitialSearchQueryFromUrl());
  const [priceRange, setPriceRange] = useState(() => createInitialPriceRangeFromUrl());
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const ui = isFa ? copy.fa : copy.en;

  useEffect(() => {
    let active = true;

    fetch('/data/programs.json')
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setRows((data.rows || []).map(normalizeProgramRow));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const priceBounds = useMemo(() => {
    const fieldFilteredRows = rows.filter((row) =>
      filterFields.every((field) => rowMatchesFilter(row, field, filters[field.key]))
    );
    return getPriceBounds(fieldFilteredRows.map((row) => getProgramPriceAmount(row)));
  }, [filters, rows]);
  const effectivePriceRange = useMemo(
    () => normalizePriceRange(priceRange, priceBounds),
    [priceBounds, priceRange]
  );
  const priceRangeActive = useMemo(
    () => isPriceRangeActive(priceRange, priceBounds),
    [priceBounds, priceRange]
  );

  const cascadedOptions = useMemo(() => {
    const nextOptions = {};

    filterFields.forEach((field) => {
      const otherFields = filterFields.filter((f) => f.key !== field.key);
      const availableRows = rows.filter((row) => {
        const matchesFilters = otherFields.every((f) =>
          rowMatchesFilter(row, f, filters[f.key])
        );
        if (!matchesFilters) return false;
        if (priceRangeActive) {
          const rowPrice = getProgramPriceAmount(row);
          if (
            !Number.isFinite(rowPrice) ||
            rowPrice < effectivePriceRange.min ||
            rowPrice > effectivePriceRange.max
          ) {
            return false;
          }
        }
        return true;
      });

      nextOptions[field.key] = getUniqueFieldValues(availableRows, field);
    });

    return nextOptions;
  }, [effectivePriceRange, filters, priceRangeActive, rows]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = normalize(query);

    return rows.filter((row) => {
      const matchesFilters = filterFields.every((field) =>
        rowMatchesFilter(row, field, filters[field.key])
      );

      if (!matchesFilters) return false;

      if (priceRangeActive) {
        const rowPrice = getProgramPriceAmount(row);
        if (
          !Number.isFinite(rowPrice) ||
          rowPrice < effectivePriceRange.min ||
          rowPrice > effectivePriceRange.max
        ) {
          return false;
        }
      }

      if (!normalizedQuery) return true;

      return getSearchText(row, isFa).includes(normalizedQuery);
    });
  }, [effectivePriceRange, filters, isFa, priceRangeActive, query, rows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const visibleRows = filteredRows.slice(startIndex, startIndex + pageSize);
  const exportRows = filteredRows.slice(0, EXPORT_LIMIT);
  const activeFilterCount =
    Object.values(filters).reduce(
      (count, value) => count + (Array.isArray(value) ? dedupeFilterValues(value).length : value ? 1 : 0),
      0
    ) + (query ? 1 : 0) + (priceRangeActive ? 1 : 0);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: Array.isArray(value) ? dedupeFilterValues(value) : value,
    }));
  };

  const resetFilters = () => {
    setFilters(createInitialFilters());
    setPriceRange(createEmptyPriceRange());
    setQuery('');
    setPage(1);
  };

  const downloadCsv = () => {
    const csv = [
      csvColumns.map((column) => csvEscape(isFa ? column.fa : column.en)).join(','),
      ...exportRows.map((row) =>
        csvColumns.map((column) => csvEscape(column.value(row, isFa) || '')).join(',')
      ),
    ].join('\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = isFa ? 'acca-programs-fa-first-100.csv' : 'acca-programs-en-first-100.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const payload = createPrintPayload({
      rows: exportRows,
      filters,
      priceRange,
      priceBounds,
      query,
      isFa,
      ui,
      totalCount: filteredRows.length,
    });

    sessionStorage.setItem(PRINT_PAYLOAD_KEY, JSON.stringify(payload));
    window.location.assign(`${window.location.pathname}?page=programs&print=1`);
  };

  return (
    <div
      className={`${darkMode ? 'bg-[#050816] text-white' : 'bg-[#F7F1E8] text-neutral-950'} program-page min-h-screen overflow-hidden px-4 py-5 sm:px-6 sm:py-8`}
      dir={isFa ? 'rtl' : 'ltr'}
    >
      <style>{`
        .program-print-only {
          display: none;
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          html,
          body {
            background: #ffffff !important;
          }

          .program-page {
            background: #ffffff !important;
            color: #111111 !important;
            padding: 0 !important;
          }

          .program-no-print,
          .program-action-cell {
            display: none !important;
          }

          .program-print-only {
            display: block !important;
          }

          .program-table-card {
            background: #ffffff !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin-top: 0 !important;
          }

          .program-table-scroll {
            overflow: visible !important;
          }

          .program-table {
            min-width: 0 !important;
            width: 100% !important;
            color: #111111 !important;
            font-size: 8px !important;
          }

          .program-table th,
          .program-table td {
            color: #111111 !important;
            padding: 4px 5px !important;
            border-color: rgba(0,0,0,0.14) !important;
          }
        }
      `}</style>

      <div className={`${darkMode ? 'darkGlass' : 'glass'} program-no-print mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-full px-5 py-3 sm:px-7 sm:py-4`}>
        <div className="flex shrink-0 items-center gap-2">
          <a href="/" aria-label={isFa ? 'بازگشت به صفحه اصلی ACCA EDU' : 'Back to ACCA EDU home'}>
            <img
              src={ACCA_LOGO_SRC}
              alt="ACCA EDU Logo"
              className="h-10 w-auto object-contain sm:h-11"
            />
          </a>
          <BackButton fallback="/" isFa={isFa} darkMode={darkMode} />
        </div>

        <MainNav active="programs" isFa={isFa} darkMode={darkMode} />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleLanguage}
            className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} h-11 rounded-full px-5 text-sm font-black transition hover:scale-[1.03]`}
          >
            {isFa ? 'EN' : 'FA'}
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Light mode' : 'Dark mode'}
            className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} flex h-11 w-11 items-center justify-center rounded-full transition hover:scale-[1.03]`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-[1480px] pb-14 pt-7 sm:pt-10">
        <div className="program-no-print mb-5">
          <div className={`${darkMode ? 'text-emerald-300' : 'text-emerald-700'} mb-3 text-xs font-black uppercase tracking-[0.22em] sm:text-sm sm:tracking-[0.28em]`}>
            {ui.eyebrow}
          </div>

          <h1 className="text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            {ui.title}
          </h1>

          <p className={`${darkMode ? 'text-white/62' : 'text-black/60'} mt-3 max-w-3xl text-sm font-medium leading-7 md:text-base`}>
            {ui.description}
          </p>
        </div>

        <section
          className={`${darkMode ? 'border-white/10 bg-white/[0.045]' : 'border-black/10 bg-white/72'} program-no-print mb-5 rounded-[22px] border px-4 py-4 sm:px-5`}
          aria-labelledby="program-search-seo-heading"
        >
          <h2 id="program-search-seo-heading" className="text-lg font-black leading-7 sm:text-xl">
            {isFa
              ? '\u062c\u0633\u062a\u062c\u0648\u06cc \u0631\u0634\u062a\u0647\u060c \u0634\u0647\u0631\u06cc\u0647 \u0648 \u067e\u0630\u06cc\u0631\u0634 \u062f\u0627\u0646\u0634\u06af\u0627\u0647\u06cc \u062f\u0631 \u062a\u0631\u06a9\u06cc\u0647'
              : 'Search programs, tuition, and university admission in Turkey'}
          </h2>
          <p className={`${darkMode ? 'text-white/60' : 'text-black/60'} mt-2 max-w-5xl text-xs font-bold leading-6 sm:text-sm sm:leading-7`}>
            {isFa
              ? '\u0627\u06cc\u0646 \u0644\u06cc\u0633\u062a \u0628\u0631\u0627\u06cc \u0645\u0642\u0627\u06cc\u0633\u0647 \u0631\u0634\u062a\u0647\u200c\u0647\u0627\u06cc \u062f\u0627\u0646\u0634\u06af\u0627\u0647\u06cc \u062a\u0631\u06a9\u06cc\u0647 \u0628\u0627 \u062f\u0627\u062f\u0647\u200c\u0647\u0627\u06cc \u0639\u0645\u0644\u06cc \u0645\u062b\u0644 \u0632\u0628\u0627\u0646 \u062a\u062d\u0635\u06cc\u0644\u060c \u0645\u0642\u0637\u0639\u060c \u0634\u0647\u0631\u06cc\u0647\u060c \u062f\u067e\u0648\u0632\u06cc\u062a \u0648 \u0648\u0628\u200c\u0633\u0627\u06cc\u062a \u0631\u0633\u0645\u06cc \u062f\u0627\u0646\u0634\u06af\u0627\u0647 \u0633\u0627\u062e\u062a\u0647 \u0634\u062f\u0647 \u062a\u0627 \u062f\u0627\u0646\u0634\u062c\u0648\u06cc\u0627\u0646 \u0628\u06cc\u0646\u200c\u0627\u0644\u0645\u0644\u0644\u06cc \u0645\u0633\u06cc\u0631 \u067e\u0630\u06cc\u0631\u0634 \u0631\u0627 \u0633\u0631\u06cc\u0639\u200c\u062a\u0631 \u0645\u0642\u0627\u06cc\u0633\u0647 \u06a9\u0646\u0646\u062f.'
              : 'This program search is built for international students comparing Turkey university admission by study language, degree level, tuition, deposit, and official university website.'}
          </p>
        </section>

        <section className={`${darkMode ? 'darkGlass' : 'glass'} program-no-print rounded-[24px] p-3 md:p-5`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">
                {ui.filters}
              </h2>
              <p className={`${darkMode ? 'text-white/48' : 'text-black/48'} mt-1 text-xs font-bold`}>
                {ui.activeFilters(activeFilterCount)}
              </p>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-[16px] bg-red-500 px-4 py-3 text-sm font-black text-white transition hover:scale-[1.02]"
            >
              <RotateCcw size={16} />
              {ui.reset}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filterFields.map((field) => (
              <MultiFilterSelect
                key={field.key}
                field={field}
                value={filters[field.key]}
                options={cascadedOptions[field.key] || []}
                darkMode={darkMode}
                isFa={isFa}
                ui={ui}
                onChange={(value) => updateFilter(field.key, value)}
                className={field.key === 'department' ? 'sm:col-span-2 lg:col-span-3 xl:col-span-4' : ''}
              />
            ))}
          </div>

          <PriceRangeSlider
            className="mt-4"
            value={priceRange}
            bounds={priceBounds}
            onChange={(nextRange) => {
              setPriceRange(nextRange);
              setPage(1);
            }}
            darkMode={darkMode}
            isFa={isFa}
            label={ui.priceRange}
            minLabel={ui.minPrice}
            maxLabel={ui.maxPrice}
            clearLabel={ui.clearPriceRange}
            currencyLabel="USD"
          />

          <label className={`${darkMode ? 'bg-white/8 border-white/10' : 'bg-white/80 border-black/10'} mt-4 flex items-center gap-3 rounded-[22px] border px-5 py-4`}>
            <Search size={20} className={darkMode ? 'text-white/45' : 'text-black/40'} />
            <input
              id="search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder={ui.searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:opacity-45"
            />
          </label>
        </section>

        <section className={`${darkMode ? 'darkGlass' : 'glass'} program-table-card mt-7 overflow-hidden rounded-[30px]`}>
          <div className="program-no-print flex flex-wrap items-center justify-between gap-4 border-b border-black/5 px-4 py-4 md:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className={`${darkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'} inline-flex items-center gap-2 rounded-[14px] px-4 py-3 text-sm font-black transition hover:scale-[1.02]`}
              >
                <Printer size={16} />
                {ui.print}
              </button>
              <button
                type="button"
                onClick={downloadCsv}
                className={`${darkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'} inline-flex items-center gap-2 rounded-[14px] px-4 py-3 text-sm font-black transition hover:scale-[1.02]`}
              >
                <Download size={16} />
                {ui.export}
              </button>
              <span className={`${darkMode ? 'text-white/45' : 'text-black/45'} text-xs font-black`}>
                {ui.exportNote(EXPORT_LIMIT)}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm font-bold">
              <span>{ui.show}</span>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className={`${darkMode ? 'bg-[#111827] text-white border-white/10' : 'bg-white text-black border-black/10'} rounded-[14px] border px-3 py-2 font-black outline-none`}
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {formatNumber(size, isFa)}
                  </option>
                ))}
              </select>
              <span>{ui.rows}</span>
            </div>
          </div>

          <div className="program-print-only mb-3 text-sm font-black">
            {ui.firstRows(Math.min(filteredRows.length, EXPORT_LIMIT), filteredRows.length)}
          </div>

          <div dir={isFa ? 'rtl' : 'ltr'}>
            {loading ? (
              <div className="px-5 py-14 text-center font-black opacity-55">
                {ui.loading}
              </div>
            ) : visibleRows.length ? (
              <div className={`divide-y ${darkMode ? 'divide-white/[0.06]' : 'divide-black/[0.06]'}`}>
                {visibleRows.map((row) => (
                  <ProgramCard
                    key={row.id}
                    row={row}
                    darkMode={darkMode}
                    isFa={isFa}
                    ui={ui}
                    onConsultationClick={onConsultationClick}
                  />
                ))}
              </div>
            ) : (
              <div className="px-5 py-14 text-center font-black opacity-55">
                {ui.noResults}
              </div>
            )}
          </div>

          <div className="program-no-print flex flex-wrap items-center justify-between gap-4 px-4 py-5 md:px-6">
            <div className={`${darkMode ? 'text-white/55' : 'text-black/55'} text-sm font-bold`}>
              {ui.summary(
                filteredRows.length ? startIndex + 1 : 0,
                Math.min(startIndex + pageSize, filteredRows.length),
                filteredRows.length
              )}
            </div>

            <Pagination
              page={safePage}
              totalPages={totalPages}
              setPage={setPage}
              darkMode={darkMode}
              isFa={isFa}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

/* ─── Brand tokens ─────────────────────────────────────────── */
const PP_NAVY = '#0D1B3E';
const PP_NAVY_MID = '#162248';
const PP_GOLD = '#C9A84C';
const PP_CREAM = '#FAF8F3';
const PRINT_IMAGE_READY_TIMEOUT_MS = 7000;

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      window.setTimeout(resolve, timeoutMs);
    }),
  ]);
}

function waitForImageReady(image) {
  if (!image?.src) return Promise.resolve();

  const decodeImage = () => (
    typeof image.decode === 'function'
      ? image.decode().catch(() => undefined)
      : Promise.resolve()
  );

  if (image.complete) {
    return image.naturalWidth > 0 ? decodeImage() : Promise.resolve();
  }

  return new Promise((resolve) => {
    const finish = () => {
      image.removeEventListener('load', finish);
      image.removeEventListener('error', finish);
      decodeImage().finally(resolve);
    };

    image.addEventListener('load', finish, { once: true });
    image.addEventListener('error', finish, { once: true });
  });
}

async function waitForPrintAssets(root) {
  if (typeof document === 'undefined') return;

  await (document.fonts?.ready ?? Promise.resolve()).catch(() => undefined);

  const images = Array.from(root?.querySelectorAll?.('img') || []);
  await withTimeout(
    Promise.all(images.map(waitForImageReady)),
    PRINT_IMAGE_READY_TIMEOUT_MS
  ).catch(() => undefined);
}

function ProgramsPrintPreview({
  darkMode,
  isFa,
  ACCA_LOGO_SRC,
  onToggleDarkMode,
  onToggleLanguage,
}) {
  const [payload] = useState(() => readPrintPayload());
  const previewUi = isFa
    ? {
        title: 'پیش‌نمایش خروجی رشته‌ها',
        subtitle: 'فایل PDF به‌صورت خودکار دانلود می‌شود.',
        back: 'بازگشت به جستجو',
        print: 'دانلود PDF',
        empty: 'اطلاعاتی برای خروجی پیدا نشد. لطفا از صفحه جستجو دوباره دکمه چاپ را بزنید.',
        filters: 'فیلترهای فعال',
        generated: 'زمان ساخت',
        total: 'تعداد رشته‌ها',
        report: 'ACCA EDU — Study in Turkey & International Student Placement',
        dep: 'دپوزیت',
        prep: 'دوره زبان',
        cash: 'نقدی',
      }
    : {
        title: 'Programs Export Preview',
        subtitle: 'Your PDF download will begin automatically.',
        back: 'Back to Search',
        print: 'Download PDF',
        empty: 'No export data was found. Please return to search and press print again.',
        filters: 'Active filters',
        generated: 'Generated',
        total: 'Programs',
        report: 'ACCA EDU — Study in Turkey & International Student Placement',
        dep: 'Dep',
        prep: 'Prep',
        cash: 'Cash',
      };

  const rows = payload?.rows || [];

  const printAfterAssetsReady = async () => {
    const printRoot = document.querySelector('.pp-sheet') || document;
    await waitForPrintAssets(printRoot);
    window.print();
  };

  // Auto-open Save-as-PDF dialog after fonts and print logos are ready.
  useEffect(() => {
    if (!rows.length) return undefined;
    let cancelled = false;
    let printed = false;
    const doPrint = () => {
      if (cancelled || printed) return;
      printed = true;
      window.print();
    };

    const prepareAndPrint = async () => {
      const printRoot = document.querySelector('.pp-sheet') || document;
      await waitForPrintAssets(printRoot);
      if (!cancelled) window.setTimeout(doPrint, 250);
    };

    prepareAndPrint();

    // Hard fallback in case an external university logo never resolves.
    const fallback = window.setTimeout(doPrint, PRINT_IMAGE_READY_TIMEOUT_MS + 2800);
    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, [rows.length]);

  return (
    <div className="min-h-screen bg-[#EDE8DF]" dir={isFa ? 'rtl' : 'ltr'}>
      <style>{`
        /* ═══════════════════════════════════════════════════════
           PRINT STYLES
           Key issues solved:
           1. Mobile viewport: html min-width forces A4-wide layout
              even when printing from a 390px phone screen
           2. Color adjust: forces ALL backgrounds to print
           3. Text legibility: minimum sizes + solid colors
           4. Card integrity: page-break-inside avoid
        ═══════════════════════════════════════════════════════ */
        @media print {
          @page { margin: 8mm 6mm; }

          /* ① Fix mobile viewport — layout at full A4 width */
          html {
            min-width: 210mm !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body { background: #ffffff !important; }

          /* ② Force ALL backgrounds & colors to print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* ③ Hide screen-only chrome */
          .pp-toolbar, .pp-hint { display: none !important; }

          /* ④ Strip decorative shadow/radius from the sheet */
          .pp-shell { padding: 0 !important; max-width: none !important; }
          .pp-sheet {
            border: 0 !important; border-radius: 0 !important;
            box-shadow: none !important; margin: 0 !important;
          }

          /* ⑤ Guarantee navy header/footer backgrounds */
          .pp-hdr { background: ${PP_NAVY} !important; }
          .pp-ftr { background: ${PP_NAVY} !important; }

          /* ⑤b Force legible text in header/footer (semi-transparent classes lose opacity in some PDF renderers) */
          .pp-ftr span { color: rgba(255,255,255,0.85) !important; }
          .pp-hdr h1 { color: #ffffff !important; }
          .pp-hdr .pp-hdr-date { color: #ffffff !important; font-size: 10pt !important; }
          .pp-hdr .pp-hdr-stats { background: rgba(201,168,76,0.22) !important; border: 1px solid rgba(201,168,76,0.55) !important; }
          .pp-hdr .pp-hdr-stats span { opacity: 1 !important; color: rgba(201,168,76,0.9) !important; }

          /* ⑥ Alternating row backgrounds */
          .pp-row-even { background: #ffffff !important; }
          .pp-row-odd  { background: ${PP_CREAM} !important; }

          /* ⑦ Keep each program card together */
          .pp-card {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* ⑧ Minimum legible sizes — override Tailwind px values */
          .pp-card .pp-program-name {
            font-size: 9pt !important;
            color: ${PP_NAVY} !important;
          }
          .pp-card .pp-uni-text {
            font-size: 7.5pt !important;
            color: #3a4d70 !important;    /* solid mid-navy — no alpha */
          }
          .pp-card .pp-badge {
            font-size: 7pt !important;
            background: #e8e4da !important;
            color: ${PP_NAVY} !important;
            border-radius: 999px !important;
            padding: 1px 6px !important;
          }
          .pp-card .pp-faculty-text {
            font-size: 6.5pt !important;
            color: #7a8aaa !important;    /* solid muted navy */
          }
          .pp-card .pp-tuition {
            font-size: 9pt !important;
            color: ${PP_GOLD} !important;
          }
          .pp-card .pp-fee-secondary {
            font-size: 7pt !important;
            color: #5a6a8a !important;    /* solid mid-tone — no alpha */
          }
        }
      `}</style>

      {/* ── Screen toolbar (hidden when printing) ──────────── */}
      <div className="pp-toolbar sticky top-0 z-20 border-b border-black/[0.07] bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <img src={ACCA_LOGO_SRC} alt="ACCA EDU" className="h-9 w-auto object-contain" loading="eager" decoding="sync" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: PP_GOLD }}>
                ACCA EDU
              </div>
              <div className="text-xs font-black leading-none opacity-55">{previewUi.title}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={onToggleLanguage}
              className="h-10 rounded-full bg-black px-5 text-sm font-black text-white transition hover:scale-[1.03]">
              {isFa ? 'EN' : 'FA'}
            </button>
            <button type="button" onClick={onToggleDarkMode}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition hover:scale-[1.03]">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="?page=programs"
              className="inline-flex items-center gap-2 rounded-full bg-black/6 px-5 py-2.5 text-sm font-black text-black transition hover:scale-[1.02]">
              <ArrowLeft size={15} className={isFa ? 'rotate-180' : ''} />
              {previewUi.back}
            </a>
            <button type="button" onClick={printAfterAssetsReady}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black text-white transition hover:scale-[1.03]"
              style={{ background: `linear-gradient(135deg, ${PP_NAVY}, ${PP_NAVY_MID})`, boxShadow: `0 4px 16px ${PP_NAVY}44` }}>
              <Download size={15} />
              {previewUi.print}
            </button>
          </div>
        </div>
      </div>

      {/* ── Page body ──────────────────────────────────────── */}
      <div className="pp-shell mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* Auto-download hint */}
        {rows.length > 0 && (
          <div className="pp-hint mb-6 flex items-center gap-3 rounded-[16px] border px-5 py-3.5 text-sm font-bold"
            style={{ borderColor: `${PP_GOLD}45`, background: `${PP_GOLD}10`, color: PP_NAVY }}>
            <Download size={16} className="shrink-0" style={{ color: PP_GOLD }} />
            {previewUi.subtitle}
          </div>
        )}

        {!rows.length ? (
          <div className="rounded-[24px] bg-white p-10 text-center text-lg font-black shadow-xl"
            style={{ color: PP_NAVY }}>
            {previewUi.empty}
          </div>
        ) : (
          <div className="pp-sheet overflow-hidden rounded-[24px] bg-white shadow-[0_32px_100px_rgba(13,27,62,0.18)]">

            {/* ── Navy header ──────────────────────────────── */}
            <div className="pp-hdr px-6 py-6 sm:px-8 sm:py-7"
              style={{ background: `linear-gradient(135deg, ${PP_NAVY} 0%, ${PP_NAVY_MID} 100%)` }}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Logo + title */}
                <div className="flex items-center gap-4">
                  <img
                    src={ACCA_LOGO_SRC}
                    alt="ACCA EDU"
                    className="h-11 w-auto object-contain"
                    loading="eager"
                    decoding="sync"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                  <div>
                    <div className="text-[10px] font-black uppercase leading-tight tracking-[0.08em]" style={{ color: PP_GOLD }}>
                      {previewUi.report}
                    </div>
                    <h1 className="mt-0.5 text-xl font-black text-white sm:text-2xl">
                      {previewUi.title}
                    </h1>
                  </div>
                </div>

                {/* Stats card */}
                <div className="pp-hdr-stats rounded-[12px] px-5 py-3.5"
                  style={{ background: `${PP_GOLD}18`, border: `1px solid ${PP_GOLD}38` }}>
                  <div className="text-base font-black sm:text-lg" style={{ color: PP_GOLD }}>
                    {formatNumber(payload.totalCount, isFa)}
                    <span className="ms-1.5 text-xs font-bold opacity-80">{previewUi.total}</span>
                  </div>
                  <div className="pp-hdr-date mt-0.5 text-[12px] font-bold text-white/90">
                    {formatDateTime(payload.generatedAt, isFa)}
                  </div>
                </div>
              </div>

              {/* Gold rule */}
              <div className="mt-5 h-px opacity-40"
                style={{ background: `linear-gradient(${isFa ? '270deg' : '90deg'}, ${PP_GOLD}, transparent)` }} />

              {/* Active filter chips */}
              {payload.filters?.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="me-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/65">
                    {previewUi.filters}:
                  </span>
                  {payload.filters.map((item) => (
                    <span
                      key={`${item.label}-${item.value}`}
                      className="rounded-full px-2.5 py-1 text-[10px] font-black"
                      style={{ background: `${PP_GOLD}22`, border: `1px solid ${PP_GOLD}55`, color: PP_GOLD }}
                    >
                      {item.label}: {item.value}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── Program cards ─────────────────────────────── */}
            {rows.map((row, index) => (
              <PrintCard
                key={`${row.program}-${row.university}-${index}`}
                row={row}
                index={index}
                isFa={isFa}
                previewUi={previewUi}
              />
            ))}

            {/* ── Navy footer ───────────────────────────────── */}
            <div className="pp-ftr flex flex-wrap items-center justify-between gap-3 px-7 py-4"
              style={{ background: PP_NAVY }}>
              <span className="text-[11px] font-bold text-white/80">ACCA EDU — Study in Turkey & International Student Placement</span>
              <span className="text-[11px] font-bold text-white/65">{formatDateTime(payload.generatedAt, isFa)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Card layout for each program.
 * ─ No min-width table → works in portrait AND landscape PDF
 * ─ CSS class names (pp-program-name, pp-uni-text, pp-badge,
 *   pp-faculty-text, pp-tuition, pp-fee-secondary) are targeted
 *   by the @media print block above to guarantee legibility.
 * ─ All semi-transparent colors use rgba() instead of #RRGGBBAA
 *   hex-alpha, which is better supported across PDF renderers.
 */
function PrintCard({ row, index, isFa, previewUi }) {
  const logo = row.universityLogo;
  const isEven = index % 2 === 0;

  return (
    <div
      className={`pp-card flex items-start gap-3 px-5 py-4 sm:gap-4 sm:px-7 sm:py-5 ${isEven ? 'pp-row-even' : 'pp-row-odd'}`}
      style={{
        background: isEven ? '#ffffff' : PP_CREAM,
        borderBottom: '1px solid rgba(13,27,62,0.05)',
      }}
    >
      {/* ── Row number ─────────────────────────────────────── */}
      <div
        className="mt-1 w-5 shrink-0 text-right text-[10px] font-black tabular-nums"
        style={{ color: 'rgba(13,27,62,0.22)' }}
      >
        {index + 1}
      </div>

      {/* ── University logo ────────────────────────────────── */}
      <div
        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px]"
        style={{ background: '#EDE8DF', border: '1px solid rgba(13,27,62,0.10)' }}
      >
        {logo ? (
          <img src={logo} alt={row.university} className="h-8 w-8 object-contain" loading="eager" decoding="sync" />
        ) : (
          <span
            className="text-[9px] font-black uppercase leading-none"
            style={{ color: 'rgba(13,27,62,0.40)' }}
          >
            {getInitials(row.university)}
          </span>
        )}
      </div>

      {/* ── Program info ───────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        {/* Program name — largest text, always legible */}
        <div
          className="pp-program-name text-[13px] font-black leading-snug"
          style={{ color: PP_NAVY }}
        >
          {row.program}
        </div>

        {/* University · Location */}
        <div
          className="pp-uni-text mt-0.5 text-[11px] font-semibold"
          style={{ color: 'rgba(13,27,62,0.55)' }}
        >
          {row.university}
          {row.location && (
            <span style={{ color: 'rgba(13,27,62,0.38)' }}> · {row.location}</span>
          )}
        </div>

        {/* Degree / Language / Years badges */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {row.degree && (
            <span
              className="pp-badge rounded-full px-2 py-0.5 text-[10px] font-black"
              style={{ background: 'rgba(13,27,62,0.07)', color: PP_NAVY }}
            >
              {row.degree}
            </span>
          )}
          {row.language && (
            <span
              className="pp-badge rounded-full px-2 py-0.5 text-[10px] font-black"
              style={{ background: 'rgba(13,27,62,0.07)', color: PP_NAVY }}
            >
              {row.language}
            </span>
          )}
          {row.years && (
            <span
              className="pp-badge rounded-full px-2 py-0.5 text-[10px] font-black"
              style={{ background: 'rgba(13,27,62,0.07)', color: PP_NAVY }}
            >
              {row.years}
            </span>
          )}
          {row.faculty && (
            <span
              className="pp-faculty-text truncate text-[10px] font-medium"
              style={{ color: 'rgba(13,27,62,0.38)' }}
            >
              {row.faculty}
            </span>
          )}
        </div>
      </div>

      {/* ── Fee column ─────────────────────────────────────── */}
      <div className={`shrink-0 ${isFa ? 'text-left' : 'text-right'}`}>
        {/* Tuition — gold, primary */}
        <div
          className="pp-tuition text-sm font-black"
          style={{ color: PP_GOLD }}
        >
          {row.tuition || '—'}
        </div>

        {/* Deposit */}
        {row.deposit && row.deposit !== '—' && (
          <div
            className="pp-fee-secondary mt-0.5 text-[10px] font-bold"
            style={{ color: 'rgba(13,27,62,0.48)' }}
          >
            {previewUi.dep}: {row.deposit}
          </div>
        )}

        {/* Prep */}
        {row.prep && row.prep !== '—' && (
          <div
            className="pp-fee-secondary text-[10px] font-bold"
            style={{ color: 'rgba(13,27,62,0.48)' }}
          >
            {previewUi.prep}: {row.prep}
          </div>
        )}

        {/* Cash */}
        {row.cash && row.cash !== '—' && (
          <div
            className="pp-fee-secondary text-[10px] font-bold"
            style={{ color: 'rgba(13,27,62,0.48)' }}
          >
            {previewUi.cash}: {row.cash}
          </div>
        )}
      </div>
    </div>
  );
}

function MultiFilterSelect({ field, value, options, darkMode, isFa, ui, onChange, className = '' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const rootRef = useRef(null);
  const label = isFa ? field.labelFa : field.labelEn;
  const selectedValues = useMemo(
    () => dedupeFilterValues(Array.isArray(value) ? value : []),
    [value]
  );
  const selectedSet = useMemo(
    () => new Set(selectedValues.map((item) => normalize(item))),
    [selectedValues]
  );
  const filteredOptions = useMemo(() => {
    const normalizedSearch = normalize(search);
    const matched = normalizedSearch
      ? options.filter((option) =>
          normalize(option).includes(normalizedSearch) ||
          normalize(displayValue(field.key, option, isFa)).includes(normalizedSearch)
        )
      : options;

    return matched.slice(0, 180);
  }, [field.key, isFa, options, search]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setSearch('');
  }, []);

  const toggleDropdown = () => {
    if (open) {
      closeDropdown();
      return;
    }

    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        closeDropdown();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeDropdown, open]);

  const toggleOption = (option) => {
    const normalizedOption = normalize(option);

    if (selectedSet.has(normalizedOption)) {
      onChange(selectedValues.filter((item) => normalize(item) !== normalizedOption));
      return;
    }

    onChange(dedupeFilterValues([...selectedValues, option]));
  };

  const removeOption = (option) => {
    const normalizedOption = normalize(option);
    onChange(selectedValues.filter((item) => normalize(item) !== normalizedOption));
  };
  const selectedSummary = selectedValues.length
    ? selectedValues.length <= 2
      ? selectedValues.map((option) => displayValue(field.key, option, isFa)).join(isFa ? '، ' : ', ')
      : isFa
        ? `${formatNumber(selectedValues.length, isFa)} مورد انتخاب شده`
        : `${selectedValues.length} selected`
    : ui.all(label);

  return (
    <div ref={rootRef} data-filter-key={field.key} className={`relative ${className}`}>
      <div className={`${darkMode ? 'text-white/45' : 'text-black/45'} mb-2 flex items-center justify-between gap-2 text-xs font-black uppercase tracking-[0.13em]`}>
        <span>{label}</span>
        <span>{formatNumber(options.length, isFa)}</span>
      </div>

      <div className={`${darkMode ? 'bg-white/8 border-white/10' : 'bg-white/85 border-black/10'} min-h-12 rounded-[18px] border p-2`}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-filter-trigger={field.key}
            onClick={toggleDropdown}
            className="flex min-w-0 flex-1 items-center justify-between gap-2 px-2 py-1.5 text-start"
          >
            <span className={`${selectedValues.length ? 'opacity-100' : 'opacity-42'} min-w-0 truncate text-sm font-black`}>
              {selectedSummary}
            </span>
            <ChevronDown
              size={16}
              className={`${open ? 'rotate-180' : ''} shrink-0 opacity-55 transition`}
            />
          </button>

          {selectedValues.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              aria-label={ui.clearFilter}
              className={`${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'} flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition`}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {selectedValues.length > 2 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedValues.map((option) => (
              <button
                key={normalize(option)}
                type="button"
                onClick={() => removeOption(option)}
                className={`${darkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-black/5 text-black hover:bg-black/10'} inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black transition`}
              >
                <span className="max-w-[220px] truncate">{displayValue(field.key, option, isFa)}</span>
                <X size={13} />
              </button>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className={`${darkMode ? 'bg-[#101624] text-white border-white/10' : 'bg-white text-black border-black/10'} absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[20px] border shadow-[0_24px_70px_rgba(0,0,0,0.20)]`}>
          <div className={`${darkMode ? 'border-white/10' : 'border-black/10'} border-b p-3`}>
            <label className={`${darkMode ? 'bg-white/8' : 'bg-black/[0.035]'} flex items-center gap-2 rounded-[14px] px-3 py-2`}>
              <Search size={16} className="opacity-45" />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={ui.search}
                className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:opacity-45"
              />
            </label>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {filteredOptions.map((option) => (
              <FilterOption
                key={normalize(option)}
                active={selectedSet.has(normalize(option))}
                darkMode={darkMode}
                label={displayValue(field.key, option, isFa)}
                optionValue={option}
                onClick={() => toggleOption(option)}
              />
            ))}

            {options.length > filteredOptions.length && (
              <div className={`${darkMode ? 'text-white/42' : 'text-black/42'} px-3 py-2 text-xs font-bold`}>
                {ui.moreOptions}
              </div>
            )}

            {!filteredOptions.length && (
              <div className={`${darkMode ? 'text-white/42' : 'text-black/42'} px-3 py-4 text-center text-xs font-bold`}>
                {ui.noOptions}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterOption({ active, darkMode, label, optionValue, onClick }) {
  return (
    <button
      type="button"
      data-filter-option={optionValue}
      onClick={onClick}
      className={`${active ? 'bg-emerald-500 text-white' : darkMode ? 'hover:bg-white/8' : 'hover:bg-black/[0.045]'} flex w-full items-center justify-between gap-3 rounded-[14px] px-3 py-2.5 text-start text-sm font-bold transition`}
    >
      <span className="min-w-0 truncate">{label}</span>
      {active && <Check size={15} className="shrink-0" />}
    </button>
  );
}

/** Card-based program row — no horizontal scroll, mobile-friendly */
function ProgramCard({ row, darkMode, isFa, ui, onConsultationClick }) {
  const logo = row.universityLogo || '';

  return (
    <div className={`${darkMode ? 'hover:bg-white/[0.035]' : 'hover:bg-white/45'} px-4 py-5 transition sm:px-6`}>
      {/* ── Top: Logo + Program Name + Status + Consult ── */}
      <div className="flex items-start gap-3">
        {/* University logo / initials */}
        <div
          className={`${darkMode ? 'border-white/10 bg-white/10' : 'border-black/10 bg-white'} flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border overflow-hidden`}
        >
          {logo ? (
            <img
              src={logo}
              alt={row.university}
              className="h-8 w-8 object-contain"
              loading="lazy"
            />
          ) : (
            <span className={`${darkMode ? 'text-white/55' : 'text-black/50'} text-[10px] font-black uppercase leading-none`}>
              {getInitials(row.university)}
            </span>
          )}
        </div>

        {/* Program + university name */}
        <div className="min-w-0 flex-1">
          <div className={`${isFa ? 'text-right' : 'text-left'} text-[13px] font-black leading-[1.4]`}>
            {displayValue('program', row.program, isFa)}
          </div>
          <div className={`${darkMode ? 'text-white/55' : 'text-black/55'} mt-0.5 flex flex-wrap items-center gap-1.5 text-xs font-bold`}>
            <span dir="ltr">{formatCell(row.university)}</span>
            <span className="opacity-40">·</span>
            <span>{displayValue('city', row.city, isFa)}</span>
            {row.country && row.country !== 'Turkey' && (
              <>
                <span className="opacity-40">·</span>
                <span>{displayValue('country', row.country, isFa)}</span>
              </>
            )}
            {row.universityUrl && (
              <>
                <span className="opacity-40">·</span>
                <a
                  href={row.universityUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`${darkMode ? 'text-emerald-300' : 'text-emerald-700'} underline-offset-2 hover:underline`}
                >
                  {ui.website} ↗
                </a>
              </>
            )}
          </div>
        </div>

        {/* Status + consult (desktop: inline; mobile: wraps below) */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge status={row.status} isFa={isFa} />
          <button
            type="button"
            onClick={onConsultationClick}
            className={`${darkMode ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white'} whitespace-nowrap rounded-[12px] px-4 py-2 text-xs font-black transition hover:scale-[1.03] hover:bg-emerald-700`}
          >
            {ui.consult}
          </button>
        </div>
      </div>

      {/* ── Middle: degree · language · years · faculty ── */}
      <div className={`${darkMode ? 'text-white/60' : 'text-black/60'} mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 ps-[56px] text-xs font-bold`}>
        {row.degree && (
          <span className={`${darkMode ? 'bg-white/10' : 'bg-black/[0.06]'} rounded-full px-2.5 py-1`}>
            {displayValue('degree', row.degree, isFa)}
          </span>
        )}
        {row.language && (
          <span className={`${darkMode ? 'bg-white/10' : 'bg-black/[0.06]'} rounded-full px-2.5 py-1`}>
            {displayValue('language', row.language, isFa)}
          </span>
        )}
        {row.years && (
          <span className={`${darkMode ? 'bg-white/10' : 'bg-black/[0.06]'} rounded-full px-2.5 py-1`}>
            {displayYears(row.years, isFa)}
          </span>
        )}
        {row.faculty && (
          <span className={`${darkMode ? 'text-white/40' : 'text-black/40'} line-clamp-1 flex-1`}>
            {displayValue('faculty', row.faculty, isFa)}
          </span>
        )}
      </div>

      {/* ── Bottom: fee grid ── */}
      <div className={`${darkMode ? 'border-white/[0.06]' : 'border-black/[0.06]'} mt-3 grid grid-cols-2 gap-2 border-t pt-3 ps-[56px] sm:grid-cols-4`}>
        <ProgramFeeCell label={ui.headers.tuition} value={displayFee(row.tuitionFee, isFa)} primary darkMode={darkMode} />
        <ProgramFeeCell label={ui.headers.deposit} value={displayFee(row.depositFee, isFa)} darkMode={darkMode} />
        <ProgramFeeCell label={ui.headers.prep}    value={displayFee(row.prepSchoolFee, isFa)} darkMode={darkMode} />
        <ProgramFeeCell label={ui.headers.cash}    value={displayFee(row.cashFees, isFa)} darkMode={darkMode} />
      </div>
    </div>
  );
}

function ProgramFeeCell({ label, value, primary, darkMode }) {
  return (
    <div>
      <div className={`${darkMode ? 'text-white/35' : 'text-black/40'} mb-0.5 text-[9px] font-black uppercase tracking-[0.1em]`}>
        {label}
      </div>
      <div className={`${primary ? (darkMode ? 'text-emerald-300' : 'text-emerald-700') : ''} text-xs font-black`}>
        {value || '—'}
      </div>
    </div>
  );
}

function getInitials(name) {
  return (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function StatusBadge({ status, isFa }) {
  return (
    <div className="inline-flex rounded-full border border-emerald-500/25 bg-emerald-500/14 px-2.5 py-1 text-[10px] font-black text-emerald-600">
      {displayValue('status', status, isFa)}
    </div>
  );
}

function Pagination({ page, totalPages, setPage, darkMode, isFa }) {
  const pages = getPageWindow(page, totalPages);

  return (
    <div className="flex items-center gap-2">
      <PageButton disabled={page <= 1} darkMode={darkMode} onClick={() => setPage((current) => Math.max(1, current - 1))}>
        <ChevronLeft size={16} />
      </PageButton>
      {pages.map((item) =>
        item === 'ellipsis' ? (
          <span key={`${item}-${page}`} className="px-2 text-sm font-black opacity-40">
            ...
          </span>
        ) : (
          <PageButton
            key={item}
            active={item === page}
            darkMode={darkMode}
            onClick={() => setPage(item)}
          >
            {formatNumber(item, isFa)}
          </PageButton>
        )
      )}
      <PageButton disabled={page >= totalPages} darkMode={darkMode} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
        <ChevronRight size={16} />
      </PageButton>
    </div>
  );
}

function PageButton({ children, active, disabled, darkMode, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${active ? 'bg-emerald-500 text-white' : darkMode ? 'bg-white/8 text-white' : 'bg-black/5 text-black'} flex h-10 min-w-10 items-center justify-center rounded-[14px] px-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-35`}
    >
      {children}
    </button>
  );
}

function getPageWindow(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [1];
  if (page > 4) pages.push('ellipsis');

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  for (let item = start; item <= end; item += 1) pages.push(item);

  if (page < totalPages - 3) pages.push('ellipsis');
  pages.push(totalPages);

  return pages;
}

function normalizeProgramRow(row) {
  return {
    ...row,
    status: AVAILABLE_STATUS,
      // Replace any StudyFans logo URL with our verified logo map, or empty string
    universityLogo: getUniversityLogo(row.university) || '',
    // Replace StudyFans programme/profile links with the university's own website
    universityUrl: isStudyFansUrl(row.universityUrl)
      ? getUniversityWebsite(row.university)
      : (row.universityUrl || getUniversityWebsite(row.university)),
  };
}

function getFieldValues(row, field) {
  return [row[field.rowKey]].filter(Boolean);
}

function getUniqueFieldValues(rows, field) {
  const values = new Map();

  rows.forEach((row) => {
    getFieldValues(row, field).forEach((value) => {
      const normalized = normalize(value);
      if (normalized && !values.has(normalized)) {
        values.set(normalized, value);
      }
    });
  });

  return Array.from(values.values()).sort((a, b) =>
    String(a).localeCompare(String(b), undefined, { sensitivity: 'base' })
  );
}

function rowMatchesFilter(row, field, selectedValue) {
  if (Array.isArray(selectedValue)) {
    const normalizedSelectedValue = dedupeFilterValues(selectedValue);
    if (!normalizedSelectedValue.length) return true;
    const selectedValues = new Set(normalizedSelectedValue.map((value) => normalize(value)));

    return getFieldValues(row, field).some((value) => selectedValues.has(normalize(value)));
  }

  if (!selectedValue) return true;
  const selected = normalize(selectedValue);

  return getFieldValues(row, field).some((value) => normalize(value) === selected);
}

function createPrintPayload({ rows, filters, priceRange, priceBounds, query, isFa, ui, totalCount }) {
  return {
    isFa,
    generatedAt: new Date().toISOString(),
    totalCount,
    headers: ui.headers,
    filters: getActiveFilterSummary(filters, query, isFa, priceRange, priceBounds, ui),
    rows: rows.map((row) => ({
      program: displayValue('program', row.program, isFa),
      university: row.university,
      universityLogo: row.universityLogo || '',
      location: `${displayValue('country', row.country, isFa)} / ${displayValue('city', row.city, isFa)}`,
      status: displayValue('status', row.status, isFa),
      degree: displayValue('degree', row.degree, isFa),
      faculty: displayValue('faculty', row.faculty, isFa),
      years: displayYears(row.years, isFa),
      language: displayValue('language', row.language, isFa),
      tuition: displayFee(row.tuitionFee, isFa),
      deposit: displayFee(row.depositFee, isFa),
      prep: displayFee(row.prepSchoolFee, isFa),
      cash: displayFee(row.cashFees, isFa),
    })),
  };
}

function readPrintPayload() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(PRINT_PAYLOAD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getActiveFilterSummary(filters, query, isFa, priceRange, priceBounds, ui) {
  const summary = [];

  filterFields.forEach((field) => {
    const value = filters[field.key];
    const label = isFa ? field.labelFa : field.labelEn;

    // Arrays: only include when at least one value is selected
    if (Array.isArray(value)) {
      if (value.length) {
        summary.push({
          label,
          value: value.map((item) => displayValue(field.key, item, isFa)).join(isFa ? '، ' : ', '),
        });
      }
      return; // always return for arrays (even empty ones) to prevent falling through
    }

    // Scalar: only include when truthy
    if (value) {
      summary.push({
        label,
        value: displayValue(field.key, value, isFa),
      });
    }
  });

  const priceRangeSummary = getPriceRangeSummary(priceRange, priceBounds, isFa);
  if (priceRangeSummary) {
    summary.push({
      label: ui.priceRange,
      value: priceRangeSummary,
    });
  }
  if (query) {
    summary.push({
      label: isFa ? 'جستجو' : 'Search',
      value: query,
    });
  }

  return summary;
}



function getProgramPriceAmount(row) {
  return parseMoneyAmount(row?.tuitionFee);
}

function parseMoneyAmount(value) {
  const match = String(value || '').match(/\d[\d.,]*/);
  const normalized = match ? normalizeFeeToken(match[0]) : null;
  const amount = Number(normalized?.value);
  return Number.isFinite(amount) ? amount : null;
}

function getPriceBounds(values) {
  const amounts = values.filter((value) => Number.isFinite(value));
  if (!amounts.length) return { min: 0, max: 0 };
  return {
    min: Math.floor(Math.min(...amounts)),
    max: Math.ceil(Math.max(...amounts)),
  };
}

function normalizePriceRange(priceRange, bounds) {
  const minBound = Number.isFinite(bounds.min) ? bounds.min : 0;
  const maxBound = Number.isFinite(bounds.max) ? bounds.max : minBound;
  const minValue = getOptionalPriceRangeValue(priceRange.min);
  const maxValue = getOptionalPriceRangeValue(priceRange.max);
  const min = minValue ?? minBound;
  const max = maxValue ?? maxBound;

  return {
    min: Math.max(minBound, Math.min(min, max)),
    max: Math.min(maxBound, Math.max(min, max)),
  };
}

function isPriceRangeActive(priceRange, bounds) {
  const hasMin = getOptionalPriceRangeValue(priceRange.min) !== null;
  const hasMax = getOptionalPriceRangeValue(priceRange.max) !== null;

  if (!Number.isFinite(bounds.min) || !Number.isFinite(bounds.max) || bounds.max <= bounds.min) {
    return hasMin || hasMax;
  }

  const normalized = normalizePriceRange(priceRange, bounds);
  return (hasMin && normalized.min > bounds.min) || (hasMax && normalized.max < bounds.max);
}

function getOptionalPriceRangeValue(value) {
  if (value === '' || value === null || value === undefined) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function getPriceRangeSummary(priceRange, bounds, isFa) {
  if (!isPriceRangeActive(priceRange, bounds)) return '';
  const range = normalizePriceRange(priceRange, bounds);
  return `${formatNumber(Math.round(range.min), isFa)} USD - ${formatNumber(Math.round(range.max), isFa)} USD`;
}

function getSearchText(row, isFa) {
  return normalize(
    [
      row.program,
      displayValue('program', row.program, isFa),
      row.university,
      row.faculty,
      displayValue('faculty', row.faculty, isFa),
      row.degree,
      displayValue('degree', row.degree, isFa),
      row.language,
      displayValue('language', row.language, isFa),
      row.status,
      displayValue('status', row.status, isFa),
      row.country,
      displayValue('country', row.country, isFa),
      row.city,
      displayValue('city', row.city, isFa),
      row.tuitionFee,
      displayFee(row.tuitionFee, isFa),
      row.depositFee,
      displayFee(row.depositFee, isFa),
      row.cashFees,
      displayFee(row.cashFees, isFa),
      row.campusAddress,
      displayValue('address', row.campusAddress, isFa),
    ].join(' ')
  );
}

function displayValue(kind, value, isFa) {
  if (!isFa) return formatCell(value);
  if (!value) return '-';

  const dictionaries = {
    country: countryTranslations,
    city: cityTranslations,
    degree: degreeTranslations,
    language: languageTranslations,
    status: statusTranslations,
  };

  if (dictionaries[kind]?.[value]) {
    return dictionaries[kind][value];
  }

  if (kind === 'program' || kind === 'faculty' || kind === 'department') {
    return translateAcademicText(value);
  }

  if (kind === 'address') {
    return translateAddressText(value);
  }

  return formatCell(value);
}

function displayYears(value, isFa) {
  if (!value) return '-';
  if (!isFa) return value;
  return `${toFaDigits(value)} سال`;
}

function displayFee(value, isFa) {
  if (!value) return '-';
  const formatted = formatFeeText(value);
  if (!isFa) return formatted;

  return toFaDigits(
    formatted
      .replace(/\bUSD\b/g, 'دلار')
      .replace(/\bEUR\b/g, 'یورو')
      .replace(/\bCAD\b/g, 'دلار کانادا')
      .replace(/\bGBP\b/g, 'پوند')
      .replace(/\bTRY\b/g, 'لیر')
      .replace(/\bTL\b/g, 'لیر')
  );
}

function formatFeeText(value) {
  return String(value).replace(/\d[\d.,]*/g, (token) => formatFeeToken(token));
}

function formatFeeToken(token) {
  const normalized = normalizeFeeToken(token);
  if (!normalized) return token;

  const amount = Number(normalized.value);
  if (!Number.isFinite(amount)) return token;

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: normalized.hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function normalizeFeeToken(token) {
  const text = String(token);
  const europeanThousands = /^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/;

  if (europeanThousands.test(text)) {
    return {
      value: text.replace(/\./g, '').replace(',', '.'),
      hasFraction: text.includes(','),
    };
  }

  if (/^\d+(?:\.\d+)?$/.test(text)) {
    return {
      value: text,
      hasFraction: text.includes('.'),
    };
  }

  if (/^\d+(?:,\d+)?$/.test(text)) {
    return {
      value: text.replace(',', '.'),
      hasFraction: text.includes(','),
    };
  }

  return null;
}

function translateAcademicText(value) {
  if (!value) return '-';

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

function translateAddressText(value) {
  if (!value) return '-';

  return toFaDigits(
    String(value)
      .replace(/\bMain\b/g, 'پردیس اصلی')
      .replace(/\bCampus\b/g, 'پردیس')
      .replace(/\bNear\b/g, 'نزدیک')
      .replace(/\bBoulevard\b/g, 'بلوار')
      .replace(/\bStreet\b/g, 'خیابان')
      .replace(/\bZIP\b/g, 'کد پستی')
      .replace(/\bTurkey\b/g, 'ترکیه')
      .replace(/\bNicosia\b/g, 'نیکوزیا')
  );
}

function replacePhrase(text, english, persian) {
  const escaped = english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startBoundary = /^\w/.test(english) ? '\\b' : '';
  const endBoundary = /\w$/.test(english) ? '\\b' : '';
  return text.replace(new RegExp(`${startBoundary}${escaped}${endBoundary}`, 'gi'), persian);
}

function normalize(value) {
  return String(value || '').trim().toLocaleLowerCase();
}

function formatCell(value) {
  return value || '-';
}

function formatNumber(value, isFa) {
  return isFa ? toFaDigits(value) : String(value);
}

function formatDateTime(value, isFa) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  const formatted = date.toLocaleString(isFa ? 'fa-IR' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return isFa ? formatted : formatted;
}

function toFaDigits(value) {
  return String(value).replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[digit]);
}

function csvEscape(value) {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

const countryTranslations = {
  Canada: 'کانادا',
  Georgia: 'گرجستان',
  Germany: 'آلمان',
  KKTC: 'قبرس شمالی',
  Turkey: 'ترکیه',
  USA: 'آمریکا',
};

const cityTranslations = {
  Ankara: 'آنکارا',
  Antalya: 'آنتالیا',
  Berlin: 'برلین',
  Bremen: 'برمن',
  Famagusta: 'فاماگوستا',
  Gaziantep: 'غازی‌عینتاب',
  Girne: 'گیرنه',
  Goodyear: 'گودیر',
  'Lefkoşa': 'لفکوشا',
  Louis: 'لوییس',
  Malibu: 'مالیبو',
  Montreal: 'مونترال',
  'New York': 'نیویورک',
  'Niagara Falls': 'نیاگارا فالز',
  Nicosia: 'نیکوزیا',
  Tbilisi: 'تفلیس',
  Vancouver: 'ونکوور',
  Waltham: 'والتهام',
  Washington: 'واشنگتن',
  kocaeli: 'کوجائلی',
  'İstanbul': 'استانبول',
  'İzmir': 'ازمیر',
};

const degreeTranslations = {
  Associate: 'کاردانی',
  Bachelor: 'کارشناسی',
  Diploma: 'دیپلم',
  'Integrated PHD': 'دکتری پیوسته',
  Master: 'کارشناسی ارشد',
  'Master non Thesis': 'کارشناسی ارشد بدون پایان‌نامه',
  'Master with Thesis': 'کارشناسی ارشد با پایان‌نامه',
  PHD: 'دکتری',
};

const languageTranslations = {
  '30% Arabic': '۳۰٪ عربی',
  '30% English': '۳۰٪ انگلیسی',
  '30% Germany': '۳۰٪ آلمانی',
  Arabic: 'عربی',
  Chinese: 'چینی',
  English: 'انگلیسی',
  'English / Turkish': 'انگلیسی / ترکی',
  'English, Turkish': 'انگلیسی، ترکی',
  French: 'فرانسوی',
  Germany: 'آلمانی',
  Russian: 'روسی',
  Turkish: 'ترکی',
  'Turkish + English': 'ترکی + انگلیسی',
  'Turkish - Russian': 'ترکی - روسی',
};

const statusTranslations = {
  Available: 'قابل پذیرش',
};

const exactAcademicTranslations = {
  media: 'رسانه',
  bachelor: 'کارشناسی',
  agriculture: 'کشاورزی',
  anatomy: 'آناتومی',
  anesthesia: 'بیهوشی',
  anthropology: 'مردم‌شناسی',
  architecture: 'معماری',
  business: 'کسب‌وکار',
  coaching: 'مربیگری',
  communication: 'ارتباطات',
  conservatory: 'کنسرواتوار',
  criminology: 'جرم‌شناسی',
  dentistry: 'دندانپزشکی',
  ecology: 'بوم‌شناسی',
  education: 'آموزش',
  engineering: 'مهندسی',
  entrepreneurship: 'کارآفرینی',
  geology: 'زمین‌شناسی',
  gerontology: 'سالمندشناسی',
  hospitality: 'مهمان‌نوازی',
  humanities: 'علوم انسانی',
  linguistics: 'زبان‌شناسی',
  mechatronics: 'مکاترونیک',
  medicine: 'پزشکی',
  metallurgy: 'متالورژی',
  microbiology: 'میکروب‌شناسی',
  neuroscience: 'علوم اعصاب',
  nutrition: 'تغذیه',
  pharmacognosy: 'داروگنوسی',
  pharmacology: 'داروشناسی',
  pharmacy: 'داروسازی',
  physiology: 'فیزیولوژی',
  radiology: 'رادیولوژی',
  rehabilitation: 'توانبخشی',
  speech: 'گفتار',
  therapy: 'درمان',
  urbanization: 'شهرنشینی',
  acting: 'بازیگری',
  advertising: 'تبلیغات',
  aerospace: 'هوافضا',
  audiometry: 'شنوایی‌سنجی',
  avionics: 'آویونیک',
  bioinformatics: 'بیوانفورماتیک',
  bioengineering: 'زیست‌مهندسی',
  biophysics: 'بیوفیزیک',
  blockchain: 'بلاکچین',
  cinema: 'سینما',
  commerce: 'بازرگانی',
  construction: 'ساخت و ساز',
  dialysis: 'دیالیز',
  drama: 'درام',
  endodontics: 'اندودنتیک',
  fashion: 'مد',
  histology: 'بافت‌شناسی',
  immunology: 'ایمونولوژی',
  midwifery: 'مامایی',
  nanotechnology: 'نانوفناوری',
  obstetrics: 'زنان و زایمان',
  opticianry: 'عینک‌سازی',
  orthodontics: 'ارتودنسی',
  packaging: 'بسته‌بندی',
  painting: 'نقاشی',
  pathology: 'آسیب‌شناسی',
  pediatric: 'اطفال',
  periodontology: 'پریودنتولوژی',
  pilotage: 'خلبانی',
  prosthodontics: 'پروتز دندانی',
  recreation: 'تفریح',
  robotics: 'رباتیک',
  welding: 'جوشکاری',
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
  ['Artificial Intelligence', 'هوش مصنوعی'],
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
  ['Psychology', 'روان‌شناسی'],
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
  // ── Urban
  ['Urban Systems and Transportation Management', 'مدیریت سیستم‌های شهری و حمل و نقل'],
  ['Urban Design and Landscape Architecture', 'طراحی شهری و معماری منظر'],
  ['Urbanization and Urban Regeneration', 'شهرنشینی و بازسازی شهری'],
  ['Urban And Regional Planning', 'برنامه‌ریزی شهری و منطقه‌ای'],
  ['Urban Studies and Management', 'مطالعات و مدیریت شهری'],
  ['Urban Systems Engineering', 'مهندسی سیستم‌های شهری'],
  ['Urban Transformation', 'بازآفرینی شهری'],
  ['Urban Renewal', 'نوسازی شهری'],
  ['Urban Design', 'طراحی شهری'],
  ['Urbanization', 'شهرنشینی'],
  ['Urban', 'شهری'],
  // ── Teacher / Teaching / Training
  ['Teacher Training in Mathematics at Primary School Level', 'آموزش معلم ریاضی در سطح دبستان'],
  ['Teacher Training at Primary School Level', 'آموزش معلم در سطح دبستان'],
  ['Teacher Training at Pre-School Level', 'آموزش معلم در سطح پیش‌دبستانی'],
  ['Elementary School Teacher Education', 'آموزش معلمان دبستان'],
  ['Teacher Training in English', 'آموزش معلم زبان انگلیسی'],
  ['Teacher Training in Arabic', 'آموزش معلم زبان عربی'],
  ['Teacher Training in Turkish', 'آموزش معلم زبان ترکی'],
  ['Special Education Teacher', 'معلم آموزش ویژه'],
  ['Primary Education Teacher', 'معلم آموزش ابتدایی'],
  ['Teacher Training', 'آموزش معلم'],
  ['Teacher Education', 'آموزش معلم'],
  ['Teacher', 'معلم'],
  // ── Primary / Elementary Education
  ['Primary School Mathematics Teaching', 'آموزش ریاضیات مدرسه ابتدایی'],
  ['Primary Mathematics Education', 'آموزش ریاضیات ابتدایی'],
  ['Primary Mathematics Teaching', 'آموزش ریاضیات ابتدایی'],
  ['Primary School Teaching', 'آموزش دبستانی'],
  ['Primary Education', 'آموزش ابتدایی'],
  ['Primary School', 'مدرسه ابتدایی'],
  ['Primary', 'ابتدایی'],
  // ── Speech
  ['Speech and Language Therapy', 'گفتار و زبان‌درمانی'],
  ['Speech and Language Pathology', 'آسیب‌شناسی گفتار و زبان'],
  ['Speech and Language', 'گفتار و زبان'],
  ['Speech Therapy', 'گفتار درمانی'],
  ['Speech', 'گفتار'],
  // ── Psychological / Guidance
  ['Psychological Counselling and Guidance', 'راهنمایی و مشاوره روان‌شناختی'],
  ['Psychological Counseling & Guidance', 'راهنمایی و مشاوره روان‌شناختی'],
  ['Psychological Councelling and Guidance', 'راهنمایی و مشاوره روان‌شناختی'],
  ['Psychological and Brain Sciences', 'علوم روان‌شناختی و مغز'],
  ['Guidance and Psychological Counselling', 'راهنمایی و مشاوره روان‌شناختی'],
  ['Guidance and Psychological Counseling', 'راهنمایی و مشاوره روان‌شناختی'],
  ['Guidance and Psychology Counselling', 'راهنمایی و مشاوره روان‌شناختی'],
  ['Guidance and Psychology Counseling', 'راهنمایی و مشاوره روان‌شناختی'],
  ['Psychological Counseling', 'مشاوره روان‌شناختی'],
  ['Psychological Counselling', 'مشاوره روان‌شناختی'],
  ['Spiritual Counseling and Guidance', 'مشاوره معنوی و راهنمایی'],
  ['Guidance and Counselling', 'راهنمایی و مشاوره'],
  ['Guidance and Counseling', 'راهنمایی و مشاوره'],
  ['Counseling And Guidance', 'مشاوره و راهنمایی'],
  ['Tourist Guidance', 'راهنمایی گردشگری'],
  ['Tourism Guidance', 'راهنمایی گردشگری'],
  ['Psychological', 'روان‌شناختی'],
  ['Guidance', 'راهنمایی'],
  // ── Therapy / Rehabilitation
  ['Physiotherapy and Rehabilitation', 'فیزیوتراپی و توانبخشی'],
  ['Cognitive Rehabilitation', 'توانبخشی شناختی'],
  ['Rehabilitation Engineering', 'مهندسی توانبخشی'],
  ['Sports Physiotherapy', 'فیزیوتراپی ورزشی'],
  ['Occupational Therapy', 'کاردرمانی'],
  ['Physical Therapy', 'فیزیوتراپی'],
  ['Phytotheraphy', 'گیاه‌درمانی'],
  ['Phytotherapy', 'گیاه‌درمانی'],
  ['Rehabilitation', 'توانبخشی'],
  ['Therapy', 'درمان'],
  // ── Pharmaceutical / Pharmacology
  ['Pharmaceutical Design and Development', 'طراحی و توسعه دارو'],
  ['Pharmaceutical Toxicology', 'سم‌شناسی داروسازی'],
  ['Pharmaceutical Chemistry', 'شیمی داروسازی'],
  ['Pharmaceutical Sciences', 'علوم دارویی'],
  ['Pharmaceutical Technology', 'فناوری داروسازی'],
  ['Pharmaceuticals Technology', 'فناوری داروسازی'],
  ['Pharmaceutical Services', 'خدمات داروسازی'],
  ['Cancer Biology and Pharmacology', 'بیولوژی سرطان و داروشناسی'],
  ['Pharmacoeconomics And Pharmacoepidemiology', 'داروقتصاد و داروپیدمیولوژی'],
  ['Pharmacognosy', 'داروگنوسی'],
  ['Pharmacology', 'داروشناسی'],
  ['Pharmaceutical', 'دارویی'],
  // ── Radiology / Anatomy / Physiology
  ['Dentomaxillofacial Radiology', 'رادیولوژی دهان و فک و صورت'],
  ['Clinical Anatomy', 'آناتومی بالینی'],
  ['Sports Physiology', 'فیزیولوژی ورزشی'],
  ['Physiology', 'فیزیولوژی'],
  ['Anatomy', 'آناتومی'],
  ['Radiology', 'رادیولوژی'],
  // ── Anesthesia
  ['Anaesthesiology', 'بیهوشی‌شناسی'],
  ['Anesthesia', 'بیهوشی'],
  // ── Clinical
  ['Clinical Psychology', 'روان‌شناسی بالینی'],
  ['Clinical Pharmacy', 'داروسازی بالینی'],
  ['Clinical Engineering', 'مهندسی بالینی'],
  ['Clinical Embryology', 'جنین‌شناسی بالینی'],
  ['Clinical Periodontology', 'پریودنتولوژی بالینی'],
  ['Clinical', 'بالینی'],
  // ── Criminology / Anthropology
  ['Biological Anthropology', 'مردم‌شناسی زیستی'],
  ['Criminal Psychology', 'روان‌شناسی جنایی'],
  ['Criminology', 'جرم‌شناسی'],
  ['Anthropology', 'مردم‌شناسی'],
  // ── Linguistics / Translation
  ['Translation and Interpreting Studies', 'مطالعات ترجمه و مترجمی'],
  ['Translation and Interpretation', 'ترجمه و مترجمی'],
  ['Translation and Interpreting', 'ترجمه و مترجمی'],
  ['Translation Studies', 'مطالعات ترجمه'],
  ['Linguistics', 'زبان‌شناسی'],
  ['Translation', 'ترجمه'],
  // ── Mechatronics / Metallurgy
  ['Automotive Mechatronics and Intelligent Vehicles', 'مکاترونیک خودرو و وسایل نقلیه هوشمند'],
  ['Mechatronics', 'مکاترونیک'],
  ['Metallurgy', 'متالورژی'],
  // ── Entrepreneurship
  ['Entrepreneurship and Innovation Management', 'مدیریت کارآفرینی و نوآوری'],
  ['Entrepreneurship and Innovation in Technology', 'کارآفرینی و نوآوری در فناوری'],
  ['Entrepreneurship and Leadership in Education', 'کارآفرینی و رهبری در آموزش'],
  ['Entrepreneurship and Innovation', 'کارآفرینی و نوآوری'],
  ['Creative Entrepreneurship', 'کارآفرینی خلاق'],
  ['Entrepreneurship', 'کارآفرینی'],
  // ── Coaching
  ['Coaching Education', 'آموزش مربیگری'],
  ['Coaching Training', 'آموزش مربیگری'],
  ['Sport Coaching', 'مربیگری ورزشی'],
  ['Coaching', 'مربیگری'],
  // ── Hospitality / Hotel / Tourism
  ['Tourism and Hospitality Management', 'مدیریت گردشگری و مهمان‌نوازی'],
  ['Tourism and Hotel Management', 'مدیریت گردشگری و هتل'],
  ['Hospitality Management', 'مدیریت مهمان‌نوازی'],
  ['Tourism & Hospitality', 'گردشگری و مهمان‌نوازی'],
  ['Hotel Management', 'مدیریت هتل'],
  ['Hospitality', 'مهمان‌نوازی'],
  ['Hotel', 'هتل'],
  // ── Nutrition
  ['Animal Nutrition and Nutritional Diseases', 'تغذیه حیوانات و بیماری‌های تغذیه‌ای'],
  ['Sports Nutrition', 'تغذیه ورزشی'],
  ['Food Nutrition', 'تغذیه غذایی'],
  ['Athlete nutrition', 'تغذیه ورزشکار'],
  ['Nutrition', 'تغذیه'],
  // ── Neuroscience / Neurophysiology
  ['Electro Neurophysiology', 'نوروفیزیولوژی'],
  ['Electroneurophysiology', 'الکترونوروفیزیولوژی'],
  ['Neuroscience', 'علوم اعصاب'],
  // ── Social Work / Gerontology / Microbiology / Ecology / Geology
  ['Veterinary Microbiology', 'میکروب‌شناسی دامپزشکی'],
  ['Social Work', 'مددکاری اجتماعی'],
  ['Gerontology', 'سالمندشناسی'],
  ['Microbiology', 'میکروب‌شناسی'],
  ['Ecology', 'بوم‌شناسی'],
  ['Geology', 'زمین‌شناسی'],
  // ── Psychology variants
  ['Exercise and Sports Psychology', 'روان‌شناسی ورزش و تمرین'],
  ['Industrial and Organizational Psychology', 'روان‌شناسی صنعتی و سازمانی'],
  ['Addiction Psychology', 'روان‌شناسی اعتیاد'],
  ['Applied Psychology', 'روان‌شناسی کاربردی'],
  ['General Psychology', 'روان‌شناسی عمومی'],
  ['Social Psychology', 'روان‌شناسی اجتماعی'],
  // ── Additional medical / health
  ['Addiction Consultancy and Rehabilitation', 'مشاوره اعتیاد و توانبخشی'],
  ['Allergy and Immunology', 'آلرژی و ایمونولوژی'],
  ['Aesthetic Dentistry', 'دندانپزشکی زیبایی'],
  ['Dental Prosthetics', 'پروتز دندان'],
  ['Exercise and Training Sciences', 'علوم تمرین و ورزش'],
  ['Alternative Energy Sources', 'منابع انرژی جایگزین'],
  // ── Teaching subject compounds
  ['Physical Education and Sports Teaching', 'آموزش تربیت بدنی و ورزش'],
  ['Physical Education & Sports Teaching', 'آموزش تربیت بدنی و ورزش'],
  ['Turkish Language and Literature Teaching Program', 'برنامه آموزش زبان و ادبیات ترکی'],
  ['Turkish Language Teaching for Foreigners', 'آموزش زبان ترکی برای خارجی‌ها'],
  ['Hearing Impaired Education Teaching', 'آموزش ناشنوایان'],
  ['Religious History and Ethics Education Teaching', 'آموزش تاریخ دین و اخلاق'],
  ['Social Sciences Teaching', 'آموزش علوم اجتماعی'],
  ['Technology Design Teaching', 'آموزش طراحی فناوری'],
  ['Arts and Crafts Teaching', 'آموزش هنر و صنایع دستی'],
  ['Turkish Language Teaching', 'آموزش زبان ترکی'],
  ['Arabic Language Teaching', 'آموزش زبان عربی'],
  ['Geography Teaching', 'آموزش جغرافیا'],
  ['Science Teaching', 'آموزش علوم'],
  ['History Teaching', 'آموزش تاریخ'],
  ['Art Teaching', 'آموزش هنر'],
  ['English Teaching', 'آموزش زبان انگلیسی'],
  ['Pre-School Teaching', 'آموزش پیش‌دبستانی'],
  ['Adult Education Teaching', 'تدریس آموزش بزرگسالان'],
  // ── Flight / Pilot / Tour / Vocal Training
  ['Tour Guide Training', 'آموزش راهنمای تور'],
  ['Flight Training', 'آموزش خلبانی'],
  ['Pilot Training', 'آموزش خلبانی'],
  ['Vocal Training', 'آموزش آواز'],
  ['Training', 'آموزش'],
  // ── Geography / Innovation
  ['Geography', 'جغرافیا'],
  ['Innovation', 'نوآوری'],
  // ── Midwifery / Obstetrics / Gynecology
  ['Obstetrics and Gynecology Nursing', 'پرستاری زنان و زایمان'],
  ['Mental Health and Psychiatric Nursing', 'پرستاری بهداشت روان'],
  ['Obstetrics and Gynecology', 'زنان و زایمان'],
  ['Obstetrics and Gynaecologic Nursing', 'پرستاری زنان و زایمان'],
  ['Psychiatric Nursing', 'پرستاری روانپزشکی'],
  ['Obstetrics', 'زنان و زایمان'],
  ['Gynecology', 'زنان و زایمان'],
  ['Midwifery', 'مامایی'],
  ['Psychiatric', 'روانپزشکی'],
  // ── Medical specialties
  ['Pathology Laboratory Techniques', 'فنون آزمایشگاه آسیب‌شناسی'],
  ['Pathology Laboratory', 'آزمایشگاه آسیب‌شناسی'],
  ['Medical Laboratory Techniques', 'فنون آزمایشگاه پزشکی'],
  ['Medical Microbiology and Clinical Microbiology', 'میکروب‌شناسی پزشکی و بالینی'],
  ['Medical Imaging Techniques', 'فنون تصویربرداری پزشکی'],
  ['Medical Laboratory', 'آزمایشگاه پزشکی'],
  ['Medical Microbiology', 'میکروب‌شناسی پزشکی'],
  ['Medical Genetics', 'ژنتیک پزشکی'],
  ['Medical Biochemistry', 'بیوشیمی پزشکی'],
  ['Medical Biotechnology', 'بیوتکنولوژی پزشکی'],
  ['Medical Physics', 'فیزیک پزشکی'],
  ['Medical Physiology', 'فیزیولوژی پزشکی'],
  ['Medical Pharmacology', 'داروشناسی پزشکی'],
  ['Medical Engineering', 'مهندسی پزشکی'],
  ['Histology and Embryology', 'بافت‌شناسی و جنین‌شناسی'],
  ['Dental Prosthetics Technology', 'فناوری پروتز دندان'],
  ['Dental Prosthesis Technology', 'فناوری پروتز دندان'],
  ['Pediatric Dentistry', 'دندانپزشکی اطفال'],
  ['Oral and Maxillofacial Surgery', 'جراحی دهان و فک و صورت'],
  ['Oral and Maxillofacial Radiology', 'رادیولوژی دهان و فک و صورت'],
  ['Oral and Dental Health', 'سلامت دهان و دندان'],
  ['Oral and Maxilla Radiology', 'رادیولوژی فک و دهان'],
  ['Oral Implantology', 'ایمپلنتولوژی دهان'],
  ['Oral & Dental Health', 'سلامت دهان و دندان'],
  ['Reproductive Medicine', 'پزشکی تولید مثل'],
  ['Reproductive Biology', 'زیست‌شناسی تولید مثل'],
  ['Tissue Engineering and Regenerative Medicine', 'مهندسی بافت و پزشکی بازساختی'],
  ['Intensive Care Nursing', 'پرستاری مراقبت‌های ویژه'],
  ['Operating Room Services', 'خدمات اتاق عمل'],
  ['Operating Room Service', 'خدمات اتاق عمل'],
  ['Occupational Health and Safety', 'بهداشت و ایمنی شغلی'],
  ['Elderly Care Services', 'خدمات مراقبت از سالمندان'],
  ['Public Health Nursing', 'پرستاری بهداشت عمومی'],
  ['Histology', 'بافت‌شناسی'],
  ['Endodontics', 'اندودنتیک'],
  ['Periodontology', 'پریودنتولوژی'],
  ['Prosthodontics', 'پروتز دندانی'],
  ['Orthodontics', 'ارتودنسی'],
  ['Restorative Dentistry', 'دندانپزشکی ترمیمی'],
  ['Prosthetic Dentistry', 'دندانپزشکی پروتز'],
  ['Pathology', 'آسیب‌شناسی'],
  ['Immunology', 'ایمونولوژی'],
  ['Reproductive', 'تولید مثل'],
  ['Intensive Care', 'مراقبت‌های ویژه'],
  ['Intensive', 'ویژه'],
  ['Operating Room', 'اتاق عمل'],
  ['Elderly Care', 'مراقبت از سالمندان'],
  ['Elderly', 'سالمند'],
  ['Mental Health', 'بهداشت روان'],
  ['Public Health', 'بهداشت عمومی'],
  ['Pediatric', 'اطفال'],
  ['Surgical Nursing', 'پرستاری جراحی'],
  ['Surgical', 'جراحی'],
  ['Surgery', 'جراحی'],
  ['Dialysis', 'دیالیز'],
  ['Audiometry', 'شنوایی‌سنجی'],
  ['Opticianry', 'عینک‌سازی'],
  // ── Emergency / First Aid
  ['Emergency and First Aid', 'اورژانس و کمک‌های اولیه'],
  ['First Aid and Emergency', 'کمک‌های اولیه و اورژانس'],
  ['Emergency and Disaster Management', 'مدیریت اورژانس و بلایا'],
  ['Emergency Nursing', 'پرستاری اورژانس'],
  ['First and Emergency Aid', 'کمک‌های اولیه و اورژانس'],
  ['First Aid', 'کمک‌های اولیه'],
  ['Emergency', 'اورژانس'],
  // ── Aerospace / Aeronautical / Avionics
  ['Aerospace Engineering', 'مهندسی هوافضا'],
  ['Aeronautical Engineering', 'مهندسی هوانوردی'],
  ['Aeronautical', 'هوانوردی'],
  ['Aerospace', 'هوافضا'],
  ['Avionics', 'آویونیک'],
  // ── Cyber Security / Blockchain / Cloud / Data
  ['Cyber Security Engineering', 'مهندسی امنیت سایبری'],
  ['Cyber Security Technology', 'فناوری امنیت سایبری'],
  ['Data Science and Analytics', 'علوم داده و تجزیه تحلیل'],
  ['Big Data Analytic and Management', 'مدیریت و تجزیه کلان داده'],
  ['Cyber Security', 'امنیت سایبری'],
  ['Cloud Computing', 'رایانش ابری'],
  ['Cybersecurity', 'امنیت سایبری'],
  ['Data Science', 'علوم داده'],
  ['Data Analytics', 'تجزیه و تحلیل داده'],
  ['Blockchain', 'بلاکچین'],
  ['Data', 'داده'],
  // ── Molecular / Tissue / Nanotechnology / Robotics / Bioengineering
  ['Molecular Biology and Genetics', 'زیست‌شناسی مولکولی و ژنتیک'],
  ['Molecular Oncology', 'انکولوژی مولکولی'],
  ['Molecular Medicine', 'پزشکی مولکولی'],
  ['Molecular Biology', 'زیست‌شناسی مولکولی'],
  ['Nanotechnology Engineering', 'مهندسی نانوفناوری'],
  ['Robotics and Artificial Intelligence', 'رباتیک و هوش مصنوعی'],
  ['Tissue Engineering', 'مهندسی بافت'],
  ['Software Development', 'توسعه نرم‌افزار'],
  ['Bioinformatics', 'بیوانفورماتیک'],
  ['Bioengineering', 'زیست‌مهندسی'],
  ['Biophysics', 'بیوفیزیک'],
  ['Nanotechnology', 'نانوفناوری'],
  ['Robotics', 'رباتیک'],
  ['Molecular', 'مولکولی'],
  ['Tissue', 'بافت'],
  // ── Engineering specialties
  ['Structural Engineering', 'مهندسی سازه'],
  ['Geomatics Engineering', 'مهندسی ژئوماتیک'],
  ['Forensic Chemistry and Toxicology', 'شیمی پزشکی قانونی و سم‌شناسی'],
  ['Forensic Science', 'علوم پزشکی قانونی'],
  ['Construction Management and Technology', 'مدیریت و فناوری ساخت و ساز'],
  ['Construction Management', 'مدیریت ساخت و ساز'],
  ['Construction Engineering', 'مهندسی ساخت'],
  ['Manufacturing Engineering', 'مهندسی ساخت'],
  ['Nuclear Technology and Radiation Safety', 'فناوری هسته‌ای و ایمنی پرتو'],
  ['Water and Waste Management', 'مدیریت آب و پسماند'],
  ['Food Engineering', 'مهندسی مواد غذایی'],
  ['Food Technology', 'فناوری مواد غذایی'],
  ['Food Safety', 'ایمنی مواد غذایی'],
  ['Energy Systems Engineering', 'مهندسی سیستم‌های انرژی'],
  ['Energy Facilities Management', 'مدیریت تأسیسات انرژی'],
  ['Geomatics', 'ژئوماتیک'],
  ['Construction', 'ساخت و ساز'],
  ['Manufacturing', 'تولید'],
  ['Structural', 'سازه'],
  ['Forensic', 'پزشکی قانونی'],
  ['Nuclear', 'هسته‌ای'],
  ['Energy', 'انرژی'],
  ['Ship Machinery', 'ماشین‌آلات کشتی'],
  ['Ship and Yacht Design', 'طراحی کشتی و قایق'],
  ['Welding Technology', 'فناوری جوشکاری'],
  ['Packaging', 'بسته‌بندی'],
  ['Pilotage', 'خلبانی'],
  ['Ship', 'کشتی'],
  ['Welding', 'جوشکاری'],
  ['Laboratory', 'آزمایشگاه'],
  // ── Library / Information
  ['Library and Information Science', 'علم کتابداری و اطلاع‌رسانی'],
  ['Library', 'کتابداری'],
  // ── New Media / Cinema / Film / Drama / Acting / Advertising
  ['New Media and Communication Systems', 'سیستم‌های ارتباطات و رسانه‌های نوین'],
  ['New Media and Communication', 'ارتباطات و رسانه‌های نوین'],
  ['New Media Communication and Journalism', 'روزنامه‌نگاری و ارتباطات رسانه‌های نوین'],
  ['New Media and Journalism', 'روزنامه‌نگاری و رسانه‌های نوین'],
  ['Acting for Theatre, Film, and Television', 'بازیگری برای تئاتر، فیلم و تلویزیون'],
  ['Cinema And Television', 'سینما و تلویزیون'],
  ['Cinema and Digital Media', 'سینما و رسانه دیجیتال'],
  ['Film Design and New Media', 'طراحی فیلم و رسانه‌های نوین'],
  ['Film and Television Production', 'تولید فیلم و تلویزیون'],
  ['Film-Making and Broadcasting', 'فیلم‌سازی و پخش'],
  ['Film and Television', 'فیلم و تلویزیون'],
  ['Film Design and Management', 'طراحی و مدیریت فیلم'],
  ['Film Making', 'فیلم‌سازی'],
  ['Radio, Television and Film Studies', 'مطالعات رادیو، تلویزیون و فیلم'],
  ['Drama - Theatre Education', 'درام - آموزش تئاتر'],
  ['Drama - Dramatic Writing', 'درام - نویسندگی نمایشی'],
  ['Drama - Technical Theatre and Design', 'درام - تئاتر فنی و طراحی'],
  ['Drama And Acting', 'درام و بازیگری'],
  ['Drama Writing', 'نویسندگی نمایشی'],
  ['Creative Drama In Education', 'درام خلاق در آموزش'],
  ['New Media', 'رسانه‌های نوین'],
  ['Acting', 'بازیگری'],
  ['Cinema', 'سینما'],
  ['Drama', 'درام'],
  ['Film', 'فیلم'],
  ['Broadcasting', 'پخش'],
  // ── Fashion / Textile / Digital / Sound
  ['Textile and Fashion Design', 'طراحی نساجی و مد'],
  ['Fashion Design', 'طراحی مد'],
  ['Sound Design', 'طراحی صدا'],
  ['Digital Game Design', 'طراحی بازی دیجیتال'],
  ['Digital Marketing and Social Media Management', 'مدیریت بازاریابی دیجیتال و رسانه اجتماعی'],
  ['Digital Marketing', 'بازاریابی دیجیتال'],
  ['Digital Media Management', 'مدیریت رسانه دیجیتال'],
  ['Digital Health Systems', 'سیستم‌های سلامت دیجیتال'],
  ['Digital Transformation', 'تحول دیجیتال'],
  ['Digital Economy', 'اقتصاد دیجیتال'],
  ['Fashion', 'مد'],
  ['Textile', 'نساجی'],
  ['Digital', 'دیجیتال'],
  ['Sound', 'صدا'],
  // ── Advertising / Culture / Islamic / Migration
  ['Advertising and Brand Communication', 'ارتباطات تبلیغات و برند'],
  ['Advertising and Public Relations', 'تبلیغات و روابط عمومی'],
  ['Islamic Economics and Finance', 'اقتصاد و مالیه اسلامی'],
  ['Islamic Economics and Law', 'اقتصاد و حقوق اسلامی'],
  ['Islamic History and Arts', 'تاریخ و هنرهای اسلامی'],
  ['Cultural Heritage Management', 'مدیریت میراث فرهنگی'],
  ['Cultural Heritage', 'میراث فرهنگی'],
  ['Culture Management', 'مدیریت فرهنگی'],
  ['Advertising', 'تبلیغات'],
  ['Culture', 'فرهنگ'],
  ['Islamic', 'اسلامی'],
  ['Migration', 'مهاجرت'],
  // ── Quality / Sales / Capital / Commerce / Construction / Manufacturing
  ['Quality Management in Healthcare', 'مدیریت کیفیت در بهداشت'],
  ['Quality Management', 'مدیریت کیفیت'],
  ['Capital Markets', 'بازارهای سرمایه'],
  ['Commerce - Accounting', 'بازرگانی - حسابداری'],
  ['Commerce - Marketing', 'بازرگانی - بازاریابی'],
  ['Commerce - Technology Management', 'بازرگانی - مدیریت فناوری'],
  ['E-Commerce and Management', 'مدیریت تجارت الکترونیک'],
  ['Commerce', 'بازرگانی'],
  ['Quality', 'کیفیت'],
  ['Sales', 'فروش'],
  ['Capital', 'سرمایه'],
  // ── Painting / Recreation / Gerontology / User Experience
  ['User Experience Design', 'طراحی تجربه کاربری'],
  ['User Experience', 'تجربه کاربری'],
  ['Recreation Management', 'مدیریت تفریح و اوقات فراغت'],
  ['Recreation', 'تفریح و اوقات فراغت'],
  ['Interior Architecture & Environmental Design', 'معماری داخلی و طراحی محیطی'],
  ['Interior Architecture and Environmental Design', 'معماری داخلی و طراحی محیطی'],
  ['Interior Design', 'طراحی داخلی'],
  ['Painting', 'نقاشی'],
  ['Faculty of', 'دانشکده'],
  ['College of', 'کالج'],
  ['School of', 'مدرسه'],
  ['and', 'و'],
  ['of', ''],
  // ── Technology / Computer / Systems / Programming
  ['Computer Aided Design and Animation', 'طراحی با کمک کامپیوتر و انیمیشن'],
  ['Computer Aided Design', 'طراحی با کمک کامپیوتر'],
  ['Computer Aided', 'با کمک کامپیوتر'],
  ['Computer Technologies and Programming', 'فناوری کامپیوتر و برنامه‌نویسی'],
  ['Computer Technologies', 'فناوری کامپیوتر'],
  ['Computer Technology', 'فناوری کامپیوتر'],
  ['Computer Programming', 'برنامه‌نویسی کامپیوتر'],
  ['Computer Information System', 'سیستم اطلاعات کامپیوتر'],
  ['Computer Operations', 'عملیات کامپیوتر'],
  ['Applied Computer Science', 'علوم کاربردی کامپیوتر'],
  ['Applied Mathematics and Computer Sciences', 'ریاضیات کاربردی و علوم کامپیوتر'],
  ['Web Design and Programming', 'طراحی وب و برنامه‌نویسی'],
  ['Web Design', 'طراحی وب'],
  ['Game Development and Programming', 'توسعه بازی و برنامه‌نویسی'],
  ['Game Development', 'توسعه بازی'],
  ['Advanced Software Technology', 'فناوری نرم‌افزار پیشرفته'],
  ['Software Data and Technology', 'داده و فناوری نرم‌افزار'],
  ['Internet and Network Technologies', 'فناوری اینترنت و شبکه'],
  ['Internet And Web Technologies', 'فناوری اینترنت و وب'],
  ['Mobile Technologies', 'فناوری‌های موبایل'],
  ['Mobile Technology', 'فناوری موبایل'],
  ['Information Systems and Technologies', 'سیستم‌ها و فناوری اطلاعات'],
  ['Information Security Engineering', 'مهندسی امنیت اطلاعات'],
  ['Information Security Technology', 'فناوری امنیت اطلاعات'],
  ['Information Security', 'امنیت اطلاعات'],
  ['Information Communication Technologies', 'فناوری ارتباطات اطلاعات'],
  ['Information Technologies', 'فناوری اطلاعات'],
  ['Systems Engineering', 'مهندسی سیستم‌ها'],
  ['Healthcare Systems Engineering', 'مهندسی سیستم‌های بهداشتی'],
  ['Industrial and Systems Engineering', 'مهندسی صنایع و سیستم‌ها'],
  ['ARTIFICIAL INTELLIGENCE TECHNOLOGIES IN EDUCATION', 'فناوری‌های هوش مصنوعی در آموزش'],
  // ── Business / Economy / Finance / Trade
  ['Business Management', 'مدیریت کسب‌وکار'],
  ['Business Analytics', 'تجزیه و تحلیل کسب‌وکار'],
  ['Business Adminstration', 'مدیریت کسب‌وکار'],
  ['Business Admin and Applied Economics', 'مدیریت کسب‌وکار و اقتصاد کاربردی'],
  ['Business Administration for Managers', 'مدیریت کسب‌وکار برای مدیران'],
  ['Business Administration in Project Management', 'مدیریت کسب‌وکار در مدیریت پروژه'],
  ['Business Administration in Healthcare Administration', 'مدیریت کسب‌وکار در مدیریت بهداشت'],
  ['International Business Administration', 'مدیریت کسب‌وکار بین‌الملل'],
  ['International Business Management', 'مدیریت کسب‌وکار بین‌الملل'],
  ['International Business Law', 'حقوق کسب‌وکار بین‌الملل'],
  ['International Business And Trade', 'کسب‌وکار و تجارت بین‌الملل'],
  ['International Business', 'کسب‌وکار بین‌الملل'],
  ['Global Economics and Management', 'اقتصاد جهانی و مدیریت'],
  ['Global Marketing and Brand Management', 'مدیریت بازاریابی جهانی و برند'],
  ['Global Human Resources Management', 'مدیریت منابع انسانی جهانی'],
  ['Global Logistics and Supply Chain Management', 'مدیریت لجستیک و زنجیره تأمین جهانی'],
  ['Global Health', 'سلامت جهانی'],
  ['Global Studies', 'مطالعات جهانی'],
  ['Global Politics and International Relations', 'سیاست جهانی و روابط بین‌الملل'],
  ['Global Politics', 'سیاست جهانی'],
  ['Financial Management', 'مدیریت مالی'],
  ['Financial Technology', 'فناوری مالی'],
  ['Financial Engineering', 'مهندسی مالی'],
  ['Financial Economics', 'اقتصاد مالی'],
  ['International Financial Reporting and Auditing', 'گزارش‌دهی و حسابرسی مالی بین‌الملل'],
  ['International Finance Reporting and Auditing', 'گزارش‌دهی و حسابرسی مالی بین‌الملل'],
  ['Accounting and Auditing', 'حسابداری و حسابرسی'],
  ['Accounting and Tax Practices', 'حسابداری و رویه‌های مالیاتی'],
  ['Accounting and Tax Applications', 'حسابداری و کاربردهای مالیاتی'],
  ['Accounting and International Reporting', 'حسابداری و گزارش‌دهی بین‌الملل'],
  ['International Finance and Participation Banking', 'امور مالی بین‌الملل و بانکداری مشارکتی'],
  ['International Taxation', 'مالیات بین‌الملل'],
  ['International Trade and European Union Law', 'تجارت بین‌الملل و حقوق اتحادیه اروپا'],
  ['International Trade and Logistics', 'تجارت بین‌الملل و لجستیک'],
  ['International Trade and Business', 'تجارت بین‌الملل و کسب‌وکار'],
  ['Agricultural Trade and Management', 'تجارت و مدیریت کشاورزی'],
  ['Foreign Trade', 'تجارت خارجی'],
  ['Electronic Commerce and Management', 'تجارت الکترونیک و مدیریت'],
  ['Economy and Finance', 'اقتصاد و امور مالی'],
  ['Economy', 'اقتصاد'],
  ['Political Economy', 'اقتصاد سیاسی'],
  ['International Political Economy', 'اقتصاد سیاسی بین‌الملل'],
  ['Production Economics', 'اقتصاد تولید'],
  ['Real Estate Finance and Valuation', 'امور مالی و ارزیابی املاک'],
  ['Real Estate Development and Management', 'توسعه و مدیریت املاک'],
  ['Real Estate Development', 'توسعه املاک'],
  ['Agribusiness and Management', 'کشاورزی-تجاری و مدیریت'],
  // ── Medical / Healthcare / Hospital
  ['Medical Data Processing Technology', 'فناوری پردازش داده‌های پزشکی'],
  ['Medical Data Processing Technician', 'تکنسین پردازش داده‌های پزشکی'],
  ['Medical Documentation and Secretarial', 'مستندات پزشکی و منشی‌گری'],
  ['Medical Documenttion and Secretary', 'مستندات پزشکی و منشی'],
  ['Medical Documentation & Secretarial', 'مستندات پزشکی و منشی‌گری'],
  ['Medical Tourism Management', 'مدیریت گردشگری پزشکی'],
  ['Medical Promotion and Marketing', 'ترویج و بازاریابی پزشکی'],
  ['Medical Microbiolog', 'میکروب‌شناسی پزشکی'],
  ['Medical Biology and Genetics', 'زیست‌شناسی پزشکی و ژنتیک'],
  ['Healthcare Management in Emergencies and Natural Disaster', 'مدیریت بهداشت در اورژانس و بلایای طبیعی'],
  ['Healthcare Management', 'مدیریت بهداشت و درمان'],
  ['Healthcare Administration', 'مدیریت بهداشت و درمان'],
  ['Hospital and Health Institutions Management', 'مدیریت بیمارستان و موسسات بهداشتی'],
  ['Hospital and Healthcare Institutions Management', 'مدیریت بیمارستان و موسسات بهداشتی'],
  ['Hospital and Health Facilities Management', 'مدیریت بیمارستان و تأسیسات بهداشتی'],
  ['Health Institutions Administration', 'مدیریت موسسات بهداشتی'],
  ['Health Institutions Management', 'مدیریت موسسات بهداشتی'],
  ['Management of Health Institutions', 'مدیریت موسسات بهداشتی'],
  ['Nutrition and Dietetics', 'تغذیه و رژیم‌شناسی'],
  ['Pharmaceutical Botany', 'گیاه‌شناسی دارویی'],
  ['Actuarial Science', 'علوم اکچوئری'],
  ['Critical Care Nursing', 'پرستاری مراقبت‌های حیاتی'],
  ['Telehealth Technician', 'تکنسین سلامت از راه دور'],
  ['Digital Health Services Technician', 'تکنسین خدمات سلامت دیجیتال'],
  ['Digital Health Systems Technician', 'تکنسین سیستم‌های سلامت دیجیتال'],
  ['Digital Health Systems Technology', 'فناوری سیستم‌های سلامت دیجیتال'],
  ['Health Information System Technicians', 'تکنسین‌های سیستم اطلاعات سلامت'],
  ['Health Information System Technics', 'فنون سیستم اطلاعات سلامت'],
  ['Health Information System', 'سیستم اطلاعات سلامت'],
  ['Surgical Services', 'خدمات جراحی'],
  ['Surgical Disease Nursing', 'پرستاری بیماری‌های جراحی'],
  ['Surgical Diseases Nursing', 'پرستاری بیماری‌های جراحی'],
  ['Internal Diseases Nursing', 'پرستاری بیماری‌های داخلی'],
  ['Internal Medicine Nursing', 'پرستاری طب داخلی'],
  ['Child Health and Diseases Nursing', 'پرستاری سلامت و بیماری‌های کودکان'],
  ['Women\'s Health and Diseases Nursing', 'پرستاری سلامت و بیماری‌های زنان'],
  ['Social Services', 'خدمات اجتماعی'],
  ['Court Office Services', 'خدمات دفتر دادگاه'],
  ['Court Office Service', 'خدمات دفتر دادگاه'],
  ['Court and Office Services', 'خدمات دادگاه و دفتر'],
  ['Court and Office Management', 'مدیریت دادگاه و دفتر'],
  ['Office Management and Executive Assistance', 'مدیریت دفتر و دستیاری مدیریتی'],
  ['Civil Aviation Cabin Services', 'خدمات کابین هوانوردی غیرنظامی'],
  ['Tourism and Travel Services', 'خدمات گردشگری و مسافرتی'],
  ['Emergency Services', 'خدمات اورژانس'],
  ['Criminal Enforcement and Security Services', 'اجرای قانون کیفری و خدمات امنیتی'],
  ['Hair Care and Beauty Services', 'خدمات مراقبت از مو و زیبایی'],
  ['Hair Care Beauty Services', 'خدمات مراقبت از مو و زیبایی'],
  ['HAIR CARE AND BEAUTY SERVICES', 'خدمات مراقبت از مو و زیبایی'],
  ['Hair Dressing and Beauty Care', 'آرایش مو و مراقبت زیبایی'],
  ['Home-Care Services', 'خدمات مراقبت در منزل'],
  ['Child Protective and Nursing Services', 'خدمات حمایتی و پرستاری کودکان'],
  ['Dental Prosthetics Technology', 'فناوری پروتز دندان'],
  ['Orthopedic Prosthesis and Orthosis', 'پروتز و اورتز ارتوپدی'],
  ['Orthopedic Prosthetic and Orthotics', 'پروتز و اورتز ارتوپدی'],
  ['Prosthetic Dental Treatment', 'درمان پروتز دندانی'],
  ['Prosthetic Dentistry', 'دندانپزشکی پروتز'],
  ['Oral, Dental and Maxillofacial Surgery', 'جراحی دهان، دندان و فک و صورت'],
  ['Mouth, Teeth and Jaw Surgery', 'جراحی دهان، دندان و فک'],
  ['Food Hygiene and Technology', 'بهداشت و فناوری مواد غذایی'],
  ['Drug and Cosmetic Production Technologies', 'فناوری‌های تولید دارو و مواد آرایشی'],
  ['Drug Delivery', 'تحویل دارو'],
  ['Biostatistics', 'آمار زیستی'],
  ['Zootechnics', 'دام‌پروری'],
  ['Zoo Techniques', 'فنون دامپروری'],
  ['Cosmetology', 'آرایشگری'],
  ['Cosmetics Technology', 'فناوری مواد آرایشی'],
  ['Podology', 'پودولوژی'],
  ['PODOLOGY', 'پودولوژی'],
  ['Chiropractic', 'کایروپراکتیک'],
  ['Physiopathology', 'فیزیوپاتولوژی'],
  ['Myology', 'مایولوژی'],
  ['Autopsy Assistanship', 'دستیاری کالبدشکافی'],
  ['Dramaturgy', 'دراماتورژی'],
  // ── Electrical / Electronics / Marine / Transportation / Aviation
  ['Electrical-Electronics Engineering', 'مهندسی برق و الکترونیک'],
  ['Electrical-Electronic Engineering', 'مهندسی برق و الکترونیک'],
  ['Electric-Electronic Engineering', 'مهندسی برق و الکترونیک'],
  ['Electrical and Computer Engineering', 'مهندسی برق و کامپیوتر'],
  ['Electronics and Communication Engineering', 'مهندسی الکترونیک و ارتباطات'],
  ['Electronics and Electrical Engineering', 'مهندسی الکترونیک و برق'],
  ['Aviation Electrical and Electronics', 'برق و الکترونیک هوانوردی'],
  ['Aviation Electric and Electronics', 'برق و الکترونیک هوانوردی'],
  ['Electronics Technology', 'فناوری الکترونیک'],
  ['Electronic Technology', 'فناوری الکترونیک'],
  ['Electronic Communication Technology', 'فناوری ارتباطات الکترونیک'],
  ['Digital Conversion Electronics', 'الکترونیک تبدیل دیجیتال'],
  ['Electric Energy Production, Transmission and Distribution', 'تولید، انتقال و توزیع انرژی برق'],
  ['Electrical Energy Production, Transmission And Distribution PR', 'تولید، انتقال و توزیع انرژی برق'],
  ['Power Electronics and Clean Energy Systems', 'الکترونیک قدرت و سیستم‌های انرژی پاک'],
  ['Control and Automation Technology', 'فناوری کنترل و اتوماسیون'],
  ['Air Traffic Control', 'کنترل ترافیک هوایی'],
  ['Air Transport Management', 'مدیریت حمل و نقل هوایی'],
  ['Air Transport', 'حمل و نقل هوایی'],
  ['Air Logistics', 'لجستیک هوایی'],
  ['Air Lojistics', 'لجستیک هوایی'],
  ['Air Conditioning and Cooling', 'تهویه مطبوع و سرمایش'],
  ['Air Conditioning', 'تهویه مطبوع'],
  ['Flight Operations Management', 'مدیریت عملیات پرواز'],
  ['Flight Operation Management', 'مدیریت عملیات پرواز'],
  ['Flight Operations', 'عملیات پرواز'],
  ['Flight Operation', 'عملیات پرواز'],
  ['Professional Flight', 'خلبانی حرفه‌ای'],
  ['ATPL Flight Certification', 'گواهینامه پرواز ATPL'],
  ['Civil Aviation Transportation Management', 'مدیریت حمل و نقل هوانوردی غیرنظامی'],
  ['Civil Aviation Cabin Services', 'خدمات کابین هوانوردی غیرنظامی'],
  ['Civil Aviation Cabin Services', 'خدمات کابین هوانوردی غیرنظامی'],
  ['Civil Air Transportation Management', 'مدیریت حمل و نقل هوایی غیرنظامی'],
  ['Civil Air Transport Management', 'مدیریت حمل و نقل هوایی'],
  ['Civil Engineering Construction and Project Management', 'مدیریت ساخت و پروژه مهندسی عمران'],
  ['Civil Air Transport', 'حمل و نقل هوایی غیرنظامی'],
  ['MARITIME TRANSPORTATION AND MANAGEMENT ENGINEERING', 'مهندسی مدیریت حمل و نقل دریایی'],
  ['Maritime Transportation Management Engineering', 'مهندسی مدیریت حمل و نقل دریایی'],
  ['Maritime Transportation Management', 'مدیریت حمل و نقل دریایی'],
  ['Maritime Transportation', 'حمل و نقل دریایی'],
  ['Maritime and Port Management', 'مدیریت دریایی و بندری'],
  ['Maritime Policy and Strategies', 'سیاست‌ها و راهبردهای دریایی'],
  ['MARINE SCIENCES', 'علوم دریایی'],
  ['Marine Sciences', 'علوم دریایی'],
  ['Marine Engineering', 'مهندسی دریایی'],
  ['Marine Law', 'حقوق دریایی'],
  ['Marina And Yacht Management', 'مدیریت مارینا و قایق'],
  ['Transportation Engineering', 'مهندسی حمل و نقل'],
  ['Transportation Systems', 'سیستم‌های حمل و نقل'],
  ['International Transportation Systems', 'سیستم‌های حمل و نقل بین‌الملل'],
  ['International Logistics and Transportation', 'لجستیک و حمل و نقل بین‌الملل'],
  ['Rail Systems Management', 'مدیریت سیستم‌های ریلی'],
  ['Automotive Body and Surface Processing Technologies', 'فناوری‌های پردازش بدنه و سطح خودرو'],
  ['Automotive Technology', 'فناوری خودرو'],
  ['Hybrid and Electric Vehicle Technology', 'فناوری وسایل نقلیه هیبریدی و برقی'],
  ['Hybrid and Electric Vehicles Technology', 'فناوری وسایل نقلیه هیبریدی و برقی'],
  ['Unmanned Aerial Vehicle Technology and Operation', 'فناوری و عملیات هواپیمای بدون سرنشین'],
  ['Unmanned Aerial Vehicle Technology and Operator', 'فناوری هواپیمای بدون سرنشین و اپراتور'],
  ['Unmanned Vehicle Technician', 'تکنسین وسیله نقلیه بدون سرنشین'],
  ['Unmanned Systems Technician', 'تکنسین سیستم‌های بدون سرنشین'],
  ['UAV Technologies and Operations', 'فناوری‌ها و عملیات پهپاد'],
  ['Airframe and Powerplant Maintenance', 'نگهداری بدنه هواپیما و نیروگاه'],
  ['Aircraft Maintenance and Repair', 'نگهداری و تعمیر هواپیما'],
  ['Aircraft Engineering', 'مهندسی هواپیما'],
  ['Aircraft Technology', 'فناوری هواپیما'],
  ['AVIATION SCIENCES (AERONAUTICAL ENG)', 'علوم هوانوردی (مهندسی هوانوردی)'],
  // ── Engineering / Materials / Construction
  ['Materials Science and Engineering', 'علوم و مهندسی مواد'],
  ['Materials Science', 'علوم مواد'],
  ['Advanced Materials', 'مواد پیشرفته'],
  ['Biomedical Sciences and Engineering', 'علوم و مهندسی زیست‌پزشکی'],
  ['Biomedical Sciences', 'علوم زیست‌پزشکی'],
  ['Biomedical Device Technology', 'فناوری تجهیزات زیست‌پزشکی'],
  ['Metallurgical and Materials Engineering', 'مهندسی متالورژی و مواد'],
  ['Metallurgy and Material Engineering', 'مهندسی متالورژی و مواد'],
  ['Metallurgy and Materials Engineering', 'مهندسی متالورژی و مواد'],
  ['Material Sciences and Engineering', 'علوم و مهندسی مواد'],
  ['Mechanical and Aerospace Engineering', 'مهندسی مکانیک و هوافضا'],
  ['Chemical and Biological Engineering', 'مهندسی شیمی و زیستی'],
  ['Environmental Engineering Science', 'علم مهندسی محیط زیست'],
  ['Computational Science and Engineering', 'علوم محاسباتی و مهندسی'],
  ['Computational Social Sciences', 'علوم اجتماعی محاسباتی'],
  ['Computational Sciences', 'علوم محاسباتی'],
  ['Geotechnical Engineering', 'مهندسی ژئوتکنیک'],
  ['Stem Cell and Tissue Engineering', 'مهندسی سلول بنیادی و بافت'],
  ['Healthcare Systems Engineering', 'مهندسی سیستم‌های بهداشتی'],
  ['Building Insulation Technology', 'فناوری عایق‌بندی ساختمان'],
  ['Tunneling and Underground Structures', 'تونل‌سازی و سازه‌های زیرزمینی'],
  ['Smart Infrastructure Technology', 'فناوری زیرساخت هوشمند'],
  ['Construction Equipment Operations', 'عملیات تجهیزات ساختمانی'],
  ['Construction Inspection', 'بازرسی ساختمان'],
  ['Construction and Technical Drawing Technologies', 'فناوری‌های ساخت و نقشه‌کشی فنی'],
  ['Green And Ecological Building Technician', 'تکنسین ساختمان سبز و بوم‌شناختی'],
  ['Autonomous Systems Technician', 'تکنسین سیستم‌های خودمختار'],
  ['Atonomous Vehicle Technician', 'تکنسین وسیله نقلیه خودمختار'],
  ['Carbon Management Technology', 'فناوری مدیریت کربن'],
  ['Carbon Management Technician', 'تکنسین مدیریت کربن'],
  ['Petrol and Natural Gas Engineering', 'مهندسی نفت و گاز طبیعی'],
  ['Natural Gas Installation Technology', 'فناوری نصب گاز طبیعی'],
  ['Natural Gas and Installation Technology', 'فناوری گاز طبیعی و نصب'],
  ['Explosive Engineering', 'مهندسی انفجار'],
  ['Defense Technologies', 'فناوری‌های دفاعی'],
  ['Underwater Technologies', 'فناوری‌های زیرآبی'],
  ['Underwater Technology', 'فناوری زیرآبی'],
  ['Weapons Industry Technician', 'تکنسین صنایع اسلحه‌سازی'],
  ['Power Electronics', 'الکترونیک قدرت'],
  ['Environmental Measurement and Monitoring Systems Tech', 'فناوری سیستم‌های اندازه‌گیری و پایش محیط زیست'],
  ['CNC Programming and Operation', 'برنامه‌نویسی و عملیات CNC'],
  ['Heating, Ventilation & Air Conditioning (HVAC) Technology', 'فناوری گرمایش، تهویه و تهویه مطبوع (HVAC)'],
  ['Printing and Publishing Technology', 'فناوری چاپ و نشر'],
  ['Radio and Television Technology', 'فناوری رادیو و تلویزیون'],
  ['Prothesis Technology', 'فناوری پروتز'],
  ['Polymer Technology', 'فناوری پلیمر'],
  ['Non-Destructive Testing', 'آزمایش غیر مخرب'],
  ['Surveying & Cadaster', 'نقشه‌برداری و کاداستر'],
  ['Maps and Cadaster', 'نقشه‌ها و کاداستر'],
  // ── Public / Political / Policy
  ['Public Relations and Advertising', 'روابط عمومی و تبلیغات'],
  ['Public Relations and Marketing', 'روابط عمومی و بازاریابی'],
  ['Public Relations and Promotion', 'روابط عمومی و ترویج'],
  ['Public Relations and Presentation', 'روابط عمومی و ارائه'],
  ['Public Relations and Information', 'روابط عمومی و اطلاعات'],
  ['Public Relation and Advertisement', 'روابط عمومی و تبلیغات'],
  ['Public Relation and Publicity', 'روابط عمومی و اطلاع‌رسانی'],
  ['Marketing Communication and Public Relations', 'ارتباطات بازاریابی و روابط عمومی'],
  ['Public Relations', 'روابط عمومی'],
  ['Public Policy', 'سیاست عمومی'],
  ['Public Law', 'حقوق عمومی'],
  ['Public Affairs', 'امور عمومی'],
  ['Political Science and International Relation', 'علوم سیاسی و روابط بین‌الملل'],
  ['Political Sciences and International Relations', 'علوم سیاسی و روابط بین‌الملل'],
  ['Political Science and International Relations', 'علوم سیاسی و روابط بین‌الملل'],
  ['Political and International Studies', 'مطالعات سیاسی و بین‌الملل'],
  ['Global Affairs', 'امور جهانی'],
  ['European Union Studies', 'مطالعات اتحادیه اروپا'],
  ['European Union Relations', 'روابط اتحادیه اروپا'],
  ['International Trade and European Union Law', 'تجارت بین‌الملل و حقوق اتحادیه اروپا'],
  ['European Studies', 'مطالعات اروپایی'],
  ['European Human Rights', 'حقوق بشر اروپایی'],
  ['Human Rights Law', 'حقوق بشر'],
  ['Human Rights', 'حقوق بشر'],
  ['Human Factors', 'عوامل انسانی'],
  // ── Education / Administration
  ['PHILOSOPHICAL SOCIAL AND HISTORICAL FOUNDATIONS OF EDUCATION', 'مبانی فلسفی، اجتماعی و تاریخی آموزش'],
  ['EDUCATIONAL TECHNOLOGY AND EDUCATIONAL DESIGN', 'فناوری و طراحی آموزشی'],
  ['EDUCATIONAL PROGRAM AND INSTRUCTION', 'برنامه و روش تدریس آموزشی'],
  ['Educational Administration and Supervision', 'مدیریت آموزشی و نظارت'],
  ['Educational Administration and Planning', 'مدیریت آموزشی و برنامه‌ریزی'],
  ['Educational Administration, Supervision, Economics, and Planning', 'مدیریت، نظارت، اقتصاد و برنامه‌ریزی آموزشی'],
  ['Educational Administration', 'مدیریت آموزشی'],
  ['Educational Technology', 'فناوری آموزشی'],
  ['Educational Design and Evaluation', 'طراحی و ارزیابی آموزشی'],
  ['Educational Economy and Planning', 'اقتصاد آموزشی و برنامه‌ریزی'],
  ['Educational Management', 'مدیریت آموزشی'],
  ['Educational Sciences', 'علوم تربیتی'],
  ['Measurement and Evaluation in Education', 'سنجش و ارزشیابی در آموزش'],
  ['Measurement and Evaluation Education', 'سنجش و ارزشیابی آموزشی'],
  ['Managing Educational Institutions', 'مدیریت موسسات آموزشی'],
  ['Preschool Education', 'آموزش پیش‌دبستانی'],
  ['Early Childhood Education', 'آموزش دوران کودکی'],
  ['Early Childhood', 'دوران کودکی اولیه'],
  ['Elementary Education', 'آموزش ابتدایی'],
  ['Mentally Handicapped Teaching', 'آموزش معلولان ذهنی'],
  ['Teaching Program for the Mentally Disadvantaged', 'برنامه آموزش کودکان با نیاز ویژه'],
  ['Education of the mentally disabled', 'آموزش معلولان ذهنی'],
  ['Shadow Education for Special Needs', 'آموزش ویژه سایه برای نیازهای خاص'],
  ['Gifted and Talented Education', 'آموزش استعدادهای درخشان'],
  ['Hearing Impaired Education Teaching', 'آموزش ناشنوایان'],
  ['Folklore Education', 'آموزش فرهنگ عامه'],
  ['Adult Education Teaching', 'تدریس آموزش بزرگسالان'],
  ['Information Technologies And Social Media Education', 'آموزش فناوری اطلاعات و رسانه اجتماعی'],
  ['It Based Teaching Technology', 'فناوری آموزشی مبتنی بر فناوری اطلاعات'],
  ['Technology Design Teaching', 'آموزش طراحی فناوری'],
  ['Education Management and Planning', 'مدیریت و برنامه‌ریزی آموزشی'],
  // ── Social / Cultural / Religious / Language
  ['Social Media and Influencer Marketing', 'بازاریابی رسانه اجتماعی و اینفلوئنسر'],
  ['Social Media Management', 'مدیریت رسانه اجتماعی'],
  ['Social Media', 'رسانه اجتماعی'],
  ['Social and Cultural Studies', 'مطالعات اجتماعی و فرهنگی'],
  ['Media and Cultural Studies', 'مطالعات رسانه و فرهنگ'],
  ['Cultural Heritage Conservation & Management', 'حفاظت و مدیریت میراث فرهنگی'],
  ['Cultural Heritage Conservation', 'حفاظت از میراث فرهنگی'],
  ['Cultural Studies', 'مطالعات فرهنگی'],
  ['Social Safety', 'ایمنی اجتماعی'],
  ['Theology & Religious Studies', 'الهیات و مطالعات دینی'],
  ['Philosophy and Religious Sciences', 'فلسفه و علوم دینی'],
  ['Islamic Civilization, Thought, History and Literature', 'تمدن، اندیشه، تاریخ و ادبیات اسلامی'],
  ['Tasawwuf (Sufi) Culture and Literature', 'فرهنگ و ادبیات تصوف (صوفی)'],
  ['Communication and Communication in Religious Services', 'ارتباطات در خدمات دینی'],
  ['History and Civilization Researches', 'پژوهش‌های تاریخ و تمدن'],
  ['CIVILIZATION STUDIES', 'مطالعات تمدن'],
  ['History of Islam', 'تاریخ اسلام'],
  ['History of Science in Islam', 'تاریخ علوم در اسلام'],
  ['RELIGIOUS STUDIES', 'مطالعات دینی'],
  ['Basic Islamic Sciences', 'علوم اسلامی پایه'],
  ['Arabic Language and Rhetoric', 'زبان عربی و بلاغت'],
  ['Arabic Language and Literature', 'زبان و ادبیات عربی'],
  ['Arabic Language & Teaching', 'زبان و آموزش عربی'],
  ['Russian Language and Literature', 'زبان و ادبیات روسی'],
  ['Russian Translation and Interpretation', 'ترجمه و مترجمی شفاهی روسی'],
  ['Chinese Language and Literature', 'زبان و ادبیات چینی'],
  ['Chinese Translation & Interpreting', 'ترجمه و مترجمی شفاهی چینی'],
  ['American Culture and Literature', 'فرهنگ و ادبیات آمریکایی'],
  ['Anglo American Literature and Creative Writing', 'ادبیات آنگلو-آمریکایی و نویسندگی خلاق'],
  ['Modern Turkish Literature', 'ادبیات مدرن ترکی'],
  ['Traditional Turkish Arts', 'هنرهای سنتی ترکی'],
  ['Turkish Classical Music', 'موسیقی کلاسیک ترکی'],
  ['Applied Russian-Turkish Translation', 'ترجمه کاربردی روسی-ترکی'],
  ['Applied Spanish-Turkish Translation', 'ترجمه کاربردی اسپانیایی-ترکی'],
  ['English Translation & Interpreting', 'ترجمه و مترجمی شفاهی انگلیسی'],
  ['English Translation and Interpreting', 'ترجمه و مترجمی شفاهی انگلیسی'],
  ['Interpretation & Translation', 'ترجمه شفاهی و کتبی'],
  ['Interpretation and Translation', 'ترجمه شفاهی و کتبی'],
  ['Comparative Literature', 'ادبیات تطبیقی'],
  ['Comparitive Literature', 'ادبیات تطبیقی'],
  ['Comparative Studies in History and Society', 'مطالعات تطبیقی در تاریخ و جامعه'],
  ['MIDDLE EAST STUDIES', 'مطالعات خاورمیانه'],
  ['Ottoman Paleography and Archiving', 'نوشته‌شناسی و بایگانی عثمانی'],
  // ── Arts / Architecture / Design
  ['Architectural Conservation and Restoration', 'حفاظت و مرمت معماری'],
  ['Architectural Restoration', 'مرمت معماری'],
  ['Architectural Engineering', 'مهندسی معماری'],
  ['Architectural Design', 'طراحی معماری'],
  ['Architectural Studies', 'مطالعات معماری'],
  ['Interior Space Design', 'طراحی فضای داخلی'],
  ['Interior Architecture and Enviromental Design', 'معماری داخلی و طراحی محیطی'],
  ['Technology and Restoration of Painting', 'فناوری و مرمت نقاشی'],
  ['History of Architecture and Restoration', 'تاریخ معماری و مرمت'],
  ['City and Architecture', 'شهر و معماری'],
  ['City and Regional Planning', 'برنامه‌ریزی شهری و منطقه‌ای'],
  ['MArch/ Net Zero Design', 'طراحی معماری خالص صفر'],
  ['M.Arch', 'کارشناسی ارشد معماری'],
  ['MArch', 'کارشناسی ارشد معماری'],
  ['Museum Studies', 'موزه‌شناسی'],
  ['Plastic Arts and Painting', 'هنرهای پلاستیک و نقاشی'],
  ['Plastic Arts', 'هنرهای پلاستیک'],
  ['Bow Instruments', 'سازهای زهی'],
  ['Musical Theatre', 'تئاتر موزیکال'],
  ['Theatre Directing', 'کارگردانی تئاتر'],
  ['Theatre', 'تئاتر'],
  ['Opera And Concert Singing', 'اپرا و آواز کنسرت'],
  ['Cartoons And Animation', 'کارتون و انیمیشن'],
  ['Interaction Design', 'طراحی تعامل'],
  ['Multidimensional Modeling and Animation', 'مدلسازی چندبعدی و انیمیشن'],
  ['Sound Technology', 'فناوری صدا'],
  ['Music Technology', 'فناوری موسیقی'],
  ['Television News and Programming', 'اخبار و برنامه‌سازی تلویزیون'],
  ['Television Reporting and Programming', 'گزارش و برنامه‌سازی تلویزیون'],
  ['Radio and Television Programming', 'برنامه‌سازی رادیو و تلویزیون'],
  ['Radio, Television and Cinema', 'رادیو، تلویزیون و سینما'],
  ['Communication Design and Semiotics', 'طراحی ارتباطات و نشانه‌شناسی'],
  ['Advertisement Design And Communication', 'طراحی تبلیغات و ارتباطات'],
  ['Advertising and Strategic Brand Communication', 'تبلیغات و ارتباطات استراتژیک برند'],
  ['Advertising and Brand Communications Management', 'مدیریت تبلیغات و ارتباطات برند'],
  ['Strategic Marketing and Brand Management', 'مدیریت بازاریابی استراتژیک و برند'],
  ['Global Marketing and Brand Management', 'مدیریت بازاریابی جهانی و برند'],
  ['Marketing and Branding Management', 'مدیریت بازاریابی و برندسازی'],
  ['Social Media and Influencer Marketing', 'بازاریابی رسانه اجتماعی و اینفلوئنسر'],
  ['Corporate Communication', 'ارتباطات سازمانی'],
  ['Neuromarketing', 'نورومارکتینگ'],
  ['Jewelry and Jewelry Design', 'جواهرات و طراحی جواهر'],
  ['Jewelry Technology And Design', 'فناوری و طراحی جواهر'],
  ['Photography And Camera Operation', 'عکاسی و عملیات دوربین'],
  ['Photography and Cameramanship', 'عکاسی و فیلمبرداری'],
  ['Shoe Design and Production', 'طراحی و تولید کفش'],
  // ── Management / Organization / Administration
  ['Human Resource and Organisational Change', 'منابع انسانی و تغییر سازمانی'],
  ['Management and Organisation', 'مدیریت و سازمان'],
  ['Management and Organization', 'مدیریت و سازمان'],
  ['Work and Organizational Psychology', 'روان‌شناسی کار و سازمان'],
  ['Organizational Behavior', 'رفتار سازمانی'],
  ['Organizational Psychology', 'روان‌شناسی سازمانی'],
  ['Industrial and Organizational Psychology', 'روان‌شناسی صنعتی و سازمانی'],
  ['Entrepreneurship and Innovation Management', 'مدیریت کارآفرینی و نوآوری'],
  ['Innovation and Knowledge Management', 'مدیریت نوآوری و دانش'],
  ['Knowledge Management', 'مدیریت دانش'],
  ['Technology and Innovation Management', 'مدیریت فناوری و نوآوری'],
  ['Industrial Policies and Technology Management', 'سیاست‌های صنعتی و مدیریت فناوری'],
  ['Industrial Policy and Technolog Management', 'سیاست صنعتی و مدیریت فناوری'],
  ['Quality and Production Management', 'مدیریت کیفیت و تولید'],
  ['Quality Management and Quality Accurance Systems', 'مدیریت کیفیت و سیستم‌های تضمین کیفیت'],
  ['Monetary and Capital Markets', 'بازارهای پولی و سرمایه'],
  ['Engineering Management', 'مدیریت مهندسی'],
  ['Project Management', 'مدیریت پروژه'],
  ['Disaster Management', 'مدیریت بلایا'],
  ['Disaster and Emergency Management', 'مدیریت بلایا و اورژانس'],
  ['Emergency and Disaster Management', 'مدیریت اورژانس و بلایا'],
  ['Earthquake and Structural engineering', 'مهندسی زلزله و سازه'],
  ['Earthquake Risky Structures and Urban Trans', 'سازه‌های خطرناک زلزله و بازآفرینی شهری'],
  ['Risk Engineering and Management', 'مهندسی و مدیریت ریسک'],
  ['Local Governments and Decentralization', 'دولت‌های محلی و تمرکززدایی'],
  ['LOCAL GOVERMENTS AND DECENTRALIZATION', 'دولت‌های محلی و تمرکززدایی'],
  ['Local Adminstration and Decentralization', 'مدیریت محلی و تمرکززدایی'],
  ['Local Adminstration', 'مدیریت محلی'],
  ['Local Administrations', 'مدیریت‌های محلی'],
  ['Local Authorities and Governance', 'مقامات و حاکمیت محلی'],
  ['Local Governments', 'دولت‌های محلی'],
  ['Customs Management', 'مدیریت گمرک'],
  ['Logistic Management', 'مدیریت لجستیک'],
  ['AI Driven Business Innovation', 'نوآوری کسب‌وکار مبتنی بر هوش مصنوعی'],
  ['Digital Transformation Leadership', 'رهبری تحول دیجیتال'],
  // ── Science / Research / Other Academic
  ['Applied Space Weather Research', 'پژوهش کاربردی آب‌وهوای فضایی'],
  ['Earth Science and Sustainable Management Of Environmental Resources', 'علوم زمین و مدیریت پایدار منابع محیطی'],
  ['Integrated Social and Cognitive psychology', 'روان‌شناسی اجتماعی و شناختی یکپارچه'],
  ['Mathematics, Modeling and Data Analytics', 'ریاضیات، مدل‌سازی و تجزیه داده'],
  ['Biochemistry and Cell Biology', 'بیوشیمی و زیست‌شناسی سلولی'],
  ['Biology (Cellular and Microbial Biology)', 'زیست‌شناسی (زیست‌شناسی سلولی و میکروبی)'],
  ['Medicinal Chemistry and Chemical Biology', 'شیمی دارویی و زیست‌شناسی شیمیایی'],
  ['Robotics and Intelligent systems', 'رباتیک و سیستم‌های هوشمند'],
  ['Quantitative Life Science', 'علوم کمی حیات'],
  ['Cognitive Sciences', 'علوم شناختی'],
  ['Climate Change, Energy and Health', 'تغییرات اقلیمی، انرژی و سلامت'],
  ['Built Environment and Health', 'محیط ساخته شده و سلامت'],
  ['Sustainable Built Environment', 'محیط ساخته شده پایدار'],
  ['Design and Innovation For Sustainable Food Systems', 'طراحی و نوآوری برای سیستم‌های غذایی پایدار'],
  ['Agribusiness', 'کشاورزی-تجاری'],
  ['Plant Production and Technologies', 'تولید و فناوری‌های گیاهی'],
  ['Medicinal and Aromatic Plants', 'گیاهان دارویی و معطر'],
  ['Security Studies', 'مطالعات امنیتی'],
  ['SECURITY SCIENCES AND APPLICATIONS', 'علوم و کاربردهای امنیتی'],
  ['WAR STUDIES', 'مطالعات جنگ'],
  ['ARGUMENTATION AND CONFLICT STUDIES', 'مطالعات استدلال و تعارض'],
  ['European Union', 'اتحادیه اروپا'],
  ['Psychosocial Fields of Sports', 'حوزه‌های روانی-اجتماعی ورزش'],
  ['Exercise and Sport Sciences', 'علوم ورزشی و تمرینی'],
  ['Exercise and Sport Science', 'علوم ورزش و تمرین'],
  ['MOVEMENT AND TRAINING SCIENCES', 'علوم حرکت و آموزش'],
  ['Movement And Exercise Sciences', 'علوم حرکت و ورزش'],
  ['PHYSICAL EXERCISE HEALTH AND SPORTS SCIENCE', 'علم ورزش، سلامت و تمرین جسمانی'],
  ['Sports Trainer Education', 'آموزش مربی ورزشی'],
  ['Sports Mangement', 'مدیریت ورزشی'],
  ['Exercise and Sport For Disabled', 'ورزش و تمرین برای معلولان'],
  ['Physical Education and Sport Science', 'تربیت بدنی و علوم ورزشی'],
  ['Family Counseling', 'مشاوره خانواده'],
  ['Family Counselling', 'مشاوره خانواده'],
  ['FAMILY STUDIES', 'مطالعات خانواده'],
  ['gender Studies', 'مطالعات جنسیت'],
  ['EXECUTIVE COACHING AND CONSULTING', 'مربیگری اجرایی و مشاوره'],
  ['gender', 'جنسیت'],
  // ── Common standalone words
  ['Technology', 'فناوری'],
  ['Technologies', 'فناوری‌ها'],
  ['Business', 'کسب‌وکار'],
  ['Medical', 'پزشکی'],
  ['Computer', 'کامپیوتر'],
  ['Information', 'اطلاعات'],
  ['Systems', 'سیستم‌ها'],
  ['System', 'سیستم'],
  ['Services', 'خدمات'],
  ['Service', 'خدمات'],
  ['Development', 'توسعه'],
  ['Project', 'پروژه'],
  ['Production', 'تولید'],
  ['Operations', 'عملیات'],
  ['Operation', 'عملیات'],
  ['Financial', 'مالی'],
  ['Healthcare', 'بهداشت و درمان'],
  ['Environment', 'محیط زیست'],
  ['Programming', 'برنامه‌نویسی'],
  ['Graduate', 'تحصیلات تکمیلی'],
  ['Institute', 'موسسه'],
  ['Vocational', 'حرفه‌ای'],
  ['Professional', 'حرفه‌ای'],
  ['Comparative', 'تطبیقی'],
  ['Local', 'محلی'],
  ['Regional', 'منطقه‌ای'],
  ['Traditional', 'سنتی'],
  ['Modern', 'مدرن'],
  ['Advanced', 'پیشرفته'],
  ['General', 'عمومی'],
  ['Social', 'اجتماعی'],
  ['Cultural', 'فرهنگی'],
  ['Religious', 'دینی'],
  ['Arabic', 'عربی'],
  ['Russian', 'روسی'],
  ['Chinese', 'چینی'],
  ['Spanish', 'اسپانیایی'],
  ['Political', 'سیاسی'],
  ['Politics', 'سیاست'],
  ['Policy', 'سیاست'],
  ['Global', 'جهانی'],
  ['Leadership', 'رهبری'],
  ['Strategic', 'استراتژیک'],
  ['Strategy', 'استراتژی'],
  ['Security', 'امنیت'],
  ['Biomedical', 'زیست‌پزشکی'],
  ['Mechanical', 'مکانیکی'],
  ['Civil', 'عمران'],
  ['Marine', 'دریایی'],
  ['Maritime', 'دریایی'],
  ['Transportation', 'حمل و نقل'],
  ['Disaster', 'بلایا'],
  ['Distance', 'از راه دور'],
  ['Online', 'آنلاین'],
  ['Electric', 'برقی'],
  ['Electrical', 'برق'],
  ['Electronics', 'الکترونیک'],
  ['Electronic', 'الکترونیک'],
  ['Television', 'تلویزیون'],
  ['Radio', 'رادیو'],
  ['Automotive', 'خودرو'],
  ['Aircraft', 'هواپیما'],
  ['Materials', 'مواد'],
  ['Material', 'مواد'],
  ['Botany', 'گیاه‌شناسی'],
  ['Actuarial', 'اکچوئری'],
  ['Analysis', 'تحلیل'],
  ['Analytical', 'تحلیلی'],
  ['Foreign', 'خارجی'],
  ['Trade', 'تجارت'],
  ['Economy', 'اقتصاد'],
  ['Educational', 'آموزشی'],
  ['Supervision', 'نظارت'],
  ['Instructional', 'آموزشی'],
  ['Instruction', 'تدریس'],
  ['Planning', 'برنامه‌ریزی'],
  ['Practice', 'عملی'],
  ['Practices', 'رویه‌ها'],
  ['Work', 'کار'],
  ['Safety', 'ایمنی'],
  ['Care', 'مراقبت'],
  ['Technician', 'تکنسین'],
  ['Technicians', 'تکنسین‌ها'],
  ['Technical', 'فنی'],
  ['Operator', 'اپراتور'],
  ['Operatorship', 'اپراتوری'],
  ['Maintenance', 'نگهداری'],
  ['Repair', 'تعمیر'],
  ['Building', 'ساختمان'],
  ['Infrastructure', 'زیرساخت'],
  ['Sustainable', 'پایدار'],
  ['Renewable', 'تجدیدپذیر'],
  ['Smart', 'هوشمند'],
  ['Intelligent', 'هوشمند'],
  ['Autonomous', 'خودمختار'],
  ['Vehicle', 'وسیله نقلیه'],
  ['Aerial', 'هوایی'],
  ['Unmanned', 'بدون سرنشین'],
  ['Hybrid', 'هیبریدی'],
  ['Carbon', 'کربن'],
  ['Gas', 'گاز'],
  ['Defense', 'دفاع'],
  ['Human', 'انسانی'],
  ['Rights', 'حقوق'],
  ['Community', 'جامعه'],
  ['Society', 'جامعه'],
  ['Change', 'تغییر'],
  ['Knowledge', 'دانش'],
  ['Hospital', 'بیمارستان'],
  ['Facilities', 'تأسیسات'],
  ['Reporting', 'گزارش‌دهی'],
  ['Auditing', 'حسابرسی'],
  ['Tax', 'مالیات'],
  ['Taxation', 'مالیاتی'],
  ['Court', 'دادگاه'],
  ['Office', 'اداری'],
  ['Justice', 'عدالت'],
  ['Criminal', 'کیفری'],
  ['Food', 'مواد غذایی'],
  ['Dental', 'دندانی'],
  ['Drug', 'دارو'],
  ['Cosmetics', 'آرایشی'],
  ['Cosmetic', 'آرایشی'],
  ['Dietetics', 'رژیم‌شناسی'],
  ['Diseases', 'بیماری‌ها'],
  ['Disease', 'بیماری'],
  ['Techniques', 'فنون'],
  ['Technique', 'فن'],
  ['Telehealth', 'سلامت از راه دور'],
  ['Institutions', 'موسسات'],
  ['Organisation', 'سازمان'],
  ['Organization', 'سازمان'],
  ['Organisational', 'سازمانی'],
  ['Organizational', 'سازمانی'],
  ['Behavior', 'رفتار'],
  ['Behaviour', 'رفتار'],
  ['Valuation', 'ارزیابی'],
  ['Interpretation', 'ترجمه شفاهی'],
  ['Interpreting', 'ترجمه شفاهی'],
  ['Orthopedic', 'ارتوپدی'],
  ['Orthotic', 'اورتز'],
  ['Orthotics', 'اورتزی'],
  ['Prosthesis', 'پروتز'],
  ['Prosthetics', 'پروتزی'],
  ['Prosthetic', 'پروتزی'],
  ['Oral', 'دهان'],
  ['Dental', 'دندانی'],
  ['Geotechnical', 'ژئوتکنیک'],
  ['Computational', 'محاسباتی'],
  ['Cellular', 'سلولی'],
  ['Biomedical', 'زیست‌پزشکی'],
  ['Islam', 'اسلام'],
  ['Civilization', 'تمدن'],
  ['Thought', 'اندیشه'],
  ['Selective', 'انتخابی'],
  ['Research', 'پژوهش'],
  ['Researches', 'پژوهش‌ها'],
  ['Exercise', 'تمرین'],
  ['Sport', 'ورزش'],
  ['Movement', 'حرکت'],
  ['Disaster', 'بلایا'],
  ['Earthquake', 'زلزله'],
  ['Disaster', 'بلایا'],
  ['Explosion', 'انفجار'],
  ['Explosive', 'انفجاری'],
  ['Sustainable', 'پایدار'],
  ['Climate', 'اقلیم'],
  ['Petrol', 'نفت'],
  ['Mining', 'معدن'],
  ['Coastal', 'ساحلی'],
  ['Programmes', 'برنامه‌ها'],
  ['Programme', 'برنامه'],
  ['Cabin', 'کابین'],
  ['Signal', 'سیگنال'],
  ['Power', 'قدرت'],
  ['Modeling', 'مدل‌سازی'],
  ['Branding', 'برندسازی'],
  ['Brand', 'برند'],
  ['Cooperation', 'همکاری'],
  ['Cooperation', 'همکاری'],
  ['Automation', 'اتوماسیون'],
  ['Control', 'کنترل'],
  ['Regional', 'منطقه‌ای'],
  ['Astronomy', 'نجوم'],
  ['Theatre', 'تئاتر'],
  ['Product', 'محصول'],
  ['Products', 'محصولات'],
  ['Cooking', 'آشپزی'],
  ['Cookery', 'آشپزی'],
  ['Television', 'تلویزیون'],
  ['Electricity', 'برق'],
  ['Electrics', 'برق'],
  ['Machinery', 'ماشین‌آلات'],
  ['Mechanics', 'مکانیک'],
  ['Mechanical', 'مکانیکی'],
  ['Structure', 'سازه'],
  ['Geotechnics', 'ژئوتکنیک'],
  ['Directorship', 'مدیریت'],
  ['Foundation', 'پایه'],
  ['Mass', 'رسانه‌ای'],
  ['Aerial', 'هوایی'],
  ['Conservation', 'حفاظت'],
  ['Restoration', 'مرمت'],
  ['Architectural', 'معماری'],
  ['Archaeology', 'باستان‌شناسی'],
  ['Archeology', 'باستان‌شناسی'],
  // ── Missing compounds and specific patterns
  ['DISTANCE LEARNING', 'یادگیری از راه دور'],
  ['Tourist Guiding', 'راهنمایی گردشگری'],
  ['Tourist Guide', 'راهنمای گردشگری'],
  ['Tourist', 'توریستی'],
  ['Corporate Communication', 'ارتباطات سازمانی'],
  ['Corporate IT', 'فناوری اطلاعات سازمانی'],
  ['Event Management', 'مدیریت رویداد'],
  ['Show and Event Management', 'مدیریت نمایش و رویداد'],
  ['Executive MBA', 'دوره اجرایی مدیریت کسب‌وکار'],
  ['Executive Management MBA', 'دوره اجرایی مدیریت'],
  ['Global MBA', 'دوره جهانی مدیریت کسب‌وکار'],
  ['Digital Transformation Electronics', 'الکترونیک تحول دیجیتال'],
  ['BA (Hons)', 'کارشناسی (عالی)'],
  ['BSc (Hons)', 'کارشناسی علوم (عالی)'],
  ['Science in Bioveterinary Science', 'علوم دامپزشکی زیستی'],
  ['Science - Biomedical Sciences', 'علوم زیست‌پزشکی'],
  ['Applied Human Centered AI', 'هوش مصنوعی کاربردی انسان‌محور'],
  ['Operations Research & Systems Analytics', 'تحقیق در عملیات و تجزیه سیستم‌ها'],
  ['Big Data Analytic and Management', 'مدیریت و تجزیه کلان داده'],
  ['Analytics, big data and business intelligence', 'تجزیه و تحلیل، کلان داده و هوش کسب‌وکار'],
  ['Data Science for Society and Business', 'علوم داده برای جامعه و کسب‌وکار'],
  ['Science in Global Business', 'کسب‌وکار جهانی'],
  ['Science in Business Analytics', 'تجزیه کسب‌وکار'],
  ['Architecture - Integrated Path to Architecture Licensure', 'معماری - مسیر یکپارچه به مجوز معماری'],
  ['Architecture and Civil Engineering - Integ Path to Arch Lic', 'معماری و مهندسی عمران - مسیر یکپارچه'],
  ['E-Commerce and Online Business Management', 'مدیریت تجارت الکترونیک و کسب‌وکار آنلاین'],
  ['E -Trade and Marketing (Distance Education)', 'تجارت الکترونیک و بازاریابی (آموزش از راه دور)'],
  ['E -Trade and Marketing', 'تجارت الکترونیک و بازاریابی'],
  ['E - BUSINESS MANAGEMENT (DL)', 'مدیریت کسب‌وکار الکترونیک'],
  ['E - BUSINESS MANAGEMENT (DL )', 'مدیریت کسب‌وکار الکترونیک'],
  ['E-commerce and Online Business Management', 'مدیریت تجارت الکترونیک و کسب‌وکار آنلاین'],
  ['E-MBA', 'دوره اجرایی مدیریت کسب‌وکار'],
  ['Filmmaking', 'فیلم‌سازی'],
  ['Film-Making and Broadcasting', 'فیلم‌سازی و پخش'],
  ['Master of Business Administration', 'دوره کارشناسی ارشد مدیریت کسب‌وکار'],
  ['Master of Legal Studies', 'دوره کارشناسی ارشد مطالعات حقوقی'],
  ['Master of Applied Economics', 'دوره کارشناسی ارشد اقتصاد کاربردی'],
  ['Master of Arts in Innovation and Entrepreneurship', 'دوره کارشناسی ارشد هنر در نوآوری و کارآفرینی'],
  ['Master in Fashion and Luxury Brand Management', 'کارشناسی ارشد مدیریت مد و برند لاکچری'],
  ['MA in Fashion and Luxury Brand Management', 'کارشناسی ارشد مدیریت مد و برند لاکچری'],
  ['Master in Tourism, Hospitality and Event Management', 'کارشناسی ارشد مدیریت گردشگری، مهمان‌نوازی و رویداد'],
  ['MA Tourism Hospitality and Event Management', 'کارشناسی ارشد مدیریت گردشگری، مهمان‌نوازی و رویداد'],
  ['MSc Real Estate and Asset Management', 'کارشناسی ارشد مدیریت املاک و دارایی'],
  ['MSc Global Logistics and Supply Chain Management', 'کارشناسی ارشد مدیریت لجستیک و زنجیره تأمین جهانی'],
  ['MSc Global Human Resources Management', 'کارشناسی ارشد مدیریت منابع انسانی جهانی'],
  ['MSc Finance & Investment', 'کارشناسی ارشد امور مالی و سرمایه‌گذاری'],
  ['Master in Finance & Investment', 'کارشناسی ارشد امور مالی و سرمایه‌گذاری'],
  ['Master in Global MBA', 'دوره کارشناسی ارشد مدیریت کسب‌وکار جهانی'],
  ['MBA Maritime and Shipping Management', 'دوره مدیریت کسب‌وکار دریایی و حمل کالا'],
  ['MBA in Maritime and Shipping Management', 'دوره مدیریت کسب‌وکار دریایی و حمل کالا'],
  ['MBA 24 Months', 'دوره مدیریت کسب‌وکار ۲۴ ماهه'],
  ['MBA (Strategic Healthcare Management)', 'دوره مدیریت کسب‌وکار (مدیریت استراتژیک بهداشت)'],
  ['MBA (Certificate in Strategic Management)', 'دوره مدیریت کسب‌وکار (گواهینامه مدیریت استراتژیک)'],
  ['MBA (Certificate in Data Analytics)', 'دوره مدیریت کسب‌وکار (گواهینامه تجزیه داده)'],
  ['MBA (Certificate in Church Administration)', 'دوره مدیریت کسب‌وکار (گواهینامه مدیریت)'],
  ['MBA (Leadership)', 'دوره مدیریت کسب‌وکار (رهبری)'],
  ['MBA (General)', 'دوره مدیریت کسب‌وکار (عمومی)'],
  ['MBA (Law & Taxation)', 'دوره مدیریت کسب‌وکار (حقوق و مالیات)'],
  ['MBA - Supply Chain', 'دوره مدیریت کسب‌وکار - زنجیره تأمین'],
  ['MBA - Business Analytics', 'دوره مدیریت کسب‌وکار - تجزیه کسب‌وکار'],
  ['MBA - Artificial Intelligence and Machine Learning Leadership', 'دوره مدیریت کسب‌وکار - رهبری هوش مصنوعی و یادگیری ماشین'],
  ['MBA for Business', 'دوره مدیریت کسب‌وکار'],
  ['Online MBA', 'دوره آنلاین مدیریت کسب‌وکار'],
  ['Online E-MBA', 'دوره آنلاین اجرایی مدیریت کسب‌وکار'],
  ['STEM MBA', 'دوره مدیریت کسب‌وکار علوم فناوری'],
  ['DBA Doctorate in Business Administration', 'دکترای مدیریت کسب‌وکار'],
  ['PhD in sport, business, psychology and social policy', 'دکترا در ورزش، کسب‌وکار، روان‌شناسی و سیاست اجتماعی'],
  ['LLM with a concentration in Negotiation & Dispute Resolution', 'دوره ارشد حقوق با تمرکز در مذاکره و حل اختلاف'],
  ['LLM in Intellectual Property & Technology Law', 'دوره ارشد حقوق مالکیت فکری و فناوری'],
  ['LLM for International Lawyers', 'دوره ارشد حقوق بین‌الملل'],
  ['LLM in U.S. Law', 'دوره ارشد حقوق آمریکا'],
  ['LLM in Taxation', 'دوره ارشد حقوق مالیات'],
  ['Master of Legal Studies (MLS)', 'دوره کارشناسی ارشد مطالعات حقوقی'],
  ['International and Comparative Law', 'حقوق بین‌الملل و تطبیقی'],
  ['INTERNATIONAL AND COMPARATIVE LAW', 'حقوق بین‌الملل و تطبیقی'],
  ['Comparative Studies', 'مطالعات تطبیقی'],
  ['Science in Real Estate', 'علوم مرتبط با املاک'],
  ['RNCP Titre L', 'مدرک RNCP'],
  ['Human Resource and Organisational Change (UE)', 'منابع انسانی و تغییر سازمانی'],
  ['Finance (Financial Planning and Wealth Man.)', 'امور مالی (برنامه‌ریزی مالی و مدیریت ثروت)'],
  ['Finance (Financial Analytics)', 'امور مالی (تجزیه مالی)'],
  ['Finance (Finance and Technology)', 'امور مالی (امور مالی و فناوری)'],
  ['Accounting (Taxation)', 'حسابداری (مالیات)'],
  ['Accounting (Advisory)', 'حسابداری (مشاوره)'],
  ['Accounting (Analytics)', 'حسابداری (تجزیه)'],
  ['Accounting (Assurance)', 'حسابداری (تضمین)'],
  ['Accounting (Corporate Financial Reporting)', 'حسابداری (گزارش مالی سازمانی)'],
  ['Social Work (Community)', 'مددکاری اجتماعی (جامعه)'],
  ['Social Work (Clinical Social Work Practice)', 'مددکاری اجتماعی (عملکرد بالینی)'],
  ['Social Work (Advanced Standing)', 'مددکاری اجتماعی (سطح پیشرفته)'],
  ['Social Work (Administration and Policy Practice)', 'مددکاری اجتماعی (مدیریت و سیاست عملی)'],
  ['Public Policy (Advanced Policy Analysis Track)', 'سیاست عمومی (تحلیل پیشرفته سیاست)'],
  ['Exploratory - Business', 'اکتشافی - کسب‌وکار'],
  ['Exploratory - Libral Arts and Sciences', 'اکتشافی - هنر و علوم'],
  ['Business Administration - Data Analytics for Business', 'مدیریت کسب‌وکار - تجزیه داده'],
  ['Business Administration - Technology and Operations Management', 'مدیریت کسب‌وکار - مدیریت فناوری و عملیات'],
  ['Business Administration - People and Organizations', 'مدیریت کسب‌وکار - مردم و سازمان‌ها'],
  ['Business Administration - Markets & Political Economy', 'مدیریت کسب‌وکار - بازارها و اقتصاد سیاسی'],
  ['Business Administration - International Business', 'مدیریت کسب‌وکار - کسب‌وکار بین‌الملل'],
  ['Business Administration - Exploratory', 'مدیریت کسب‌وکار - اکتشافی'],
  ['Business Administration (Certificate in Strategic Management)', 'مدیریت کسب‌وکار (گواهینامه مدیریت استراتژیک)'],
  ['Business Administration (Certificate in Data Analytics)', 'مدیریت کسب‌وکار (گواهینامه تجزیه داده)'],
  ['Business Administration (Certificate in Church Administration)', 'مدیریت کسب‌وکار (گواهینامه مدیریت)'],
  ['Business Admin and Applied Economics (Certificate in Data Analytics)', 'مدیریت و اقتصاد کاربردی (گواهینامه تجزیه داده)'],
  ['Business Admin and Applied Economics (Certificate in Church Admin)', 'مدیریت و اقتصاد کاربردی (گواهینامه مدیریت)'],
  ['Business Admin and Applied Economics (Certificate in Strategic Management)', 'مدیریت و اقتصاد کاربردی (گواهینامه مدیریت استراتژیک)'],
  ['Primary Education (BS)', 'آموزش ابتدایی (کارشناسی)'],
  ['Elementary Education', 'آموزش ابتدایی'],
  ['Mathematics Teaching for Elementary Schools', 'آموزش ریاضیات برای مدارس ابتدایی'],
  ['Information Systems for Executives', 'سیستم‌های اطلاعات برای مدیران ارشد'],
  ['Management Information System', 'سیستم اطلاعات مدیریت'],
  ['Computer security analyst', 'تحلیل‌گر امنیت کامپیوتر'],
  ['Front - End Software Development', 'توسعه نرم‌افزار سمت کاربر'],
  ['Front-End Software Development', 'توسعه نرم‌افزار سمت کاربر'],
  ['Back-End Software Development', 'توسعه نرم‌افزار سمت سرور'],
  ['Back-End Sofware Developmet', 'توسعه نرم‌افزار سمت سرور'],
  ['Classical Studies - Latin Certificate', 'مطالعات کلاسیک - گواهینامه لاتین'],
  ['Classical Studies - Greek Certificate', 'مطالعات کلاسیک - گواهینامه یونانی'],
  ['Classical Studies', 'مطالعات کلاسیک'],
  ['Ecology - Environmental Sciences', 'بوم‌شناسی - علوم محیطی'],
  ['History and Theory in Architecture', 'تاریخ و نظریه در معماری'],
  ['Political Science and International Relation(DL)', 'علوم سیاسی و روابط بین‌الملل'],
  ['International Relations and Terrorism Researches', 'روابط بین‌الملل و پژوهش تروریسم'],
  ['International Relations and Intelligence Studies', 'روابط بین‌الملل و مطالعات اطلاعاتی'],
  ['Addictionology', 'مطالعات اعتیاد'],
  ['ADDICTIONOLOGY', 'مطالعات اعتیاد'],
  ['Science in Applied Finance', 'امور مالی کاربردی'],
  ['Cloud Computing Operation', 'عملیات رایانش ابری'],
  ['Logistic', 'لجستیک'],
  ['COUNCELING PSYCHOLOG', 'مشاوره روان‌شناختی'],
  ['Cyper Security', 'امنیت سایبری'],
  ['Aestetic Restorative', 'دندانپزشکی زیبایی و ترمیمی'],
  ['Avioincs', 'آویونیک'],
  ['Work Health and Safety', 'بهداشت و ایمنی کار'],
  ['Fundamental', 'پایه'],
  ['Fundamentals of Nursing and Nursing Administration', 'مبانی پرستاری و مدیریت پرستاری'],
  ['Tele-Health Technology', 'فناوری سلامت از راه دور'],
  ['Infectious Disease', 'بیماری عفونی'],
  ['IMMUNOLOGY ALLERGY', 'ایمونولوژی آلرژی'],
  ['Industry 4.0', 'صنعت ۴.۰'],
  ['MOVEMENT AND TRAINING SCIENCES', 'علوم حرکت و آموزش'],
  ['SPORT SCIENCES', 'علوم ورزشی'],
  ['BODY CARE AND BEAUTY SERVICES', 'خدمات مراقبت بدن و زیبایی'],
  ['PASTRY AND BAKERY', 'شیرینی‌پزی و نانوایی'],
  ['FOOD QUALITY CONTROL AND ANALYSIS', 'کنترل کیفیت و تجزیه مواد غذایی'],
  ['GAME DEVELOPMENT TECHNOLOGIES', 'فناوری‌های توسعه بازی'],
  ['FINANCIAL TECHNOLOGIES', 'فناوری‌های مالی'],
  ['WEB DESIGN AND CODING', 'طراحی وب و کدنویسی'],
  ['Computing', 'محاسبات'],
  ['Humanities', 'علوم انسانی'],
  ['Hons', 'عالی'],
  ['Certificate', 'گواهینامه'],
  ['Year', 'سال'],
  ['Learning', 'یادگیری'],
  ['Analytics', 'تجزیه و تحلیل'],
  ['Classical', 'کلاسیک'],
  ['Pre', 'پیش'],
  ['Residency', 'اقامت'],
  ['Undecided', 'نامشخص'],
  ['Space', 'فضا'],
  ['Sacred', 'مقدس'],
  ['Interiors', 'فضاهای داخلی'],
  ['Interior', 'داخلی'],
  ['Concentration', 'گرایش'],
  ['Event', 'رویداد'],
  ['Executive', 'اجرایی'],
  ['Digitisation', 'دیجیتال‌سازی'],
  ['Digitization', 'دیجیتال‌سازی'],
  ['Route', 'مسیر'],
  ['Integrated', 'یکپارچه'],
  ['Biomaterials', 'بیومواد'],
  ['Theory', 'نظریه'],
  ['Exploratory', 'اکتشافی'],
  ['Sustainability', 'پایداری'],
  ['Communications', 'ارتباطات'],
  ['Allied', 'وابسته'],
  ['Investment', 'سرمایه‌گذاری'],
  ['Asset', 'دارایی'],
  ['Shipping', 'حمل کالا'],
  ['Luxury', 'لاکچری'],
  ['Machine Learning', 'یادگیری ماشین'],
  ['Machine', 'ماشین'],
  ['Intelligence', 'اطلاعاتی'],
  ['Direct', 'مستقیم'],
  ['Entry', 'ورودی'],
  ['Low', 'کم'],
  ['Res', 'کوتاه‌مدت'],
  ['Cloud', 'ابری'],
  ['Private', 'خصوصی'],
  ['Common', 'عمومی'],
  ['Corporate', 'سازمانی'],
  ['Specialist', 'متخصص'],
  ['Expertise', 'تخصص'],
  ['Academy', 'آکادمی'],
  ['Economic', 'اقتصادی'],
  ['Addiction', 'اعتیاد'],
  ['ADDICTION', 'اعتیاد'],
  ['Total', 'کل'],
  ['Libral', 'آزاد'],
  ['Liberal', 'آزاد'],
  ['Languages', 'زبان‌ها'],
  ['Aviation', 'هوانوردی'],
  ['Avionics', 'آویونیک'],
  ['Aviations', 'هوانوردی'],
  ['Air', 'هوایی'],
  ['Cook', 'آشپز'],
  ['BIG', 'کلان'],
  ['Human Resource and Organisational Change (DL)', 'منابع انسانی و تغییر سازمانی (از راه دور)'],
  ['Human Resource and Organisational Change', 'منابع انسانی و تغییر سازمانی'],
  // ── Final standalone word sweep
  ['in', 'در'],
  ['for', 'برای'],
  ['to', 'به'],
  ['with', 'با'],
  ['the', ''],

  // ── E-prefix programs
  ['E-Commerce and Marketing', 'تجارت الکترونیک و بازاریابی'],
  ['E - BUSINESS MANAGEMENT', 'مدیریت کسب‌وکار الکترونیک'],
  ['E-Commerce', 'تجارت الکترونیک'],
  ['Finance & FinTech', 'امور مالی و فین‌تک'],
  ['FinTech', 'فین‌تک'],
  ['Fintech', 'فین‌تک'],

  // ── Mechanical Engineering specializations
  ['Vibration of Mechanical Systems', 'ارتعاش سیستم‌های مکانیکی'],
  ['Optical Measurements', 'اندازه‌گیری اپتیکی'],
  ['Multiphase Flow and Heat Transfer', 'جریان چندفازی و انتقال حرارت'],
  ['Microfluids and Biofabrication', 'میکروسیالات و زیست‌ساخت'],
  ['Computational Methods', 'روش‌های محاسباتی'],
  ['Clean Energy Production and Use', 'تولید و بهره‌گیری از انرژی پاک'],
  ['Non-Linear Dynamics', 'دینامیک غیرخطی'],
  ['Acoustics and Wave Propagation', 'صوت‌شناسی و انتشار موج'],
  ['HVAC & Refrigeration', 'تهویه مطبوع و تبرید'],
  ['Signal Processing', 'پردازش سیگنال'],
  ['Electromagnetics and Optics', 'الکترومغناطیس و اپتیک'],
  ['Communication Systems & Networking', 'سیستم‌های ارتباطی و شبکه‌سازی'],

  // ── Materials Science specializations
  ['Glass, Ceramics, and Metallurgy', 'شیشه، سرامیک و متالورژی'],
  ['Processing and Instrumentation', 'پردازش و ابزاردقیق'],
  ['Magnetic and Optic Materials', 'مواد مغناطیسی و اپتیکی'],

  // ── Management specializations
  ['Federal Acquisition and Contract Management', 'مدیریت فراخوان فدرال و قرارداد'],
  ['Advanced Policy Analysis Track', 'گرایش تحلیل پیشرفته سیاست'],

  // ── Library Science
  ['Cultural Heritage InformationManagent', 'مدیریت اطلاعات میراث فرهنگی'],
  ['Law Librarianship', 'کتابداری حقوق'],
  ['Community Services Librarianship', 'کتابداری خدمات اجتماعی'],
  ['Digital Libraries', 'کتابخانه‌های دیجیتال'],
  ['Generalist', 'عمومی'],
  ['Librarianship', 'کتابداری'],
  ['Libraries', 'کتابخانه‌ها'],

  // ── Computer Science specializations
  ['Theory of Computation', 'نظریه محاسبات'],
  ['Medical Informatics and Instrumentation', 'انفورماتیک پزشکی و ابزاردقیق'],
  ['Computer Graphics and Visualization', 'گرافیک کامپیوتری و تجسم‌سازی'],
  ['Computer Architecture and Parallel Systems', 'معماری کامپیوتر و سیستم‌های موازی'],
  ['Computer Architecture & Parallel Systems', 'معماری کامپیوتر و سیستم‌های موازی'],

  // ── Church-related
  ['Certificate in Church Administration', 'گواهینامه مدیریت کلیسا'],
  ['Church Administration', 'مدیریت کلیسا'],
  ['Church', 'کلیسا'],

  // ── Social Work
  ['Advanced Standing', 'ورودی پیشرفته'],

  // ── Biomedical Engineering specializations
  ['Neuromotor Control', 'کنترل عصبی-حرکتی'],
  ['Biomedical Optics', 'اپتیک زیست‌پزشکی'],
  ['Biomechanics', 'بیومکانیک'],
  ['Bioinstrumentation and Medical Imaging', 'بیوابزاردقیق و تصویربرداری پزشکی'],
  ['Cellular and Microbial Biology', 'زیست‌شناسی سلولی و میکروبی'],

  // ── Sacred / Cultural Studies (MArch)
  ['Sacred Space', 'فضای مقدس'],
  ['Cultural Study', 'مطالعات فرهنگی'],
  ['Cultural Studies', 'مطالعات فرهنگی'],

  // ── M.Arch (cleaned: "M Arch")
  ['M Arch', 'کارشناسی ارشد معماری'],

  // ── Politics
  ['World Politics Concentration', 'گرایش سیاست جهانی'],
  ['American Politics Concentration', 'گرایش سیاست آمریکایی'],
  ['Pre-Law Track', 'گرایش پیش‌حقوق'],
  ['World Politics', 'سیاست جهانی'],
  ['American Politics', 'سیاست آمریکایی'],

  // ── Philosophy
  ["Philosophy, Scholar's Program - Math & Science", 'برنامه پژوهشگر فلسفه - ریاضی و علوم'],
  ["Philosophy, Scholar's Program - Language", 'برنامه پژوهشگر فلسفه - زبان'],
  ['Philosophy Pre-Law Scholars Program - Math & Science', 'برنامه محققان پیش‌حقوق فلسفه - ریاضی و علوم'],
  ['Philosophy Pre-Law Scholars Program - Language', 'برنامه محققان پیش‌حقوق فلسفه - زبان'],
  ['Philosophy - Ph.B./Ph.L.', 'فلسفه - لیسانس فلسفه'],
  ['Philosophy - Ph.B./ S.T.B.', 'فلسفه - لیسانس فلسفه / لیسانس الهیات'],

  // ── Music / Drama
  ['Music - Music Performance Certificate', 'موسیقی - گواهینامه اجرای موسیقی'],
  ['Music Performance Certificate', 'گواهینامه اجرای موسیقی'],
  ['Music - General (no emphasis)', 'موسیقی - عمومی (بدون گرایش)'],
  ['Drama - Directing', 'درام - کارگردانی'],

  // ── Chemistry / Physics
  ['Chemical Physics', 'فیزیک شیمیایی'],

  // ── Finance / Accounting
  ['Finance (Financial Planning and Wealth Man.)', 'امور مالی (برنامه‌ریزی مالی و مدیریت ثروت)'],
  ['Financial Planning and Wealth Management', 'برنامه‌ریزی مالی و مدیریت ثروت'],
  ['Accounting (Assurance)', 'حسابداری (اطمینان)'],
  ['Accounting (Advisory)', 'حسابداری (مشاوره‌ای)'],

  // ── Aerospace / Mechanical
  ['Mechanical and Aerospace Engineering (Thermal/Fluids)', 'مهندسی مکانیک و هوافضا (حرارت/سیالات)'],
  ['Mechanical and Aerospace Engineering (Solids/Structure)', 'مهندسی مکانیک و هوافضا (جامدات/سازه)'],
  ['Thermal/Fluids', 'حرارت/سیالات'],
  ['Solids/Structure', 'جامدات/سازه'],

  // ── Environmental Engineering
  ['Hydrology and Water Management', 'مدیریت هیدرولوژی و آب'],
  ['Sustainability in Civil and Env. Eng.', 'پایداری در مهندسی عمران و محیط‌زیست'],
  ['Sustainability in Civil and Env  Eng', 'پایداری در مهندسی عمران و محیط‌زیست'],

  // ── Chemical / Biomedical Engineering specializations
  ['Synthetic Biology', 'زیست‌شناسی مصنوعی'],
  ['Stem Cells', 'سلول‌های بنیادی'],
  ['Regenerative Medicine', 'پزشکی بازسازنده'],
  ['Multiscale Simulation', 'شبیه‌سازی چندمقیاسی'],
  ['Mathematical and Numerical', 'ریاضی و عددی'],
  ['Indoor Air Quality', 'کیفیت هوای داخلی'],
  ['Complex Fluids/Soft Condensed', 'سیالات پیچیده/متراکم نرم'],
  ['Complex Fluids', 'سیالات پیچیده'],
  ['Biofuels', 'سوخت‌های زیستی'],

  // ── Specific programs (exact)
  ['Cyber secuirity', 'امنیت سایبری'],
  ['Computer-Aided Design and Animation', 'طراحی با کامپیوتر و انیمیشن'],
  ['MBA 24 Months (Modular, Tech, Health, Design)', 'MBA 24 ماهه (پیمانه‌ای، فناوری، بهداشت، طراحی)'],
  ['Process Management in Architectural Design and Implementation', 'مدیریت فرآیند در طراحی و اجرای معماری'],
  ['GRAPHIC DESIGN ART QUALIFICATION', 'صلاحیت هنر طراحی گرافیک'],
  ['Blockchain and Digital Currency', 'بلاکچین و ارز دیجیتال'],
  ['International Business Management Double Degree', 'مدیریت کسب‌وکار بین‌الملل با مدرک دوگانه'],
  ['Supply Chain Mangament', 'مدیریت زنجیره تأمین'],
  ['Robotic and Artificial intelligence', 'رباتیک و هوش مصنوعی'],
  ['Manufacturing Execution Systems operatorship', 'بهره‌برداری از سیستم‌های اجرای تولید'],
  ['BUSINESS MANAGEMENT FOR BUSINESS MANAGER', 'مدیریت کسب‌وکار برای مدیران'],
  ['Emergency Aid and Disaster', 'امداد اضطراری و بلایا'],
  ['Environmental Health and Environmental Risk Management Technician', 'کارشناس مدیریت ریسک بهداشت محیطی'],
  ['Business Administration - Enterprise', 'مدیریت کسب‌وکار - شرکتی'],
  ['AVIATION SCIENCES (AERONAUTICAL ENG)', 'علوم هوانوردی (مهندسی هوافضا)'],
  ['Environmental Protection And Control', 'حفاظت و کنترل محیط‌زیست'],
  ['Technology and Inovasion', 'فناوری و نوآوری'],
  ['Toursim and Hospitality', 'گردشگری و مهمان‌نوازی'],
  ['Marketing Dijital Media', 'بازاریابی رسانه دیجیتال'],
  ['International Business (International Business Managment)', 'کسب‌وکار بین‌الملل (مدیریت کسب‌وکار بین‌الملل)'],
  ['International Business (International Business Managment)(DL)', 'کسب‌وکار بین‌الملل (مدیریت کسب‌وکار بین‌الملل)(از راه دور)'],
  ['Occupational Health and Sefaty', 'بهداشت و ایمنی شغلی'],
  ['Laboratorian and Vet Health', 'آزمایشگاه‌گر و بهداشت دامپزشکی'],
  ['Electrical-Electronics Engineering and Cyber Systems', 'مهندسی الکتریک-الکترونیک و سیستم‌های سایبری'],
  ['Business Analytic', 'تحلیل کسب‌وکار'],
  ['Enviromental Design', 'طراحی محیطی'],
  ['Political Scineces and International Relations', 'علوم سیاسی و روابط بین‌الملل'],
  ['Contemporary Business', 'کسب‌وکار معاصر'],
  ['Contemporary Engineering', 'مهندسی معاصر'],
  ['Land-use Planning and Management', 'برنامه‌ریزی و مدیریت کاربری زمین'],
  ['Civil Avitation Cabin Services', 'خدمات کابین هوانوردی غیرنظامی'],
  ['Care and Rehablitation Of People with Disabilities', 'مراقبت و توانبخشی افراد دارای معلولیت'],
  ['English Preparatory Programme', 'برنامه آمادگی زبان انگلیسی'],
  ['Instructional Technolog(DL)', 'فناوری آموزشی (از راه دور)'],
  ['Entrepreneurship and Innovation Management(weekend)', 'مدیریت کارآفرینی و نوآوری (آخر هفته)'],
  ['Biosecurity', 'امنیت زیستی'],
  ['Industry 4.0', 'صنعت ۴.۰'],
  ['Biomedical Engineering - Pre-med', 'مهندسی زیست‌پزشکی - پیش‌پزشکی'],
  ['LLM in U.S. Law', 'دوره ارشد حقوق ایالات متحده'],
  ['Clinical Pharmacy ( Pharm.D.)', 'داروسازی بالینی (دکترای داروسازی)'],
  ['Information Technology (Beşiktaş South Campus)', 'فناوری اطلاعات (پردیس جنوب بشیکتاش)'],
  ['Artificial Engineering', 'مهندسی هوش مصنوعی'],
  ['Basic Sciences', 'علوم پایه'],
  ['Graphic', 'گرافیک'],
  ['Chemical', 'شیمیایی'],

  // ── Faculty-specific typos / proper translations
  ['School of Informative Technology', 'دانشکده فناوری اطلاعات'],
  ['Trande and Finance Institute', 'موسسه تجارت و امور مالی'],
  ['Faculty of Engineering, Science & Technolog', 'دانشکده مهندسی، علوم و فناوری'],
  ['Art, Design and Arch', 'هنر، طراحی و معماری'],

  // ── Standalone word sweep (remaining gaps)
  ['Qualification', 'صلاحیت'],
  ['Computation', 'محاسبات'],
  ['Visualization', 'تجسم‌سازی'],
  ['Parallel', 'موازی'],
  ['Neuromotor', 'عصبی-حرکتی'],
  ['Bioinstrumentation', 'بیوابزاردقیق'],
  ['Imaging', 'تصویربرداری'],
  ['Microbial', 'میکروبی'],
  ['Electromagnetics', 'الکترومغناطیس'],
  ['Networking', 'شبکه‌سازی'],
  ['Vibration', 'ارتعاش'],
  ['Optical', 'اپتیکی'],
  ['Measurements', 'اندازه‌گیری‌ها'],
  ['Measurement', 'اندازه‌گیری'],
  ['Multiphase', 'چندفازی'],
  ['Flow', 'جریان'],
  ['Heat', 'گرما'],
  ['Biofabrication', 'زیست‌ساخت'],
  ['Microfluids', 'میکروسیالات'],
  ['Refrigeration', 'تبرید'],
  ['Methods', 'روش‌ها'],
  ['Dynamics', 'دینامیک'],
  ['Acoustics', 'صوت‌شناسی'],
  ['Wave', 'موج'],
  ['Propagation', 'انتشار'],
  ['Glass', 'شیشه'],
  ['Ceramics', 'سرامیک'],
  ['Magnetic', 'مغناطیسی'],
  ['Optic', 'اپتیک'],
  ['Optics', 'اپتیک'],
  ['Processing', 'پردازش'],
  ['Instrumentation', 'ابزاردقیق'],
  ['Federal', 'فدرال'],
  ['Acquisition', 'فراخوان'],
  ['Contract', 'قرارداد'],
  ['Track', 'گرایش'],
  ['Directing', 'کارگردانی'],
  ['Performance', 'اجرا'],
  ['Assurance', 'اطمینان'],
  ['Advisory', 'مشاوره‌ای'],
  ['Hydrology', 'هیدرولوژی'],
  ['Water', 'آب'],
  ['Synthetic', 'مصنوعی'],
  ['Regenerative', 'بازسازنده'],
  ['Multiscale', 'چندمقیاسی'],
  ['Simulation', 'شبیه‌سازی'],
  ['Numerical', 'عددی'],
  ['Indoor', 'داخلی'],
  ['Complex', 'پیچیده'],
  ['Condensed', 'متراکم'],
  ['Thermal', 'حرارتی'],
  ['Fluids', 'سیالات'],
  ['Solids', 'جامدات'],
  ['Cyber', 'سایبری'],
  ['Modular', 'پیمانه‌ای'],
  ['Double', 'دوگانه'],
  ['Contemporary', 'معاصر'],
  ['National', 'ملی'],
  ['Catholic', 'کاتولیک'],
  ['Informative', 'اطلاعاتی'],
  ['World', 'جهانی'],
  ['American', 'آمریکایی'],
  ['Standing', 'ایستا'],
  ['Arch', 'معماری'],
  ['Scholar', 'محقق'],
  ['Scholars', 'محققان'],
  ['Study', 'مطالعات'],
  ['Studies', 'مطالعات'],
  ['Robotic', 'رباتیک'],
  ['Cells', 'سلول‌ها'],
  ['Cell', 'سلول'],
  ['Process', 'فرآیند'],
  ['Land', 'زمین'],
  ['Wealth', 'ثروت'],
  ['Execution', 'اجرایی'],
  ['Implementation', 'اجرا'],
  ['Currency', 'ارز'],
  ['Aid', 'امداد'],
  ['Risk', 'خطر'],
  ['Enterprise', 'شرکتی'],
  ['Aided', 'کمک‌یافته'],
  ['Occupational', 'شغلی'],
  ['Disabilities', 'معلولیت‌ها'],
  ['Preparatory', 'آمادگی'],
  ['Analytic', 'تحلیلی'],
  ['South', 'جنوب'],
  ['Industry', 'صنعت'],
  ['Eng', 'مهندسی'],
  ['ENG', 'مهندسی'],
  ['Env', 'محیط‌زیست'],
  ['Use', 'استفاده'],
  ['Vet', 'دامپزشکی'],
  ['People', 'افراد'],

  // ── Typo corrections (single words)
  ['secuirity', 'امنیت'],
  ['Managment', 'مدیریت'],
  ['Mangament', 'مدیریت'],
  ['Inovasion', 'نوآوری'],
  ['Toursim', 'گردشگری'],
  ['Dijital', 'دیجیتال'],
  ['Scoial', 'اجتماعی'],
  ['Communicatoin', 'ارتباطات'],
  ['Trande', 'تجارت'],
  ['Technolog', 'فناوری'],
  ['Enviromental', 'محیط‌زیستی'],
  ['Scineces', 'علوم'],
  ['Avitation', 'هوانوردی'],
  ['Rehablitation', 'توانبخشی'],
  ['Sefaty', 'ایمنی'],
  ['Laboratorian', 'آزمایشگاه‌گر'],
  ['Dijital', 'دیجیتال'],
  ['weekend', 'آخر هفته'],
  ['InformationManagent', 'مدیریت اطلاعات'],
  ['Bioinstrumentation', 'بیوابزاردقیق'],

  // ── Final remaining standalone words
  ['3Year', '۳ سال'],
  ['no emphasis', 'بدون گرایش'],
  ['emphasis', 'گرایش'],
  ['Tech', 'فناوری'],
  ['University', 'دانشگاه'],
].sort((a, b) => b[0].length - a[0].length);
