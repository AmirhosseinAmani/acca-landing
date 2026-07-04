import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { translateAcademicText } from '../../lib/academicTranslations';
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
const SELECTED_CHIP_PREVIEW_LIMIT = 24;

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
    apply: 'اپلای',
    universityDetails: 'اطلاعات دانشگاه',
    loadResults: '\u0646\u0645\u0627\u06cc\u0634 \u0631\u0634\u062a\u0647\u200c\u0647\u0627',
    pendingChanges: (count) => `${formatNumber(count, true)} \u0641\u06cc\u0644\u062a\u0631 \u0622\u0645\u0627\u062f\u0647 \u0627\u0639\u0645\u0627\u0644`,
    filtersSynced: '\u0641\u06cc\u0644\u062a\u0631\u0647\u0627 \u0627\u0639\u0645\u0627\u0644 \u0634\u062f\u0647\u200c\u0627\u0646\u062f',
    loadedResults: (count) => `${formatNumber(count, true)} \u0631\u0634\u062a\u0647 \u0646\u0645\u0627\u06cc\u0634 \u062f\u0627\u062f\u0647 \u0645\u06cc\u200c\u0634\u0648\u062f`,
    website: 'وب‌سایت',
    all: (label) => `همه ${label}`,
    allSelected: (label) => `\u0647\u0645\u0647 ${label} \u0627\u0646\u062a\u062e\u0627\u0628 \u0634\u062f`,
    selectAll: '\u0627\u0646\u062a\u062e\u0627\u0628 \u0647\u0645\u0647',
    clearAll: '\u067e\u0627\u06a9 \u06a9\u0631\u062f\u0646 \u0647\u0645\u0647',
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
    apply: 'Apply',
    universityDetails: 'University details',
    loadResults: 'Load programs',
    pendingChanges: (count) => `${count} filters ready to apply`,
    filtersSynced: 'Filters applied',
    loadedResults: (count) => `${count} programs shown`,
    website: 'Website',
    all: (label) => `All ${label}`,
    allSelected: (label) => `All ${label} selected`,
    selectAll: 'Select all',
    clearAll: 'Clear all',
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
  const [draftFilters, setDraftFilters] = useState(() => createInitialFiltersFromUrl());
  const [query, setQuery] = useState(() => getInitialSearchQueryFromUrl());
  const [draftQuery, setDraftQuery] = useState(() => getInitialSearchQueryFromUrl());
  const [priceRange, setPriceRange] = useState(() => createInitialPriceRangeFromUrl());
  const [draftPriceRange, setDraftPriceRange] = useState(() => createInitialPriceRangeFromUrl());
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
  const draftPriceBounds = useMemo(() => {
    const fieldFilteredRows = rows.filter((row) =>
      filterFields.every((field) => rowMatchesFilter(row, field, draftFilters[field.key]))
    );
    return getPriceBounds(fieldFilteredRows.map((row) => getProgramPriceAmount(row)));
  }, [draftFilters, rows]);
  const effectivePriceRange = useMemo(
    () => normalizePriceRange(priceRange, priceBounds),
    [priceBounds, priceRange]
  );
  const priceRangeActive = useMemo(
    () => isPriceRangeActive(priceRange, priceBounds),
    [priceBounds, priceRange]
  );
  const draftEffectivePriceRange = useMemo(
    () => normalizePriceRange(draftPriceRange, draftPriceBounds),
    [draftPriceBounds, draftPriceRange]
  );
  const draftPriceRangeActive = useMemo(
    () => isPriceRangeActive(draftPriceRange, draftPriceBounds),
    [draftPriceBounds, draftPriceRange]
  );

  const cascadedOptions = useMemo(() => {
    const nextOptions = {};

    filterFields.forEach((field) => {
      const otherFields = filterFields.filter((f) => f.key !== field.key);
      const availableRows = rows.filter((row) => {
        const matchesFilters = otherFields.every((f) =>
          rowMatchesFilter(row, f, draftFilters[f.key])
        );
        if (!matchesFilters) return false;
        if (draftPriceRangeActive) {
          const rowPrice = getProgramPriceAmount(row);
          if (
            !Number.isFinite(rowPrice) ||
            rowPrice < draftEffectivePriceRange.min ||
            rowPrice > draftEffectivePriceRange.max
          ) {
            return false;
          }
        }
        return true;
      });

      nextOptions[field.key] = getUniqueFieldValues(availableRows, field);
    });

    return nextOptions;
  }, [draftEffectivePriceRange, draftFilters, draftPriceRangeActive, rows]);

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
  const activeFilterCount = getFilterActivityCount(filters, query, priceRangeActive);
  const pendingFilterCount = getFilterActivityCount(
    draftFilters,
    draftQuery,
    draftPriceRangeActive
  );
  const hasPendingFilters = useMemo(
    () =>
      !areFilterStatesEqual(filters, draftFilters) ||
      query !== draftQuery ||
      !arePriceRangesEqual(priceRange, draftPriceRange),
    [draftFilters, draftPriceRange, draftQuery, filters, priceRange, query]
  );

  const updateFilter = (key, value) => {
    setDraftFilters((current) => ({
      ...current,
      [key]: Array.isArray(value) ? dedupeFilterValues(value) : value,
    }));
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setPriceRange(draftPriceRange);
    setQuery(draftQuery);
    setPage(1);
  };

  const resetFilters = () => {
    const nextFilters = createInitialFilters();
    const nextPriceRange = createEmptyPriceRange();
    setFilters(nextFilters);
    setDraftFilters(nextFilters);
    setPriceRange(nextPriceRange);
    setDraftPriceRange(nextPriceRange);
    setQuery('');
    setDraftQuery('');
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
                value={draftFilters[field.key]}
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
            value={draftPriceRange}
            bounds={draftPriceBounds}
            onChange={(nextRange) => {
              setDraftPriceRange(nextRange);
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
              value={draftQuery}
              onChange={(event) => {
                setDraftQuery(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  applyFilters();
                }
              }}
              placeholder={ui.searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-base font-bold outline-none placeholder:opacity-45"
            />
          </label>

          <div
            data-filter-apply-panel
            className={`${darkMode ? 'border-white/10 bg-white/[0.045]' : 'border-black/10 bg-black/[0.025]'} mt-4 flex flex-col gap-3 rounded-[20px] border px-4 py-3 sm:flex-row sm:items-center sm:justify-between`}
          >
            <div className="min-w-0">
              <p className={`${hasPendingFilters ? (darkMode ? 'text-emerald-300' : 'text-emerald-700') : darkMode ? 'text-white/52' : 'text-black/52'} text-sm font-black`}>
                {hasPendingFilters ? ui.pendingChanges(pendingFilterCount) : ui.filtersSynced}
              </p>
              <p className={`${darkMode ? 'text-white/40' : 'text-black/40'} mt-1 text-xs font-bold`}>
                {ui.loadedResults(filteredRows.length)}
              </p>
            </div>

            <button
              type="button"
              data-apply-filters-button
              onClick={applyFilters}
              disabled={!hasPendingFilters}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[16px] bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:scale-[1.02] hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100"
            >
              <Check size={16} />
              {ui.loadResults}
            </button>
          </div>
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
                className={`${darkMode ? 'bg-[#111827] text-white border-white/10' : 'bg-white text-black border-black/10'} rounded-[14px] border px-3 py-2 text-base font-black outline-none`}
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
            <a href="/programs/"
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
  const allOptionsSelected =
    options.length > 0 && options.every((option) => selectedSet.has(normalize(option)));
  const visibleSelectedValues = selectedValues.slice(0, SELECTED_CHIP_PREVIEW_LIMIT);
  const hiddenSelectedCount = Math.max(0, selectedValues.length - visibleSelectedValues.length);
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
    ? allOptionsSelected
      ? ui.allSelected(label)
      : selectedValues.length <= 2
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
            {visibleSelectedValues.map((option) => (
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
            {hiddenSelectedCount > 0 && (
              <span className={`${darkMode ? 'bg-white/8 text-white/55' : 'bg-black/5 text-black/55'} inline-flex items-center rounded-full px-3 py-1.5 text-xs font-black`}>
                +{formatNumber(hiddenSelectedCount, isFa)}
              </span>
            )}
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
                className="min-w-0 flex-1 bg-transparent text-base font-bold outline-none placeholder:opacity-45"
              />
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                data-filter-select-all={field.key}
                onClick={() => onChange(dedupeFilterValues(options))}
                disabled={!options.length || allOptionsSelected}
                className={`${darkMode ? 'bg-white/8 hover:bg-white/12' : 'bg-black/[0.04] hover:bg-black/[0.07]'} rounded-[12px] px-3 py-2 text-xs font-black transition disabled:pointer-events-none disabled:opacity-35`}
              >
                {ui.selectAll}
              </button>
              <button
                type="button"
                data-filter-clear-all={field.key}
                onClick={() => onChange([])}
                disabled={!selectedValues.length}
                className={`${darkMode ? 'bg-white/8 hover:bg-white/12' : 'bg-black/[0.04] hover:bg-black/[0.07]'} rounded-[12px] px-3 py-2 text-xs font-black transition disabled:pointer-events-none disabled:opacity-35`}
              >
                {ui.clearAll}
              </button>
            </div>
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
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onConsultationClick}
              className={`${darkMode ? 'border-white/15 text-white/75 hover:bg-white/10' : 'border-black/10 text-black/65 hover:bg-black/[0.04]'} whitespace-nowrap rounded-[12px] border px-3 py-2 text-[11px] font-black transition`}
            >
              {ui.consult}
            </button>
            <a
              href={buildSmartApplyProgramUrl(row)}
              className={`${darkMode ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white'} whitespace-nowrap rounded-[12px] px-4 py-2 text-xs font-black transition hover:scale-[1.03] hover:bg-emerald-700`}
            >
              {ui.apply}
            </a>
          </div>
          <a
            href={buildUniversityCatalogUrl(row.university)}
            className={`${darkMode ? 'text-white/60 hover:text-white' : 'text-black/55 hover:text-black'} whitespace-nowrap text-[10px] font-black underline-offset-4 hover:underline`}
          >
            {ui.universityDetails}
          </a>
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

function getSmartServicesOrigin() {
  if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return 'http://localhost:5173';
  }
  return 'https://accatransfer.com';
}

function buildSmartApplyProgramUrl(row) {
  const url = new URL('/account', getSmartServicesOrigin());
  url.searchParams.set('select', 'smart_apply');
  url.searchParams.set('programId', row.id);
  url.searchParams.set('university', row.university);
  url.searchParams.set('source', 'accaco-programs');
  return url.toString();
}

function buildUniversityCatalogUrl(universityName) {
  return `?page=universities&university=${encodeURIComponent(universityName)}`;
}

const normalizedFilterValueCache = new WeakMap();

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
    const { values, selectedSet } = getCachedNormalizedFilterValues(selectedValue);
    if (!values.length) return true;

    return getFieldValues(row, field).some((value) => selectedSet.has(normalize(value)));
  }

  if (!selectedValue) return true;
  const selected = normalize(selectedValue);

  return getFieldValues(row, field).some((value) => normalize(value) === selected);
}

function getCachedNormalizedFilterValues(selectedValue) {
  const cached = normalizedFilterValueCache.get(selectedValue);
  if (cached) return cached;

  const values = dedupeFilterValues(selectedValue);
  const normalizedValues = {
    values,
    selectedSet: new Set(values.map((value) => normalize(value))),
  };

  normalizedFilterValueCache.set(selectedValue, normalizedValues);
  return normalizedValues;
}

function getFilterActivityCount(filters, query, priceRangeActive) {
  return (
    Object.values(filters).reduce(
      (count, value) => count + (Array.isArray(value) ? dedupeFilterValues(value).length : value ? 1 : 0),
      0
    ) +
    (query ? 1 : 0) +
    (priceRangeActive ? 1 : 0)
  );
}

function areFilterStatesEqual(firstFilters, secondFilters) {
  return filterFields.every((field) =>
    areFilterValuesEqual(firstFilters?.[field.key], secondFilters?.[field.key])
  );
}

function areFilterValuesEqual(firstValue, secondValue) {
  const firstValues = normalizeFilterValuesForCompare(firstValue);
  const secondValues = normalizeFilterValuesForCompare(secondValue);

  return (
    firstValues.length === secondValues.length &&
    firstValues.every((value, index) => value === secondValues[index])
  );
}

function normalizeFilterValuesForCompare(value) {
  if (Array.isArray(value)) {
    return dedupeFilterValues(value).map((item) => normalize(item)).filter(Boolean).sort();
  }

  const normalized = normalize(value);
  return normalized ? [normalized] : [];
}

function arePriceRangesEqual(firstRange, secondRange) {
  return (
    getPriceRangeCompareValue(firstRange?.min) === getPriceRangeCompareValue(secondRange?.min) &&
    getPriceRangeCompareValue(firstRange?.max) === getPriceRangeCompareValue(secondRange?.max)
  );
}

function getPriceRangeCompareValue(value) {
  return value === null || typeof value === 'undefined' ? '' : String(value);
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
