export const COMPANY_PHONE_DISPLAY = '+90 536 273 61 51';
export const COMPANY_WHATSAPP_URL = 'https://wa.me/905362736151';
export const COMPANY_WEBSITE_URL = 'https://accaco.com';
export const COMPANY_INSTAGRAM_URL = 'https://www.instagram.com/acca_edu/';
export const COMPANY_OFFICE_ADDRESS =
  'NAMIK KEMAL MAH. 68. SK. TERRACE LOTUS NO:110 Kat:25 ESENYURT / ISTANBUL';
export const COMPANY_OFFICE_LAT = '41.00520574261714';
export const COMPANY_OFFICE_LNG = '28.684467950014007';
export const COMPANY_MAP_COORDINATES = `${COMPANY_OFFICE_LAT},${COMPANY_OFFICE_LNG}`;
/**
 * Direct deep-link to the ACCA EDU Google Business Profile (works as <a href>).
 * The share.google short-link does NOT work inside <iframe> — see COMPANY_MAP_EMBED_URL.
 */
export const COMPANY_MAPS_URL = 'https://share.google/vPr2ZIqZWTKpgNmht';

/**
 * Google Maps embed URL (no API key required).
 * Uses the business-name + location query so the iframe renders the actual
 * Google Business Profile card rather than a bare satellite pin.
 * Fallback coords are passed via &ll= so Google centres on the right building
 * even if the name query is ambiguous.
 */
export const COMPANY_MAP_EMBED_URL =
  `https://www.google.com/maps?q=ACCA+EDU+Esenyurt+Istanbul+Turkey` +
  `&ll=${COMPANY_MAP_COORDINATES}&z=17&t=m&output=embed`;
