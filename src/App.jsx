import { lazy, memo, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Award, BookOpen, Building2, MapPin, Menu, Newspaper, UserRound, X } from 'lucide-react';
import ConsultationModal from './components/ConsultationModal';
import HeroSection from './components/sections/HeroSection';
import UniversityMarqueeSection from './components/sections/UniversityMarqueeSection';
import FloatingActions from './components/FloatingActions';
import { buildUniversitySlug, istanbulUniversities } from './data/istanbulUniversities';
import { getUniversityLogo } from './data/universityLogoMap';
import { cleanCanonicalPath, parseCleanPath } from './lib/routes';
import { SEO_LANDING_BY_SLUG, SEO_LANDING_PAGES } from './data/seoLandingPages';

const SeoLandingPage = lazy(() => import('./components/pages/SeoLandingPage'));
const ProgramsSearchPage = lazy(() => import('./components/pages/ProgramsSearchPageV2'));
const UniversitiesPage = lazy(() => import('./components/pages/UniversitiesPage'));
const IstanbulUniversityMapPage = lazy(() => import('./components/pages/IstanbulUniversityMapPage'));
const ScholarshipsPage = lazy(() => import('./components/pages/ScholarshipsPage'));
const BlogPage = lazy(() => import('./components/pages/BlogPage'));
const GlossaryPage = lazy(() => import('./components/pages/GlossaryPage'));
const AccaShowcaseSection = lazy(() => import('./components/AccaShowcaseSection'));
const SmartScholarshipCalculator = lazy(() => import('./components/SmartScholarshipCalculator'));
const StatsSection = lazy(() => import('./components/sections/StatsSection'));
const RegistrationProcessSection = lazy(() => import('./components/sections/RegistrationProcessSection'));
const GreenScholarshipWidget = lazy(() => import('./components/GreenScholarshipWidget'));
const FeaturedUniversitiesSection = lazy(() => import('./components/sections/FeaturedUniversitiesSection'));
const PopularMajorsSection = lazy(() => import('./components/sections/PopularMajorsSection'));
const PartnerScholarshipSection = lazy(() => import('./components/sections/PartnerScholarshipSection'));
const TestimonialsSection = lazy(() => import('./components/sections/TestimonialsSection'));
const FaqSection = lazy(() => import('./components/sections/FaqSection'));
const FinalCtaSection = lazy(() => import('./components/sections/FinalCtaSection'));
const ContactSection = lazy(() => import('./components/sections/ContactSection'));

const ACCA_LOGO_SRC =
  '/assets/optimized/acca-logo-320.webp';
const SITE_CANONICAL_ORIGIN = 'https://www.accaco.com';
const BRAND_NAME = 'ACCA EDU';
const BRAND_TAGLINE = 'Study in Turkey & International Student Placement';
const BRAND_TITLE = `${BRAND_NAME} — ${BRAND_TAGLINE}`;
const INDEXABLE_PAGES = new Set(['programs', 'universities', 'istanbul-map', 'scholarships', 'blog', 'glossary']);
const LANGUAGE_STORAGE_KEY = 'acca:language';
const SUPPORTED_LANGUAGES = new Set(['fa', 'en']);
const STATIC_ROUTE_ALIASES = {
  '/programs': { page: 'programs', canonicalPath: '/programs/' },
  '/study-in-turkey': { canonicalPath: '/study-in-turkey/' },
  '/universities': { page: 'universities', canonicalPath: '/universities/' },
  '/istanbul-university-map': { page: 'istanbul-map', canonicalPath: '/istanbul-university-map/' },
  '/medical-universities-in-turkey': { page: 'programs', canonicalPath: '/medical-universities-in-turkey/' },
  '/residence-permit': { page: 'blog', post: 'student-residence-e-ikamet-2026', canonicalPath: '/residence-permit/' },
  '/accommodation': { page: 'blog', post: 'address-registration-nvi-turkey-student-warning', canonicalPath: '/accommodation/' },
  '/partner-with-acca-edu': { section: 'partners', canonicalPath: '/partner-with-acca-edu/' },
  '/contact': { section: 'contact', canonicalPath: '/contact/' },
  '/privacy': { page: 'privacy', canonicalPath: '/privacy/' },
  '/terms': { page: 'terms', canonicalPath: '/terms/' },
  '/data-deletion': { page: 'data-deletion', canonicalPath: '/data-deletion/' },
};

// Lightweight legal/placeholder pages: title + short note, content TBD.
const LEGAL_PAGES = {
  privacy: {
    title: { fa: 'حریم خصوصی', en: 'Privacy Policy' },
    note: {
      fa: 'متن کامل سیاست حریم خصوصی به‌زودی در این صفحه قرار می‌گیرد.',
      en: 'The full privacy policy will be published on this page soon.',
    },
  },
  terms: {
    title: { fa: 'قوانین و مقررات', en: 'Terms of Service' },
    note: {
      fa: 'متن کامل قوانین و مقررات استفاده از خدمات به‌زودی منتشر می‌شود.',
      en: 'The full terms of service will be published on this page soon.',
    },
  },
  'data-deletion': {
    title: { fa: 'حذف اطلاعات', en: 'Data Deletion' },
    note: {
      fa: 'راهنمای درخواست حذف اطلاعات کاربران به‌زودی در این صفحه قرار می‌گیرد.',
      en: 'Instructions for requesting deletion of your data will be added here soon.',
    },
  },
};
const STATIC_ROUTE_META = {
  '/medical-universities-in-turkey/': {
    title: 'دانشگاه‌های پزشکی ترکیه | پزشکی، دندانپزشکی و علوم سلامت | ACCA EDU',
    description: 'راهنمای دانشگاه‌های پزشکی ترکیه برای دانشجویان بین‌المللی؛ بررسی پزشکی، دندانپزشکی، داروسازی، علوم سلامت، شهریه‌ها، زبان تحصیل و مسیر پذیرش.',
  },
  '/partner-with-acca-edu/': {
    title: 'همکاری با ACCA EDU | شبکه پذیرش و خدمات دانشجویی ترکیه',
    description: 'صفحه همکاری با ACCA EDU برای دانشگاه‌ها، آژانس‌ها و نمایندگان آموزشی؛ زیرساخت پذیرش، خدمات دانشجویی، اقامت و جذب دانشجوی بین‌المللی.',
  },
  '/contact/': {
    title: 'تماس با ACCA EDU | مشاوره تحصیل در ترکیه و ارتباط واتساپ',
    description: 'تماس مستقیم با ACCA EDU برای مشاوره تحصیل در ترکیه، بررسی پذیرش، رشته‌ها، شهریه‌ها، اقامت دانشجویی و خدمات اسکان از طریق واتساپ و کانال‌های رسمی شرکت.',
  },
  '/privacy/': {
    title: 'حریم خصوصی | ACCA EDU',
    description: 'سیاست حریم خصوصی ACCA EDU درباره جمع‌آوری، استفاده و حفاظت از اطلاعات کاربران.',
  },
  '/terms/': {
    title: 'قوانین و مقررات | ACCA EDU',
    description: 'قوانین و مقررات استفاده از خدمات و وب‌سایت ACCA EDU.',
  },
  '/data-deletion/': {
    title: 'حذف اطلاعات | ACCA EDU',
    description: 'راهنمای درخواست حذف اطلاعات کاربران در ACCA EDU.',
  },
};

// Register the topical SEO landing pages (src/data/seoLandingPages.js) into the
// routing + meta maps so each /slug/ resolves to its in-app page and head tags.
// The same data drives the static prerender + sitemap in scripts/.
SEO_LANDING_PAGES.forEach((seoPage) => {
  STATIC_ROUTE_ALIASES[`/${seoPage.slug}`] = {
    page: 'seo',
    seoSlug: seoPage.slug,
    canonicalPath: `/${seoPage.slug}/`,
  };
  STATIC_ROUTE_META[`/${seoPage.slug}/`] = {
    title: seoPage.title,
    description: seoPage.description,
  };
});

const DESKTOP_MEDIA_QUERY = '(min-width: 1024px) and (pointer: fine)';

function getStoredLanguage() {
  if (typeof window === 'undefined') return 'fa';

  try {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return SUPPORTED_LANGUAGES.has(storedLanguage) ? storedLanguage : 'fa';
  } catch {
    return 'fa';
  }
}

function getStaticRouteAlias(pathname = '/') {
  const normalized = `/${String(pathname || '/')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')}`;
  // Bespoke marketing routes win; dynamic content routes (/blog, /blog/<slug>,
  // /glossary, /glossary/<slug>, /scholarships) fall through to routes.js.
  return STATIC_ROUTE_ALIASES[normalized === '/' ? '/' : normalized]
    || parseCleanPath(normalized)
    || null;
}

function getUniversityProfileHref(universityName) {
  const university = findUniversityByRouteValue(universityName);
  const profileValue = university?.slug || buildUniversitySlug(universityName);
  return `?page=universities&profile=${encodeURIComponent(profileValue || universityName)}`;
}

function findUniversityByRouteValue(value) {
  const normalizedValue = normalizeRouteValue(value);
  if (!normalizedValue) return null;

  return istanbulUniversities.find((university) => {
    const normalizedName = normalizeRouteValue(university.name);
    const normalizedSlug = normalizeRouteValue(university.slug || buildUniversitySlug(university.name));
    return normalizedValue === normalizedName ||
      normalizedValue === normalizedSlug ||
      normalizedName.includes(normalizedValue) ||
      normalizedValue.includes(normalizedName);
  }) || null;
}

function normalizeRouteValue(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ä°/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase();
}

function getRouteSeo({ page, params, isFa }) {
  const profileParam = params.get('profile') || params.get('university') || '';
  const university = page === 'universities' ? findUniversityByRouteValue(profileParam) : null;
  const programUniversity = page === 'programs'
    ? findUniversityByRouteValue(params.get('university'))
    : null;
  const programQuery = [
    params.get('department'),
    params.get('program'),
    params.get('search'),
    params.get('query'),
    params.get('q'),
  ].filter(Boolean)[0] || '';
  const defaultTitle = isFa
    ? `تحصیل در ترکیه، از پذیرش دانشگاه تا اقامت دانشجویی | ${BRAND_NAME}`
    : BRAND_TITLE;
  const fallback = {
    title: defaultTitle,
    description: isFa
      ? 'آکا ادو مسیر تحصیل در ترکیه را از پذیرش دانشگاه و انتخاب رشته تا ثبت‌نام، اقامت دانشجویی، بیمه، مسکن و ورود دانشجو به ترکیه همراهی می‌کند.'
      : `${BRAND_TITLE}. Educational consulting for university admission, registration guidance, student residence, insurance, housing and arrival support in Turkey.`,
    canonicalUrl: `${SITE_CANONICAL_ORIGIN}/`,
    shouldIndex: true,
    structuredData: buildWebPageJsonLd(defaultTitle, `${SITE_CANONICAL_ORIGIN}/`),
  };

  if (page === 'universities' && university) {
    const canonicalUrl = `${SITE_CANONICAL_ORIGIN}/?page=universities&profile=${encodeURIComponent(university.slug)}`;
    const programCount = Number(university.programsCount || 0);
    return {
      title: isFa
        ? `${university.name} | \u067e\u0630\u06cc\u0631\u0634\u060c \u0631\u0634\u062a\u0647\u200c\u0647\u0627 \u0648 \u0631\u062a\u0628\u0647 | ${BRAND_TITLE}`
        : `${university.name} Admission, Programs & Rankings | ${BRAND_TITLE}`,
      description: isFa
        ? `\u067e\u0631\u0648\u0641\u0627\u06cc\u0644 ${university.name} \u0628\u0631\u0627\u06cc \u062f\u0627\u0646\u0634\u062c\u0648\u06cc\u0627\u0646 \u0628\u06cc\u0646\u200c\u0627\u0644\u0645\u0644\u0644\u06cc: ${programCount || '\u0686\u0646\u062f\u06cc\u0646'} \u0631\u0634\u062a\u0647\u060c \u06a9\u0645\u067e\u0648\u0633\u060c \u0631\u062a\u0628\u0647 THE\u060c \u0645\u0646\u0627\u0628\u0639 \u0631\u0633\u0645\u06cc \u0648 \u0645\u0633\u06cc\u0631 \u067e\u0630\u06cc\u0631\u0634 \u062f\u0631 \u062a\u0631\u06a9\u06cc\u0647.`
        : `${university.name} profile for international students: ${programCount || 'multiple'} programs, campus data, THE ranking signals, official sources, and Turkey admission review.`,
      canonicalUrl,
      shouldIndex: true,
      structuredData: buildUniversityJsonLd(university, canonicalUrl),
    };
  }

  if (page === 'universities') {
    const canonicalUrl = `${SITE_CANONICAL_ORIGIN}/universities/`;
    return {
      title: isFa
        ? `\u062f\u0627\u0646\u0634\u06af\u0627\u0647\u200c\u0647\u0627\u06cc \u062e\u0635\u0648\u0635\u06cc \u0627\u0633\u062a\u0627\u0646\u0628\u0648\u0644 \u0648 \u062a\u0631\u06a9\u06cc\u0647 | ${BRAND_TITLE}`
        : `Private Universities in Istanbul & Turkey | ${BRAND_TITLE}`,
      description: isFa
        ? '\u0645\u0642\u0627\u06cc\u0633\u0647 \u062f\u0627\u0646\u0634\u06af\u0627\u0647\u200c\u0647\u0627\u06cc \u062e\u0635\u0648\u0635\u06cc \u0627\u0633\u062a\u0627\u0646\u0628\u0648\u0644 \u0648 \u062a\u0631\u06a9\u06cc\u0647 \u0628\u0631 \u0627\u0633\u0627\u0633 \u0631\u0634\u062a\u0647\u060c \u06a9\u0645\u067e\u0648\u0633\u060c \u0631\u062a\u0628\u0647 THE\u060c \u062a\u0642\u0648\u06cc\u0645 \u0622\u06a9\u0627\u062f\u0645\u06cc\u06a9 \u0648 \u0645\u0633\u06cc\u0631 \u067e\u0630\u06cc\u0631\u0634 \u062f\u0627\u0646\u0634\u062c\u0648\u06cc\u0627\u0646 \u0628\u06cc\u0646\u200c\u0627\u0644\u0645\u0644\u0644\u06cc.'
        : 'Compare private universities in Istanbul and Turkey by programs, campus data, THE ranking signals, academic calendar, and international admission fit.',
      canonicalUrl,
      shouldIndex: true,
      structuredData: buildItemListJsonLd(canonicalUrl),
    };
  }

  if (page === 'istanbul-map') {
    const canonicalUrl = `${SITE_CANONICAL_ORIGIN}/istanbul-university-map/`;
    return {
      title: isFa
        ? `نقشه سه بعدی دانشگاه های استانبول | ${BRAND_TITLE}`
        : `3D Istanbul University Map | ${BRAND_TITLE}`,
      description: isFa
        ? 'نقشه سه بعدی و تعاملی دانشگاه های استانبول در دیتابیس ACCA EDU؛ مشاهده موقعیت تقریبی دانشگاه ها در بخش اروپایی و آسیایی استانبول همراه با خلاصه پروفایل و لینک جزئیات.'
        : 'Interactive 3D map of Istanbul universities in the ACCA EDU database, with approximate European and Asian side locations, quick summaries, and links to full university profiles.',
      canonicalUrl,
      shouldIndex: true,
      structuredData: buildWebPageJsonLd('3D Istanbul University Map', canonicalUrl),
    };
  }

  if (page === 'programs') {
    const canonicalParams = new URLSearchParams({ page: 'programs' });
    if (programUniversity?.name) {
      canonicalParams.set('university', programUniversity.name);
    }
    if (programQuery) {
      canonicalParams.set('program', programQuery);
    }
    const target = programUniversity?.name || programQuery;
    const canonicalUrl = target
      ? `${SITE_CANONICAL_ORIGIN}/?${canonicalParams.toString()}`
      : `${SITE_CANONICAL_ORIGIN}/programs/`;
    return {
      title: target
        ? (isFa
          ? `${target} | \u0631\u0634\u062a\u0647\u200c\u0647\u0627\u060c \u0634\u0647\u0631\u06cc\u0647 \u0648 \u067e\u0630\u06cc\u0631\u0634 \u062a\u0631\u06a9\u06cc\u0647 | ${BRAND_TITLE}`
          : `${target} Programs, Tuition & Admission in Turkey | ${BRAND_TITLE}`)
        : (isFa
          ? `\u0631\u0634\u062a\u0647\u200c\u0647\u0627\u060c \u0634\u0647\u0631\u06cc\u0647 \u0648 \u067e\u0630\u06cc\u0631\u0634 \u062f\u0627\u0646\u0634\u06af\u0627\u0647\u06cc \u062a\u0631\u06a9\u06cc\u0647 | ${BRAND_TITLE}`
          : `Programs, Tuition & University Admission in Turkey | ${BRAND_TITLE}`),
      description: target
        ? (isFa
          ? `\u062c\u0633\u062a\u062c\u0648\u06cc ${target} \u062f\u0631 \u0644\u06cc\u0633\u062a \u0631\u0634\u062a\u0647\u200c\u0647\u0627\u06cc \u062a\u0631\u06a9\u06cc\u0647 \u0628\u0627 \u0634\u0647\u0631\u06cc\u0647\u060c \u0632\u0628\u0627\u0646 \u062a\u062d\u0635\u06cc\u0644\u060c \u0645\u0642\u0637\u0639\u060c \u062f\u067e\u0648\u0632\u06cc\u062a \u0648 \u0645\u0634\u0627\u0648\u0631\u0647 \u067e\u0630\u06cc\u0631\u0634 \u062f\u0627\u0646\u0634\u062c\u0648\u06cc\u0627\u0646 \u0628\u06cc\u0646\u200c\u0627\u0644\u0645\u0644\u0644\u06cc.`
          : `Search ${target} in Turkey program listings with tuition, language, degree, deposit, and admission guidance for international students.`)
        : (isFa
          ? '\u062c\u0633\u062a\u062c\u0648 \u062f\u0631 \u0631\u0634\u062a\u0647\u200c\u0647\u0627\u06cc \u062f\u0627\u0646\u0634\u06af\u0627\u0647\u06cc \u062a\u0631\u06a9\u06cc\u0647 \u0628\u0627 \u0634\u0647\u0631\u06cc\u0647\u060c \u0628\u0648\u0631\u0633\u06cc\u0647\u060c \u0632\u0628\u0627\u0646 \u062a\u062d\u0635\u06cc\u0644\u060c \u0645\u0642\u0637\u0639 \u0648 \u0627\u0637\u0644\u0627\u0639\u0627\u062a \u067e\u0630\u06cc\u0631\u0634.'
          : 'Search university programs in Turkey with tuition, scholarship, language, degree, and admission information.'),
      canonicalUrl,
      shouldIndex: true,
      structuredData: buildWebPageJsonLd(target || 'Programs in Turkey', canonicalUrl),
    };
  }

  if (page === 'scholarships') {
    const canonicalUrl = `${SITE_CANONICAL_ORIGIN}/scholarships/`;
    return {
      title: isFa ? `\u0628\u0648\u0631\u0633\u06cc\u0647\u200c\u0647\u0627\u06cc \u062f\u0627\u0646\u0634\u06af\u0627\u0647\u06cc \u062a\u0631\u06a9\u06cc\u0647 | ${BRAND_TITLE}` : `Turkey University Scholarships | ${BRAND_TITLE}`,
      description: isFa
        ? '\u0644\u06cc\u0633\u062a \u0628\u0648\u0631\u0633\u06cc\u0647\u200c\u0647\u0627\u06cc ACCA \u0628\u0631\u0627\u06cc \u062f\u0627\u0646\u0634\u06af\u0627\u0647\u200c\u0647\u0627\u06cc \u062a\u0631\u06a9\u06cc\u0647 \u0628\u0627 \u0642\u06cc\u0645\u062a\u060c \u0631\u0634\u062a\u0647\u060c \u0645\u0642\u0637\u0639 \u0648 \u0645\u0634\u0627\u0648\u0631\u0647 \u067e\u0630\u06cc\u0631\u0634.'
        : 'ACCA scholarship listings for Turkish universities with price, program, degree, and admission guidance.',
      canonicalUrl,
      shouldIndex: true,
      structuredData: buildWebPageJsonLd('Turkey University Scholarships', canonicalUrl),
    };
  }

  return {
    ...fallback,
    shouldIndex: !page,
  };
}

function buildWebPageJsonLd(name, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: BRAND_TITLE,
      url: SITE_CANONICAL_ORIGIN,
    },
  };
}

function buildUniversityJsonLd(university, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: university.name,
    url,
    sameAs: university.website || undefined,
    address: university.address ? {
      '@type': 'PostalAddress',
      streetAddress: university.address,
      addressLocality: university.city || 'Istanbul',
      addressCountry: university.country || 'Turkey',
    } : undefined,
  };
}

function buildItemListJsonLd(url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Private universities in Istanbul and Turkey | ${BRAND_TITLE}`,
    url,
    itemListElement: istanbulUniversities.slice(0, 24).map((university, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: university.name,
      url: `${SITE_CANONICAL_ORIGIN}/?page=universities&profile=${encodeURIComponent(university.slug)}`,
    })),
  };
}

function upsertJsonLd(id, data) {
  const existing = document.getElementById(id);
  const script = existing || document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);

  if (!existing) {
    document.head.appendChild(script);
  }
}

function PageLoadingScreen({ darkMode, isFa }) {
  return (
    <div
      className={`${darkMode ? 'bg-[#050816] text-white' : 'bg-[#F7F1E8] text-neutral-950'} grid min-h-screen place-items-center px-6`}
      dir={isFa ? 'rtl' : 'ltr'}
    >
      <div className={`${darkMode ? 'border-white/10 bg-white/10' : 'border-black/10 bg-white/80'} rounded-[28px] border px-8 py-6 text-sm font-black shadow-[0_18px_60px_rgba(0,0,0,0.10)] backdrop-blur-xl`}>
        {isFa ? '\u062f\u0631 \u062d\u0627\u0644 \u0628\u0627\u0631\u06af\u0630\u0627\u0631\u06cc...' : 'Loading...'}
      </div>
    </div>
  );
}
/**
 * FloatingOrbs – isolated component that drives its own scroll-parallax via
 * direct DOM mutation (no React state updates) so scrolling never triggers a
 * re-render of the parent App tree.
 */
const FloatingOrbs = memo(function FloatingOrbs({ floatingObjects, darkMode }) {
  const containerRef = useRef(null);

  useEffect(() => {
    let rAF = 0;
    let lastScrollY = window.scrollY;

    const update = () => {
      const curr = window.scrollY;
      const velocity = curr - lastScrollY;
      lastScrollY = curr;
      rAF = 0;

      const container = containerRef.current;
      if (!container) return;
      const children = container.children;

      for (let i = 0; i < floatingObjects.length; i++) {
        const el = children[i];
        if (!el) continue;
        const star = floatingObjects[i];
        const blur = Math.min(Math.abs(velocity) * 0.12, 4);
        const moveY = curr * (0.045 * star.depth);
        const moveX = curr * (0.01 * star.depth);
        el.style.transform = `translate3d(${moveX}px, ${moveY}px, ${star.depth * 40}px)`;
        el.style.filter = blur > 0.05 ? `blur(${blur}px)` : '';
      }
    };

    const onScroll = () => { if (!rAF) rAF = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rAF) cancelAnimationFrame(rAF);
    };
  }, [floatingObjects]);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {floatingObjects.map((star) => (
        <div
          key={star.id}
          className="orb"
          style={{
            width:           `${star.size}px`,
            height:          `${star.size}px`,
            top:             `${star.top}%`,
            left:            `${star.left}%`,
            opacity:         darkMode ? 0.95 : 0.58,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
});

function DeferredSectionFallback({ minHeight }) {
  return (
    <div
      aria-hidden="true"
      style={{
        minHeight,
        contentVisibility: 'auto',
        containIntrinsicSize: `auto ${minHeight}px`,
      }}
    />
  );
}

function DeferredHomeSection({ children, eager = false, minHeight = 560, rootMargin = '520px 0px' }) {
  const containerRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(eager);
  const renderNow = eager || shouldRender;

  useEffect(() => {
    if (renderNow) return undefined;

    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') {
      setShouldRender(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [renderNow, rootMargin]);

  return (
    <div
      ref={containerRef}
      style={renderNow ? undefined : {
        minHeight,
        contentVisibility: 'auto',
        containIntrinsicSize: `auto ${minHeight}px`,
      }}
    >
      {renderNow ? (
        <Suspense fallback={<DeferredSectionFallback minHeight={minHeight} />}>
          {children}
        </Suspense>
      ) : null}
    </div>
  );
}

export default function ACCALandingPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState(getStoredLanguage);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  // PWA install prompt dismissal — persisted so it stays hidden for 14 days
  // after the user closes it (no aggressive re-prompting on every visit).
  const [installDismissed, setInstallDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const ts = Number(window.localStorage.getItem('acca:pwa-install-dismissed-at'));
      return Boolean(ts) && Date.now() - ts < 14 * 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  });
  const [isDesktopViewport, setIsDesktopViewport] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
  });
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const cursorTargetRef = useRef({ x: 0, y: 0 });
  const cursorRingPositionRef = useRef({ x: 0, y: 0 });

  const toggleLanguage = () => {
    setLanguage((currentLanguage) => currentLanguage === 'fa' ? 'en' : 'fa');
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Keep the selected language for this page when storage is unavailable.
    }
  }, [language]);

  useEffect(() => {
    const syncLanguageAcrossTabs = (event) => {
      if (event.key !== LANGUAGE_STORAGE_KEY || !SUPPORTED_LANGUAGES.has(event.newValue)) return;
      setLanguage(event.newValue);
    };

    window.addEventListener('storage', syncLanguageAcrossTabs);
    return () => window.removeEventListener('storage', syncLanguageAcrossTabs);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const standaloneQuery = window.matchMedia?.('(display-mode: standalone)');
    const updateInstalledState = () => {
      setIsAppInstalled(Boolean(standaloneQuery?.matches || window.navigator.standalone));
    };

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      window.__accaInstallPromptAvailable = true;
      setInstallPromptEvent(event);
    };

    const handleAppInstalled = () => {
      window.__accaInstallPromptAvailable = false;
      setIsAppInstalled(true);
      setInstallPromptEvent(null);
    };

    updateInstalledState();
    standaloneQuery?.addEventListener?.('change', updateInstalledState);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      standaloneQuery?.removeEventListener?.('change', updateInstalledState);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const updateViewport = () => setIsDesktopViewport(mediaQuery.matches);

    updateViewport();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateViewport);
      return () => mediaQuery.removeEventListener('change', updateViewport);
    }

    mediaQuery.addListener(updateViewport);
    return () => mediaQuery.removeListener(updateViewport);
  }, []);

  useEffect(() => {
    if (!isDesktopViewport) return undefined;

    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    if (!dot || !ring) return undefined;

    let animationFrame = 0;
    let cursorVisible = false;

    const stopCursorLoop = () => {
      if (!animationFrame) return;
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const animateCursor = () => {
      const current = cursorRingPositionRef.current;
      const target = cursorTargetRef.current;
      const next = {
        x: current.x + (target.x - current.x) * 0.32,
        y: current.y + (target.y - current.y) * 0.32,
      };

      cursorRingPositionRef.current = next;
      ring.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) translate(-50%, -50%)`;
      animationFrame = requestAnimationFrame(animateCursor);
    };

    const startCursorLoop = () => {
      if (!animationFrame) {
        animationFrame = requestAnimationFrame(animateCursor);
      }
    };

    const setCursorVisibility = (visible) => {
      if (cursorVisible === visible) return;
      cursorVisible = visible;
      dot.style.opacity = visible ? '1' : '0';
      ring.style.opacity = visible ? '1' : '0';

      if (visible) {
        startCursorLoop();
      } else {
        stopCursorLoop();
      }
    };

    const handleMouseMove = (event) => {
      cursorTargetRef.current = {
        x: event.clientX,
        y: event.clientY,
      };

      dot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;

      if (!cursorVisible) {
        cursorRingPositionRef.current = {
          x: event.clientX,
          y: event.clientY,
        };
        ring.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
      }

      setCursorVisibility(true);
    };

    const handleMouseLeave = () => setCursorVisibility(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      stopCursorLoop();
    };
  }, [isDesktopViewport]);

  useEffect(() => {
    if (!isDesktopViewport) return undefined;

    const handlePointerHover = (event) => {
      const interactive = event.target.closest(
        'a, button, input, textarea, select, label, [role="button"], [data-hero-astronaut-canvas]'
      );
      cursorRingRef.current?.classList.toggle('hovered', Boolean(interactive));
    };

    window.addEventListener('mouseover', handlePointerHover);
    window.addEventListener('mouseout', handlePointerHover);

    return () => {
      window.removeEventListener('mouseover', handlePointerHover);
      window.removeEventListener('mouseout', handlePointerHover);
    };
  }, [isDesktopViewport]);

  // Scroll tracking moved into HeroSection (parallax) and FloatingOrbs (orbs)
  // to prevent full-app re-renders on every scroll frame.

  const isFa = language === 'fa';
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const routeAlias = useMemo(() => getStaticRouteAlias(pathname), [pathname]);
  const params = useMemo(() => {
    const nextParams = new URLSearchParams(search);
    if (routeAlias) {
      Object.entries(routeAlias).forEach(([key, value]) => {
        if (key === 'canonicalPath' || value == null || nextParams.has(key)) return;
        nextParams.set(key, value);
      });
    }
    return nextParams;
  }, [search, routeAlias]);
  const page = params.get('page');
  const staticCanonicalUrl = routeAlias?.canonicalPath
    ? `${SITE_CANONICAL_ORIGIN}${routeAlias.canonicalPath}`
    : null;
  const staticRouteMeta = routeAlias?.canonicalPath
    ? STATIC_ROUTE_META[routeAlias.canonicalPath]
    : null;
  const eagerHomeSections = !page && Boolean(params.get('section'));

  // ── SEO: keep <html lang/dir> in sync with the active language ────────────
  useEffect(() => {
    document.documentElement.lang = isFa ? 'fa' : 'en';
    document.documentElement.dir = isFa ? 'rtl' : 'ltr';
  }, [isFa]);

  useEffect(() => {
    const sectionId = params.get('section');
    if (page || !sectionId) return undefined;

    const timer = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ block: 'start' });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [page, params]);

  // ── SEO: update <title> and meta description per page ─────────────────────
  useEffect(() => {
    const PAGE_TITLES = {
      'istanbul-map': isFa ? `نقشه سه بعدی دانشگاه های استانبول | ${BRAND_TITLE}` : `3D Istanbul University Map | ${BRAND_TITLE}`,
      programs:     isFa ? `رشته‌ها و شهریه‌ها | ${BRAND_TITLE}` : `Programs & Tuition | ${BRAND_TITLE}`,
      universities: isFa ? `دانشگاه‌ها | ${BRAND_TITLE}`          : `Universities | ${BRAND_TITLE}`,
      scholarships: isFa ? `بورسیه‌ها | ${BRAND_TITLE}`            : `Scholarships | ${BRAND_TITLE}`,
      portal:       isFa ? `پنل کاربری | ${BRAND_TITLE}`           : `Client Portal | ${BRAND_TITLE}`,
      blog:         isFa ? `بلاگ تحصیل در ترکیه، اقامت دانشجویی و پذیرش | ${BRAND_TITLE}` : `Study in Turkey Blog: Admission, Residence & Student Guides | ${BRAND_TITLE}`,
      glossary:     isFa ? `فرهنگ‌نامه تحصیل در ترکیه، اقامت و زندگی دانشجویی | ${BRAND_TITLE}` : `Study in Turkey Glossary | ${BRAND_TITLE}`,
    };
    const PAGE_DESCS = {
      'istanbul-map': isFa
        ? 'نقشه سه بعدی تعاملی دانشگاه های استانبول در دیتابیس ACCA EDU با موقعیت تقریبی، خلاصه پروفایل و لینک جزئیات.'
        : 'Interactive 3D map of Istanbul universities in the ACCA EDU database with approximate locations, quick profiles, and detail links.',
      programs:     isFa
        ? 'جستجو در بیش از ۱۶۰۰ رشته دانشگاهی در ترکیه همراه با شهریه، بورسیه و اطلاعات پذیرش.'
        : 'Search over 1,600 university programs in Turkey with tuition, scholarships and admission info.',
      universities: isFa
        ? 'مشاهده پروفایل دانشگاه‌های خصوصی معتبر استانبول و ترکیه.'
        : 'View profiles of top private universities in Istanbul and Turkey.',
      scholarships: isFa
        ? 'لیست کامل بورسیه‌های ACCA برای دانشگاه‌های ترکیه — صرفه‌جویی تا ۶۰٪.'
        : 'Full list of ACCA scholarships for Turkish universities — save up to 60%.',
      blog:         isFa
        ? 'بلاگ راهنمای آکا برای دانشجویان بین‌المللی: اقامت دانشجویی ترکیه، ای‌کامِت، هزینه اقامت، هارچ، دولت الکترونیک ترکیه، ثبت آدرس، پذیرش دانشگاه و مسیرهای تحصیل در ترکیه.'
        : 'ACCA EDU data-led blog for international students: Turkey student residence, e-İkamet, residence fees, e-Devlet, address registration, university admission and study-in-Turkey guidance.',
      glossary:     isFa
        ? 'فرهنگ‌نامه آکا برای توضیح ساده اصطلاحات تحصیل در ترکیه، اقامت دانشجویی، ای‌کامِت، هارچ، ثبت آدرس، کارت اقامت و خدمات دولتی ترکیه.'
        : 'Glossary for study, residence and student life terms in Turkey.',
    };
    document.title = staticRouteMeta?.title || PAGE_TITLES[page] || (isFa
      ? `تحصیل در ترکیه، از پذیرش دانشگاه تا اقامت دانشجویی | ${BRAND_NAME}`
      : BRAND_TITLE);
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && (staticRouteMeta?.description || PAGE_DESCS[page])) {
      metaDesc.setAttribute('content', staticRouteMeta?.description || PAGE_DESCS[page]);
    }
    // Canonical consolidation: a view reached via ?page=programs and via the
    // clean /programs/ path must declare ONE canonical (the clean path), so the
    // two URLs stop competing as duplicate content. cleanCanonicalPath returns
    // null for faceted/profile views, which keep their existing canonical.
    const computedCleanPath = cleanCanonicalPath(page, params);
    const cleanCanonical = staticCanonicalUrl
      || (computedCleanPath ? `${SITE_CANONICAL_ORIGIN}${computedCleanPath}` : null);
    const canonicalPage = INDEXABLE_PAGES.has(page) ? page : null;
    const canonicalUrl = cleanCanonical || (canonicalPage
      ? `${SITE_CANONICAL_ORIGIN}/?page=${canonicalPage}`
      : `${SITE_CANONICAL_ORIGIN}/`);
    const currentDescription = metaDesc?.getAttribute('content') || '';
    const shouldIndex = !page || INDEXABLE_PAGES.has(page);
    const setElementAttr = (selector, attr, value) => {
      const element = document.querySelector(selector);
      if (element) element.setAttribute(attr, value);
    };

    setElementAttr('link[rel="canonical"]', 'href', canonicalUrl);
    setElementAttr('link[hreflang="fa"]', 'href', canonicalUrl);
    setElementAttr('link[hreflang="en"]', 'href', canonicalUrl);
    setElementAttr('link[hreflang="x-default"]', 'href', canonicalUrl);
    setElementAttr('meta[name="robots"]', 'content', shouldIndex
      ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
      : 'noindex, nofollow');
    setElementAttr('meta[name="googlebot"]', 'content', shouldIndex
      ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
      : 'noindex, nofollow');
    setElementAttr('meta[name="bingbot"]', 'content', shouldIndex
      ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
      : 'noindex, nofollow');
    setElementAttr('meta[property="og:url"]', 'content', canonicalUrl);
    setElementAttr('meta[property="og:title"]', 'content', document.title);
    setElementAttr('meta[property="og:description"]', 'content', currentDescription);
    setElementAttr('meta[name="twitter:title"]', 'content', document.title);
    setElementAttr('meta[name="twitter:description"]', 'content', currentDescription);

    // Rich per-route SEO override. For blog/glossary this comes from a lazily
    // loaded module so the large datasets stay out of the main bundle.
    const applyRichSeo = (routeSeo) => {
      if (!routeSeo) return;
      if (cleanCanonical) routeSeo = { ...routeSeo, canonicalUrl: cleanCanonical };
      if (staticRouteMeta) {
        routeSeo = {
          ...routeSeo,
          title: staticRouteMeta.title || routeSeo.title,
          description: staticRouteMeta.description || routeSeo.description,
        };
      }
      document.title = routeSeo.title;
      if (metaDesc) metaDesc.setAttribute('content', routeSeo.description);
      setElementAttr('link[rel="canonical"]', 'href', routeSeo.canonicalUrl);
      setElementAttr('link[hreflang="fa"]', 'href', routeSeo.canonicalUrl);
      setElementAttr('link[hreflang="en"]', 'href', routeSeo.canonicalUrl);
      setElementAttr('link[hreflang="x-default"]', 'href', routeSeo.canonicalUrl);
      setElementAttr('meta[property="og:url"]', 'content', routeSeo.canonicalUrl);
      setElementAttr('meta[property="og:title"]', 'content', routeSeo.title);
      setElementAttr('meta[property="og:description"]', 'content', routeSeo.description);
      setElementAttr('meta[name="twitter:title"]', 'content', routeSeo.title);
      setElementAttr('meta[name="twitter:description"]', 'content', routeSeo.description);
      if (routeSeo.image) {
        setElementAttr('meta[property="og:image"]', 'content', routeSeo.image);
        setElementAttr('meta[name="twitter:image"]', 'content', routeSeo.image);
      }
      if (routeSeo.keywords) setElementAttr('meta[name="keywords"]', 'content', routeSeo.keywords);
      setElementAttr('meta[name="robots"]', 'content', routeSeo.shouldIndex && (!page || INDEXABLE_PAGES.has(page))
        ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
        : 'noindex, nofollow');
      setElementAttr('meta[name="googlebot"]', 'content', routeSeo.shouldIndex && (!page || INDEXABLE_PAGES.has(page))
        ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
        : 'noindex, nofollow');
      setElementAttr('meta[name="bingbot"]', 'content', routeSeo.shouldIndex && (!page || INDEXABLE_PAGES.has(page))
        ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
        : 'noindex, nofollow');
      if (routeSeo.structuredData) upsertJsonLd('acca-route-structured-data', routeSeo.structuredData);
    };

    let cancelled = false;
    if (page === 'blog') {
      import('./lib/blogSeo')
        .then(({ getBlogRouteSeo }) => {
          if (!cancelled) applyRichSeo(getBlogRouteSeo({ params, isFa }));
        })
        .catch(() => { /* SEO enrichment is non-critical */ });
    } else if (page === 'glossary') {
      import('./lib/knowledgeSeo')
        .then(({ getKnowledgeRouteSeo }) => {
          if (!cancelled) applyRichSeo(getKnowledgeRouteSeo({ page, params, isFa }));
        })
        .catch(() => { /* SEO enrichment is non-critical */ });
    } else {
      applyRichSeo(getRouteSeo({ page, params, isFa }));
    }
    return () => { cancelled = true; };
  }, [page, isFa, params, staticCanonicalUrl, staticRouteMeta]);


  const handleInstallClick = async () => {
    if (!installPromptEvent) return;

    installPromptEvent.prompt();

    try {
      await installPromptEvent.userChoice;
    } finally {
      window.__accaInstallPromptAvailable = false;
      setInstallPromptEvent(null);
    }
  };

  const handleDismissInstall = () => {
    setInstallDismissed(true);
    try {
      window.localStorage.setItem('acca:pwa-install-dismissed-at', String(Date.now()));
    } catch {
      /* localStorage unavailable (e.g. private mode) — dismissed for this session only */
    }
  };

  const floatingActions = (
    <FloatingActions
      isFa={isFa}
      installVisible={Boolean(installPromptEvent && !isAppInstalled && !installDismissed)}
      onInstall={handleInstallClick}
      onDismissInstall={handleDismissInstall}
    />
  );

  let pageContent = null;

  if (page === 'programs') {
    pageContent = (
      <>
        <Suspense fallback={<PageLoadingScreen darkMode={darkMode} isFa={isFa} />}>
        <ProgramsSearchPage
          darkMode={darkMode}
          isFa={isFa}
          ACCA_LOGO_SRC={ACCA_LOGO_SRC}
          onConsultationClick={() => setConsultationOpen(true)}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onToggleLanguage={toggleLanguage}
        />
        </Suspense>
        <ConsultationModal
          open={consultationOpen}
          onClose={() => setConsultationOpen(false)}
          darkMode={darkMode}
          isFa={isFa}
        />
      </>
    );
  } else if (page === 'universities') {
    pageContent = (
      <>
        <Suspense fallback={<PageLoadingScreen darkMode={darkMode} isFa={isFa} />}>
        <UniversitiesPage
          darkMode={darkMode}
          isFa={isFa}
          ACCA_LOGO_SRC={ACCA_LOGO_SRC}
          onConsultationClick={() => setConsultationOpen(true)}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onToggleLanguage={toggleLanguage}
        />
        </Suspense>
        <ConsultationModal
          open={consultationOpen}
          onClose={() => setConsultationOpen(false)}
          darkMode={darkMode}
          isFa={isFa}
        />
      </>
    );
  } else if (page === 'istanbul-map') {
    pageContent = (
      <>
        <Suspense fallback={<PageLoadingScreen darkMode={darkMode} isFa={isFa} />}>
          <IstanbulUniversityMapPage
            darkMode={darkMode}
            isFa={isFa}
            ACCA_LOGO_SRC={ACCA_LOGO_SRC}
            onConsultationClick={() => setConsultationOpen(true)}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onToggleLanguage={toggleLanguage}
          />
        </Suspense>
        <ConsultationModal
          open={consultationOpen}
          onClose={() => setConsultationOpen(false)}
          darkMode={darkMode}
          isFa={isFa}
        />
      </>
    );
  } else if (page === 'scholarships') {
    pageContent = (
      <>
        <Suspense fallback={<PageLoadingScreen darkMode={darkMode} isFa={isFa} />}>
        <ScholarshipsPage
          darkMode={darkMode}
          isFa={isFa}
          ACCA_LOGO_SRC={ACCA_LOGO_SRC}
          onConsultationClick={() => setConsultationOpen(true)}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onToggleLanguage={toggleLanguage}
        />
        </Suspense>
        <ConsultationModal
          open={consultationOpen}
          onClose={() => setConsultationOpen(false)}
          darkMode={darkMode}
          isFa={isFa}
        />
      </>
    );
  } else if (page === 'blog') {
    pageContent = (
      <>
        <Suspense fallback={<PageLoadingScreen darkMode={darkMode} isFa={isFa} />}>
          <BlogPage
            darkMode={darkMode}
            isFa={isFa}
            ACCA_LOGO_SRC={ACCA_LOGO_SRC}
            postSlug={params.get('post')}
            onConsultationClick={() => setConsultationOpen(true)}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onToggleLanguage={toggleLanguage}
          />
        </Suspense>
        <ConsultationModal
          open={consultationOpen}
          onClose={() => setConsultationOpen(false)}
          darkMode={darkMode}
          isFa={isFa}
        />
        {floatingActions}
      </>
    );
  } else if (page === 'glossary') {
    pageContent = (
      <>
        <Suspense fallback={<PageLoadingScreen darkMode={darkMode} isFa={isFa} />}>
          <GlossaryPage
            darkMode={darkMode}
            isFa={isFa}
            ACCA_LOGO_SRC={ACCA_LOGO_SRC}
            termSlug={params.get('term')}
            onConsultationClick={() => setConsultationOpen(true)}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onToggleLanguage={toggleLanguage}
          />
        </Suspense>
        <ConsultationModal
          open={consultationOpen}
          onClose={() => setConsultationOpen(false)}
          darkMode={darkMode}
          isFa={isFa}
        />
        {floatingActions}
      </>
    );
  } else if (page === 'portal') {
    pageContent = (
      <div
        className={`${darkMode ? 'bg-[#050816] text-white' : 'bg-[#F7F1E8] text-neutral-950'} min-h-screen overflow-hidden px-6 py-8`}
        dir={isFa ? 'rtl' : 'ltr'}
      >
        <div className={`${darkMode ? 'darkGlass' : 'glass'} mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full px-5 py-4 sm:px-7`}>
          <a href="/" aria-label={isFa ? 'بازگشت به صفحه اصلی ACCA EDU' : 'Back to ACCA EDU home'}>
            <img
              src={ACCA_LOGO_SRC}
              alt="ACCA EDU Logo"
              width="160"
              height="44"
              className="h-10 w-auto object-contain sm:h-11"
            />
          </a>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleLanguage}
              className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} h-11 rounded-full px-4 text-xs font-black sm:px-5 sm:text-sm`}
            >
              {isFa ? 'EN' : 'FA'}
            </button>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} grid h-11 w-11 place-items-center rounded-full text-base font-black`}
            >
              {darkMode ? '☀' : '☾'}
            </button>

            <a
              href="/"
              className={`${darkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-black/5 text-black hover:bg-black/10'} rounded-full px-4 py-3 text-xs font-black transition sm:px-6 sm:text-sm`}
            >
              {isFa ? 'بازگشت' : 'Back'}
            </a>
          </div>
        </div>

        <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl flex-col items-center justify-center text-center">
          <div className={`${darkMode ? 'text-white/40' : 'text-black/40'} mb-6 text-sm font-black uppercase tracking-[0.35em]`}>
            ACCA EDU
          </div>
          <h1 className="text-5xl font-black leading-tight md:text-8xl">
            {isFa ? 'پنل کاربری' : 'Client Portal'}
          </h1>
          <p className={`${darkMode ? 'text-white/60' : 'text-black/55'} mt-8 max-w-2xl text-lg font-medium leading-9 md:text-xl`}>
            {isFa
              ? 'این صفحه برای داشبورد دانشجویان و مدیریت پرونده آماده می‌شود.'
              : 'This page will be used for the student dashboard and case management system.'}
          </p>
        </main>
      </div>
    );
  } else if (LEGAL_PAGES[page]) {
    const legal = LEGAL_PAGES[page];
    pageContent = (
      <div
        className={`${darkMode ? 'bg-[#050816] text-white' : 'bg-[#F7F1E8] text-neutral-950'} min-h-screen overflow-hidden px-6 py-8`}
        dir={isFa ? 'rtl' : 'ltr'}
      >
        <div className={`${darkMode ? 'darkGlass' : 'glass'} mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full px-5 py-4 sm:px-7`}>
          <a href="/" aria-label={isFa ? 'بازگشت به صفحه اصلی ACCA EDU' : 'Back to ACCA EDU home'}>
            <img
              src={ACCA_LOGO_SRC}
              alt="ACCA EDU Logo"
              width="160"
              height="44"
              className="h-10 w-auto object-contain sm:h-11"
            />
          </a>

          <a
            href="/"
            className={`${darkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-black/5 text-black hover:bg-black/10'} rounded-full px-4 py-3 text-xs font-black transition sm:px-6 sm:text-sm`}
          >
            {isFa ? 'بازگشت' : 'Back'}
          </a>
        </div>

        <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-3xl flex-col items-center justify-center text-center">
          <div className={`${darkMode ? 'text-white/40' : 'text-black/40'} mb-6 text-sm font-black uppercase tracking-[0.35em]`}>
            ACCA EDU
          </div>
          <h1 className="text-4xl font-black leading-tight md:text-6xl">
            {isFa ? legal.title.fa : legal.title.en}
          </h1>
          <p className={`${darkMode ? 'text-white/60' : 'text-black/55'} mt-8 max-w-2xl text-lg font-medium leading-9`}>
            {isFa ? legal.note.fa : legal.note.en}
          </p>
        </main>
      </div>
    );
  } else if (page === 'seo' && SEO_LANDING_BY_SLUG[params.get('seoSlug')]) {
    pageContent = (
      <>
        <Suspense fallback={<PageLoadingScreen darkMode={darkMode} isFa={isFa} />}>
          <SeoLandingPage
            slug={params.get('seoSlug')}
            data={SEO_LANDING_BY_SLUG[params.get('seoSlug')]}
            darkMode={darkMode}
            ACCA_LOGO_SRC={ACCA_LOGO_SRC}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
          />
        </Suspense>
        {floatingActions}
      </>
    );
  }

  const floatingObjects = useMemo(
    () =>
      Array.from({ length: darkMode ? 30 : 18 }, (_, i) => ({
        id: i,
        size: 2 + (i % 4) * 2,
        left: (i * 8) % 100,
        top: (i * 12) % 100,
        duration: 8 + i,
        depth: (i % 5) + 1,
      })),
    [darkMode]
  );

  const registrationSteps = useMemo(
    () => [
      {
        icon: '📌',
        title: isFa ? 'مشاوره اولیه' : 'Initial Consultation',
        desc: isFa
          ? 'بررسی شرایط، انتخاب رشته و برنامه‌ریزی مسیر تحصیلی.'
          : 'Reviewing your profile, selecting a major, and planning your academic path.',
        ctaType: 'consult',
        ctaLabel: isFa ? 'شروع مشاوره رایگان' : 'Start free consultation',
      },
      {
        icon: '🎯',
        title: isFa ? 'انتخاب دانشگاه' : 'University Selection',
        desc: isFa
          ? 'معرفی بهترین دانشگاه‌ها براساس بودجه و آینده شغلی.'
          : 'Choosing the best universities based on budget and career goals.',
        ctaHref: '/universities/',
        ctaLabel: isFa ? 'مشاهده دانشگاه‌ها' : 'Explore universities',
      },
      {
        icon: '📝',
        title: isFa ? 'اخذ پذیرش' : 'Admission Process',
        desc: isFa
          ? 'ترجمه مدارک، اپلای و دریافت پذیرش رسمی.'
          : 'Document translation, application submission, and official admission.',
        ctaHref: '/programs/',
        ctaLabel: isFa ? 'رشته‌ها و شهریه‌ها' : 'Programs & tuition',
      },
      {
        icon: '✈️',
        title: isFa ? 'ورود و اقامت' : 'Arrival & Residence',
        desc: isFa
          ? 'اقامت، خوابگاه و پشتیبانی کامل بعد از ورود.'
          : 'Residence setup, accommodation, and full post-arrival support.',
        ctaHref: '/residence-permit/',
        ctaLabel: isFa ? 'راهنمای اقامت' : 'Residence guide',
      },
    ],
    [isFa]
  );

  const scholarshipComparison = useMemo(
    () => [
      {
        title: isFa
          ? 'تخفیف پرداخت نقدی به دانشگاه'
          : 'Direct University Cash Discount',
        price: '$10,000',
        desc: isFa
          ? 'دانشجو هزینه کامل دوره کارشناسی ۴ ساله به‌همراه ۱ سال دوره زبان را به‌صورت نقدی مستقیم به دانشگاه پرداخت می‌کند و شامل تخفیف ویژه نقدی می‌شود.'
          : 'The student pays the full tuition for the 4-year bachelor program plus 1 language year directly to the university in cash and receives a special cash-payment discount.',
        features: isFa
          ? [
              'تخفیف پرداخت نقدی',
              'پرداخت مستقیم به دانشگاه',
              'هزینه کمتر نسبت به ترمیک',
            ]
          : [
              'Cash Payment Discount',
              'Direct University Payment',
              'Lower Cost Than Semester Tuition',
            ],
        ctaLabel: isFa ? 'لیست شهریه‌های عادی' : 'Regular Tuition List',
        ctaHref: '/programs/',
      },
      {
        title: isFa ? 'بورسیه 100٪ ACCA' : 'ACCA 100% Scholarship',
        price: '$4,800',
        desc: isFa
          ? 'دانشجو صندلی بورسیه ۱۰۰٪ را به‌صورت نقدی از ACCA خریداری می‌کند و از پرداخت شهریه کل دوره کارشناسی ۴ ساله به‌همراه ۱ سال دوره زبان معاف می‌شود.'
          : 'The student purchases a 100% scholarship seat directly from ACCA and becomes fully exempt from tuition payments for the entire 4-year bachelor program plus 1 language year.',
        features: isFa
          ? [
              'معافیت کامل از شهریه',
              'صرفه‌جویی بسیار بالا',
              'پشتیبانی کامل ACCA',
            ]
          : [
              'Full Tuition Exemption',
              'Maximum Financial Savings',
              'Full ACCA Support',
            ],
        featured: true,
        ctaLabel: isFa ? 'لیست قیمت‌های بورسیه' : 'Scholarship Price List',
        ctaHref: '/scholarships/',
      },
      {
        title: isFa ? 'پرداخت ترمیک' : 'Semester-Based Tuition',
        price: '$12,000',
        desc: isFa
          ? 'پرداخت شهریه کامل دوره کارشناسی ۴ ساله به‌همراه ۱ سال دوره زبان به‌صورت ترم به ترم و بدون تخفیف بلندمدت یا بورسیه.'
          : 'The full tuition for the 4-year bachelor program plus 1 language year is paid semester by semester without long-term discounts or scholarship support.',
        features: isFa
          ? [
              'پرداخت اقساطی هر ترم',
              'بدون بورسیه',
              'بیشترین هزینه نهایی',
            ]
          : [
              'Semester Installments',
              'No Scholarship Included',
              'Highest Final Cost',
            ],
        ctaLabel: isFa ? 'لیست شهریه‌های عادی' : 'Regular Tuition List',
        ctaHref: '/programs/',
      },
    ],
    [isFa]
  );

  const majors = useMemo(
    () => [
      {
        icon: '🩺',
        title: isFa ? 'پزشکی' : 'Medicine',
        programFilters: ['Medicine', 'Medicine*'],
        category: isFa ? 'علوم سلامت' : 'Healthcare',
        duration: isFa ? '6 سال' : '6 Years',
        difficulty: isFa ? 'بسیار بالا' : 'Very High',
        quality: 'Top Tier',
        color: 'from-red-500/20 to-pink-500/10',
      },
      {
        icon: '🦷',
        title: isFa ? 'دندانپزشکی' : 'Dentistry',
        programFilters: ['Dentistry', 'Dentistry*'],
        category: isFa ? 'علوم سلامت' : 'Healthcare',
        duration: isFa ? '5 سال' : '5 Years',
        difficulty: isFa ? 'بالا' : 'High',
        quality: 'High Demand',
        color: 'from-cyan-500/20 to-blue-500/10',
      },
      {
        icon: '💻',
        title: isFa ? 'مهندسی نرم‌افزار' : 'Software Engineering',
        programFilters: ['Software Engineering'],
        category: isFa ? 'مهندسی' : 'Engineering',
        duration: isFa ? '4 سال' : '4 Years',
        difficulty: isFa ? 'متوسط' : 'Medium',
        quality: 'Future Proof',
        color: 'from-indigo-500/20 to-violet-500/10',
      },
      {
        icon: '🤖',
        title: isFa ? 'هوش مصنوعی' : 'Artificial Intelligence',
        programFilters: [
          'Artificial Intelligence',
          'Artificial Intelligence Engineering',
          'Artificial Intelligence and Data Engineering',
          'Artificial Intelligence Engineering and Data Science',
        ],
        category: isFa ? 'مهندسی' : 'Engineering',
        duration: isFa ? '4 سال' : '4 Years',
        difficulty: isFa ? 'بالا' : 'High',
        quality: 'Top Trend',
        color: 'from-fuchsia-500/20 to-purple-500/10',
      },
      {
        icon: '💊',
        title: isFa ? 'داروسازی' : 'Pharmacy',
        programFilters: ['Pharmacy', 'Pharmacy*', 'Pharmacy**'],
        category: isFa ? 'علوم سلامت' : 'Healthcare',
        duration: isFa ? '5 سال' : '5 Years',
        difficulty: isFa ? 'بالا' : 'High',
        quality: 'Clinical Career',
        color: 'from-emerald-500/20 to-green-500/10',
      },
      {
        icon: '🏗️',
        title: isFa ? 'معماری' : 'Architecture',
        programFilters: [
          'Architecture',
          'Architecture and Design',
          'Architecture Design',
          'Interior Architecture',
          'Interior Architecture & Environmental Design',
          'Interior Architecture and Environmental Design',
        ],
        category: isFa ? 'مهندسی' : 'Engineering',
        duration: isFa ? '4 سال' : '4 Years',
        difficulty: isFa ? 'متوسط' : 'Medium',
        quality: 'Creative Field',
        color: 'from-amber-500/20 to-orange-500/10',
      },
    ],
    [isFa]
  );

  const universityCards = useMemo(
    () => [
      {
        name: 'İstinye University',
        profileName: 'ISTINYE UNIVERSITY',
        ranking: '#Top Medical',
        tuition: '$4.8K - $12K',
        ministry: isFa ? 'مورد تایید' : 'Approved',
        logo: getUniversityLogo('ISTINYE UNIVERSITY'),
        href: getUniversityProfileHref('ISTINYE UNIVERSITY'),
        description: isFa
          ? 'یکی از مدرن‌ترین دانشگاه‌های پزشکی و سلامت ترکیه با امکانات بین‌المللی.'
          : 'One of Turkey’s most modern medical and healthcare universities with international facilities.',
      },
      {
        name: 'Bahçeşehir University',
        profileName: 'BAHCESEHIR UNIVERSITY',
        ranking: '#International',
        tuition: '$5K - $14K',
        ministry: isFa ? 'مورد تایید' : 'Approved',
        logo: getUniversityLogo('BAHCESEHIR UNIVERSITY'),
        href: getUniversityProfileHref('BAHCESEHIR UNIVERSITY'),
        description: isFa
          ? 'دانشگاه بین‌المللی استانبول با تمرکز بر رشته‌های مهندسی و بیزینس.'
          : 'An international Istanbul university focused on engineering and business majors.',
      },
      {
        name: 'Biruni University',
        profileName: 'BIRUNI UNIVERSITY',
        ranking: '#Healthcare',
        tuition: '$4K - $11K',
        ministry: isFa ? 'مورد تایید' : 'Approved',
        logo: getUniversityLogo('BIRUNI UNIVERSITY'),
        href: getUniversityProfileHref('BIRUNI UNIVERSITY'),
        description: isFa
          ? 'تمرکز تخصصی بر علوم سلامت، پزشکی و دندانپزشکی.'
          : 'Specialized in healthcare sciences, medicine, and dentistry.',
      },
    ],
    [isFa]
  );

  // Floating actions (PWA install + WhatsApp + Instagram) are intentionally
  // landing-page only — sub-pages (universities / programs / scholarships)
  // render without them.
  if (pageContent) return pageContent;

  return (
    <>
      {isDesktopViewport && (
        <>
          <div ref={cursorRingRef} className="cursor-ring" />
          <div ref={cursorDotRef} className="cursor-dot" />
        </>
      )}

      <div
        dir={isFa ? 'rtl' : 'ltr'}
        className={`min-h-screen overflow-hidden relative ${!darkMode ? 'light-contrast-scope' : ''} ${
          darkMode
            ? 'bg-[#050816] text-white'
            : 'bg-[#f5efe4] text-[#1f1f1f]'
        } transition-all duration-700`}
    >
      <style>{`
        * {
          box-sizing: border-box;
          font-family: 'Vazirmatn', sans-serif;
        }

        body {
          margin: 0;
          overflow-x: hidden;
        }

        .light-contrast-scope .text-neutral-500 {
          color: rgb(82 82 82);
        }

        .light-contrast-scope .text-emerald-400 {
          color: rgb(4 120 87);
        }

        .light-contrast-scope .text-\\[\\#C6A77D\\] {
          color: #7c5f34;
        }

        @media (min-width: 1024px) and (pointer: fine) {
          body {
            cursor: none;
          }

          a,
          button,
          input,
          textarea,
          select,
          label,
          [role="button"] {
            cursor: none !important;
          }
        }

        .cursor-ring {
          position: fixed;
          top: 0;
          left: 0;
          width: 38px;
          height: 38px;
          border-radius: 9999px;
          border: 1.5px solid rgba(255,255,255,0.65);
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          box-shadow:
            0 0 18px rgba(255,255,255,0.18),
            inset 0 0 10px rgba(255,255,255,0.08);
          pointer-events: none;
          z-index: 999999;
          opacity: 0;
          transform: translate(-50%, -50%);
          transition:
            opacity 0.12s ease,
            width 0.2s ease,
            height 0.2s ease,
            background 0.2s ease,
            border 0.2s ease;
          will-change: transform;
        }

        .cursor-ring.hovered {
          width: 56px;
          height: 56px;
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.9);
        }

        .cursor-dot {
          position: fixed;
          top: 0;
          left: 0;
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: #c0c7d4;
          box-shadow:
            0 0 10px rgba(223, 151, 43, 0.9),
            0 0 20px rgba(255, 135, 56, 0.5);
          pointer-events: none;
          z-index: 999999;
          opacity: 0;
          transform: translate(-50%, -50%);
          transition: opacity 0.12s ease;
          will-change: transform;
        }

        @media (max-width: 1023px), (pointer: coarse) {
          .cursor-ring,
          .cursor-dot {
            display: none !important;
          }
        }

        .glass {
          background: rgba(255,255,255,0.46);
          backdrop-filter: blur(34px);
          -webkit-backdrop-filter: blur(34px);
          border: 1px solid rgba(255,255,255,0.58);
          box-shadow:
            inset 0 1px 1px rgba(255,255,255,0.48),
            0 10px 32px rgba(0,0,0,0.06),
            0 0 24px rgba(255,255,255,0.08);
        }

        .darkGlass {
          background: rgba(17,24,39,0.42);
          backdrop-filter: blur(34px);
          -webkit-backdrop-filter: blur(34px);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow:
            inset 0 1px 1px rgba(255,255,255,0.08),
            0 10px 32px rgba(0,0,0,0.18),
            0 0 28px rgba(120,140,255,0.08);
        }

        .orb {
          position: absolute;
          border-radius: 999px;
          contain: layout style;
          background:
            radial-gradient(circle,
              rgba(255,248,235,0.95) 0%,
              rgba(245,220,190,0.72) 24%,
              rgba(220,180,140,0.22) 52%,
              rgba(220,180,140,0.04) 74%,
              transparent 100%);
          box-shadow:
            0 0 6px rgba(255,240,220,0.75),
            0 0 16px rgba(255,210,160,0.32),
            0 0 36px rgba(255,190,120,0.12);
          pointer-events: none;
          animation: orbFloat 16s ease-in-out infinite;
          will-change: transform;
          mix-blend-mode: screen;
        }

        .bg-gradient-layer {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }

        .mesh-gradient {
          position: absolute;
          border-radius: 999px;
          filter: blur(140px);
          opacity: 0.72;
          animation: meshFloat 22s ease-in-out infinite;
          will-change: transform;
          transform-origin: center;
          mix-blend-mode: screen;
        }

        .mesh-one {
          width: 1100px;
          height: 720px;
          top: -260px;
          right: -320px;
          transform: rotate(-28deg);
          background:
            linear-gradient(135deg,
              rgba(88,92,255,0.34),
              rgba(45,55,130,0.18),
              transparent 78%);
        }

        .mesh-two {
          width: 1200px;
          height: 780px;
          bottom: -340px;
          left: -360px;
          transform: rotate(18deg);
          background:
            linear-gradient(120deg,
              rgba(18,30,70,0.55),
              rgba(80,100,255,0.12),
              transparent 82%);
        }

        .mesh-three {
          width: 900px;
          height: 600px;
          top: 28%;
          left: 20%;
          transform: rotate(-16deg);
          background:
            linear-gradient(145deg,
              rgba(120,130,255,0.14),
              rgba(255,255,255,0.05),
              transparent 80%);
        }

        .light-mesh-one {
          width: 1100px;
          height: 760px;
          top: -260px;
          right: -360px;
          transform: rotate(-24deg);
          background:
            linear-gradient(135deg,
              rgba(255,248,240,0.92),
              rgba(236,223,204,0.68),
              transparent 78%);
          opacity: 0.92;
        }

        .light-mesh-two {
          width: 1300px;
          height: 860px;
          bottom: -360px;
          left: -420px;
          transform: rotate(18deg);
          background:
            linear-gradient(120deg,
              rgba(228,214,194,0.74),
              rgba(255,255,255,0.52),
              transparent 82%);
          opacity: 0.72;
        }

        .light-mesh-three {
          width: 920px;
          height: 620px;
          top: 26%;
          left: 18%;
          transform: rotate(-14deg);
          background:
            linear-gradient(145deg,
              rgba(250,245,238,0.64),
              rgba(235,224,208,0.32),
              transparent 80%);
          opacity: 0.58;
        }

        @keyframes meshFloat {
          0% {
            transform: translate3d(0px,0px,0px) rotate(-12deg) scale(1);
          }

          50% {
            transform: translate3d(60px,-50px,0px) rotate(-6deg) scale(1.08);
          }

          100% {
            transform: translate3d(0px,0px,0px) rotate(-12deg) scale(1);
          }
        }

        @keyframes orbFloat {
          0% {
            transform: translate3d(0,0,0) scale(1);
          }

          50% {
            transform: translate3d(-20px,-40px,80px) scale(1.08);
          }

          100% {
            transform: translate3d(0,0,0) scale(1);
          }
        }

        .hero-title {
          line-height: 0.96;
          letter-spacing: 0;
        }

        .hero-glow {
          position: absolute;
          width: 326px;
          height: 326px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255,255,255,0.95), transparent 70%);
          filter: blur(74px);
          opacity: 0.26;
          transform: translate3d(0,-14px,0);
        }

        .hero-astronaut-shell {
          width: min(496px, 72vw);
          height: min(496px, 72vw);
          max-width: 100%;
          aspect-ratio: 1;
          position: relative;
          contain: layout style size paint;
          background: transparent;
          filter: saturate(1.16) contrast(1.06) !important;
          will-change: transform;
          transform: translateZ(0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }

        .hero-astronaut-canvas {
          display: block;
          width: 100%;
          height: 100%;
          max-width: 100%;
          background: transparent;
          pointer-events: auto;
          cursor: grab;
          touch-action: none;
          user-select: none;
          filter:
            drop-shadow(0 30px 52px rgba(7,26,61,0.24))
            drop-shadow(0 0 34px rgba(16,185,129,0.18));
        }

        .hero-astronaut-canvas.is-dragging {
          cursor: grabbing;
        }

        .hero-astronaut-loader {
          position: absolute;
          inset: 50% auto auto 50%;
          width: 136px;
          aspect-ratio: 1;
          border-radius: 999px;
          border: 1px solid rgba(16,185,129,0.26);
          background:
            radial-gradient(circle at 50% 50%, rgba(16,185,129,0.18), transparent 54%),
            conic-gradient(from 0deg, rgba(16,185,129,0), rgba(16,185,129,0.68), rgba(232,192,103,0.22), rgba(16,185,129,0));
          transform: translate(-50%, -50%);
          filter: blur(0.2px) drop-shadow(0 18px 34px rgba(16,185,129,0.14));
          animation: heroLoaderSpin 1.4s linear infinite;
        }

        .hero-astronaut-loader::after {
          content: '';
          position: absolute;
          inset: 13px;
          border-radius: inherit;
          background: rgba(245,239,228,0.92);
          box-shadow: inset 0 0 28px rgba(16,185,129,0.12);
        }

        .hero-mobile-astronaut-wrap {
          width: min(320px, 82vw);
          aspect-ratio: 1;
          border-radius: 999px;
          background:
            radial-gradient(circle at 50% 58%, rgba(16,185,129,0.18), transparent 56%),
            radial-gradient(circle at 50% 48%, rgba(255,255,255,0.34), transparent 70%);
          filter: drop-shadow(0 26px 54px rgba(5,150,105,0.18));
          transform: translateZ(0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }

        .hero-mobile-astronaut {
          display: block;
          width: min(300px, 78vw);
          height: auto;
          max-height: 310px;
          object-fit: contain;
          filter:
            drop-shadow(0 18px 28px rgba(7,26,61,0.18))
            drop-shadow(0 0 30px rgba(16,185,129,0.16));
          transform: translateZ(0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }

        @keyframes heroFloat {
          0% {
            transform: translateY(0px) rotate(-4deg);
          }

          50% {
            transform: translateY(-20px) rotate(4deg);
          }

          100% {
            transform: translateY(0px) rotate(-4deg);
          }
        }

        @keyframes heroLoaderSpin {
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @media (max-width: 1023px) {
          .hero-title {
            line-height: 0.96;
            letter-spacing: 0;
          }

          .hero-glow {
            width: 260px;
            height: 260px;
            filter: blur(72px);
            opacity: 0.34;
          }
        }

        /* ============================================================
           Mobile / iOS / Touch — performance budget rules
           Reduces GPU composite cost on low-power devices
        ============================================================ */
        @media (max-width: 1023px), (pointer: coarse) {
          /* Stop heavy mesh-gradient animation and reduce its blur radius */
          .mesh-gradient {
            animation: none !important;
            filter: blur(60px) !important;
          }

          /* Reduce glass backdrop-filter blur: 34px → 14px */
          .glass {
            backdrop-filter: blur(14px) !important;
            -webkit-backdrop-filter: blur(14px) !important;
          }

          .darkGlass {
            backdrop-filter: blur(14px) !important;
            -webkit-backdrop-filter: blur(14px) !important;
          }

          /* Suppress heroFloat on mobile – card is already heavy */
          .hero-mobile-astronaut,
          .hero-mobile-astronaut-wrap {
            animation: none !important;
            transition: none !important;
          }
        }

        /* Respect system "reduce motion" preference (iOS Accessibility) */
        @media (prefers-reduced-motion: reduce) {
          .mesh-gradient,
          .orb,
          .hero-astronaut-shell,
          .hero-astronaut-loader,
          .hero-mobile-astronaut,
          .hero-mobile-astronaut-wrap,
          .logo-track {
            animation: none !important;
            transition: none !important;
          }
        }

        .logo-marquee {
          overflow: hidden;
          position: relative;
          width: 100%;
          display: flex;
          direction: ltr;
          /* Safari < 15.4 requires the -webkit- prefix for mask-image */
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }

        .logo-track {
          display: flex;
          width: max-content;
          min-width: max-content;
          animation: marqueeMove 36s linear infinite;
          will-change: transform;
        }

        .logo-group {
          display: flex;
          flex-shrink: 0;
          gap: 22px;
          padding-inline-end: 22px;
        }

        @keyframes marqueeMove {
          from {
            transform: translate3d(0, 0, 0);
          }

          to {
            transform: translate3d(-50%, 0, 0);
          }
        }

        .university-logo-card {
          width: 178px;
          height: 92px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px 24px;
          flex-shrink: 0;
        }

        .university-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: saturate(0.95);
        }

        @media (max-width: 640px) {
          .logo-group {
            gap: 14px;
            padding-inline-end: 14px;
          }

          .logo-track {
            animation-duration: 30s;
          }

          .university-logo-card {
            width: 138px;
            height: 74px;
            border-radius: 20px;
            padding: 14px 18px;
          }
        }

        .carousel-wrapper {
          perspective: 1800px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .carousel {
          width: 100%;
          height: 620px;
          position: relative;
          transform-style: preserve-3d;
          will-change: transform;
          transition: transform 0.008s linear;
          user-select: none;
          -webkit-user-select: none;
        }

        .card3d {
          position: absolute;
          user-select: none;
          -webkit-user-select: none;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          top: 50%;
          left: 50%;
          width: 250px;
          height: 460px;
          border-radius: 40px;
          overflow: hidden;
          transition:
            transform 0.45s ease,
            scale 0.45s ease,
            box-shadow 0.45s ease;
          cursor: pointer;
        }

        .card3d:hover {
          scale: 1.12;
          box-shadow:
            0 14px 42px rgba(0,0,0,0.14),
            0 0 24px rgba(255,255,255,0.08);
        }

        .section-title {
          line-height: 1;
          letter-spacing: 0;
        }

        .step-card {
          transition: all 0.45s ease;
        }

        .step-card:hover {
          transform: scale(1.03);
          box-shadow:
            0 18px 50px rgba(0,0,0,0.12),
            0 0 24px rgba(255,255,255,0.06);
        }

        .map-frame {
          width: 100%;
          height: 420px;
          border: 0;
          border-radius: 32px;
        }

        .map-card {
          position: relative;
          width: 100%;
          height: 420px;
          border-radius: 32px;
          overflow: hidden;
          background:
            linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.18)),
            url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1600&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .map-overlay {
          position: absolute;
          inset: 0;
          backdrop-filter: blur(2px);
          background: rgba(255,255,255,0.08);
        }

        .pricing-card {
          position: relative;
          overflow: hidden;
          transition:
            transform 0.45s ease,
            box-shadow 0.45s ease,
            border 0.45s ease;
        }

        .pricing-card:hover {
          transform: scale(1.035);
          box-shadow:
            0 22px 60px rgba(0,0,0,0.14),
            0 0 30px rgba(255,255,255,0.08);
        }

        .pricing-featured {
          border: 1px solid rgba(255,255,255,0.35);
          box-shadow:
            0 0 60px rgba(255,255,255,0.12),
            0 30px 100px rgba(0,0,0,0.2);
        }

        .pricing-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top, rgba(255,255,255,0.22), transparent 70%);
          opacity: 0.8;
          pointer-events: none;
        }

        .stats-card {
          transition: all 0.45s ease;
        }

        .stats-card:hover {
          transform: scale(1.04);
          box-shadow:
            0 18px 50px rgba(0,0,0,0.12),
            0 0 24px rgba(255,255,255,0.06);
        }

        .testimonial-card {
          transition: all 0.45s ease;
        }

        .testimonial-card:hover {
          transform: scale(1.035);
          box-shadow:
            0 20px 50px rgba(0,0,0,0.12),
            0 0 26px rgba(255,255,255,0.08);
        }

        .faq-item {
          transition: all 0.35s ease;
        }

        .faq-item:hover {
          transform: scale(1.015);
          box-shadow:
            0 18px 40px rgba(0,0,0,0.10),
            0 0 22px rgba(255,255,255,0.05);
        }

        .custom-cursor {
          position: fixed;
          width: 34px;
          height: 34px;
          border-radius: 999px;
          pointer-events: none;
          z-index: 9999;
          left: 0;
          top: 0;
          transform: translate3d(-50%, -50%, 0);
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.28);
          outline: 0.6px solid rgba(198,167,125,0.72);
          box-shadow:
            0 0 6px rgba(255,255,255,0.04),
            inset 0 1px 1px rgba(255,255,255,0.35);
          transition:
            width 0.25s ease,
            height 0.25s ease,
            background 0.25s ease,
            border 0.25s ease;
          mix-blend-mode: screen;
          will-change: transform;
        }

        .custom-cursor::before {
          content: '';
          position: absolute;
          inset: 7px;
          border-radius: 999px;
          background: rgba(255,255,255,0.22);
          filter: blur(0.4px);
        }

        .custom-cursor::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: rgba(198,167,125,0.96);
          border: 0.5px solid rgba(198,167,125,0.72);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow:
            0 0 6px rgba(198,167,125,0.62),
            0 0 12px rgba(198,167,125,0.24);
        }

        .floating-dock {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
        }

        .timeline-network {
          position: relative;
          min-height: 760px;
        }

        .timeline-node {
          position: absolute;
          width: 220px;
          min-height: 120px;
          border-radius: 32px;
          padding: 24px;
          transition: all 0.45s ease;
          overflow: hidden;
        }

        .timeline-node:hover {
          transform: scale(1.04);
          box-shadow: 0 24px 70px rgba(0,0,0,0.14);
        }

        .timeline-node::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          pointer-events: none;
        }

        .timeline-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .timeline-path {
          fill: none;
          stroke-width: 4;
          stroke-linecap: round;
          filter: drop-shadow(0 0 12px rgba(255,120,220,0.45));
        }

        .timeline-connector {
          position: absolute;
          height: 4px;
          border-radius: 999px;
          transform-origin: left center;
          opacity: 0.95;
          box-shadow:
            0 0 12px rgba(255,120,220,0.7),
            0 0 34px rgba(255,120,220,0.35);
        }

        .timeline-connector.dark {
          background:
            linear-gradient(
              to right,
              rgba(255,120,220,0.12),
              rgba(255,120,220,1),
              rgba(140,120,255,0.92)
            );
        }

        .timeline-connector.light {
          background:
            linear-gradient(
              to right,
              rgba(255,170,210,0.18),
              rgba(255,110,190,0.95),
              rgba(255,160,220,0.72)
            );
          box-shadow:
            0 0 10px rgba(255,120,180,0.45),
            0 0 24px rgba(255,150,210,0.2);
        }

        .timeline-dot {
          width: 14px;
          height: 14px;
          border-radius: 999px;
          background: white;
          box-shadow:
            0 0 18px rgba(255,255,255,0.9),
            0 0 42px rgba(120,140,255,0.4);
        }
      `}</style>

      <div className="bg-gradient-layer pointer-events-none">
        {darkMode ? (
          <>
            <div className="mesh-gradient mesh-one" />
            <div className="mesh-gradient mesh-two" />
            <div className="mesh-gradient mesh-three" />
          </>
        ) : (
          <>
            <div className="mesh-gradient light-mesh-one" />
            <div className="mesh-gradient light-mesh-two" />
            <div className="mesh-gradient light-mesh-three" />
          </>
        )}
      </div>

      {isDesktopViewport && (
        <FloatingOrbs floatingObjects={floatingObjects} darkMode={darkMode} />
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 sm:px-6 sm:py-4">
        <div className={`${darkMode ? 'darkGlass' : 'glass'} relative max-w-7xl mx-auto rounded-full px-5 py-3 sm:px-8 sm:py-4 flex items-center justify-between`}>
          <div className="flex items-center">
            <a href="/" aria-label={isFa ? 'بازگشت به صفحه اصلی ACCA EDU' : 'Back to ACCA EDU home'}>
              <img
                src={ACCA_LOGO_SRC}
                alt="ACCA EDU Logo"
                width="160"
                height="48"
                fetchPriority="high"
                className="h-10 w-auto object-contain sm:h-12"
              />
            </a>
          </div>

          <div className="hidden lg:flex items-center gap-5">
            <a
              href="/blog/"
              className={`${darkMode ? 'text-white/80 hover:text-white' : 'text-black/70 hover:text-black'} font-bold transition-all duration-300`}
            >
              <span className="inline-flex items-center gap-2">
                <Newspaper size={17} strokeWidth={2.4} />
                {isFa ? 'بلاگ' : 'Blog'}
              </span>
            </a>

            <div className={`w-px h-7 ${darkMode ? 'bg-white/20 shadow-[0_0_12px_rgba(255,255,255,0.18)]' : 'bg-black/10 shadow-[0_0_12px_rgba(0,0,0,0.08)]'}`} />

            <a
              href="/universities/"
              className={`${darkMode ? 'text-white/80 hover:text-white' : 'text-black/70 hover:text-black'} font-bold transition-all duration-300`}
            >
              <span className="inline-flex items-center gap-2">
                <Building2 size={17} strokeWidth={2.4} />
                {isFa ? 'مشاهده دانشگاه‌ها' : 'View Universities'}
              </span>
            </a>

            <div className={`w-px h-7 ${darkMode ? 'bg-white/20 shadow-[0_0_12px_rgba(255,255,255,0.18)]' : 'bg-black/10 shadow-[0_0_12px_rgba(0,0,0,0.08)]'}`} />

            <a
              href="/istanbul-university-map/"
              className={`${darkMode ? 'text-white/80 hover:text-white' : 'text-black/70 hover:text-black'} font-bold transition-all duration-300`}
            >
              <span className="inline-flex items-center gap-2">
                <MapPin size={17} strokeWidth={2.4} />
                {isFa ? 'نقشه سه بعدی استانبول' : '3D Istanbul Map'}
              </span>
            </a>

            <div className={`w-px h-7 ${darkMode ? 'bg-white/20 shadow-[0_0_12px_rgba(255,255,255,0.18)]' : 'bg-black/10 shadow-[0_0_12px_rgba(0,0,0,0.08)]'}`} />

            <a
              href="/programs/"
              className={`${darkMode ? 'text-white/80 hover:text-white' : 'text-black/70 hover:text-black'} font-bold transition-all duration-300`}
            >
              <span className="inline-flex items-center gap-2">
                <BookOpen size={17} strokeWidth={2.4} />
                {isFa ? 'رشته‌ها و شهریه‌ها' : 'Programs'}
              </span>
            </a>


            <div className={`w-px h-7 ${darkMode ? 'bg-white/20 shadow-[0_0_12px_rgba(255,255,255,0.18)]' : 'bg-black/10 shadow-[0_0_12px_rgba(0,0,0,0.08)]'}`} />

            <a
              href="/scholarships/"
              className={`${darkMode ? 'text-white/80 hover:text-white' : 'text-black/70 hover:text-black'} font-bold transition-all duration-300`}
            >
              <span className="inline-flex items-center gap-2">
                <Award size={17} strokeWidth={2.4} />
                {isFa ? 'لیست بورسیه‌ها' : 'Scholarships'}
              </span>
            </a>            <div className={`w-px h-7 ${darkMode ? 'bg-white/20 shadow-[0_0_12px_rgba(255,255,255,0.18)]' : 'bg-black/10 shadow-[0_0_12px_rgba(0,0,0,0.08)]'}`} />

            <a
              href="https://www.panel-acca.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className={`${darkMode ? 'text-white/80 hover:text-white' : 'text-black/70 hover:text-black'} font-bold transition-all duration-300`}
            >
              <span className="inline-flex items-center gap-2">
                <UserRound size={17} strokeWidth={2.4} />
                {isFa ? 'ورود به پنل کاربری' : 'Client Portal'}
              </span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={isFa ? 'Switch to English' : 'تغییر به فارسی'}
              className={`${darkMode ? 'bg-white text-black' : 'bg-black text-white'} px-5 h-12 rounded-full text-sm font-black transition-all duration-300`}
            >
              {isFa ? 'EN' : 'FA'}
            </button>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? (isFa ? 'حالت روشن' : 'Light mode') : (isFa ? 'حالت تاریک' : 'Dark mode')}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black ${
                darkMode ? 'bg-white text-black' : 'bg-black text-white'
              }`}
            >
              {darkMode ? '☀' : '☾'}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={isFa ? 'باز کردن منو' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              className={`${darkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'} flex h-12 w-12 items-center justify-center rounded-full transition lg:hidden`}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          <div
            className={`${mobileMenuOpen ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-2 scale-95 opacity-0'} ${darkMode ? 'bg-[#111827]/88 text-white border-white/10' : 'bg-white/88 text-black border-white/70'} absolute left-0 right-0 top-[calc(100%+10px)] z-50 rounded-[30px] border p-3 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-3xl transition-all duration-300 lg:hidden`}
          >
            <div className="grid gap-2">
              <a
                href="/blog/"
                onClick={() => setMobileMenuOpen(false)}
                className={`${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'} flex items-center justify-between rounded-[22px] px-5 py-4 text-base font-black transition`}
              >
                <span>{isFa ? 'بلاگ' : 'Blog'}</span>
                <Newspaper size={19} />
              </a>

              <a
                href="/universities/"
                onClick={() => setMobileMenuOpen(false)}
                className={`${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'} flex items-center justify-between rounded-[22px] px-5 py-4 text-base font-black transition`}
              >
                <span>{isFa ? 'مشاهده دانشگاه‌ها' : 'View Universities'}</span>
                <Building2 size={19} />
              </a>

              <a
                href="/istanbul-university-map/"
                onClick={() => setMobileMenuOpen(false)}
                className={`${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'} flex items-center justify-between rounded-[22px] px-5 py-4 text-base font-black transition`}
              >
                <span>{isFa ? 'نقشه سه بعدی استانبول' : '3D Istanbul Map'}</span>
                <MapPin size={19} />
              </a>

              <a
                href="/programs/"
                onClick={() => setMobileMenuOpen(false)}
                className={`${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'} flex items-center justify-between rounded-[22px] px-5 py-4 text-base font-black transition`}
              >
                <span>{isFa ? 'رشته‌ها و شهریه‌ها' : 'Programs'}</span>
                <BookOpen size={19} />
              </a>


              <a
                href="/scholarships/"
                onClick={() => setMobileMenuOpen(false)}
                className={`${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'} flex items-center justify-between rounded-[22px] px-5 py-4 text-base font-black transition`}
              >
                <span>{isFa ? 'لیست بورسیه‌ها' : 'Scholarships'}</span>
                <Award size={19} />
              </a>              <a
                href="https://www.panel-acca.com/login"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className={`${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'} flex items-center justify-between rounded-[22px] px-5 py-4 text-base font-black transition`}
              >
                <span>{isFa ? 'ورود به پنل کاربری' : 'Client Portal'}</span>
                <UserRound size={19} />
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content">
        <HeroSection
          darkMode={darkMode}
          isFa={isFa}
          ACCA_LOGO_SRC={ACCA_LOGO_SRC}
          isDesktopViewport={isDesktopViewport}
          onConsultationClick={() => setConsultationOpen(true)}
        />

        <UniversityMarqueeSection
          darkMode={darkMode}
          isFa={isFa}
        />

        <DeferredHomeSection eager={eagerHomeSections} minHeight={720}>
          <AccaShowcaseSection
            darkMode={darkMode}
            isFa={isFa}
          />
        </DeferredHomeSection>

        <DeferredHomeSection eager={eagerHomeSections} minHeight={880}>
          <SmartScholarshipCalculator
            darkMode={darkMode}
            language={language}
          />
        </DeferredHomeSection>

        <DeferredHomeSection eager={eagerHomeSections} minHeight={520}>
          <StatsSection
            darkMode={darkMode}
            isFa={isFa}
          />
        </DeferredHomeSection>

        <DeferredHomeSection eager={eagerHomeSections} minHeight={760}>
          <RegistrationProcessSection
            darkMode={darkMode}
            isFa={isFa}
            registrationSteps={registrationSteps}
            onConsultationClick={() => setConsultationOpen(true)}
          />
        </DeferredHomeSection>

        <DeferredHomeSection eager={eagerHomeSections} minHeight={760}>
          <GreenScholarshipWidget
            isFa={isFa}
            darkMode={darkMode}
            onConsultationClick={() => setConsultationOpen(true)}
          />
        </DeferredHomeSection>

        <DeferredHomeSection eager={eagerHomeSections} minHeight={720}>
          <FeaturedUniversitiesSection
            darkMode={darkMode}
            isFa={isFa}
            universityCards={universityCards}
          />
        </DeferredHomeSection>

        <DeferredHomeSection eager={eagerHomeSections} minHeight={920}>
          <PopularMajorsSection
            darkMode={darkMode}
            isFa={isFa}
            majors={majors}
          />
        </DeferredHomeSection>

        <DeferredHomeSection eager={eagerHomeSections} minHeight={1120}>
          <PartnerScholarshipSection
            darkMode={darkMode}
            isFa={isFa}
            scholarshipComparison={scholarshipComparison}
          />
        </DeferredHomeSection>

        <DeferredHomeSection eager={eagerHomeSections} minHeight={760}>
          <TestimonialsSection
            darkMode={darkMode}
            isFa={isFa}
          />
        </DeferredHomeSection>

        <DeferredHomeSection eager={eagerHomeSections} minHeight={840}>
          <FaqSection
            darkMode={darkMode}
            isFa={isFa}
          />
        </DeferredHomeSection>

        <DeferredHomeSection eager={eagerHomeSections} minHeight={540}>
          <FinalCtaSection
            darkMode={darkMode}
            isFa={isFa}
            onConsultationClick={() => setConsultationOpen(true)}
          />
        </DeferredHomeSection>

        <DeferredHomeSection eager={eagerHomeSections} minHeight={860}>
          <ContactSection
            darkMode={darkMode}
            isFa={isFa}
            onConsultationClick={() => setConsultationOpen(true)}
          />
        </DeferredHomeSection>
      </main>
      {floatingActions}
      <ConsultationModal
        open={consultationOpen}
        onClose={() => setConsultationOpen(false)}
        darkMode={darkMode}
        isFa={isFa}
      />
      </div>
    </>
  );
}
