import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE_ORIGIN = 'https://www.accaco.com';
const DIST_DIR = path.resolve('dist');
const INDEX_PATH = path.join(DIST_DIR, 'index.html');
const LOGO_SRC = '/assets/optimized/acca-logo-320.webp';
const WHATSAPP_URL = 'https://wa.me/905354585440';

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

function renderStaticFallback(route) {
  const points = route.points
    .map((point) => `<li style="background:#fff;border:1px solid rgba(7,26,61,0.08);border-radius:18px;padding:16px;font-weight:800;line-height:1.9;">${escapeHtml(point)}</li>`)
    .join('');

  return `      <main style="font-family: Vazirmatn, sans-serif; direction: rtl; min-height: 100vh; background: #f7f1e8; color: #071a3d;">
        <section style="max-width: 1120px; margin: 0 auto; padding: 72px 24px 48px;">
          <a href="/" aria-label="ACCA EDU" style="display:inline-flex;align-items:center;gap:12px;text-decoration:none;color:inherit;font-weight:900;">
            <img src="${LOGO_SRC}" alt="ACCA EDU" width="132" height="57" style="width:132px;height:57px;object-fit:contain;" />
          </a>
          <p style="margin:40px 0 12px;color:#008767;font-weight:900;">${escapeHtml(route.eyebrow)}</p>
          <h1 style="max-width:860px;margin:0;font-size:clamp(2rem,6vw,4rem);line-height:1.2;font-weight:950;">${escapeHtml(route.h1)}</h1>
          <p style="max-width:820px;margin:24px 0 0;color:#334155;font-size:1.05rem;line-height:2.05;font-weight:500;">${escapeHtml(route.summary)}</p>
          <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:28px;">
            <a href="${escapeHtml(route.primaryHref)}" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 24px;border-radius:999px;background:#008767;color:#fff;text-decoration:none;font-weight:900;">${escapeHtml(route.primaryLabel)}</a>
            <a href="${WHATSAPP_URL}" style="display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 24px;border-radius:999px;background:#fff;color:#071a3d;text-decoration:none;font-weight:900;border:1px solid rgba(7,26,61,0.10);">ارتباط از طریق واتساپ</a>
          </div>
          <nav aria-label="لینک‌های مهم ACCA EDU" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:30px;">
            <a href="/study-in-turkey/" style="color:#071a3d;font-weight:800;">تحصیل در ترکیه</a>
            <a href="/universities/" style="color:#071a3d;font-weight:800;">دانشگاه‌ها</a>
            <a href="/programs/" style="color:#071a3d;font-weight:800;">رشته‌ها و شهریه‌ها</a>
            <a href="/residence-permit/" style="color:#071a3d;font-weight:800;">اقامت دانشجویی</a>
            <a href="/accommodation/" style="color:#071a3d;font-weight:800;">اسکان و ثبت آدرس</a>
            <a href="/contact/" style="color:#071a3d;font-weight:800;">تماس</a>
          </nav>
          <ul style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:34px 0 0;padding:0;list-style:none;">
            ${points}
          </ul>
        </section>
      </main>`;
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

function applyRouteHead(html, route) {
  const pageUrl = `${SITE_ORIGIN}/${route.slug}/`;
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: route.title,
    description: route.description,
    inLanguage: ['fa', 'en'],
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

  let next = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<html lang="[^"]*" dir="[^"]*">/, '<html lang="fa" dir="rtl">');

  next = replaceHeadValue(next, /<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`);
  next = replaceHeadValue(next, /<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${pageUrl}" />`);
  next = replaceHeadValue(next, /<link rel="alternate" hreflang="fa" href="[^"]*"\s*\/>/, `<link rel="alternate" hreflang="fa" href="${pageUrl}" />`);
  next = replaceHeadValue(next, /<link rel="alternate" hreflang="en" href="[^"]*"\s*\/>/, `<link rel="alternate" hreflang="en" href="${pageUrl}" />`);
  next = replaceHeadValue(next, /<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/>/, `<link rel="alternate" hreflang="x-default" href="${pageUrl}" />`);
  next = replaceHeadValue(next, /<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${pageUrl}" />`);
  next = replaceHeadValue(next, /<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`);
  next = replaceHeadValue(next, /<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${description}" />`);
  next = replaceHeadValue(next, /<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${title}" />`);
  next = replaceHeadValue(next, /<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${description}" />`);

  return next.replace(
    '</head>',
    `    <script type="application/ld+json" id="acca-static-route-jsonld">${JSON.stringify(jsonLd)}</script>\n  </head>`
  );
}

async function writeStaticRoute(template, route) {
  const html = replaceRoot(applyRouteHead(template, route), renderStaticFallback(route));
  const outDir = path.join(DIST_DIR, route.slug);
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'index.html'), html, 'utf8');
}

const template = await readFile(INDEX_PATH, 'utf8');
await Promise.all(routes.map((route) => writeStaticRoute(template, route)));

console.log(`Prerendered ${routes.length} static SEO pages.`);
