import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Filter,
  Globe2,
  GraduationCap,
  Hospital,
  MapPin,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { BackButton, MainNav } from '../SiteNav';
import { istanbulUniversities } from '../../data/istanbulUniversities';

const filterOptions = [
  { id: 'all', fa: 'همه', en: 'All' },
  { id: 'hasWorldRanking', fa: 'رتبه جهانی THE', en: 'THE world rank' },
  { id: 'hasImpactRanking', fa: 'اثرگذاری THE', en: 'THE impact' },
  { id: 'hasSubjectRanking', fa: 'رتبه موضوعی', en: 'Subject rank' },
  { id: 'highProgramCount', fa: '۱۰۰+ رشته', en: '100+ programs' },
  { id: 'hasVerifiedCredentials', fa: 'اعتبارنامه تاییدشده', en: 'Verified credentials' },
  { id: 'medicalSignal', fa: 'سلامت/بالینی', en: 'Health / clinical' },
  { id: 'multiCampus', fa: 'چندکمپوسی', en: 'Multi-campus' },
  { id: 'hasAcademicCalendar', fa: 'تقویم رسمی', en: 'Academic calendar' },
];

const sortOptions = [
  { id: 'recommended', fa: 'پیشنهادی', en: 'Recommended' },
  { id: 'worldRankAsc', fa: 'رتبه جهانی THE: بهتر به ضعیف‌تر', en: 'THE world rank: best first' },
  { id: 'worldRankDesc', fa: 'رتبه جهانی THE: ضعیف‌تر به بهتر', en: 'THE world rank: lowest first' },
  { id: 'impactRankAsc', fa: 'اثرگذاری THE: بهتر به ضعیف‌تر', en: 'THE impact: best first' },
  { id: 'impactRankDesc', fa: 'اثرگذاری THE: ضعیف‌تر به بهتر', en: 'THE impact: lowest first' },
  { id: 'foundedAsc', fa: 'سال تاسیس: قدیمی به جدید', en: 'Founded: oldest first' },
  { id: 'foundedDesc', fa: 'سال تاسیس: جدید به قدیم', en: 'Founded: newest first' },
  { id: 'programsDesc', fa: 'تعداد رشته: زیاد به کم', en: 'Programs: high to low' },
  { id: 'programsAsc', fa: 'تعداد رشته: کم به زیاد', en: 'Programs: low to high' },
  { id: 'campusesDesc', fa: 'تعداد کمپوس: زیاد به کم', en: 'Campuses: high to low' },
  { id: 'campusesAsc', fa: 'تعداد کمپوس: کم به زیاد', en: 'Campuses: low to high' },
  { id: 'announcementsDesc', fa: 'تعداد اعلان: زیاد به کم', en: 'Announcements: high to low' },
  { id: 'announcementsAsc', fa: 'تعداد اعلان: کم به زیاد', en: 'Announcements: low to high' },
  { id: 'name', fa: 'نام دانشگاه', en: 'University name' },
];

const copy = {
  fa: {
    eyebrow: 'دانشگاه‌های خصوصی استانبول',
    title: 'مشاهده دانشگاه‌ها',
    description:
      'یک نمای تصمیم‌ساز از دانشگاه‌های خصوصی استانبول؛ خلاصه، سریع‌خوان و متکی بر داده‌هایی که در بانک داخلی ثبت شده‌اند.',
    back: 'بازگشت',
    search: 'جستجو در نام دانشگاه، آدرس، امکانات یا توضیحات...',
    consult: 'بررسی پذیرش',
    programs: 'رشته‌ها',
    website: 'وب‌سایت',
    calendar: 'تقویم',
    private: 'خصوصی',
    founded: 'تاسیس',
    unknown: 'نامشخص',
    programsCount: 'رشته',
    announcementsCount: 'اعلان',
    campus: 'کمپوس',
    address: 'آدرس',
    details: 'جزئیات بیشتر',
    filters: 'فیلترها',
    sort: 'مرتب‌سازی',
    ranking: 'رتبه‌بندی',
    keyNumbers: 'شاخص‌های عددی',
    facilities: 'امکانات عملی و آموزشی',
    pathways: 'اعتبارنامه‌ها و مسیرهای بین‌المللی',
    sources: 'منابع',
    noResults: 'دانشگاهی با این جستجو یا فیلتر پیدا نشد.',
    notRecorded: 'در منابع بررسی‌شده ثبت نشده',
    sourceReview: 'نیازمند بررسی تکمیلی منبع رسمی',
    officialWebsite: 'وب‌سایت رسمی',
    academicCalendar: 'تقویم آموزشی',
    disclaimer:
      'این اطلاعات از داده‌های عمومی و منابع ثبت‌شده در بانک داخلی گردآوری شده و ممکن است در آینده تغییر کند. برای تصمیم نهایی، بررسی انسانی و منبع رسمی دانشگاه پیشنهاد می‌شود.',
  },
  en: {
    eyebrow: 'PRIVATE UNIVERSITIES OF ISTANBUL',
    title: 'Universities',
    description:
      'A decision-ready view of Istanbul private universities, with compact summaries and source-aware data from the internal archive.',
    back: 'Back',
    search: 'Search university name, address, facilities, or notes...',
    consult: 'Admission Review',
    programs: 'Programs',
    website: 'Website',
    calendar: 'Calendar',
    private: 'Private',
    founded: 'Founded',
    unknown: 'Unknown',
    programsCount: 'Programs',
    announcementsCount: 'Announcements',
    campus: 'Campus',
    address: 'Address',
    details: 'More Details',
    filters: 'Filters',
    sort: 'Sort',
    ranking: 'Rankings',
    keyNumbers: 'Key Numbers',
    facilities: 'Practical Facilities',
    pathways: 'Credentials & International Pathways',
    sources: 'Sources',
    noResults: 'No university found for this search or filter.',
    notRecorded: 'Not recorded in reviewed sources',
    sourceReview: 'Needs official source review',
    officialWebsite: 'Official website',
    academicCalendar: 'Academic calendar',
    disclaimer:
      'This information is compiled from public data and sources stored in the internal archive. It may change, so final decisions should include human review and the university’s official source.',
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
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortMode, setSortMode] = useState('recommended');
  const [selectedUniversity, setSelectedUniversity] = useState(getInitialProfileUniversity);
  const ui = isFa ? copy.fa : copy.en;

  // Open/close the details as a state-driven overlay (no page reload) so the
  // visitor returns to the exact scroll position when they close it. The URL is
  // still synced (via replaceState) so a profile link stays shareable.
  const openDetails = (university) => {
    setSelectedUniversity(university);
    try {
      window.history.replaceState(null, '', buildUniversityProfileUrl(university));
    } catch {
      /* history may be restricted; the modal still works */
    }
  };
  const closeDetails = () => {
    setSelectedUniversity(null);
    try {
      window.history.replaceState(null, '', '?page=universities');
    } catch {
      /* ignore */
    }
  };

  const filteredUniversities = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    const searched = istanbulUniversities.filter((university) => {
      const profile = university.decisionProfile;
      const haystack = [
        university.name,
        university.city,
        university.address,
        university.summary || '',
        profile?.microSummaryFa || '',
        profile?.microSummaryEn || '',
        ...(university.campuses || []),
        ...(profile?.displayBadges || []),
        ...(profile?.practicalFacilities || []),
      ].join(' ');

      return !normalizedQuery || normalizeText(haystack).includes(normalizedQuery);
    });

    const filtered = activeFilter === 'all'
      ? searched
      : searched.filter((university) => university.decisionProfile?.filters?.[activeFilter]);

    return [...filtered].sort((a, b) => sortUniversities(a, b, sortMode));
  }, [activeFilter, query, sortMode]);

  return (
    <div
      className={`${darkMode ? 'bg-[#050816] text-white' : 'bg-[#F7F1E8] text-black'} min-h-screen overflow-x-hidden px-3 py-4 sm:px-6 sm:py-8`}
      dir={isFa ? 'rtl' : 'ltr'}
    >
      <div
        className={`${darkMode ? 'darkGlass' : 'glass'} mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-[28px] px-4 py-3 sm:rounded-full sm:px-7 sm:py-4`}
      >
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

        <MainNav active="universities" isFa={isFa} darkMode={darkMode} />

        <div className="flex flex-wrap items-center justify-end gap-2">
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

      <main className="mx-auto max-w-7xl pb-14 pt-6 sm:pt-10">
        <section className="grid items-end gap-7 lg:grid-cols-[1fr_360px]">
          <div className="max-w-4xl">
            <div
              className={`${darkMode ? 'text-emerald-300' : 'text-emerald-700'} mb-3 text-xs font-black uppercase tracking-[0.22em] sm:mb-4 sm:text-sm sm:tracking-[0.28em]`}
            >
              {ui.eyebrow}
            </div>

            <h1 className="text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
              {ui.title}
            </h1>

            <p
              className={`${darkMode ? 'text-white/62' : 'text-black/62'} mt-3 max-w-3xl text-sm font-medium leading-7 md:text-base`}
            >
              {ui.description}
            </p>
          </div>

          <div
            className={`${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white/70'} rounded-[24px] border p-5 backdrop-blur-xl`}
          >
            <div className="flex items-center gap-2 text-sm font-black">
              <Sparkles size={18} className={darkMode ? 'text-amber-200' : 'text-amber-700'} />
              <span>{isFa ? 'تمرکز صفحه' : 'Page Focus'}</span>
            </div>
            <p className={`${darkMode ? 'text-white/58' : 'text-black/58'} mt-3 text-sm font-medium leading-7`}>
              {isFa
                ? 'کارت‌ها فقط خلاصه مهم را نشان می‌دهند؛ داده‌های THE در جزئیات با منبع و جدول کامل قابل بررسی است.'
                : 'Cards show only the essential summary; THE data is available in details with source-backed ranking tables.'}
            </p>
          </div>
        </section>

        <section
          className={`${darkMode ? 'border-white/10 bg-white/[0.045]' : 'border-black/10 bg-white/72'} mt-6 grid gap-4 rounded-[22px] border px-4 py-4 sm:grid-cols-3 sm:px-5`}
          aria-labelledby="university-comparison-heading"
        >
          <div className="sm:col-span-3">
            <h2 id="university-comparison-heading" className="text-lg font-black leading-7 sm:text-xl">
              {isFa
                ? '\u0645\u0642\u0627\u06cc\u0633\u0647 \u062f\u0627\u0646\u0634\u06af\u0627\u0647\u200c\u0647\u0627\u06cc \u062a\u0631\u06a9\u06cc\u0647 \u0628\u0631\u0627\u06cc \u067e\u0630\u06cc\u0631\u0634 \u062f\u0627\u0646\u0634\u062c\u0648\u06cc \u0628\u06cc\u0646\u200c\u0627\u0644\u0645\u0644\u0644\u06cc'
                : 'Compare Turkey universities for international student admission'}
            </h2>
          </div>
          {[
            {
              title: isFa ? '\u0631\u0634\u062a\u0647 \u0648 \u0634\u0647\u0631\u06cc\u0647' : 'Programs and tuition',
              text: isFa
                ? '\u062a\u0639\u062f\u0627\u062f \u0631\u0634\u062a\u0647\u200c\u0647\u0627\u060c \u062a\u0646\u0648\u0639 \u06a9\u0627\u062a\u0627\u0644\u0648\u06af \u0648 \u0644\u06cc\u0646\u06a9 \u062c\u0633\u062a\u062c\u0648\u06cc \u0634\u0647\u0631\u06cc\u0647 \u0628\u0647 \u0627\u0646\u062a\u062e\u0627\u0628 \u0648\u0627\u0642\u200c\u0628\u06cc\u0646\u0627\u0646\u0647 \u06a9\u0645\u06a9 \u0645\u06cc\u200c\u06a9\u0646\u062f.'
                : 'Program count, catalog depth, and tuition search links help applicants compare realistic study options.',
            },
            {
              title: isFa ? '\u0645\u06a9\u0627\u0646 \u0648 \u06a9\u0645\u067e\u0648\u0633' : 'Location and campus',
              text: isFa
                ? '\u0645\u0648\u0642\u0639\u06cc\u062a \u06a9\u0645\u067e\u0648\u0633\u060c \u0686\u0646\u062f\u06a9\u0645\u067e\u0648\u0633\u06cc \u0628\u0648\u062f\u0646 \u0648 \u062f\u0633\u062a\u0631\u0633\u06cc \u0634\u0647\u0631\u06cc \u0628\u0631\u0627\u06cc \u062e\u0648\u0627\u0628\u06af\u0627\u0647\u060c \u0627\u0642\u0627\u0645\u062a \u0648 \u0631\u0641\u062a\u200c\u0648\u0622\u0645\u062f \u0645\u0647\u0645 \u0627\u0633\u062a.'
                : 'Campus location and multi-campus footprints matter for housing, residence steps, and daily commute.',
            },
            {
              title: isFa ? '\u0645\u0646\u0628\u0639 \u0648 \u0627\u0639\u062a\u0628\u0627\u0631 \u0622\u06a9\u0627\u062f\u0645\u06cc\u06a9' : 'Sources and academic signals',
              text: isFa
                ? '\u0631\u062a\u0628\u0647 THE\u060c \u062a\u0642\u0648\u06cc\u0645 \u0631\u0633\u0645\u06cc\u060c ECTS\u060c Erasmus+ \u0648 \u0645\u0646\u0627\u0628\u0639 \u062f\u0627\u0646\u0634\u06af\u0627\u0647\u06cc \u0641\u0642\u0637 \u0628\u0627 \u0630\u06a9\u0631 \u0645\u0646\u0628\u0639 \u062f\u0631 \u067e\u0631\u0648\u0641\u0627\u06cc\u0644 \u0645\u06cc\u200c\u0622\u06cc\u062f.'
                : 'THE rankings, official calendars, ECTS, Erasmus+, and university sources are separated from unverified claims.',
            },
          ].map((item) => (
            <div key={item.title} className={`${darkMode ? 'bg-white/[0.055]' : 'bg-black/[0.025]'} rounded-[16px] px-4 py-3`}>
              <h3 className="text-sm font-black">{item.title}</h3>
              <p className={`${darkMode ? 'text-white/60' : 'text-black/60'} mt-2 text-xs font-bold leading-6`}>
                {item.text}
              </p>
            </div>
          ))}
        </section>

        <section
          className={`${darkMode ? 'darkGlass' : 'glass'} mt-5 space-y-4 rounded-[22px] p-3 sm:rounded-[24px] sm:p-4`}
        >
          <label
            className={`${darkMode ? 'border-white/10 bg-white/10' : 'border-black/10 bg-white/90'} flex items-center gap-3 rounded-[18px] border px-4 py-3.5 sm:rounded-[22px] sm:px-5 sm:py-4`}
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

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className={`${darkMode ? 'text-white/50' : 'text-black/50'} mb-2 flex items-center gap-2 text-xs font-black`}>
                <Filter size={15} className="shrink-0" />
                {ui.filters}
              </div>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setActiveFilter(option.id)}
                    className={`${activeFilter === option.id
                      ? 'border-emerald-500 bg-emerald-600 text-white shadow-[0_14px_34px_rgba(5,150,105,0.22)]'
                      : darkMode
                        ? 'border-white/10 bg-white/10 text-white/76 hover:bg-white/15'
                        : 'border-black/10 bg-white/70 text-black/70 hover:bg-white'} inline-flex items-center rounded-full border px-3.5 py-2.5 text-xs font-black transition sm:px-4`}
                  >
                    {isFa ? option.fa : option.en}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
              <span className={`${darkMode ? 'text-white/50' : 'text-black/50'} text-xs font-black`}>
                {ui.sort}
              </span>
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value)}
                className={`${darkMode ? 'border-white/10 bg-white/10 text-white' : 'border-black/10 bg-white text-black'} min-w-0 flex-1 rounded-full border px-4 py-2 text-xs font-black outline-none sm:flex-none`}
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {isFa ? option.fa : option.en}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {filteredUniversities.length ? (
          <section
            data-university-grid
            className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {filteredUniversities.map((university) => (
              <UniversityCard
                key={university.id}
                university={university}
                darkMode={darkMode}
                isFa={isFa}
                ui={ui}
                onConsultationClick={onConsultationClick}
                onOpenDetails={openDetails}
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

      {selectedUniversity ? (
        <UniversityDetailsModal
          university={selectedUniversity}
          darkMode={darkMode}
          isFa={isFa}
          ui={ui}
          onClose={closeDetails}
        />
      ) : null}
    </div>
  );
}

function UniversityCard({
  university,
  darkMode,
  isFa,
  ui,
  onConsultationClick,
  onOpenDetails,
}) {
  const profile = university.decisionProfile;
  const websiteUrl = normalizeUrl(university.website);
  const calendarUrl = normalizeUrl(university.academicCalendar);
  const keyNumbers = profile?.keyNumbers?.slice(0, 4) || [];
  const summary = isFa ? profile?.microSummaryFa : profile?.microSummaryEn;
  const theCardItems = [
    ...(profile?.rankingSummary?.cardItems || []).map((item) => ({
      ...item,
      label: translateRankingCardLabel(item.label, isFa),
    })),
    ...getTheProfileFactCards(profile?.profileFacts, isFa),
  ].slice(0, 2);

  return (
    <article
      data-university-card
      className={`${darkMode ? 'border-white/10 bg-white/[0.055]' : 'border-black/10 bg-white/92'} flex min-h-[490px] flex-col rounded-[20px] border p-4 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.12)] sm:rounded-[22px]`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <LogoBox university={university} darkMode={darkMode} />

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-2">
            <SmallBadge darkMode={darkMode}>{translateValue(university.sector, isFa)}</SmallBadge>
            <SmallBadge darkMode={darkMode}>{translateValue(university.city, isFa)}</SmallBadge>
          </div>

          <h2 className="text-lg font-black leading-7 text-inherit sm:text-xl">
            {university.name}
          </h2>

          <div
            className={`${darkMode ? 'text-white/52' : 'text-black/52'} mt-2 flex items-center gap-2 text-xs font-black`}
          >
            <MapPin size={14} />
            <span>
              {translateValue(university.city, isFa)}, {translateValue(university.country, isFa)}
            </span>
          </div>
        </div>
      </div>

      <div
        className={`${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/[0.025]'} mt-4 rounded-[16px] border px-3 py-3`}
      >
        <div className="flex items-center gap-2 text-xs font-black">
          <Award size={15} className={darkMode ? 'text-amber-200' : 'text-amber-700'} />
          <span className={darkMode ? 'text-white/76' : 'text-black/72'}>
            {isFa ? profile?.rankingSummary?.badgeFa : profile?.rankingSummary?.badgeEn}
          </span>
        </div>

        {theCardItems.length ? (
          <div className="mt-2 grid gap-2">
            {theCardItems.map((item) => (
              <div
                key={item.label}
                className={`${darkMode ? 'bg-white/8 text-white/78' : 'bg-white/80 text-black/72'} rounded-[12px] px-3 py-2 text-[11px] font-black`}
              >
                {item.label}
              </div>
            ))}
          </div>
        ) : (
          <div className={`${darkMode ? 'text-white/45' : 'text-black/45'} mt-2 text-[11px] font-bold leading-5`}>
            {isFa ? profile?.rankingSummary?.noteFa : profile?.rankingSummary?.noteEn}
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {keyNumbers.map((item) => (
          <InfoPill
            key={item.id}
            darkMode={darkMode}
            label={isFa ? item.labelFa : item.labelEn}
            value={formatDataValue(item.value, isFa, ui)}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(profile?.displayBadges || []).slice(0, 5).map((badge) => (
          <FeatureBadge key={badge} darkMode={darkMode}>
            {translateUiText(badge, isFa)}
          </FeatureBadge>
        ))}
      </div>

      <div className="mt-3">
        <div className={`${darkMode ? 'text-white/45' : 'text-black/45'} mb-1.5 text-[10px] font-black uppercase tracking-wide`}>
          {isFa ? 'اعتبارنامه‌های بین‌المللی' : 'International credentials'}
        </div>
        <CredentialBadges credentials={profile?.internationalCredentials} darkMode={darkMode} isFa={isFa} />
      </div>

      <p className={`${darkMode ? 'text-white/62' : 'text-black/62'} mt-3 line-clamp-3 text-sm font-medium leading-6`}>
        {summary}
      </p>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-5 sm:flex sm:flex-wrap">
        <a
          href={buildUniversityProfileUrl(university)}
          onClick={(event) => {
            // Modified clicks (new tab / middle-click) keep their native behavior.
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button === 1) return;
            event.preventDefault();
            onOpenDetails?.(university);
          }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[15px] bg-[#071A3D] px-3 py-3 text-center text-xs font-black text-white transition hover:scale-[1.02] sm:px-4"
        >
          <Sparkles size={15} />
          {ui.details}
        </a>

        <a
          href={buildProgramsUrl(university.name)}
          className={`${darkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'} inline-flex min-h-11 items-center justify-center gap-2 rounded-[15px] px-3 py-3 text-center text-xs font-black transition hover:scale-[1.02] sm:px-4`}
        >
          <BookOpen size={15} />
          {ui.programs}
        </a>

        {websiteUrl ? (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noreferrer"
            className={`${darkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'} inline-flex min-h-11 items-center justify-center gap-2 rounded-[15px] px-3 py-3 text-center text-xs font-black transition hover:scale-[1.02] sm:px-4`}
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
            className={`${darkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'} inline-flex min-h-11 items-center justify-center gap-2 rounded-[15px] px-3 py-3 text-center text-xs font-black transition hover:scale-[1.02] sm:px-4`}
          >
            <CalendarDays size={15} />
            {ui.calendar}
          </a>
        ) : null}

        <button
          type="button"
          onClick={onConsultationClick}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[15px] bg-emerald-600 px-3 py-3 text-center text-xs font-black text-white transition hover:scale-[1.02] sm:px-4"
        >
          {ui.consult}
        </button>
      </div>
    </article>
  );
}

function UniversityDetailsModal({ university, darkMode, isFa, ui, onClose }) {
  const profile = university.decisionProfile;
  const credentials = profile?.internationalCredentials;
  const visibleCampuses = (university.campuses || []).filter(
    (campus) => campus && !campus.toLowerCase().includes('processing')
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] overflow-x-hidden overflow-y-auto overscroll-contain"
      dir={isFa ? 'rtl' : 'ltr'}
    >
      <button
        type="button"
        aria-label="Close university details backdrop"
        className="fixed inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative z-10 flex min-h-full items-start justify-center px-3 py-3 sm:px-4 sm:py-6"
        style={{
          paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        }}
      >
        <div
          className={`${darkMode ? 'border-white/10 bg-[#071126] text-white' : 'border-black/10 bg-[#FBF7EF] text-black'} flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border shadow-[0_28px_90px_rgba(0,0,0,0.30)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[28px]`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        role="dialog"
        aria-modal="true"
      >
          <div
            className={`${darkMode ? 'border-white/10 bg-[#071126]/95' : 'border-black/10 bg-[#FBF7EF]/95'} shrink-0 border-b px-4 py-4 backdrop-blur-xl sm:px-7 sm:py-5`}
          >
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <LogoBox university={university} darkMode={darkMode} compact />
                <div className="min-w-0">
                  <div className={`${darkMode ? 'text-emerald-300' : 'text-emerald-700'} text-[10px] font-black uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.22em]`}>
                    {ui.details}
                  </div>
                  <h2 className="mt-1.5 text-xl font-black leading-7 sm:mt-2 sm:text-3xl sm:leading-9">
                    {university.name}
                  </h2>
                  <p className={`${darkMode ? 'text-white/60' : 'text-black/60'} mt-1.5 text-xs font-bold sm:mt-2 sm:text-sm`}>
                    {translateValue(university.city, isFa)}, {translateValue(university.country, isFa)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className={`${darkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-black/5 text-black hover:bg-black/10'} flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition`}
                aria-label="Close university details"
                data-university-modal-close
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div
            className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pb-4 pt-5 sm:px-7 sm:pb-7 sm:pt-6"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <p className={`${darkMode ? 'text-white/66' : 'text-black/66'} max-w-4xl text-sm font-medium leading-7`}>
              {isFa ? profile?.microSummaryFa : profile?.microSummaryEn}
            </p>

            <div className="mt-5 grid gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-2">
              <TimesHigherEducationSection
                profile={profile}
                darkMode={darkMode}
                isFa={isFa}
                ui={ui}
              />

              <DetailSection
                title={ui.keyNumbers}
                icon={<GraduationCap size={18} />}
                darkMode={darkMode}
              >
                <div className="grid grid-cols-2 gap-2">
                  {(profile?.keyNumbers || []).map((item) => (
                    <InfoPill
                      key={item.id}
                      darkMode={darkMode}
                      label={isFa ? item.labelFa : item.labelEn}
                      value={formatDataValue(item.value, isFa, ui)}
                      meta={item.sourceUrl ? profile.lastChecked : ''}
                    />
                  ))}
                </div>
              </DetailSection>

              <DetailSection
                title={ui.facilities}
                icon={<Hospital size={18} />}
                darkMode={darkMode}
              >
                <ChipList
                  darkMode={darkMode}
                  emptyText={ui.notRecorded}
                  isFa={isFa}
                  items={[
                    ...(profile?.practicalFacilities || []),
                    ...visibleCampuses.slice(0, 4),
                  ]}
                />
              </DetailSection>

              <DetailSection
                title={ui.pathways}
                icon={<ShieldCheck size={18} />}
                darkMode={darkMode}
              >
                <CredentialsSection credentials={credentials} darkMode={darkMode} isFa={isFa} ui={ui} />
              </DetailSection>
            </div>

            <DetailSection
              title={ui.sources}
              icon={<Globe2 size={18} />}
              darkMode={darkMode}
              className="mt-3 sm:mt-4"
            >
              {profile?.sources?.length ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {profile.sources.map((item) => (
                    <a
                      key={`${item.label}-${item.sourceUrl}`}
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`${darkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'} min-w-0 rounded-[16px] px-4 py-3 text-xs font-black transition hover:scale-[1.01]`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <ExternalLink size={14} className="shrink-0" />
                        {translateSourceLabel(item.label, isFa)}
                      </span>
                      <span className={`${darkMode ? 'text-white/45' : 'text-black/45'} mt-1 block font-bold`}>
                        {item.lastChecked}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <MissingNotice darkMode={darkMode} text={ui.notRecorded} />
              )}
            </DetailSection>

            <div
              className={`${darkMode ? 'border-white/10 bg-white/5 text-white/58' : 'border-black/10 bg-black/[0.025] text-black/58'} mt-3 rounded-[18px] border px-4 py-3 text-xs font-bold leading-6 sm:mt-4`}
            >
              {ui.disclaimer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getInitialProfileUniversity() {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const profileParam = params.get('profile');
  if (!profileParam) return null;

  const normalizedProfile = normalizeText(profileParam);
  return istanbulUniversities.find((university) => {
    const normalizedName = normalizeText(university.name);
    return normalizedName === normalizedProfile ||
      normalizedName.includes(normalizedProfile) ||
      normalizedProfile.includes(normalizedName);
  }) || null;
}

function buildProgramsUrl(universityName) {
  return `?page=programs&university=${encodeURIComponent(universityName)}`;
}

function buildUniversityProfileUrl(university) {
  const profile = university?.slug || university?.name || '';
  return `?page=universities&profile=${encodeURIComponent(profile)}`;
}

function TimesHigherEducationSection({ profile, darkMode, isFa, ui }) {
  const rankingSummary = profile?.rankingSummary;
  const theRankings = profile?.theRankings;
  const rankings = rankingSummary?.items || [];
  const factCards = getTheProfileFactCards(profile?.profileFacts, isFa);

  return (
    <DetailSection
      title={isFa ? 'رتبه‌بندی Times Higher Education' : 'Times Higher Education Rankings'}
      icon={<Award size={18} />}
      darkMode={darkMode}
    >
      <div className={`${darkMode ? 'bg-white/[0.06]' : 'bg-black/[0.035]'} rounded-[16px] px-4 py-3`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`${rankingSummary?.status === 'listed'
            ? darkMode ? 'bg-emerald-400/15 text-emerald-300' : 'bg-emerald-600/10 text-emerald-700'
            : rankingSummary?.status === 'profile'
              ? darkMode ? 'bg-amber-400/15 text-amber-200' : 'bg-amber-600/10 text-amber-700'
              : darkMode ? 'bg-white/10 text-white/62' : 'bg-black/5 text-black/58'} rounded-full px-3 py-1 text-[11px] font-black`}
          >
            {isFa ? rankingSummary?.badgeFa : rankingSummary?.badgeEn}
          </span>
          {theRankings?.profileUrl ? (
            <a
              href={theRankings.profileUrl}
              target="_blank"
              rel="noreferrer"
              className={`${darkMode ? 'text-amber-200' : 'text-amber-700'} inline-flex items-center gap-1 text-[11px] font-black`}
            >
              <ExternalLink size={12} />
              {isFa ? 'پروفایل Times Higher Education' : 'Times Higher Education Profile'}
            </a>
          ) : null}
        </div>
        <p className={`${darkMode ? 'text-white/58' : 'text-black/58'} mt-2 text-xs font-bold leading-6`}>
          {isFa ? rankingSummary?.noteFa : rankingSummary?.noteEn}
        </p>
      </div>

      {factCards.length ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {factCards.map((item) => (
            <InfoPill
              key={item.label}
              darkMode={darkMode}
              label={item.label}
              value={item.value}
              meta={theRankings?.lastChecked || ''}
            />
          ))}
        </div>
      ) : null}

      {rankings.length ? (
        <>
          <div className="mt-3 grid gap-2 md:hidden">
            {rankings.map((item, index) => (
              <RankingMobileCard
                key={`${item.rankingType}-${item.subject}-${item.year}-${index}-mobile`}
                item={item}
                theRankings={theRankings}
                darkMode={darkMode}
                isFa={isFa}
                ui={ui}
              />
            ))}
          </div>

          <div className={`${darkMode ? 'border-white/10' : 'border-black/10'} mt-3 hidden overflow-hidden rounded-[16px] border md:block`}>
            <table className="w-full table-fixed text-start text-xs">
              <thead className={darkMode ? 'bg-white/10 text-white/58' : 'bg-black/[0.04] text-black/58'}>
                <tr>
                  <TableHeader className="w-[34%]">{isFa ? 'نوع رتبه‌بندی' : 'Ranking Type'}</TableHeader>
                  <TableHeader className="w-[13%]">{isFa ? 'سال' : 'Year'}</TableHeader>
                  <TableHeader className="w-[19%]">{isFa ? 'رتبه / بازه' : 'Rank / Range'}</TableHeader>
                  <TableHeader className="w-[19%]">{isFa ? 'امتیاز' : 'Score'}</TableHeader>
                  <TableHeader className="w-[15%]">{isFa ? 'منبع' : 'Source'}</TableHeader>
                </tr>
              </thead>
              <tbody>
                {rankings.map((item, index) => (
                  <tr
                    key={`${item.rankingType}-${item.subject}-${item.year}-${index}`}
                    className={`${darkMode ? 'border-white/10' : 'border-black/10'} border-t`}
                  >
                    <TableCell>
                      {formatRankingType(item, isFa)}
                    </TableCell>
                    <TableCell>{item.year || ui.notRecorded}</TableCell>
                    <TableCell>{rankingDisplayValue(item) || ui.notRecorded}</TableCell>
                    <TableCell>{item.score || ui.notRecorded}</TableCell>
                    <TableCell>
                      <a
                        href={item.sourceUrl || theRankings?.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`${darkMode ? 'text-amber-200' : 'text-amber-700'} inline-flex items-center gap-1 font-black`}
                      >
                        <ExternalLink size={12} />
                        {isFa ? 'منبع' : 'Source'}
                      </a>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <MissingNotice darkMode={darkMode} text={isFa ? rankingSummary?.noteFa : rankingSummary?.noteEn} />
      )}

      {theRankings?.dataQuality?.missingData?.length ? (
        <div className={`${darkMode ? 'text-white/42' : 'text-black/42'} mt-3 text-[11px] font-bold leading-5`}>
          {(theRankings.dataQuality.missingData || []).map((item) => translateDataQualityItem(item, isFa)).join(isFa ? '، ' : ', ')}
        </div>
      ) : null}
    </DetailSection>
  );
}

function RankingMobileCard({ item, theRankings, darkMode, isFa, ui }) {
  const values = [
    {
      label: isFa ? 'سال' : 'Year',
      value: item.year || ui.notRecorded,
    },
    {
      label: isFa ? 'رتبه / بازه' : 'Rank / Range',
      value: rankingDisplayValue(item) || ui.notRecorded,
    },
    {
      label: isFa ? 'امتیاز' : 'Score',
      value: item.score || ui.notRecorded,
    },
  ];

  return (
    <div className={`${darkMode ? 'bg-white/[0.06]' : 'bg-black/[0.035]'} min-w-0 rounded-[14px] px-3 py-3`}>
      <div className="min-w-0 text-xs font-black leading-5">
        {formatRankingType(item, isFa)}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {values.map((entry) => (
          <div
            key={entry.label}
            className={`${darkMode ? 'bg-white/8' : 'bg-white/65'} min-w-0 rounded-[12px] px-2 py-2`}
          >
            <div className={`${darkMode ? 'text-white/42' : 'text-black/42'} text-[10px] font-black`}>
              {entry.label}
            </div>
            <div className="mt-1 min-w-0 break-words text-[11px] font-black leading-4">
              {entry.value}
            </div>
          </div>
        ))}
      </div>

      <a
        href={item.sourceUrl || theRankings?.profileUrl}
        target="_blank"
        rel="noreferrer"
        className={`${darkMode ? 'text-amber-200' : 'text-amber-700'} mt-3 inline-flex max-w-full items-center gap-1 text-[11px] font-black`}
      >
        <ExternalLink size={12} className="shrink-0" />
        {isFa ? 'منبع' : 'Source'}
      </a>
    </div>
  );
}

function TableHeader({ children, className = '' }) {
  return <th className={`${className} px-3 py-3 text-start font-black`}>{children}</th>;
}

function TableCell({ children }) {
  return <td className="min-w-0 break-words px-3 py-3 align-top font-bold">{children}</td>;
}

function LogoBox({ university, darkMode, compact = false }) {
  return (
    <div
      className={`${darkMode ? 'border-white/10 bg-white/10' : 'border-black/10 bg-white'} flex ${compact ? 'h-16 w-16 rounded-[16px] p-2 sm:h-20 sm:w-20 sm:rounded-[18px] sm:p-2.5' : 'h-20 w-20 rounded-[18px] p-2.5 sm:h-24 sm:w-24 sm:rounded-[20px] sm:p-3'} shrink-0 items-center justify-center border`}
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
          aria-label={`${university.name} logo initials`}
        >
          {getInitials(university.name)}
        </div>
      )}
    </div>
  );
}

function DetailSection({ title, icon, darkMode, className = '', children }) {
  return (
    <section
      className={`${darkMode ? 'border-white/10 bg-white/[0.055]' : 'border-black/10 bg-white/80'} min-w-0 overflow-hidden rounded-[22px] border p-4 ${className}`}
    >
      <h3 className="mb-3 flex items-center gap-2 text-sm font-black">
        <span className={darkMode ? 'text-amber-200' : 'text-amber-700'}>{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function credConfidenceTag(level, isFa) {
  if (level === 'official_university') return { text: isFa ? 'منبع رسمی دانشگاه' : 'Official university', tone: 'green' };
  if (level === 'official_authority') return { text: isFa ? 'مرجع رسمی' : 'Official authority', tone: 'green' };
  if (level === 'accreditation_body') return { text: isFa ? 'نهاد اعتبارسنجی' : 'Accreditation body', tone: 'green' };
  if (level === 'secondary_source') return { text: isFa ? 'نیازمند بررسی (منبع ثالث)' : 'Needs verification', tone: 'red' };
  return { text: isFa ? 'نیازمند بررسی' : 'Needs verification', tone: 'amber' };
}

// Up to 3 prioritized, source-verified credential badges for the university card.
function CredentialBadges({ credentials, darkMode, isFa }) {
  const badges = (credentials?.cardBadges || []).filter((b) => b.confidence !== 'low');
  if (!badges.length) {
    return (
      <span className={`${darkMode ? 'bg-white/5 text-white/50' : 'bg-black/[0.04] text-black/50'} inline-block rounded-[10px] px-3 py-1.5 text-[11px] font-bold`}>
        {isFa ? 'در منابع عمومی بررسی‌نشده' : 'Not publicly verified'}
      </span>
    );
  }
  const shown = badges.slice(0, 3);
  const extra = badges.length - shown.length;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {shown.map((b, i) => {
        const label = translateCredentialText(b.label, isFa);
        const scopeNote = translateCredentialText(b.scopeNote, isFa);
        const scoped = b.type === 'program_accreditation' && b.scopeNote && b.scopeNote.length <= 18
          ? `${label} · ${scopeNote}`
          : label;
        return (
          <span
            key={`${b.label}-${i}`}
            title={scopeNote ? `${label} — ${scopeNote}` : label}
            className="inline-flex items-center gap-1 rounded-[10px] border border-[#C6A768]/45 bg-[#C6A768]/15 px-2.5 py-1 text-[11px] font-black text-[#8a6a23]"
          >
            <Award size={12} />
            {scoped}
          </span>
        );
      })}
      {extra > 0 && (
        <span className={`${darkMode ? 'text-white/55' : 'text-black/55'} text-[11px] font-black`}>
          +{extra.toLocaleString(isFa ? 'fa' : 'en')} {isFa ? 'اعتبارنامه دیگر' : 'more'}
        </span>
      )}
    </div>
  );
}

function CredentialsSection({ credentials, darkMode, isFa, ui }) {
  const c = credentials;
  if (!c) return <MissingNotice darkMode={darkMode} text={ui.notRecorded} />;

  const av = (v) => (v === true ? (isFa ? 'دارد' : 'Yes') : v === false ? (isFa ? 'ندارد' : 'No') : (isFa ? 'نیازمند بررسی' : 'Needs verification'));
  const linkEl = (url, label) => (url ? (
    <a href={url} target="_blank" rel="noreferrer" className={`${darkMode ? 'text-amber-200' : 'text-amber-700'} inline-flex items-center gap-1 text-[11px] font-black`}>
      <ExternalLink size={11} />{label || (isFa ? 'منبع' : 'Source')}
    </a>
  ) : null);
  const tagEl = (level) => {
    const t = credConfidenceTag(level, isFa);
    const tone = t.tone === 'green'
      ? (darkMode ? 'bg-emerald-400/15 text-emerald-300' : 'bg-emerald-600/10 text-emerald-700')
      : t.tone === 'red'
        ? (darkMode ? 'bg-rose-400/15 text-rose-300' : 'bg-rose-600/10 text-rose-700')
        : (darkMode ? 'bg-amber-400/15 text-amber-200' : 'bg-amber-600/10 text-amber-700');
    return <span className={`${tone} rounded-[8px] px-2 py-0.5 text-[10px] font-black`}>{t.text}</span>;
  };
  const cardCls = `rounded-[14px] px-3 py-2.5 ${darkMode ? 'bg-white/[0.06]' : 'bg-black/[0.04]'}`;
  const sub = (t) => <h4 className={`${darkMode ? 'text-amber-200' : 'text-amber-800'} mb-2 mt-3 text-xs font-black first:mt-0`}>{t}</h4>;
  const note = (t) => <p className={`${darkMode ? 'text-white/45' : 'text-black/45'} text-[11px] font-medium leading-5`}>{translateCredentialText(t, isFa)}</p>;

  const ds = c.diplomaSupplement || {};
  const ects = c.ectsAndBologna || {};
  const er = c.erasmusAndExchange || {};
  const dq = c.dataQuality || {};
  const progs = c.programAccreditations || [];
  const insts = c.institutionalAccreditations || [];
  const quals = c.qualityCertificates || [];

  return (
    <div className="flex flex-col gap-2">
      {isFa && c.credentialSummaryFa && (
        <div className={`${darkMode ? 'bg-amber-400/[0.08] text-white/80' : 'bg-amber-600/[0.07] text-black/75'} rounded-[14px] px-3 py-2.5 text-xs font-bold leading-6`}>
          {translateCredentialText(c.credentialSummaryFa, isFa)}
        </div>
      )}

      {sub(isFa ? '۱) دیپلم و سیستم اعتبار اروپایی' : '1) European Diploma & Credit System')}
      <div className="grid gap-2 sm:grid-cols-2">
        {c.maviDiploma?.available === true && (
          <div className={cardCls}>
            <div className="flex items-center justify-between gap-2"><span className="text-xs font-black">{translateCredentialText(c.maviDiploma.displayName || 'Mavi / Blue Diploma', isFa)}</span>{tagEl(c.maviDiploma.verificationLevel)}</div>
            {c.maviDiploma.note && note(translateCredentialText(c.maviDiploma.note, isFa))}
            {linkEl(c.maviDiploma.sourceUrl)}
          </div>
        )}
        <div className={cardCls}>
          <div className="flex items-center justify-between gap-2"><span className="text-xs font-black">{isFa ? 'مکمل دیپلم' : 'Diploma Supplement'}</span><span className="text-[11px] font-black">{av(ds.available)}</span></div>
          {ds.officialName && note(translateCredentialText(ds.officialName, isFa))}
          <div className="mt-1 flex items-center justify-between gap-2">{ds.available === true ? tagEl(ds.verificationLevel) : <span />}{linkEl(ds.sourceUrl)}</div>
        </div>
        <div className={cardCls}>
          <div className="flex items-center justify-between gap-2"><span className="text-xs font-black">{isFa ? 'نشان مکمل دیپلم' : 'Diploma Supplement Label'}</span><span className="text-[11px] font-black">{ds.labelStatus === 'Diploma Supplement Label' ? (isFa ? 'دارد' : 'Yes') : (isFa ? 'ثبت‌نشده' : 'Not mentioned')}</span></div>
        </div>
        <div className={cardCls}>
          <div className="flex items-center justify-between gap-2"><span className="text-xs font-black">{isFa ? 'سامانه ECTS' : 'ECTS'}</span><span className="text-[11px] font-black">{ects.ectsLabel === true ? (isFa ? 'نشان ECTS' : 'ECTS Label') : av(ects.ectsCompatible)}</span></div>
          <div className="mt-1 flex items-center justify-between gap-2">{ects.ectsCompatible === true ? tagEl('official_university') : <span />}{linkEl(ects.sourceUrl)}</div>
        </div>
        <div className={cardCls}>
          <div className="flex items-center justify-between gap-2"><span className="text-xs font-black">{isFa ? 'فرایند بولونیا' : 'Bologna Process'}</span><span className="text-[11px] font-black">{av(ects.bolognaProcessMentioned)}</span></div>
        </div>
      </div>

      {sub(isFa ? '۲) تبادل و تحرک' : '2) Exchange & Mobility')}
      <div className={cardCls}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-black">Erasmus+{er.erasmusCharterOrECHE === true ? ' / ECHE' : ''}</span>
          <span className="text-[11px] font-black">{av(er.erasmusAvailable)}</span>
        </div>
        {(er.partnerUniversitiesCount || er.countriesCount) && note(`${isFa ? 'دانشگاه‌های همکار' : 'Partners'}: ${er.partnerUniversitiesCount || '—'}${er.countriesCount ? ` · ${isFa ? 'کشورها' : 'Countries'}: ${er.countriesCount}` : ''}`)}
        <div className="mt-1 flex items-center justify-between gap-2">{er.erasmusAvailable === true ? tagEl('official_university') : <span />}{linkEl(er.erasmusOfficeUrl || er.sourceUrl)}</div>
      </div>

      {sub(isFa ? '۳) اعتبارنامه‌های برنامه‌ای' : '3) Program Accreditations')}
      {progs.length ? (
        <div className="grid gap-2">
          {progs.map((p, i) => (
            <div key={`p${i}`} className={cardCls}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black">{translateCredentialText(p.accreditationName, isFa)}{(p.relatedFaculty || p.relatedProgram) ? ` — ${translateCredentialText(p.relatedFaculty || p.relatedProgram, isFa)}` : ''}</span>
                {tagEl(p.verificationLevel)}
              </div>
              {(p.accreditationBody || p.validUntil || p.validFrom) && note(`${translateCredentialText(p.accreditationBody, isFa) || ''}${p.validUntil ? ` · ${isFa ? 'اعتبار تا' : 'valid until'} ${p.validUntil}` : p.validFrom ? ` · ${isFa ? 'از' : 'since'} ${p.validFrom}` : ''}`)}
              {p.note && note(p.note)}
              {linkEl(p.sourceUrl)}
            </div>
          ))}
        </div>
      ) : (
        note(isFa ? 'اعتبارنامه برنامه‌ای قابل‌استناد در منابع عمومی تایید نشده است.' : 'No program accreditation publicly verified.')
      )}

      {sub(isFa ? '۴) اعتبار نهادی و گواهی کیفیت' : '4) Institutional & Quality')}
      {(insts.length || quals.length) ? (
        <div className="grid gap-2">
          {insts.map((it, i) => (
            <div key={`i${i}`} className={cardCls}>
              <div className="flex items-center justify-between gap-2"><span className="text-xs font-black">{translateCredentialText(it.name, isFa)}{it.scope ? ` · ${translateCredentialText(it.scope, isFa)}` : ''}</span>{tagEl(it.verificationLevel)}</div>
              {it.fullName && note(translateCredentialText(it.fullName, isFa))}
              {it.note && note(it.note)}
              {linkEl(it.sourceUrl)}
            </div>
          ))}
          {quals.map((q, i) => (
            <div key={`q${i}`} className={cardCls}>
              <div className="flex items-center justify-between gap-2"><span className="text-xs font-black">{translateCredentialText(q.certificateName, isFa)}{q.scope ? ` · ${translateCredentialText(q.scope, isFa)}` : ''}</span>{tagEl(q.verificationLevel)}</div>
              {q.certificateBody && note(translateCredentialText(q.certificateBody, isFa))}
              {linkEl(q.sourceUrl)}
            </div>
          ))}
        </div>
      ) : (
        note(isFa ? 'اعتبار نهادی یا گواهی کیفیت قابل‌استناد در منابع عمومی تایید نشده است.' : 'No institutional/quality certificate publicly verified.')
      )}

      {sub(isFa ? '۵) یادداشت‌ها و کیفیت داده' : '5) Notes & Data Quality')}
      <div className={cardCls}>
        {note(`${isFa ? 'سطح اطمینان داده' : 'Confidence'}: ${translateConfidence(dq.confidence, isFa) || '—'} · ${isFa ? 'نیاز به بررسی انسانی' : 'Needs human review'}: ${dq.needsHumanReview ? (isFa ? 'بله' : 'Yes') : (isFa ? 'خیر' : 'No')}`)}
        {(dq.missingData || []).length > 0 && note(`${isFa ? 'داده‌های ناقص' : 'Missing'}: ${(dq.missingData || []).map((item) => translateDataQualityItem(item, isFa)).join(isFa ? '، ' : ', ')}`)}
        {note(`${isFa ? 'آخرین بررسی' : 'Last checked'}: ${c.lastChecked || '—'}`)}
      </div>
    </div>
  );
}

function ChipList({ items, emptyText, darkMode, isFa }) {
  const visibleItems = (items || []).filter(Boolean);

  if (!visibleItems.length) {
    return <MissingNotice darkMode={darkMode} text={emptyText} />;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visibleItems.map((item) => (
        <FeatureBadge key={item} darkMode={darkMode}>
          {translateUiText(item, isFa)}
        </FeatureBadge>
      ))}
    </div>
  );
}

function MissingNotice({ text, darkMode }) {
  return (
    <div
      className={`${darkMode ? 'border-white/10 bg-white/5 text-white/55' : 'border-black/10 bg-black/[0.025] text-black/55'} rounded-[16px] border px-4 py-3 text-sm font-bold leading-6`}
    >
      {text}
    </div>
  );
}

function SmallBadge({ darkMode, children }) {
  return (
    <span className={`${darkMode ? 'bg-white/10 text-white/70' : 'bg-black/5 text-black/60'} rounded-full px-3 py-1 text-[11px] font-black`}>
      {children}
    </span>
  );
}

function FeatureBadge({ darkMode, children }) {
  return (
    <span
      className={`${darkMode ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100' : 'border-emerald-700/10 bg-emerald-600/10 text-emerald-800'} inline-flex max-w-full items-start gap-1 rounded-[14px] border px-3 py-1 text-[11px] font-black leading-5`}
    >
      <CheckCircle2 size={12} className="mt-0.5 shrink-0" />
      <span className="min-w-0 break-words">{children}</span>
    </span>
  );
}

function InfoPill({ label, value, meta, darkMode }) {
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
      {meta ? (
        <div className={`${darkMode ? 'text-white/35' : 'text-black/35'} mt-1 text-[10px] font-bold`}>
          {meta}
        </div>
      ) : null}
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
    .replace(/İ/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('');
}

const subjectFaLabels = {
  'Arts and Humanities': 'هنر و علوم انسانی',
  'Business and Economics': 'کسب‌وکار و اقتصاد',
  'Clinical and Health': 'علوم بالینی و سلامت',
  'Computer Science': 'علوم کامپیوتر',
  Education: 'آموزش',
  Engineering: 'مهندسی',
  'Life Sciences': 'علوم زیستی',
  'Physical Sciences': 'علوم فیزیکی',
  Psychology: 'روان‌شناسی',
  'Social Sciences': 'علوم اجتماعی',
};

const uiTextFaMap = {
  'THE Listed': 'دارای رتبه THE',
  'THE Profile': 'پروفایل THE',
  'THE: Not listed': 'در THE ثبت نشده',
  'Official Website': 'وب‌سایت رسمی',
  'Academic Calendar': 'تقویم آموزشی',
  'Clinical Signal': 'نشانه بالینی',
  'Official website available': 'وب‌سایت رسمی موجود است',
  'Academic calendar available': 'تقویم آموزشی موجود است',
  'Times Higher Education profile available': 'پروفایل Times Higher Education موجود است',
  'Multi-campus profile': 'چندکمپوسی',
  'Health or clinical campus signal': 'نشانه سلامت یا آموزش بالینی',
  'THE profile not found in selected public sources': 'پروفایل THE در منابع عمومی منتخب پیدا نشد',
};

const sourceFaLabels = {
  'Times Higher Education Profile': 'پروفایل Times Higher Education',
  'Official university website': 'وب‌سایت رسمی دانشگاه',
  'Academic calendar': 'تقویم آموزشی',
};

const dataQualityFaMap = {
  high: 'بالا',
  medium: 'متوسط',
  low: 'پایین',
  'THE profile not found in selected public sources': 'پروفایل THE در منابع عمومی منتخب پیدا نشد',
  'THE ranking rows not shown on profile': 'ردیف رتبه‌بندی THE در پروفایل نمایش داده نشده است',
  'student count not shown on THE profile': 'تعداد دانشجویان در پروفایل THE نمایش داده نشده است',
  'students per staff not shown on THE profile': 'نسبت دانشجو به استاد در پروفایل THE نمایش داده نشده است',
  'international student percentage not shown on THE profile': 'درصد دانشجویان بین‌المللی در پروفایل THE نمایش داده نشده است',
  'QS/CWUR/URAP ranking verification': 'بررسی رتبه‌بندی‌های QS/CWUR/URAP',
  'Erasmus+ office and partner counts': 'بررسی دفتر Erasmus+ و تعداد دانشگاه‌های همکار',
  'ECTS / Diploma Supplement verification': 'بررسی ECTS و مکمل دیپلم',
  'USMLE-related pathway verification': 'بررسی مسیرهای مرتبط با USMLE',
  'Accreditation and certificate program verification': 'بررسی اعتبارنامه‌ها و گواهی‌های برنامه‌ای',
  'Hospital / clinic / practical facility count verification': 'بررسی تعداد بیمارستان، کلینیک و امکانات عملی',
  'Mavi/Blue Diploma official confirmation': 'تایید رسمی دیپلم آبی / Mavi Diploma',
  'Diploma Supplement / Label verification': 'بررسی مکمل دیپلم و نشان آن',
  'ECTS & Bologna source verification': 'بررسی منبع ECTS و فرایند بولونیا',
  'Erasmus+ / ECHE office and counts': 'بررسی دفتر Erasmus+ / ECHE و تعداد همکاری‌ها',
  'Program & institutional accreditation verification': 'بررسی اعتبارنامه‌های برنامه‌ای و نهادی',
  'Not publicly verified': 'در منابع عمومی تایید نشده است',
};

const credentialFaMap = {
  'Mavi Diploma': 'دیپلم آبی / Mavi Diploma',
  'Mavi / Blue Diploma': 'دیپلم آبی / Mavi Diploma',
  'Blue Diploma': 'دیپلم آبی',
  'Diploma Supplement': 'مکمل دیپلم',
  'Diploma Supplement Label': 'نشان مکمل دیپلم',
  'Europass Diploma Supplement': 'مکمل دیپلم Europass',
  'Diploma Supplement (Europass)': 'مکمل دیپلم Europass',
  'ECTS Label': 'نشان ECTS',
  ECTS: 'سامانه ECTS',
  'Bologna Process': 'فرایند بولونیا',
  'Science & Letters / Humanities': 'علوم و ادبیات / علوم انسانی',
  'Quality Management': 'مدیریت کیفیت',
  'Medical Laboratories': 'آزمایشگاه‌های پزشکی',
  'Program quality': 'کیفیت برنامه',
  Medicine: 'پزشکی',
  Engineering: 'مهندسی',
  Psychology: 'روان‌شناسی',
  'Pearson Assured': 'تایید Pearson',
  'Association for Evaluation and Accreditation of Science & Letters Faculties': 'انجمن ارزیابی و اعتبارسنجی دانشکده‌های علوم و ادبیات',
  'Not publicly verified': 'در منابع عمومی تایید نشده است',
};

function rankingDisplayValue(item) {
  return item?.rankRange || item?.rank || '';
}

function formatRankingType(item, isFa) {
  if (!item) return '';

  if (item.rankingType === 'Subject Rankings') {
    const subject = item.subject ? `: ${translateSubject(item.subject, isFa)}` : '';
    return isFa ? `رتبه‌بندی موضوعی${subject}` : `Subject Ranking${subject}`;
  }

  if (item.rankingType === 'Impact Rankings') {
    return isFa ? 'رتبه‌بندی اثرگذاری' : 'Impact Rankings';
  }

  if (item.rankingType === 'World University Rankings') {
    return isFa ? 'رتبه‌بندی جهانی دانشگاه‌ها' : 'World University Rankings';
  }

  return item.rankingType;
}

function translateSubject(value, isFa) {
  if (!isFa) return value || '';
  return subjectFaLabels[value] || value || '';
}

function translateRankingCardLabel(label, isFa) {
  if (!isFa || !label) return label || '';

  const impactMatch = label.match(/^THE Impact:\s*(.+)$/);
  if (impactMatch) return `اثرگذاری THE: ${impactMatch[1]}`;

  const worldMatch = label.match(/^THE:\s*(.+)$/);
  if (worldMatch) return `رتبه جهانی THE: ${worldMatch[1]}`;

  const subjectMatch = label.match(/^THE\s+(.+):\s*(.+)$/);
  if (subjectMatch) return `${translateSubject(subjectMatch[1], true)} در THE: ${subjectMatch[2]}`;

  return translateUiText(label, isFa);
}

function translateUiText(value, isFa) {
  if (!isFa) return value || '';
  const text = String(value || '');
  if (!text) return '';
  if (uiTextFaMap[text]) return uiTextFaMap[text];

  const programsMatch = text.match(/^(\d+)\+?\s+Programs$/);
  if (programsMatch) {
    const suffix = text.includes('+') ? '+' : '';
    return `${formatNumber(programsMatch[1], true)}${suffix} رشته`;
  }

  const campusesMatch = text.match(/^(\d+)\s+Campuses$/);
  if (campusesMatch) return `${formatNumber(campusesMatch[1], true)} کمپوس`;

  return text
    .replace(/\bMedicine:/g, 'پزشکی:')
    .replace(/\bCampus\b/g, 'کمپوس')
    .replace(/\bCampuses\b/g, 'کمپوس‌ها')
    .replace(/\bPrograms\b/g, 'رشته‌ها')
    .replace(/\bProgram\b/g, 'رشته');
}

function translateSourceLabel(value, isFa) {
  if (!isFa) return value || '';
  return sourceFaLabels[value] || translateUiText(value, true);
}

function translateConfidence(value, isFa) {
  if (!isFa) return value || '';
  return dataQualityFaMap[value] || value || '';
}

function translateDataQualityItem(value, isFa) {
  if (!isFa) return value || '';
  const text = String(value || '');
  return dataQualityFaMap[text] || translateCredentialText(text, true);
}

function translateCredentialText(value, isFa) {
  if (!isFa) return value || '';
  const text = String(value || '');
  if (!text) return '';
  if (credentialFaMap[text]) return credentialFaMap[text];

  return text
    .replace(/Not publicly verified/g, 'در منابع عمومی تایید نشده است')
    .replace(/Diploma Supplement Label/g, 'نشان مکمل دیپلم')
    .replace(/Diploma Supplement/g, 'مکمل دیپلم')
    .replace(/Blue Diploma/g, 'دیپلم آبی')
    .replace(/Bologna Process/g, 'فرایند بولونیا')
    .replace(/ECTS Label/g, 'نشان ECTS');
}

function getTheProfileFactCards(profileFacts, isFa = false) {
  if (!profileFacts) return [];

  return [
    profileFacts.internationalStudentsPercent
      ? { label: isFa ? 'دانشجویان بین‌المللی' : 'Intl. Students', value: profileFacts.internationalStudentsPercent }
      : null,
    profileFacts.studentsPerStaff
      ? { label: isFa ? 'نسبت دانشجو به استاد' : 'Students/Staff', value: profileFacts.studentsPerStaff }
      : null,
    profileFacts.studentCount
      ? { label: isFa ? 'تعداد دانشجویان' : 'Students', value: profileFacts.studentCount }
      : null,
    profileFacts.femaleMaleRatio
      ? { label: isFa ? 'سهم دانشجویان زن' : 'Female Students', value: profileFacts.femaleMaleRatio }
      : null,
  ].filter(Boolean);
}

function formatDataValue(value, isFa, ui) {
  if (value === null || value === undefined || value === '' || value === 'Not publicly available') {
    return ui.notRecorded;
  }

  return formatNumber(value, isFa);
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
  if (value === 'Istanbul' || value === 'İstanbul') return 'استانبول';
  return value;
}

function sortUniversities(a, b, sortMode) {
  if (sortMode === 'worldRankAsc') {
    return compareNullableNumber(getRankingSortValue(a, 'World University Rankings'), getRankingSortValue(b, 'World University Rankings'), 'asc')
      || fallbackNameSort(a, b);
  }

  if (sortMode === 'worldRankDesc') {
    return compareNullableNumber(getRankingSortValue(a, 'World University Rankings'), getRankingSortValue(b, 'World University Rankings'), 'desc')
      || fallbackNameSort(a, b);
  }

  if (sortMode === 'impactRankAsc') {
    return compareNullableNumber(getRankingSortValue(a, 'Impact Rankings'), getRankingSortValue(b, 'Impact Rankings'), 'asc')
      || fallbackNameSort(a, b);
  }

  if (sortMode === 'impactRankDesc') {
    return compareNullableNumber(getRankingSortValue(a, 'Impact Rankings'), getRankingSortValue(b, 'Impact Rankings'), 'desc')
      || fallbackNameSort(a, b);
  }

  if (sortMode === 'foundedAsc' || sortMode === 'oldest') {
    return compareNullableNumber(parseYearValue(a.foundedIn), parseYearValue(b.foundedIn), 'asc')
      || fallbackNameSort(a, b);
  }

  if (sortMode === 'foundedDesc') {
    return compareNullableNumber(parseYearValue(a.foundedIn), parseYearValue(b.foundedIn), 'desc')
      || fallbackNameSort(a, b);
  }

  if (sortMode === 'programsDesc' || sortMode === 'programs') {
    return compareNumber(Number(a.programsCount || 0), Number(b.programsCount || 0), 'desc')
      || fallbackNameSort(a, b);
  }

  if (sortMode === 'programsAsc') {
    return compareNumber(Number(a.programsCount || 0), Number(b.programsCount || 0), 'asc')
      || fallbackNameSort(a, b);
  }

  if (sortMode === 'campusesDesc') {
    return compareNumber((a.campuses || []).filter(Boolean).length, (b.campuses || []).filter(Boolean).length, 'desc')
      || fallbackNameSort(a, b);
  }

  if (sortMode === 'campusesAsc') {
    return compareNumber((a.campuses || []).filter(Boolean).length, (b.campuses || []).filter(Boolean).length, 'asc')
      || fallbackNameSort(a, b);
  }

  if (sortMode === 'announcementsDesc') {
    return compareNumber(Number(a.announcementsCount || 0), Number(b.announcementsCount || 0), 'desc')
      || fallbackNameSort(a, b);
  }

  if (sortMode === 'announcementsAsc') {
    return compareNumber(Number(a.announcementsCount || 0), Number(b.announcementsCount || 0), 'asc')
      || fallbackNameSort(a, b);
  }

  if (sortMode === 'name') {
    return fallbackNameSort(a, b);
  }

  const bScore = scoreUniversity(b);
  const aScore = scoreUniversity(a);
  return bScore - aScore || fallbackNameSort(a, b);
}

function fallbackNameSort(a, b) {
  return String(a.name).localeCompare(String(b.name));
}

function compareNumber(aValue, bValue, direction) {
  return direction === 'asc' ? aValue - bValue : bValue - aValue;
}

function compareNullableNumber(aValue, bValue, direction) {
  const aMissing = !Number.isFinite(aValue);
  const bMissing = !Number.isFinite(bValue);

  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;

  return compareNumber(aValue, bValue, direction);
}

function parseYearValue(value) {
  const match = String(value || '').match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

function getRankingSortValue(university, rankingType) {
  const rankings = university.decisionProfile?.rankingSummary?.items || [];
  const values = rankings
    .filter((item) => item.rankingType === rankingType)
    .map(parseRankingValue)
    .filter(Number.isFinite);

  return values.length ? Math.min(...values) : null;
}

function parseRankingValue(item) {
  const raw = rankingDisplayValue(item);
  const match = String(raw || '').replace(/,/g, '').match(/\d+/);
  return match ? Number(match[0]) : null;
}

function scoreUniversity(university) {
  const profile = university.decisionProfile;
  const filters = profile?.filters || {};

  return [
    filters.hasWorldRanking ? 7 : 0,
    filters.hasImpactRanking ? 5 : 0,
    filters.hasSubjectRanking ? 4 : 0,
    filters.hasVerifiedCredentials ? 4 : 0,
    filters.highProgramCount ? 3 : 0,
    filters.hasAcademicCalendar ? 2 : 0,
    filters.multiCampus ? 1 : 0,
    filters.medicalSignal ? 1 : 0,
  ].reduce((sum, value) => sum + value, 0);
}
