import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Moon,
  RotateCcw,
  Search,
  Sun,
  X,
} from 'lucide-react';
import PriceRangeSlider from '../PriceRangeSlider';
import {
  formatScholarshipPrice,
  normalizeScholarshipText,
  scholarshipRows,
  scholarshipStats,
} from '../../data/scholarships';

const PAGE_SIZE = 18;

const copy = {
  fa: {
    eyebrow: 'ACCA SCHOLARSHIPS',
    title: 'لیست بورسیه‌ها',
    description: 'جستجوی سریع در لیست بورسیه‌های ACCA بر اساس دانشگاه، رشته، زبان، مدت تحصیل و قیمت.',
    back: 'بازگشت',
    search: 'جستجو در دانشگاه، رشته، قیمت...',
    university: 'دانشگاه',
    degree: 'مقطع / گروه',
    language: 'زبان',
    duration: 'مدت',
    price: 'قیمت',
    all: 'همه',
    reset: 'ریست فیلترها',
    consult: 'مشاوره',
    rows: 'بورسیه',
    universities: 'دانشگاه',
    minPrice: 'شروع قیمت',
    maxPrice: 'بیشترین قیمت',
    priceRange: '\u0645\u062d\u062f\u0648\u062f\u0647 \u0642\u06cc\u0645\u062a',
    minRange: '\u062d\u062f\u0627\u0642\u0644',
    maxRange: '\u062d\u062f\u0627\u06a9\u062b\u0631',
    clearPriceRange: '\u062d\u0630\u0641 \u0645\u062d\u062f\u0648\u062f\u0647',
    noResults: 'برای این فیلتر نتیجه‌ای پیدا نشد.',
    sort: 'مرتب‌سازی قیمت',
    asc: 'ارزان‌ترین',
    desc: 'گران‌ترین',
    summary: (from, to, total) => `نمایش ${formatNumber(from, true)} تا ${formatNumber(to, true)} از ${formatNumber(total, true)} ردیف`,
  },
  en: {
    eyebrow: 'ACCA SCHOLARSHIPS',
    title: 'Scholarship List',
    description: 'Search ACCA scholarship prices by university, program, language, duration, and price.',
    back: 'Back',
    search: 'Search university, program, price...',
    university: 'University',
    degree: 'Degree / Group',
    language: 'Language',
    duration: 'Duration',
    price: 'Price',
    all: 'All',
    reset: 'Reset Filters',
    consult: 'Consult',
    rows: 'scholarships',
    universities: 'universities',
    minPrice: 'Starting price',
    maxPrice: 'Highest price',
    priceRange: 'Price Range',
    minRange: 'Minimum',
    maxRange: 'Maximum',
    clearPriceRange: 'Clear range',
    noResults: 'No scholarships match these filters.',
    sort: 'Price sort',
    asc: 'Lowest first',
    desc: 'Highest first',
    summary: (from, to, total) => `Showing ${from} to ${to} of ${total} rows`,
  },
};

const degreeTranslations = {
  Associate: 'کاردانی',
  Bachelor: 'کارشناسی',
  Master: 'کارشناسی ارشد',
  Medicine: 'پزشکی',
  Dentistry: 'دندانپزشکی',
  Pharmacy: 'داروسازی',
};

const languageTranslations = {
  English: 'انگلیسی',
  Turkish: 'ترکی',
  'Turkish / English': 'ترکی / انگلیسی',
};

export default function ScholarshipsPage({
  darkMode,
  isFa,
  ACCA_LOGO_SRC,
  onConsultationClick,
  onToggleDarkMode,
  onToggleLanguage,
}) {
  const ui = isFa ? copy.fa : copy.en;
  const [query, setQuery] = useState('');
  const [university, setUniversity] = useState('');
  const [degree, setDegree] = useState('');
  const [language, setLanguage] = useState('');
  const [priceRange, setPriceRange] = useState(() => createInitialPriceRangeFromUrl());
  const [sortDirection, setSortDirection] = useState('asc');
  const [page, setPage] = useState(1);

  const cascadedUniversities = useMemo(
    () => uniqueSorted(
      scholarshipRows
        .filter((row) => !degree || row.degree === degree)
        .filter((row) => !language || row.language === language)
        .map((row) => row.university)
    ),
    [degree, language]
  );

  const cascadedDegrees = useMemo(
    () => uniqueSorted(
      scholarshipRows
        .filter((row) => !university || row.university === university)
        .filter((row) => !language || row.language === language)
        .map((row) => row.degree)
    ),
    [language, university]
  );

  const cascadedLanguages = useMemo(
    () => uniqueSorted(
      scholarshipRows
        .filter((row) => !university || row.university === university)
        .filter((row) => !degree || row.degree === degree)
        .map((row) => row.language)
        .filter(Boolean)
    ),
    [degree, university]
  );

  const priceBounds = useMemo(() => {
    const fieldFilteredRows = scholarshipRows
      .filter((row) => !university || row.university === university)
      .filter((row) => !degree || row.degree === degree)
      .filter((row) => !language || row.language === language);
    return getPriceBounds(fieldFilteredRows.map((row) => row.priceAmount));
  }, [degree, language, university]);
  const effectivePriceRange = useMemo(
    () => normalizePriceRange(priceRange, priceBounds),
    [priceBounds, priceRange]
  );
  const priceRangeActive = useMemo(
    () => isPriceRangeActive(priceRange, priceBounds),
    [priceBounds, priceRange]
  );

  const filteredRows = useMemo(() => {
    const searchText = normalizeScholarshipText(query);

    return scholarshipRows
      .filter((row) => !university || row.university === university)
      .filter((row) => !degree || row.degree === degree)
      .filter((row) => !language || row.language === language)
      .filter((row) =>
        !priceRangeActive ||
        (row.priceAmount >= effectivePriceRange.min && row.priceAmount <= effectivePriceRange.max)
      )
      .filter((row) => {
        if (!searchText) return true;
        return normalizeScholarshipText(
          `${row.university} ${row.program} ${row.price} ${row.studyDuration} ${row.degree} ${row.language}`
        ).includes(searchText);
      })
      .sort((a, b) =>
        sortDirection === 'asc'
          ? a.priceAmount - b.priceAmount
          : b.priceAmount - a.priceAmount
      );
  }, [degree, effectivePriceRange, language, priceRangeActive, query, sortDirection, university]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visibleRows = filteredRows.slice(start, start + PAGE_SIZE);
  const from = filteredRows.length ? start + 1 : 0;
  const to = Math.min(start + PAGE_SIZE, filteredRows.length);

  const resetFilters = () => {
    setQuery('');
    setUniversity('');
    setDegree('');
    setLanguage('');
    setPriceRange(createEmptyPriceRange());
    setSortDirection('asc');
    setPage(1);
  };

  const filterChanged = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div
      dir={isFa ? 'rtl' : 'ltr'}
      className={`${darkMode ? 'bg-[#050816] text-white' : 'bg-[#F7F1E8] text-neutral-950'} min-h-screen overflow-hidden px-4 py-6 sm:px-6 sm:py-8`}
    >
      <div className={`${darkMode ? 'darkGlass' : 'glass'} mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full px-5 py-4 sm:px-7`}>
        <a href="/" className="flex items-center gap-3">
          <img src={ACCA_LOGO_SRC} alt="ACCA EDU Logo" className="h-10 w-auto object-contain sm:h-11" />
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleLanguage}
            className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} h-11 rounded-full px-4 text-xs font-black sm:px-5 sm:text-sm`}
          >
            {isFa ? 'EN' : 'FA'}
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Light mode' : 'Dark mode'}
            className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} grid h-11 w-11 place-items-center rounded-full`}
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <a
            href="/"
            className={`${darkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-black/5 text-black hover:bg-black/10'} inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-black transition sm:px-6 sm:text-sm`}
          >
            <ArrowLeft className={isFa ? 'rotate-180' : ''} size={16} />
            {ui.back}
          </a>
        </div>
      </div>

      <main className="mx-auto max-w-7xl py-10 sm:py-14">
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <div className={`${darkMode ? 'text-white/40' : 'text-black/40'} mb-5 text-xs font-black uppercase tracking-[0.35em] sm:text-sm`}>
              {ui.eyebrow}
            </div>
            <h1 className="text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">
              {ui.title}
            </h1>
            <p className={`${darkMode ? 'text-white/60' : 'text-black/55'} mt-6 max-w-2xl text-base font-medium leading-8 sm:text-lg sm:leading-9`}>
              {ui.description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard darkMode={darkMode} label={ui.rows} value={formatNumber(scholarshipStats.totalRows, isFa)} />
            <StatCard darkMode={darkMode} label={ui.universities} value={formatNumber(scholarshipStats.totalUniversities, isFa)} />
            <StatCard darkMode={darkMode} label={ui.minPrice} value={formatCurrency(scholarshipStats.minPrice, isFa)} />
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
            minLabel={ui.minRange}
            maxLabel={ui.maxRange}
            clearLabel={ui.clearPriceRange}
            currencyLabel="USD"
          />
        </section>

        <section className={`${darkMode ? 'darkGlass' : 'glass'} mt-10 rounded-[34px] p-4 sm:p-6`}>
          <div className="grid gap-3 lg:grid-cols-[1.2fr_0.9fr_0.75fr_0.75fr_0.7fr_auto]">
            <div className={`${darkMode ? 'bg-white/5' : 'bg-white/65'} flex items-center gap-3 rounded-[24px] border border-white/10 px-4 py-3`}>
              <Search size={18} className={darkMode ? 'text-white/45' : 'text-black/40'} />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder={ui.search}
                className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-current placeholder:opacity-40"
              />
            </div>

            <FilterSelect label={ui.university} value={university} onChange={filterChanged(setUniversity)} options={cascadedUniversities} darkMode={darkMode} isFa={isFa} allLabel={ui.all} ui={ui} />
            <FilterSelect label={ui.degree} value={degree} onChange={filterChanged(setDegree)} options={cascadedDegrees} darkMode={darkMode} isFa={isFa} allLabel={ui.all} ui={ui} renderValue={(value) => displayDegree(value, isFa)} />
            <FilterSelect label={ui.language} value={language} onChange={filterChanged(setLanguage)} options={cascadedLanguages} darkMode={darkMode} isFa={isFa} allLabel={ui.all} ui={ui} renderValue={(value) => displayLanguage(value, isFa)} />
            <FilterSelect label={ui.sort} value={sortDirection} onChange={filterChanged(setSortDirection)} options={['asc', 'desc']} darkMode={darkMode} isFa={isFa} allLabel={ui.all} ui={ui} renderValue={(value) => (value === 'asc' ? ui.asc : ui.desc)} hideAll />

            <button
              type="button"
              onClick={resetFilters}
              className={`${darkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-black/5 text-black hover:bg-black/10'} inline-flex items-center justify-center gap-2 rounded-[22px] px-5 py-3 text-sm font-black transition`}
            >
              <RotateCcw size={16} />
              {ui.reset}
            </button>
          </div>
        </section>

        <section className={`${darkMode ? 'darkGlass' : 'glass'} mt-6 overflow-hidden rounded-[34px]`}>
          <div className={`${darkMode ? 'border-white/10 text-white/55' : 'border-black/5 text-black/55'} flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 text-sm font-bold sm:px-6`}>
            <span>{ui.summary(from, to, filteredRows.length)}</span>
            <span>{formatCurrency(scholarshipStats.maxPrice, isFa)} · {ui.maxPrice}</span>
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className={`${darkMode ? 'bg-white/5 text-white/55' : 'bg-white/55 text-black/55'} text-xs font-black uppercase tracking-[0.12em]`}>
                  <th className="px-5 py-4 text-start">{ui.university}</th>
                  <th className="px-5 py-4 text-start">{isFa ? 'رشته / برنامه' : 'Program / Major'}</th>
                  <th className="px-5 py-4 text-start">{ui.degree}</th>
                  <th className="px-5 py-4 text-start">{ui.language}</th>
                  <th className="px-5 py-4 text-start">{ui.duration}</th>
                  <th className="px-5 py-4 text-start">{ui.price}</th>
                  <th className="px-5 py-4 text-end">{ui.consult}</th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'divide-white/10' : 'divide-black/5'} divide-y`}>
                {visibleRows.map((row) => (
                  <ScholarshipTableRow key={row.id} row={row} darkMode={darkMode} isFa={isFa} onConsultationClick={onConsultationClick} ui={ui} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-3 lg:hidden">
            {visibleRows.map((row) => (
              <ScholarshipCard key={row.id} row={row} darkMode={darkMode} isFa={isFa} onConsultationClick={onConsultationClick} ui={ui} />
            ))}
          </div>

          {!visibleRows.length && (
            <div className="px-6 py-16 text-center text-base font-bold opacity-55">{ui.noResults}</div>
          )}

          <div className={`${darkMode ? 'border-white/10' : 'border-black/5'} flex items-center justify-between border-t px-5 py-4 sm:px-6`}>
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={safePage === 1}
              className={`${darkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'} grid h-11 w-11 place-items-center rounded-full disabled:opacity-35`}
            >
              <ChevronRight className={isFa ? '' : 'rotate-180'} size={19} />
            </button>

            <div className="text-sm font-black opacity-65">
              {formatNumber(safePage, isFa)} / {formatNumber(totalPages, isFa)}
            </div>

            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={safePage === totalPages}
              className={`${darkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'} grid h-11 w-11 place-items-center rounded-full disabled:opacity-35`}
            >
              <ChevronLeft className={isFa ? '' : 'rotate-180'} size={19} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function ScholarshipTableRow({ row, darkMode, isFa, onConsultationClick, ui }) {
  return (
    <tr className={`${darkMode ? 'hover:bg-white/[0.04]' : 'hover:bg-white/45'} transition`}>
      <td className="px-5 py-4"><UniversityName row={row} darkMode={darkMode} /></td>
      <td className="max-w-[320px] px-5 py-4 font-bold leading-6">
        <a
          href={getProgramSearchUrl(row.program)}
          className={`${darkMode ? 'text-emerald-300 hover:text-emerald-200' : 'text-emerald-700 hover:text-emerald-800'} underline-offset-4 transition hover:underline`}
        >
          {displayProgram(row.program, isFa)}
        </a>
      </td>
      <td className="px-5 py-4 font-semibold opacity-75">{displayDegree(row.degree, isFa)}</td>
      <td className="px-5 py-4 font-semibold opacity-75">{displayLanguage(row.language, isFa) || '—'}</td>
      <td className="px-5 py-4 font-black">{row.studyDuration}</td>
      <td className="px-5 py-4 text-lg font-black text-emerald-500">{formatScholarshipPrice(row, isFa ? 'fa-IR' : 'en-US')}</td>
      <td className="px-5 py-4 text-end"><ConsultButton label={ui.consult} darkMode={darkMode} onClick={onConsultationClick} /></td>
    </tr>
  );
}

function ScholarshipCard({ row, darkMode, isFa, onConsultationClick, ui }) {
  return (
    <article className={`${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-white/70 bg-white/55'} rounded-[26px] border p-4`}>
      <div className="flex items-start justify-between gap-3">
        <UniversityName row={row} darkMode={darkMode} />
        <div className="shrink-0 rounded-2xl bg-emerald-400/15 px-3 py-2 text-sm font-black text-emerald-500">
          {formatScholarshipPrice(row, isFa ? 'fa-IR' : 'en-US')}
        </div>
      </div>
      <a
        href={getProgramSearchUrl(row.program)}
        className={`${darkMode ? 'text-emerald-300 hover:text-emerald-200' : 'text-emerald-700 hover:text-emerald-800'} mt-4 block text-base font-black leading-7 underline-offset-4 transition hover:underline`}
      >
        {displayProgram(row.program, isFa)}
      </a>
      <div className={`${darkMode ? 'text-white/55' : 'text-black/55'} mt-4 grid grid-cols-3 gap-2 text-xs font-bold`}>
        <span>{displayDegree(row.degree, isFa)}</span>
        <span>{displayLanguage(row.language, isFa) || '—'}</span>
        <span>{row.studyDuration}</span>
      </div>
      <ConsultButton label={ui.consult} darkMode={darkMode} onClick={onConsultationClick} wide />
    </article>
  );
}

function UniversityName({ row, darkMode }) {
  return (
    <div className="flex min-w-[220px] items-center gap-3">
      <div className={`${darkMode ? 'bg-white/10' : 'bg-white/80'} grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/30`}>
        {row.logoUrl ? (
          <img src={row.logoUrl} alt={row.university} className="max-h-8 max-w-9 object-contain" />
        ) : (
          <Award size={20} className="text-emerald-500" />
        )}
      </div>
      <div>
        <a
          href={getUniversityProfileUrl(row.university)}
          className={`${darkMode ? 'hover:text-emerald-300' : 'hover:text-emerald-700'} block text-sm font-black leading-6 underline-offset-4 transition hover:underline`}
          dir="ltr"
        >
          {row.university}
        </a>
        <div className={`${darkMode ? 'text-white/45' : 'text-black/45'} text-xs font-bold`}>{row.city}</div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, darkMode, isFa, allLabel, renderValue, hideAll, ui }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const rootRef = useRef(null);
  const displayOption = useCallback((option) => (renderValue ? renderValue(option) : option), [renderValue]);
  const allOptionLabel = `${allLabel} ${label}`;

  const filteredOptions = useMemo(() => {
    const normalizedSearch = normalizeScholarshipText(search);
    const matched = normalizedSearch
      ? options.filter((option) =>
          normalizeScholarshipText(option).includes(normalizedSearch) ||
          normalizeScholarshipText(displayOption(option)).includes(normalizedSearch)
        )
      : options;

    return matched.slice(0, 160);
  }, [displayOption, options, search]);

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

  const chooseOption = (option) => {
    onChange(option);
    closeDropdown();
  };

  return (
    <div ref={rootRef} data-scholarship-filter={label} className="relative">
      <div className={`${darkMode ? 'text-white/45' : 'text-black/45'} mb-2 flex items-center justify-between gap-2 text-xs font-black uppercase tracking-[0.13em]`}>
        <span>{label}</span>
        <span>{formatNumber(options.length, isFa)}</span>
      </div>

      <div className={`${darkMode ? 'bg-white/8 border-white/10' : 'bg-white/85 border-black/10'} flex h-12 items-center gap-1 rounded-[18px] border px-2`}>
        <button
          type="button"
          data-scholarship-filter-trigger={label}
          onClick={toggleDropdown}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 px-2 text-start"
        >
          <span className={`${value ? 'opacity-100' : 'opacity-42'} min-w-0 truncate text-sm font-black`}>
            {value ? displayOption(value) : allOptionLabel}
          </span>
          <ChevronDown
            size={16}
            className={`${open ? 'rotate-180' : ''} shrink-0 opacity-55 transition`}
          />
        </button>

        {value && !hideAll && (
          <button
            type="button"
            onClick={() => chooseOption('')}
            aria-label={ui.clearFilter || 'Clear filter'}
            className={`${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'} flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition`}
          >
            <X size={15} />
          </button>
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
                placeholder={isFa ? '\u062c\u0633\u062a\u062c\u0648...' : 'Search...'}
                className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:opacity-45"
              />
            </label>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {!hideAll && (
              <FilterOption
                active={!value}
                darkMode={darkMode}
                label={allOptionLabel}
                optionValue=""
                onClick={() => chooseOption('')}
              />
            )}

            {filteredOptions.map((option) => (
              <FilterOption
                key={option}
                active={option === value}
                darkMode={darkMode}
                label={displayOption(option)}
                optionValue={option}
                onClick={() => chooseOption(option)}
              />
            ))}

            {options.length > filteredOptions.length && (
              <div className={`${darkMode ? 'text-white/42' : 'text-black/42'} px-3 py-2 text-xs font-bold`}>
                {ui.moreOptions || (isFa ? '\u0628\u0631\u0627\u06cc \u06af\u0632\u06cc\u0646\u0647\u200c\u0647\u0627\u06cc \u0628\u06cc\u0634\u062a\u0631 \u062c\u0633\u062a\u062c\u0648 \u06a9\u0646\u06cc\u062f.' : 'Search to reveal more options.')}
              </div>
            )}

            {!filteredOptions.length && (
              <div className={`${darkMode ? 'text-white/42' : 'text-black/42'} px-3 py-4 text-center text-xs font-bold`}>
                {ui.noOptions || (isFa ? '\u06af\u0632\u06cc\u0646\u0647\u200c\u0627\u06cc \u067e\u06cc\u062f\u0627 \u0646\u0634\u062f.' : 'No options found.')}
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
      data-scholarship-filter-option={optionValue}
      onClick={onClick}
      className={`${active ? 'bg-emerald-500 text-white' : darkMode ? 'hover:bg-white/8' : 'hover:bg-black/[0.045]'} flex w-full items-center justify-between gap-3 rounded-[14px] px-3 py-2.5 text-start text-sm font-bold transition`}
    >
      <span className="min-w-0 truncate">{label}</span>
      {active && <Check size={15} className="shrink-0" />}
    </button>
  );
}

function ConsultButton({ label, darkMode, onClick, wide }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${wide ? 'mt-5 w-full' : ''} ${darkMode ? 'bg-white text-black' : 'bg-[#111827] text-white'} inline-flex items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm font-black transition hover:scale-[1.02]`}
    >
      <MessageCircle size={16} />
      {label}
    </button>
  );
}

function StatCard({ darkMode, label, value }) {
  return (
    <div className={`${darkMode ? 'border-white/10 bg-white/5' : 'border-white/70 bg-white/55'} rounded-[26px] border p-5 backdrop-blur-2xl`}>
      <div className={`${darkMode ? 'text-white/45' : 'text-black/45'} text-xs font-black uppercase tracking-[0.2em]`}>{label}</div>
      <div className="mt-3 text-3xl font-black">{value}</div>
    </div>
  );
}

function createEmptyPriceRange() {
  return { min: '', max: '' };
}

function createInitialPriceRangeFromUrl() {
  if (typeof window === 'undefined') return createEmptyPriceRange();

  const params = new URLSearchParams(window.location.search);
  const rangeValue = params.get('priceRange') || '';
  const [rangeMin, rangeMax] = rangeValue.split(/[|,]/).map((part) => part.trim());

  return {
    min: params.get('minPrice') || rangeMin || '',
    max: params.get('maxPrice') || rangeMax || '',
  };
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
  if (!isFa) return value;
  return String(value)
    .replace(/Bachelor's Programs/g, 'برنامه‌های کارشناسی')
    .replace(/Associate Programs/g, 'برنامه‌های کاردانی')
    .replace(/Master's Programs/g, 'برنامه‌های کارشناسی ارشد')
    .replace(/Medicine/g, 'پزشکی')
    .replace(/Dentistry/g, 'دندانپزشکی')
    .replace(/Pharmacy/g, 'داروسازی')
    .replace(/Physiotherapy and Rehabilitation/g, 'فیزیوتراپی و توانبخشی')
    .replace(/Physiotherapy/g, 'فیزیوتراپی')
    .replace(/Artificial Intelligence/g, 'هوش مصنوعی')
    .replace(/Data Engineering/g, 'مهندسی داده')
    .replace(/Software, Computer & Aviation Engineering/g, 'مهندسی نرم‌افزار، کامپیوتر و هوانوردی')
    .replace(/Computer Engineering/g, 'مهندسی کامپیوتر')
    .replace(/Software Engineering/g, 'مهندسی نرم‌افزار')
    .replace(/Aviation Engineering/g, 'مهندسی هوانوردی')
    .replace(/Engineering Programs/g, 'برنامه‌های مهندسی')
    .replace(/Business Administration/g, 'مدیریت کسب‌وکار')
    .replace(/Diploma Program/g, 'برنامه دیپلم')
    .replace(/Rehabilitation/g, 'توانبخشی')
    .replace(/Aviation/g, 'هوانوردی')
    .replace(/ and /gi, ' و ')
    .replace(/English/g, 'انگلیسی')
    .replace(/Turkish/g, 'ترکی');
}

function getUniversityProfileUrl(university) {
  const params = new URLSearchParams();
  params.set('page', 'universities');
  params.set('profile', buildScholarshipUniversitySlug(university));
  return `?${params.toString()}`;
}

function buildScholarshipUniversitySlug(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function getProgramSearchUrl(program) {
  const target = getProgramSearchTarget(program);
  const params = new URLSearchParams();
  params.set('page', 'programs');
  params.set(target.key, target.value);
  return `?${params.toString()}`;
}

function getProgramSearchTarget(program) {
  const normalized = normalizeScholarshipText(program);

  if (normalized.includes('bachelor')) return { key: 'degree', value: 'Bachelor' };
  if (normalized.includes('associate')) return { key: 'degree', value: 'Associate' };
  if (normalized.includes('master')) return { key: 'degree', value: 'Master' };

  if (normalized.includes('software') && normalized.includes('computer')) {
    return { key: 'department', value: 'Software Engineering|Computer Engineering' };
  }

  const programMap = [
    ['physiotherapy and rehabilitation', 'Physiotherapy and Rehabilitation'],
    ['physiotherapy', 'Physiotherapy and Rehabilitation'],
    ['artificial intelligence', 'Artificial Intelligence'],
    ['data engineering', 'Data Engineering'],
    ['software engineering', 'Software Engineering'],
    ['computer engineering', 'Computer Engineering'],
    ['business administration', 'Business Administration'],
    ['architecture', 'Architecture'],
    ['medicine', 'Medicine'],
    ['dentistry', 'Dentistry'],
    ['pharmacy', 'Pharmacy'],
  ];

  const match = programMap.find(([keyword]) => normalized.includes(keyword));
  if (match) return { key: 'department', value: match[1] };

  const fallback = String(program || '')
    .replace(/\s*\([^)]*\)/g, '')
    .split(/[,&/]/)[0]
    .trim();

  return { key: 'department', value: fallback || String(program || '') };
}
function formatCurrency(value, isFa) {
  return `${new Intl.NumberFormat(isFa ? 'fa-IR' : 'en-US', { maximumFractionDigits: 0 }).format(value)} USD`;
}

function formatNumber(value, isFa) {
  return new Intl.NumberFormat(isFa ? 'fa-IR' : 'en-US').format(value);
}
