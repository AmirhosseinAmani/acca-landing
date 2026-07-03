import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getKnowledgeRouteSeo } from '../src/lib/knowledgeSeo.js';
import { knowledgeBlogPosts } from '../src/data/knowledgeBlogPosts.js';
import { glossaryTerms } from '../src/data/knowledgeGlossary.js';
import { BLOG_CANONICAL_OVERRIDE, SITE_ORIGIN } from '../src/lib/routes.js';
import { SEO_LANDING_BY_SLUG, SEO_LANDING_PAGES } from '../src/data/seoLandingPages.js';

const DIST_DIR = path.resolve('dist');
const INDEX_PATH = path.join(DIST_DIR, 'index.html');
const LOGO_SRC = '/assets/optimized/acca-logo-320.webp';
const WHATSAPP_URL = 'https://wa.me/905354585440';
const BUILD_DATE = new Date().toISOString().slice(0, 10);

// Bespoke marketing / section routes that own a hand-written static page. These
// join the dynamically generated blog + glossary pages further down.
const routes = [
  {
    slug: 'study-in-turkey',
    title: 'تحصیل در ترکیه | راهنمای پذیرش، شهریه و اقامت دانشجویی | ACCA EDU',
    description: 'راهنمای کامل ACCA EDU برای تحصیل در ترکیه؛ از انتخاب دانشگاه و رشته تا شهریه، ثبت‌نام، بیمه سلامت، اقامت دانشجویی، خوابگاه و ورود دانشجو به ترکیه.',
    eyebrow: 'راهنمای اصلی تحصیل در ترکیه',
    h1: 'تحصیل در ترکیه؛ از انتخاب دانشگاه تا اقامت دانشجویی',
    summary: 'ACCA EDU مسیر دانشجو را از تصمیم‌گیری اولیه تا ورود و اسکان در ترکیه مرحله‌به‌مرحله روشن می‌کند تا خانواده و دانشجو با تصویر واقعی از هزینه، مدارک، زمان‌بندی و ریسک‌ها اقدام کنند.',
    points: ['انتخاب دانشگاه و رشته براساس بودجه، زبان تحصیل و آینده شغلی', 'بررسی شهریه، بورسیه و مسیر پرداخت دانشگاه', 'آماده‌سازی مدارک پذیرش، ثبت‌نام، بیمه و اقامت', 'پشتیبانی برای خوابگاه، ورود، اسکان و کارهای اداری اولیه'],
    primaryHref: '/programs/',
    primaryLabel: 'مشاهده رشته‌ها و شهریه‌ها',
    priority: 0.96,
  },
  {
    slug: 'programs',
    title: 'رشته‌ها و شهریه‌های دانشگاه‌های ترکیه | ACCA EDU',
    description: 'لیست تخصصی رشته‌ها و شهریه‌های دانشگاه‌های ترکیه برای دانشجویان بین‌المللی؛ جستجو براساس دانشگاه، رشته، مقطع، زبان تحصیل، شهریه و بورسیه.',
    eyebrow: 'لیست رشته‌ها و شهریه‌ها',
    h1: 'جستجوی رشته‌ها، شهریه‌ها و مسیر پذیرش در ترکیه',
    summary: 'این بخش برای تصمیم‌گیری واقعی دانشجو ساخته شده است: رشته، دانشگاه، زبان تحصیل، مقطع، شهریه و مسیر پرداخت باید در کنار هم دیده شوند تا انتخاب دانشگاه فقط براساس نام یا تبلیغ نباشد.',
    points: ['جستجو در رشته‌های دانشگاهی ترکیه براساس نام رشته و دانشگاه', 'مقایسه شهریه عادی، پرداخت نقدی، پرداخت ترمیک و بورسیه', 'بررسی زبان تحصیل، مقطع، مدت دوره و هزینه ثبت‌نام', 'اتصال مستقیم هر دانشگاه به پروفایل و اطلاعات تکمیلی آن'],
    primaryHref: '/programs/',
    primaryLabel: 'ورود به لیست رشته‌ها',
    priority: 0.94,
  },
  {
    slug: 'universities',
    title: 'دانشگاه‌های ترکیه و استانبول | پروفایل دانشگاه‌ها | ACCA EDU',
    description: 'مشاهده و مقایسه دانشگاه‌های خصوصی استانبول و ترکیه با اطلاعات رشته‌ها، شهریه، لوگو، رتبه، شهر، کمپوس و مسیر پذیرش دانشجویان بین‌المللی.',
    eyebrow: 'بانک دانشگاه‌ها',
    h1: 'مشاهده دانشگاه‌های ترکیه با پروفایل قابل مقایسه',
    summary: 'در این صفحه، دانشگاه‌ها به شکل یک بانک اطلاعاتی قابل جستجو نمایش داده می‌شوند تا دانشجو بتواند قبل از تصمیم نهایی، تصویر کامل‌تری از اعتبار، رشته‌ها، شهریه و امکانات هر دانشگاه داشته باشد.',
    points: ['پروفایل دانشگاه، شهر، نوع دانشگاه و اطلاعات پایه', 'مقایسه تعداد رشته‌ها، شهریه‌ها و لینک مستقیم به لیست برنامه‌ها', 'اطلاعات تکمیلی درباره رتبه، اثرگذاری و مدارک/اعتبارهای ثبت‌شده', 'دسترسی سریع به پروفایل هر دانشگاه و مسیرهای مرتبط'],
    primaryHref: '/universities/',
    primaryLabel: 'ورود به لیست دانشگاه‌ها',
    priority: 0.94,
  },
  {
    slug: 'istanbul-university-map',
    title: 'نقشه سه بعدی دانشگاه های استانبول | موقعیت دانشگاه های خصوصی استانبول | ACCA EDU',
    description: 'نقشه سه بعدی و تعاملی دانشگاه های استانبول در دیتابیس ACCA EDU؛ نمایش موقعیت تقریبی دانشگاه ها در بخش اروپایی و آسیایی استانبول همراه با خلاصه پروفایل و لینک جزئیات.',
    eyebrow: 'نقشه سه بعدی دانشگاه های استانبول',
    h1: 'نقشه سه بعدی دانشگاه های استانبول در یک نمای تعاملی',
    summary: 'این صفحه برای مشاهده سریع موقعیت دانشگاه های موجود در بانک اطلاعاتی ACCA EDU ساخته شده است: استانبول اروپایی و آسیایی در یک نقشه واحد، با امکان انتخاب دانشگاه، دیدن خلاصه پروفایل و رفتن به صفحه جزئیات هر دانشگاه.',
    points: ['نمای واحد از دانشگاه های بخش اروپایی و آسیایی استانبول', 'پین های تعاملی برای مشاهده خلاصه پروفایل هر دانشگاه', 'لینک مستقیم به پروفایل کامل دانشگاه در سایت ACCA EDU', 'موقعیت ها برای تصمیم گیری اولیه و مقایسه بصری تقریبی هستند'],
    primaryHref: '/universities/',
    primaryLabel: 'مشاهده لیست دانشگاه ها',
    priority: 0.9,
  },
  {
    slug: 'scholarships',
    title: 'بورسیه‌های دانشگاه‌های ترکیه و بورسیه ۱۰۰٪ ACCA | ACCA EDU',
    description: 'لیست بورسیه‌های دانشگاه‌های ترکیه برای دانشجویان بین‌المللی؛ بورسیه ۱۰۰٪ ACCA، تخفیف نقدی، مقایسه قیمت و مسیر پذیرش با صرفه‌جویی واقعی در شهریه.',
    eyebrow: 'لیست بورسیه‌ها',
    h1: 'بورسیه‌های دانشگاه‌های ترکیه و بورسیه ۱۰۰٪ ACCA',
    summary: 'بورسیه فقط یک عدد تخفیف نیست؛ دانشجو باید مسیر پرداخت، شرایط حفظ بورسیه، رشته‌های مشمول و تفاوت بورسیه با تخفیف نقدی را شفاف ببیند تا انتخاب مالی درستی داشته باشد.',
    points: ['بورسیه ۱۰۰٪ ACCA و معافیت کامل شهریه دوره کارشناسی', 'مقایسه تخفیف نقدی، پرداخت ترمیک و بورسیه', 'بررسی رشته‌ها و دانشگاه‌های مشمول بورسیه', 'مشاوره برای انتخاب کم‌هزینه‌ترین مسیر پذیرش'],
    primaryHref: '/scholarships/',
    primaryLabel: 'مشاهده لیست بورسیه‌ها',
    priority: 0.9,
  },
  {
    slug: 'medical-universities-in-turkey',
    title: 'دانشگاه‌های پزشکی ترکیه | پزشکی، دندانپزشکی و علوم سلامت | ACCA EDU',
    description: 'راهنمای دانشگاه‌های پزشکی ترکیه برای دانشجویان بین‌المللی؛ بررسی پزشکی، دندانپزشکی، داروسازی، علوم سلامت، شهریه‌ها، زبان تحصیل و مسیر پذیرش.',
    eyebrow: 'مسیرهای پزشکی و سلامت',
    h1: 'دانشگاه‌های پزشکی ترکیه برای دانشجویان بین‌المللی',
    summary: 'برای رشته‌های پزشکی و سلامت، فقط نام دانشگاه کافی نیست. دانشجو باید شهریه، زبان تحصیل، ظرفیت، الزامات ثبت‌نام، بیمارستان‌های آموزشی و مسیر اقامت خود را همزمان بررسی کند.',
    points: ['بررسی رشته‌های پزشکی، دندانپزشکی، داروسازی و علوم سلامت', 'مقایسه شهریه، زبان تحصیل و مدت دوره', 'توجه به امکانات بالینی، بیمارستان‌های آموزشی و کیفیت عملی دوره', 'بررسی مسیر اقامت، بیمه سلامت و آماده‌سازی مدارک بعد از پذیرش'],
    primaryHref: '/programs/',
    primaryLabel: 'جستجوی رشته‌های پزشکی',
    priority: 0.92,
  },
  {
    slug: 'residence-permit',
    title: 'اقامت دانشجویی ترکیه | ای‌کامِت، راندوو و مدارک لازم | ACCA EDU',
    description: 'راهنمای اقامت دانشجویی ترکیه برای دانشجویان ایرانی و بین‌المللی؛ زمان اقدام، بیمه سلامت، راندوو، مدارک، اداره مهاجرت و نکات مهم قبل از پایان مهلت قانونی.',
    eyebrow: 'قوانین اقامت دانشجویی',
    h1: 'اقامت دانشجویی ترکیه؛ مدارک، زمان اقدام و خطاهای رایج',
    summary: 'بعد از ورود به ترکیه، برنامه‌ریزی برای اقامت دانشجویی باید زود و دقیق انجام شود. این مسیر شامل بیمه سلامت، تکمیل اطلاعات، گرفتن راندوو، آماده‌سازی مدارک و پیگیری از اداره مهاجرت است.',
    points: ['شناخت زمان قانونی اقدام بعد از ورود به ترکیه', 'نیاز به بیمه سلامت معتبر برای پرونده اقامت', 'آماده‌سازی مدارک هویتی، عکس بیومتریک، آدرس و اطلاعات تماس', 'اعتماد به منابع رسمی و شرکت‌های دارای مجوز برای امور اداری'],
    primaryHref: '/residence-permit/',
    primaryLabel: 'راهنمای اقامت دانشجویی',
    priority: 0.92,
  },
  {
    slug: 'accommodation',
    title: 'اسکان و ثبت آدرس دانشجو در ترکیه | خوابگاه، نوتر و نفوس | ACCA EDU',
    description: 'راهنمای اسکان دانشجو در ترکیه؛ خوابگاه رسمی، قرارداد اجاره، نوتر، ثبت آدرس، نفوس و اهمیت آدرس معتبر برای اقامت، بانک و کارهای اداری.',
    eyebrow: 'اسکان، نوتر و ثبت آدرس',
    h1: 'اسکان دانشجو در ترکیه و ثبت آدرس معتبر',
    summary: 'آدرس دانشجو فقط محل سکونت نیست؛ برای اقامت، حساب بانکی، گواهی‌نامه و بسیاری از کارهای اداری ترکیه نقش مستقیم دارد. خوابگاه رسمی یا قرارداد اجاره نوترشده باید از ابتدا درست انتخاب شود.',
    points: ['استفاده از نامه خوابگاه رسمی یا قرارداد اجاره نوترشده', 'هماهنگی با صاحب‌خانه قبل از امضای قرارداد برای انجام نوتر', 'ثبت آدرس بعد از دریافت کارت اقامت در سیستم مربوطه', 'نیاز احتمالی به آدرس ثبت‌شده برای بانک، گواهی‌نامه و امور دولتی'],
    primaryHref: '/accommodation/',
    primaryLabel: 'راهنمای ثبت آدرس',
    priority: 0.9,
  },
  {
    slug: 'partner-with-acca-edu',
    title: 'همکاری با ACCA EDU | شبکه پذیرش و خدمات دانشجویی ترکیه',
    description: 'صفحه همکاری با ACCA EDU برای دانشگاه‌ها، آژانس‌ها و نمایندگان آموزشی؛ زیرساخت پذیرش، خدمات دانشجویی، اقامت و جذب دانشجوی بین‌المللی.',
    eyebrow: 'شبکه همکاری بین‌المللی',
    h1: 'همکاری با ACCA EDU برای پذیرش و خدمات دانشجویی',
    summary: 'ACCA EDU برای دانشگاه‌ها، نمایندگان و همکاران آموزشی یک مسیر عملیاتی فراهم می‌کند تا جذب، پذیرش، ثبت‌نام و خدمات بعد از ورود دانشجو به شکل منظم‌تر انجام شود.',
    points: ['همکاری با دانشگاه‌ها و نمایندگان آموزشی', 'پشتیبانی فرایند پذیرش، انتقال، اقامت و خدمات دانشجویی', 'تمرکز بر دانشجویان فارسی‌زبان و بازارهای منطقه‌ای', 'ساختار مناسب برای همکاری بلندمدت و پرونده‌های قابل پیگیری'],
    primaryHref: '/partner-with-acca-edu/',
    primaryLabel: 'مشاهده بخش همکاری',
    priority: 0.82,
    changefreq: 'monthly',
  },
  {
    slug: 'contact',
    title: 'تماس با ACCA EDU | مشاوره تحصیل در ترکیه و ارتباط واتساپ',
    description: 'تماس مستقیم با ACCA EDU برای مشاوره تحصیل در ترکیه، بررسی پذیرش، رشته‌ها، شهریه‌ها، اقامت دانشجویی و خدمات اسکان از طریق واتساپ و کانال‌های رسمی شرکت.',
    eyebrow: 'ارتباط مستقیم',
    h1: 'تماس با ACCA EDU برای مشاوره تحصیل در ترکیه',
    summary: 'برای بررسی شرایط پذیرش، مسیر اقامت، شهریه‌ها، خوابگاه و برنامه‌ریزی ورود به ترکیه، دانشجو می‌تواند از طریق واتساپ رسمی ACCA EDU ارتباط مستقیم بگیرد.',
    points: ['بررسی اولیه شرایط دانشجو و خانواده', 'راهنمایی درباره رشته، دانشگاه و هزینه‌های واقعی', 'پاسخ درباره اقامت، بیمه، ثبت آدرس و ورود به ترکیه', 'ارتباط رسمی با شماره شرکت از طریق واتساپ'],
    primaryHref: WHATSAPP_URL,
    primaryLabel: 'ارتباط از طریق واتساپ',
    priority: 0.86,
    changefreq: 'monthly',
  },
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Shared no-JS shell: brand logo, content slot, then a canonical nav. */
function renderShell({ eyebrow, h1, leadHtml, bodyHtml = '', primaryHref, primaryLabel }) {
  return `      <main class="acca-static-fallback" style="font-family: Vazirmatn, sans-serif; direction: rtl; min-height: 100vh; background: #f7f1e8; color: #071a3d;">
        <section style="max-width: 1120px; margin: 0 auto; padding: 72px 24px 48px;">
          <a href="/" aria-label="ACCA EDU" style="display:inline-flex;align-items:center;gap:12px;text-decoration:none;color:inherit;font-weight:900;">
            <img src="${LOGO_SRC}" alt="ACCA EDU" width="132" height="57" style="width:132px;height:57px;object-fit:contain;" />
          </a>
          <p style="margin:40px 0 12px;color:#008767;font-weight:900;">${escapeHtml(eyebrow)}</p>
          <h1 style="max-width:860px;margin:0;font-size:clamp(2rem,6vw,4rem);line-height:1.2;font-weight:950;">${escapeHtml(h1)}</h1>
          ${leadHtml}
          <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:28px;">
            <a href="${escapeHtml(primaryHref)}" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 24px;border-radius:999px;background:#008767;color:#fff;text-decoration:none;font-weight:900;">${escapeHtml(primaryLabel)}</a>
            <a href="${WHATSAPP_URL}" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 24px;border-radius:999px;background:#fff;color:#071a3d;text-decoration:none;font-weight:900;border:1px solid rgba(7,26,61,0.10);">ارتباط از طریق واتساپ</a>
          </div>
          <nav aria-label="لینک‌های مهم ACCA EDU" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:30px;">
            <a href="/study-in-turkey/" style="color:#071a3d;font-weight:800;">تحصیل در ترکیه</a>
            <a href="/universities/" style="color:#071a3d;font-weight:800;">دانشگاه‌ها</a>
            <a href="/programs/" style="color:#071a3d;font-weight:800;">رشته‌ها و شهریه‌ها</a>
            <a href="/scholarships/" style="color:#071a3d;font-weight:800;">بورسیه‌ها</a>
            <a href="/blog/" style="color:#071a3d;font-weight:800;">بلاگ</a>
            <a href="/glossary/" style="color:#071a3d;font-weight:800;">فرهنگ‌نامه</a>
            <a href="/contact/" style="color:#071a3d;font-weight:800;">تماس</a>
          </nav>
          ${bodyHtml}
        </section>
      </main>`;
}

function renderStaticFallback(route) {
  const points = route.points
    .map((point) => `<li style="background:#fff;border:1px solid rgba(7,26,61,0.08);border-radius:18px;padding:16px;font-weight:800;line-height:1.9;">${escapeHtml(point)}</li>`)
    .join('');
  return renderShell({
    eyebrow: route.eyebrow,
    h1: route.h1,
    leadHtml: `<p style="max-width:820px;margin:24px 0 0;color:#334155;font-size:1.05rem;line-height:2.05;font-weight:500;">${escapeHtml(route.summary)}</p>`,
    bodyHtml: `<ul style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:34px 0 0;padding:0;list-style:none;">${points}</ul>`,
    primaryHref: route.primaryHref,
    primaryLabel: route.primaryLabel,
  });
}

/** Static shell for a topical SEO landing page (summary + points + body + related). */
function renderSeoLandingFallback(page) {
  const points = page.points
    .map((point) => `<li style="background:#fff;border:1px solid rgba(7,26,61,0.08);border-radius:18px;padding:16px;font-weight:800;line-height:1.9;">${escapeHtml(point)}</li>`)
    .join('');
  const bodyParas = (page.body || [])
    .map((paragraph) => `<p style="max-width:820px;margin:18px 0 0;color:#334155;font-size:1.02rem;line-height:2.05;font-weight:500;">${escapeHtml(paragraph)}</p>`)
    .join('');
  const related = (page.related || [])
    .map((slug) => SEO_LANDING_BY_SLUG[slug])
    .filter(Boolean)
    .map((relatedPage) => `<li style="margin:6px 0;"><a href="/${relatedPage.slug}/" style="color:#008767;font-weight:800;text-decoration:none;">${escapeHtml(relatedPage.h1)}</a></li>`)
    .join('');
  const relatedBlock = related
    ? `<div style="margin:34px 0 0;"><p style="font-weight:900;margin:0 0 8px;">صفحات مرتبط</p><ul style="margin:0;padding:0 18px;">${related}</ul></div>`
    : '';
  return renderShell({
    eyebrow: page.eyebrow,
    h1: page.h1,
    leadHtml: `<p style="max-width:820px;margin:24px 0 0;color:#334155;font-size:1.05rem;line-height:2.05;font-weight:500;">${escapeHtml(page.summary)}</p>`,
    bodyHtml: `<ul style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:34px 0 0;padding:0;list-style:none;">${points}</ul>${bodyParas}${relatedBlock}`,
    primaryHref: page.primaryHref,
    primaryLabel: page.primaryLabel,
  });
}

function blogPostPath(post) {
  return BLOG_CANONICAL_OVERRIDE[post.slug] || `/blog/${post.slug}/`;
}

function renderBlogListFallback() {
  const items = knowledgeBlogPosts.map((post) => {
    const copy = post.fa;
    return `<li style="background:#fff;border:1px solid rgba(7,26,61,0.08);border-radius:18px;padding:18px;line-height:1.9;">
      <a href="${blogPostPath(post)}" style="color:#071a3d;font-weight:900;font-size:1.05rem;text-decoration:none;">${escapeHtml(copy.title)}</a>
      <p style="margin:8px 0 0;color:#334155;font-weight:500;">${escapeHtml(copy.excerpt)}</p>
    </li>`;
  }).join('');
  return renderShell({
    eyebrow: 'بلاگ تحصیل در ترکیه',
    h1: 'بلاگ آکا؛ راهنمای اقامت، پذیرش و زندگی دانشجویی در ترکیه',
    leadHtml: '<p style="max-width:820px;margin:24px 0 0;color:#334155;font-size:1.05rem;line-height:2.05;font-weight:500;">مقاله‌های داده‌محور و بازبینی‌شده آکا درباره اقامت دانشجویی، ای‌کامِت، پذیرش دانشگاه، کار دانشجویی و مسیر تحصیل در ترکیه.</p>',
    bodyHtml: `<ul style="display:grid;gap:12px;margin:34px 0 0;padding:0;list-style:none;">${items}</ul>`,
    primaryHref: '/programs/',
    primaryLabel: 'مشاهده رشته‌ها و شهریه‌ها',
  });
}

function renderBlogPostFallback(post) {
  const copy = post.fa;
  const meta = [post.category, post.date, post.readTime].filter(Boolean).map(escapeHtml).join(' · ');
  return renderShell({
    eyebrow: post.category ? escapeHtml(post.category) : 'بلاگ آکا',
    h1: copy.title,
    leadHtml: `<p style="max-width:820px;margin:18px 0 0;color:#64748b;font-weight:700;">${meta}</p>
      <p style="max-width:820px;margin:18px 0 0;color:#334155;font-size:1.05rem;line-height:2.05;font-weight:500;">${escapeHtml(copy.excerpt)}</p>`,
    bodyHtml: '<p style="margin:30px 0 0;"><a href="/blog/" style="color:#008767;font-weight:900;">→ بازگشت به همه مقاله‌های بلاگ</a></p>',
    primaryHref: '/contact/',
    primaryLabel: 'مشاوره رایگان تحصیل در ترکیه',
  });
}

function renderGlossaryListFallback() {
  const items = glossaryTerms.map((term) => `<li style="background:#fff;border:1px solid rgba(7,26,61,0.08);border-radius:16px;padding:14px;">
      <a href="/glossary/${term.slug}/" style="color:#071a3d;font-weight:800;text-decoration:none;">${escapeHtml(term.title.fa)}</a>
    </li>`).join('');
  return renderShell({
    eyebrow: 'فرهنگ‌نامه دانشجویی',
    h1: 'فرهنگ‌نامه تحصیل در ترکیه، اقامت و زندگی دانشجویی',
    leadHtml: '<p style="max-width:820px;margin:24px 0 0;color:#334155;font-size:1.05rem;line-height:2.05;font-weight:500;">توضیح ساده و کاربردی اصطلاحات اقامت، ای‌کامِت، هارچ، ثبت آدرس، کارت اقامت و خدمات دولتی ترکیه برای دانشجویان فارسی‌زبان.</p>',
    bodyHtml: `<ul style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin:34px 0 0;padding:0;list-style:none;">${items}</ul>`,
    primaryHref: '/blog/',
    primaryLabel: 'خواندن مقاله‌های بلاگ',
  });
}

function renderGlossaryTermFallback(term) {
  const related = (term.relatedPosts || []).map((post) => `<li style="margin:6px 0;"><a href="${BLOG_CANONICAL_OVERRIDE[post.slug] || `/blog/${post.slug}/`}" style="color:#008767;font-weight:800;text-decoration:none;">${escapeHtml(post.title)}</a></li>`).join('');
  const relatedBlock = related
    ? `<div style="margin:30px 0 0;"><p style="font-weight:900;margin:0 0 8px;">مقاله‌های مرتبط</p><ul style="margin:0;padding:0 18px;">${related}</ul></div>`
    : '';
  return renderShell({
    eyebrow: 'فرهنگ‌نامه آکا',
    h1: term.question.fa,
    leadHtml: `<p style="max-width:820px;margin:24px 0 0;color:#334155;font-size:1.05rem;line-height:2.05;font-weight:500;">${escapeHtml(term.summary)}</p>`,
    bodyHtml: `${relatedBlock}<p style="margin:30px 0 0;"><a href="/glossary/" style="color:#008767;font-weight:900;">→ بازگشت به فرهنگ‌نامه</a></p>`,
    primaryHref: '/contact/',
    primaryLabel: 'مشاوره رایگان تحصیل در ترکیه',
  });
}

function replaceRoot(html, fallback) {
  const openTag = '<div id="root">';
  const rootStart = html.indexOf(openTag);
  const rootOpenEnd = rootStart + openTag.length;
  const noscriptStart = html.indexOf('\n    <noscript>', rootOpenEnd);

  if (rootStart === -1 || noscriptStart === -1) {
    throw new Error('Could not locate root fallback block in dist/index.html');
  }

  return `${html.slice(0, rootOpenEnd)}\n${fallback}\n    </div>${html.slice(noscriptStart)}`;
}

function replaceHeadValue(html, pattern, replacement) {
  if (!pattern.test(html)) return html;
  return html.replace(pattern, replacement);
}

/** Replace the per-page head fields and inject one JSON-LD blob. */
function applyHead(html, { title, description, canonicalUrl, image, keywords, jsonLd }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  let next = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`)
    .replace(/<html lang="[^"]*" dir="[^"]*">/, '<html lang="fa" dir="rtl">');

  next = replaceHeadValue(next, /<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${safeDescription}" />`);
  next = replaceHeadValue(next, /<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonicalUrl}" />`);
  next = replaceHeadValue(next, /<link rel="alternate" hreflang="fa" href="[^"]*"\s*\/>/, `<link rel="alternate" hreflang="fa" href="${canonicalUrl}" />`);
  next = replaceHeadValue(next, /<link rel="alternate" hreflang="en" href="[^"]*"\s*\/>/, `<link rel="alternate" hreflang="en" href="${canonicalUrl}" />`);
  next = replaceHeadValue(next, /<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/>/, `<link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />`);
  next = replaceHeadValue(next, /<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonicalUrl}" />`);
  next = replaceHeadValue(next, /<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${safeTitle}" />`);
  next = replaceHeadValue(next, /<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${safeDescription}" />`);
  next = replaceHeadValue(next, /<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${safeTitle}" />`);
  next = replaceHeadValue(next, /<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${safeDescription}" />`);
  if (keywords) {
    next = replaceHeadValue(next, /<meta name="keywords" content="[^"]*"\s*\/>/, `<meta name="keywords" content="${escapeHtml(keywords)}" />`);
  }
  if (image) {
    next = replaceHeadValue(next, /<meta property="og:image" content="[^"]*"\s*\/>/, `<meta property="og:image" content="${escapeHtml(image)}" />`);
    next = replaceHeadValue(next, /<meta name="twitter:image" content="[^"]*"\s*\/>/, `<meta name="twitter:image" content="${escapeHtml(image)}" />`);
  }

  if (jsonLd) {
    // Same id the client's upsertJsonLd() uses, so on hydration React UPDATES
    // this node in place instead of appending a second, duplicate JSON-LD block.
    const serialized = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
    next = next.replace('</head>', `    <script type="application/ld+json" id="acca-route-structured-data">${serialized}</script>\n  </head>`);
  }
  return next;
}

function staticRouteJsonLd(route) {
  const pageUrl = `${SITE_ORIGIN}/${route.slug}/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: route.title,
    description: route.description,
    inLanguage: ['fa', 'en'],
    datePublished: route.datePublished || BUILD_DATE,
    dateModified: BUILD_DATE,
    isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
    about: { '@id': `${SITE_ORIGIN}/#organization` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'خانه', item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: route.h1, item: pageUrl },
      ],
    },
  };
}

async function writePage(relPath, html) {
  const outDir = path.join(DIST_DIR, relPath);
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'index.html'), html, 'utf8');
}

// ── Sitemap accumulation ────────────────────────────────────────────────────
const sitemapEntries = [];
function addSitemap(loc, { lastmod = BUILD_DATE, changefreq = 'weekly', priority = 0.8, alternates = true } = {}) {
  sitemapEntries.push({ loc, lastmod, changefreq, priority, alternates });
}

function buildSitemap() {
  const body = sitemapEntries.map((entry) => {
    const alt = entry.alternates
      ? `\n    <xhtml:link rel="alternate" hreflang="fa" href="${entry.loc}" />` +
        `\n    <xhtml:link rel="alternate" hreflang="en" href="${entry.loc}" />` +
        `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${entry.loc}" />`
      : '';
    return `  <url>\n    <loc>${entry.loc}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>${alt}\n  </url>`;
  }).join('\n\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n${body}\n\n</urlset>\n`;
}

// ── Main ────────────────────────────────────────────────────────────────────
const template = await readFile(INDEX_PATH, 'utf8');

// Home
addSitemap(`${SITE_ORIGIN}/`, { changefreq: 'weekly', priority: 1.0 });

// Bespoke marketing / section routes
await Promise.all(routes.map(async (route) => {
  const pageUrl = `${SITE_ORIGIN}/${route.slug}/`;
  const withHead = applyHead(template, {
    title: route.title,
    description: route.description,
    canonicalUrl: pageUrl,
    jsonLd: staticRouteJsonLd(route),
  });
  await writePage(route.slug, replaceRoot(withHead, renderStaticFallback(route)));
  addSitemap(pageUrl, { changefreq: route.changefreq || 'weekly', priority: route.priority ?? 0.8 });
}));

// Topical SEO landing pages (shared with the in-app router via seoLandingPages.js)
await Promise.all(SEO_LANDING_PAGES.map(async (page) => {
  const pageUrl = `${SITE_ORIGIN}/${page.slug}/`;
  const withHead = applyHead(template, {
    title: page.title,
    description: page.description,
    canonicalUrl: pageUrl,
    keywords: page.keywords,
    jsonLd: staticRouteJsonLd(page),
  });
  await writePage(page.slug, replaceRoot(withHead, renderSeoLandingFallback(page)));
  addSitemap(pageUrl, { changefreq: 'monthly', priority: page.priority ?? 0.6 });
}));

// Blog list
{
  const seo = getKnowledgeRouteSeo({ page: 'blog', params: new URLSearchParams(), isFa: true });
  const withHead = applyHead(template, {
    title: seo.title,
    description: seo.description,
    canonicalUrl: seo.canonicalUrl,
    image: seo.image,
    keywords: seo.keywords,
    jsonLd: seo.structuredData,
  });
  await writePage('blog', replaceRoot(withHead, renderBlogListFallback()));
  addSitemap(`${SITE_ORIGIN}/blog/`, { changefreq: 'weekly', priority: 0.92 });
}

// Blog posts
await Promise.all(knowledgeBlogPosts.map(async (post) => {
  const seo = getKnowledgeRouteSeo({ page: 'blog', params: new URLSearchParams({ post: post.slug }), isFa: true });
  const withHead = applyHead(template, {
    title: seo.title,
    description: seo.description,
    canonicalUrl: seo.canonicalUrl,
    image: seo.image,
    keywords: seo.keywords,
    jsonLd: seo.structuredData,
  });
  await writePage(`blog/${post.slug}`, replaceRoot(withHead, renderBlogPostFallback(post)));
  // Posts mirrored on a bespoke marketing URL are canonicalised there, so the
  // /blog/<slug>/ duplicate is intentionally kept OUT of the sitemap.
  if (!BLOG_CANONICAL_OVERRIDE[post.slug]) {
    addSitemap(`${SITE_ORIGIN}/blog/${post.slug}/`, { changefreq: 'monthly', priority: 0.86, lastmod: post.date || BUILD_DATE });
  }
}));

// Glossary list
{
  const seo = getKnowledgeRouteSeo({ page: 'glossary', params: new URLSearchParams(), isFa: true });
  const withHead = applyHead(template, {
    title: seo.title,
    description: seo.description,
    canonicalUrl: seo.canonicalUrl,
    image: seo.image,
    keywords: seo.keywords,
    jsonLd: seo.structuredData,
  });
  await writePage('glossary', replaceRoot(withHead, renderGlossaryListFallback()));
  addSitemap(`${SITE_ORIGIN}/glossary/`, { changefreq: 'weekly', priority: 0.9 });
}

// Glossary terms
await Promise.all(glossaryTerms.map(async (term) => {
  const seo = getKnowledgeRouteSeo({ page: 'glossary', params: new URLSearchParams({ term: term.slug }), isFa: true });
  const withHead = applyHead(template, {
    title: seo.title,
    description: seo.description,
    canonicalUrl: seo.canonicalUrl,
    image: seo.image,
    keywords: seo.keywords,
    jsonLd: seo.structuredData,
  });
  await writePage(`glossary/${term.slug}`, replaceRoot(withHead, renderGlossaryTermFallback(term)));
  addSitemap(`${SITE_ORIGIN}/glossary/${term.slug}/`, { changefreq: 'monthly', priority: 0.84 });
}));

// Sitemap (overwrites the copy Vite emitted from public/)
await writeFile(path.join(DIST_DIR, 'sitemap.xml'), buildSitemap(), 'utf8');

const totalPages = routes.length + SEO_LANDING_PAGES.length + 2 + knowledgeBlogPosts.length + glossaryTerms.length;
console.log(`Prerendered ${totalPages} static SEO pages + sitemap (${sitemapEntries.length} URLs).`);
