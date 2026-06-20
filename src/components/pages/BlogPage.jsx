import { useEffect, useMemo, useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  ExternalLink,
  FileText,
  LibraryBig,
  Lightbulb,
  MessageCircle,
  Newspaper,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { getGlossaryTermForGlossaryItem, glossaryTerms } from '../../data/knowledgeGlossary';
import { getBlogPostBySlug, knowledgeBlogPosts } from '../../data/knowledgeBlogPosts';
import {
  AuroraBackground,
  BackToTop,
  KnowledgeHeader,
  LeadCta,
  ReadingProgress,
  Reveal,
  TableOfContents,
} from '../knowledge/KnowledgeKit';
import CommunitySection from '../knowledge/CommunitySection';
import { fetchCommunityStats, popularityScore, statKey } from '../../lib/community';
import { formatDate, scrollToId, tt, useActiveId } from '../knowledge/knowledgeUtils';

const GLOSSARY_RETURN_KEY = 'acca:glossary-return';
const GLOSSARY_RESTORE_KEY = 'acca:glossary-restore';

function textFor(post, isFa) {
  return isFa ? post.fa : post.en;
}

function postHref(slug) {
  return `?page=blog&post=${encodeURIComponent(slug)}`;
}

const BLOG_CATEGORY_EN = {
  'کار دانشجویی': 'Student work',
  'اقامت دانشجویی': 'Student residence',
  'قوانین اقامت': 'Residence law',
  'هزینه اقامت': 'Residence costs',
  'خدمات دیجیتال دانشجو': 'Student digital services',
  'ثبت آدرس': 'Address registration',
};

function catLabel(category, isFa) {
  return isFa ? category : (BLOG_CATEGORY_EN[category] || category);
}

function localizedValue(value, isFa) {
  if (!value || typeof value === 'string') return value || '';
  return tt(value.fa || '', value.en || value.fa || '', isFa);
}

function handleBlogImageError(event) {
  if (event.currentTarget.dataset.fallbackApplied) return;
  event.currentTarget.dataset.fallbackApplied = 'true';
  event.currentTarget.src = '/assets/og-cover.jpg';
}

/** Reading time is stored in Persian; render an English equivalent in EN mode. */
function readTimeLabel(readTime, isFa) {
  if (isFa) return readTime;
  const minutes = readTime.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[^\d]/g, '');
  return minutes ? `${minutes} min read` : readTime;
}

function formatCount(value, isFa) {
  return new Intl.NumberFormat(isFa ? 'fa-IR' : 'en-US').format(Number(value) || 0);
}

function formatAvg(value, isFa) {
  try {
    return new Intl.NumberFormat(isFa ? 'fa-IR' : 'en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(Number(value) || 0);
  } catch {
    return String(Number(value) || 0);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function storeGlossaryReturn(term, label) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(GLOSSARY_RETURN_KEY, JSON.stringify({
      url: window.location.href,
      scrollY: window.scrollY,
      label,
      termSlug: term.slug,
      termTitle: term.title.fa,
      savedAt: Date.now(),
    }));
  } catch {
    // Scroll memory is a progressive enhancement; navigation still works without it.
  }
}

/** Renders body text, turning known glossary labels into knowledge links. */
function InlineGlossaryText({ text, glossary = [], darkMode }) {
  if (!text || !glossary.length) return text;

  const labels = glossary
    .flatMap((item) => item.labels.map((label) => ({ label, item })))
    .sort((a, b) => b.label.length - a.label.length);

  const pattern = new RegExp(`(${labels.map(({ label }) => escapeRegExp(label)).join('|')})`, 'gu');

  return text.split(pattern).map((part, index) => {
    const match = labels.find(({ label }) => label === part);
    if (!match) return <span key={`${part}-${index}`}>{part}</span>;
    const term = getGlossaryTermForGlossaryItem(match.item);
    if (!term) return <span key={`${part}-${index}`}>{part}</span>;

    return (
      <a
        key={`${part}-${index}`}
        href={term.href}
        onClick={() => storeGlossaryReturn(term, part)}
        aria-label={`فرهنگ‌نامه آکا: ${term.question.fa}`}
        className={`${darkMode ? 'text-[#E2C68A] decoration-[#C6A768]/70 hover:text-[#C6A768]' : 'text-[#071A3D] decoration-[#C6A768] hover:text-[#0a2350]'} inline font-extrabold underline decoration-2 underline-offset-[5px] transition`}
      >
        {part}
      </a>
    );
  });
}

/** Subtle pointer-driven 3D tilt. Disabled on touch + reduced motion. */
function TiltCard({ children, className }) {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18 });

  const handleMove = (event) => {
    if (reduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 6);
    rx.set(-py * 6);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function MetaRow({ post, isFa, darkMode }) {
  return (
    <div className={`${darkMode ? 'text-white/55' : 'text-neutral-500'} flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-black`}>
      <span className="inline-flex items-center gap-1.5">
        <Clock size={13} />
        {readTimeLabel(post.readTime, isFa)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <FileText size={13} />
        {catLabel(post.category, isFa)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Sparkles size={13} className="text-[#C6A768]" />
        {tt('به‌روزرسانی', 'Updated', isFa)} {formatDate(post.date, isFa)}
      </span>
    </div>
  );
}

/** Compact popularity badge — average ★ (with vote count) + comment count. */
function CardStats({ stat, isFa, showZero = false }) {
  const ratingCount = stat?.ratingCount || 0;
  const commentCount = stat?.commentCount || 0;
  const avg = stat?.avg || 0;
  if (!showZero && ratingCount === 0 && commentCount === 0) return null;

  return (
    <span className="inline-flex items-center gap-3 whitespace-nowrap text-[11px] font-black text-[#C6A768]">
      <span className="inline-flex items-center gap-1" title={tt('میانگین امتیاز', 'Average rating', isFa)}>
        <Star size={12} className="fill-[#C6A768] text-[#C6A768]" />
        {ratingCount > 0 ? formatAvg(avg, isFa) : '—'}
        {ratingCount > 0 && <span className="opacity-60">({formatCount(ratingCount, isFa)})</span>}
      </span>
      {(showZero || commentCount > 0) && (
        <span className="inline-flex items-center gap-1" title={tt('تعداد نظرها', 'Comment count', isFa)}>
          <MessageCircle size={12} />
          {formatCount(commentCount, isFa)}
        </span>
      )}
    </span>
  );
}

/* ============================== INDEX VIEW ============================== */

/** Normalize for forgiving Persian/English matching (Arabic↔Persian yeh/kaf,
 *  ZWNJ → space, lower-case). */
function normalizeSearch(value) {
  return (value || '')
    .toLowerCase()
    .replace(/ي/g, 'ی') // Arabic yeh → Persian yeh
    .replace(/ك/g, 'ک') // Arabic kaf → Persian kaf
    .replace(/\p{M}/gu, '') // strip combining marks (harakat)
    .replace(/\p{Cf}/gu, '') // strip format chars (ZWNJ / ZWJ / bidi)
    .replace(/\s+/g, ' ')
    .trim();
}

/** Minimal inline search over both guides and glossary terms. Shows a compact
 *  results dropdown; each result links straight to the article / term page. */
function KnowledgeSearch({ darkMode, isFa }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = normalizeSearch(query);
    if (q.length < 2) return [];
    const out = [];

    for (const post of knowledgeBlogPosts) {
      const hay = normalizeSearch(
        [post.fa?.title, post.en?.title, post.fa?.excerpt, post.en?.excerpt, post.category, (post.tags || []).join(' ')]
          .filter(Boolean)
          .join(' ')
      );
      if (hay.includes(q)) {
        out.push({ key: `a-${post.slug}`, type: 'article', title: textFor(post, isFa).title, href: postHref(post.slug) });
      }
    }

    for (const term of glossaryTerms) {
      const hay = normalizeSearch(
        [...(term.labels || []), term.title?.fa, term.title?.en, term.question?.fa, term.question?.en]
          .filter(Boolean)
          .join(' ')
      );
      if (hay.includes(q)) {
        out.push({ key: `t-${term.slug}`, type: 'term', title: isFa ? term.title?.fa : term.title?.en, href: term.href });
      }
    }

    return out.slice(0, 7);
  }, [query, isFa]);

  const showPanel = open && normalizeSearch(query).length >= 2;

  return (
    <div
      className="relative mt-6 w-full max-w-md"
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
    >
      <div className="relative">
        <Search
          size={17}
          aria-hidden="true"
          className={`${darkMode ? 'text-white/45' : 'text-neutral-400'} pointer-events-none absolute top-1/2 -translate-y-1/2 ltr:left-4 rtl:right-4`}
        />
        <input
          type="search"
          dir="auto"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false); e.currentTarget.blur(); } }}
          placeholder={tt('جستجوی راهنما یا اصطلاح…', 'Search guides or glossary…', isFa)}
          aria-label={tt('جستجو در نالج‌بانک آکا', 'Search the ACCA knowledge bank', isFa)}
          className={`${darkMode ? 'border-white/12 bg-white/[0.06] text-white placeholder:text-white/40 focus:border-[#C6A768]/60' : 'border-black/10 bg-white/80 text-neutral-900 placeholder:text-neutral-400 focus:border-[#C6A768]/70'} w-full rounded-full border py-3 pe-4 ps-11 text-sm font-bold shadow-[0_10px_30px_rgba(7,26,61,0.06)] outline-none transition focus:ring-4 focus:ring-[#C6A768]/15`}
        />
      </div>

      {showPanel && (
        <div className={`${darkMode ? 'border-white/12 bg-[#0a1424]' : 'border-black/[0.08] bg-white'} absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border shadow-[0_24px_60px_rgba(7,26,61,0.18)]`}>
          {results.length === 0 ? (
            <p className={`${darkMode ? 'text-white/55' : 'text-neutral-500'} px-4 py-4 text-sm font-bold`}>
              {tt('چیزی پیدا نشد', 'No matches found', isFa)}
            </p>
          ) : (
            <ul className="max-h-80 overflow-auto py-1.5">
              {results.map((r) => (
                <li key={r.key}>
                  <a
                    href={r.href}
                    className={`${darkMode ? 'text-white/85 hover:bg-white/[0.07]' : 'text-neutral-800 hover:bg-black/[0.04]'} flex items-center gap-3 px-4 py-2.5 transition`}
                  >
                    {r.type === 'article'
                      ? <FileText size={16} className="shrink-0 text-[#C6A768]" />
                      : <LibraryBig size={16} className="shrink-0 text-[#C6A768]" />}
                    <span className="line-clamp-1 flex-1 text-sm font-bold">{r.title}</span>
                    <span className={`${darkMode ? 'bg-white/8 text-white/50' : 'bg-black/[0.05] text-neutral-500'} shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black`}>
                      {r.type === 'article' ? tt('مقاله', 'Guide', isFa) : tt('اصطلاح', 'Term', isFa)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function BlogIndex({ darkMode, isFa, onConsultationClick }) {
  const [stats, setStats] = useState({});

  useEffect(() => {
    let alive = true;
    fetchCommunityStats().then((data) => alive && setStats(data)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Sort by popularity (rating + comments). Empty stats keep the authored order.
  const sortedPosts = useMemo(
    () =>
      [...knowledgeBlogPosts].sort(
        (a, b) =>
          popularityScore(stats[statKey('blog', b.slug)]) - popularityScore(stats[statKey('blog', a.slug)])
      ),
    [stats]
  );

  const featured = sortedPosts[0];
  const featuredCopy = textFor(featured, isFa);
  const rest = sortedPosts.slice(1);
  const ForwardIcon = isFa ? ArrowLeft : ArrowRight;

  const topics = [
    tt('اقامت دانشجویی', 'Student residence', isFa),
    tt('ای‌کامِت', 'e-Ikamet', isFa),
    tt('هزینه و هارچ', 'Fees & harç', isFa),
    tt('ثبت آدرس', 'Address', isFa),
    tt('دولت الکترونیک', 'e-Devlet', isFa),
  ];

  return (
    <main className="relative px-4 pb-24 pt-24 sm:px-6 lg:pt-28">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <Reveal>
          <div className={`${darkMode ? 'border-[#C6A768]/25 bg-[#C6A768]/10 text-[#E9D9B3]' : 'border-[#C6A768]/30 bg-[#C6A768]/15 text-[#7a5c18]'} mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black`}>
            <Newspaper size={15} />
            {tt('نالج‌بانک آکا · راهنمای تحصیل در ترکیه', 'ACCA Knowledge Bank · Study in Turkey', isFa)}
          </div>
          <h1 className="text-[2.1rem] font-black leading-[1.2] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            {tt(
              'هر چیزی که قبل از اقامت و پذیرش ترکیه باید بدانی',
              'Everything to know before Turkey admission & residence',
              isFa
            )}
          </h1>
          <p className={`${darkMode ? 'text-white/70' : 'text-neutral-700'} mt-5 max-w-xl text-base font-semibold leading-9 sm:text-lg`}>
            {tt(
              'راهنماهای کوتاه، منبع‌دار و قابل‌اعتماد آکا؛ نوشته‌شده برای دانشجویی که می‌خواهد بدون سردرگمی مسیر ترکیه را درست شروع کند.',
              'Short, source-backed ACCA guides written for students who want to start the Turkey journey the right way.',
              isFa
            )}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => scrollToId('all-guides')}
              className="inline-flex items-center gap-2 rounded-full bg-[#071A3D] px-6 py-3.5 text-sm font-black text-white shadow-[0_16px_40px_rgba(7,26,61,0.28)] transition hover:bg-[#0a2350]"
            >
              {tt('مطالعه راهنماها', 'Read the guides', isFa)}
              <ForwardIcon size={17} />
            </button>
            <a
              href="?page=glossary"
              className={`${darkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-white text-neutral-950 hover:bg-neutral-50'} inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-black shadow-[0_10px_30px_rgba(7,26,61,0.10)] transition`}
            >
              <LibraryBig size={17} className="text-[#C6A768]" />
              {tt('فرهنگ‌نامه اصطلاحات', 'Open glossary', isFa)}
            </a>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-2">
            {topics.map((topic) => (
              <span
                key={topic}
                className={`${darkMode ? 'border-white/10 bg-white/[0.06] text-white/70' : 'border-black/5 bg-white/70 text-neutral-600'} rounded-full border px-3 py-1.5 text-[11px] font-black`}
              >
                {topic}
              </span>
            ))}
          </div>

          <KnowledgeSearch darkMode={darkMode} isFa={isFa} />
        </Reveal>

        {/* Featured card with tilt */}
        <Reveal delay={0.12}>
          <TiltCard className="[transform-style:preserve-3d]">
            <a
              href={postHref(featured.slug)}
              className={`${darkMode ? 'border-white/10 bg-[#07111f]' : 'border-black/5 bg-white'} group block overflow-hidden rounded-[30px] border shadow-[0_30px_80px_rgba(7,26,61,0.16)]`}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={featured.image.src}
                  alt={featured.image.alt}
                  width="1440"
                  height="900"
                  onError={handleBlogImageError}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071A3D]/85 via-[#071A3D]/10 to-transparent" />
                <span className="absolute bottom-4 inline-flex items-center gap-1.5 rounded-full bg-[#C6A768] px-3.5 py-1.5 text-[11px] font-black text-[#071A3D] ltr:left-4 rtl:right-4">
                  <Sparkles size={13} />
                  {tt('مقاله منتخب', 'Featured', isFa)}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <MetaRow post={featured} isFa={isFa} darkMode={darkMode} />
                  <CardStats stat={stats[statKey('blog', featured.slug)]} isFa={isFa} />
                </div>
                <h2 className="mt-3 text-xl font-black leading-9">{featuredCopy.title}</h2>
                <p className={`${darkMode ? 'text-white/65' : 'text-neutral-600'} mt-3 line-clamp-3 text-sm font-semibold leading-8`}>
                  {featuredCopy.excerpt}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#C6A768]">
                  {tt('خواندن مقاله', 'Read article', isFa)}
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </a>
          </TiltCard>
        </Reveal>
      </section>

      {/* Guides grid */}
      <section id="all-guides" className="mx-auto mt-20 max-w-6xl scroll-mt-28">
        <Reveal className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">{tt('همه راهنماها', 'All guides', isFa)}</h2>
            <p className={`${darkMode ? 'text-white/55' : 'text-neutral-500'} mt-1 text-sm font-bold`}>
              {tt(`${knowledgeBlogPosts.length} مقاله منبع‌دار`, `${knowledgeBlogPosts.length} source-backed articles`, isFa)}
            </p>
          </div>
          <Compass size={26} className="text-[#C6A768]" />
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, index) => {
            const copy = textFor(post, isFa);
            return (
              <Reveal key={post.slug} delay={index * 0.05}>
                <a
                  href={postHref(post.slug)}
                  className={`${darkMode ? 'border-white/10 bg-[#07111f] hover:border-[#C6A768]/40' : 'border-black/5 bg-white hover:border-[#C6A768]/50'} group flex h-full flex-col overflow-hidden rounded-[26px] border shadow-[0_14px_44px_rgba(7,26,61,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(7,26,61,0.14)]`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={post.image.src}
                      alt={post.image.alt}
                      width="1440"
                      height="900"
                      loading="lazy"
                      onError={handleBlogImageError}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-3">
                      <MetaRow post={post} isFa={isFa} darkMode={darkMode} />
                      <CardStats stat={stats[statKey('blog', post.slug)]} isFa={isFa} />
                    </div>
                    <h3 className="mt-2.5 text-lg font-black leading-8">{copy.title}</h3>
                    <p className={`${darkMode ? 'text-white/60' : 'text-neutral-600'} mt-2 line-clamp-3 text-sm font-semibold leading-7`}>
                      {copy.excerpt}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-black text-[#C6A768]">
                      {tt('ادامه مطلب', 'Read more', isFa)}
                      <ArrowUpRight size={15} />
                    </span>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Lead CTA */}
      <div className="mx-auto mt-20 max-w-6xl">
        <LeadCta darkMode={darkMode} isFa={isFa} onConsultationClick={onConsultationClick} />
      </div>
    </main>
  );
}

/* ============================== ARTICLE VIEW ============================== */

function ArticleReader({ post, darkMode, isFa, onConsultationClick }) {
  const copy = textFor(post, isFa);
  const BackIcon = isFa ? ChevronRight : ChevronLeft;
  const [articleStat, setArticleStat] = useState({ avg: 0, ratingCount: 0, commentCount: 0 });

  const toc = useMemo(() => [
    { id: 'quick-answer', label: tt('پاسخ کوتاه', 'Quick answer', isFa) },
    ...(post.metricCards?.length ? [{ id: 'work-snapshot', label: tt('نقشه سریع', 'Snapshot', isFa) }] : []),
    ...(post.comparisonRows?.length ? [{ id: 'degree-rules', label: tt('مقایسه مقطع‌ها', 'Degree comparison', isFa) }] : []),
    ...(post.salaryBars?.length ? [{ id: 'income-model', label: tt('مدل درآمد', 'Income model', isFa) }] : []),
    ...copy.sections.map((section, index) => ({ id: `sec-${index}`, label: section.heading })),
    { id: 'key-takeaways', label: tt('نکات کلیدی', 'Key takeaways', isFa) },
    { id: 'faq', label: tt('پرسش‌های پرتکرار', 'FAQ', isFa) },
    { id: 'sources', label: tt('منابع و اعتبار', 'Sources', isFa) },
    { id: 'community', label: tt('نظرها و امتیاز', 'Ratings & comments', isFa) },
  ], [copy.sections, isFa, post.comparisonRows?.length, post.metricCards?.length, post.salaryBars?.length]);

  const activeId = useActiveId(toc.map((item) => item.id));

  // Glossary terms referenced by this article, for a "related terms" rail.
  const relatedTerms = useMemo(() => {
    const seen = new Set();
    const list = [];
    post.glossary.forEach((item) => {
      const term = getGlossaryTermForGlossaryItem(item);
      if (term && !seen.has(term.slug)) {
        seen.add(term.slug);
        list.push(term);
      }
    });
    return list;
  }, [post.glossary]);

  const moreGuides = knowledgeBlogPosts.filter((item) => item.slug !== post.slug).slice(0, 3);
  const authorName = post.author?.name || tt('تیم محتوای آکا', 'ACCA EDU Team', isFa);
  const authorRole = post.author
    ? tt(post.author.role?.fa || post.author.role || '', post.author.role?.en || post.author.role || '', isFa)
    : tt('بازبینی: کارشناسان پذیرش و اقامت', 'Reviewed by admission & residence advisors', isFa);
  const authorImage = post.author?.image;
  const authorInitials = post.author?.initials || tt('آکا', 'ACCA', isFa);
  const articleStatKey = statKey('blog', post.slug);

  useEffect(() => {
    let alive = true;
    fetchCommunityStats()
      .then((data) => {
        if (alive) setArticleStat(data[articleStatKey] || { avg: 0, ratingCount: 0, commentCount: 0 });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [articleStatKey]);

  const facts = [
    { label: tt('زمان مطالعه', 'Reading time', isFa), value: readTimeLabel(post.readTime, isFa) },
    { label: tt('دسته', 'Category', isFa), value: catLabel(post.category, isFa) },
    { label: tt('آخرین به‌روزرسانی', 'Last updated', isFa), value: formatDate(post.date, isFa) },
    { label: tt('سطح', 'Level', isFa), value: tt('مقدماتی', 'Beginner', isFa) },
  ];

  return (
    <main className="relative px-4 pb-24 pt-24 sm:px-6 lg:pt-28">
      <article className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <Reveal className={`${darkMode ? 'text-white/55' : 'text-neutral-500'} flex flex-wrap items-center gap-2 text-xs font-black`}>
          <a href="?page=blog" className="inline-flex items-center gap-1.5 transition hover:text-[#C6A768]">
            <BackIcon size={15} />
            {tt('بلاگ', 'Blog', isFa)}
          </a>
          <span className="opacity-40">/</span>
          <span className={darkMode ? 'text-white/80' : 'text-neutral-800'}>{catLabel(post.category, isFa)}</span>
        </Reveal>

        {/* Title block */}
        <Reveal className="mt-5" delay={0.05}>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#C6A768] px-3.5 py-1.5 text-[11px] font-black text-[#071A3D]">
            <FileText size={13} />
            {catLabel(post.category, isFa)}
          </span>
          <h1 className="mt-4 text-[2rem] font-black leading-[1.25] tracking-tight sm:text-4xl lg:text-5xl">
            {copy.title}
          </h1>
          <p className={`${darkMode ? 'text-white/70' : 'text-neutral-700'} mt-4 max-w-3xl text-base font-semibold leading-9 sm:text-lg`}>
            {copy.excerpt}
          </p>

          {/* E-E-A-T author row */}
          <div className={`${darkMode ? 'border-white/10' : 'border-black/10'} mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-y py-4`}>
            <div className="flex items-center gap-3">
              {authorImage ? (
                <img
                  src={authorImage}
                  alt={tt(`تصویر ${authorName}`, `${authorName} profile photo`, isFa)}
                  loading="lazy"
                  className="h-11 w-11 rounded-full border-2 border-[#C6A768]/45 object-cover shadow-[0_10px_24px_rgba(7,26,61,0.16)]"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#071A3D] text-sm font-black text-[#C6A768]">{authorInitials}</div>
              )}
              <div>
                <p className="text-[13px] font-black leading-5">{authorName}</p>
                <p className={`${darkMode ? 'text-white/50' : 'text-neutral-500'} text-[11px] font-bold`}>
                  {authorRole}
                </p>
              </div>
            </div>
            <div className={`${darkMode ? 'text-white/55' : 'text-neutral-500'} flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-black`}>
              <span className="inline-flex items-center gap-1.5"><Clock size={13} />{readTimeLabel(post.readTime, isFa)}</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles size={13} className="text-[#C6A768]" />{tt('به‌روزرسانی', 'Updated', isFa)} {formatDate(post.date, isFa)}</span>
              <CardStats stat={articleStat} isFa={isFa} showZero />
            </div>
          </div>
        </Reveal>

        {/* Hero image */}
        <Reveal className="mt-7" delay={0.1}>
          <img
            src={post.image.src}
            alt={post.image.alt}
            width="1440"
            height="810"
            onError={handleBlogImageError}
            className="aspect-[16/9] w-full rounded-[28px] object-cover shadow-[0_28px_70px_rgba(7,26,61,0.18)]"
          />
        </Reveal>

        {/* Body grid: sticky TOC + content */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[230px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <TableOfContents items={toc} activeId={activeId} darkMode={darkMode} isFa={isFa} />
              <div className={`${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/5 bg-white/70'} mt-6 rounded-2xl border p-4`}>
                <p className={`${darkMode ? 'text-white/45' : 'text-neutral-400'} text-[11px] font-black uppercase tracking-[0.16em]`}>
                  {tt('یک نگاه', 'At a glance', isFa)}
                </p>
                <dl className="mt-3 grid gap-2.5">
                  {facts.map((fact) => (
                    <div key={fact.label} className="flex items-baseline justify-between gap-3">
                      <dt className={`${darkMode ? 'text-white/50' : 'text-neutral-500'} text-[11px] font-bold`}>{fact.label}</dt>
                      <dd className="text-[12px] font-black">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            {/* Quick answer — AI-first */}
            <Reveal
              id="quick-answer"
              as="section"
              className={`${darkMode ? 'border-[#C6A768]/25 bg-[#C6A768]/[0.08]' : 'border-[#C6A768]/35 bg-[#C6A768]/[0.12]'} scroll-mt-28 rounded-[24px] border p-5 sm:p-6`}
            >
              <h2 className={`${darkMode ? 'text-[#E9D9B3]' : 'text-[#7a5c18]'} flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]`}>
                <Lightbulb size={16} />
                {tt('پاسخ کوتاه', 'Quick answer', isFa)}
              </h2>
              <p className="mt-3 text-lg font-black leading-9">
                <InlineGlossaryText text={copy.thesis} glossary={post.glossary} darkMode={darkMode} />
              </p>
              <p className={`${darkMode ? 'text-white/70' : 'text-neutral-700'} mt-3 text-[15px] font-semibold leading-8`}>
                <InlineGlossaryText text={copy.lead} glossary={post.glossary} darkMode={darkMode} />
              </p>
            </Reveal>

            {post.metricCards?.length > 0 && (
              <Reveal id="work-snapshot" as="section" className="mt-8 scroll-mt-28">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {post.metricCards.map((card) => (
                    <div
                      key={localizedValue(card.label, isFa)}
                      className={`${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/5 bg-white'} rounded-[22px] border p-4 shadow-[0_14px_44px_rgba(7,26,61,0.06)]`}
                    >
                      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#C6A768]">
                        <Compass size={14} />
                        {localizedValue(card.label, isFa)}
                      </div>
                      <p className="mt-3 text-xl font-black leading-8">{localizedValue(card.value, isFa)}</p>
                      <p className={`${darkMode ? 'text-white/58' : 'text-neutral-600'} mt-2 text-xs font-semibold leading-6`}>
                        {localizedValue(card.note, isFa)}
                      </p>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {post.comparisonRows?.length > 0 && (
              <Reveal
                id="degree-rules"
                as="section"
                className={`${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/5 bg-white'} mt-8 scroll-mt-28 overflow-hidden rounded-[24px] border shadow-[0_14px_44px_rgba(7,26,61,0.07)]`}
              >
                <div className={`${darkMode ? 'border-white/10' : 'border-black/5'} flex flex-wrap items-center justify-between gap-3 border-b p-5`}>
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-black">
                      <FileText size={18} className="text-[#C6A768]" />
                      {tt('مقایسه سریع قوانین کار بر اساس مقطع', 'Work rules by degree level', isFa)}
                    </h2>
                    <p className={`${darkMode ? 'text-white/55' : 'text-neutral-500'} mt-1 text-xs font-semibold leading-6`}>
                      {tt('خلاصه تصمیم‌ساز؛ جزئیات هر پرونده باید با کارفرما و مسیر رسمی بررسی شود.', 'Decision summary; each case still needs employer and official-route review.', isFa)}
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-right text-sm">
                    <thead className={darkMode ? 'bg-white/[0.04] text-white/65' : 'bg-[#F7F1E8] text-neutral-600'}>
                      <tr>
                        {['مقطع', 'زمان شروع', 'نوع کار', 'درآمد منطقی', 'ریسک اصلی'].map((label, index) => (
                          <th key={label} className={`px-4 py-3 text-xs font-black ${!isFa && index === 0 ? 'text-left' : ''}`}>
                            {tt(label, ['Degree', 'Start point', 'Work type', 'Income lens', 'Main risk'][index], isFa)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {post.comparisonRows.map((row) => (
                        <tr key={localizedValue(row.degree, isFa)} className={`${darkMode ? 'border-white/10' : 'border-black/5'} border-t align-top`}>
                          <td className="px-4 py-4 font-black">{localizedValue(row.degree, isFa)}</td>
                          <td className={`${darkMode ? 'text-white/70' : 'text-neutral-700'} px-4 py-4 font-semibold leading-7`}>{localizedValue(row.start, isFa)}</td>
                          <td className={`${darkMode ? 'text-white/70' : 'text-neutral-700'} px-4 py-4 font-semibold leading-7`}>{localizedValue(row.workType, isFa)}</td>
                          <td className={`${darkMode ? 'text-white/70' : 'text-neutral-700'} px-4 py-4 font-semibold leading-7`}>{localizedValue(row.income, isFa)}</td>
                          <td className={`${darkMode ? 'text-white/70' : 'text-neutral-700'} px-4 py-4 font-semibold leading-7`}>{localizedValue(row.risk, isFa)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Reveal>
            )}

            {post.salaryBars?.length > 0 && (
              <Reveal
                id="income-model"
                as="section"
                className={`${darkMode ? 'border-[#C6A768]/20 bg-[#C6A768]/[0.07]' : 'border-[#C6A768]/25 bg-[#FFF8E9]'} mt-8 scroll-mt-28 rounded-[24px] border p-5 sm:p-6`}
              >
                <h2 className="flex items-center gap-2 text-lg font-black">
                  <Sparkles size={18} className="text-[#C6A768]" />
                  {tt('مدل برنامه‌ریزی درآمد دانشجویی', 'Student income planning model', isFa)}
                </h2>
                <p className={`${darkMode ? 'text-white/62' : 'text-neutral-600'} mt-2 text-sm font-semibold leading-8`}>
                  {localizedValue(post.salaryNote, isFa)}
                </p>
                <div className="mt-5 grid gap-4">
                  {post.salaryBars.map((bar) => (
                    <div key={localizedValue(bar.label, isFa)} className="grid gap-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-black">
                        <span>{localizedValue(bar.label, isFa)}</span>
                        <span className="text-[#C6A768]">{localizedValue(bar.amount, isFa)}</span>
                      </div>
                      <div className={`${darkMode ? 'bg-white/10' : 'bg-white'} h-3 overflow-hidden rounded-full`}>
                        <div className="h-full rounded-full bg-[#C6A768]" style={{ width: `${Math.max(0, Math.min(100, Number(bar.value) || 0))}%` }} />
                      </div>
                      <p className={`${darkMode ? 'text-white/52' : 'text-neutral-500'} text-xs font-semibold leading-6`}>
                        {localizedValue(bar.note, isFa)}
                      </p>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {/* Sections */}
            <div className="mt-8 grid gap-8">
              {copy.sections.map((section, index) => (
                <Reveal id={`sec-${index}`} as="section" key={section.heading} className="scroll-mt-28">
                  <h2 className="flex items-start gap-2.5 text-xl font-black leading-8 sm:text-2xl">
                    <BookOpen size={20} className="mt-1 shrink-0 text-[#C6A768]" />
                    {section.heading}
                  </h2>
                  <p className={`${darkMode ? 'text-white/72' : 'text-neutral-700'} mt-3 text-[15px] font-semibold leading-9`}>
                    <InlineGlossaryText text={section.body} glossary={post.glossary} darkMode={darkMode} />
                  </p>
                </Reveal>
              ))}
            </div>

            {/* Key takeaways */}
            <Reveal
              id="key-takeaways"
              as="section"
              className={`${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/5 bg-white'} mt-8 scroll-mt-28 rounded-[24px] border p-5 shadow-[0_14px_44px_rgba(7,26,61,0.07)] sm:p-6`}
            >
              <h2 className="flex items-center gap-2 text-lg font-black">
                <Quote size={18} className="text-[#C6A768]" />
                {tt('نکات کلیدی برای دانشجو', 'Key takeaways', isFa)}
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {copy.keyTakeaways.map((item) => (
                  <li key={item} className={`${darkMode ? 'bg-white/[0.04]' : 'bg-[#F7F1E8]'} flex gap-3 rounded-2xl p-4 text-sm font-semibold leading-7`}>
                    <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C6A768]/20 text-[10px] font-black text-[#C6A768]">✓</span>
                    <span className={darkMode ? 'text-white/75' : 'text-neutral-700'}>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* FAQ */}
            <Reveal id="faq" as="section" className="mt-8 scroll-mt-28">
              <h2 className="flex items-center gap-2 text-xl font-black sm:text-2xl">
                <Sparkles size={20} className="text-[#C6A768]" />
                {tt('پرسش‌های پرتکرار', 'Frequently asked questions', isFa)}
              </h2>
              <div className="mt-4 grid gap-3">
                {copy.faq.map((item) => (
                  <details
                    key={item.q}
                    className={`${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/5 bg-white'} group rounded-2xl border p-4 shadow-[0_8px_30px_rgba(7,26,61,0.05)] sm:p-5`}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black leading-7">
                      {item.q}
                      <ChevronLeft size={18} className="shrink-0 text-[#C6A768] transition group-open:-rotate-90" />
                    </summary>
                    <p className={`${darkMode ? 'text-white/65' : 'text-neutral-600'} mt-3 text-sm font-semibold leading-8`}>
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </Reveal>

            {/* Related glossary terms */}
            {relatedTerms.length > 0 && (
              <Reveal as="section" className="mt-8">
                <h2 className="flex items-center gap-2 text-base font-black">
                  <LibraryBig size={18} className="text-[#C6A768]" />
                  {tt('اصطلاحات مرتبط', 'Related terms', isFa)}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {relatedTerms.map((term) => (
                    <a
                      key={term.slug}
                      href={term.href}
                      className={`${darkMode ? 'border-white/10 bg-white/[0.06] text-white/80 hover:border-[#C6A768]/40' : 'border-black/5 bg-white text-neutral-700 hover:border-[#C6A768]/50'} inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-black transition`}
                    >
                      {tt(term.title.fa, term.title.en, isFa)}
                      <ArrowUpRight size={13} className="text-[#C6A768]" />
                    </a>
                  ))}
                </div>
              </Reveal>
            )}

            {/* Sources / E-E-A-T */}
            <Reveal
              id="sources"
              as="section"
              className={`${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/5 bg-white'} mt-8 scroll-mt-28 rounded-[24px] border p-5 sm:p-6`}
            >
              <h2 className="flex items-center gap-2 text-base font-black">
                <ShieldCheck size={18} className="text-emerald-500" />
                {tt('منابع و اعتبار', 'Sources & trust', isFa)}
              </h2>
              <p className={`${darkMode ? 'text-white/60' : 'text-neutral-600'} mt-3 text-sm font-semibold leading-8`}>
                {tt('برگرفته از', 'Based on', isFa)}: {post.knowledgeSource}
              </p>
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${darkMode ? 'border-white/10 hover:border-emerald-400/40' : 'border-black/5 hover:border-emerald-500/40'} mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-black text-emerald-600 transition`}
              >
                {tt('منبع رسمی', 'Official source', isFa)}: {post.sourceName}
                <ExternalLink size={14} />
              </a>
              {post.sourceLinks?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.sourceLinks.map((source) => (
                    <a
                      key={`${localizedValue(source.label, isFa)}-${source.url}`}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${darkMode ? 'border-white/10 hover:border-emerald-400/40' : 'border-black/5 hover:border-emerald-500/40'} inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-black text-emerald-600 transition`}
                    >
                      {tt('منبع تکمیلی', 'Supporting source', isFa)}: {localizedValue(source.label, isFa)}
                      <ExternalLink size={14} />
                    </a>
                  ))}
                </div>
              )}
            </Reveal>
          </div>
        </div>

        {/* Ratings + comments */}
        <div className="mt-14">
          <CommunitySection entityType="blog" entitySlug={post.slug} darkMode={darkMode} isFa={isFa} />
        </div>

        {/* Contextual lead CTA */}
        <div className="mt-12">
          <LeadCta
            darkMode={darkMode}
            isFa={isFa}
            onConsultationClick={onConsultationClick}
            topic={tt(`سؤالی درباره «${copy.title}» داری؟`, `Questions about “${copy.title}”?`, isFa)}
          />
        </div>

        {/* More guides */}
        <section className="mt-16">
          <h2 className="mb-5 text-xl font-black sm:text-2xl">{tt('راهنماهای بیشتر', 'More guides', isFa)}</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {moreGuides.map((item) => {
              const itemCopy = textFor(item, isFa);
              return (
                <a
                  key={item.slug}
                  href={postHref(item.slug)}
                  className={`${darkMode ? 'border-white/10 bg-[#07111f] hover:border-[#C6A768]/40' : 'border-black/5 bg-white hover:border-[#C6A768]/50'} group flex flex-col overflow-hidden rounded-[24px] border shadow-[0_12px_40px_rgba(7,26,61,0.07)] transition hover:-translate-y-1`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={item.image.src} alt={item.image.alt} loading="lazy" onError={handleBlogImageError} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
                  </div>
                  <div className="p-4">
                    <p className={`${darkMode ? 'text-white/45' : 'text-neutral-400'} text-[11px] font-black`}>{catLabel(item.category, isFa)}</p>
                    <h3 className="mt-1.5 line-clamp-2 text-sm font-black leading-7">{itemCopy.title}</h3>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      </article>
    </main>
  );
}

/* ============================== NOT FOUND ============================== */

function ArticleNotFound({ darkMode, isFa }) {
  const BackIcon = isFa ? ArrowLeft : ArrowRight;
  return (
    <main className="relative flex min-h-[70vh] items-center justify-center px-4 pt-24">
      <div className="text-center">
        <h1 className="text-3xl font-black">{tt('مقاله پیدا نشد', 'Article not found', isFa)}</h1>
        <p className={`${darkMode ? 'text-white/60' : 'text-neutral-600'} mt-3 text-sm font-semibold`}>
          {tt('این مقاله موجود نیست یا منتقل شده است.', 'This article does not exist or has moved.', isFa)}
        </p>
        <a href="?page=blog" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#071A3D] px-6 py-3.5 text-sm font-black text-white">
          {tt('بازگشت به بلاگ', 'Back to blog', isFa)}
          <BackIcon size={16} />
        </a>
      </div>
    </main>
  );
}

/* ============================== PAGE SHELL ============================== */

export default function BlogPage({
  darkMode,
  isFa,
  ACCA_LOGO_SRC,
  postSlug,
  onConsultationClick,
  onToggleDarkMode,
  onToggleLanguage,
}) {
  const post = postSlug ? getBlogPostBySlug(postSlug) : null;
  const isArticle = Boolean(postSlug);

  // Restore reading position when returning from a glossary term.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let restoreData = null;
    try {
      restoreData = JSON.parse(
        window.sessionStorage.getItem(GLOSSARY_RESTORE_KEY)
        || window.sessionStorage.getItem(GLOSSARY_RETURN_KEY)
        || 'null'
      );
    } catch {
      restoreData = null;
    }

    if (!restoreData?.url || typeof restoreData.scrollY !== 'number') return undefined;
    const currentWithoutHash = window.location.href.split('#')[0];
    const savedWithoutHash = String(restoreData.url).split('#')[0];
    const isFreshEnough = !restoreData.savedAt || Date.now() - restoreData.savedAt < 60 * 60 * 1000;
    if (currentWithoutHash !== savedWithoutHash || !isFreshEnough) return undefined;

    try {
      window.history.scrollRestoration = 'manual';
      window.sessionStorage.removeItem(GLOSSARY_RESTORE_KEY);
      window.sessionStorage.removeItem(GLOSSARY_RETURN_KEY);
    } catch {
      // Ignore storage/history restrictions in locked-down browsers.
    }

    const restore = () => window.scrollTo({ top: restoreData.scrollY, left: 0, behavior: 'auto' });
    window.requestAnimationFrame(restore);
    const timers = [120, 420, 900].map((delay) => window.setTimeout(restore, delay));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <div
      dir={isFa ? 'rtl' : 'ltr'}
      className={`${darkMode ? 'bg-[#050816] text-white' : 'bg-[#F7F1E8] text-neutral-950'} relative min-h-screen overflow-x-clip`}
    >
      <AuroraBackground darkMode={darkMode} />
      {isArticle && <ReadingProgress darkMode={darkMode} isFa={isFa} />}
      <KnowledgeHeader
        darkMode={darkMode}
        isFa={isFa}
        ACCA_LOGO_SRC={ACCA_LOGO_SRC}
        activeNav="blog"
        backFallback={isArticle ? '?page=blog' : '/'}
        onToggleDarkMode={onToggleDarkMode}
        onToggleLanguage={onToggleLanguage}
        onConsultationClick={onConsultationClick}
      />

      {!isArticle && <BlogIndex darkMode={darkMode} isFa={isFa} onConsultationClick={onConsultationClick} />}
      {isArticle && post && <ArticleReader post={post} darkMode={darkMode} isFa={isFa} onConsultationClick={onConsultationClick} />}
      {isArticle && !post && <ArticleNotFound darkMode={darkMode} isFa={isFa} />}

      <BackToTop darkMode={darkMode} isFa={isFa} />
    </div>
  );
}
