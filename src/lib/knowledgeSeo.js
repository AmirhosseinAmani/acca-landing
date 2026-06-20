import { BLOG_SEO_KEYWORDS, getBlogPostBySlug, knowledgeBlogPosts } from '../data/knowledgeBlogPosts';
import { getGlossaryTermBySlug, glossaryTerms } from '../data/knowledgeGlossary';

/* ============================================================================
 * Knowledge (blog + glossary) SEO / JSON-LD.
 *
 * This module is DYNAMICALLY imported by App.jsx only on the blog/glossary
 * routes, so the large blog (~110KB) + glossary (~140KB) datasets — needed only
 * to build structured data — stay OUT of the main bundle that loads on every
 * page (home, universities, programs, scholarships). Output is identical to the
 * previous inline implementation.
 *
 * Brand constants mirror App.jsx; kept local so this stays lazy-loadable.
 * ========================================================================== */

const SITE_CANONICAL_ORIGIN = 'https://www.accaco.com';
const BRAND_NAME = 'ACCA EDU';
const BRAND_TITLE = `${BRAND_NAME} — Study in Turkey & International Student Placement`;
const ACCA_LOGO_SRC =
  'https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/a/Asset%20171.png';

function toAbsoluteAssetUrl(src) {
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  return `${SITE_CANONICAL_ORIGIN}${src.startsWith('/') ? src : `/${src}`}`;
}

function buildBlogAuthorJsonLd(post) {
  if (!post.author?.name) {
    return {
      '@type': 'Organization',
      name: BRAND_NAME,
      url: SITE_CANONICAL_ORIGIN,
    };
  }

  return {
    '@type': 'Person',
    name: post.author.name,
    jobTitle: post.author.role?.en || post.author.role?.fa || post.author.role,
    image: post.author.image ? toAbsoluteAssetUrl(post.author.image) : undefined,
    worksFor: {
      '@type': 'Organization',
      name: BRAND_NAME,
      url: SITE_CANONICAL_ORIGIN,
    },
  };
}

function buildBlogJsonLd(url, isFa) {
  const posts = knowledgeBlogPosts.map((post, index) => {
    const copy = isFa ? post.fa : post.en;
    return {
      '@type': 'BlogPosting',
      position: index + 1,
      headline: copy.title,
      description: copy.excerpt,
      datePublished: post.date,
      dateModified: post.date,
      inLanguage: isFa ? 'fa-IR' : 'en-US',
      url: `${SITE_CANONICAL_ORIGIN}/blog/${post.slug}/`,
      mainEntityOfPage: `${SITE_CANONICAL_ORIGIN}/blog/${post.slug}/`,
      image: toAbsoluteAssetUrl(post.image.src),
      about: post.tags,
      citation: post.sourceUrl,
      author: buildBlogAuthorJsonLd(post),
      publisher: {
        '@type': 'Organization',
        name: BRAND_NAME,
        url: SITE_CANONICAL_ORIGIN,
        logo: {
          '@type': 'ImageObject',
          url: ACCA_LOGO_SRC,
        },
      },
    };
  });

  const faqItems = knowledgeBlogPosts.flatMap((post) => {
    const copy = isFa ? post.fa : post.en;
    return copy.faq.slice(0, 2).map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    }));
  });

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        name: isFa ? 'بلاگ آکا برای تحصیل در ترکیه' : 'ACCA Study in Turkey Blog',
        url,
        inLanguage: isFa ? 'fa-IR' : 'en-US',
        description: isFa
          ? 'مقاله‌های داده‌محور ACCA EDU درباره تحصیل در ترکیه، اقامت دانشجویی، پذیرش و خدمات دانشجویان بین‌المللی.'
          : 'Data-led ACCA EDU guides about study in Turkey, student residence, admission and international student services.',
        publisher: {
          '@type': 'Organization',
          name: BRAND_NAME,
          url: SITE_CANONICAL_ORIGIN,
        },
      },
      {
        '@type': 'ItemList',
        name: isFa ? 'مقاله‌های منتخب نالج‌بانک ACCA' : 'Selected ACCA Knowledge Bank articles',
        url,
        itemListElement: posts.map((post, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: post.url,
          name: post.headline,
        })),
      },
      ...posts,
      {
        '@type': 'FAQPage',
        mainEntity: faqItems,
      },
    ],
  };
}

function buildArticleJsonLd(post, url, isFa) {
  const copy = isFa ? post.fa : post.en;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: copy.title,
        description: copy.excerpt,
        datePublished: post.date,
        dateModified: post.date,
        inLanguage: isFa ? 'fa-IR' : 'en-US',
        url,
        mainEntityOfPage: url,
        image: toAbsoluteAssetUrl(post.image.src),
        about: post.tags,
        articleSection: post.category,
        citation: post.sourceUrl,
        author: buildBlogAuthorJsonLd(post),
        publisher: {
          '@type': 'Organization',
          name: BRAND_NAME,
          url: SITE_CANONICAL_ORIGIN,
          logo: {
            '@type': 'ImageObject',
            url: ACCA_LOGO_SRC,
          },
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: copy.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: isFa ? 'بلاگ آکا' : 'ACCA Blog',
            item: `${SITE_CANONICAL_ORIGIN}/blog/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: copy.title,
            item: url,
          },
        ],
      },
    ],
  };
}

function buildGlossarySetJsonLd(url, isFa) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTermSet',
        name: isFa ? 'فرهنگ‌نامه تحصیل در ترکیه آکا' : 'ACCA Study in Turkey Glossary',
        url,
        inLanguage: isFa ? 'fa-IR' : 'en-US',
        description: isFa
          ? 'واژه‌نامه توضیح اصطلاحات اقامت، تحصیل و زندگی دانشجویی در ترکیه برای دانشجویان فارسی‌زبان.'
          : 'Glossary for study, residence and student life terms in Turkey.',
        hasDefinedTerm: glossaryTerms.map((term) => ({
          '@type': 'DefinedTerm',
          name: term.title.fa,
          termCode: term.slug,
          description: term.summary,
          url: `${SITE_CANONICAL_ORIGIN}/glossary/${term.slug}/`,
          image: term.visual?.src ? toAbsoluteAssetUrl(term.visual.src) : undefined,
        })),
      },
      {
        '@type': 'ItemList',
        name: isFa ? 'اصطلاحات فرهنگ‌نامه آکا' : 'ACCA glossary terms',
        url,
        itemListElement: glossaryTerms.map((term, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: term.title.fa,
          url: `${SITE_CANONICAL_ORIGIN}/glossary/${term.slug}/`,
        })),
      },
    ],
  };
}

function buildGlossaryTermJsonLd(term, url, isFa) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTerm',
        name: term.title.fa,
        termCode: term.slug,
        description: term.summary,
        inDefinedTermSet: `${SITE_CANONICAL_ORIGIN}/glossary/`,
        url,
        image: term.visual?.src ? toAbsoluteAssetUrl(term.visual.src) : undefined,
      },
      {
        '@type': 'Article',
        headline: term.question.fa,
        description: term.summary,
        inLanguage: isFa ? 'fa-IR' : 'en-US',
        datePublished: '2026-06-05',
        dateModified: '2026-06-05',
        url,
        mainEntityOfPage: url,
        image: term.visual?.src ? toAbsoluteAssetUrl(term.visual.src) : undefined,
        author: {
          '@type': 'Organization',
          name: BRAND_NAME,
          url: SITE_CANONICAL_ORIGIN,
        },
        publisher: {
          '@type': 'Organization',
          name: BRAND_NAME,
          url: SITE_CANONICAL_ORIGIN,
          logo: {
            '@type': 'ImageObject',
            url: ACCA_LOGO_SRC,
          },
        },
        about: term.labels,
      },
      {
        '@type': 'FAQPage',
        mainEntity: term.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: isFa ? 'فرهنگ‌نامه آکا' : 'ACCA glossary',
            item: `${SITE_CANONICAL_ORIGIN}/glossary/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: term.title.fa,
            item: url,
          },
        ],
      },
    ],
  };
}

/** Rich SEO for the blog + glossary routes. Returns null for other pages. */
export function getKnowledgeRouteSeo({ page, params, isFa }) {
  if (page === 'glossary') {
    const term = getGlossaryTermBySlug(params.get('term'));
    const canonicalUrl = term
      ? `${SITE_CANONICAL_ORIGIN}/glossary/${term.slug}/`
      : `${SITE_CANONICAL_ORIGIN}/glossary/`;
    return {
      title: term
        ? `${term.question.fa} | فرهنگ‌نامه تحصیل در ترکیه آکا | ${BRAND_TITLE}`
        : `فرهنگ‌نامه تحصیل در ترکیه، اقامت و زندگی دانشجویی | ${BRAND_TITLE}`,
      description: term
        ? `${term.summary} راهنمای ساده و کاربردی آکا برای دانشجویان فارسی‌زبان متقاضی تحصیل در ترکیه.`
        : 'فرهنگ‌نامه آکا برای توضیح ساده اصطلاحات تحصیل در ترکیه، اقامت دانشجویی، ای‌کامِت، هارچ، ثبت آدرس، کارت اقامت و خدمات دولتی ترکیه.',
      canonicalUrl,
      shouldIndex: true,
      image: term?.visual?.src ? toAbsoluteAssetUrl(term.visual.src) : undefined,
      keywords: [
        'فرهنگ نامه تحصیل در ترکیه',
        'واژه نامه اقامت ترکیه',
        'اصطلاحات اقامت دانشجویی',
        'تحصیل در ترکیه',
        'اقامت دانشجویی ترکیه',
        ...(term ? [term.title.fa, term.question.fa, ...term.labels] : glossaryTerms.map((item) => item.title.fa)),
      ].join(', '),
      structuredData: term
        ? buildGlossaryTermJsonLd(term, canonicalUrl, isFa)
        : buildGlossarySetJsonLd(canonicalUrl, isFa),
    };
  }

  if (page === 'blog') {
    const post = getBlogPostBySlug(params.get('post'));
    if (post) {
      const copy = isFa ? post.fa : post.en;
      const canonicalUrl = `${SITE_CANONICAL_ORIGIN}/blog/${post.slug}/`;
      return {
        title: `${copy.title} | ${BRAND_TITLE}`,
        description: copy.excerpt,
        canonicalUrl,
        shouldIndex: true,
        keywords: [...post.tags, post.category, isFa ? 'تحصیل در ترکیه' : 'study in Turkey', BRAND_NAME].join(', '),
        image: toAbsoluteAssetUrl(post.image.src),
        structuredData: buildArticleJsonLd(post, canonicalUrl, isFa),
      };
    }

    const canonicalUrl = `${SITE_CANONICAL_ORIGIN}/blog/`;
    return {
      title: isFa
        ? `بلاگ تحصیل در ترکیه، اقامت دانشجویی و پذیرش | ${BRAND_TITLE}`
        : `Study in Turkey Blog: Admission, Residence & Student Guides | ${BRAND_TITLE}`,
      description: isFa
        ? 'بلاگ راهنمای آکا برای دانشجویان بین‌المللی: اقامت دانشجویی ترکیه، ای‌کامِت، هزینه اقامت، هارچ، دولت الکترونیک ترکیه، ثبت آدرس، پذیرش دانشگاه و مسیرهای تحصیل در ترکیه.'
        : 'ACCA EDU data-led blog for international students: Turkey student residence, e-İkamet, residence fees, e-Devlet, address registration, university admission and study-in-Turkey guidance.',
      canonicalUrl,
      shouldIndex: true,
      keywords: BLOG_SEO_KEYWORDS,
      image: toAbsoluteAssetUrl(knowledgeBlogPosts[0].image.src),
      structuredData: buildBlogJsonLd(canonicalUrl, isFa),
    };
  }

  return null;
}
