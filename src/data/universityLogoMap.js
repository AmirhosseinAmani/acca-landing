/**
 * Shared university name → logo URL map
 * Used by ProgramsSearchPageV2, ScholarshipsPage, and UniversitiesPage.
 */
const S = 'https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/icons/';

/** Token → logo URL. Tokens are lowercase substrings of the normalised university name. */
const LOGO_ENTRIES = [
  ['altinbas', 'https://www.altinbas.edu.tr/asset/img/theme/logo-dark-tr.png'],
  ['ankara bilim', 'https://ankarabilim.edu.tr/./Uploads/ayarlar/ankara-bilim-uni-logo-d974021bc1773f29086da252095c557b-82c04dcf211f9029da2fe8b2ebf6d688.png'],
  ['antalya bilim', 'https://antalya.edu.tr/assets/site/antalya_bilim_universitesi_2024/img/brand/abu_logo_tr.png'],
  ['atilim', 'https://www.atilim.edu.tr/assets/frontend/img/atilim-universitesi-logo-tr.svg'],
  ['avila', 'https://www.avila.edu/wp-content/themes/avila/img/logo-stacked-no-tag.svg'],
  ['bentley', 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Bentley_University_logo.svg'],
  ['berlin school of business', 'https://www.berlinsbi.com/uploads/sites/2/2026/02/BSBI_Logo.png?quality=80'],
  ['bezmialem', 'https://bezmialem.edu.tr/Style%20Library/assets/images/logo.png'],
  ['beykent', 'https://www.beykent.edu.tr/images/default-source/default-album/beykent-logo45a9e3205f99487b940e38ff8e00011a.jpg?sfvrsn=4a7c658c_2'],
  ['caucasus international', 'https://admin.ciu.edu.ge/uploads/ciu_logo_dark_cc9d399a7d.svg'],
  ['constructor', 'https://constructor.university/sites/default/files/CU-25-White-On-Transparent-logo.svg'],
  ['cyprus health', 'https://www.kstu.edu.tr/templates/novaya/logo/logo_tr.png'],
  ['cyprus international', 'https://ciu.edu.tr/themes/custom/ciu/logo--dark.svg'],
  ['cyprus science', 'https://upload.wikimedia.org/wikipedia/commons/9/9f/KIU_V.jpg'],
  ['dogus', 'https://www.dogus.edu.tr/docs/default-source/kurumsalkimlik/dogus-university-logo-english-svg.svg?sfvrsn=8d0aa71f_6'],
  ['eastern mediterranean', 'https://www.emu.edu.tr/media/assets/images/emu-logo-bw.png'],
  ['(emu)', 'https://www.emu.edu.tr/media/assets/images/emu-logo-bw.png'],
  ['european university', 'https://eu.edu.ge/wp-content/uploads/2023/06/evropis-universiteti-logo.png'],
  ['fatih sultan', 'https://www.fsm.edu.tr/mainSite/assets/images/logo@2x-yeni.png?v=1'],
  ['final international', 'https://lms1.final.edu.tr/LMS/pluginfile.php/1/core_admin/logo/0x150/1633460467/ufulogoen4.png'],
  ['georgian technical', 'https://gtu.ge/bitrix/templates/GTUen/images/logo-brand.svg'],
  ['girne american', 'https://www.gau.edu.tr/template/gau/images/big-logo.svg'],
  ['gisma', 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Gisma_Business_School_Logo_02.2022.svg'],
  ['halic', 'https://halic.edu.tr/wp-content/uploads/universitemiz/kurumsalKimlik/halic_universitesi_logo_new_TR.svg'],
  ['hasan kalyoncu', 'https://www.hku.edu.tr/wp-content/themes/hku/assets/images/hku-logo-colorful-tr.png'],
  ['ibn haldun', 'https://www.ihu.edu.tr/assets/images/logo-tr.jpg'],
  ['international black sea', 'https://upload.wikimedia.org/wikipedia/en/c/c3/International_Black_Sea_University.png'],
  ['ibsu', 'https://upload.wikimedia.org/wikipedia/en/c/c3/International_Black_Sea_University.png'],
  ['ilia state', 'https://iliauni.edu.ge/res/app/imgs/logo_new/logo-0102-en.png'],
  ['istanbul bilgi', 'https://tbl.bilgi.edu.tr/brand-resources/logotypes/bilgi-30yil/colored/bilgi-logotype-tr@2x.png'],
  ['sabahattin zaim', 'https://www.izu.edu.tr/images/default-source/logolar/izulogo.png?sfvrsn=97bd0b8d_8'],
  ['ticaret', 'https://ticaret.edu.tr/wp-content/themes/ticaret_universitesi_2024/assets/static/ITICU-Logo.png'],
  ['topkapi', 'https://www.topkapi.edu.tr/resources/files/logo_tr.jpg'],
  ['ivane javakhishvili', 'https://www.tsu.ge/assets/themes/tsu/assets/img/logo.png'],
  ['tbilisi state university', 'https://www.tsu.ge/assets/themes/tsu/assets/img/logo.png'],
  ['izmir university of economics', 'https://www.ieu.edu.tr/images/web-logo-tr.svg'],
  ['kadir has', 'https://www.khas.edu.tr/wp-content/uploads/khas.svg'],
  ['koc university', 'https://upload.wikimedia.org/wikipedia/commons/2/24/Ko%C3%A7_University_logo.svg'],
  ['kocaeli saglik', 'https://ksbu.edu.tr/views/index/maintemplate2_1/public/images/logo-1.png'],
  ['kyrenia', 'https://kyrenia.edu.tr/wp-content/uploads/2021/05/21/okul_logo_turkce-renkli.svg?ver=5c19eaecbc1c0a770f09aba8f3560e32'],
  ['lokman hekim', 'https://www.lokmanhekim.edu.tr/project_lokmanhekimuni/images/logo-mini.webp'],
  ['maltepe', 'https://www.maltepe.edu.tr/Content/MainWebsite/img/maltepe-uni-logo.svg'],
  ['near east', 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Near_East_University.png'],
  ['ostim', 'https://ostimteknik.edu.tr/web/image/195765-3ad6b10e/Logo.png'],
  ['ozyegin', 'https://www.ozyegin.edu.tr/sites/default/files/logo-tr.png'],
  ['pepperdine', 'https://upload.wikimedia.org/wikipedia/commons/4/43/Pepperdine_University_wordmark.svg'],
  ['sabanci', 'https://www.sabanciuniv.edu/themes/custom/su/logo.svg'],
  ['syracuse', 'https://assets.cdn.syr.edu/logos/syr_horizontal_1Line_orange.svg'],
  ['tbilisi state medical', 'https://tsmu.edu/ts/images/logo.png'],
  ['ted university', 'https://www.tedu.edu.tr/themes/custom/tedu/logo.svg'],
  ['catholic university of america', 'https://brand.catholic.edu/wp-content/uploads/2026/04/PrimaryUniversityLogoHorizontal.svg'],
  ['the university of georgia', 'https://ug.edu.ge/assets/images/logo.jpg'],
  ['trebas', 'https://wpvip.guscancolleges.ca/trebas/wp-content/uploads/sites/8/2024/09/Trebas-Quebec-Logo-Col-BK.svg'],
  ['university canada west', 'https://wpvip.guscancolleges.ca/ucanwest/wp-content/uploads/sites/3/2022/12/UCW-logo-outline-2x.webp'],
  ['niagara falls', 'https://wpvip.guscancolleges.ca/unfc/wp-content/uploads/sites/7/2025/03/UNF-primary-logo.svg'],
  ['uskudar', 'https://uskudar.edu.tr/assets/kurumsal/logo-en/png/uskudar-university-logo.png'],
  ['washington university school of law', 'https://law.washu.edu/wp-content/uploads/2025/05/wash-u-logo.svg'],
  ['acibadem',   S + 'acibadem.svg'],
  ['arel',       S + 'arel.png'],
  ['atlas',      S + 'atlas.svg'],
  ['aydin',      S + 'aydin.jpg'],
  ['bahcesehir', S + 'bahcesehir.png'],
  ['beykoz',     S + 'beykoz-universitesi-seeklogo.png'],
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

const normalizeLogoKey = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/ı/g, 'i')
  .replace(/ğ/g, 'g')
  .replace(/ü/g, 'u')
  .replace(/ş/g, 's')
  .replace(/ö/g, 'o')
  .replace(/ç/g, 'c');

/**
 * Returns a verified logo URL for a university name, or '' if unknown.
 * Matching is case-insensitive substring of the normalised name.
 */
export function getUniversityLogo(universityName) {
  if (!universityName) return '';
  const key = normalizeLogoKey(universityName);
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
  'ANKARA BILIM UNIVERSITY':           'https://ankarabilim.edu.tr',
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
