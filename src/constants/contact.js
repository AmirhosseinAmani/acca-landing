export const COMPANY_PHONE_DISPLAY = '+90 535 458 54 40';
export const COMPANY_WHATSAPP_URL = 'https://wa.me/905354585440';
export const COMPANY_WEBSITE_URL = 'https://www.accaco.com';
export const COMPANY_INSTAGRAM_URL = 'https://www.instagram.com/acca_edu/';
export const COMPANY_OFFICE_ADDRESS =
  'NAMIK KEMAL MAH. 68. SK. TERRACE LOTUS NO:110 Kat:25 ESENYURT / ISTANBUL';
export const COMPANY_OFFICE_LAT = '41.0052';
export const COMPANY_OFFICE_LNG = '28.6849825';
export const COMPANY_MAP_COORDINATES = `${COMPANY_OFFICE_LAT},${COMPANY_OFFICE_LNG}`;
export const COMPANY_GOOGLE_BUSINESS_QUERY =
  'Acca+edu+international+%7C+%D8%AA%D8%AD%D8%B5%DB%8C%D9%84+%D8%AF%D8%B1+%D8%AA%D8%B1%DA%A9%DB%8C%D9%87';
/**
 * Direct deep-link to the ACCA EDU Google Business Profile (works as <a href>).
 * Short Google Maps links do NOT work inside <iframe> — see COMPANY_MAP_EMBED_URL.
 */
export const COMPANY_MAPS_URL = 'https://maps.app.goo.gl/p2UDh4TuAd5gMckN7';

/**
 * Google Maps embed URL (no API key required).
 * Uses the business-name + location query so the iframe renders the actual
 * Google Business Profile card rather than a bare satellite pin.
 * Fallback coords are passed via &ll= so Google centres on the right building
 * even if the name query is ambiguous.
 */
export const COMPANY_MAP_EMBED_URL =
  `https://www.google.com/maps?q=${COMPANY_GOOGLE_BUSINESS_QUERY}` +
  `&ll=${COMPANY_MAP_COORDINATES}&z=19&t=m&output=embed`;

/* ------------------------------------------------------------------ *
 * Social & messaging channels — single source of truth.
 * Header, contact section and the floating buttons all import from here,
 * so a link is changed in exactly one place. Do NOT hardcode links in
 * components. Add real links only — leave empty + TODO if unknown.
 * ------------------------------------------------------------------ */

// Official Telegram channel.
export const COMPANY_TELEGRAM_URL = 'https://t.me/Acca_edu_tr';

// Primary contact email (kept as raw value + ready-to-use mailto link).
export const COMPANY_EMAIL = 'arshia@accaco.com';
export const COMPANY_EMAIL_URL = `mailto:${COMPANY_EMAIL}`;

// Secondary brand domain (credit-transfer service).
export const COMPANY_TRANSFER_WEBSITE_URL = 'https://www.accatransfer.com';

// TODO(acca-links): the official ACCA EDU LinkedIn company URL was not found
// in the codebase or site content. The brand name is "ACCA EDU". Once the real
// linkedin.com/company/<slug> URL is confirmed, set it here and it will appear
// automatically in the contact section. Empty string = hidden (never invented).
export const COMPANY_LINKEDIN_URL = '';
