import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  BookOpen,
  Building2,
  ExternalLink,
  GraduationCap,
  MapPin,
  Moon,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { BackButton, MainNav } from '../SiteNav';
import { istanbulUniversities } from '../../data/istanbulUniversities';

const ISTANBUL_BOUNDS = {
  latMin: 40.78,
  latMax: 41.27,
  lonMin: 28.5,
  lonMax: 29.66,
};

const MAP_WIDTH = 72;
const MAP_DEPTH = 36;

const GEO_POINTS = [
  ['Istanbul Galata University', 41.029, 28.974, 'Beyoglu', 'europe'],
  ['Bezmialem Vakif University', 41.017, 28.941, 'Fatih', 'europe'],
  ['Fatih Sultan Mehmet Vakif University', 41.053, 28.944, 'Beyoglu', 'europe'],
  ['Dogus University', 41.014, 29.133, 'Umraniye', 'asia'],
  ['Istanbul Ticaret University', 41.056, 28.946, 'Sutluce', 'europe'],
  ['Koc University', 41.205, 29.074, 'Sariyer', 'europe'],
  ['Ibn Haldun University', 41.095, 28.786, 'Basaksehir', 'europe'],
  ['Sabanci University', 40.891, 29.377, 'Tuzla', 'asia'],
  ['Kadir Has University', 41.025, 28.958, 'Cibali', 'europe'],
  ['Istanbul Esenyurt University', 41.034, 28.675, 'Esenyurt', 'europe'],
  ['Fenerbahce University', 40.993, 29.125, 'Atasehir', 'asia'],
  ['Istanbul Gedik University', 40.898, 29.235, 'Kartal / Pendik', 'asia'],
  ['Istanbul Topkapi University', 40.994, 28.917, 'Zeytinburnu', 'europe'],
  ['Yeditepe University', 40.972, 29.152, 'Atasehir', 'asia'],
  ['Uskudar University', 41.023, 29.043, 'Uskudar', 'asia'],
  ['Ozyegin University', 41.032, 29.255, 'Cekmekoy', 'asia'],
  ['Okan University', 40.873, 29.323, 'Tuzla', 'asia'],
  ['Istanbul Nisantasi University', 41.111, 29.017, 'Maslak', 'europe'],
  ['Maltepe University', 40.958, 29.19, 'Maltepe', 'asia'],
  ['Istinye University', 41.112, 28.988, 'Vadi Istanbul', 'europe'],
  ['Istanbul Yeni Yuzyil University', 41.018, 28.913, 'Zeytinburnu', 'europe'],
  ['Istanbul Sabahattin Zaim University', 41.034, 28.787, 'Halkali', 'europe'],
  ['Istanbul Medipol University', 41.094, 29.094, 'Kavacik', 'asia'],
  ['Istanbul Kultur University', 40.995, 28.84, 'Bakirkoy', 'europe'],
  ['Istanbul Kent University', 41.034, 28.982, 'Cihangir', 'europe'],
  ['Istanbul Gelisim University', 41.013, 28.724, 'Avcilar', 'europe'],
  ['Istanbul Bilgi University', 41.067, 28.946, 'Eyupsultan', 'europe'],
  ['Istanbul Aydin University', 40.995, 28.797, 'Kucukcekmece', 'europe'],
  ['Istanbul Atlas University', 41.085, 28.978, 'Kagithane', 'europe'],
  ['Istanbul Arel University', 41.053, 28.568, 'Tepekent', 'europe'],
  ['Isik University', 41.176, 29.613, 'Sile', 'asia'],
  ['Halic University', 41.073, 28.948, 'Eyupsultan', 'europe'],
  ['Biruni University', 41.019, 28.912, 'Zeytinburnu', 'europe'],
  ['Beykoz University', 41.091, 29.094, 'Beykoz', 'asia'],
  ['Beykent University', 41.02, 28.593, 'Buyukcekmece', 'europe'],
  ['Bahcesehir University', 41.043, 29.009, 'Besiktas', 'europe'],
  ['Altinbas University', 41.055, 28.824, 'Bagcilar', 'europe'],
].reduce((map, [name, lat, lon, district, side]) => {
  map.set(normalizeKey(name), { lat, lon, district, side });
  return map;
}, new Map());

const copy = {
  fa: {
    navLabel: 'نقشه 3D',
    eyebrow: 'Istanbul University Atlas',
    title: 'نقشه سه بعدی دانشگاه های استانبول',
    subtitle:
      'یک نمای تعاملی از دانشگاه های موجود در دیتابیس ACCA EDU؛ استانبول اروپایی و آسیایی در یک صحنه سه بعدی، با خلاصه سریع و لینک مستقیم به پروفایل هر دانشگاه.',
    search: 'جستجوی دانشگاه یا منطقه...',
    all: 'همه',
    europe: 'اروپایی',
    asia: 'آسیایی',
    reset: 'بازنشانی نما',
    consult: 'مشاوره',
    details: 'مشاهده پروفایل کامل',
    programs: 'رشته ها و شهریه ها',
    universities: 'دانشگاه',
    programsCount: 'رشته',
    campuses: 'کمپوس',
    dragHint: 'برای چرخاندن نقشه درگ کنید؛ برای زوم اسکرول کنید؛ روی پین ها کلیک کنید.',
    sideLabel: 'بخش',
    districtLabel: 'محدوده',
    selectedTitle: 'پروفایل سریع دانشگاه',
    listTitle: 'دانشگاه های روی نقشه',
    empty: 'دانشگاهی با این جستجو پیدا نشد.',
    sourceNote: 'موقعیت ها برای نمایش بصری تقریبی هستند؛ اطلاعات پروفایل از دیتابیس داخلی سایت خوانده می شود.',
  },
  en: {
    navLabel: '3D Map',
    eyebrow: 'Istanbul University Atlas',
    title: '3D Istanbul University Map',
    subtitle:
      'An interactive view of the universities in the ACCA EDU database; European and Asian Istanbul in one draggable 3D scene with quick profile cards.',
    search: 'Search university or district...',
    all: 'All',
    europe: 'European',
    asia: 'Asian',
    reset: 'Reset view',
    consult: 'Consult',
    details: 'Open full profile',
    programs: 'Programs & tuition',
    universities: 'universities',
    programsCount: 'programs',
    campuses: 'campuses',
    dragHint: 'Drag to move across the city, scroll to zoom, and hold Shift while dragging to rotate.',
    sideLabel: 'Side',
    districtLabel: 'Area',
    selectedTitle: 'Quick university profile',
    listTitle: 'Universities on the map',
    empty: 'No university matched this search.',
    sourceNote: 'Locations are approximate for visual navigation; profile data is loaded from the site database.',
    mapControls: 'Map controls',
    openControls: 'Open controls',
    minimize: 'Minimize',
    openProfile: 'Open profile',
    close: 'Close',
  },
};

export default function IstanbulUniversityMapPage({
  darkMode,
  isFa,
  ACCA_LOGO_SRC,
  onConsultationClick,
  onToggleDarkMode,
  onToggleLanguage,
}) {
  const canvasRef = useRef(null);
  const sceneApiRef = useRef(null);
  const [sideFilter, setSideFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const ui = isFa ? copy.fa : copy.en;

  const mapItems = useMemo(() => createMapItems(), []);
  const [selectedId, setSelectedId] = useState(() => mapItems[0]?.id || '');
  const selected = useMemo(
    () => mapItems.find((item) => item.id === selectedId) || mapItems[0],
    [mapItems, selectedId]
  );

  const visibleItems = useMemo(() => {
    const normalizedQuery = normalizeKey(query);
    return mapItems.filter((item) => {
      const matchesSide = sideFilter === 'all' || item.side === sideFilter;
      const matchesSearch = !normalizedQuery || normalizeKey([
        item.name,
        item.district,
        item.address,
        item.side,
      ].join(' ')).includes(normalizedQuery);
      return matchesSide && matchesSearch;
    });
  }, [mapItems, query, sideFilter]);

  const stats = useMemo(() => {
    const europe = mapItems.filter((item) => item.side === 'europe').length;
    const asia = mapItems.length - europe;
    const programs = mapItems.reduce((total, item) => total + Number(item.programsCount || 0), 0);
    return { europe, asia, programs };
  }, [mapItems]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    return initIstanbulScene({
      canvas,
      darkMode,
      items: mapItems,
      onPick: (id) => {
        setSelectedId(id);
        setProfileOpen(true);
      },
      apiRef: sceneApiRef,
    });
  }, [darkMode, mapItems]);

  const handleSelect = (id) => {
    setSelectedId(id);
    setProfileOpen(true);
    sceneApiRef.current?.focusUniversity(id);
  };

  const handleReset = () => {
    sceneApiRef.current?.resetView();
  };

  return (
    <div
      className={`${darkMode ? 'bg-[#061018] text-white' : 'bg-[#EAF6F8] text-[#071A3D]'} relative min-h-screen overflow-hidden`}
      dir={isFa ? 'rtl' : 'ltr'}
    >
      <canvas
        ref={canvasRef}
        data-istanbul-map-canvas
        aria-label={isFa ? 'نقشه سه بعدی دانشگاه های استانبول' : '3D map of Istanbul universities'}
        className="absolute inset-0 h-full min-h-screen w-full touch-none"
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${
          darkMode
            ? 'bg-[linear-gradient(180deg,rgba(1,8,20,0.10)_0%,rgba(1,8,20,0.00)_38%,rgba(1,8,20,0.70)_100%)]'
            : 'bg-[linear-gradient(180deg,rgba(234,246,248,0.08)_0%,rgba(234,246,248,0.00)_44%,rgba(234,246,248,0.62)_100%)]'
        }`}
      />

      <header className="pointer-events-none fixed left-0 right-0 top-0 z-30 px-3 py-3 sm:px-6 sm:py-4">
        <div
          className={`${darkMode ? 'border-white/10 bg-[#071A3D]/70 text-white' : 'border-white/80 bg-white/72 text-[#071A3D]'} pointer-events-auto mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-[26px] border px-3 py-3 shadow-[0_22px_80px_rgba(7,26,61,0.16)] backdrop-blur-2xl sm:rounded-full sm:px-6`}
        >
          <div className="flex min-w-0 items-center gap-2">
            <a href="/" aria-label={isFa ? 'بازگشت به صفحه اصلی ACCA EDU' : 'Back to ACCA EDU home'}>
              <img
                src={ACCA_LOGO_SRC}
                alt="ACCA EDU Logo"
                width="150"
                height="42"
                className="h-9 w-auto object-contain sm:h-10"
              />
            </a>
            <BackButton fallback="/" isFa={isFa} darkMode={darkMode} className="hidden sm:inline-flex" />
          </div>

          <MainNav active="istanbul-map" isFa={isFa} darkMode={darkMode} />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleLanguage}
              className={`${darkMode ? 'bg-white text-black' : 'bg-[#071A3D] text-white'} h-10 rounded-full px-4 text-xs font-black transition hover:scale-[1.03] sm:h-11 sm:px-5 sm:text-sm`}
            >
              {isFa ? 'EN' : 'FA'}
            </button>
            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label={darkMode ? 'Light mode' : 'Dark mode'}
              className={`${darkMode ? 'bg-white text-black' : 'bg-[#071A3D] text-white'} grid h-10 w-10 place-items-center rounded-full transition hover:scale-[1.03] sm:h-11 sm:w-11`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="pointer-events-none fixed inset-0 z-10 px-3 pb-3 pt-24 sm:px-6 sm:pb-6 sm:pt-28">
        <section className={`pointer-events-auto ${isFa ? 'ml-auto' : 'mr-auto'} w-full max-w-[430px]`}>
          {overviewOpen ? (
            <div className={`${darkMode ? 'border-white/12 bg-[#061018]/72' : 'border-white/75 bg-white/72'} max-h-[58vh] overflow-hidden rounded-[24px] border p-3 shadow-[0_22px_80px_rgba(7,26,61,0.18)] backdrop-blur-2xl sm:max-h-[66vh] sm:p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className={`${darkMode ? 'text-emerald-200' : 'text-emerald-700'} text-[10px] font-black uppercase tracking-[0.28em]`}>
                    {ui.eyebrow}
                  </div>
                  <h1 className="mt-2 text-xl font-black leading-tight sm:text-2xl">
                    {ui.title}
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={() => setOverviewOpen(false)}
                  aria-label={ui.minimize || (isFa ? 'جمع کردن پنل' : 'Minimize')}
                  className={`${darkMode ? 'bg-white/10 text-white' : 'bg-[#071A3D]/[0.06] text-[#071A3D]'} grid h-9 w-9 shrink-0 place-items-center rounded-full transition hover:scale-[1.04]`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-1.5">
                <MetricCard label={ui.universities} value={mapItems.length} darkMode={darkMode} isFa={isFa} />
                <MetricCard label={ui.europe} value={stats.europe} darkMode={darkMode} isFa={isFa} />
                <MetricCard label={ui.asia} value={stats.asia} darkMode={darkMode} isFa={isFa} />
              </div>

              <div className={`${darkMode ? 'bg-white/8' : 'bg-[#071A3D]/[0.04]'} mt-3 rounded-[18px] p-2`}>
                <div className="flex items-center gap-2 rounded-[14px] bg-white px-3 py-2 text-[#071A3D] shadow-[0_10px_26px_rgba(7,26,61,0.08)]">
                  <Search size={16} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={ui.search}
                    className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-[#071A3D]/42"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      aria-label="Clear search"
                      className="grid h-7 w-7 place-items-center rounded-full bg-[#071A3D]/5 text-[#071A3D]"
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                </div>

                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {['all', 'europe', 'asia'].map((side) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => setSideFilter(side)}
                      className={`min-h-9 rounded-[13px] px-2 text-xs font-black transition ${
                        sideFilter === side
                          ? 'bg-[#071A3D] text-white'
                          : darkMode
                            ? 'bg-white/8 text-white/72 hover:bg-white/12'
                            : 'bg-white/84 text-[#071A3D]/72 hover:bg-white'
                      }`}
                    >
                      {ui[side]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <p className={`${darkMode ? 'text-white/50' : 'text-[#071A3D]/55'} hidden text-[11px] font-bold leading-5 sm:block`}>
                  {isFa ? 'نقشه را درگ کنید تا روی شهر حرکت کنید؛ برای زوم اسکرول کنید؛ برای چرخش Shift را نگه دارید.' : ui.dragHint}
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className={`${darkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-[#071A3D]/[0.06] text-[#071A3D] hover:bg-[#071A3D]/10'} inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3 text-xs font-black transition`}
                >
                  <RotateCcw size={14} />
                  {ui.reset}
                </button>
              </div>

              <div className="mt-2 hidden max-h-[22vh] overflow-y-auto rounded-[18px] md:block">
                {visibleItems.length ? visibleItems.slice(0, 12).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`mt-1 flex w-full items-center justify-between gap-3 rounded-[15px] px-3 py-2 text-start transition ${
                      selected?.id === item.id
                        ? 'bg-[#071A3D] text-white'
                        : darkMode
                          ? 'text-white/72 hover:bg-white/10'
                          : 'text-[#071A3D]/74 hover:bg-[#071A3D]/[0.05]'
                    }`}
                  >
                    <span className="min-w-0 truncate text-xs font-black">{item.name}</span>
                    <span className="shrink-0 text-[10px] font-bold opacity-70">{item.district}</span>
                  </button>
                )) : (
                  <div className="px-3 py-4 text-sm font-bold opacity-60">{ui.empty}</div>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setOverviewOpen(true)}
              className={`${darkMode ? 'border-white/12 bg-[#061018]/68 text-white' : 'border-white/80 bg-white/72 text-[#071A3D]'} inline-flex max-w-full items-center gap-3 rounded-full border px-3 py-2.5 shadow-[0_16px_52px_rgba(7,26,61,0.16)] backdrop-blur-2xl transition hover:scale-[1.02]`}
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#071A3D] text-white">
                <MapPin size={16} />
              </span>
              <span className="min-w-0 text-start">
                <span className="block truncate text-sm font-black">{ui.mapControls || (isFa ? 'کنترل نقشه' : 'Map controls')}</span>
                <span className="block text-[11px] font-bold opacity-65">{formatNumber(mapItems.length, isFa)} {ui.universities}</span>
              </span>
            </button>
          )}
        </section>

        <aside className={`pointer-events-auto absolute bottom-3 ${isFa ? 'left-3' : 'right-3'} w-[min(430px,calc(100vw-24px))] sm:bottom-6 ${isFa ? 'sm:left-6' : 'sm:right-6'}`}>
          {profileOpen ? (
            <SelectedUniversityCard
              darkMode={darkMode}
              isFa={isFa}
              ui={ui}
              item={selected}
              onConsultationClick={onConsultationClick}
              onMinimize={() => setProfileOpen(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className={`${darkMode ? 'border-white/12 bg-[#061018]/70 text-white' : 'border-white/80 bg-white/76 text-[#071A3D]'} flex w-full items-center justify-between gap-3 rounded-[22px] border px-3 py-2.5 shadow-[0_18px_58px_rgba(7,26,61,0.18)] backdrop-blur-2xl transition hover:scale-[1.01]`}
            >
              <span className="min-w-0 text-start">
                <span className="block truncate text-sm font-black">{selected?.name}</span>
                <span className="mt-0.5 block truncate text-[11px] font-bold opacity-65">{selected?.district} · {selected ? ui[selected.side] : ''}</span>
              </span>
              <span className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-[#071A3D] px-3 text-xs font-black text-white">
                {ui.openProfile || (isFa ? 'باز کردن پروفایل' : 'Open profile')}
              </span>
            </button>
          )}
        </aside>
      </main>
    </div>
  );
}

function MetricCard({ label, value, darkMode, isFa }) {
  return (
    <div className={`${darkMode ? 'border-white/10 bg-white/8' : 'border-white/70 bg-white/78'} rounded-[15px] border px-2 py-2.5 text-center`}>
      <div className="text-lg font-black sm:text-xl">{formatNumber(value, isFa)}</div>
      <div className="mt-0.5 text-[9px] font-black uppercase tracking-wide opacity-60">{label}</div>
    </div>
  );
}

function SelectedUniversityCard({ darkMode, isFa, ui, item, onConsultationClick, onMinimize }) {
  if (!item) return null;

  const summary = isFa ? item.summaryFa : item.summaryEn;
  const campuses = item.campusesCount || 1;

  return (
    <article
      data-selected-university-card
      className={`${darkMode ? 'border-white/12 bg-[#061018]/74 text-white' : 'border-white/80 bg-white/78 text-[#071A3D]'} max-h-[38vh] overflow-y-auto rounded-[24px] border p-3 shadow-[0_24px_82px_rgba(7,26,61,0.22)] backdrop-blur-2xl sm:max-h-[52vh] sm:p-4`}
    >
      <div className="flex items-start gap-3">
        <div className={`${darkMode ? 'bg-white text-[#071A3D]' : 'bg-[#071A3D] text-white'} grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[16px] sm:h-14 sm:w-14`}>
          {item.logo ? (
            <img src={item.logo} alt={`${item.name} logo`} className="h-full w-full object-contain p-2" loading="lazy" />
          ) : (
            <Building2 size={24} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className={`${darkMode ? 'text-amber-200' : 'text-amber-700'} flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]`}>
              <Sparkles size={13} />
              <span className="truncate">{ui.selectedTitle}</span>
            </div>
            <button
              type="button"
              onClick={onMinimize}
              aria-label={ui.minimize || (isFa ? 'جمع کردن پنل' : 'Minimize')}
              className={`${darkMode ? 'bg-white/10 text-white' : 'bg-[#071A3D]/[0.06] text-[#071A3D]'} grid h-8 w-8 shrink-0 place-items-center rounded-full transition hover:scale-[1.04]`}
            >
              <X size={14} />
            </button>
          </div>
          <h2 className="mt-1.5 text-lg font-black leading-6 sm:text-xl">{item.name}</h2>
          <div className={`${darkMode ? 'text-white/58' : 'text-[#071A3D]/58'} mt-2 flex flex-wrap items-center gap-2 text-xs font-black`}>
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} />
              {item.district}
            </span>
            <span>{ui.sideLabel}: {ui[item.side]}</span>
          </div>
        </div>
      </div>

      <p className={`${darkMode ? 'text-white/66' : 'text-[#071A3D]/68'} mt-3 line-clamp-3 text-sm font-medium leading-6 sm:line-clamp-4`}>
        {summary}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniFact icon={<GraduationCap size={17} />} label={ui.programsCount} value={item.programsCount || 0} darkMode={darkMode} isFa={isFa} />
        <MiniFact icon={<Building2 size={17} />} label={ui.campuses} value={campuses} darkMode={darkMode} isFa={isFa} />
        <MiniFact icon={<MapPin size={17} />} label={ui.districtLabel} value={item.district} darkMode={darkMode} isFa={isFa} compact />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <a
          href={item.profileHref}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[15px] bg-[#071A3D] px-4 py-2.5 text-center text-xs font-black text-white transition hover:scale-[1.02] sm:text-sm"
        >
          <ExternalLink size={16} />
          {ui.details}
        </a>
        <a
          href={item.programsHref}
          className={`${darkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-[#071A3D]/[0.06] text-[#071A3D] hover:bg-[#071A3D]/10'} inline-flex min-h-11 items-center justify-center gap-2 rounded-[15px] px-4 py-2.5 text-center text-xs font-black transition sm:text-sm`}
        >
          <BookOpen size={16} />
          {ui.programs}
        </a>
      </div>

      <button
        type="button"
        onClick={onConsultationClick}
        className={`${darkMode ? 'border-white/14 text-white/74 hover:bg-white/10' : 'border-[#071A3D]/10 text-[#071A3D]/70 hover:bg-[#071A3D]/[0.04]'} mt-2 inline-flex min-h-10 w-full items-center justify-center rounded-[15px] border px-4 text-xs font-black transition sm:text-sm`}
      >
        {ui.consult}
      </button>

      <p className={`${darkMode ? 'text-white/42' : 'text-[#071A3D]/48'} mt-2 hidden text-[11px] font-bold leading-5 sm:block`}>
        {ui.sourceNote}
      </p>
    </article>
  );
}

function MiniFact({ icon, label, value, darkMode, isFa, compact = false }) {
  return (
    <div className={`${darkMode ? 'bg-white/8' : 'bg-[#071A3D]/[0.045]'} min-w-0 rounded-[16px] px-3 py-3`}>
      <div className="flex items-center justify-center opacity-72">{icon}</div>
      <div className={`${compact ? 'truncate text-xs' : 'text-lg'} mt-1 text-center font-black`}>{formatNumber(value, isFa)}</div>
      <div className="mt-1 truncate text-center text-[10px] font-black uppercase tracking-wide opacity-55">{label}</div>
    </div>
  );
}

function createMapItems() {
  return istanbulUniversities.map((university, index) => {
    const geo = findGeo(university.name, index);
    const coords = projectGeo(geo.lat, geo.lon);
    const campuses = (university.campuses || []).filter(Boolean);
    const profileValue = university.slug || university.name;

    return {
      id: university.id || university.slug || university.name,
      name: university.name,
      logo: university.logo,
      lat: geo.lat,
      lon: geo.lon,
      x: coords.x,
      z: coords.z,
      side: geo.side,
      district: geo.district,
      address: university.address || campuses[0] || '',
      programsCount: Number(university.programsCount || 0),
      campusesCount: campuses.length || 1,
      summaryFa: university.decisionProfile?.microSummaryFa || university.address || university.name,
      summaryEn: university.decisionProfile?.microSummaryEn || university.address || university.name,
      profileHref: `?page=universities&profile=${encodeURIComponent(profileValue)}`,
      programsHref: `?page=programs&university=${encodeURIComponent(university.name)}`,
    };
  });
}

function initIstanbulScene({ canvas, darkMode, items, onPick, apiRef }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(darkMode ? 0x07111d : 0xbfeaf5);
  scene.fog = new THREE.FogExp2(darkMode ? 0x07111d : 0xd6f4f8, darkMode ? 0.012 : 0.007);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));

  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 220);
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const state = {
    yaw: -0.55,
    pitch: 0.78,
    distance: 70,
    target: new THREE.Vector3(0, 0, 0),
    targetGoal: new THREE.Vector3(0, 0, 0),
    selectedId: items[0]?.id || '',
    startTime: performance.now(),
  };

  const markerPickables = [];
  const markersById = new Map();
  const animatedRings = [];

  addLights(scene, darkMode);
  const cloudRig = createCloudRig(scene, darkMode);
  createTerrain(scene, darkMode);
  createForestClusters(scene, darkMode);
  createCityBlocks(scene, darkMode);
  createRoadsAndBridges(scene, darkMode);
  createUniversityMarkers({
    scene,
    items,
    markersById,
    markerPickables,
    animatedRings,
    darkMode,
  });

  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let animationFrame = 0;
  let isDragging = false;
  let pointerDown = null;

  const resize = () => {
    const width = Math.max(canvas.clientWidth || window.innerWidth, 1);
    const height = Math.max(canvas.clientHeight || window.innerHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const updateCamera = (introProgress = 1) => {
    state.target.lerp(state.targetGoal, 0.055);
    const easedIntro = easeOutCubic(introProgress);
    const distance = state.distance + (1 - easedIntro) * 28;
    const phi = THREE.MathUtils.clamp(state.pitch - (1 - easedIntro) * 0.28, 0.34, 1.24);
    const x = state.target.x + distance * Math.sin(phi) * Math.sin(state.yaw);
    const y = state.target.y + distance * Math.cos(phi) + (1 - easedIntro) * 26;
    const z = state.target.z + distance * Math.sin(phi) * Math.cos(state.yaw);
    camera.position.set(x, y, z);
    camera.lookAt(state.target.x, state.target.y + 0.8, state.target.z);
  };

  const focusUniversity = (id) => {
    const marker = markersById.get(id);
    if (!marker) return;
    state.selectedId = id;
    state.targetGoal.set(marker.position.x, 0.3, marker.position.z);
    state.distance = THREE.MathUtils.clamp(state.distance, 34, 54);
  };

  const resetView = () => {
    state.yaw = -0.55;
    state.pitch = 0.78;
    state.distance = 70;
    state.targetGoal.set(0, 0, 0);
  };

  apiRef.current = { focusUniversity, resetView };

  const pickMarker = (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(markerPickables, true)
      .find((entry) => entry.object.userData.markerId);
    return hit?.object.userData.markerId || '';
  };

  const handlePointerDown = (event) => {
    isDragging = true;
    pointerDown = {
      x: event.clientX,
      y: event.clientY,
      yaw: state.yaw,
      pitch: state.pitch,
      targetX: state.targetGoal.x,
      targetZ: state.targetGoal.z,
      moved: false,
    };
    canvas.setPointerCapture?.(event.pointerId);
    canvas.style.cursor = 'grabbing';
  };

  const handlePointerMove = (event) => {
    if (!isDragging || !pointerDown) {
      canvas.style.cursor = pickMarker(event) ? 'pointer' : 'grab';
      return;
    }

    const dx = event.clientX - pointerDown.x;
    const dy = event.clientY - pointerDown.y;
    if (Math.abs(dx) + Math.abs(dy) > 8) pointerDown.moved = true;

    if (event.shiftKey || event.altKey) {
      state.yaw = pointerDown.yaw - dx * 0.006;
      state.pitch = THREE.MathUtils.clamp(pointerDown.pitch + dy * 0.0045, 0.42, 1.18);
      return;
    }

    const panScale = state.distance * 0.00155;
    const right = new THREE.Vector3(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
    const forward = new THREE.Vector3(Math.sin(state.yaw), 0, Math.cos(state.yaw));
    state.targetGoal.set(
      pointerDown.targetX - dx * panScale * right.x + dy * panScale * forward.x,
      0,
      pointerDown.targetZ - dx * panScale * right.z + dy * panScale * forward.z
    );
    state.targetGoal.x = THREE.MathUtils.clamp(state.targetGoal.x, -30, 30);
    state.targetGoal.z = THREE.MathUtils.clamp(state.targetGoal.z, -16, 16);
  };

  const handlePointerUp = (event) => {
    canvas.releasePointerCapture?.(event.pointerId);
    canvas.style.cursor = 'grab';

    if (pointerDown && !pointerDown.moved) {
      const markerId = pickMarker(event);
      if (markerId) {
        focusUniversity(markerId);
        onPick(markerId);
      }
    }

    isDragging = false;
    pointerDown = null;
  };

  const handleWheel = (event) => {
    event.preventDefault();
    state.distance = THREE.MathUtils.clamp(state.distance + event.deltaY * 0.035, 30, 88);
  };

  const animate = () => {
    const elapsed = performance.now() - state.startTime;
    const introProgress = reducedMotion ? 1 : THREE.MathUtils.clamp(elapsed / 3200, 0, 1);
    const time = (performance.now() - state.startTime) / 1000;

    updateCamera(introProgress);
    animateClouds(cloudRig, introProgress, time);
    animateMarkers(animatedRings, markersById, state.selectedId, time);

    renderer.render(scene, camera);
    window.__acca3DMapReady = true;
    window.__acca3DMapMarkerCount = items.length;
    window.__acca3DMapSelectedId = state.selectedId;
    animationFrame = requestAnimationFrame(animate);
  };

  resize();
  updateCamera(reducedMotion ? 1 : 0);
  canvas.style.cursor = 'grab';
  window.__acca3DMapReady = false;
  window.__acca3DMapMarkerCount = items.length;
  window.addEventListener('resize', resize);
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', handlePointerUp);
  canvas.addEventListener('wheel', handleWheel, { passive: false });
  animationFrame = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(animationFrame);
    window.removeEventListener('resize', resize);
    canvas.removeEventListener('pointerdown', handlePointerDown);
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerup', handlePointerUp);
    canvas.removeEventListener('pointercancel', handlePointerUp);
    canvas.removeEventListener('wheel', handleWheel);
    apiRef.current = null;
    window.__acca3DMapReady = false;
    disposeScene(scene);
    renderer.dispose();
  };
}

function addLights(scene, darkMode) {
  scene.add(new THREE.HemisphereLight(darkMode ? 0xbfdfff : 0xffffff, darkMode ? 0x19394f : 0x7ab8c8, darkMode ? 1.25 : 1.45));

  const sun = new THREE.DirectionalLight(darkMode ? 0xcde8ff : 0xffffff, darkMode ? 2.6 : 2.2);
  sun.position.set(-20, 42, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 5;
  sun.shadow.camera.far = 90;
  sun.shadow.camera.left = -46;
  sun.shadow.camera.right = 46;
  sun.shadow.camera.top = 32;
  sun.shadow.camera.bottom = -32;
  scene.add(sun);

  const rim = new THREE.DirectionalLight(darkMode ? 0x7af0ff : 0x8ad8ff, darkMode ? 1.5 : 0.8);
  rim.position.set(26, 22, -24);
  scene.add(rim);
}

function createTerrain(scene, darkMode) {
  const seaMaterial = new THREE.MeshPhysicalMaterial({
    color: darkMode ? 0x043f5a : 0x147f9f,
    map: makeWaterTexture(darkMode),
    roughness: 0.22,
    metalness: 0.06,
    transmission: 0,
    transparent: true,
    opacity: darkMode ? 0.86 : 0.78,
  });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(126, 78, 1, 1), seaMaterial);
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -0.22;
  sea.receiveShadow = true;
  scene.add(sea);

  const europeMaterial = new THREE.MeshStandardMaterial({
    color: darkMode ? 0x286046 : 0x8faa72,
    map: makeLandTexture(darkMode, 1),
    roughness: 0.88,
    metalness: 0.02,
  });
  const asiaMaterial = new THREE.MeshStandardMaterial({
    color: darkMode ? 0x2c654a : 0x97b875,
    map: makeLandTexture(darkMode, 7),
    roughness: 0.88,
    metalness: 0.02,
  });

  const europe = makeLandShape([
    projectGeo(41.235, 28.50),
    projectGeo(41.238, 28.78),
    projectGeo(41.222, 28.93),
    projectGeo(41.18, 29.01),
    projectGeo(41.12, 29.018),
    projectGeo(41.065, 29.005),
    projectGeo(41.034, 28.995),
    projectGeo(41.016, 28.986),
    projectGeo(40.985, 28.945),
    projectGeo(40.95, 28.845),
    projectGeo(40.895, 28.72),
    projectGeo(40.835, 28.57),
    projectGeo(40.925, 28.505),
  ], europeMaterial);
  europe.position.y = 0.04;
  scene.add(europe);

  const asia = makeLandShape([
    projectGeo(41.22, 29.035),
    projectGeo(41.245, 29.65),
    projectGeo(41.08, 29.665),
    projectGeo(40.91, 29.52),
    projectGeo(40.805, 29.27),
    projectGeo(40.84, 29.10),
    projectGeo(40.93, 29.02),
    projectGeo(41.015, 29.03),
    projectGeo(41.11, 29.05),
  ], asiaMaterial);
  asia.position.y = 0.05;
  scene.add(asia);

  addCoastline(scene, europe);
  addCoastline(scene, asia);
  addBosphorusAndGoldenHorn(scene, seaMaterial);
  addMarmaraIslands(scene, asiaMaterial);
  addTerrainRelief(scene, darkMode);
  addHills(scene, darkMode);
}

function makeLandTexture(darkMode, salt = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const base = darkMode ? '#264d3c' : '#8fae72';
  const field = darkMode ? '#315f45' : '#9fc080';
  const urban = darkMode ? 'rgba(170,178,157,0.16)' : 'rgba(231,224,198,0.34)';
  const forest = darkMode ? 'rgba(23,74,50,0.34)' : 'rgba(50,111,55,0.28)';
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 900; i++) {
    const x = seeded(i * 3 + salt) * 512;
    const y = seeded(i * 5 + salt) * 512;
    const w = lerp(8, 54, seeded(i * 7 + salt));
    const h = lerp(4, 34, seeded(i * 11 + salt));
    ctx.fillStyle = seeded(i + salt) > 0.62 ? urban : (seeded(i + salt * 2) > 0.5 ? field : forest);
    ctx.globalAlpha = lerp(0.22, 0.72, seeded(i * 13 + salt));
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(lerp(-0.8, 0.8, seeded(i * 17 + salt)));
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }

  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.6, 1.8);
  texture.anisotropy = 4;
  return texture;
}

function makeWaterTexture(darkMode) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, darkMode ? '#05334a' : '#1f9eb7');
  gradient.addColorStop(0.52, darkMode ? '#075b72' : '#36b8c8');
  gradient.addColorStop(1, darkMode ? '#032b40' : '#0b6e91');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 120; i++) {
    ctx.strokeStyle = darkMode ? 'rgba(130,214,232,0.12)' : 'rgba(255,255,255,0.18)';
    ctx.lineWidth = lerp(0.8, 2.2, seeded(i + 3));
    ctx.beginPath();
    const y = seeded(i + 5) * 512;
    ctx.moveTo(-40, y);
    ctx.bezierCurveTo(130, y + lerp(-24, 24, seeded(i + 9)), 310, y + lerp(-22, 22, seeded(i + 15)), 552, y + lerp(-16, 16, seeded(i + 21)));
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.2, 1.6);
  texture.anisotropy = 4;
  return texture;
}

function addBosphorusAndGoldenHorn(scene, seaMaterial) {
  const channelMaterial = seaMaterial.clone();
  channelMaterial.opacity = 0.9;
  channelMaterial.color = new THREE.Color(0x1c9fc0);

  addTube(scene, [
    projectGeo(41.235, 29.035),
    projectGeo(41.16, 29.025),
    projectGeo(41.09, 29.018),
    projectGeo(41.045, 29.015),
    projectGeo(40.99, 29.0),
    projectGeo(40.88, 29.04),
  ], channelMaterial, 0.42);

  addTube(scene, [
    projectGeo(41.075, 28.91),
    projectGeo(41.062, 28.94),
    projectGeo(41.045, 28.965),
    projectGeo(41.025, 28.985),
  ], channelMaterial, 0.34);

  const wakeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.32 });
  [
    [projectGeo(41.18, 29.035), projectGeo(41.08, 29.022), projectGeo(40.96, 29.025)],
    [projectGeo(41.06, 28.935), projectGeo(41.04, 28.96), projectGeo(41.025, 28.985)],
  ].forEach((points) => {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points.map((point) => new THREE.Vector3(point.x, 0.35, point.z))),
      wakeMaterial
    );
    scene.add(line);
  });
}

function addMarmaraIslands(scene, landMaterial) {
  [
    [40.875, 29.068, 1.35],
    [40.88, 29.095, 1.05],
    [40.865, 29.115, 1.25],
    [40.852, 29.126, 1.55],
  ].forEach(([lat, lon, scale], index) => {
    const center = projectGeo(lat, lon);
    const points = Array.from({ length: 9 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 9;
      const wobble = lerp(0.72, 1.18, seeded(index * 21 + i));
      return { x: center.x + Math.cos(angle) * scale * wobble, z: center.z + Math.sin(angle) * scale * 0.62 * wobble };
    });
    const island = makeLandShape(points, landMaterial.clone());
    island.position.y = 0.08;
    scene.add(island);
    addCoastline(scene, island);
  });
}

function addTerrainRelief(scene, darkMode) {
  const material = new THREE.MeshStandardMaterial({
    color: darkMode ? 0x315944 : 0x89a86b,
    roughness: 0.92,
    metalness: 0.01,
    transparent: true,
    opacity: darkMode ? 0.72 : 0.62,
  });
  const geometry = new THREE.SphereGeometry(1, 12, 8);
  const matrix = new THREE.Matrix4();
  const relief = new THREE.InstancedMesh(geometry, material, 120);
  let count = 0;

  for (let i = 0; i < 190 && count < 120; i++) {
    const north = seeded(i + 4) > 0.42;
    const lat = north ? lerp(41.08, 41.23, seeded(i + 9)) : lerp(40.86, 41.02, seeded(i + 13));
    const lon = lerp(28.54, 29.62, seeded(i + 17));
    if (!isApproxLand(lat, lon)) continue;
    const point = projectGeo(lat, lon);
    const sx = lerp(1.2, 4.8, seeded(i + 19));
    const sz = lerp(0.8, 3.6, seeded(i + 23));
    const sy = lerp(0.08, north ? 0.46 : 0.22, seeded(i + 29));
    matrix.compose(
      new THREE.Vector3(point.x, sy * 0.42, point.z),
      new THREE.Quaternion(),
      new THREE.Vector3(sx, sy, sz)
    );
    relief.setMatrixAt(count, matrix);
    count += 1;
  }

  relief.count = count;
  relief.receiveShadow = true;
  scene.add(relief);
}

function createForestClusters(scene, darkMode) {
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: darkMode ? 0x3d2a1b : 0x6a4d31, roughness: 0.8 });
  const leafMaterial = new THREE.MeshStandardMaterial({ color: darkMode ? 0x15583a : 0x2f7d4e, roughness: 0.9 });
  const trunkGeometry = new THREE.CylinderGeometry(0.035, 0.055, 0.28, 5);
  const leafGeometry = new THREE.ConeGeometry(0.22, 0.58, 7);
  const trunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, 420);
  const leaves = new THREE.InstancedMesh(leafGeometry, leafMaterial, 420);
  const matrix = new THREE.Matrix4();
  let count = 0;

  for (let i = 0; i < 720 && count < 420; i++) {
    const forestBand = seeded(i + 5);
    const lat = forestBand > 0.36 ? lerp(41.12, 41.24, seeded(i + 11)) : lerp(40.9, 41.04, seeded(i + 13));
    const lon = forestBand > 0.36 ? lerp(28.55, 29.65, seeded(i + 17)) : lerp(29.12, 29.45, seeded(i + 19));
    if (!isApproxLand(lat, lon)) continue;
    const { x, z } = projectGeo(lat, lon);
    const scale = lerp(0.7, 1.45, seeded(i + 23));
    const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), seeded(i + 29) * Math.PI * 2);

    matrix.compose(new THREE.Vector3(x, 0.18 * scale, z), rotation, new THREE.Vector3(scale, scale, scale));
    trunks.setMatrixAt(count, matrix);
    matrix.compose(new THREE.Vector3(x, 0.55 * scale, z), rotation, new THREE.Vector3(scale, scale, scale));
    leaves.setMatrixAt(count, matrix);
    count += 1;
  }

  trunks.count = count;
  leaves.count = count;
  trunks.castShadow = true;
  leaves.castShadow = true;
  scene.add(trunks, leaves);
}

function createRoadsAndBridges(scene, darkMode) {
  const roadMaterial = new THREE.MeshStandardMaterial({
    color: darkMode ? 0xdfefff : 0xffffff,
    roughness: 0.52,
    transparent: true,
    opacity: darkMode ? 0.58 : 0.76,
  });
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: darkMode ? 0xf7c86d : 0xd7a84c,
    roughness: 0.38,
    metalness: 0.16,
    emissive: darkMode ? 0x5c3900 : 0x000000,
    emissiveIntensity: darkMode ? 0.32 : 0,
  });

  [
    [projectGeo(41.03, 28.56), projectGeo(41.02, 28.78), projectGeo(41.04, 28.96)],
    [projectGeo(41.15, 28.58), projectGeo(41.11, 28.78), projectGeo(41.09, 28.96)],
    [projectGeo(40.93, 28.62), projectGeo(40.99, 28.82), projectGeo(41.02, 28.94)],
    [projectGeo(41.01, 29.03), projectGeo(41.01, 29.18), projectGeo(40.94, 29.38)],
    [projectGeo(41.11, 29.03), projectGeo(41.1, 29.2), projectGeo(41.16, 29.55)],
    [projectGeo(40.88, 29.12), projectGeo(40.9, 29.28), projectGeo(40.91, 29.5)],
  ].forEach((points) => addTube(scene, points, roadMaterial, 0.035));

  addTube(scene, [projectGeo(41.047, 28.992), projectGeo(41.048, 29.039)], goldMaterial, 0.09);
  addTube(scene, [projectGeo(41.088, 29.02), projectGeo(41.088, 29.065)], goldMaterial, 0.08);
  addBridgeTowers(scene, projectGeo(41.047, 28.995), projectGeo(41.047, 29.036), goldMaterial);
  addBridgeTowers(scene, projectGeo(41.088, 29.023), projectGeo(41.088, 29.062), goldMaterial);
}

function createCityBlocks(scene, darkMode) {
  const geometry = new THREE.BoxGeometry(0.32, 1, 0.32);
  const material = new THREE.MeshStandardMaterial({
    color: darkMode ? 0x33404a : 0xd8d6c7,
    roughness: 0.82,
    metalness: 0.03,
    transparent: true,
    opacity: darkMode ? 0.82 : 0.76,
  });
  const blocks = new THREE.InstancedMesh(geometry, material, 560);
  const matrix = new THREE.Matrix4();
  let count = 0;

  for (let i = 0; i < 980 && count < 560; i++) {
    const lon = lerp(28.54, 29.56, seeded(i * 2 + 3));
    const lat = lerp(40.86, 41.18, seeded(i * 2 + 7));
    if (!isApproxLand(lat, lon)) continue;
    const { x, z } = projectGeo(lat, lon);
    const nearCore = Math.abs(lon - 29.0) < 0.16 && lat > 40.95 && lat < 41.11;
    const height = lerp(0.12, nearCore ? 1.45 : 0.78, seeded(i + 17));
    const sx = lerp(0.35, nearCore ? 1.05 : 0.82, seeded(i + 29));
    const sz = lerp(0.35, nearCore ? 1.12 : 0.86, seeded(i + 41));
    matrix.compose(
      new THREE.Vector3(x, 0.1 + height / 2, z),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), seeded(i + 53) * Math.PI * 2),
      new THREE.Vector3(sx, height, sz)
    );
    blocks.setMatrixAt(count, matrix);
    count += 1;
  }

  blocks.count = count;
  blocks.castShadow = true;
  blocks.receiveShadow = true;
  scene.add(blocks);
}

function createUniversityMarkers({ scene, items, markersById, markerPickables, animatedRings, darkMode }) {
  const markers = new THREE.Group();
  markers.name = 'university-markers';
  scene.add(markers);

  items.forEach((item, index) => {
    const sideColor = item.side === 'asia'
      ? (darkMode ? 0x45e3c2 : 0x049d81)
      : (darkMode ? 0xffcf72 : 0xc99a3b);
    const campusMaterial = new THREE.MeshStandardMaterial({
      color: darkMode ? 0xdce7ee : 0xf4f0e6,
      roughness: 0.54,
      metalness: 0.05,
    });
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: sideColor,
      roughness: 0.34,
      metalness: 0.18,
      emissive: sideColor,
      emissiveIntensity: darkMode ? 0.3 : 0.08,
    });
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: sideColor,
      transparent: true,
      opacity: darkMode ? 0.34 : 0.24,
      depthWrite: false,
    });

    const marker = new THREE.Group();
    marker.position.set(item.x, 0.22, item.z);
    marker.userData.markerId = item.id;

    const base = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.035, 8, 42), haloMaterial);
    base.rotation.x = Math.PI / 2;
    base.userData.markerId = item.id;
    marker.add(base);
    animatedRings.push({ ring: base, index, marker });

    const platform = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.54, 0.12, 8), accentMaterial);
    platform.position.y = 0.11;
    platform.userData.markerId = item.id;
    platform.castShadow = true;
    marker.add(platform);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.48, 0.44), campusMaterial);
    body.position.y = 0.48;
    body.userData.markerId = item.id;
    body.castShadow = true;
    marker.add(body);

    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.82, 0.24), campusMaterial);
    tower.position.set(-0.28, 0.66, 0.02);
    tower.userData.markerId = item.id;
    tower.castShadow = true;
    marker.add(tower);

    const annex = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.36, 0.34), campusMaterial);
    annex.position.set(0.36, 0.38, -0.03);
    annex.userData.markerId = item.id;
    annex.castShadow = true;
    marker.add(annex);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.24, 4), accentMaterial);
    roof.position.set(-0.28, 1.2, 0.02);
    roof.rotation.y = Math.PI / 4;
    roof.userData.markerId = item.id;
    roof.castShadow = true;
    marker.add(roof);

    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), accentMaterial);
    glow.position.set(0.18, 0.82, -0.16);
    glow.userData.markerId = item.id;
    marker.add(glow);

    markerPickables.push(platform, body, tower, annex, roof, glow, base);
    markers.add(marker);
    markersById.set(item.id, marker);
  });
}

function createCloudRig(scene, darkMode) {
  const texture = makeCloudTexture();
  const material = new THREE.SpriteMaterial({
    map: texture,
    color: darkMode ? 0xc9dff2 : 0xffffff,
    transparent: true,
    opacity: darkMode ? 0.24 : 0.18,
    depthWrite: false,
    depthTest: true,
  });
  const rig = {
    left: new THREE.Group(),
    right: new THREE.Group(),
    far: new THREE.Group(),
    material,
  };

  makeCloudField(rig.left, material, -30, 14, 10, 0.85);
  makeCloudField(rig.right, material, 30, -15, 10, 0.85);
  makeCloudField(rig.far, material, 0, 28, 8, 0.55);
  scene.add(rig.left, rig.right, rig.far);
  return rig;
}

function makeCloudField(group, material, centerX, centerZ, count = 16, density = 1) {
  for (let i = 0; i < count; i++) {
    const cloud = new THREE.Group();
    const parts = 4 + Math.floor(seeded(i + centerX * 5) * 5);
    for (let j = 0; j < parts; j++) {
      const puff = new THREE.Sprite(material.clone());
      puff.position.set(
        (seeded(i * 11 + j) - 0.5) * 6.5,
        (seeded(i * 7 + j) - 0.5) * 0.9,
        (seeded(i * 17 + j) - 0.5) * 4.2
      );
      const scale = lerp(2.2, 5.6, seeded(i * 19 + j)) * density;
      puff.scale.set(scale * 1.65, scale * 0.66, 1);
      puff.material.opacity = lerp(0.035, 0.16, seeded(i * 31 + j)) * density;
      puff.material.userData.baseOpacity = puff.material.opacity;
      cloud.add(puff);
    }
    cloud.position.set(
      centerX + (seeded(i + 100) - 0.5) * 13,
      lerp(16, 28, seeded(i + 200)),
      centerZ + (seeded(i + 300) - 0.5) * 12
    );
    group.add(cloud);
  }
}

function makeCloudTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 128);

  [
    [72, 72, 58],
    [116, 54, 68],
    [160, 70, 56],
    [128, 80, 88],
  ].forEach(([x, y, r], index) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `rgba(255,255,255,${index === 3 ? 0.82 : 0.72})`);
    gradient.addColorStop(0.48, 'rgba(255,255,255,0.42)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function animateClouds(rig, introProgress, time) {
  const shift = 4 + (1 - easeOutCubic(introProgress)) * 18;
  rig.left.position.x = -shift;
  rig.right.position.x = shift;
  rig.left.position.y = (1 - introProgress) * -2.5 + Math.sin(time * 0.18) * 0.28;
  rig.right.position.y = (1 - introProgress) * -2.5 + Math.cos(time * 0.16) * 0.28;
  rig.far.position.y = 1.2 + Math.sin(time * 0.11) * 0.32;
  const opacityBoost = 0.72 + (1 - introProgress) * 0.22;
  [rig.left, rig.right, rig.far].forEach((group) => {
    group.traverse((object) => {
      if (object.material?.opacity) {
        const baseOpacity = object.material.userData.baseOpacity || object.material.opacity;
        object.material.opacity = Math.min(0.18, baseOpacity * opacityBoost);
      }
    });
  });
}

function animateMarkers(animatedRings, markersById, selectedId, time) {
  animatedRings.forEach(({ ring, index, marker }) => {
    ring.rotation.z = time * 0.8 + index * 0.28;
    const pulse = 1 + Math.sin(time * 2.2 + index) * 0.08;
    ring.scale.setScalar(pulse);
    const selected = marker.userData.markerId === selectedId;
    marker.scale.lerp(new THREE.Vector3(selected ? 1.55 : 1, selected ? 1.55 : 1, selected ? 1.55 : 1), 0.1);
  });

  const selected = markersById.get(selectedId);
  if (selected) selected.rotation.y = Math.sin(time * 1.4) * 0.08;
}

function makeLandShape(points, material) {
  const shape = new THREE.Shape();
  points.forEach((point, index) => {
    if (index === 0) shape.moveTo(point.x, point.z);
    else shape.lineTo(point.x, point.z);
  });
  shape.closePath();

  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape, 24), material);
  mesh.rotation.x = Math.PI / 2;
  mesh.receiveShadow = true;
  mesh.userData.outlinePoints = points;
  return mesh;
}

function addCoastline(scene, landMesh) {
  const points = (landMesh.userData.outlinePoints || [])
    .map((point) => new THREE.Vector3(point.x, 0.18, point.z));
  if (!points.length) return;
  const line = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
  );
  scene.add(line);
}

function addHills(scene, darkMode) {
  const hillMaterial = new THREE.MeshStandardMaterial({
    color: darkMode ? 0x214f3c : 0x6fa866,
    roughness: 0.9,
  });

  [
    [41.17, 28.65, 1.2],
    [41.19, 28.85, 1.0],
    [41.18, 29.45, 1.5],
    [41.11, 29.55, 1.25],
    [40.91, 29.36, 0.95],
    [41.17, 29.6, 1.4],
  ].forEach(([lat, lon, scale]) => {
    const { x, z } = projectGeo(lat, lon);
    const hill = new THREE.Mesh(new THREE.ConeGeometry(1.9 * scale, 2.8 * scale, 7), hillMaterial);
    hill.position.set(x, 1.3 * scale, z);
    hill.rotation.y = seeded(lat * 1000) * Math.PI;
    hill.castShadow = true;
    hill.receiveShadow = true;
    scene.add(hill);
  });
}

function addTube(scene, projectedPoints, material, radius) {
  const points = projectedPoints.map((point) => new THREE.Vector3(point.x, 0.24, point.z));
  const curve = new THREE.CatmullRomCurve3(points);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, radius, 8, false), material);
  tube.castShadow = true;
  tube.receiveShadow = true;
  scene.add(tube);
}

function addBridgeTowers(scene, start, end, material) {
  [start, end].forEach((point) => {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.6, 10), material);
    tower.position.set(point.x, 1.45, point.z);
    tower.castShadow = true;
    scene.add(tower);
  });
}

function disposeScene(scene) {
  scene.traverse((object) => {
    if (object.geometry) object.geometry.dispose();
    if (!object.material) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if (material.map) material.map.dispose();
      material.dispose?.();
    });
  });
}

function findGeo(name, index) {
  const exact = GEO_POINTS.get(normalizeKey(name));
  if (exact) return exact;

  const side = index % 3 === 0 ? 'asia' : 'europe';
  const lat = side === 'asia'
    ? lerp(40.9, 41.15, seeded(index + 11))
    : lerp(40.92, 41.15, seeded(index + 13));
  const lon = side === 'asia'
    ? lerp(29.05, 29.38, seeded(index + 17))
    : lerp(28.62, 28.95, seeded(index + 19));

  return {
    lat,
    lon,
    side,
    district: side === 'asia' ? 'Asian Istanbul' : 'European Istanbul',
  };
}

function projectGeo(lat, lon) {
  const x = ((lon - ISTANBUL_BOUNDS.lonMin) / (ISTANBUL_BOUNDS.lonMax - ISTANBUL_BOUNDS.lonMin) - 0.5) * MAP_WIDTH;
  const z = -((lat - ISTANBUL_BOUNDS.latMin) / (ISTANBUL_BOUNDS.latMax - ISTANBUL_BOUNDS.latMin) - 0.5) * MAP_DEPTH;
  return { x, z };
}

function isApproxLand(lat, lon) {
  if (lon < 28.98) return lat > 40.86 && lat < 41.23;
  if (lon > 29.02) return lat > 40.82 && lat < 41.24;
  return false;
}

function normalizeKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toUpperCase();
}

function formatNumber(value, isFa = true) {
  if (typeof value === 'number') return new Intl.NumberFormat(isFa ? 'fa-IR' : 'en-US').format(value);
  return value;
}

function seeded(seed) {
  const value = Math.sin(seed * 999.77) * 10000;
  return value - Math.floor(value);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}
