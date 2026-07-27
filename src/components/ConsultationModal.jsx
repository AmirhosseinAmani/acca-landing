import { useEffect, useMemo, useState } from 'react';
import { Camera, MessageCircle, Send, ShieldCheck, X } from 'lucide-react';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../constants/supabase';

const initialForm = {
  firstName: '', lastName: '', age: '', education: '', gpa: '',
  contactMethod: 'whatsapp', contactValue: '', privacyAccepted: false,
};

const contactMethods = [
  { id: 'whatsapp', icon: MessageCircle, fa: 'واتساپ', en: 'WhatsApp' },
  { id: 'telegram', icon: Send, fa: 'تلگرام', en: 'Telegram' },
  { id: 'instagram', icon: Camera, fa: 'اینستاگرام', en: 'Instagram' },
];

export default function ConsultationModal({ open, onClose, darkMode, isFa, context }) {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => event.key === 'Escape' && onClose();
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

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
    privacy: isFa ? 'با ثبت این درخواست، پردازش اطلاعاتم برای پاسخ‌گویی به مشاوره را طبق قانون KVKK و سیاست حریم خصوصی می‌پذیرم.' : 'I consent to processing my details for this consultation under KVKK and the Privacy Policy.',
    privacyLink: isFa ? 'مطالعه سیاست حریم خصوصی' : 'Read the Privacy Policy',
    send: isFa ? 'ارسال درخواست مشاوره' : 'Send consultation request',
    sending: isFa ? 'در حال ارسال…' : 'Sending…',
    close: isFa ? 'بستن' : 'Close',
    success: isFa ? 'درخواست ثبت شد؛ حداکثر تا یک ساعت آینده از مسیر انتخابی با شما تماس می‌گیریم.' : 'Request saved. We will contact you through your chosen channel within one hour.',
    error: isFa ? 'ارسال درخواست انجام نشد. لطفاً چند لحظه دیگر دوباره تلاش کنید.' : 'The request could not be sent. Please try again in a moment.',
  }), [isFa]);

  if (!open) return null;

  const updateField = (field, value) => {
    setSubmitted(false);
    setError('');
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const contactValue = form.contactValue.trim();
    const leadPayload = {
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      age: form.age ? Number(form.age) : null,
      education: form.education.trim(),
      gpa: form.gpa.trim(),
      phone: form.contactMethod === 'whatsapp' ? contactValue : '',
      email: '',
      contact_method: form.contactMethod,
      contact_value: contactValue,
      source: 'website',
      source_page: context?.page || window.location.pathname,
      source_url: context?.url || window.location.href,
      source_title: context?.title || document.title,
      source_image_url: context?.image || null,
      source_context: context || {},
      privacy_consent: form.privacyAccepted,
      privacy_consent_at: new Date().toISOString(),
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
      if (!response.ok) throw new Error(await response.text());
      setForm(initialForm);
      setSubmitted(true);
    } catch (requestError) {
      console.error(requestError);
      setError(copy.error);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `${darkMode ? 'bg-white/8 border-white/10 text-white placeholder:text-white/35' : 'bg-white/80 border-black/10 text-black placeholder:text-black/35'} w-full rounded-2xl border px-4 py-3 text-sm font-bold outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15`;
  const selectedMethod = contactMethods.find((method) => method.id === form.contactMethod);

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain" dir={isFa ? 'rtl' : 'ltr'}>
      <button type="button" aria-label={copy.close} className="fixed inset-0 bg-black/55 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 flex min-h-full items-center justify-center p-4 py-7 sm:py-10">
        <div role="dialog" aria-modal="true" aria-labelledby="consultation-title" className={`${darkMode ? 'darkGlass text-white' : 'glass text-black'} w-full max-w-2xl rounded-[32px] border p-5 shadow-[0_30px_120px_rgba(0,0,0,0.32)] sm:p-7`}>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className={`${darkMode ? 'text-emerald-300' : 'text-emerald-700'} mb-2 text-xs font-black uppercase tracking-[0.2em]`}>ACCA CONSULTATION</div>
              <h2 id="consultation-title" className="text-2xl font-black sm:text-3xl">{copy.title}</h2>
              <p className="mt-2 text-sm font-medium leading-6 opacity-65">{copy.desc}</p>
            </div>
            <button type="button" onClick={onClose} className={`${darkMode ? 'bg-white/10' : 'bg-black/5'} flex h-11 w-11 shrink-0 items-center justify-center rounded-full`} aria-label={copy.close}><X size={20} /></button>
          </div>

          {context?.title && (
            <div className={`${darkMode ? 'border-white/10 bg-white/[0.06]' : 'border-black/10 bg-black/[0.035]'} mb-5 flex items-center gap-4 rounded-2xl border p-3`}>
              {context.image && <img src={context.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />}
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.15em] opacity-45">{copy.selected}</div>
                <div className="mt-1 text-sm font-black leading-6">{context.title}</div>
                {context.subtitle && <div className="mt-0.5 truncate text-xs font-bold opacity-55">{context.subtitle}</div>}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 sm:gap-4">
            <Field label={copy.firstName}><input required autoComplete="given-name" className={inputClass} value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} /></Field>
            <Field label={copy.lastName}><input required autoComplete="family-name" className={inputClass} value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} /></Field>
            <Field label={copy.age}><input required min="12" max="80" type="number" inputMode="numeric" className={inputClass} value={form.age} onChange={(e) => updateField('age', e.target.value)} /></Field>
            <Field label={copy.education}><input required className={inputClass} value={form.education} onChange={(e) => updateField('education', e.target.value)} /></Field>
            <Field label={copy.gpa} className="col-span-2 sm:col-span-1"><input required inputMode="decimal" className={inputClass} value={form.gpa} onChange={(e) => updateField('gpa', e.target.value)} /></Field>

            <div className="col-span-2">
              <div className="mb-2 text-sm font-black opacity-70">{copy.contactTitle}</div>
              <div className="grid grid-cols-3 gap-2">
                {contactMethods.map(({ id, icon: Icon, fa, en }) => {
                  const active = form.contactMethod === id;
                  return <button key={id} type="button" aria-pressed={active} onClick={() => updateField('contactMethod', id)} className={`${active ? 'border-emerald-500 bg-emerald-500/12 text-emerald-600' : darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-white/60'} flex items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-xs font-black transition`}><Icon size={18} /><span>{isFa ? fa : en}</span></button>;
                })}
              </div>
            </div>

            <Field label={`${copy.contactHint} (${isFa ? selectedMethod?.fa : selectedMethod?.en})`} className="col-span-2">
              <input required dir="ltr" autoComplete={form.contactMethod === 'whatsapp' ? 'tel' : 'off'} inputMode={form.contactMethod === 'whatsapp' ? 'tel' : 'text'} placeholder={form.contactMethod === 'whatsapp' ? '+90 5xx xxx xx xx' : '@username'} className={`${inputClass} text-left`} value={form.contactValue} onChange={(e) => updateField('contactValue', e.target.value)} />
            </Field>

            <div className="col-span-2 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-bold leading-6 text-emerald-700 dark:text-emerald-300"><ShieldCheck size={22} className="mt-0.5 shrink-0" /><span>{copy.promise}</span></div>
            <label className="col-span-2 flex cursor-pointer items-start gap-3 text-xs font-bold leading-6 opacity-75">
              <input required type="checkbox" checked={form.privacyAccepted} onChange={(e) => updateField('privacyAccepted', e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-emerald-600" />
              <span>{copy.privacy} <a href="/privacy/" target="_blank" rel="noreferrer" className="font-black text-emerald-600 underline underline-offset-4">{copy.privacyLink}</a></span>
            </label>
            {submitted && <div className="col-span-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 text-sm font-black text-emerald-600">{copy.success}</div>}
            {error && <div className="col-span-2 rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-4 text-sm font-black text-red-500">{error}</div>}
            <button type="submit" disabled={submitting || !form.privacyAccepted} className="col-span-2 rounded-2xl bg-black px-8 py-4 text-base font-black text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40">{submitting ? copy.sending : copy.send}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return <label className={`${className} block`}><span className="mb-2 block text-sm font-black opacity-70">{label}</span>{children}</label>;
}
