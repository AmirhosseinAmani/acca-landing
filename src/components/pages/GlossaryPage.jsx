import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BadgeInfo,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  Home,
  KeyRound,
  Landmark,
  LibraryBig,
  Lightbulb,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
} from 'lucide-react';
import { getGlossaryTermBySlug, glossaryTerms } from '../../data/knowledgeGlossary';
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
import { tt, useActiveId } from '../knowledge/knowledgeUtils';

const GLOSSARY_RETURN_KEY = 'acca:glossary-return';
const GLOSSARY_RESTORE_KEY = 'acca:glossary-restore';

const CATEGORY_ICONS = {
  'اقامت دانشجویی': GraduationCap,
  'قوانین اقامت': Landmark,
  'انواع اقامت': ClipboardList,
  'پرونده اقامت': FileText,
  'هزینه اقامت': CreditCard,
  'مدارک اقامت': BadgeInfo,
  'خدمات دیجیتال': KeyRound,
  'شناسه دانشجو': BadgeInfo,
  'امنیت اطلاعات': ShieldCheck,
  'آدرس و سکونت': Home,
};

const CATEGORY_EN = {
  'اقامت دانشجویی': 'Student residence',
  'قوانین اقامت': 'Residence law',
  'انواع اقامت': 'Residence types',
  'پرونده اقامت': 'Residence file',
  'هزینه اقامت': 'Residence costs',
  'مدارک اقامت': 'Residence documents',
  'خدمات دیجیتال': 'Digital services',
  'شناسه دانشجو': 'Student identity',
  'امنیت اطلاعات': 'Data privacy',
  'آدرس و سکونت': 'Address & housing',
};

function catLabel(category, isFa) {
  return isFa ? category : (CATEGORY_EN[category] || category);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

/** Resolve a term's display copy for the active language, falling back to FA. */
function localizeTerm(term, isFa) {
  const en = term.en || {};
  return {
    title: tt(term.title.fa, term.title.en || term.title.fa, isFa),
    question: tt(term.question.fa, term.question.en || term.question.fa, isFa),
    summary: isFa ? term.summary : (en.summary || term.summary),
    sections: isFa ? term.sections : (en.sections || term.sections),
    checklist: isFa ? term.checklist : (en.checklist || term.checklist),
    faq: isFa ? term.faq : (en.faq || term.faq),
  };
}

function CategoryPill({ category, isFa, darkMode, compact = false }) {
  const CategoryIcon = CATEGORY_ICONS[category] || Tag;
  return (
    <span
      className={`${darkMode ? 'bg-white/10 text-white/75' : 'bg-[#F7F1E8] text-neutral-700'} inline-flex items-center gap-2 rounded-full ${compact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2 text-xs'} font-black`}
    >
      <CategoryIcon size={compact ? 13 : 15} strokeWidth={2.4} />
      {catLabel(category, isFa)}
    </span>
  );
}

function readGlossaryReturnTarget() {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(GLOSSARY_RETURN_KEY) || 'null');
    if (parsed?.url && typeof parsed.scrollY === 'number' && Date.now() - parsed.savedAt < 60 * 60 * 1000) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

function TermCard({ term, isFa, darkMode }) {
  const copy = localizeTerm(term, isFa);
  return (
    <a
      href={term.href}
      className={`${darkMode ? 'border-white/10 bg-[#07111f] hover:border-[#C6A768]/40' : 'border-black/5 bg-white hover:border-[#C6A768]/50'} group flex h-full flex-col rounded-[24px] border p-5 shadow-[0_12px_40px_rgba(7,26,61,0.06)] transition hover:-translate-y-1 hover:shadow-[0_22px_56px_rgba(7,26,61,0.12)]`}
    >
      <div className="flex items-center justify-between gap-3">
        <CategoryPill category={term.category} isFa={isFa} darkMode={darkMode} compact />
        <ArrowUpRight size={16} className="text-[#C6A768] opacity-0 transition group-hover:opacity-100" />
      </div>
      {term.visual && (
        <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-black/5">
          <img
            src={term.visual.src}
            alt={term.visual.alt}
            loading="lazy"
            decoding="async"
            className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.015]"
          />
        </div>
      )}
      <h3 className="mt-4 text-lg font-black leading-8">{copy.title}</h3>
      <p className={`${darkMode ? 'text-white/60' : 'text-neutral-600'} mt-2 line-clamp-3 text-sm font-semibold leading-7`}>
        {copy.summary}
      </p>
    </a>
  );
}

/* ============================== INDEX VIEW ============================== */

function GlossaryIndex({ darkMode, isFa, onConsultationClick }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const categories = useMemo(() => unique(glossaryTerms.map((term) => term.category)), []);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(() => glossaryTerms.filter((term) => {
    if (activeCategory !== 'all' && term.category !== activeCategory) return false;
    if (!normalizedQuery) return true;
    const haystack = [
      term.title.fa,
      term.title.en,
      term.question.fa,
      term.question.en,
      term.summary,
      term.en?.summary,
      ...term.labels,
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(normalizedQuery);
  }), [activeCategory, normalizedQuery]);

  const isFiltering = activeCategory !== 'all' || normalizedQuery.length > 0;

  return (
    <main className="relative px-4 pb-24 pt-24 sm:px-6 lg:pt-28">
      {/* Hero */}
      <section className="mx-auto max-w-4xl text-center">
        <Reveal>
          <div className={`${darkMode ? 'border-[#C6A768]/25 bg-[#C6A768]/10 text-[#E9D9B3]' : 'border-[#C6A768]/30 bg-[#C6A768]/15 text-[#7a5c18]'} mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black`}>
            <LibraryBig size={15} />
            {tt('فرهنگ‌نامه تحصیل در ترکیه آکا', 'ACCA Study-in-Turkey Glossary', isFa)}
          </div>
          <h1 className="text-[2rem] font-black leading-[1.2] tracking-tight sm:text-5xl">
            {tt('هر اصطلاح مهم، یک توضیح ساده', 'Every key term, explained simply', isFa)}
          </h1>
          <p className={`${darkMode ? 'text-white/70' : 'text-neutral-700'} mx-auto mt-5 max-w-2xl text-base font-semibold leading-9 sm:text-lg`}>
            {tt(
              'اقامت، ای‌کامِت، هارچ، ثبت آدرس و خدمات دولتی ترکیه؛ هر کلمه مثل یک مقاله کوتاه، قابل جستجو و قابل اعتماد.',
              'Residence, e-Ikamet, harç, address registration and Turkish e-services — each term as a short, searchable, trustworthy entry.',
              isFa
            )}
          </p>
        </Reveal>

        {/* Search */}
        <Reveal delay={0.1} className="mx-auto mt-8 max-w-xl">
          <div className={`${darkMode ? 'border-white/10 bg-[#07111f]' : 'border-black/5 bg-white'} flex items-center gap-3 rounded-full border px-5 py-3.5 shadow-[0_14px_44px_rgba(7,26,61,0.08)] focus-within:border-[#C6A768]/60`}>
            <Search size={18} className={darkMode ? 'text-white/40' : 'text-neutral-400'} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={tt('جستجوی اصطلاح… مثلاً ای‌کامِت، هارچ، آدرس', 'Search a term… e.g. e-Ikamet, harç, address', isFa)}
              aria-label={tt('جستجو در فرهنگ‌نامه', 'Search the glossary', isFa)}
              className="w-full bg-transparent text-sm font-bold outline-none placeholder:font-semibold placeholder:opacity-60"
            />
          </div>
        </Reveal>

        {/* Category filter */}
        <Reveal delay={0.16} className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {[{ key: 'all', label: tt('همه', 'All', isFa) }, ...categories.map((c) => ({ key: c, label: catLabel(c, isFa) }))].map((chip) => {
            const isActive = activeCategory === chip.key;
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => setActiveCategory(chip.key)}
                className={`rounded-full px-4 py-2 text-xs font-black transition ${
                  isActive
                    ? 'bg-[#071A3D] text-white shadow-[0_10px_26px_rgba(7,26,61,0.22)]'
                    : (darkMode ? 'bg-white/[0.06] text-white/65 hover:bg-white/10' : 'bg-white/70 text-neutral-600 hover:bg-white')
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </Reveal>
      </section>

      {/* Results */}
      <section className="mx-auto mt-12 max-w-6xl">
        {filtered.length === 0 ? (
          <div className={`${darkMode ? 'text-white/60' : 'text-neutral-500'} rounded-[26px] border border-dashed ${darkMode ? 'border-white/15' : 'border-black/10'} p-12 text-center`}>
            <Search size={26} className="mx-auto text-[#C6A768]" />
            <p className="mt-3 text-sm font-black">{tt('اصطلاحی پیدا نشد', 'No matching term', isFa)}</p>
            <p className="mt-1 text-xs font-bold">{tt('کلمه دیگری را امتحان کن یا فیلتر را پاک کن.', 'Try another word or clear the filter.', isFa)}</p>
          </div>
        ) : isFiltering ? (
          <>
            <p className={`${darkMode ? 'text-white/55' : 'text-neutral-500'} mb-5 text-sm font-bold`}>
              {tt(`${filtered.length} اصطلاح`, `${filtered.length} terms`, isFa)}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((term) => (
                <TermCard key={term.slug} term={term} isFa={isFa} darkMode={darkMode} />
              ))}
            </div>
          </>
        ) : (
          <div className="grid gap-10">
            {categories.map((category) => (
              <Reveal key={category}>
                <div className="mb-4 flex items-center gap-2.5">
                  {(() => {
                    const Icon = CATEGORY_ICONS[category] || Tag;
                    return <Icon size={20} className="text-[#C6A768]" />;
                  })()}
                  <h2 className="text-xl font-black sm:text-2xl">{catLabel(category, isFa)}</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {glossaryTerms.filter((term) => term.category === category).map((term) => (
                    <TermCard key={term.slug} term={term} isFa={isFa} darkMode={darkMode} />
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <div className="mx-auto mt-20 max-w-6xl">
        <LeadCta darkMode={darkMode} isFa={isFa} onConsultationClick={onConsultationClick} />
      </div>
    </main>
  );
}

/* ============================== TERM READER ============================== */

function TermReader({ term, darkMode, isFa, onConsultationClick, returnTarget, onReturnToArticle }) {
  const copy = localizeTerm(term, isFa);
  const BackIcon = isFa ? ChevronRight : ChevronLeft;

  // Prefer same-category terms, then top up with others so the rail always
  // fills its row (the glossary is tightly themed, so all terms relate).
  const relatedTerms = useMemo(() => {
    const sameCategory = glossaryTerms.filter((item) => item.slug !== term.slug && item.category === term.category);
    const others = glossaryTerms.filter((item) => item.slug !== term.slug && item.category !== term.category);
    return [...sameCategory, ...others].slice(0, 4);
  }, [term.slug, term.category]);

  const toc = useMemo(() => [
    { id: 'quick-def', label: tt('تعریف سریع', 'Quick definition', isFa) },
    ...copy.sections.map((section, index) => ({ id: `sec-${index}`, label: section.heading })),
    { id: 'checklist', label: tt('چک‌لیست', 'Checklist', isFa) },
    { id: 'faq', label: tt('پرسش‌های پرتکرار', 'FAQ', isFa) },
    { id: 'community', label: tt('نظرها و امتیاز', 'Ratings & comments', isFa) },
  ], [copy.sections, isFa]);

  const activeId = useActiveId(toc.map((item) => item.id));
  const quickDef = (isFa ? term.sourceDefinitions[0] : copy.summary) || copy.summary;

  const returnHref = returnTarget?.url || '?page=blog';
  const returnLabel = returnTarget?.label
    ? `${tt('بازگشت به مقاله', 'Back to', isFa)}: ${returnTarget.label}`
    : tt('بازگشت به بلاگ', 'Back to blog', isFa);

  return (
    <main className="relative px-4 pb-24 pt-24 sm:px-6 lg:pt-28">
      <article className="mx-auto max-w-6xl">
        {/* Breadcrumb / actions */}
        <Reveal className="flex flex-wrap items-center gap-2 text-xs font-black">
          <a href={returnHref} onClick={onReturnToArticle} className="inline-flex items-center gap-1.5 rounded-full bg-[#071A3D] px-4 py-2 text-white transition hover:bg-[#0a2350]">
            <BackIcon size={15} />
            {returnLabel}
          </a>
          <a href="?page=glossary" className={`${darkMode ? 'bg-white/10 text-white/75 hover:bg-white/15' : 'bg-white text-neutral-700 hover:bg-neutral-50'} inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition`}>
            <LibraryBig size={14} />
            {tt('همه اصطلاحات', 'All terms', isFa)}
          </a>
        </Reveal>

        {/* Title */}
        <Reveal className="mt-5" delay={0.05}>
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div>
              <CategoryPill category={term.category} isFa={isFa} darkMode={darkMode} />
              <h1 className="mt-4 text-[1.9rem] font-black leading-[1.25] tracking-tight sm:text-4xl lg:text-5xl">
                {copy.question}
              </h1>
              <p className={`${darkMode ? 'text-white/70' : 'text-neutral-700'} mt-4 max-w-3xl text-base font-semibold leading-9 sm:text-lg`}>
                {copy.summary}
              </p>
            </div>
            {term.visual && (
              <figure className={`${darkMode ? 'bg-white/[0.04] ring-white/10' : 'bg-white/70 ring-black/5'} overflow-hidden rounded-[28px] p-2 shadow-[0_24px_70px_rgba(7,26,61,0.12)] ring-1`}>
                <img
                  src={term.visual.src}
                  alt={term.visual.alt}
                  width="1280"
                  height="720"
                  loading="eager"
                  decoding="async"
                  className="aspect-[16/9] w-full rounded-[22px] object-cover"
                />
              </figure>
            )}
          </div>
        </Reveal>

        {/* Body grid */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[230px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <TableOfContents items={toc} activeId={activeId} darkMode={darkMode} isFa={isFa} />
            </div>
          </aside>

          <div className="min-w-0">
            {/* Quick definition */}
            <Reveal
              id="quick-def"
              as="section"
              className={`${darkMode ? 'border-[#C6A768]/25 bg-[#C6A768]/[0.08]' : 'border-[#C6A768]/35 bg-[#C6A768]/[0.12]'} scroll-mt-28 rounded-[24px] border p-5 sm:p-6`}
            >
              <h2 className={`${darkMode ? 'text-[#E9D9B3]' : 'text-[#7a5c18]'} flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]`}>
                <Lightbulb size={16} />
                {tt('تعریف سریع', 'Quick definition', isFa)}
              </h2>
              <p className="mt-3 text-lg font-black leading-9">{quickDef}</p>
            </Reveal>

            {/* Sections */}
            <div className="mt-8 grid gap-8">
              {copy.sections.map((section, index) => (
                <Reveal id={`sec-${index}`} as="section" key={section.heading} className="scroll-mt-28">
                  <h2 className="flex items-start gap-2.5 text-xl font-black leading-8 sm:text-2xl">
                    <BookOpen size={20} className="mt-1 shrink-0 text-[#C6A768]" />
                    {section.heading}
                  </h2>
                  <p className={`${darkMode ? 'text-white/72' : 'text-neutral-700'} mt-3 text-[15px] font-semibold leading-9`}>
                    {section.body}
                  </p>
                </Reveal>
              ))}
            </div>

            {/* Checklist */}
            <Reveal
              id="checklist"
              as="section"
              className={`${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/5 bg-white'} mt-8 scroll-mt-28 rounded-[24px] border p-5 shadow-[0_14px_44px_rgba(7,26,61,0.07)] sm:p-6`}
            >
              <h2 className="flex items-center gap-2 text-lg font-black">
                <CheckCircle size={18} className="text-emerald-500" />
                {tt('چک‌لیست کاربردی', 'Practical checklist', isFa)}
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {copy.checklist.map((item) => (
                  <li key={item} className={`${darkMode ? 'bg-white/[0.04]' : 'bg-[#F7F1E8]'} flex gap-3 rounded-2xl p-4 text-sm font-semibold leading-7`}>
                    <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[10px] font-black text-emerald-500">✓</span>
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

            {/* Labels */}
            {term.labels.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {term.labels.slice(0, 8).map((label) => (
                  <span key={label} className={`${darkMode ? 'bg-white/[0.06] text-white/60' : 'bg-white text-neutral-500'} rounded-full px-3 py-1.5 text-[11px] font-black`}>
                    #{label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related terms */}
        {relatedTerms.length > 0 && (
          <Reveal as="section" className="mt-14">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-black sm:text-2xl">
              <LibraryBig size={20} className="text-[#C6A768]" />
              {tt('اصطلاحات نزدیک', 'Related terms', isFa)}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedTerms.map((item) => (
                <TermCard key={item.slug} term={item} isFa={isFa} darkMode={darkMode} />
              ))}
            </div>
          </Reveal>
        )}

        {/* Related articles */}
        {term.relatedPosts.length > 0 && (
          <Reveal as="section" className="mt-12">
            <h2 className="mb-4 flex items-center gap-2 text-base font-black">
              <FileText size={18} className="text-[#C6A768]" />
              {tt('مقاله‌های مرتبط', 'Related articles', isFa)}
            </h2>
            <div className={`grid gap-3 ${term.relatedPosts.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
              {term.relatedPosts.map((post) => (
                <a
                  key={post.slug}
                  href={`?page=blog&post=${encodeURIComponent(post.slug)}`}
                  className={`${darkMode ? 'border-white/10 bg-[#07111f] hover:border-[#C6A768]/40' : 'border-black/5 bg-white hover:border-[#C6A768]/50'} flex items-center justify-between gap-3 rounded-2xl border p-4 text-sm font-bold leading-7 transition hover:-translate-y-0.5`}
                >
                  <span className="line-clamp-2">{post.title}</span>
                  <ArrowUpRight size={16} className="shrink-0 text-[#C6A768]" />
                </a>
              ))}
            </div>
          </Reveal>
        )}

        {/* Ratings + comments */}
        <div className="mt-14">
          <CommunitySection entityType="glossary" entitySlug={term.slug} darkMode={darkMode} isFa={isFa} />
        </div>

        {/* CTA */}
        <div className="mt-12">
          <LeadCta
            darkMode={darkMode}
            isFa={isFa}
            onConsultationClick={onConsultationClick}
            topic={tt('درباره این موضوع سؤال داری؟', 'Have a question about this topic?', isFa)}
          />
        </div>
      </article>
    </main>
  );
}

/* ============================== PAGE SHELL ============================== */

export default function GlossaryPage({
  darkMode,
  isFa,
  ACCA_LOGO_SRC,
  termSlug,
  onConsultationClick,
  onToggleDarkMode,
  onToggleLanguage,
}) {
  const [returnTarget] = useState(readGlossaryReturnTarget);
  const selectedTerm = getGlossaryTermBySlug(termSlug);

  const handleReturnToArticle = (event) => {
    if (!returnTarget?.url) return;
    event.preventDefault();
    try {
      window.sessionStorage.setItem(GLOSSARY_RESTORE_KEY, JSON.stringify({
        ...returnTarget,
        savedAt: Date.now(),
      }));
    } catch {
      // Navigation should still work even if sessionStorage is unavailable.
    }
    window.location.href = returnTarget.url;
  };

  return (
    <div
      dir={isFa ? 'rtl' : 'ltr'}
      className={`${darkMode ? 'bg-[#050816] text-white' : 'bg-[#F7F1E8] text-neutral-950'} relative min-h-screen overflow-x-clip`}
    >
      <AuroraBackground darkMode={darkMode} />
      {selectedTerm && <ReadingProgress darkMode={darkMode} isFa={isFa} />}
      <KnowledgeHeader
        darkMode={darkMode}
        isFa={isFa}
        ACCA_LOGO_SRC={ACCA_LOGO_SRC}
        activeNav="blog"
        backFallback={selectedTerm ? '?page=glossary' : '?page=blog'}
        onToggleDarkMode={onToggleDarkMode}
        onToggleLanguage={onToggleLanguage}
        onConsultationClick={onConsultationClick}
      />

      {selectedTerm ? (
        <TermReader
          term={selectedTerm}
          darkMode={darkMode}
          isFa={isFa}
          onConsultationClick={onConsultationClick}
          returnTarget={returnTarget}
          onReturnToArticle={handleReturnToArticle}
        />
      ) : (
        <GlossaryIndex darkMode={darkMode} isFa={isFa} onConsultationClick={onConsultationClick} />
      )}

      <BackToTop darkMode={darkMode} isFa={isFa} />
    </div>
  );
}
