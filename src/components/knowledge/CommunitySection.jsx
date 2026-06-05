import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  Globe,
  Languages,
  Loader,
  MessageCircle,
  PenLine,
  Send,
  Star,
} from 'lucide-react';
import StarRating from './StarRating';
import { tt, timeAgo } from './knowledgeUtils';
import { Reveal } from './KnowledgeKit';
import {
  TRANSLATE_LANGS,
  fetchComments,
  fetchRating,
  submitComment,
  submitRating,
  translateText,
} from '../../lib/community';

const ROLES = [
  { value: 'student', fa: 'دانشجو', en: 'Student' },
  { value: 'professional', fa: 'شاغل', en: 'Professional' },
];
const LOCATIONS = [
  { value: 'turkey', fa: 'ترکیه', en: 'Turkey' },
  { value: 'iran', fa: 'ایران', en: 'Iran' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emptyForm = { name: '', email: '', role: '', location: '', body: '' };

function labelFor(list, value, isFa) {
  const found = list.find((item) => item.value === value);
  return found ? tt(found.fa, found.en, isFa) : '';
}

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '؟';
}

/* ------------------------------ Comment item ----------------------------- */

function CommentItem({ comment, darkMode, isFa }) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [translation, setTranslation] = useState(null); // { lang, text }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const isLong = comment.body.length > 160;
  const badge = [labelFor(ROLES, comment.role, isFa), labelFor(LOCATIONS, comment.location, isFa)]
    .filter(Boolean)
    .join(' · ');
  const shown = translation ? translation.text : comment.body;

  const handleTranslate = async (lang) => {
    setMenuOpen(false);
    setError(false);
    if (translation?.lang === lang) {
      setTranslation(null);
      return;
    }
    setBusy(true);
    try {
      const text = await translateText(comment.body, lang);
      setTranslation({ lang, text });
      setExpanded(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`${darkMode ? 'border-white/10' : 'border-black/[0.07]'} border-t py-5 first:border-t-0 first:pt-0`}>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#071A3D] text-[11px] font-black text-[#C6A768]">
          {initials(comment.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black leading-5">{comment.name}</p>
          <p className={`${darkMode ? 'text-white/45' : 'text-neutral-500'} flex flex-wrap items-center gap-x-2 text-[11px] font-bold`}>
            {badge && <span>{badge}</span>}
            {badge && <span className="opacity-40">·</span>}
            <span>{timeAgo(comment.created_at, isFa)}</span>
          </p>
        </div>
      </div>

      <p
        className={`${darkMode ? 'text-white/75' : 'text-neutral-700'} mt-3 text-sm font-semibold leading-7 ${
          !expanded && isLong ? 'line-clamp-2' : ''
        }`}
        dir="auto"
      >
        {shown}
      </p>

      {translation && (
        <p className={`${darkMode ? 'text-white/40' : 'text-neutral-400'} mt-1 text-[11px] font-bold`}>
          {tt('ترجمه‌شده توسط ماشین', 'Machine translated', isFa)}
        </p>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-black">
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-[#C6A768] transition hover:opacity-80"
          >
            {expanded ? tt('بستن', 'Show less', isFa) : tt('نمایش کامل', 'Show full', isFa)}
            <ChevronDown size={14} className={`transition ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={`${darkMode ? 'text-white/55 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'} inline-flex items-center gap-1 transition`}
          >
            {busy ? <Loader size={14} className="animate-spin" /> : <Languages size={14} />}
            {translation ? tt('زبان دیگر', 'Translate', isFa) : tt('ترجمه', 'Translate', isFa)}
            <ChevronDown size={13} className={`transition ${menuOpen ? 'rotate-180' : ''}`} />
          </button>
          {menuOpen && (
            <div className={`${darkMode ? 'border-white/10 bg-[#0a1424]' : 'border-black/10 bg-white'} absolute z-20 mt-1.5 flex gap-1 rounded-xl border p-1 shadow-[0_14px_40px_rgba(7,26,61,0.18)] ltr:left-0 rtl:right-0`}>
              {TRANSLATE_LANGS.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleTranslate(lang.code)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-black transition ${
                    translation?.lang === lang.code
                      ? 'bg-[#C6A768] text-[#071A3D]'
                      : (darkMode ? 'text-white/70 hover:bg-white/10' : 'text-neutral-600 hover:bg-black/[0.05]')
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {translation && (
          <button
            type="button"
            onClick={() => setTranslation(null)}
            className={`${darkMode ? 'text-white/45 hover:text-white/80' : 'text-neutral-400 hover:text-neutral-700'} inline-flex items-center gap-1 transition`}
          >
            <Globe size={13} />
            {tt('متن اصلی', 'Original', isFa)}
          </button>
        )}

        {error && <span className="text-rose-500">{tt('ترجمه ناموفق بود', 'Translation failed', isFa)}</span>}
      </div>
    </div>
  );
}

/* ----------------------------- Main section ------------------------------ */

export default function CommunitySection({ entityType, entitySlug, darkMode, isFa, id = 'community' }) {
  const [rating, setRating] = useState({ avg: 0, count: 0, mine: 0 });
  const [comments, setComments] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [justSent, setJustSent] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchRating(entityType, entitySlug).then((r) => {
      if (alive) setRating(r);
    });
    fetchComments(entityType, entitySlug).then((c) => {
      if (alive) setComments(c);
    });
    return () => {
      alive = false;
    };
  }, [entityType, entitySlug]);

  const handleRate = async (stars) => {
    setRating((prev) => {
      const isNew = prev.mine === 0;
      const count = isNew ? prev.count + 1 : prev.count;
      const sum = prev.avg * prev.count - prev.mine + stars;
      return { mine: stars, count, avg: count ? sum / count : stars };
    });
    await submitRating(entityType, entitySlug, stars);
  };

  const inputClass = `${darkMode ? 'border-white/10 bg-white/[0.04] text-white placeholder:text-white/35' : 'border-black/10 bg-white text-neutral-900 placeholder:text-neutral-400'} w-full rounded-2xl border px-4 py-3 text-sm font-bold outline-none transition focus:border-[#C6A768]/60 focus:ring-4 focus:ring-[#C6A768]/12`;

  const chip = (active) =>
    `rounded-full px-4 py-2 text-xs font-black transition active:scale-95 ${
      active
        ? 'bg-[#071A3D] text-white shadow-[0_8px_22px_rgba(7,26,61,0.22)]'
        : (darkMode ? 'bg-white/[0.06] text-white/65 hover:bg-white/10' : 'bg-black/[0.04] text-neutral-600 hover:bg-black/[0.07]')
    }`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.name.trim()) return setError(tt('نام و نام خانوادگی را وارد کنید.', 'Please enter your name.', isFa));
    if (!EMAIL_RE.test(form.email.trim())) return setError(tt('ایمیل معتبر وارد کنید.', 'Please enter a valid email.', isFa));
    if (!form.role || !form.location) return setError(tt('وضعیت و محل خود را انتخاب کنید.', 'Please pick your status and location.', isFa));
    if (form.body.trim().length < 2) return setError(tt('متن نظر را بنویسید.', 'Please write your comment.', isFa));

    setSubmitting(true);
    try {
      const comment = await submitComment(entityType, entitySlug, form);
      setComments((prev) => [comment, ...prev]);
      setForm(emptyForm);
      setFormOpen(false);
      setJustSent(true);
      setTimeout(() => setJustSent(false), 3500);
    } catch {
      setError(tt('ارسال انجام نشد. دوباره تلاش کنید.', 'Could not submit. Please try again.', isFa));
    } finally {
      setSubmitting(false);
    }
  };

  const avgLabel = useMemo(() => {
    try {
      return new Intl.NumberFormat(isFa ? 'fa-IR' : 'en-US', { maximumFractionDigits: 1 }).format(rating.avg || 0);
    } catch {
      return String(rating.avg || 0);
    }
  }, [rating.avg, isFa]);

  return (
    <Reveal as="section" id={id} className="scroll-mt-28">
      {/* Rating */}
      <div className={`${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/5 bg-white'} rounded-[24px] border p-5 shadow-[0_14px_44px_rgba(7,26,61,0.06)] sm:p-6`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black">
              <Star size={18} className="fill-[#C6A768] text-[#C6A768]" />
              {tt('این مطلب چقدر برایت مفید بود؟', 'How useful was this?', isFa)}
            </h2>
            <p className={`${darkMode ? 'text-white/50' : 'text-neutral-500'} mt-1 text-xs font-bold`}>
              {rating.count > 0
                ? tt(`میانگین ${avgLabel} از ۵ · ${rating.count} رأی`, `${avgLabel} / 5 · ${rating.count} ratings`, isFa)
                : tt('اولین نفری باش که امتیاز می‌دهی', 'Be the first to rate', isFa)}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <StarRating value={rating.mine || rating.avg} onRate={handleRate} darkMode={darkMode} />
            {rating.mine > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-500">
                <Check size={13} /> {tt('امتیاز تو ثبت شد', 'Your rating is saved', isFa)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-black sm:text-2xl">
            <MessageCircle size={20} className="text-[#C6A768]" />
            {tt('نظرها و پرسش‌ها', 'Comments & questions', isFa)}
            <span className={`${darkMode ? 'text-white/40' : 'text-neutral-400'} text-base`}>({comments.length})</span>
          </h2>
          <button
            type="button"
            onClick={() => setFormOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-[#071A3D] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#0a2350] active:scale-95"
          >
            <PenLine size={14} />
            {tt('نوشتن نظر', 'Write', isFa)}
          </button>
        </div>

        {justSent && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-500/12 px-4 py-2.5 text-xs font-black text-emerald-600">
            <Check size={15} /> {tt('نظر شما ثبت شد. ممنون!', 'Thanks — your comment is posted!', isFa)}
          </div>
        )}

        {/* Form */}
        {formOpen && (
          <form
            onSubmit={handleSubmit}
            className={`${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-black/5 bg-[#F7F1E8]/60'} mb-6 grid gap-3 rounded-[24px] border p-5`}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={inputClass}
                placeholder={tt('نام و نام خانوادگی', 'Full name', isFa)}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                autoComplete="name"
              />
              <input
                className={inputClass}
                type="email"
                placeholder={tt('ایمیل (نمایش داده نمی‌شود)', 'Email (never shown)', isFa)}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                autoComplete="email"
                dir="ltr"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`${darkMode ? 'text-white/45' : 'text-neutral-500'} text-[11px] font-black`}>
                {tt('شما:', 'You are:', isFa)}
              </span>
              {ROLES.map((r) => (
                <button key={r.value} type="button" onClick={() => setForm((f) => ({ ...f, role: r.value }))} className={chip(form.role === r.value)}>
                  {tt(r.fa, r.en, isFa)}
                </button>
              ))}
              <span className={`${darkMode ? 'text-white/20' : 'text-black/15'} px-1`}>·</span>
              {LOCATIONS.map((l) => (
                <button key={l.value} type="button" onClick={() => setForm((f) => ({ ...f, location: l.value }))} className={chip(form.location === l.value)}>
                  {tt(l.fa, l.en, isFa)}
                </button>
              ))}
            </div>

            <textarea
              className={`${inputClass} min-h-[96px] resize-y leading-7`}
              placeholder={tt('نظر یا پرسش خود را بنویسید…', 'Write your comment or question…', isFa)}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              dir="auto"
            />

            {error && <p className="text-xs font-black text-rose-500">{error}</p>}

            <div className="flex items-center justify-between gap-3">
              <p className={`${darkMode ? 'text-white/40' : 'text-neutral-400'} text-[11px] font-bold`}>
                {tt('فقط نام، ایمیل و وضعیت شما را می‌خواهیم.', 'We only ask your name, email and status.', isFa)}
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-[#C6A768] px-5 py-3 text-sm font-black text-[#071A3D] transition hover:brightness-105 active:scale-95 disabled:opacity-60"
              >
                {submitting ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                {tt('ثبت نظر', 'Post', isFa)}
              </button>
            </div>
          </form>
        )}

        {/* List */}
        {comments.length === 0 ? (
          <div className={`${darkMode ? 'border-white/12 text-white/55' : 'border-black/10 text-neutral-500'} rounded-[24px] border border-dashed p-8 text-center`}>
            <MessageCircle size={24} className="mx-auto text-[#C6A768]" />
            <p className="mt-2 text-sm font-black">{tt('هنوز نظری ثبت نشده', 'No comments yet', isFa)}</p>
            <p className="mt-1 text-xs font-bold">{tt('اولین نفری باش که تجربه‌اش را می‌نویسد.', 'Be the first to share your experience.', isFa)}</p>
          </div>
        ) : (
          <div className={`${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-black/5 bg-white'} rounded-[24px] border px-5 py-2 shadow-[0_14px_44px_rgba(7,26,61,0.05)] sm:px-6`}>
            {comments.map((comment) => (
              <CommentItem key={comment.client_id} comment={comment} darkMode={darkMode} isFa={isFa} />
            ))}
          </div>
        )}
      </div>
    </Reveal>
  );
}
