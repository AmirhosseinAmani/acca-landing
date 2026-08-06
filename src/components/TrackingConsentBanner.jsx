import { useEffect, useMemo, useState } from 'react';
import {
  getTrackingConsent,
  setTrackingConsent,
  TRACKING_CONSENT_EVENT,
} from '../lib/analytics';

const LANGUAGE_STORAGE_KEY = 'acca:language';

const COPY = {
  fa: {
    acceptAll: 'پذیرش همه',
    analytics: 'فقط آمار سایت',
    analyticsDetail: 'Google Tag Manager برای سنجش عملکرد سایت',
    current: 'انتخاب فعلی',
    essential: 'فقط ضروری',
    essentialDetail: 'بدون ابزارهای آمار و تبلیغات',
    marketingDetail: 'Meta Pixel برای سنجش تبلیغات و ریتارگتینگ',
    policy: 'سیاست حریم خصوصی',
    reopen: 'تنظیمات حریم خصوصی',
    text: 'ابزارهای آمار و تبلیغات فقط با انتخاب شما فعال می‌شوند. رضایت بازاریابی از رضایت فرم مشاوره جداست و هر زمان قابل تغییر است.',
    title: 'انتخاب حریم خصوصی',
  },
  en: {
    acceptAll: 'Accept all',
    analytics: 'Analytics only',
    analyticsDetail: 'Google Tag Manager for site performance measurement',
    current: 'Current choice',
    essential: 'Essential only',
    essentialDetail: 'No analytics or advertising tools',
    marketingDetail: 'Meta Pixel for ad measurement and retargeting',
    policy: 'Privacy Policy',
    reopen: 'Privacy settings',
    text: 'Analytics and advertising tools activate only after your choice. Marketing consent is separate from consultation-form consent and can be changed at any time.',
    title: 'Privacy choices',
  },
};

function readLanguage() {
  if (typeof document === 'undefined') return 'fa';
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'fa' || stored === 'en') return stored;
  } catch {
    // Fall back to the document language when storage is unavailable.
  }
  return document.documentElement.lang === 'en' ? 'en' : 'fa';
}

export default function TrackingConsentBanner({ isFa: isFaProp }) {
  const [consent, setConsent] = useState(() => getTrackingConsent());
  const [isOpen, setIsOpen] = useState(() => !getTrackingConsent());
  const [detectedLanguage, setDetectedLanguage] = useState(readLanguage);
  const language = typeof isFaProp === 'boolean'
    ? (isFaProp ? 'fa' : 'en')
    : detectedLanguage;
  const copy = COPY[language];
  const isFa = language === 'fa';

  useEffect(() => {
    const syncLanguage = () => setDetectedLanguage(readLanguage());
    const handleConsentChange = (event) => {
      setConsent(event.detail || null);
      if (!event.detail) setIsOpen(true);
    };
    const observer = typeof isFaProp === 'boolean' ? null : new MutationObserver(syncLanguage);
    observer?.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    if (typeof isFaProp !== 'boolean') window.addEventListener('storage', syncLanguage);
    window.addEventListener(TRACKING_CONSENT_EVENT, handleConsentChange);
    return () => {
      observer?.disconnect();
      window.removeEventListener('storage', syncLanguage);
      window.removeEventListener(TRACKING_CONSENT_EVENT, handleConsentChange);
    };
  }, [isFaProp]);

  const currentChoice = useMemo(() => {
    if (!consent) return '';
    if (consent.analytics && consent.marketing) return copy.acceptAll;
    if (consent.analytics) return copy.analytics;
    return copy.essential;
  }, [consent, copy]);

  const choose = (analytics, marketing) => {
    const nextConsent = setTrackingConsent({ analytics, marketing });
    setConsent(nextConsent);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-4 z-[70] rounded-full border border-white/20 bg-[#071A3D] px-4 py-2 text-xs font-black text-white shadow-2xl transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        aria-label={copy.reopen}
      >
        {copy.reopen}
      </button>
    );
  }

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby="tracking-consent-title"
      dir={isFa ? 'rtl' : 'ltr'}
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-4xl rounded-[28px] border border-white/15 bg-[#071A3D]/[0.98] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:inset-x-6 sm:bottom-6 sm:p-6"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h2 id="tracking-consent-title" className="text-lg font-black sm:text-xl">
            {copy.title}
          </h2>
          <p className="mt-2 text-sm font-medium leading-7 text-white/75">{copy.text}</p>
          <div className="mt-3 grid gap-1 text-xs font-bold text-white/60 sm:grid-cols-2 sm:gap-4">
            <span>{copy.analyticsDetail}</span>
            <span>{copy.marketingDetail}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold">
            <a className="text-emerald-300 underline underline-offset-4" href="/privacy/">
              {copy.policy}
            </a>
            {currentChoice ? (
              <span className="text-white/50">{copy.current}: {currentChoice}</span>
            ) : null}
          </div>
        </div>

        <div className="grid shrink-0 gap-2 sm:grid-cols-3 lg:w-[430px]">
          <button
            type="button"
            onClick={() => choose(true, true)}
            className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-black text-[#071A3D] transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-white"
          >
            {copy.acceptAll}
          </button>
          <button
            type="button"
            onClick={() => choose(true, false)}
            className="rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            {copy.analytics}
          </button>
          <button
            type="button"
            onClick={() => choose(false, false)}
            title={copy.essentialDetail}
            className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white/80 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            {copy.essential}
          </button>
        </div>
      </div>
    </section>
  );
}
