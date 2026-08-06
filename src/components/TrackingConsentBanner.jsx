import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getTrackingConsent,
  setTrackingConsent,
  TRACKING_CONSENT_EVENT,
} from '../lib/analytics';

const LANGUAGE_STORAGE_KEY = 'acca:language';

const COPY = {
  fa: {
    accept: 'قبول',
    acceptAll: 'همه کوکی‌ها',
    analytics: 'فقط آمار سایت',
    analyticsDetail: 'Google Tag Manager برای سنجش عملکرد سایت',
    current: 'انتخاب فعلی',
    details: 'تنظیمات جزئی',
    essential: 'فقط ضروری',
    essentialDetail: 'بدون ابزارهای آمار و تبلیغات',
    hideDetails: 'بستن تنظیمات',
    marketingDetail: 'Meta Pixel برای سنجش تبلیغات و ریتارگتینگ',
    policy: 'سیاست حریم خصوصی',
    reject: 'رد',
    reopen: 'تنظیمات حریم خصوصی',
    text: 'برای سنجش عملکرد سایت و نمایش تبلیغات مرتبط از کوکی‌ها استفاده می‌کنیم.',
    title: 'تنظیمات کوکی',
  },
  en: {
    accept: 'Accept',
    acceptAll: 'All cookies',
    analytics: 'Analytics only',
    analyticsDetail: 'Google Tag Manager for site performance measurement',
    current: 'Current choice',
    details: 'Detailed settings',
    essential: 'Essential only',
    essentialDetail: 'No analytics or advertising tools',
    hideDetails: 'Close settings',
    marketingDetail: 'Meta Pixel for ad measurement and retargeting',
    policy: 'Privacy Policy',
    reject: 'Reject',
    reopen: 'Privacy settings',
    text: 'We use cookies to measure site performance and show relevant advertising.',
    title: 'Cookie settings',
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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState(readLanguage);
  const detailsButtonRef = useRef(null);
  const focusOnOpenRef = useRef(false);
  const reopenButtonRef = useRef(null);
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

  useEffect(() => {
    if (!isOpen || !focusOnOpenRef.current) return undefined;
    const frame = window.requestAnimationFrame(() => detailsButtonRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  const currentChoice = useMemo(() => {
    if (!consent) return '';
    if (consent.analytics && consent.marketing) return copy.acceptAll;
    if (consent.analytics) return copy.analytics;
    return copy.essential;
  }, [consent, copy]);

  const choose = (analytics, marketing) => {
    focusOnOpenRef.current = false;
    const nextConsent = setTrackingConsent({ analytics, marketing });
    setConsent(nextConsent);
    setIsDetailsOpen(false);
    setIsOpen(false);
    window.requestAnimationFrame(() => reopenButtonRef.current?.focus());
  };

  const reopenPreferences = () => {
    focusOnOpenRef.current = true;
    setIsDetailsOpen(true);
    setIsOpen(true);
  };

  if (!isOpen) {
    return (
      <button
        ref={reopenButtonRef}
        type="button"
        onClick={reopenPreferences}
        className="fixed bottom-20 left-4 z-[70] rounded-full border border-white/20 bg-[#071A3D] px-3 py-2 text-xs font-black text-white shadow-xl transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
      aria-describedby="tracking-consent-description"
      dir={isFa ? 'rtl' : 'ltr'}
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-5xl rounded-2xl border border-white/15 bg-[#071A3D]/[0.96] p-3 text-white shadow-[0_16px_48px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:inset-x-6 sm:bottom-5 sm:p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 id="tracking-consent-title" className="sr-only">{copy.title}</h2>
          <p id="tracking-consent-description" className="text-sm font-bold leading-6 text-white/90">
            {copy.text}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold">
            <button
              ref={detailsButtonRef}
              type="button"
              onClick={() => setIsDetailsOpen((open) => !open)}
              className="text-emerald-300 underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              aria-expanded={isDetailsOpen}
              aria-controls="tracking-consent-details"
            >
              {isDetailsOpen ? copy.hideDetails : copy.details}
            </button>
            <a className="text-emerald-300 underline underline-offset-4" href="/privacy/">
              {copy.policy}
            </a>
            {currentChoice ? (
              <span className="text-white/50">{copy.current}: {currentChoice}</span>
            ) : null}
          </div>
        </div>

        <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:w-auto sm:min-w-[220px]">
          <button
            type="button"
            onClick={() => choose(true, true)}
            className="rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-black text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            {copy.accept}
          </button>
          <button
            type="button"
            onClick={() => choose(false, false)}
            title={copy.essentialDetail}
            className="rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-black text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            {copy.reject}
          </button>
        </div>
      </div>

      {isDetailsOpen ? (
        <div
          id="tracking-consent-details"
          className="mt-3 flex flex-col gap-3 border-t border-white/15 pt-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="grid gap-1 text-xs font-bold text-white/65 sm:grid-cols-2 sm:gap-x-6">
            <span>{copy.analyticsDetail}</span>
            <span>{copy.marketingDetail}</span>
          </div>
          <button
            type="button"
            onClick={() => choose(true, false)}
            className="shrink-0 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            {copy.analytics}
          </button>
        </div>
      ) : null}
    </section>
  );
}
