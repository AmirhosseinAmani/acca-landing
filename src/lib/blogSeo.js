import { BLOG_SEO_KEYWORDS, getBlogPostBySlug, knowledgeBlogPosts } from '../data/knowledgeBlogPosts';

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

export function getBlogRouteSeo({ params, isFa }) {
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
