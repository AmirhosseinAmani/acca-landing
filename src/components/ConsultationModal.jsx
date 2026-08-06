import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Camera, MessageCircle, Send, ShieldCheck, X } from 'lucide-react';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../constants/supabase';
import {
  createEventId,
  getAttributionSnapshot,
  getTrackingConsent,
  trackLead,
  trackLeadFormStart,
} from '../lib/analytics';

const initialForm = {
  firstName: '', lastName: '', age: '', education: '', gpa: '',
  contactMethod: 'whatsapp', contactValue: '',
  company: '',
};

const FORM_TIMEOUT_MS = 12_000;
const MIN_HUMAN_SUBMIT_MS = 1_200;
const PRIVACY_NOTICE_VERSION = 'consultation-form-notice-v1';
const TRACKED_START_FIELDS = new Set([
  'firstName', 'lastName', 'age', 'education', 'gpa', 'contactValue',
]);

const contactMethods = [
  { id: 'whatsapp', icon: MessageCircle, fa: 'واتساپ', en: 'WhatsApp' },
  { id: 'telegram', icon: Send, fa: 'تلگرام', en: 'Telegram' },
  { id: 'instagram', icon: Camera, fa: 'اینستاگرام', en: 'Instagram' },
];

export default function ConsultationModal({ open, onClose, isFa, context }) {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const openedAtRef = useRef(0);
  const formStartTrackedRef = useRef(false);
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const closeModal = useCallback(() => {
    setShowPrivacy(false);
    setSubmitted(false);
    setError('');
    onCloseRef.current();
  }, []);

  useEffect(() => {
    if (!open) {
      openedAtRef.current = 0;
      return undefined;
    }
    openedAtRef.current = Date.now();
    formStartTrackedRef.current = false;
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const getFocusableElements = () => Array.from(dialogRef.current?.querySelectorAll(
      'button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    ) || []).filter((element) => !element.hasAttribute('hidden'));

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeModal();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const focusTimer = window.setTimeout(() => getFocusableElements()[0]?.focus(), 0);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus({ preventScroll: true });
      }
      previousFocusRef.current = null;
    };
  }, [closeModal, open]);

  const copy = useMemo(() => ({
    title: isFa ? 'رزرو مشاوره رایگان' : 'Book a free consultation',
    desc: isFa ? 'مسیر انتخابی شما همراه درخواست ثبت می‌شود تا مشاور با آمادگی کامل با شما تماس بگیرد.' : 'Your selected context is saved with the request so your advisor can come prepared.',
    selected: isFa ? 'درخواست انتخاب‌شده' : 'Selected request',
    firstName: isFa ? 'نام' : 'First name',
    lastName: isFa ? 'نام خانوادگی' : 'Last name',
    age: isFa ? 'سن' : 'Age',
    education: isFa ? 'آخرین مدرک تحصیلی' : 'Latest education',
    gpa: isFa ? 'معدل' : 'GPA',
    contactTitle: isFa ? 'راه ارتباطی دلخواه' : 'Preferred contact method',
    contactHint: isFa ? 'شماره یا آیدی همین شبکه' : 'Number or username on this channel',
    promise: isFa ? 'مشاوره رایگان است و در کمتر از یک ساعت با شما ارتباط می‌گیریم.' : 'Consultation is free and we will contact you in less than one hour.',
    privacy: isFa ? 'با ارسال فرم، اطلاعات شما فقط برای بررسی درخواست مشاوره و تماس درباره همین درخواست استفاده می‌شود.' : 'By submitting this form, your information will only be used to review your consultation request and contact you about this request.',
    privacyLink: isFa ? 'نحوه استفاده از اطلاعات' : 'How your information is used',
    privacyTitle: isFa ? 'نحوه استفاده از اطلاعات' : 'How your information is used',
    privacyBody: isFa
      ? [
          'ACCA EDU اطلاعاتی را که خودتان در این فرم وارد می‌کنید فقط برای بررسی درخواست، تماس از مسیر انتخابی و ارائه مشاوره آموزشی پردازش می‌کند.',
          'اطلاعات به‌صورت الکترونیکی از همین فرم جمع‌آوری می‌شود. مبنای حقوقی، ضرورت پردازش مستقیم برای اقدام به درخواست مشاوره‌ای است که خودتان آغاز کرده‌اید و برقراری یا اجرای رابطه خدماتی مرتبط، در حدود ماده ۵/۲(c) قانون KVKK است.',
          'اطلاعات فرم در زیرساخت Supabase در منطقه اروپا ذخیره می‌شود و برای اعلان داخلی درخواست به Telegram منتقل می‌شود؛ استفاده از این ارائه‌دهندگان می‌تواند شامل پردازش برون‌مرزی مشمول ماده ۹ KVKK باشد.',
          'رضایت رهگیری تبلیغاتی از این فرم جداست و در تنظیمات حریم خصوصی انتخاب می‌شود. نام، راه تماس، سن، تحصیلات و معدل به Google Tag Manager یا Meta Pixel ارسال نمی‌شود. می‌توانید برای دسترسی، اصلاح یا حذف اطلاعات خود از طریق صفحه تماس با ما درخواست ثبت کنید.',
        ]
      : [
          'ACCA EDU processes the information you enter in this form only to review your request, contact you through your selected channel, and provide education guidance.',
          'The details are collected electronically through this form. The legal basis is processing directly necessary to act on the consultation request you initiated and to establish or perform the related service relationship, within Article 5(2)(c) of Turkey’s KVKK.',
          'Form details are stored in Supabase infrastructure in the EU region and sent to Telegram for internal lead notification; using these providers may involve cross-border processing governed by Article 9 of the KVKK.',
          'Advertising tracking consent is separate from this form and is selected in Privacy Settings. Your name, contact value, age, education, and GPA are not sent to Google Tag Manager or Meta Pixel. You may request access, correction, or deletion through our contact page.',
        ],
    backToForm: isFa ? 'بازگشت به فرم مشاوره' : 'Back to consultation form',
    send: isFa ? 'ارسال درخواست مشاوره' : 'Send consultation request',
    sending: isFa ? 'در حال ارسال…' : 'Sending…',
    close: isFa ? 'بستن' : 'Close',
    success: isFa ? 'درخواست ثبت شد؛ حداکثر تا یک ساعت آینده از مسیر انتخابی با شما تماس می‌گیریم.' : 'Request saved. We will contact you through your chosen channel within one hour.',
    error: isFa ? 'ارسال درخواست انجام نشد. لطفاً چند لحظه دیگر دوباره تلاش کنید.' : 'The request could not be sent. Please try again in a moment.',
    tooFast: isFa ? 'لطفاً یک لحظه صبر کنید و دوباره دکمه ارسال را بزنید.' : 'Please wait a moment, then press send again.',
  }), [isFa]);

  if (!open) return null;

  const updateField = (field, value) => {
    setSubmitted(false);
    setError('');
    setForm((current) => ({ ...current, [field]: value }));

    if (
      !formStartTrackedRef.current &&
      TRACKED_START_FIELDS.has(field) &&
      String(value || '').trim()
    ) {
      formStartTrackedRef.current = true;
      trackLeadFormStart({
        page_type: context?.page || 'home',
        cta_location: context?.source || 'website_cta',
        language: isFa ? 'fa' : 'en',
      });
    }
  };

  const updateContactMethod = (method) => {
    setSubmitted(false);
    setError('');
    setForm((current) => ({
      ...current,
      contactMethod: method,
      contactValue: current.contactMethod === method ? current.contactValue : '',
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // A hidden honeypot plus a minimum interaction time blocks basic form bots
    // without collecting or transmitting their payload. Server-side limits are
    // still required for determined abuse.
    if (form.company) return;
    if (Date.now() - openedAtRef.current < MIN_HUMAN_SUBMIT_MS) {
      setError(copy.tooFast);
      return;
    }

    setSubmitting(true);
    setError('');
    const contactValue = form.contactValue.trim();
    const eventId = createEventId('lead');
    const consent = getTrackingConsent();
    const privacyNoticeShownAt = new Date(openedAtRef.current || Date.now()).toISOString();
    const sourceContext = buildSourceContext({
      context,
      attribution: getAttributionSnapshot(),
      eventId,
      consent,
      language: isFa ? 'fa' : 'en',
      privacyNotice: {
        shown: true,
        version: PRIVACY_NOTICE_VERSION,
        shown_at: privacyNoticeShownAt,
      },
    });
    const leadPayload = {
      first_name: cleanText(form.firstName, 80),
      last_name: cleanText(form.lastName, 80),
      age: form.age ? Number(form.age) : null,
      education: cleanText(form.education, 120),
      gpa: cleanText(form.gpa, 20),
      phone: form.contactMethod === 'whatsapp' ? contactValue : '',
      email: '',
      contact_method: form.contactMethod,
      contact_value: cleanText(contactValue, 120),
      source: 'website',
      source_page: cleanText(context?.page || window.location.pathname, 120),
      source_url: cleanSourceUrl(context?.url || window.location.href),
      source_title: cleanText(context?.title || document.title, 240),
      source_image_url: cleanText(context?.image, 2_000) || null,
      source_context: sourceContext,
      privacy_consent: false,
      privacy_consent_at: null,
      privacy_notice_version: PRIVACY_NOTICE_VERSION,
      privacy_notice_shown_at: privacyNoticeShownAt,
      status: 'new',
    };

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), FORM_TIMEOUT_MS);

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/consultation_leads`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(leadPayload),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(await response.text());
      setForm(initialForm);
      setSubmitted(true);
      trackLead({
        event_id: eventId,
        contact_method: form.contactMethod,
        page_type: context?.page || 'home',
        cta_location: context?.source || 'website_cta',
        language: isFa ? 'fa' : 'en',
      });
    } catch (requestError) {
      console.error(requestError);
      setError(copy.error);
    } finally {
      window.clearTimeout(timeout);
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm font-bold text-black outline-none transition placeholder:text-black/35 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15';
  const selectedMethod = contactMethods.find((method) => method.id === form.contactMethod);

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain" dir={isFa ? 'rtl' : 'ltr'}>
      <button type="button" aria-label={copy.close} className="fixed inset-0 bg-black/55 backdrop-blur-md" onClick={closeModal} />
      <div className="relative z-10 flex min-h-full items-center justify-center p-4 py-7 sm:py-10">
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="consultation-title" className="w-full max-w-2xl rounded-[32px] border border-white/75 bg-[rgba(245,244,242,0.88)] p-5 text-black shadow-[0_30px_120px_rgba(0,0,0,0.32)] backdrop-blur-[30px] sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-700">ACCA CONSULTATION</div>
              <h2 id="consultation-title" className="text-2xl font-black sm:text-3xl">{copy.title}</h2>
              <p className="mt-2 text-sm font-medium leading-6 opacity-65">{copy.desc}</p>
            </div>
            <button type="button" onClick={closeModal} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/5" aria-label={copy.close}><X size={20} /></button>
          </div>

          {!showPrivacy && context?.title && (
            <div className="mb-5 flex items-center gap-4 rounded-2xl border border-black/10 bg-white/40 p-3">
              {context.image && <img src={context.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />}
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.15em] opacity-45">{copy.selected}</div>
                <div className="mt-1 text-sm font-black leading-6">{context.title}</div>
                {context.subtitle && <div className="mt-0.5 truncate text-xs font-bold opacity-55">{context.subtitle}</div>}
              </div>
            </div>
          )}

          {showPrivacy ? (
            <section aria-labelledby="privacy-panel-title" className="rounded-3xl border border-black/10 bg-white/55 p-5 sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <ShieldCheck className="shrink-0 text-emerald-600" size={26} />
                <h3 id="privacy-panel-title" className="text-xl font-black sm:text-2xl">{copy.privacyTitle}</h3>
              </div>
              <div className="space-y-4 text-sm font-medium leading-7 opacity-75">
                {copy.privacyBody.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacy(false)}
                className="mt-7 w-full rounded-2xl bg-black px-6 py-4 text-sm font-black text-white transition hover:scale-[1.01]"
              >
                {copy.backToForm}
              </button>
            </section>
          ) : (
          <form onSubmit={handleSubmit} className="relative grid grid-cols-2 gap-3 sm:gap-4">
            <div className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0" aria-hidden="true">
              <label>
                Company
                <input
                  name="company"
                  tabIndex="-1"
                  autoComplete="off"
                  value={form.company}
                  onChange={(event) => updateField('company', event.target.value)}
                />
              </label>
            </div>
            <Field label={copy.firstName}><input required maxLength="80" autoComplete="given-name" className={inputClass} value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} /></Field>
            <Field label={copy.lastName}><input required maxLength="80" autoComplete="family-name" className={inputClass} value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} /></Field>
            <Field label={copy.age}><input required min="12" max="80" type="number" inputMode="numeric" className={inputClass} value={form.age} onChange={(e) => updateField('age', e.target.value)} /></Field>
            <Field label={copy.education}><input required maxLength="120" className={inputClass} value={form.education} onChange={(e) => updateField('education', e.target.value)} /></Field>
            <Field label={copy.gpa} className="col-span-2 sm:col-span-1"><input required maxLength="20" inputMode="decimal" className={inputClass} value={form.gpa} onChange={(e) => updateField('gpa', e.target.value)} /></Field>

            <div className="col-span-2">
              <div className="mb-2 text-sm font-black opacity-70">{copy.contactTitle}</div>
              <div className="grid grid-cols-3 gap-2">
                {contactMethods.map(({ id, icon: Icon, fa, en }) => {
                  const active = form.contactMethod === id;
                  return <button key={id} type="button" aria-pressed={active} onClick={() => updateContactMethod(id)} className={`${active ? 'border-emerald-500 bg-emerald-500/12 text-emerald-600' : 'border-black/10 bg-white/70'} flex items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-xs font-black transition`}><Icon size={18} /><span>{isFa ? fa : en}</span></button>;
                })}
              </div>
            </div>

            <Field label={`${copy.contactHint} (${isFa ? selectedMethod?.fa : selectedMethod?.en})`} className="col-span-2">
              <input required minLength="3" maxLength="120" pattern={form.contactMethod === 'whatsapp' ? '[+0-9()\\s-]{7,25}' : '@?[A-Za-z0-9._-]{3,120}'} dir="ltr" autoComplete={form.contactMethod === 'whatsapp' ? 'tel' : 'off'} inputMode={form.contactMethod === 'whatsapp' ? 'tel' : 'text'} placeholder={form.contactMethod === 'whatsapp' ? '+90 5xx xxx xx xx' : '@username'} className={`${inputClass} text-left`} value={form.contactValue} onChange={(e) => updateField('contactValue', e.target.value)} />
            </Field>

            <div className="col-span-2 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-bold leading-6 text-emerald-700"><ShieldCheck size={22} className="mt-0.5 shrink-0" /><span>{copy.promise}</span></div>
            <div className="col-span-2 flex items-start gap-3 text-xs font-bold leading-6 opacity-75">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>
                {copy.privacy}{' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacy(true)}
                  className="font-black text-emerald-600 underline underline-offset-4"
                >
                  {copy.privacyLink}
                </button>
              </span>
            </div>
            {submitted && <div role="status" aria-live="polite" className="col-span-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 text-sm font-black text-emerald-600">{copy.success}</div>}
            {error && <div role="alert" className="col-span-2 rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-4 text-sm font-black text-red-500">{error}</div>}
            <button type="submit" disabled={submitting} className="col-span-2 rounded-2xl bg-black px-8 py-4 text-base font-black text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40">{submitting ? copy.sending : copy.send}</button>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return <label className={`${className} block`}><span className="mb-2 block text-sm font-black opacity-70">{label}</span>{children}</label>;
}

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function cleanSourceUrl(value) {
  try {
    const url = new URL(String(value || ''), window.location.origin);
    if (!/^https?:$/.test(url.protocol)) return '';
    url.search = '';
    url.hash = '';
    return cleanText(url.toString(), 2_000);
  } catch {
    return '';
  }
}

function pickContextRecord(record, keys) {
  if (!record || typeof record !== 'object') return null;
  const picked = {};
  keys.forEach((key) => {
    const value = record[key];
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      picked[key] = typeof value === 'string' ? cleanText(value, 240) : value;
    }
  });
  return Object.keys(picked).length ? picked : null;
}

function buildSourceContext({ context, attribution, eventId, consent, language, privacyNotice }) {
  const safeContext = {
    source: cleanText(context?.source || 'website_cta', 120),
    page: cleanText(context?.page || 'home', 120),
    title: cleanText(context?.title, 240) || null,
    subtitle: cleanText(context?.subtitle, 300) || null,
    program: pickContextRecord(context?.program, [
      'id', 'name', 'program', 'university', 'city', 'degree', 'language',
    ]),
    university: pickContextRecord(context?.university, ['id', 'name', 'slug', 'city']),
    scholarship: pickContextRecord(context?.scholarship, [
      'id', 'program', 'university', 'degree', 'language', 'priceAmount', 'currency',
    ]),
  };

  return {
    ...safeContext,
    attribution,
    event_id: eventId,
    language,
    privacy_notice: privacyNotice,
    tracking_consent: {
      analytics: Boolean(consent?.analytics),
      marketing: Boolean(consent?.marketing),
      version: consent?.version || null,
      updated_at: consent?.updatedAt || null,
    },
  };
}
