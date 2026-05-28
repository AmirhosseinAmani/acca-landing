import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ExternalLink,
  Globe2,
  MapPin,
  Moon,
  Search,
  Sun,
} from 'lucide-react';
import { istanbulUniversities } from '../../data/istanbulUniversities';

const copy = {
  fa: {
    eyebrow: 'دانشگاه‌های خصوصی استانبول',
    title: 'مشاهده دانشگاه‌ها',
    description:
      'اطلاعات دانشگاه‌های خصوصی استانبول با لوگوها و آدرس رسمی هر دانشگاه.',
    back: 'بازگشت',
    search: 'جستجو در نام دانشگاه، آدرس یا توضیحات...',
    consult: 'رزرو مشاوره',
    programs: 'مشاهده رشته‌ها',
    website: 'وب‌سایت',
    calendar: 'تقویم آموزشی',
    private: 'خصوصی',
    founded: 'تاسیس',
    unknown: 'نامشخص',
    programsCount: 'رشته',
    announcementsCount: 'اعلان',
    campus: 'کمپوس',
    address: 'آدرس',
    logoPending: 'لوگو نیاز به تایید',
    matchedLogo: 'لوگو تایید شده',
    noResults: 'دانشگاهی با این جستجو پیدا نشد.',
    stats: {
      total: 'دانشگاه استانبول',
      logos: 'لوگوی Supabase',
      pending: 'لوگوی نیازمند تایید',
    },
  },
  en: {
    eyebrow: 'PRIVATE UNIVERSITIES OF ISTANBUL',
    title: 'Universities',
    description:
      'Istanbul private university profiles with official logos and direct website links.',
    back: 'Back',
    search: 'Search university name, address, or notes...',
    consult: 'Book Consultation',
    programs: 'View Programs',
    website: 'Website',
    calendar: 'Academic Calendar',
    private: 'Private',
    founded: 'Founded',
    unknown: 'Unknown',
    programsCount: 'Programs',
    announcementsCount: 'Announcements',
    campus: 'Campus',
    address: 'Address',
    logoPending: 'Logo pending',
    matchedLogo: 'Logo matched',
    noResults: 'No university found for this search.',
    stats: {
      total: 'Istanbul universities',
      logos: 'Supabase logos',
      pending: 'Logos pending',
    },
  },
};

export default function UniversitiesPage({
  darkMode,
  isFa,
  ACCA_LOGO_SRC,
  onConsultationClick,
  onToggleDarkMode,
  onToggleLanguage,
}) {
  const [query, setQuery] = useState(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('university') || params.get('query') || params.get('q') || '';
  });
  const ui = isFa ? copy.fa : copy.en;
  const matchedCount = istanbulUniversities.filter((item) => item.logo).length;
  const pendingCount = istanbulUniversities.length - matchedCount;

  const filteredUniversities = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) return istanbulUniversities;

    return istanbulUniversities.filter((university) =>
      normalizeText(
        [
          university.name,
          university.city,
          university.address,
          university.summary || '',
          ...university.campuses,
        ].join(' ')
      ).includes(normalizedQuery)
    );
  }, [query]);

  return (
    <div
      className={`${darkMode ? 'bg-[#050816] text-white' : 'bg-[#F7F1E8] text-black'} min-h-screen overflow-hidden px-4 py-5 sm:px-6 sm:py-8`}
      dir={isFa ? 'rtl' : 'ltr'}
    >
      <div
        className={`${darkMode ? 'darkGlass' : 'glass'} mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-full px-5 py-3 sm:px-7 sm:py-4`}
      >
        <img
          src={ACCA_LOGO_SRC}
          alt="ACCA EDU Logo"
          className="h-10 w-auto object-contain sm:h-11"
        />

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

          <a
            href="/"
            className={`${darkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'} inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black`}
          >
            <ArrowLeft size={16} className={isFa ? 'rotate-180' : ''} />
            {ui.back}
          </a>
        </div>
      </div>

      <main className="mx-auto max-w-7xl pb-16 pt-10 sm:pt-14">
        <section className="grid items-end gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div
              className={`${darkMode ? 'text-emerald-300' : 'text-emerald-700'} mb-4 text-sm font-black uppercase tracking-[0.28em]`}
            >
              {ui.eyebrow}
            </div>

            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              {ui.title}
            </h1>

            <p
              className={`${darkMode ? 'text-white/62' : 'text-black/62'} mt-5 max-w-3xl text-base font-medium leading-8 md:text-lg`}
            >
              {ui.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatTile
              darkMode={darkMode}
              value={istanbulUniversities.length}
              label={ui.stats.total}
            />
            <StatTile darkMode={darkMode} value={matchedCount} label={ui.stats.logos} />
            <StatTile darkMode={darkMode} value={pendingCount} label={ui.stats.pending} />
          </div>
        </section>

        <section
          className={`${darkMode ? 'darkGlass' : 'glass'} mt-8 rounded-[28px] p-4 sm:p-5`}
        >
          <label
            className={`${darkMode ? 'border-white/10 bg-white/10' : 'border-black/10 bg-white/90'} flex items-center gap-3 rounded-[22px] border px-5 py-4`}
          >
            <Search size={20} className={darkMode ? 'text-white/45' : 'text-black/45'} />
            <input
              id="university-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={ui.search}
              className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:opacity-45"
            />
          </label>
        </section>

        {filteredUniversities.length ? (
          <section
            data-university-grid
            className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {filteredUniversities.map((university) => (
              <UniversityCard
                key={university.id}
                university={university}
                darkMode={darkMode}
                isFa={isFa}
                ui={ui}
                onConsultationClick={onConsultationClick}
              />
            ))}
          </section>
        ) : (
          <div
            className={`${darkMode ? 'darkGlass text-white/72' : 'glass text-black/72'} mt-7 rounded-[28px] p-10 text-center text-lg font-black`}
          >
            {ui.noResults}
          </div>
        )}
      </main>
    </div>
  );
}

function UniversityCard({ university, darkMode, isFa, ui, onConsultationClick }) {
  const websiteUrl = normalizeUrl(university.website);
  const calendarUrl = normalizeUrl(university.academicCalendar);
  const visibleCampuses = university.campuses.filter(
    (campus) => campus && !campus.toLowerCase().includes('processing')
  );

  return (
    <article
      data-university-card
      className={`${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white/90'} flex min-h-[520px] flex-col rounded-[24px] border p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`${darkMode ? 'border-white/10 bg-white/10' : 'border-black/10 bg-white'} flex h-24 w-24 shrink-0 items-center justify-center rounded-[20px] border p-3`}
        >
          {university.logo ? (
            <img
              src={university.logo}
              alt={`${university.name} logo`}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div
              className={`${darkMode ? 'text-white/45' : 'text-black/40'} text-center text-xl font-black leading-none`}
              aria-label={ui.logoPending}
            >
              {getInitials(university.name)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div
            className={`${university.logo ? 'bg-emerald-500/15 text-emerald-700' : darkMode ? 'bg-white/10 text-white/55' : 'bg-black/5 text-black/50'} mb-3 inline-flex rounded-full px-3 py-1 text-[11px] font-black`}
          >
            {university.logo ? ui.matchedLogo : ui.logoPending}
          </div>

          <h2 className="text-xl font-black leading-7 text-inherit">
            {university.name}
          </h2>

          <div
            className={`${darkMode ? 'text-white/52' : 'text-black/52'} mt-2 flex items-center gap-2 text-xs font-black`}
          >
            <MapPin size={14} />
            <span>
              {university.city}, {university.country}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <InfoPill
          darkMode={darkMode}
          label={ui.private}
          value={translateValue(university.sector, isFa)}
        />
        <InfoPill
          darkMode={darkMode}
          label={ui.founded}
          value={university.foundedIn || ui.unknown}
        />
        <InfoPill
          darkMode={darkMode}
          label={ui.programsCount}
          value={formatNumber(university.programsCount, isFa)}
        />
        <InfoPill
          darkMode={darkMode}
          label={ui.announcementsCount}
          value={formatNumber(university.announcementsCount, isFa)}
        />
      </div>

      <div className="mt-5 space-y-3">
        {university.address ? (
          <DetailLine
            icon={<MapPin size={16} />}
            label={ui.address}
            text={university.address}
            darkMode={darkMode}
          />
        ) : null}

        {visibleCampuses.slice(0, 2).map((campus) => (
          <DetailLine
            key={campus}
            icon={<Globe2 size={16} />}
            label={ui.campus}
            text={campus}
            darkMode={darkMode}
          />
        ))}
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        {websiteUrl ? (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noreferrer"
            className={`${darkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'} inline-flex items-center gap-2 rounded-[15px] px-4 py-3 text-xs font-black transition hover:scale-[1.02]`}
          >
            <ExternalLink size={15} />
            {ui.website}
          </a>
        ) : null}

        {calendarUrl ? (
          <a
            href={calendarUrl}
            target="_blank"
            rel="noreferrer"
            className={`${darkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'} inline-flex items-center gap-2 rounded-[15px] px-4 py-3 text-xs font-black transition hover:scale-[1.02]`}
          >
            <CalendarDays size={15} />
            {ui.calendar}
          </a>
        ) : null}

        <a
          href="?page=programs"
          target="_blank"
          rel="noreferrer"
          className={`${darkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'} inline-flex items-center gap-2 rounded-[15px] px-4 py-3 text-xs font-black transition hover:scale-[1.02]`}
        >
          <BookOpen size={15} />
          {ui.programs}
        </a>

        <button
          type="button"
          onClick={onConsultationClick}
          className="inline-flex items-center gap-2 rounded-[15px] bg-emerald-500 px-4 py-3 text-xs font-black text-white transition hover:scale-[1.02]"
        >
          {ui.consult}
        </button>
      </div>
    </article>
  );
}

function StatTile({ value, label, darkMode }) {
  return (
    <div
      className={`${darkMode ? 'border-white/10 bg-white/10' : 'border-black/10 bg-white/80'} rounded-[22px] border p-4 text-center backdrop-blur-xl`}
    >
      <div className="text-2xl font-black">{value}</div>
      <div
        className={`${darkMode ? 'text-white/50' : 'text-black/50'} mt-1 text-[11px] font-black leading-4`}
      >
        {label}
      </div>
    </div>
  );
}

function InfoPill({ label, value, darkMode }) {
  return (
    <div
      className={`${darkMode ? 'bg-white/10' : 'bg-black/5'} rounded-[16px] px-3 py-3`}
    >
      <div
        className={`${darkMode ? 'text-white/42' : 'text-black/42'} text-[10px] font-black uppercase`}
      >
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-black">{value}</div>
    </div>
  );
}

function DetailLine({ icon, label, text, darkMode }) {
  return (
    <div
      className={`${darkMode ? 'text-white/58' : 'text-black/58'} grid grid-cols-[18px_1fr] gap-2 text-sm font-medium leading-6`}
    >
      <span className={darkMode ? 'text-emerald-300' : 'text-emerald-700'}>{icon}</span>
      <span>
        <b className={darkMode ? 'text-white/80' : 'text-black/80'}>{label}: </b>
        {text}
      </span>
    </div>
  );
}

function normalizeUrl(value) {
  if (!value) return '';
  const firstUrl = value.split(/\s+\/\s+|\s+/).find(Boolean);
  if (!firstUrl) return '';
  return /^https?:\/\//i.test(firstUrl) ? firstUrl : `https://${firstUrl}`;
}

function normalizeText(value) {
  return String(value || '')
    .toLocaleLowerCase('en-US')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('');
}

function formatNumber(value, isFa) {
  const number = Number(value);
  if (!Number.isFinite(number)) return value || '';
  return new Intl.NumberFormat(isFa ? 'fa-IR' : 'en-US').format(number);
}

function translateValue(value, isFa) {
  if (!isFa) return value;
  if (value === 'Private') return 'خصوصی';
  if (value === 'Turkey') return 'ترکیه';
  return value;
}
