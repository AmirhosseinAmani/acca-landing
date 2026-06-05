import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../constants/supabase';

/* ============================================================================
 * Community layer — ratings + comments for blog articles & glossary terms.
 *
 * Source of truth is Supabase (see supabase/acca_community.sql). Until those
 * tables exist (or if the network fails) everything degrades to localStorage,
 * so the UI always works and a visitor's own submissions persist locally.
 * Remote + local are merged and de-duplicated by `client_id` / `voter_id`.
 * ========================================================================== */

const REST = `${SUPABASE_URL}/rest/v1`;
const HEADERS = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
  'Content-Type': 'application/json',
};

const LS = {
  cid: 'acca:cid',
  comments: 'acca:comments',
  ratings: 'acca:ratings', // { 'type:slug': stars }
};

const entityKey = (type, slug) => `${type}:${slug}`;

export function uuid() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function readJSON(key, fallback) {
  try {
    return JSON.parse(window.localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode) — non-fatal */
  }
}

/** Persistent per-browser id used to keep one rating per visitor per entity. */
export function voterId() {
  let id = null;
  try {
    id = window.localStorage.getItem(LS.cid);
  } catch {
    /* ignore */
  }
  if (!id) {
    id = uuid();
    try {
      window.localStorage.setItem(LS.cid, id);
    } catch {
      /* ignore */
    }
  }
  return id;
}

const localComments = () => readJSON(LS.comments, []);
const localRatings = () => readJSON(LS.ratings, {});

async function supaGet(path) {
  const res = await fetch(`${REST}/${path}`, { headers: HEADERS });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function supaInsert(table, body, extraHeaders = {}) {
  const res = await fetch(`${REST}/${table}`, {
    method: 'POST',
    headers: { ...HEADERS, Prefer: 'return=minimal', ...extraHeaders },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return true;
}

/* ----------------------------- Comments ---------------------------------- */

export async function fetchComments(entityType, entitySlug) {
  const remote = await supaGet(
    `acca_comments?entity_type=eq.${entityType}&entity_slug=eq.${encodeURIComponent(entitySlug)}&order=created_at.desc&select=*`
  ).catch(() => []);
  const remoteIds = new Set(remote.map((c) => c.client_id));
  const local = localComments().filter(
    (c) => c.entity_type === entityType && c.entity_slug === entitySlug && !remoteIds.has(c.client_id)
  );
  return [...remote, ...local].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function submitComment(entityType, entitySlug, fields) {
  const comment = {
    client_id: uuid(),
    entity_type: entityType,
    entity_slug: entitySlug,
    name: fields.name.trim(),
    email: fields.email.trim(),
    role: fields.role || null,
    location: fields.location || null,
    body: fields.body.trim(),
    lang: detectLang(fields.body),
    created_at: new Date().toISOString(),
  };

  // Optimistic local persistence first so the UI is instant + survives reload.
  writeJSON(LS.comments, [comment, ...localComments()].slice(0, 1000));

  try {
    await supaInsert('acca_comments', comment);
  } catch {
    // Remote not ready yet — local copy keeps the comment visible for this browser.
  }
  return comment;
}

/* ------------------------------ Ratings ---------------------------------- */

export async function fetchRating(entityType, entitySlug) {
  const rows = await supaGet(
    `acca_ratings?entity_type=eq.${entityType}&entity_slug=eq.${encodeURIComponent(entitySlug)}&select=stars,voter_id`
  ).catch(() => []);
  let sum = rows.reduce((s, r) => s + r.stars, 0);
  let count = rows.length;
  const mine = localRatings()[entityKey(entityType, entitySlug)] || 0;
  // Fold in the visitor's own vote (so the average reflects it before Supabase
  // sync), unless it is already counted in the remote rows for this voter.
  if (mine && !rows.some((r) => r.voter_id === voterId())) {
    sum += mine;
    count += 1;
  }
  const avg = count ? sum / count : 0;
  return { avg, count, mine };
}

export async function submitRating(entityType, entitySlug, stars) {
  const ratings = localRatings();
  ratings[entityKey(entityType, entitySlug)] = stars;
  writeJSON(LS.ratings, ratings);

  try {
    await supaInsert(
      'acca_ratings?on_conflict=voter_id,entity_type,entity_slug',
      { voter_id: voterId(), entity_type: entityType, entity_slug: entitySlug, stars, updated_at: new Date().toISOString() },
      { Prefer: 'resolution=merge-duplicates,return=minimal' }
    );
  } catch {
    // Remote not ready — local copy keeps the visitor's own rating.
  }
  return stars;
}

/* ----------------- Aggregates (for popularity sorting) ------------------- */

/** Returns a map keyed by `type:slug` → { avg, ratingCount, commentCount }. */
export async function fetchCommunityStats() {
  const [ratings, comments] = await Promise.all([
    supaGet('acca_ratings?select=entity_type,entity_slug,stars,voter_id').catch(() => []),
    supaGet('acca_comments?select=entity_type,entity_slug,client_id').catch(() => []),
  ]);

  const stats = {};
  const bucket = (k) => (stats[k] ??= { sum: 0, ratingCount: 0, commentCount: 0, voters: new Set() });

  ratings.forEach((r) => {
    const b = bucket(entityKey(r.entity_type, r.entity_slug));
    b.sum += r.stars;
    b.ratingCount += 1;
    if (r.voter_id) b.voters.add(r.voter_id);
  });

  // Fold in this browser's own ratings so the average shows before Supabase is
  // wired and reflects the visitor's vote — skipping any already counted
  // remotely for this voter so the same vote is never double-counted.
  const myVoter = voterId();
  Object.entries(localRatings()).forEach(([key, stars]) => {
    const b = bucket(key);
    if (!b.voters.has(myVoter)) {
      b.sum += Number(stars) || 0;
      b.ratingCount += 1;
      b.voters.add(myVoter);
    }
  });

  const remoteCommentIds = new Set(comments.map((c) => c.client_id));
  comments.forEach((c) => {
    bucket(entityKey(c.entity_type, c.entity_slug)).commentCount += 1;
  });
  // Fold in this browser's local-only comments so counts feel live pre-sync.
  localComments().forEach((c) => {
    if (!remoteCommentIds.has(c.client_id)) {
      bucket(entityKey(c.entity_type, c.entity_slug)).commentCount += 1;
    }
  });

  const out = {};
  Object.entries(stats).forEach(([key, b]) => {
    out[key] = {
      avg: b.ratingCount ? b.sum / b.ratingCount : 0,
      ratingCount: b.ratingCount,
      commentCount: b.commentCount,
    };
  });
  return out;
}

export function statKey(entityType, entitySlug) {
  return entityKey(entityType, entitySlug);
}

/** Popularity score: rating leads, comments + votes add weight. */
export function popularityScore(stat) {
  if (!stat) return 0;
  return stat.avg * 10 + stat.commentCount * 2 + stat.ratingCount;
}

/* ---------------------------- Translation -------------------------------- */

export const TRANSLATE_LANGS = [
  { code: 'fa', label: 'فارسی' },
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
];

/** Best-effort client-side language detection (fa / tr / en).
 *  Used for the UI hint and for the fallback provider; the primary provider
 *  detects the source itself, so this only needs to be good, not perfect. */
export function detectLang(text) {
  const t = text || '';
  // Persian / Arabic script. This audience is Persian-first, so any
  // Arabic-script run is treated as Persian.
  if (/[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-ﻼ]/.test(t)) return 'fa';
  // Turkish-specific Latin letters (dotless i, İ, ğ, ş).
  if (/[ğĞışŞİ]/.test(t)) return 'tr';
  return 'en';
}

/**
 * Smart, reliable comment translation (TR / FA / EN).
 *  1. Primary — Google's free endpoint with automatic source detection
 *     (`sl=auto`). High quality for Persian/Turkish/English, no API key.
 *  2. Fallback — MyMemory, with client-side source detection.
 * Resolves to the translated string, or throws so the UI can show a graceful
 * "translation failed" state. Callers only depend on (text, target) → string.
 */
export async function translateText(text, target) {
  const clean = (text || '').trim();
  if (!clean) return '';

  // 1) Google Translate (gtx) — detects the source server-side, so a Persian,
  //    Turkish or English comment is translated correctly without us guessing.
  try {
    const url =
      'https://translate.googleapis.com/translate_a/single?client=gtx' +
      `&sl=auto&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(clean)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const out = Array.isArray(data?.[0])
        ? data[0].map((seg) => (Array.isArray(seg) ? seg[0] : '')).join('')
        : '';
      if (out && out.trim()) return out;
    }
  } catch {
    /* network / CORS hiccup — fall through to the secondary provider */
  }

  // 2) MyMemory fallback.
  const source = detectLang(clean);
  if (source === target) return clean;
  const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=${source}|${target}`;
  const mmRes = await fetch(mmUrl);
  if (!mmRes.ok) throw new Error('translate request failed');
  const mmData = await mmRes.json();
  const translated = mmData?.responseData?.translatedText;
  if (!translated || /MYMEMORY WARNING|INVALID|QUERY LENGTH LIMIT/i.test(translated)) {
    throw new Error('translation unavailable');
  }
  return translated;
}
