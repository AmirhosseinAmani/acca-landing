import { useEffect, useMemo, useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
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
import { COMPANY_OFFICE_LAT, COMPANY_OFFICE_LNG } from '../../constants/contact';

const OFFICE_LOCATION = {
  lon: Number(COMPANY_OFFICE_LNG),
  lat: Number(COMPANY_OFFICE_LAT),
  labelFa: 'دفتر مرکزی ACCA EDU',
  labelEn: 'ACCA EDU Headquarters',
  district: 'Esenyurt',
};

const ISTANBUL_BOUNDS = {
  latMin: 40.78,
  latMax: 41.27,
  lonMin: 28.5,
  lonMax: 29.66,
};

const env = import.meta.env || {};

const MAPBOX_STYLE = 'mapbox://styles/mapbox/standard-satellite';

const MAP_CONFIG = {
  provider: 'mapbox',
  mapboxToken:
    env.VITE_MAPBOX_ACCESS_TOKEN ||
    env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
    env.VITE_MAPBOX_TOKEN ||
    env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    '',
  googleMapsApiKey: env.VITE_GOOGLE_MAPS_API_KEY || env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  cesiumIonToken: env.VITE_CESIUM_ION_TOKEN || env.NEXT_PUBLIC_CESIUM_ION_TOKEN || '',
  center: [29.015, 41.025],
  bounds: [
    [28.43, 40.74],
    [29.78, 41.32],
  ],
  initial: {
    zoom: 9.35,
    pitch: 56,
    bearing: -18,
  },
  limits: {
    minZoom: 8.45,
    maxZoom: 14.8,
    maxPitch: 68,
  },
  terrain: {
    exaggerationDesktop: 1.14,
    exaggerationMobile: 0.88,
  },
  lighting: {
    sunAzimuth: 248,
    sunElevation: 34,
    exposure: 0.92,
    atmosphere: 0.42,
  },
  quality: {
    desktopPixelRatio: 1.5,
    mobilePixelRatio: 1.18,
  },
};

let mapLibreModulePromise;

// Loads Mapbox GL JS v3 and sets the public access token from the environment.
// (Variable kept named maplibregl across the file since the Marker / addLayer /
// fill-extrusion / flyTo APIs are call-compatible with the MapLibre original.)
function loadMapLibre() {
  if (!mapLibreModulePromise) {
    mapLibreModulePromise = import('mapbox-gl').then((module) => {
      const mapboxgl = module.default || module;
      if (MAP_CONFIG.mapboxToken) mapboxgl.accessToken = MAP_CONFIG.mapboxToken;
      return mapboxgl;
    });
  }
  return mapLibreModulePromise;
}

function supportsGeospatialWebGL(maplibregl) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  // Mapbox GL v3 needs a public token; without one, fall back to the list/scene.
  if (!MAP_CONFIG.mapboxToken) return false;
  if (typeof maplibregl?.supported === 'function') {
    return maplibregl.supported({ failIfMajorPerformanceCaveat: false });
  }

  const canvas = document.createElement('canvas');
  return Boolean(
    canvas.getContext('webgl2')
      || canvas.getContext('webgl')
      || canvas.getContext('experimental-webgl')
  );
}

const MAP_WIDTH = 72;
const MAP_DEPTH = 36;

const EUROPE_LAND_POLYGON = [
  [40.825, 28.48],
  [40.885, 28.60],
  [40.93, 28.76],
  [40.965, 28.88],
  [40.992, 28.955],
  [41.002, 28.988],
  [41.018, 29.006],
  [41.036, 29.018],
  [41.055, 29.028],
  [41.078, 29.042],
  [41.108, 29.056],
  [41.148, 29.062],
  [41.195, 29.088],
  [41.245, 29.058],
  [41.262, 28.68],
  [41.178, 28.50],
];

const ASIA_LAND_POLYGON = [
  [40.805, 29.08],
  [40.86, 29.045],
  [40.925, 29.032],
  [40.985, 29.034],
  [41.020, 29.046],
  [41.046, 29.058],
  [41.072, 29.071],
  [41.096, 29.084],
  [41.130, 29.094],
  [41.178, 29.106],
  [41.232, 29.116],
  [41.248, 29.66],
  [41.080, 29.68],
  [40.900, 29.54],
  [40.805, 29.28],
];

const BOSPHORUS_PATH = [
  [40.875, 29.020],
  [40.950, 29.018],
  [40.995, 29.021],
  [41.025, 29.030],
  [41.048, 29.038],
  [41.074, 29.056],
  [41.094, 29.069],
  [41.130, 29.079],
  [41.166, 29.083],
  [41.205, 29.116],
  [41.245, 29.132],
];

const GOLDEN_HORN_PATH = [
  [41.023, 28.976],
  [41.034, 28.963],
  [41.047, 28.946],
  [41.062, 28.928],
  [41.078, 28.905],
];

const ISTANBUL_LAKES = [
  { center: [41.030, 28.758], rx: 1.9, rz: 3.2, rotation: -0.22 },
  { center: [41.015, 28.585], rx: 2.4, rz: 3.4, rotation: -0.28 },
  { center: [41.170, 28.620], rx: 2.2, rz: 1.7, rotation: 0.16 },
  { center: [41.065, 29.345], rx: 2.7, rz: 2.0, rotation: 0.28 },
];

const BOSPHORUS_BRIDGES = [
  {
    id: 'bosphorus-bridge',
    start: [41.047, 29.025],
    end: [41.043, 29.053],
    towerStart: [41.047, 29.030],
    towerEnd: [41.044, 29.048],
  },
  {
    id: 'fsm-bridge',
    start: [41.092, 29.055],
    end: [41.088, 29.078],
    towerStart: [41.092, 29.060],
    towerEnd: [41.089, 29.073],
  },
  {
    id: 'yss-bridge',
    start: [41.205, 29.106],
    end: [41.206, 29.145],
    towerStart: [41.205, 29.114],
    towerEnd: [41.206, 29.137],
  },
];

const ISTANBUL_INFRASTRUCTURE = {
  roads: [
    {
      id: 'o7-europe-black-sea-corridor',
      name: 'O-7 European corridor',
      kind: 'highway',
      coordinates: [
        [28.50, 41.00],
        [28.64, 41.05],
        [28.80, 41.10],
        [28.98, 41.12],
        [29.10, 41.15],
        [29.24, 41.16],
        [29.42, 41.16],
        [29.62, 41.14],
      ],
    },
    {
      id: 'e80-trans-istanbul',
      name: 'E80 / TEM corridor',
      kind: 'highway',
      coordinates: [
        [28.55, 41.02],
        [28.73, 41.04],
        [28.90, 41.05],
        [29.03, 41.07],
        [29.16, 41.05],
        [29.35, 40.99],
        [29.58, 40.92],
      ],
    },
    {
      id: 'd100-marmara-corridor',
      name: 'D100 coastal corridor',
      kind: 'arterial',
      coordinates: [
        [28.54, 40.96],
        [28.72, 40.97],
        [28.90, 40.99],
        [29.01, 41.00],
        [29.12, 40.99],
        [29.28, 40.92],
        [29.48, 40.85],
      ],
    },
  ],
  bridges: BOSPHORUS_BRIDGES.map((bridge) => ({
    id: bridge.id,
    kind: 'bridge',
    coordinates: [
      [bridge.start[1], bridge.start[0]],
      [bridge.end[1], bridge.end[0]],
    ],
  })),
  airports: [
    {
      id: 'istanbul-airport',
      name: 'Istanbul Airport',
      center: [28.7519, 41.2608],
      runwayBearing: -8,
      runwayLength: 0.075,
      runwayWidth: 0.012,
    },
    {
      id: 'sabiha-gokcen-airport',
      name: 'Sabiha Gokcen International Airport',
      center: [29.3092, 40.8986],
      runwayBearing: 64,
      runwayLength: 0.052,
      runwayWidth: 0.010,
    },
  ],
};

const GEO_POINTS = [
  // Primary campus of each university, geocoded to real on-land positions in the
  // correct Istanbul district. [name, lat, lon, district, side]. Corrected so no
  // beacon lands in the Bosphorus, the Golden Horn, Büyükçekmece lake, or the sea.
  ['Istanbul Galata University', 41.0305, 28.9745, 'Beyoglu', 'europe'],
  ['Bezmialem Vakif University', 41.01951, 28.93353, 'Fatih', 'europe'],
  ['Fatih Sultan Mehmet Vakif University', 41.0462, 28.9462, 'Beyoglu', 'europe'],
  ['Dogus University', 41.0520, 29.0570, 'Uskudar', 'asia'],
  ['Istanbul Ticaret University', 41.0579, 28.95133, 'Sutluce', 'europe'],
  ['Koc University', 41.20565, 29.0736, 'Sariyer', 'europe'],
  ['Ibn Haldun University', 41.13828, 28.79785, 'Basaksehir', 'europe'],
  ['Sabanci University', 40.8915, 29.3790, 'Tuzla', 'asia'],
  ['Kadir Has University', 41.02458, 28.95915, 'Cibali', 'europe'],
  ['Istanbul Esenyurt University', 41.01974, 28.68749, 'Esenyurt', 'europe'],
  ['Fenerbahce University', 40.9941, 29.12188, 'Atasehir', 'asia'],
  ['Istanbul Gedik University', 40.8880, 29.1850, 'Kartal', 'asia'],
  ['Istanbul Topkapi University', 40.99371, 28.91541, 'Zeytinburnu', 'europe'],
  ['Yeditepe University', 40.9575, 29.1510, 'Atasehir', 'asia'],
  ['Uskudar University', 41.0230, 29.0420, 'Uskudar', 'asia'],
  ['Ozyegin University', 41.02987, 29.25889, 'Cekmekoy', 'asia'],
  ['Okan University', 40.95172, 29.39094, 'Tuzla', 'asia'],
  ['Istanbul Nisantasi University', 41.11955, 29.00843, 'Maslak', 'europe'],
  ['Maltepe University', 40.9230, 29.1340, 'Maltepe', 'asia'],
  ['Istinye University', 41.10466, 28.98603, 'Vadi Istanbul', 'europe'],
  ['Istanbul Yeni Yuzyil University', 41.01574, 28.90735, 'Zeytinburnu', 'europe'],
  ['Istanbul Sabahattin Zaim University', 41.0330, 28.7780, 'Halkali', 'europe'],
  ['Istanbul Medipol University', 41.08684, 29.08776, 'Kavacik', 'asia'],
  ['Istanbul Kultur University', 40.99109, 28.83205, 'Bakirkoy', 'europe'],
  ['Istanbul Kent University', 41.03202, 28.98296, 'Cihangir', 'europe'],
  ['Istanbul Gelisim University', 40.99804, 28.6988, 'Avcilar', 'europe'],
  ['Istanbul Bilgi University', 41.0570, 28.9460, 'Eyupsultan', 'europe'],
  ['Istanbul Aydin University', 40.9940, 28.7960, 'Kucukcekmece', 'europe'],
  ['Istanbul Atlas University', 41.09785, 28.9791, 'Kagithane', 'europe'],
  ['Istanbul Arel University', 41.0340, 28.5930, 'Tepekent', 'europe'],
  ['Isik University', 41.11153, 29.02579, 'Maslak', 'europe'],
  ['Halic University', 41.08624, 28.95234, 'Eyupsultan', 'europe'],
  ['Biruni University', 41.01742, 28.91681, 'Zeytinburnu', 'europe'],
  ['Beykoz University', 41.1058, 29.0878, 'Beykoz', 'asia'],
  ['Beykent University', 41.01731, 28.62486, 'Buyukcekmece', 'europe'],
  ['Bahcesehir University', 41.0420, 29.0065, 'Besiktas', 'europe'],
  ['Altinbas University', 41.05733, 28.8207, 'Bagcilar', 'europe'],
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
  const mapContainerRef = useRef(null);
  const geospatialApiRef = useRef(null);
  const sceneApiRef = useRef(null);
  const selectedIdRef = useRef('');
  const [sideFilter, setSideFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [mapMode, setMapMode] = useState('loading');
  const [debugSnapshot, setDebugSnapshot] = useState(null);
  const ui = isFa ? copy.fa : copy.en;
  const debugMap = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('debugMap') === '1';
  }, []);
  // Edit mode (?page=istanbul-map&editMap=1): every marker becomes draggable so
  // you can place each one exactly, then export the coordinates for me to lock.
  const editMode = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('editMap') === '1';
  }, []);
  const [editing, setEditing] = useState(false);
  useEffect(() => { if (editMode) setEditing(true); }, [editMode]);
  const copyEditedCoordinates = () => {
    const data = (typeof window !== 'undefined' && window.__accaEditedCoords) || {};
    const text = JSON.stringify(data, null, 2);
    navigator.clipboard?.writeText(text).then(
      () => window.alert(`${Object.keys(data).length} coordinate(s) copied. Paste them to Claude to lock.`),
      () => window.prompt('Copy these coordinates:', text)
    );
  };

  const mapItems = useMemo(() => createMapItems(), []);
  const validationReport = useMemo(() => validateUniversityCoordinates(mapItems), [mapItems]);
  const [selectedId, setSelectedId] = useState(() => mapItems[0]?.id || '');
  const selected = useMemo(
    () => mapItems.find((item) => item.id === selectedId) || mapItems[0],
    [mapItems, selectedId]
  );

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

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
    if (typeof window === 'undefined') return undefined;
    window.__accaUniversityGeoValidation = validationReport;
  }, [validationReport]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = mapContainerRef.current;
    if (!canvas || !container) return undefined;
    let active = true;
    const startedAt = performance.now();
    let geospatialCleanup = null;
    let fallbackCleanup = null;
    setSceneReady(false);
    setMapMode('loading');

    const markReady = () => {
      const remaining = Math.max(0, 1200 - (performance.now() - startedAt));
      window.setTimeout(() => {
        if (active) setSceneReady(true);
      }, remaining);
    };

    const startFallback = (reason) => {
      if (!active || fallbackCleanup) return;
      window.__accaMapFallbackReason = reason?.message || String(reason || 'unknown fallback trigger');
      geospatialCleanup?.();
      geospatialApiRef.current = null;
      setMapMode('fallback');
      fallbackCleanup = initIstanbulScene({
        canvas,
        darkMode,
        items: mapItems,
        onPick: (id) => {
          setSelectedId(id);
          setProfileOpen(true);
        },
        onReady: markReady,
        apiRef: sceneApiRef,
      });
    };

    loadMapLibre()
      .then((maplibregl) => {
        if (!active) return;
        try {
          geospatialCleanup = initGeospatialMap({
            maplibregl,
            container,
            darkMode,
            editable: editing,
            items: mapItems,
            selectedId: selectedIdRef.current,
            onPick: (id) => {
              setSelectedPlace(null);
              setSelectedId(id);
              setProfileOpen(true);
            },
            onPlacePick: (place) => {
              setSelectedPlace(place);
              setProfileOpen(false);
            },
            onReady: () => {
              if (!active) return;
              setMapMode('geospatial');
              markReady();
            },
            onError: startFallback,
            apiRef: geospatialApiRef,
          });
        } catch (error) {
          startFallback(error);
        }
      })
      .catch(startFallback);

    return () => {
      active = false;
      geospatialCleanup?.();
      fallbackCleanup?.();
      geospatialApiRef.current = null;
    };
  }, [darkMode, mapItems, validationReport, editing]);

  useEffect(() => {
    if (!debugMap) return undefined;
    const update = () => {
      setDebugSnapshot({
        engine: window.__accaMapEngine || mapMode,
        ready: Boolean(window.__acca3DMapReady || window.__accaGeospatialMapReady),
        markerCount: window.__acca3DMapMarkerCount || window.__accaGeospatialMarkerCount || mapItems.length,
        adjustedMarkerCount: window.__acca3DMapAdjustedMarkerCount || 0,
        validation: window.__accaUniversityGeoValidation || validationReport,
        quality: window.__accaMapQualityTier || 'unknown',
        zoom: window.__accaMapZoom,
        pitch: window.__accaMapPitch,
        bearing: window.__accaMapBearing,
      });
    };
    update();
    const interval = window.setInterval(update, 900);
    return () => window.clearInterval(interval);
  }, [debugMap, mapItems.length, mapMode, validationReport]);

  const handleSelect = (id) => {
    setSelectedId(id);
    setProfileOpen(true);
    if (mapMode === 'geospatial') geospatialApiRef.current?.focusUniversity(id);
    else sceneApiRef.current?.focusUniversity(id);
  };

  const handleReset = () => {
    if (mapMode === 'geospatial') geospatialApiRef.current?.resetView();
    else sceneApiRef.current?.resetView();
  };

  return (
    <div
      className={`${darkMode ? 'bg-[#061018] text-white' : 'bg-[#EAF6F8] text-[#071A3D]'} relative min-h-screen overflow-hidden`}
      dir={isFa ? 'rtl' : 'ltr'}
    >
      <div
        ref={mapContainerRef}
        data-istanbul-geospatial-map
        className={`absolute inset-0 h-full min-h-screen w-full transition-opacity duration-700 ${mapMode === 'fallback' ? 'opacity-0' : 'opacity-100'}`}
      />
      <canvas
        ref={canvasRef}
        data-istanbul-map-canvas
        aria-label={isFa ? 'نقشه سه بعدی دانشگاه های استانبول' : '3D map of Istanbul universities'}
        className={`absolute inset-0 h-full min-h-screen w-full touch-none transition-opacity duration-700 ${mapMode === 'fallback' ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      <style>
        {`
          @keyframes acca-map-loader-sweep {
            0% { transform: translateX(-110%) rotate(10deg); opacity: 0; }
            18% { opacity: .82; }
            78% { opacity: .35; }
            100% { transform: translateX(110%) rotate(10deg); opacity: 0; }
          }
          @keyframes acca-map-scan {
            0% { transform: translateY(-18%) scaleX(.86); opacity: 0; }
            28% { opacity: .55; }
            100% { transform: translateY(118%) scaleX(1.04); opacity: 0; }
          }
          @keyframes acca-map-pulse {
            0%, 100% { transform: scale(.96); opacity: .55; }
            50% { transform: scale(1.04); opacity: 1; }
          }
          .acca-mapbox-canvas,
          .maplibregl-canvas { outline: none; }
          .maplibregl-ctrl-attrib {
            border-radius: 999px 0 0 0;
            background: rgba(255,255,255,.72) !important;
            color: rgba(7,26,61,.68) !important;
            font: 700 10px/1.4 ui-sans-serif, system-ui, sans-serif;
            backdrop-filter: blur(16px);
          }
          .acca-geo-beacon {
            width: 34px;
            height: 48px;
            position: relative;
            transform-origin: 50% 100%;
            transition: transform .28s ease, opacity .28s ease, filter .28s ease;
            cursor: pointer;
          }
          .acca-geo-beacon::before {
            content: '';
            position: absolute;
            left: 50%;
            bottom: 3px;
            width: 28px;
            height: 28px;
            border: 1px solid rgba(216,176,91,.62);
            border-radius: 999px;
            transform: translateX(-50%) rotateX(62deg);
            background: radial-gradient(circle, rgba(216,176,91,.22), rgba(216,176,91,0) 68%);
            box-shadow: 0 0 18px rgba(216,176,91,.28);
            animation: acca-map-pulse 2.8s ease-in-out infinite;
          }
          .acca-geo-beacon::after {
            content: '';
            position: absolute;
            left: 50%;
            bottom: 13px;
            width: 2px;
            height: 30px;
            transform: translateX(-50%);
            background: linear-gradient(180deg, rgba(255,255,255,0), rgba(216,176,91,.86), rgba(216,176,91,0));
            filter: drop-shadow(0 0 8px rgba(216,176,91,.38));
          }
          .acca-geo-beacon__core {
            position: absolute;
            left: 50%;
            bottom: 28px;
            display: grid;
            width: 24px;
            height: 24px;
            place-items: center;
            transform: translateX(-50%);
            border: 1px solid rgba(255,255,255,.82);
            border-radius: 9px;
            background: linear-gradient(145deg, rgba(7,26,61,.94), rgba(17,48,91,.88));
            color: #fff;
            box-shadow: 0 12px 30px rgba(7,26,61,.28), 0 0 0 3px rgba(216,176,91,.12);
            font: 900 10px/1 ui-sans-serif, system-ui, sans-serif;
          }
          .acca-geo-beacon.is-asia .acca-geo-beacon__core {
            box-shadow: 0 12px 30px rgba(7,26,61,.28), 0 0 0 3px rgba(31,171,148,.16);
          }
          .acca-geo-beacon.is-selected {
            z-index: 5;
            transform: scale(1.38);
            filter: drop-shadow(0 20px 34px rgba(7,26,61,.30));
          }
          .acca-geo-beacon.is-muted {
            opacity: .54;
            transform: scale(.82);
          }
          .acca-geo-label {
            position: absolute;
            left: 50%;
            bottom: 54px;
            min-width: 120px;
            transform: translateX(-50%) translateY(6px);
            border: 1px solid rgba(255,255,255,.74);
            border-radius: 15px;
            background: rgba(255,255,255,.74);
            color: #071A3D;
            padding: 7px 9px;
            text-align: center;
            box-shadow: 0 16px 46px rgba(7,26,61,.18);
            opacity: 0;
            pointer-events: none;
            transition: opacity .22s ease, transform .22s ease;
            backdrop-filter: blur(18px);
          }
          .acca-geo-beacon.is-selected .acca-geo-label,
          .acca-geo-beacon:hover .acca-geo-label {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          .acca-geo-label strong {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font: 900 11px/1.25 ui-sans-serif, system-ui, sans-serif;
          }
          .acca-geo-label span {
            display: block;
            margin-top: 3px;
            color: rgba(7,26,61,.58);
            font: 800 9px/1.2 ui-sans-serif, system-ui, sans-serif;
          }
        `}
      </style>

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${
          darkMode
            ? 'bg-[linear-gradient(180deg,rgba(1,8,20,0.10)_0%,rgba(1,8,20,0.00)_38%,rgba(1,8,20,0.70)_100%)]'
            : 'bg-[linear-gradient(180deg,rgba(234,246,248,0.08)_0%,rgba(234,246,248,0.00)_44%,rgba(234,246,248,0.62)_100%)]'
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${
          darkMode
            ? 'bg-[radial-gradient(circle_at_50%_42%,rgba(7,26,61,0)_0%,rgba(7,26,61,0)_42%,rgba(7,26,61,0.42)_82%,rgba(1,8,20,0.86)_100%)]'
            : 'bg-[radial-gradient(circle_at_50%_42%,rgba(234,246,248,0)_0%,rgba(234,246,248,0)_46%,rgba(234,246,248,0.42)_84%,rgba(7,26,61,0.18)_100%)]'
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-24 h-px transition-opacity duration-500 ${sceneReady ? 'opacity-0' : 'opacity-100'}`}
        style={{
          animation: sceneReady ? 'none' : 'acca-map-scan 2.8s ease-out infinite',
          background: darkMode
            ? 'linear-gradient(90deg, transparent, rgba(122,240,255,.72), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(7,26,61,.34), transparent)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 opacity-35 mix-blend-overlay sm:block"
      >
        <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-white" />
        <span className="absolute bottom-0 left-1/2 h-3 w-px -translate-x-1/2 bg-white" />
        <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-white" />
        <span className="absolute right-0 top-1/2 h-px w-3 -translate-y-1/2 bg-white" />
        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white" />
      </div>

      <div
        aria-live="polite"
        aria-busy={!sceneReady}
        className={`${sceneReady ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'} fixed inset-0 z-50 grid place-items-center px-6 transition-opacity duration-700`}
      >
        <div className={`${darkMode ? 'border-white/14 bg-[#061018]/86 text-white' : 'border-white/90 bg-white/84 text-[#071A3D]'} relative w-full max-w-sm overflow-hidden rounded-[28px] border p-5 text-center shadow-[0_32px_110px_rgba(7,26,61,0.28)] backdrop-blur-2xl`}>
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{ animation: 'acca-map-loader-sweep 2.1s ease-in-out infinite' }}
          />
          <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#071A3D] text-white shadow-[0_18px_45px_rgba(7,26,61,0.24)]">
            <div className="absolute inset-2 rounded-full border border-[#D8B05B]/70" style={{ animation: 'acca-map-pulse 1.8s ease-in-out infinite' }} />
            <MapPin size={24} />
          </div>
          <div className={`${darkMode ? 'text-amber-200' : 'text-amber-700'} relative mt-4 text-[10px] font-black uppercase tracking-[0.34em]`}>
            ACCA Tactical Atlas
          </div>
          <div className="relative mt-2 text-lg font-black">
            {isFa ? 'آماده‌سازی نقشه استانبول' : 'Preparing Istanbul map'}
          </div>
          <div className={`${darkMode ? 'text-white/58' : 'text-[#071A3D]/58'} relative mt-2 text-xs font-bold leading-6`}>
            {isFa ? 'زمین، بوغاز، ابرها و موقعیت دانشگاه‌ها در حال هماهنگ‌سازی است.' : 'Terrain, Bosphorus, clouds and university beacons are being aligned.'}
          </div>
          <div className={`${darkMode ? 'bg-white/10' : 'bg-[#071A3D]/10'} relative mt-4 h-1.5 overflow-hidden rounded-full`}>
            <div className="h-full w-2/3 rounded-full bg-[#D8B05B]" style={{ animation: 'acca-map-loader-sweep 1.65s ease-in-out infinite' }} />
          </div>
        </div>
      </div>

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

        <div className="pointer-events-auto fixed left-1/2 top-[84px] z-40 flex -translate-x-1/2 items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-2 rounded-full border-2 border-[#D8B05B] bg-[#071A3D] px-3 py-2 text-xs font-black text-white shadow-[0_18px_50px_rgba(7,26,61,0.4)]">
              <span>✏️ {isFa ? 'نشانگرها را به محل دقیق بکشید' : 'Drag pins to the exact spot'}</span>
              <button
                type="button"
                onClick={copyEditedCoordinates}
                className="rounded-full bg-[#D8B05B] px-3 py-1 font-black text-[#071A3D]"
              >
                {isFa ? 'کپی مختصات' : 'Copy coords'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-full bg-white/15 px-3 py-1 font-black hover:bg-white/25"
              >
                {isFa ? 'پایان' : 'Done'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={`${darkMode ? 'border-white/15 bg-[#071A3D]/85 text-white' : 'border-[#071A3D]/15 bg-white/85 text-[#071A3D]'} flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-black shadow-[0_14px_40px_rgba(7,26,61,0.18)] backdrop-blur-xl`}
            >
              ✏️ {isFa ? 'ویرایش موقعیت‌ها' : 'Edit positions'}
            </button>
          )}
        </div>

        <aside className={`pointer-events-auto absolute bottom-3 ${isFa ? 'left-3' : 'right-3'} w-[min(430px,calc(100vw-24px))] sm:bottom-6 ${isFa ? 'sm:left-6' : 'sm:right-6'}`}>
          {selectedPlace ? (() => {
            const meta = PLACE_KIND_META[selectedPlace.kind] || { icon: '📍', color: '#071A3D', fa: 'مکان', en: 'Place' };
            return (
            <div className={`${darkMode ? 'border-white/12 bg-[#061018]/86 text-white' : 'border-white/85 bg-white/90 text-[#071A3D]'} overflow-hidden rounded-[22px] border shadow-[0_18px_58px_rgba(7,26,61,0.2)] backdrop-blur-2xl`}>
              {/* Quick-profile header — real photo if provided, else a category tile */}
              <div className="relative grid h-20 place-items-center" style={{ background: `linear-gradient(135deg, ${meta.color}, #071A3D)` }}>
                {selectedPlace.photo ? (
                  <img src={selectedPlace.photo} alt={selectedPlace.name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                ) : (
                  <span className="text-4xl drop-shadow">{meta.icon}</span>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedPlace(null)}
                  aria-label={isFa ? 'بستن' : 'Close'}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/35 text-lg font-black text-white backdrop-blur hover:bg-black/55"
                >
                  ×
                </button>
              </div>
              <div className="px-4 py-3.5">
                <div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: meta.color }}>
                  {isFa ? meta.fa : meta.en}
                </div>
                <div className="mt-1 text-sm font-black leading-snug">{selectedPlace.name}</div>
                {selectedPlace.district ? (
                  <div className="mt-0.5 truncate text-[11px] font-bold opacity-65">{selectedPlace.district}</div>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.lat},${selectedPlace.lon}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#071A3D] px-3 text-xs font-black text-white"
                  >
                    📍 {isFa ? 'باز کردن در نقشه' : 'Open in Maps'}
                  </a>
                  {selectedPlace.href ? (
                    <a
                      href={selectedPlace.href}
                      className={`${darkMode ? 'border-white/15 bg-white/8 text-white' : 'border-black/10 bg-white/70 text-[#071A3D]'} inline-flex h-9 flex-1 items-center justify-center rounded-full border px-3 text-xs font-black`}
                    >
                      {isFa ? 'اطلاعات بیشتر' : 'More info'}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
            );
          })() : profileOpen ? (
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

      {debugMap ? (
        <aside className={`${darkMode ? 'border-white/12 bg-[#061018]/82 text-white' : 'border-white/80 bg-white/82 text-[#071A3D]'} pointer-events-none fixed bottom-4 right-4 z-40 hidden w-72 rounded-[18px] border p-3 text-[11px] font-bold shadow-[0_18px_60px_rgba(7,26,61,0.18)] backdrop-blur-2xl lg:block`}>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.26em] text-amber-600">Map Debug</div>
          {[
            ['engine', debugSnapshot?.engine],
            ['ready', String(debugSnapshot?.ready)],
            ['quality', debugSnapshot?.quality],
            ['markers', debugSnapshot?.markerCount],
            ['adjusted', debugSnapshot?.adjustedMarkerCount],
            ['zoom', debugSnapshot?.zoom],
            ['pitch', debugSnapshot?.pitch],
            ['bearing', debugSnapshot?.bearing],
            ['invalid coords', debugSnapshot?.validation?.invalid?.length || 0],
            ['water-risk', debugSnapshot?.validation?.waterRisk?.length || 0],
            ['duplicates', debugSnapshot?.validation?.duplicates?.length || 0],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 border-t border-current/10 py-1">
              <span className="opacity-58">{label}</span>
              <span className="font-black">{value ?? '-'}</span>
            </div>
          ))}
        </aside>
      ) : null}
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
    const renderGeo = snapGeoToRenderableLand(geo);
    const coords = projectGeo(renderGeo.lat, renderGeo.lon);
    const campuses = (university.campuses || []).filter(Boolean);
    const profileValue = university.slug || university.name;

    return {
      id: university.id || university.slug || university.name,
      name: university.name,
      logo: university.logo,
      lat: geo.lat,
      lon: geo.lon,
      renderLat: renderGeo.lat,
      renderLon: renderGeo.lon,
      renderAdjusted: Boolean(renderGeo.renderAdjusted),
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

function initGeospatialMap({ maplibregl, container, darkMode, editable, items, selectedId, onPick, onPlacePick, onReady, onError, apiRef }) {
  if (!supportsGeospatialWebGL(maplibregl)) {
    throw new Error('MapLibre WebGL is not supported');
  }

  container.innerHTML = '';
  const compactViewport = window.innerWidth < 760 || window.devicePixelRatio > 2;
  const markersById = new Map();
  let loaded = false;

  const map = new maplibregl.Map({
    container,
    style: MAPBOX_STYLE,
    center: MAP_CONFIG.center,
    zoom: compactViewport ? 8.85 : MAP_CONFIG.initial.zoom,
    pitch: compactViewport ? 43 : MAP_CONFIG.initial.pitch,
    bearing: compactViewport ? -12 : MAP_CONFIG.initial.bearing,
    minZoom: MAP_CONFIG.limits.minZoom,
    maxZoom: MAP_CONFIG.limits.maxZoom,
    maxPitch: MAP_CONFIG.limits.maxPitch,
    maxBounds: MAP_CONFIG.bounds,
    renderWorldCopies: false,
    attributionControl: true,
    cooperativeGestures: false,
    antialias: true,
  });

  // Mapbox Standard Satellite — dusk cinematic preset, labels but no road/POI
  // clutter (we add our own beacons). Set after style load so config applies.
  map.on('style.load', () => {
    try {
      map.setConfigProperty('basemap', 'lightPreset', 'dusk');
      map.setConfigProperty('basemap', 'showRoadLabels', false);
      map.setConfigProperty('basemap', 'showPointOfInterestLabels', false);
      map.setConfigProperty('basemap', 'showTransitLabels', false);
      map.setConfigProperty('basemap', 'showPlaceLabels', true);
    } catch { /* config props are best-effort across versions */ }
    // Real elevation from Mapbox Terrain DEM (restrained exaggeration).
    try {
      if (!map.getSource('mapbox-dem')) {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
      }
      map.setTerrain({ source: 'mapbox-dem', exaggeration: compactViewport ? 1.05 : 1.2 });
    } catch { /* terrain is an enhancement */ }
  });

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true, showCompass: true }), 'bottom-right');

  const syncDebug = () => {
    window.__accaMapEngine = 'mapbox';
    window.__accaGeospatialMapReady = loaded;
    window.__accaGeospatialMarkerCount = items.length;
    window.__accaMapQualityTier = compactViewport ? 'medium-mobile' : 'high-desktop';
    window.__accaMapZoom = Number(map.getZoom().toFixed(2));
    window.__accaMapPitch = Number(map.getPitch().toFixed(1));
    window.__accaMapBearing = Number(map.getBearing().toFixed(1));
  };

  const setSelectedMarker = (id) => {
    markersById.forEach((element, markerId) => {
      const selected = markerId === id;
      const core = element.querySelector('.uni-core');
      const label = element.querySelector('.uni-label');
      if (selected) element.dataset.selected = '1';
      else delete element.dataset.selected;
      if (core) {
        core.style.borderColor = selected ? '#D8B05B' : 'rgba(255,255,255,0.85)';
        core.style.boxShadow = selected
          ? '0 0 0 4px rgba(216,176,91,0.4), 0 8px 18px rgba(7,26,61,0.45)'
          : '0 6px 14px rgba(7,26,61,0.4)';
      }
      if (label) label.style.opacity = selected ? '1' : '0';
      element.style.zIndex = selected ? '7' : '1';
    });
  };

  const focusUniversity = (id) => {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    setSelectedMarker(id);
    map.flyTo({
      center: [item.lon, item.lat],
      zoom: compactViewport ? 11.15 : 12.15,
      pitch: compactViewport ? 48 : 62,
      bearing: item.side === 'asia' ? -28 : 18,
      speed: 0.72,
      curve: 1.38,
      essential: false,
    });
  };

  const resetView = () => {
    map.flyTo({
      center: MAP_CONFIG.center,
      zoom: compactViewport ? 8.85 : MAP_CONFIG.initial.zoom,
      pitch: compactViewport ? 43 : MAP_CONFIG.initial.pitch,
      bearing: compactViewport ? -12 : MAP_CONFIG.initial.bearing,
      speed: 0.78,
      curve: 1.32,
      essential: false,
    });
  };

  apiRef.current = { focusUniversity, resetView };

  map.on('load', () => {
    loaded = true;
    window.__accaMapFallbackReason = '';
    addGeospatialInfrastructure(map, darkMode);
    addGeospatialUniversityMarkers({ maplibregl, map, items, selectedId, markersById, onPick, focusUniversity, editable });
    addOfficeMarker({ maplibregl, map, onPlacePick, editable });
    addLandmarkMarkers({ maplibregl, map, onPlacePick, editable });
    addPlaceMarkers({ maplibregl, map, onPlacePick, editable });
    try { addThreeDLandmarks({ map, items }); } catch { /* 3D layer is additive */ }
    try { map.addLayer(createCinematicThreeLayer(maplibregl)); } catch { /* cinematic 3D layer is additive */ }
    applyCinematicAtmosphere(map, darkMode);
    setSelectedMarker(selectedId);
    syncDebug();
    onReady?.();
  });

  map.on('move', syncDebug);
  map.on('zoom', syncDebug);
  map.on('pitch', syncDebug);
  map.on('error', (event) => {
    if (!loaded && event?.error) onError?.(event.error);
  });

  return () => {
    markersById.clear();
    apiRef.current = null;
    window.__accaGeospatialMapReady = false;
    map.remove();
  };
}

function createGeospatialStyle(darkMode) {
  const terrainDemSource = {
    type: 'raster-dem',
    tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
    encoding: 'terrarium',
    tileSize: 256,
    maxzoom: 13,
    attribution: 'Terrain tiles © AWS Open Data / Mapzen',
  };
  const mapboxSatellite = MAP_CONFIG.mapboxToken
    ? {
        type: 'raster',
        tiles: [
          `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/512/{z}/{x}/{y}@2x?access_token=${MAP_CONFIG.mapboxToken}`,
        ],
        tileSize: 512,
        attribution: '© Mapbox © OpenStreetMap',
      }
    : null;

  const satelliteSource = MAP_CONFIG.provider === 'mapbox' && mapboxSatellite
    ? mapboxSatellite
    : {
        type: 'raster',
        tiles: [
          'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: 'Tiles © Esri, Maxar, Earthstar Geographics, and the GIS User Community',
      };

  return {
    version: 8,
    sources: {
      satellite: satelliteSource,
      'terrain-dem': {
        ...terrainDemSource,
      },
      'terrain-hillshade-dem': {
        ...terrainDemSource,
      },
    },
    layers: [
      {
        id: 'satellite',
        type: 'raster',
        source: 'satellite',
        paint: {
          'raster-saturation': darkMode ? -0.46 : -0.22,
          'raster-contrast': darkMode ? 0.18 : 0.08,
          'raster-brightness-min': darkMode ? 0.08 : 0.02,
          'raster-brightness-max': darkMode ? 0.82 : 0.94,
        },
      },
      {
        id: 'terrain-hillshade',
        type: 'hillshade',
        source: 'terrain-hillshade-dem',
        paint: {
          'hillshade-shadow-color': darkMode ? '#071A3D' : '#34475f',
          'hillshade-highlight-color': darkMode ? '#d8b05b' : '#fff3d2',
          'hillshade-accent-color': darkMode ? '#102944' : '#5d7c89',
          'hillshade-exaggeration': darkMode ? 0.23 : 0.16,
        },
      },
    ],
    terrain: {
      source: 'terrain-dem',
      exaggeration: window.innerWidth < 760
        ? MAP_CONFIG.terrain.exaggerationMobile
        : MAP_CONFIG.terrain.exaggerationDesktop,
    },
    sky: {
      'sky-color': darkMode ? '#07111d' : '#c8eef8',
      'sky-horizon-blend': 0.08,
      'horizon-color': darkMode ? '#0d2a3d' : '#eaf6f8',
      'fog-color': darkMode ? '#07111d' : '#dff4f6',
      'fog-ground-blend': MAP_CONFIG.lighting.atmosphere,
    },
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  };
}

function addGeospatialInfrastructure(map, darkMode) {
  // The Esri satellite basemap already shows the real road network, so the
  // hand-drawn highway corridors (O-7 / E80 / D100) and the translucent airport
  // fills were redundant overlays that did not align with the imagery. They are
  // intentionally NOT rendered. Only the Bosphorus bridges are kept as a subtle
  // gold accent, since they read as a deliberate landmark highlight rather than
  // a mislabeled road. (Full real-vector infrastructure is a later phase.)
  const infrastructure = createInfrastructureFeatureCollections();
  map.addSource('acca-bridges', { type: 'geojson', data: infrastructure.bridges });

  map.addLayer({
    id: 'acca-bridge-core',
    type: 'line',
    source: 'acca-bridges',
    paint: {
      'line-color': '#D8B05B',
      'line-width': ['interpolate', ['linear'], ['zoom'], 8, 2.2, 12, 5.6],
      'line-blur': 0.25,
      'line-opacity': 0.96,
    },
  });
}

// In edit mode, every drag writes the marker's new position into a global the
// "Copy coordinates" button reads, so positions can be captured and then locked.
function recordEditedCoord(key, marker) {
  if (typeof window === 'undefined') return;
  const ll = marker.getLngLat();
  window.__accaEditedCoords = window.__accaEditedCoords || {};
  window.__accaEditedCoords[key] = [Number(ll.lat.toFixed(5)), Number(ll.lng.toFixed(5))];
}

function addGeospatialUniversityMarkers({ maplibregl, map, items, selectedId, markersById, onPick, focusUniversity, editable }) {
  items.forEach((item) => {
    const fill = item.side === 'asia' ? '#15406e' : '#0d2a52';
    const element = document.createElement('button');
    element.type = 'button';
    element.style.cssText = 'background:none;border:none;padding:0;cursor:pointer;';
    element.setAttribute('aria-label', `${item.name}, ${item.district}`);
    // Same simple, inline-styled, viewport-anchored pin as the office/landmark
    // markers (which are rock-solid static). No ground-ring / rotateX / pulse
    // CSS — that screen-space ring was faked onto the ground and detached on
    // pitch/rotate, which is what made the university markers look like they
    // floated and drifted.
    // Compact pin by default (just the initials), so the map stays clean like a
    // game world-map. The full name only appears on hover or when selected.
    element.innerHTML = `
      <span style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 5px 12px rgba(7,26,61,0.4));">
        <span class="uni-label" style="opacity:0;transition:opacity .15s;pointer-events:none;white-space:nowrap;margin-bottom:4px;padding:2px 7px;border-radius:999px;background:rgba(255,255,255,0.94);color:#071A3D;font-weight:800;font-size:9px;max-width:160px;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(item.name)}</span>
        <span class="uni-core" style="display:grid;place-items:center;width:27px;height:27px;border-radius:9px 9px 9px 3px;transform:rotate(45deg);background:${fill};border:2.5px solid #ffffff;box-shadow:0 0 0 1px rgba(7,26,61,0.25),0 7px 16px rgba(7,26,61,0.5);transition:border-color .2s,box-shadow .2s;">
          <span style="transform:rotate(-45deg);color:#fff;font-weight:900;font-size:9px;line-height:1;">${escapeHtml(getUniversityInitials(item.name))}</span>
        </span>
      </span>
    `;
    const labelEl = element.querySelector('.uni-label');
    element.addEventListener('mouseenter', () => { labelEl.style.opacity = '1'; element.style.zIndex = '7'; });
    element.addEventListener('mouseleave', () => {
      if (!element.dataset.selected) { labelEl.style.opacity = '0'; element.style.zIndex = '1'; }
    });
    element.addEventListener('click', (event) => {
      event.stopPropagation();
      onPick(item.id);
      focusUniversity(item.id);
    });

    const marker = new maplibregl.Marker({ element, anchor: 'bottom', draggable: Boolean(editable) })
      .setLngLat([item.lon, item.lat])
      .addTo(map);
    if (editable) marker.on('dragend', () => recordEditedCoord(item.name, marker));

    markersById.set(item.id, element);
  });
}

function applyCinematicAtmosphere(map, darkMode) {
  // Mapbox v3 atmospheric fog: adds horizon haze and depth, and dissolves the
  // far edge of the streamed map into atmosphere so no technical boundary shows
  // at the minimum zoom. (Mapbox Standard handles the sky itself.) Guarded.
  if (typeof map.setFog !== 'function') return;
  try {
    map.setFog({
      range: [1.5, 10],
      color: darkMode ? '#0d2138' : '#e9eef0',
      'high-color': darkMode ? '#13314f' : '#bcd6e6',
      'space-color': darkMode ? '#06101f' : '#9fbdd6',
      'horizon-blend': 0.12,
      'star-intensity': darkMode ? 0.08 : 0.0,
    });
  } catch {
    /* fog is a visual enhancement only */
  }
}

// Additional (secondary/third) campuses, geocoded on-land in their real
// districts, so multi-campus universities show every site — not just one.
const EXTRA_CAMPUSES = [
  ['Koc University', 41.1850, 29.0400, 'West Campus · Zekeriyaköy'],
  ['Dogus University', 41.0050, 29.1730, 'Dudullu · Ümraniye'],
  ['Istanbul Gedik University', 40.8780, 29.2530, 'Pendik'],
  ['Istanbul Gedik University', 41.0530, 28.9950, 'Nişantaşı · Şişli'],
  ['Istanbul Topkapi University', 41.0050, 28.6600, 'Bahçeşehir · Esenyurt'],
  ['Istanbul Topkapi University', 41.0220, 29.0400, 'Altunizade · Üsküdar'],
  ['Okan University', 40.9930, 29.0360, 'Kadıköy · Hasanpaşa'],
  ['Okan University', 41.0660, 28.9960, 'Mecidiyeköy · Şişli'],
  ['Istanbul Nisantasi University', 41.0850, 28.9720, 'Kağıthane'],
  ['Istinye University', 41.0150, 28.9180, 'Topkapı · Zeytinburnu'],
  ['Istanbul Medipol University', 41.0250, 28.9540, 'Haliç · Cibali'],
  ['Istanbul Kultur University', 40.9920, 28.8720, 'İncirli · Bakırköy'],
  ['Istanbul Kent University', 41.0860, 28.9750, 'Kâğıthane'],
  ['Uskudar University', 41.0260, 29.0130, 'Çarşı · Üsküdar'],
  ['Beykoz University', 41.1080, 29.0780, 'Çubuklu'],
  ['Beykent University', 41.0330, 28.9830, 'Taksim · Beyoğlu'],
  ['Beykent University', 41.1170, 28.7250, 'Hadımköy · Esenyurt'],
  ['Bahcesehir University', 40.9780, 29.0620, 'Göztepe · Kadıköy'],
  ['Altinbas University', 40.9920, 28.8720, 'Bakırköy · İncirli'],
  ['Istanbul Arel University', 41.0130, 28.9270, 'Cevizlibağ · Zeytinburnu'],
  ['Isik University', 41.1080, 29.0190, 'Maslak · Levent'],
  ['Istanbul Yeni Yuzyil University', 41.0450, 28.9480, 'Dentistry · Sütlüce'],
];

// Key landmarks that help a first-time student orient: the two airports and the
// main university teaching hospitals. [type, name, lon, lat].
const MAP_LANDMARKS = [
  ['airport', 'Istanbul Airport (IST)', 28.7280, 41.2620],
  ['airport', 'Sabiha Gökçen Airport (SAW)', 29.3092, 40.8986],
  ['hospital', 'Acıbadem Maslak Hospital', 29.0180, 41.1080],
  ['hospital', 'Medipol Mega University Hospital', 28.84293, 41.05827],
  ['hospital', 'Memorial Şişli Hospital', 28.9870, 41.0630],
  ['hospital', 'Liv Hospital Ulus', 29.0200, 41.0600],
];

// Student-relevant categories. Icon/colour per category. Used by markers,
// 3D volumes and the info panel.
const PLACE_CATEGORIES = {
  museum:      { icon: '🏺', color: '#8a5cc4', fa: 'موزه', en: 'Museum' },
  consulate:   { icon: '🚩', color: '#2a8c8c', fa: 'کنسولگری', en: 'Consulate' },
  immigration: { icon: '🛂', color: '#2f6b4f', fa: 'اداره مهاجرت', en: 'Migration office' },
  dorm:        { icon: '🛏️', color: '#d98a3d', fa: 'خوابگاه دانشجویی', en: 'Student dorm' },
  library:     { icon: '📚', color: '#9a6b3f', fa: 'کتابخانه و فضای مطالعه', en: 'Library & study space' },
};

// Important Istanbul places per category. Starter coordinates (close to the real
// spot) — they are fully draggable in edit mode so positions can be made exact
// and then locked. [category, name, lon, lat].
const MAP_PLACES = [
  // Museums
  ['museum', 'Hagia Sophia', 28.9802, 41.0086],
  ['museum', 'Topkapı Palace', 28.9834, 41.0115],
  ['museum', 'Istanbul Archaeology Museums', 28.9814, 41.0117],
  ['museum', 'Istanbul Modern', 28.9836, 41.0275],
  ['museum', 'Pera Museum', 28.9745, 41.0316],
  ['museum', 'Dolmabahçe Palace', 29.0006, 41.0391],
  // Consulates
  ['consulate', 'U.S. Consulate General', 29.0560, 41.1098],
  ['consulate', 'German Consulate General', 28.9805, 41.0345],
  ['consulate', 'UK Consulate General', 28.9772, 41.0335],
  ['consulate', 'French Consulate General', 28.9847, 41.0367],
  ['consulate', 'Italian Consulate General', 28.9785, 41.0322],
  ['consulate', 'Russian Consulate General', 28.9817, 41.0330],
  // Migration / Göç İdaresi offices
  ['immigration', 'İstanbul Provincial Migration Office (Kumkapı)', 28.9685, 41.0040],
  ['immigration', 'Migration Office — Esenler', 28.8780, 41.0430],
  ['immigration', 'Migration Office — Pendik (Asian side)', 29.2500, 40.8800],
  // Student dorms / housing
  ['dorm', 'KYK Atatürk Student Dorm', 28.9600, 41.0400],
  ['dorm', 'KYK Çağlayan Student Dorm', 28.9900, 41.0700],
  ['dorm', 'KYK Avcılar Student Dorm', 28.7200, 40.9900],
  ['dorm', 'Student Housing — Esenyurt', 28.6700, 41.0250],
  // Libraries & study spaces
  ['library', 'Atatürk Library (Taksim)', 28.9890, 41.0375],
  ['library', 'Beyazıt State Library', 28.9648, 41.0107],
  ['library', 'Rami Library', 28.9230, 41.0560],
  ['library', 'Orhan Kemal Public Library', 28.97722, 41.03442],
  ['library', 'Nuruosmaniye Library', 28.9710, 41.0100],
];

// Unified metadata for every non-university tag, used by the info panel header.
const PLACE_KIND_META = {
  office:   { icon: '🏛️', color: '#D8B05B', fa: 'دفتر مرکزی', en: 'Headquarters' },
  airport:  { icon: '✈️', color: '#5d6b80', fa: 'فرودگاه', en: 'Airport' },
  hospital: { icon: '🏥', color: '#b6444f', fa: 'بیمارستان دانشگاهی', en: 'University Hospital' },
  ...PLACE_CATEGORIES,
};

// A small square footprint (metres) around a point, for fill-extrusion volumes.
function squareFootprint(lon, lat, meters) {
  const dLat = meters / 111320;
  const dLon = meters / (111320 * Math.cos((lat * Math.PI) / 180));
  return [[
    [lon - dLon, lat - dLat],
    [lon + dLon, lat - dLat],
    [lon + dLon, lat + dLat],
    [lon - dLon, lat + dLat],
    [lon - dLon, lat - dLat],
  ]];
}

// Native MapLibre 3D: extruded volumes are part of the map geometry, so they are
// perfectly static and camera-locked (no drift), and tilt/rotate correctly with
// the camera. Heights are exaggerated so the towers read at the city overview
// zoom and grow into buildings as you zoom in.
// A rectangular footprint (half-width / half-length in metres), for terminals
// and runways that need a non-square shape.
function rectFootprint(lon, lat, halfLonM, halfLatM) {
  const dLat = halfLatM / 111320;
  const dLon = halfLonM / (111320 * Math.cos((lat * Math.PI) / 180));
  return [[
    [lon - dLon, lat - dLat],
    [lon + dLon, lat - dLat],
    [lon + dLon, lat + dLat],
    [lon - dLon, lat + dLat],
    [lon - dLon, lat - dLat],
  ]];
}

function addThreeDLandmarks({ map, items }) {
  const feature = (kind, color, height, base, coords) => ({
    type: 'Feature',
    properties: { kind, color, height, base },
    geometry: { type: 'Polygon', coordinates: coords },
  });
  const features = [];

  // A tapered tower: a stack of shrinking, rising tiers so it reads as a real
  // building/tower silhouette rather than a single flat cube.
  const pushTower = (lon, lat, kind, color, baseSize, totalHeight, tiers) => {
    const step = totalHeight / tiers;
    for (let i = 0; i < tiers; i++) {
      features.push(feature(kind, color, step * (i + 1), step * i, squareFootprint(lon, lat, baseSize * (1 - i * 0.2))));
    }
  };

  // Universities — primary campus: a two-tier navy building.
  items.forEach((item) => {
    pushTower(item.lon, item.lat, 'university', '#12345f', 165, 1400, 2);
  });
  // Universities — additional campuses: a slightly shorter two-tier building.
  EXTRA_CAMPUSES.forEach(([, lat, lon]) => {
    pushTower(lon, lat, 'campus', '#1c4576', 140, 1050, 2);
  });
  // Hospitals — a three-tier red building so it stands out from universities.
  MAP_LANDMARKS.filter(([type]) => type === 'hospital').forEach(([, , lon, lat]) => {
    pushTower(lon, lat, 'hospital', '#b6444f', 170, 1250, 3);
  });
  // Airports — a composite that actually reads as an airport: a wide low
  // terminal, a slim tall control tower, and two long thin runway strips.
  MAP_LANDMARKS.filter(([type]) => type === 'airport').forEach(([, , lon, lat]) => {
    features.push(feature('airport-terminal', '#6b788c', 300, 0, rectFootprint(lon, lat, 560, 300)));
    features.push(feature('airport-tower', '#9aa6b8', 1000, 0, squareFootprint(lon + 0.006, lat + 0.0015, 70)));
    features.push(feature('runway', '#39424f', 60, 0, rectFootprint(lon, lat - 0.0135, 950, 55)));
    features.push(feature('runway', '#39424f', 60, 0, rectFootprint(lon + 0.004, lat + 0.0135, 950, 55)));
  });
  // Student-relevant categories (museums, consulates, migration, dorms,
  // libraries): a two-tier building in each category colour.
  MAP_PLACES.forEach(([category, , lon, lat]) => {
    const cfg = PLACE_CATEGORIES[category];
    if (cfg) pushTower(lon, lat, category, cfg.color, 120, 850, 2);
  });
  // NOTE: the office is now a real animated Three.js tower (createCinematicThreeLayer),
  // so it is intentionally NOT extruded here to avoid a duplicate.

  map.addSource('acca-3d-landmarks', { type: 'geojson', data: { type: 'FeatureCollection', features } });
  map.addLayer({
    id: 'acca-3d-landmarks',
    type: 'fill-extrusion',
    source: 'acca-3d-landmarks',
    paint: {
      'fill-extrusion-color': ['get', 'color'],
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': ['get', 'base'],
      'fill-extrusion-opacity': 0.9,
      'fill-extrusion-vertical-gradient': true,
    },
  });
}

// ── Phase 6: synced Three.js custom WebGL layer ─────────────────────────────
// One Three.js scene shares Mapbox's WebGL context. The Three.js camera is
// driven each frame by Mapbox's projection matrix, so 3D content is locked to
// real geography and tracks pan/zoom/pitch/rotate exactly. This is the proof
// object — the HQ as an animated gold tower — and the foundation the cloud
// system and university models will build on.
function createCinematicThreeLayer(maplibregl) {
  const origin = maplibregl.MercatorCoordinate.fromLngLat([OFFICE_LOCATION.lon, OFFICE_LOCATION.lat], 0);
  const scale = origin.meterInMercatorCoordinateUnits();

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();

  // Dusk lighting to match the Mapbox preset.
  scene.add(new THREE.AmbientLight(0xb8cee6, 0.85));
  const sun = new THREE.DirectionalLight(0xffe4bd, 1.5);
  sun.position.set(-0.5, 0.35, 1).normalize();
  scene.add(sun);

  // HQ tower — a tapered, multi-tier gold building (heights/sizes in metres;
  // the whole scene is scaled to metres by the model matrix below).
  const tower = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd8b05b, metalness: 0.65, roughness: 0.32, emissive: 0x4a3413, emissiveIntensity: 0.45,
  });
  // [halfWidth(m), baseHeight(m), tierHeight(m)]
  [[140, 0, 700], [110, 700, 650], [80, 1350, 600], [50, 1950, 900]].forEach(([hw, base, h]) => {
    const box = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, h, hw * 2), goldMat);
    box.position.set(0, base + h / 2, 0);
    tower.add(box);
  });
  // Animated glowing objective ring above the tower.
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd87a, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(220, 320, 56), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, 3050, 0);
  tower.add(ring);
  scene.add(tower);

  // Scene placement helper: converts a lng/lat/altitude into scene coordinates
  // (metres) relative to the model origin. X=east, Y=up, Z=south.
  const scenePos = (lng, lat, altMeters) => {
    const m = maplibregl.MercatorCoordinate.fromLngLat([lng, lat], 0);
    return new THREE.Vector3((m.x - origin.x) / scale, altMeters, (m.y - origin.y) / scale);
  };

  // ── Phase 6b: layered cloud system ──────────────────────────────────────
  // Camera-facing sprites at altitude around the Istanbul region: a sparse high
  // deck plus a wider, larger horizon ring that softens the far edge. Subtle and
  // high so they never blanket the university markers.
  const cloudTex = makeCloudTexture();
  const clouds = [];
  // Each "cloud" is a CLUSTER of overlapping camera-facing sprites at slightly
  // different offsets — that reads as a fluffy volumetric mass instead of one
  // flat billboard. depthTest:false so they never clip/disappear on rotation.
  const addCloudPuff = (lng, lat, alt, baseSize, opacity) => {
    const center = scenePos(lng, lat, alt);
    const group = { sprites: [], baseX: center.x, baseZ: center.z, phase: Math.random() * Math.PI * 2, sway: 1400 + Math.random() * 2400 };
    const puffs = 5 + Math.floor(Math.random() * 3);
    for (let j = 0; j < puffs; j += 1) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: cloudTex, transparent: true, opacity: opacity * (0.7 + Math.random() * 0.5), depthWrite: false, depthTest: false,
      }));
      const ox = (Math.random() - 0.5) * baseSize * 1.1;
      const oy = (Math.random() - 0.5) * baseSize * 0.28;
      const oz = (Math.random() - 0.5) * baseSize * 1.1;
      sprite.position.set(center.x + ox, center.y + oy, center.z + oz);
      const s = baseSize * (0.55 + Math.random() * 0.7);
      sprite.scale.set(s, s * 0.72, 1);
      sprite.userData = { ox, oz };
      group.sprites.push(sprite);
      scene.add(sprite);
    }
    clouds.push(group);
  };
  // High deck — big fluffy clouds over the city.
  for (let i = 0; i < 16; i += 1) {
    addCloudPuff(28.45 + Math.random() * 1.25, 40.82 + Math.random() * 0.72, 2800 + Math.random() * 2800, 4200 + Math.random() * 3600, 0.4);
  }
  // Horizon ring — very large, low-contrast clouds that conceal the perimeter.
  for (let i = 0; i < 14; i += 1) {
    const ang = (i / 14) * Math.PI * 2;
    addCloudPuff(28.98 + Math.cos(ang) * 1.0, 41.05 + Math.sin(ang) * 0.66, 2200 + Math.random() * 2200, 9000 + Math.random() * 5000, 0.32);
  }

  let renderer = null;
  const start = typeof performance !== 'undefined' ? performance.now() : 0;
  const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);

  return {
    id: 'acca-cinematic-three',
    type: 'custom',
    renderingMode: '3d',
    onAdd(map, gl) {
      this.map = map;
      renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl, antialias: true });
      renderer.autoClear = false;
    },
    onRemove() {
      scene.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
      cloudTex.dispose?.();
      renderer?.dispose?.();
      renderer = null;
    },
    render(gl, matrix) {
      if (!renderer) return;
      const t = ((typeof performance !== 'undefined' ? performance.now() : 0) - start) / 1000;
      ring.rotation.z = t * 0.7;
      ring.scale.setScalar(1 + Math.sin(t * 2) * 0.07);
      ringMat.opacity = 0.5 + Math.sin(t * 2) * 0.22;
      for (let i = 0; i < clouds.length; i += 1) {
        const group = clouds[i];
        const dx = group.baseX + Math.sin(t * 0.04 + group.phase) * group.sway;
        const dz = group.baseZ + Math.cos(t * 0.03 + group.phase) * group.sway * 0.7;
        for (let j = 0; j < group.sprites.length; j += 1) {
          const sp = group.sprites[j];
          sp.position.x = dx + sp.userData.ox;
          sp.position.z = dz + sp.userData.oz;
        }
      }

      const m = new THREE.Matrix4().fromArray(matrix);
      const l = new THREE.Matrix4()
        .makeTranslation(origin.x, origin.y, origin.z)
        .scale(new THREE.Vector3(scale, -scale, scale))
        .multiply(rotationX);
      camera.projectionMatrix = m.multiply(l);
      renderer.resetState();
      renderer.render(scene, camera);
      this.map.triggerRepaint();
    },
  };
}

function addLandmarkMarkers({ maplibregl, map, onPlacePick, editable }) {
  MAP_LANDMARKS.forEach(([type, name, lon, lat]) => {
    const isAirport = type === 'airport';
    const element = document.createElement('button');
    element.type = 'button';
    element.style.cssText = 'background:none;border:none;padding:0;cursor:pointer;';
    element.setAttribute('aria-label', name);
    const accent = isAirport ? '#5d6b80' : '#b6444f';
    // Label hidden by default (revealed on hover) so the map stays clean, like
    // the university pins.
    element.innerHTML = `
      <span style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 6px 14px rgba(7,26,61,0.40));">
        <span class="place-label" style="opacity:0;transition:opacity .15s;pointer-events:none;white-space:nowrap;margin-bottom:5px;padding:3px 8px;border-radius:999px;background:rgba(255,255,255,0.94);color:#071A3D;font-weight:800;font-size:10px;">${escapeHtml(name)}</span>
        <span style="display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:${accent};border:2px solid rgba(255,255,255,0.9);font-size:13px;line-height:1;">${isAirport ? '✈️' : '🏥'}</span>
      </span>
    `;
    const labelEl = element.querySelector('.place-label');
    element.addEventListener('mouseenter', () => { labelEl.style.opacity = '1'; });
    element.addEventListener('mouseleave', () => { labelEl.style.opacity = '0'; });
    element.addEventListener('click', (event) => {
      event.stopPropagation();
      onPlacePick?.({ kind: type, name, district: isAirport ? 'Istanbul' : '', lon, lat });
    });
    const marker = new maplibregl.Marker({ element, anchor: 'bottom', draggable: Boolean(editable) })
      .setLngLat([lon, lat])
      .addTo(map);
    if (editable) marker.on('dragend', () => recordEditedCoord(name, marker));
  });
}

function addPlaceMarkers({ maplibregl, map, onPlacePick, editable }) {
  MAP_PLACES.forEach(([category, name, lon, lat]) => {
    const cfg = PLACE_CATEGORIES[category] || PLACE_CATEGORIES.museum;
    const element = document.createElement('button');
    element.type = 'button';
    element.style.cssText = 'background:none;border:none;padding:0;cursor:pointer;';
    element.setAttribute('aria-label', name);
    element.innerHTML = `
      <span style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 5px 12px rgba(7,26,61,0.4));">
        <span class="place-label" style="opacity:0;transition:opacity .15s;pointer-events:none;white-space:nowrap;margin-bottom:4px;padding:2px 7px;border-radius:999px;background:rgba(255,255,255,0.94);color:#071A3D;font-weight:800;font-size:9px;">${escapeHtml(name)}</span>
        <span style="display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:${cfg.color};border:2px solid rgba(255,255,255,0.92);font-size:12px;line-height:1;">${cfg.icon}</span>
      </span>
    `;
    const labelEl = element.querySelector('.place-label');
    element.addEventListener('mouseenter', () => { labelEl.style.opacity = '1'; });
    element.addEventListener('mouseleave', () => { labelEl.style.opacity = '0'; });
    element.addEventListener('click', (event) => {
      event.stopPropagation();
      onPlacePick?.({ kind: category, name, district: '', lon, lat });
    });
    const marker = new maplibregl.Marker({ element, anchor: 'bottom', draggable: Boolean(editable) })
      .setLngLat([lon, lat])
      .addTo(map);
    if (editable) marker.on('dragend', () => recordEditedCoord(name, marker));
  });
}

function addOfficeMarker({ maplibregl, map, onPlacePick, editable }) {
  if (!Number.isFinite(OFFICE_LOCATION.lon) || !Number.isFinite(OFFICE_LOCATION.lat)) return;

  // A button (not a link): clicking opens the in-map info panel instead of
  // navigating away — the panel itself offers a button to the contact page.
  const element = document.createElement('button');
  element.type = 'button';
  element.style.cssText = 'background:none;border:none;padding:0;cursor:pointer;';
  element.setAttribute('aria-label', `${OFFICE_LOCATION.labelEn} — ${OFFICE_LOCATION.district}`);
  element.innerHTML = `
    <span style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 8px 18px rgba(7,26,61,0.45));">
      <span class="place-label" style="opacity:0;transition:opacity .15s;pointer-events:none;white-space:nowrap;margin-bottom:6px;padding:4px 10px;border-radius:999px;background:linear-gradient(135deg,#D8B05B,#b9914a);color:#071A3D;font-weight:900;font-size:11px;letter-spacing:.02em;box-shadow:0 6px 16px rgba(7,26,61,0.30);">ACCA EDU</span>
      <span style="display:grid;place-items:center;width:34px;height:34px;border-radius:11px 11px 11px 3px;transform:rotate(45deg);background:linear-gradient(135deg,#0d2a52,#071A3D);border:2px solid #D8B05B;box-shadow:0 10px 24px rgba(7,26,61,0.45);">
        <span style="transform:rotate(-45deg);font-size:16px;line-height:1;">🏛️</span>
      </span>
    </span>
  `;
  const labelEl = element.querySelector('.place-label');
  element.addEventListener('mouseenter', () => { labelEl.style.opacity = '1'; });
  element.addEventListener('mouseleave', () => { labelEl.style.opacity = '0'; });
  element.addEventListener('click', (event) => {
    event.stopPropagation();
    onPlacePick?.({ kind: 'office', name: OFFICE_LOCATION.labelEn, district: OFFICE_LOCATION.district, href: '/?section=contact', lon: OFFICE_LOCATION.lon, lat: OFFICE_LOCATION.lat });
  });

  const marker = new maplibregl.Marker({ element, anchor: 'bottom', draggable: Boolean(editable) })
    .setLngLat([OFFICE_LOCATION.lon, OFFICE_LOCATION.lat])
    .addTo(map);
  if (editable) marker.on('dragend', () => recordEditedCoord('ACCA EDU Office', marker));
}

function createInfrastructureFeatureCollections() {
  return {
    roads: {
      type: 'FeatureCollection',
      features: ISTANBUL_INFRASTRUCTURE.roads.map((road) => ({
        type: 'Feature',
        properties: { id: road.id, name: road.name, kind: road.kind },
        geometry: { type: 'LineString', coordinates: road.coordinates },
      })),
    },
    bridges: {
      type: 'FeatureCollection',
      features: ISTANBUL_INFRASTRUCTURE.bridges.map((bridge) => ({
        type: 'Feature',
        properties: { id: bridge.id, kind: bridge.kind },
        geometry: { type: 'LineString', coordinates: bridge.coordinates },
      })),
    },
    airports: {
      type: 'FeatureCollection',
      features: ISTANBUL_INFRASTRUCTURE.airports.map((airport) => ({
        type: 'Feature',
        properties: { id: airport.id, name: airport.name },
        geometry: { type: 'Polygon', coordinates: [makeRunwayPolygon(airport)] },
      })),
    },
  };
}

function makeRunwayPolygon({ center, runwayBearing, runwayLength, runwayWidth }) {
  const angle = (runwayBearing * Math.PI) / 180;
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const px = -uy;
  const py = ux;
  const halfL = runwayLength / 2;
  const halfW = runwayWidth / 2;
  return [
    [center[0] - ux * halfL - px * halfW, center[1] - uy * halfL - py * halfW],
    [center[0] + ux * halfL - px * halfW, center[1] + uy * halfL - py * halfW],
    [center[0] + ux * halfL + px * halfW, center[1] + uy * halfL + py * halfW],
    [center[0] - ux * halfL + px * halfW, center[1] - uy * halfL + py * halfW],
    [center[0] - ux * halfL - px * halfW, center[1] - uy * halfL - py * halfW],
  ];
}

function initIstanbulScene({ canvas, darkMode, items, onPick, onReady, apiRef }) {
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
  const compactViewport = window.innerWidth < 760 || window.devicePixelRatio > 2;
  renderer.shadowMap.enabled = !compactViewport;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compactViewport ? 1.25 : 1.55));

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
    lastFrameTime: performance.now(),
    focus: null,
    userInteracted: false,
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
  createTacticalOverlay(scene, darkMode);
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
  let readyNotified = false;

  const resize = () => {
    const width = Math.max(canvas.clientWidth || window.innerWidth, 1);
    const height = Math.max(canvas.clientHeight || window.innerHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const updateCamera = (introProgress = 1, time = 0, delta = 0) => {
    const easedIntro = easeOutCubic(introProgress);
    let travelLift = 0;

    if (state.focus) {
      const progress = THREE.MathUtils.clamp((performance.now() - state.focus.startedAt) / state.focus.duration, 0, 1);
      const eased = easeInOutCubic(progress);
      state.target.lerpVectors(state.focus.fromTarget, state.focus.toTarget, eased);
      state.distance = lerp(state.focus.fromDistance, state.focus.toDistance, eased);
      state.pitch = lerp(state.focus.fromPitch, state.focus.toPitch, eased);
      state.yaw = lerp(state.focus.fromYaw, state.focus.toYaw, eased);
      travelLift = Math.sin(progress * Math.PI) * 9;
      if (progress >= 1) {
        state.focus = null;
        state.targetGoal.copy(state.target);
      }
    } else {
      if (!state.userInteracted && introProgress >= 1) state.yaw += delta * 0.00055;
      state.target.lerp(state.targetGoal, 0.055);
    }

    const cameraTarget = state.target;
    const distance = state.distance + (1 - easedIntro) * 30;
    const pitch = THREE.MathUtils.clamp(state.pitch - (1 - easedIntro) * 0.30, 0.34, 1.24);
    const yaw = state.yaw;

    const breathingLift = state.focus ? 0 : Math.sin(time * 0.24) * 0.18;
    const phi = THREE.MathUtils.clamp(pitch, 0.34, 1.24);
    const x = cameraTarget.x + distance * Math.sin(phi) * Math.sin(yaw);
    const y = cameraTarget.y + distance * Math.cos(phi) + (1 - easedIntro) * 28 + travelLift + breathingLift;
    const z = cameraTarget.z + distance * Math.sin(phi) * Math.cos(yaw);
    camera.position.set(x, y, z);
    camera.lookAt(cameraTarget.x, cameraTarget.y + 0.8, cameraTarget.z);
  };

  const focusUniversity = (id) => {
    const marker = markersById.get(id);
    if (!marker) return;
    const sideDirection = marker.position.x >= state.target.x ? -0.18 : 0.18;
    state.selectedId = id;
    state.focus = {
      startedAt: performance.now(),
      duration: reducedMotion ? 200 : 1650,
      fromTarget: state.target.clone(),
      toTarget: new THREE.Vector3(marker.position.x, 0.34, marker.position.z),
      fromDistance: state.distance,
      toDistance: THREE.MathUtils.clamp(state.distance, 34, 48),
      fromPitch: state.pitch,
      toPitch: 0.70,
      fromYaw: state.yaw,
      toYaw: state.yaw + sideDirection,
    };
    state.targetGoal.set(marker.position.x, 0.34, marker.position.z);
  };

  const resetView = () => {
    state.focus = null;
    state.userInteracted = false;
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
    state.focus = null;
    state.userInteracted = true;
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
    state.focus = null;
    state.userInteracted = true;
    state.distance = THREE.MathUtils.clamp(state.distance + event.deltaY * 0.035, 30, 88);
  };

  const animate = () => {
    const elapsed = performance.now() - state.startTime;
    const introProgress = reducedMotion ? 1 : THREE.MathUtils.clamp(elapsed / 3200, 0, 1);
    const time = (performance.now() - state.startTime) / 1000;
    const delta = performance.now() - state.lastFrameTime;
    state.lastFrameTime = performance.now();

    updateCamera(introProgress, time, delta);
    animateClouds(cloudRig, introProgress, time);
    animateMarkers(animatedRings, markersById, state.selectedId, time);

    renderer.render(scene, camera);
    if (!readyNotified && (reducedMotion || introProgress > 0.58)) {
      readyNotified = true;
      onReady?.();
    }
    window.__acca3DMapReady = readyNotified;
    window.__acca3DMapMarkerCount = items.length;
    window.__acca3DMapAdjustedMarkerCount = items.filter((item) => item.renderAdjusted).length;
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

  const europe = makeGeoLandShape(EUROPE_LAND_POLYGON, europeMaterial);
  europe.position.y = 0.04;
  scene.add(europe);

  const asia = makeGeoLandShape(ASIA_LAND_POLYGON, asiaMaterial);
  asia.position.y = 0.05;
  scene.add(asia);

  addCoastline(scene, europe);
  addCoastline(scene, asia);
  addBosphorusAndGoldenHorn(scene, seaMaterial);
  addIstanbulLakes(scene, seaMaterial);
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

  addTube(scene, BOSPHORUS_PATH.map(([lat, lon]) => projectGeo(lat, lon)), channelMaterial, 0.52);
  addTube(scene, GOLDEN_HORN_PATH.map(([lat, lon]) => projectGeo(lat, lon)), channelMaterial, 0.38);

  const wakeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.32 });
  [
    BOSPHORUS_PATH.filter((_, index) => index % 2 === 0).map(([lat, lon]) => projectGeo(lat, lon)),
    GOLDEN_HORN_PATH.map(([lat, lon]) => projectGeo(lat, lon)),
  ].forEach((points) => {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points.map((point) => new THREE.Vector3(point.x, 0.35, point.z))),
      wakeMaterial
    );
    scene.add(line);
  });
}

function addIstanbulLakes(scene, seaMaterial) {
  const lakeMaterial = seaMaterial.clone();
  lakeMaterial.opacity = 0.72;
  lakeMaterial.color = new THREE.Color(0x1988a8);

  ISTANBUL_LAKES.forEach(({ center, rx, rz, rotation }) => {
    const point = projectGeo(center[0], center[1]);
    const shape = new THREE.Shape();
    const segments = 42;
    for (let i = 0; i < segments; i++) {
      const angle = (Math.PI * 2 * i) / segments;
      const localX = Math.cos(angle) * rx;
      const localZ = Math.sin(angle) * rz;
      const x = point.x + localX * Math.cos(rotation) - localZ * Math.sin(rotation);
      const z = point.z + localX * Math.sin(rotation) + localZ * Math.cos(rotation);
      if (i === 0) shape.moveTo(x, z);
      else shape.lineTo(x, z);
    }
    shape.closePath();
    const lake = new THREE.Mesh(new THREE.ShapeGeometry(shape, 24), lakeMaterial);
    lake.rotation.x = Math.PI / 2;
    lake.position.y = 0.17;
    lake.receiveShadow = true;
    scene.add(lake);
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

  BOSPHORUS_BRIDGES.forEach((bridge, index) => {
    addTube(scene, [projectGeo(...bridge.start), projectGeo(...bridge.end)], goldMaterial, index === 2 ? 0.07 : 0.085);
    addBridgeTowers(scene, projectGeo(...bridge.towerStart), projectGeo(...bridge.towerEnd), goldMaterial);
  });

  const tunnelMaterial = new THREE.LineDashedMaterial({
    color: darkMode ? 0x9fd7ff : 0x071a3d,
    transparent: true,
    opacity: darkMode ? 0.28 : 0.20,
    dashSize: 0.34,
    gapSize: 0.22,
  });
  [
    [projectGeo(41.004, 28.972), projectGeo(41.000, 29.035)],
    [projectGeo(40.995, 28.985), projectGeo(40.992, 29.055)],
  ].forEach((points) => {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points.map((point) => new THREE.Vector3(point.x, 0.31, point.z))),
      tunnelMaterial
    );
    line.computeLineDistances();
    scene.add(line);
  });
}

function createTacticalOverlay(scene, darkMode) {
  const gridMaterial = new THREE.LineBasicMaterial({
    color: darkMode ? 0x9bdcff : 0x071a3d,
    transparent: true,
    opacity: darkMode ? 0.10 : 0.065,
  });
  const contourMaterial = new THREE.LineBasicMaterial({
    color: darkMode ? 0xf8d98a : 0x7b6330,
    transparent: true,
    opacity: darkMode ? 0.18 : 0.12,
  });

  for (let x = -30; x <= 30; x += 10) {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, 0.37, -15.5),
        new THREE.Vector3(x, 0.37, 15.5),
      ]),
      gridMaterial
    );
    scene.add(line);
  }
  for (let z = -15; z <= 15; z += 7.5) {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-32, 0.37, z),
        new THREE.Vector3(32, 0.37, z),
      ]),
      gridMaterial
    );
    scene.add(line);
  }

  [
    [41.18, 29.50, 3.2, 1.9],
    [41.18, 28.66, 2.8, 1.8],
    [41.11, 29.55, 2.4, 1.55],
    [40.91, 29.34, 2.2, 1.28],
  ].forEach(([lat, lon, rx, rz], index) => {
    const center = projectGeo(lat, lon);
    for (let ring = 0; ring < 3; ring++) {
      const points = [];
      const scale = 1 + ring * 0.42;
      for (let i = 0; i <= 72; i++) {
        const angle = (Math.PI * 2 * i) / 72;
        points.push(new THREE.Vector3(
          center.x + Math.cos(angle) * rx * scale,
          0.40 + ring * 0.012,
          center.z + Math.sin(angle) * rz * scale
        ));
      }
      const contour = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), contourMaterial);
      contour.userData.contourIndex = index * 3 + ring;
      scene.add(contour);
    }
  });
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
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: sideColor,
      transparent: true,
      opacity: darkMode ? 0.28 : 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const marker = new THREE.Group();
    marker.position.set(item.x, 0.22, item.z);
    marker.userData.markerId = item.id;

    const base = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.035, 8, 42), haloMaterial);
    base.rotation.x = Math.PI / 2;
    base.userData.markerId = item.id;
    marker.add(base);
    const animationPayload = { ring: base, index, marker, beam: null, haloMaterial, beamMaterial };
    animatedRings.push(animationPayload);

    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.012, 3.6, 8, 1, true), beamMaterial);
    beam.position.y = 2.0;
    beam.userData.markerId = item.id;
    marker.add(beam);
    animationPayload.beam = beam;

    const platform = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.54, 0.12, 8), accentMaterial);
    platform.position.y = 0.11;
    platform.userData.markerId = item.id;
    marker.add(platform);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.48, 0.44), campusMaterial);
    body.position.y = 0.48;
    body.userData.markerId = item.id;
    marker.add(body);

    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.82, 0.24), campusMaterial);
    tower.position.set(-0.28, 0.66, 0.02);
    tower.userData.markerId = item.id;
    marker.add(tower);

    const annex = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.36, 0.34), campusMaterial);
    annex.position.set(0.36, 0.38, -0.03);
    annex.userData.markerId = item.id;
    marker.add(annex);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.24, 4), accentMaterial);
    roof.position.set(-0.28, 1.2, 0.02);
    roof.rotation.y = Math.PI / 4;
    roof.userData.markerId = item.id;
    marker.add(roof);

    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), accentMaterial);
    glow.position.set(0.18, 0.82, -0.16);
    glow.userData.markerId = item.id;
    marker.add(glow);

    const objective = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), accentMaterial);
    objective.position.y = 4.0;
    objective.userData.markerId = item.id;
    marker.add(objective);

    markerPickables.push(platform, body, tower, annex, roof, glow, base, objective);
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
  animatedRings.forEach(({ ring, index, marker, beam, haloMaterial, beamMaterial }) => {
    ring.rotation.z = time * 0.8 + index * 0.28;
    const pulse = 1 + Math.sin(time * 2.2 + index) * 0.08;
    ring.scale.setScalar(pulse);
    const selected = marker.userData.markerId === selectedId;
    marker.scale.lerp(new THREE.Vector3(selected ? 1.62 : 0.94, selected ? 1.62 : 0.94, selected ? 1.62 : 0.94), 0.1);
    if (beam) {
      beam.rotation.y = time * 0.22 + index;
      beam.scale.y = selected ? 1.18 : 0.78 + Math.sin(time * 1.4 + index) * 0.04;
    }
    if (haloMaterial) haloMaterial.opacity = selected ? 0.46 : 0.18;
    if (beamMaterial) beamMaterial.opacity = selected ? 0.42 : 0.13;
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

function makeGeoLandShape(points, material) {
  return makeLandShape(points.map(([lat, lon]) => projectGeo(lat, lon)), material);
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

function validateUniversityCoordinates(items) {
  const seen = new Map();
  const invalid = [];
  const waterRisk = [];
  const duplicates = [];

  items.forEach((item) => {
    const inBounds = item.lat >= ISTANBUL_BOUNDS.latMin
      && item.lat <= ISTANBUL_BOUNDS.latMax
      && item.lon >= ISTANBUL_BOUNDS.lonMin
      && item.lon <= ISTANBUL_BOUNDS.lonMax;
    if (!inBounds) invalid.push({ id: item.id, name: item.name, lat: item.lat, lon: item.lon });
    if (isLikelyGeospatialWater(item.lat, item.lon)) {
      waterRisk.push({ id: item.id, name: item.name, lat: item.lat, lon: item.lon });
    }

    const key = `${item.lat.toFixed(4)},${item.lon.toFixed(4)}`;
    const prior = seen.get(key);
    if (prior) duplicates.push({ key, names: [prior.name, item.name] });
    else seen.set(key, item);
  });

  return {
    checked: items.length,
    invalid,
    waterRisk,
    duplicates,
    adjustedForFallback: items.filter((item) => item.renderAdjusted).map((item) => ({
      id: item.id,
      name: item.name,
      source: [item.lat, item.lon],
      render: [item.renderLat, item.renderLon],
    })),
  };
}

function projectGeo(lat, lon) {
  const x = ((lon - ISTANBUL_BOUNDS.lonMin) / (ISTANBUL_BOUNDS.lonMax - ISTANBUL_BOUNDS.lonMin) - 0.5) * MAP_WIDTH;
  const z = -((lat - ISTANBUL_BOUNDS.latMin) / (ISTANBUL_BOUNDS.latMax - ISTANBUL_BOUNDS.latMin) - 0.5) * MAP_DEPTH;
  return { x, z };
}

function snapGeoToRenderableLand(geo) {
  if (isApproxLand(geo.lat, geo.lon)) return geo;

  const lonDirection = geo.side === 'asia' ? 1 : -1;
  const candidates = [
    [0, lonDirection * 0.010],
    [0, lonDirection * 0.018],
    [0.006, lonDirection * 0.016],
    [-0.006, lonDirection * 0.016],
    [0.010, lonDirection * 0.024],
    [-0.010, lonDirection * 0.024],
  ];

  const candidate = candidates
    .map(([latOffset, lonOffset]) => ({
      ...geo,
      lat: geo.lat + latOffset,
      lon: geo.lon + lonOffset,
      renderAdjusted: true,
    }))
    .find((point) => isApproxLand(point.lat, point.lon));

  return candidate || geo;
}

function isApproxLand(lat, lon) {
  const inLand = pointInLatLonPolygon(lat, lon, EUROPE_LAND_POLYGON)
    || pointInLatLonPolygon(lat, lon, ASIA_LAND_POLYGON);
  return inLand && !isApproxWater(lat, lon);
}

function isApproxWater(lat, lon) {
  const point = projectGeo(lat, lon);
  const bosphorusDistance = distanceToGeoPath(point, BOSPHORUS_PATH);
  const goldenHornDistance = distanceToGeoPath(point, GOLDEN_HORN_PATH);
  if (bosphorusDistance < 0.58) return true;
  if (goldenHornDistance < 0.44) return true;

  return ISTANBUL_LAKES.some(({ center, rx, rz, rotation }) => {
    const lake = projectGeo(center[0], center[1]);
    const dx = point.x - lake.x;
    const dz = point.z - lake.z;
    const localX = dx * Math.cos(-rotation) - dz * Math.sin(-rotation);
    const localZ = dx * Math.sin(-rotation) + dz * Math.cos(-rotation);
    return (localX * localX) / (rx * rx) + (localZ * localZ) / (rz * rz) < 1;
  });
}

function isLikelyGeospatialWater(lat, lon) {
  const point = projectGeo(lat, lon);
  const bosphorusDistance = distanceToGeoPath(point, BOSPHORUS_PATH);
  const goldenHornDistance = distanceToGeoPath(point, GOLDEN_HORN_PATH);
  const obviousBosphorus = lon > 28.99 && lon < 29.11 && lat > 40.98 && lat < 41.22 && bosphorusDistance < 0.18;
  const obviousGoldenHorn = lon > 28.93 && lon < 29.00 && lat > 41.015 && lat < 41.055 && goldenHornDistance < 0.12;
  const obviousOpenSea = lat < 40.79 || lat > 41.31;
  return obviousBosphorus || obviousGoldenHorn || obviousOpenSea;
}

function pointInLatLonPolygon(lat, lon, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const yi = polygon[i][0];
    const xi = polygon[i][1];
    const yj = polygon[j][0];
    const xj = polygon[j][1];
    const intersects = ((yi > lat) !== (yj > lat))
      && (lon < ((xj - xi) * (lat - yi)) / (yj - yi || Number.EPSILON) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

function distanceToGeoPath(point, path) {
  let min = Infinity;
  for (let i = 0; i < path.length - 1; i++) {
    const a = projectGeo(path[i][0], path[i][1]);
    const b = projectGeo(path[i + 1][0], path[i + 1][1]);
    min = Math.min(min, distanceToSegment(point, a, b));
  }
  return min;
}

function distanceToSegment(point, a, b) {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const lengthSq = dx * dx + dz * dz;
  if (!lengthSq) return Math.hypot(point.x - a.x, point.z - a.z);
  const t = THREE.MathUtils.clamp(((point.x - a.x) * dx + (point.z - a.z) * dz) / lengthSq, 0, 1);
  return Math.hypot(point.x - (a.x + dx * t), point.z - (a.z + dz * t));
}

function getUniversityInitials(name) {
  return String(name || 'U')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}
