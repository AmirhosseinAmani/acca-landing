import { useEffect, useState } from 'react';
import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
} from '../constants/supabase';
import { trackLead } from '../lib/analytics';

const initialForm = {
  firstName: '',
  lastName: '',
  age: '',
  education: '',
  gpa: '',
  phone: '',
  email: '',
};

export default function ConsultationModal({ open, onClose, darkMode, isFa }) {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  const copy = {
    title: isFa ? 'رزرو مشاوره' : 'Book Consultation',
    desc: isFa
      ? 'اطلاعات اولیه را وارد کنید تا تیم ACCA برای بررسی مسیر تحصیلی با شما تماس بگیرد.'
      : 'Share your basic details so the ACCA team can review your academic path.',
    firstName: isFa ? 'نام' : 'First name',
    lastName: isFa ? 'نام خانوادگی' : 'Last name',
    age: isFa ? 'سن' : 'Age',
    education: isFa ? 'آخرین مدرک تحصیلی' : 'Latest education',
    gpa: isFa ? 'معدل' : 'GPA',
    phone: isFa ? 'شماره تماس' : 'Phone number',
    email: isFa ? 'ایمیل' : 'Email',
    send: isFa ? 'ارسال درخواست' : 'Send Request',
    sending: isFa ? 'در حال ارسال...' : 'Sending...',
    close: isFa ? 'بستن' : 'Close',
    success: isFa
      ? 'درخواست شما ثبت شد. تیم ACCA به زودی با شما تماس می‌گیرد.'
      : 'Your request has been saved. ACCA will contact you soon.',
    error: isFa
      ? 'ارسال درخواست انجام نشد. لطفاً چند لحظه دیگر دوباره تلاش کنید.'
      : 'The request could not be sent. Please try again in a moment.',
  };

  const updateField = (field, value) => {
    setSubmitted(false);
    setError('');
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const leadPayload = {
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      age: form.age ? Number(form.age) : null,
      education: form.education.trim(),
      gpa: form.gpa.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      source: 'website',
      status: 'new',
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/consultation_leads`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(leadPayload),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setForm(initialForm);
      setSubmitted(true);
      // Lead captured — fire the conversion (GTM dataLayer + Google Ads gtag).
      trackLead({ method: 'consultation_form' });
    } catch (requestError) {
      console.error(requestError);
      setError(copy.error);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `${darkMode ? 'bg-white/8 border-white/10 text-white placeholder:text-white/35' : 'bg-white/75 border-black/10 text-black placeholder:text-black/35'} w-full rounded-[18px] border px-4 py-3 text-sm font-bold outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15 sm:rounded-[20px] sm:px-5 sm:py-4`;

  return (
    /*
     * Outer: overflow-y-auto so the modal scrolls when the card is taller
     * than the viewport (common on small phones with 7 form fields).
     * overscroll-contain stops the page behind from scrolling.
     */
    <div
      className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain"
      dir={isFa ? 'rtl' : 'ltr'}
    >
      {/* Backdrop — fixed so it covers the viewport regardless of scroll position */}
      <button
        type="button"
        aria-label={copy.close}
        className="fixed inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Centre card vertically when there's room; scroll when there isn't */}
      <div className="relative z-10 flex min-h-full items-center justify-center p-4 py-6 sm:py-10">
        <div
          className={`${darkMode ? 'darkGlass text-white' : 'glass text-black'} w-full max-w-3xl rounded-[32px] border p-5 shadow-[0_30px_120px_rgba(0,0,0,0.28)] sm:rounded-[36px] sm:p-7`}
        >
          <div className="mb-4 flex items-start justify-between gap-4 sm:mb-6 sm:gap-5">
            <div>
              <div
                className={`${darkMode ? 'text-emerald-300' : 'text-emerald-700'} mb-2 text-xs font-black uppercase tracking-[0.28em] sm:mb-3`}
              >
                ACCA CONSULTATION
              </div>
              <h2 className="text-2xl font-black leading-tight sm:text-4xl">
                {copy.title}
              </h2>
              <p
                className={`${darkMode ? 'text-white/65' : 'text-black/60'} mt-2 max-w-xl text-sm font-medium leading-6 sm:mt-3 sm:leading-7`}
              >
                {copy.desc}
              </p>
            </div>

            {/* Close button — always visible at the top-right of the card */}
            <button
              type="button"
              onClick={onClose}
              className={`${darkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-black/5 text-black hover:bg-black/10'} flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl font-black transition`}
              aria-label={copy.close}
            >
              ×
            </button>
          </div>

        <form onSubmit={handleSubmit} className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <Field label={copy.firstName}>
            <input
              required
              autoComplete="given-name"
              className={inputClass}
              value={form.firstName}
              onChange={(event) => updateField('firstName', event.target.value)}
            />
          </Field>

          <Field label={copy.lastName}>
            <input
              required
              autoComplete="family-name"
              className={inputClass}
              value={form.lastName}
              onChange={(event) => updateField('lastName', event.target.value)}
            />
          </Field>

          <Field label={copy.age}>
            <input
              required
              min="12"
              max="80"
              type="number"
              autoComplete="off"
              inputMode="numeric"
              className={inputClass}
              value={form.age}
              onChange={(event) => updateField('age', event.target.value)}
            />
          </Field>

          <Field label={copy.education}>
            <input
              required
              autoComplete="off"
              className={inputClass}
              value={form.education}
              onChange={(event) => updateField('education', event.target.value)}
            />
          </Field>

          <Field label={copy.gpa}>
            <input
              required
              autoComplete="off"
              inputMode="decimal"
              className={inputClass}
              value={form.gpa}
              onChange={(event) => updateField('gpa', event.target.value)}
            />
          </Field>

          <Field label={copy.phone}>
            <input
              required
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              className={inputClass}
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
            />
          </Field>

          <Field label={copy.email} className="sm:col-span-2">
            <input
              required
              type="email"
              autoComplete="email"
              inputMode="email"
              className={inputClass}
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </Field>

          {submitted && (
            <div className="rounded-[20px] border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 text-sm font-black text-emerald-500 sm:col-span-2">
              {copy.success}
            </div>
          )}

          {error && (
            <div className="rounded-[20px] border border-red-400/30 bg-red-400/10 px-5 py-4 text-sm font-black text-red-500 sm:col-span-2">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:col-span-2 sm:flex-row">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-[22px] bg-black px-8 py-3 text-base font-black text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-55 sm:py-4"
            >
              {submitting ? copy.sending : copy.send}
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`${darkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'} rounded-[22px] px-8 py-3 text-base font-black transition hover:scale-[1.01] sm:w-40 sm:py-4`}
            >
              {copy.close}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`${className} block`}>
      <span className="mb-2 block text-sm font-black opacity-70">{label}</span>
      {children}
    </label>
  );
}
