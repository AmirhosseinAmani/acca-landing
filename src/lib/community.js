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
const FUNCTIONS = `${SUPABASE_URL}/functions/v1`;
const HEADERS = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
  'Content-Type': 'application/json',
};
const FUNCTION_HEADERS = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  'Content-Type': 'application/json',
};

const LS = {
  cid: 'acca:cid',
  comments: 'acca:comments',
  ratings: 'acca:ratings', // { 'type:slug': stars }
};

const entityKey = (type, slug) => `${type}:${slug}`;
const PUBLIC_COMMENT_FIELDS = 'client_id,entity_type,entity_slug,name,role,location,body,lang,created_at';

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
    `acca_comments?entity_type=eq.${entityType}&entity_slug=eq.${encodeURIComponent(entitySlug)}&order=created_at.desc&select=${PUBLIC_COMMENT_FIELDS}`
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
    `acca_ratings?entity_type=eq.${entityType}&entity_slug=eq.${encodeURIComponent(entitySlug)}&select=stars`
  ).catch(() => []);
  let sum = rows.reduce((s, r) => s + r.stars, 0);
  let count = rows.length;
  const mine = localRatings()[entityKey(entityType, entitySlug)] || 0;
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
    supaGet('acca_ratings?select=entity_type,entity_slug,stars').catch(() => []),
    supaGet('acca_comments?select=entity_type,entity_slug,client_id').catch(() => []),
  ]);

  const stats = {};
  const bucket = (k) => (stats[k] ??= { sum: 0, ratingCount: 0, commentCount: 0 });

  ratings.forEach((r) => {
    const b = bucket(entityKey(r.entity_type, r.entity_slug));
    b.sum += r.stars;
    b.ratingCount += 1;
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

export async function translateText(text, target) {
  const clean = (text || '').trim();
  if (!clean) return '';

  if (!TRANSLATE_LANGS.some((language) => language.code === target)) {
    throw new Error('unsupported translation language');
  }

  const source = detectLang(clean);
  if (source === target) return clean;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${FUNCTIONS}/translate-comment`, {
      method: 'POST',
      headers: FUNCTION_HEADERS,
      body: JSON.stringify({ text: clean, target, source }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.translatedText?.trim()) {
      throw new Error(data?.error || 'translation unavailable');
    }

    return data.translatedText.trim();
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('translation timed out', { cause: error });
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
