/**
 * Shared university name → logo URL map
 * Used by ProgramsSearchPageV2, ScholarshipsPage, and UniversitiesPage.
 */
const S = 'https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/icons/';

/** Token → logo URL. Tokens are lowercase substrings of the normalised university name. */
const LOGO_ENTRIES = [
  ['acibadem',   S + 'acibadem.svg'],
  ['arel',       S + 'arel.png'],
  ['atlas',      S + 'atlas.svg'],
  ['aydin',      S + 'aydin.jpg'],
  ['bahcesehir', S + 'bahcesehir.png'],
  ['beykoz',     S + 'beykoz-universitesi-seeklogo.png'],
  // Beykent: existing Supabase image was incorrect – omitted until replaced
  ['biruni',     S + 'biruni-universitesi-seeklogo.svg'],
  ['esenyurt',   S + 'essenyurt.png'],
  ['fenerbahce', S + 'fenerbahce.svg'],
  ['gedik',      S + 'Gedik.png'],
  ['gelisim',    S + 'Gelisim.png'],
  ['galata',     S + 'IstanbulGalataUniversitesi_Logo_Dikey_ENG1.jpg'],
  ['isik',       S + 'isik-universitesi-logo-png_seeklogo-73715.png'],
  ['istanbul kent',  S + 'Kent.png'],
  ['kultur',     S + 'istanbul-kultur-universitesi-seeklogo.svg'],
  ['istinye',    S + 'istinye-universitesi-seeklogo.svg'],
  ['medipol',    S + 'Medipol.png'],
  ['nisantasi',  S + 'Nisantasi.png'],
  ['okan',       S + 'okan.png'],
  ['yeditepe',   S + 'yeditepe-universitesi-seeklogo.svg'],
  ['yeniyuzyil', S + 'Yeniyuzil.png'],
  ['yeni yuzyil',S + 'Yeniyuzil.png'],
];

/**
 * Returns a Supabase-hosted logo URL for a university name, or '' if unknown.
 * Matching is case-insensitive substring of the normalised name.
 */
export function getUniversityLogo(universityName) {
  if (!universityName) return '';
  const key = universityName.toLowerCase();
  for (const [token, url] of LOGO_ENTRIES) {
    if (key.includes(token)) return url;
  }
  return '';
}

/**
 * Mapping of canonical university names to their official website URLs.
 * Used to replace StudyFans links in programs.json.
 */
const UNIVERSITY_WEBSITES = {
  'ALTINBAS UNIVERSITY':               'https://www.altinbas.edu.tr',
  'BAHCESEHIR UNIVERSITY':             'https://int.bau.edu.tr',
  'BAHCESEHIR CYPRUS UNIVERSITY':      'https://bau.edu.tr',
  'BEYKENT UNIVERSITY':                'https://www.beykent.edu.tr',
  'BEYKOZ UNIVERSITY':                 'https://www.beykoz.edu.tr',
  'BIRUNI UNIVERSITY':                 'https://www.biruni.edu.tr',
  'DOGUS UNIVERSITY':                  'https://www.dogus.edu.tr',
  'FATIH SULTAN MEHMET VAKIF UNIVERSITY': 'https://www.fsm.edu.tr',
  'FENERBAHCE UNIVERSITY':             'https://www.fbu.edu.tr',
  'HALIC UNIVERSITY':                  'https://halic.edu.tr',
  'IBN HALDUN UNIVERSITY':             'https://www.ihu.edu.tr',
  'ISIK UNIVERSITY':                   'https://www.isikun.edu.tr',
  'ISTANBUL AREL UNIVERSITY':          'https://www.istanbularel.edu.tr',
  'ISTANBUL ATLAS UNIVERSITY':         'https://www.atlas.edu.tr',
  'ISTANBUL AYDIN UNIVERSITY':         'https://www.aydin.edu.tr',
  'ISTANBUL BILGI UNIVERSITY':         'https://www.bilgi.edu.tr',
  'ISTANBUL ESENYURT UNIVERSITY':      'https://www.esenyurt.edu.tr',
  'ISTANBUL GEDIK UNIVERSITY':         'https://international.gedik.edu.tr',
  'ISTANBUL GELISIM UNIVERSITY':       'https://www.gelisim.edu.tr',
  'ISTANBUL KENT UNIVERSITY':          'https://www.kent.edu.tr',
  'ISTANBUL KULTUR UNIVERSITY':        'https://www.iku.edu.tr',
  'ISTANBUL MEDIPOL UNIVERSITY':       'https://mio.medipol.edu.tr',
  'ISTANBUL NISANTASI UNIVERSITY':     'https://www.nisantasi.edu.tr',
  'ISTANBUL SABAHATTIN ZAIM UNIVERSITY': 'https://www.izu.edu.tr',
  'ISTANBUL TICARET UNIVERSITY':       'https://ticaret.edu.tr',
  'ISTANBUL TOPKAPI UNIVERSITY':       'https://www.topkapi.edu.tr',
  'ISTANBUL YENI YUZYIL UNIVERSITY':   'https://yeniyuzyil.edu.tr',
  'ISTINYE UNIVERSITY':                'https://www.istinye.edu.tr',
  'İstanbul Galata University':        'https://galata.edu.tr',
  'KADIR HAS UNIVERSITY':              'https://www.khas.edu.tr',
  'KOC UNIVERSITY':                    'https://www.ku.edu.tr',
  'MALTEPE UNIVERSITY':                'https://www.maltepe.edu.tr',
  'NEAR EAST UNIVERSITY':              'https://neu.edu.tr',
  'OKAN UNIVERSITY':                   'https://www.okan.edu.tr',
  'OZYEGIN UNIVERSITY':                'https://www.ozyegin.edu.tr',
  'SABANCI UNIVERSITY':                'https://www.sabanciuniv.edu',
  'USKUDAR UNIVERSITY':                'https://uskudar.edu.tr',
  'YEDITEPE UNIVERSITY':               'https://yeditepe.edu.tr',
  'ANKARA BILIM UNIVERSITY':           'https://www.ankarabilimu.edu.tr',
  'ANKARA MEDIPOL UNIVERSITY':         'https://medipol.edu.tr',
  'ATILIM UNIVERSITY':                 'https://www.atilim.edu.tr',
  'CYPRUS INTERNATIONAL UNIVERSITY':   'https://www.ciu.edu.tr',
  'EASTERN MEDITERRANEAN (EMU) UNIVERSITY': 'https://emu.edu.tr',
  'FINAL INTERNATIONAL UNIVERSITY':    'https://final.edu.tr',
  'KYRENIA UNIVERSITY':                'https://kyrenia.edu.tr',
  'OSTIM TEKNIK UNIVERSITY':           'https://ostimteknik.edu.tr',
  'IZMIR UNIVERSITY OF ECONOMICS':     'https://www.ieu.edu.tr',
  'TED UNIVERSITY':                    'https://www.tedu.edu.tr',
  'HASAN KALYONCU UNIVERSITY':         'https://www.hku.edu.tr',
  'LOKMAN HEKIM UNIVERSITY':           'https://lokmanhekim.edu.tr',
  'KOCAELI SAGLIK VE TEKNOLOJI UNIVERSITY': 'https://ksbu.edu.tr',
  'ANTALYA BILIM UNIVERSITY':          'https://www.antalya.edu.tr',
};

/**
 * Returns the university's official website URL, or a Google search fallback.
 */
export function getUniversityWebsite(universityName) {
  if (!universityName) return '';

  // Try exact match first
  if (UNIVERSITY_WEBSITES[universityName]) return UNIVERSITY_WEBSITES[universityName];

  // Try case-insensitive match
  const key = universityName.toUpperCase().trim();
  for (const [name, url] of Object.entries(UNIVERSITY_WEBSITES)) {
    if (name.toUpperCase() === key) return url;
  }

  // Fallback: Google search
  return `https://www.google.com/search?q=${encodeURIComponent(universityName + ' official website')}`;
}

/** Returns true if the URL belongs to StudyFans. */
export function isStudyFansUrl(url) {
  return Boolean(url && url.includes('studyfans'));
}
