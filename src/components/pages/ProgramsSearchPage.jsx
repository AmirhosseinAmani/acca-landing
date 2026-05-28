import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  RotateCcw,
  Search,
} from 'lucide-react';

const filterFields = [
  { key: 'country', rowKey: 'country', labelFa: 'کشور', labelEn: 'COUNTRY' },
  { key: 'city', rowKey: 'city', labelFa: 'شهر', labelEn: 'CITY' },
  { key: 'status', rowKey: 'status', labelFa: 'وضعیت', labelEn: 'STATUS' },
  { key: 'semester', rowKey: 'semester', labelFa: 'ترم', labelEn: 'SEMESTER' },
  { key: 'university', rowKey: 'university', labelFa: 'دانشگاه', labelEn: 'UNIVERSITY' },
  { key: 'degree', rowKey: 'degree', labelFa: 'مقطع', labelEn: 'DEGREE' },
  { key: 'faculty', rowKey: 'faculty', labelFa: 'دانشکده', labelEn: 'FACULTY' },
  { key: 'language', rowKey: 'language', labelFa: 'زبان', labelEn: 'LANGUAGE' },
  { key: 'department', rowKey: 'program', labelFa: 'رشته', labelEn: 'PROGRAM' },
];

const initialFilters = Object.fromEntries(filterFields.map((field) => [field.key, '']));

export default function ProgramsSearchPage({
  darkMode,
  isFa,
  ACCA_LOGO_SRC,
  onConsultationClick,
}) {
  const [rows, setRows] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [filters, setFilters] = useState(initialFilters);
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch('/data/programs.json')
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setRows(data.rows || []);
        setFilterOptions(data.filters || {});
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const normalizedQuery = normalize(query);

    return rows.filter((row) => {
      const matchesSearch =
        !normalizedQuery ||
        normalize(
          [
            row.id,
            row.program,
            row.university,
            row.faculty,
            row.degree,
            row.language,
            row.status,
            row.country,
            row.city,
            row.tuitionFee,
            row.depositFee,
          ].join(' ')
        ).includes(normalizedQuery);

      if (!matchesSearch) return false;

      return filterFields.every((field) => {
        const value = normalize(filters[field.key]);
        if (!value) return true;

        if (field.key === 'semester') {
          return (row.semesters || []).some((item) =>
            normalize(item.semester).includes(value)
          );
        }

        return normalize(row[field.rowKey]).includes(value);
      });
    });
  }, [filters, query, rows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const visibleRows = filteredRows.slice(startIndex, startIndex + pageSize);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setQuery('');
    setPage(1);
  };

  const downloadCsv = () => {
    const columns = [
      'id',
      'program',
      'university',
      'faculty',
      'degree',
      'language',
      'status',
      'semester',
      'tuitionFee',
      'depositFee',
      'prepSchoolFee',
      'cashFees',
      'country',
      'city',
      'campusAddress',
    ];
    const csv = [
      columns.join(','),
      ...filteredRows.map((row) =>
        columns.map((column) => csvEscape(row[column] || '')).join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'acca-programs.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`${darkMode ? 'bg-[#050816] text-white' : 'bg-[#F7F1E8] text-neutral-950'} min-h-screen overflow-hidden px-5 py-6 sm:px-6 sm:py-8`}
      dir={isFa ? 'rtl' : 'ltr'}
    >
      <div className={`${darkMode ? 'darkGlass' : 'glass'} mx-auto flex max-w-7xl items-center justify-between rounded-full px-5 py-3 sm:px-7 sm:py-4`}>
        <img
          src={ACCA_LOGO_SRC}
          alt="ACCA EDU Logo"
          className="h-10 w-auto object-contain sm:h-11"
        />

        <a
          href="/"
          className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black`}
        >
          <ArrowLeft size={16} className={isFa ? 'rotate-180' : ''} />
          {isFa ? 'بازگشت' : 'Back'}
        </a>
      </div>

      <main className="mx-auto max-w-7xl pb-20 pt-12 sm:pt-16">
        <div className="mb-8">
          <div className={`${darkMode ? 'text-emerald-300' : 'text-emerald-700'} mb-4 text-sm font-black uppercase tracking-[0.35em]`}>
            PROGRAMS & UNIVERSITIES
          </div>

          <h1 className="text-4xl font-black leading-tight md:text-6xl">
            {isFa ? 'جستجوی کامل رشته‌ها' : 'Programs Search'}
          </h1>

          <p className={`${darkMode ? 'text-white/62' : 'text-black/60'} mt-5 max-w-3xl text-base font-medium leading-8 md:text-lg`}>
            {isFa
              ? 'فیلتر کامل کشور، شهر، دانشگاه، مقطع، دانشکده، زبان، ترم، وضعیت و رشته.'
              : 'Full country, city, university, degree, faculty, language, semester, status, and program filtering.'}
          </p>
        </div>

        <section className={`${darkMode ? 'darkGlass' : 'glass'} rounded-[34px] p-5 md:p-7`}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-black">
              {isFa ? 'فیلتر جستجو' : 'Search Filter'}
            </h2>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-[18px] bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:scale-[1.02]"
            >
              <RotateCcw size={16} />
              {isFa ? 'ریست فیلترها' : 'Reset Filters'}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filterFields.map((field) => (
              <FilterInput
                key={field.key}
                field={field}
                value={filters[field.key]}
                options={filterOptions[field.key] || []}
                darkMode={darkMode}
                isFa={isFa}
                onChange={(value) => updateFilter(field.key, value)}
              />
            ))}
          </div>

          <label className={`${darkMode ? 'bg-white/8 border-white/10' : 'bg-white/80 border-black/10'} mt-5 flex items-center gap-3 rounded-[24px] border px-5 py-4`}>
            <Search size={20} className={darkMode ? 'text-white/45' : 'text-black/40'} />
            <input
              id="search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder={isFa ? 'جستجو در رشته‌ها و دانشگاه‌ها...' : 'Search in programs and universities...'}
              className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:opacity-45"
            />
          </label>
        </section>

        <section className={`${darkMode ? 'darkGlass' : 'glass'} mt-8 overflow-hidden rounded-[34px]`}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 px-5 py-4 md:px-7">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className={`${darkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'} inline-flex items-center gap-2 rounded-[16px] px-4 py-3 text-sm font-black`}
              >
                <Printer size={16} />
                Print
              </button>
              <button
                type="button"
                onClick={downloadCsv}
                className={`${darkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'} inline-flex items-center gap-2 rounded-[16px] px-4 py-3 text-sm font-black`}
              >
                <Download size={16} />
                Download CSV
              </button>
            </div>

            <div className="flex items-center gap-3 text-sm font-bold">
              <span>{isFa ? 'نمایش' : 'Show'}</span>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className={`${darkMode ? 'bg-white/10 text-white border-white/10' : 'bg-white/80 text-black border-black/10'} rounded-[14px] border px-3 py-2 font-black outline-none`}
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>{isFa ? 'رکورد' : 'entries'}</span>
            </div>
          </div>

          <div className="overflow-x-auto" dir="ltr">
            <table className="min-w-[1180px] w-full text-left">
              <thead className={`${darkMode ? 'text-white/45' : 'text-black/45'} border-b border-black/5 text-xs font-black uppercase tracking-[0.16em]`}>
                <tr>
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">{isFa ? 'رشته' : 'Program'}</th>
                  <th className="px-5 py-4">{isFa ? 'دانشگاه' : 'University'}</th>
                  <th className="px-5 py-4">{isFa ? 'اطلاعات' : 'Information'}</th>
                  <th className="px-5 py-4">{isFa ? 'آدرس' : 'Address'}</th>
                  <th className="px-5 py-4">{isFa ? 'اقدام' : 'Actions'}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/5">
                {loading ? (
                  <tr>
                    <td className="px-5 py-12 text-center font-black" colSpan={6}>
                      {isFa ? 'در حال بارگذاری...' : 'Loading...'}
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row) => (
                    <ProgramRow
                      key={row.id}
                      row={row}
                      darkMode={darkMode}
                      isFa={isFa}
                      onConsultationClick={onConsultationClick}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 md:px-7">
            <div className={`${darkMode ? 'text-white/55' : 'text-black/55'} text-sm font-bold`}>
              {isFa
                ? `نمایش ${filteredRows.length ? startIndex + 1 : 0} تا ${Math.min(startIndex + pageSize, filteredRows.length)} از ${filteredRows.length} رکورد`
                : `Showing ${filteredRows.length ? startIndex + 1 : 0} to ${Math.min(startIndex + pageSize, filteredRows.length)} of ${filteredRows.length} entries`}
            </div>

            <Pagination
              page={safePage}
              totalPages={totalPages}
              setPage={setPage}
              darkMode={darkMode}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function FilterInput({ field, value, options, darkMode, isFa, onChange }) {
  const id = `program-filter-${field.key}`;
  const label = isFa ? field.labelFa : field.labelEn;

  return (
    <label>
      <span className={`${darkMode ? 'text-white/45' : 'text-black/45'} mb-2 block text-xs font-black uppercase tracking-[0.16em]`}>
        {label}
      </span>
      <input
        list={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={isFa ? `انتخاب ${field.labelFa}` : `Select ${field.labelEn}`}
        className={`${darkMode ? 'bg-white/8 border-white/10 text-white placeholder:text-white/35' : 'bg-white/80 border-black/10 text-black placeholder:text-black/35'} w-full rounded-[20px] border px-4 py-3 text-sm font-bold outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15`}
      />
      <datalist id={id}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </label>
  );
}

function ProgramRow({ row, darkMode, isFa, onConsultationClick }) {
  return (
    <tr className={`${darkMode ? 'hover:bg-white/5' : 'hover:bg-white/55'} align-top transition`}>
      <td className="px-5 py-5 text-sm font-black opacity-45">{row.id}</td>
      <td className="px-5 py-5">
        <div className="max-w-[260px] text-base font-black leading-7">{row.program}</div>
        <div className={`${darkMode ? 'text-white/55' : 'text-black/55'} mt-1 text-sm font-bold`}>
          ({row.language || '-'})
        </div>
        <StatusBadge status={row.status} />
      </td>
      <td className="px-5 py-5">
        <div className="max-w-[250px] font-black leading-7">{row.university}</div>
        {row.universityUrl && (
          <a
            href={row.universityUrl}
            target="_blank"
            rel="noreferrer"
            className={`${darkMode ? 'text-emerald-300' : 'text-emerald-700'} mt-1 block max-w-[250px] truncate text-xs font-bold`}
          >
            {row.universityUrl}
          </a>
        )}
      </td>
      <td className="px-5 py-5">
        <div className="grid min-w-[250px] gap-1 text-sm font-bold leading-7">
          <span><b>Faculty:</b> {row.faculty || '-'}</span>
          <span><b>Degree:</b> {row.degree || '-'}</span>
          <span><b>Years:</b> {row.years || '-'}</span>
          <span><b>Deposit Fee:</b> {row.depositFee || '-'}</span>
          <span><b>Prep School Fee:</b> {row.prepSchoolFee || '-'}</span>
          <span><b>{row.semester || 'Semester'}:</b> {row.tuitionFee || '-'}</span>
          <span><b>Cash Fees:</b> {row.cashFees || '-'}</span>
        </div>
      </td>
      <td className="px-5 py-5">
        <div className="max-w-[270px] text-sm font-black leading-7">
          {row.country || '-'} / {row.city || '-'}
        </div>
        <div className={`${darkMode ? 'text-white/55' : 'text-black/55'} mt-1 max-w-[270px] text-xs font-bold leading-6`}>
          {row.campusAddress || '-'}
        </div>
      </td>
      <td className="px-5 py-5">
        <button
          type="button"
          onClick={onConsultationClick}
          className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} rounded-[18px] px-5 py-3 text-sm font-black transition hover:scale-[1.02]`}
        >
          {isFa ? 'مشاوره' : 'Consult'}
        </button>
      </td>
    </tr>
  );
}

function StatusBadge({ status }) {
  const color =
    status === 'Available'
      ? 'bg-emerald-500/14 text-emerald-600 border-emerald-500/25'
      : status === 'Near to close'
        ? 'bg-amber-500/14 text-amber-600 border-amber-500/25'
        : status === 'Quota Full'
          ? 'bg-sky-500/14 text-sky-600 border-sky-500/25'
          : 'bg-red-500/14 text-red-600 border-red-500/25';

  return (
    <div className={`${color} mt-3 inline-flex rounded-[14px] border px-3 py-2 text-xs font-black`}>
      {status || '-'}
    </div>
  );
}

function Pagination({ page, totalPages, setPage, darkMode }) {
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
            {item}
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

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function csvEscape(value) {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}
