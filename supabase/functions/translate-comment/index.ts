import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPPORTED_LANGUAGES = new Set(["fa", "en", "tr"]);
const MAX_TEXT_LENGTH = 2000;
const PROVIDER_TIMEOUT_MS = 8000;
const ALLOWED_ORIGINS = new Set([
  "https://accaco.com",
  "https://www.accaco.com",
]);

function isAllowedOrigin(origin: string | null) {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.has(origin)) return true;

  try {
    const url = new URL(origin);
    return (
      (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      (url.protocol === "http:" || url.protocol === "https:")
    );
  } catch {
    return false;
  }
}

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin && isAllowedOrigin(origin) ? origin : "https://www.accaco.com",
    "Access-Control-Allow-Headers": "apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function jsonResponse(body: Record<string, unknown>, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function getPublishableKeys() {
  const keys = new Set<string>();
  const configuredKeys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");

  if (configuredKeys) {
    try {
      const parsed = JSON.parse(configuredKeys) as Record<string, string>;
      Object.values(parsed).forEach((key) => {
        if (typeof key === "string" && key) keys.add(key);
      });
    } catch {
      // The function remains closed if the platform key configuration is invalid.
    }
  }

  const legacyAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (legacyAnonKey) keys.add(legacyAnonKey);
  return keys;
}

function detectLanguage(text: string) {
  if (/[\u0600-\u06ff\u0750-\u077f\ufb50-\ufdff\ufe70-\ufefc]/u.test(text)) return "fa";
  if (/[ğĞıİşŞçÇöÖüÜ]/u.test(text)) return "tr";
  return "en";
}

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    return await fetch(url, {
      headers: { "User-Agent": "ACCA-EDU-Translation/1.0" },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function translateWithGoogle(text: string, target: string) {
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx" +
    `&sl=auto&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetchWithTimeout(url);
  if (!response.ok) throw new Error(`Google translation failed: ${response.status}`);

  const data = await response.json();
  const translated = Array.isArray(data?.[0])
    ? data[0].map((segment: unknown[]) => Array.isArray(segment) ? segment[0] || "" : "").join("")
    : "";

  if (!translated.trim()) throw new Error("Google returned an empty translation");
  return translated.trim();
}

async function translateWithMyMemory(text: string, source: string, target: string) {
  const url =
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}` +
    `&langpair=${encodeURIComponent(source)}|${encodeURIComponent(target)}`;
  const response = await fetchWithTimeout(url);
  if (!response.ok) throw new Error(`MyMemory translation failed: ${response.status}`);

  const data = await response.json();
  const translated = data?.responseData?.translatedText;
  if (
    typeof translated !== "string" ||
    !translated.trim() ||
    /MYMEMORY WARNING|INVALID|QUERY LENGTH LIMIT/i.test(translated)
  ) {
    throw new Error("MyMemory returned an invalid translation");
  }
  return translated.trim();
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin");

  if (!isAllowedOrigin(origin)) {
    return jsonResponse({ error: "Origin is not allowed" }, 403, origin);
  }

  if (request.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders(origin) });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405, origin);
  }

  const requestApiKey = request.headers.get("apikey") || "";
  if (!requestApiKey || !getPublishableKeys().has(requestApiKey)) {
    return jsonResponse({ error: "Unauthorized" }, 401, origin);
  }

  let payload: { text?: unknown; target?: unknown; source?: unknown };
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400, origin);
  }

  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  const target = typeof payload.target === "string" ? payload.target : "";
  const requestedSource = typeof payload.source === "string" ? payload.source : "";

  if (!text) return jsonResponse({ error: "Text is required" }, 400, origin);
  if (text.length > MAX_TEXT_LENGTH) {
    return jsonResponse({ error: `Text must be ${MAX_TEXT_LENGTH} characters or fewer` }, 413, origin);
  }
  if (!SUPPORTED_LANGUAGES.has(target)) {
    return jsonResponse({ error: "Unsupported target language" }, 400, origin);
  }

  const source = SUPPORTED_LANGUAGES.has(requestedSource)
    ? requestedSource
    : detectLanguage(text);
  if (source === target) {
    return jsonResponse({ translatedText: text, source, provider: "none" }, 200, origin);
  }

  try {
    const translatedText = await translateWithGoogle(text, target);
    return jsonResponse({ translatedText, source, provider: "google" }, 200, origin);
  } catch (googleError) {
    try {
      const translatedText = await translateWithMyMemory(text, source, target);
      return jsonResponse({ translatedText, source, provider: "mymemory" }, 200, origin);
    } catch (myMemoryError) {
      console.error("Translation providers failed", {
        google: googleError instanceof Error ? googleError.message : String(googleError),
        myMemory: myMemoryError instanceof Error ? myMemoryError.message : String(myMemoryError),
      });
      return jsonResponse({ error: "Translation is temporarily unavailable" }, 502, origin);
    }
  }
});
