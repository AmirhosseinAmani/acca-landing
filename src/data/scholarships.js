// Import shared logo lookup instead of duplicating the map
import { getUniversityLogo as _getUniversityLogo } from './universityLogoMap';

const rawScholarshipRows = [
  [
    "Altinbas University",
    "Medicine (English)",
    "45,000 USD",
    "6+1"
  ],
  [
    "Altinbas University",
    "Medicine (Turkish)",
    "44,500 USD",
    "6+1"
  ],
  [
    "Ankara Bilim University",
    "Bachelor's Programs (English)",
    "5,000 USD",
    "4+1"
  ],
  [
    "Ankara Bilim University",
    "Bachelor's Programs (Turkish)",
    "5,000 USD",
    "4+1"
  ],
  [
    "Ankara Medipol University",
    "Bachelor's Programs (English)",
    "7,000 USD",
    "4+1"
  ],
  [
    "Ankara Medipol University",
    "Bachelor's Programs (Turkish)",
    "7,000 USD",
    "4+1"
  ],
  [
    "Ankara Medipol University",
    "Dentistry (Turkish)",
    "20,000 USD",
    "5+1"
  ],
  [
    "Ankara Medipol University",
    "Medicine (English)",
    "35,000 USD",
    "6+1"
  ],
  [
    "Ankara Medipol University",
    "Medicine (Turkish)",
    "55,000 USD",
    "6+1"
  ],
  [
    "Arel University",
    "Associate Programs (English)",
    "2,500 USD",
    "2+1"
  ],
  [
    "Arel University",
    "Associate Programs (Turkish)",
    "2,000 USD",
    "2+1"
  ],
  [
    "Arel University",
    "Bachelor's Programs (Turkish)",
    "3,850 USD",
    "4+1"
  ],
  [
    "Atlas University",
    "Bachelor's Programs (English)",
    "6,000 USD",
    "4+1"
  ],
  [
    "Atlas University",
    "Bachelor's Programs (Turkish)",
    "5,500 USD",
    "4+1"
  ],
  [
    "Atlas University",
    "Dentistry (English)",
    "39,000 USD",
    "5+1"
  ],
  [
    "Atlas University",
    "Dentistry (Turkish)",
    "37,000 USD",
    "5+1"
  ],
  [
    "Atlas University",
    "Master's Programs (English)",
    "3,000 USD",
    "2+1"
  ],
  [
    "Atlas University",
    "Master's Programs (Turkish)",
    "2,750 USD",
    "2+1"
  ],
  [
    "Atlas University",
    "Medicine (English)",
    "40,000 USD",
    "6+1"
  ],
  [
    "Atlas University",
    "Medicine (Turkish)",
    "38,000 USD",
    "6+1"
  ],
  [
    "Aydin University",
    "Artificial Intelligence",
    "14,000 USD",
    "4+1"
  ],
  [
    "Aydin University",
    "Bachelor's Programs (English)",
    "10,000 USD",
    "4+1"
  ],
  [
    "Aydin University",
    "Bachelor's Programs (Turkish)",
    "9,000 USD",
    "4+1"
  ],
  [
    "Aydin University",
    "Computer Engineering, Software Engineering, Business Administration (English)",
    "11,000 USD",
    "4+1"
  ],
  [
    "Aydin University",
    "Medicine (English)",
    "50,000 USD",
    "6+1"
  ],
  [
    "Aydin University",
    "Medicine (Turkish)",
    "48,000 USD",
    "6+1"
  ],
  [
    "Aydin University",
    "Physiotherapy",
    "10,000 USD",
    "4+1"
  ],
  [
    "Aydin University",
    "Physiotherapy and Rehabilitation, Artificial Intelligence and Data Engineering (English)",
    "14,000 USD",
    "4+1"
  ],
  [
    "Aydin University",
    "Physiotherapy (Turkish)",
    "12,000 USD",
    "4+1"
  ],
  [
    "Bahcesehir University",
    "Bachelor's Programs (English)",
    "26,000 USD",
    "4+1"
  ],
  [
    "Bahcesehir University",
    "Bachelor's Programs (Turkish)",
    "21,000 USD",
    "4+1"
  ],
  [
    "Beykent University",
    "Associate Programs (English)",
    "2,500 USD",
    "2+1"
  ],
  [
    "Beykent University",
    "Associate Programs (Turkish)",
    "2,000 USD",
    "2+1"
  ],
  [
    "Beykent University",
    "Bachelor's Programs (Turkish / English)",
    "4,000 USD",
    "4+1"
  ],
  [
    "Beykent University",
    "Dentistry (Turkish)",
    "32,000 USD",
    "5+1"
  ],
  [
    "Beykent University",
    "Master's Programs (English)",
    "2,500 USD",
    "2+1"
  ],
  [
    "Beykent University",
    "Master's Programs (Turkish)",
    "2,000 USD",
    "2+1"
  ],
  [
    "Beykent University",
    "Medicine (Turkish)",
    "32,000 USD",
    "6+1"
  ],
  [
    "Beykoz University",
    "Bachelor's Programs (English)",
    "4,500 USD",
    "4+1"
  ],
  [
    "Beykoz University",
    "Bachelor's Programs (Turkish)",
    "4,500 USD",
    "4+1"
  ],
  [
    "Biruni University",
    "Dentistry (English)",
    "51,000 USD",
    "5+1"
  ],
  [
    "Biruni University",
    "Dentistry (Turkish)",
    "48,000 USD",
    "5+1"
  ],
  [
    "Biruni University",
    "Medicine (English)",
    "56,000 USD",
    "6+1"
  ],
  [
    "Biruni University",
    "Medicine (Turkish)",
    "51,000 USD",
    "6+1"
  ],
  [
    "Biruni University",
    "Pharmacy (English)",
    "24,000 USD",
    "5+1"
  ],
  [
    "Biruni University",
    "Pharmacy (Turkish)",
    "22,000 USD",
    "5+1"
  ],
  [
    "Fenerbahce University",
    "Bachelor's Programs (English)",
    "4,500 USD",
    "4+1"
  ],
  [
    "Fenerbahce University",
    "Bachelor's Programs (Turkish)",
    "4,000 USD",
    "4+1"
  ],
  [
    "Fenerbahce University",
    "Master's Programs (English)",
    "2,500 USD",
    "2+1"
  ],
  [
    "Fenerbahce University",
    "Master's Programs (Turkish)",
    "2,000 USD",
    "2+1"
  ],
  [
    "Fenerbahce University",
    "Pharmacy (English)",
    "20,000 USD",
    "5+1"
  ],
  [
    "Fenerbahce University",
    "Pharmacy (Turkish)",
    "18,000 USD",
    "5+1"
  ],
  [
    "Galata University",
    "Bachelor's Programs (English)",
    "4,500 USD",
    "4+1"
  ],
  [
    "Galata University",
    "Bachelor's Programs (Turkish)",
    "4,000 USD",
    "4+1"
  ],
  [
    "Galata University",
    "Dentistry (English)",
    "28,000 USD",
    "5+1"
  ],
  [
    "Galata University",
    "Dentistry (Turkish)",
    "26,000 USD",
    "5+1"
  ],
  [
    "Gedik University",
    "Bachelor's Programs (English)",
    "5,000 USD",
    "4+1"
  ],
  [
    "Gedik University",
    "Bachelor's Programs (Turkish)",
    "4,000 USD",
    "4+1"
  ],
  [
    "Gelisim University",
    "Bachelor's Programs (English)",
    "7,000 USD",
    "4+1"
  ],
  [
    "Gelisim University",
    "Bachelor's Programs (Turkish)",
    "6,000 USD",
    "4+1"
  ],
  [
    "Gelisim University",
    "Software, Computer & Aviation Engineering (English)",
    "10,000 USD",
    "4+1"
  ],
  [
    "Gelisim University",
    "Dentistry (English)",
    "39,000 USD",
    "5+1"
  ],
  [
    "Gelisim University",
    "Dentistry (Turkish)",
    "30,000 USD",
    "5+1"
  ],
  [
    "Gelisim University",
    "Engineering Programs (English)",
    "6,500 USD",
    "4+1"
  ],
  [
    "Gelisim University",
    "Physiotherapy (English)",
    "8,500 USD",
    "4+1"
  ],
  [
    "Istinye University",
    "Bachelor's Programs (Turkish / English)",
    "13,500 USD",
    "4+1"
  ],
  [
    "Istinye University",
    "Medicine (English)",
    "49,000 USD",
    "6+1"
  ],
  [
    "Istinye University",
    "Pharmacy (Turkish)",
    "25,000 USD",
    "5+1"
  ],
  [
    "Isik University",
    "Bachelor's Programs (Turkish)",
    "6,000 USD",
    "4+1"
  ],
  [
    "Kent University",
    "Associate Programs (Turkish)",
    "2,000 USD",
    "2+1"
  ],
  [
    "Kent University",
    "Bachelor's Programs (English)",
    "4,300 USD",
    "4+1"
  ],
  [
    "Kent University",
    "Bachelor's Programs (Turkish)",
    "3,500 USD",
    "4+1"
  ],
  [
    "Kent University",
    "Dentistry (Turkish / English)",
    "28,500 USD",
    "5+1"
  ],
  [
    "Kent University",
    "Master's Programs (English)",
    "2,500 USD",
    "2+1"
  ],
  [
    "Kent University",
    "Master's Programs (Turkish)",
    "2,000 USD",
    "2+1"
  ],
  [
    "Kent University",
    "Pharmacy (Turkish)",
    "17,000 USD",
    "5+1"
  ],
  [
    "Istanbul Medipol University",
    "Bachelor's Programs (English)",
    "14,000 USD",
    "4+1"
  ],
  [
    "Istanbul Medipol University",
    "Bachelor's Programs (Turkish)",
    "12,000 USD",
    "4+1"
  ],
  [
    "Istanbul Medipol University",
    "Pharmacy (English)",
    "4,500 USD",
    "5+1"
  ],
  [
    "Istanbul Medipol University",
    "Pharmacy (Turkish)",
    "4,500 USD",
    "5+1"
  ],
  [
    "Istanbul Medipol University",
    "Physiotherapy (English)",
    "16,000 USD",
    "4+1"
  ],
  [
    "Istanbul Medipol University",
    "Physiotherapy (Turkish)",
    "14,000 USD",
    "4+1"
  ],
  [
    "Nisantasi University",
    "Bachelor's Programs (Turkish / English)",
    "5,500 USD",
    "4+1"
  ],
  [
    "Nisantasi University",
    "Dentistry (English)",
    "35,000 USD",
    "5+1"
  ],
  [
    "Nisantasi University",
    "Dentistry (Turkish)",
    "31,000 USD",
    "5+1"
  ],
  [
    "Nisantasi University",
    "Medicine (Turkish)",
    "39,000 USD",
    "6+1"
  ],
  [
    "Okan University",
    "Bachelor's Programs (Turkish / English)",
    "6,000 USD",
    "4+1"
  ],
  [
    "Okan University",
    "Dentistry (Turkish / English)",
    "38,000 USD",
    "5+1"
  ],
  [
    "Okan University",
    "Medicine (Turkish / English)",
    "38,000 USD",
    "6+1"
  ],
  [
    "Okan University",
    "Pharmacy (Turkish)",
    "20,000 USD",
    "5+1"
  ],
  [
    "Ostim Technical University",
    "Bachelor's Programs (Turkish)",
    "6,000 USD",
    "4+1"
  ],
  [
    "Rumeli University",
    "Bachelor's Programs (Turkish)",
    "4,000 USD",
    "4+1"
  ],
  [
    "Topkapi University",
    "Bachelor's Programs (Turkish)",
    "3,000 USD",
    "4+1"
  ],
  [
    "Ufuk University",
    "Bachelor's Programs (English)",
    "8,000 USD",
    "4+1"
  ],
  [
    "Ufuk University",
    "Bachelor's Programs (Turkish)",
    "7,000 USD",
    "4+1"
  ],
  [
    "Ufuk University",
    "Medicine (English)",
    "35,000 USD",
    "6+1"
  ],
  [
    "Ufuk University",
    "Medicine (Turkish)",
    "30,000 USD",
    "6+1"
  ],
  [
    "Uskudar University",
    "Bachelor's Programs (Turkish)",
    "3,500 USD",
    "4+1"
  ],
  [
    "Uskudar University",
    "Dentistry (English)",
    "50,000 USD",
    "5+1"
  ],
  [
    "Uskudar University",
    "Dentistry (Turkish)",
    "45,000 USD",
    "5+1"
  ],
  [
    "Uskudar University",
    "Diploma Program",
    "2,500 USD",
    "2+1"
  ],
  [
    "Uskudar University",
    "Master's Programs (English)",
    "2,500 USD",
    "2+1"
  ],
  [
    "Uskudar University",
    "Master's Programs (Turkish)",
    "2,000 USD",
    "2+1"
  ],
  [
    "Uskudar University",
    "Medicine (English)",
    "50,000 USD",
    "6+1"
  ],
  [
    "Uskudar University",
    "Medicine (Turkish)",
    "45,000 USD",
    "6+1"
  ]
];

export const scholarshipRows = rawScholarshipRows.map(([university, program, price, studyDuration], index) => {
  const parsed = parseScholarshipPrice(price);

  return {
    id: 'sch-' + String(index + 1).padStart(3, '0'),
    university,
    program,
    price,
    priceAmount: parsed.amount,
    currency: parsed.currency,
    studyDuration,
    degree: inferDegree(program),
    language: inferLanguage(program),
    city: inferCity(university),
    country: 'Turkey',
    logoUrl: getScholarshipLogo(university),
  };
});

export const scholarshipStats = {
  totalRows: scholarshipRows.length,
  totalUniversities: new Set(scholarshipRows.map((row) => row.university)).size,
  minPrice: Math.min(...scholarshipRows.map((row) => row.priceAmount).filter(Boolean)),
  maxPrice: Math.max(...scholarshipRows.map((row) => row.priceAmount).filter(Boolean)),
};

export function findScholarshipPriceForSelection({ university, major, degree, language }) {
  const universityKey = normalizeUniversityKey(university);
  const requestedCity = getUniversityCityToken(university);
  const category = getSelectionCategory(major, degree);
  const preferredLanguage = inferLanguage(language);

  if (!universityKey || !category || !preferredLanguage) return null;

  const universityMatches = scholarshipRows.filter((row) => {
    const rowCity = getUniversityCityToken(row.university) || normalizeScholarshipText(row.city);
    return (
      normalizeUniversityKey(row.university) === universityKey &&
      (!requestedCity || !rowCity || rowCity === requestedCity)
    );
  });

  if (!universityMatches.length) return null;

  const explicitProgramMatches = universityMatches.filter((row) =>
    rowExplicitlyNamesMajor(row, major)
  );
  const categoryMatches = explicitProgramMatches.length
    ? explicitProgramMatches
    : ['bachelor', 'master', 'associate'].includes(category)
      ? universityMatches.filter((row) => rowMatchesCategory(row, category))
      : [];

  if (!categoryMatches.length) return null;

  const languageCandidates = categoryMatches.filter((row) =>
    scholarshipLanguageMatches(row.language, preferredLanguage)
  );

  if (!languageCandidates.length) return null;

  const pricedCandidates = languageCandidates.filter((row) => row.priceAmount > 0);
  const distinctPrices = new Set(
    pricedCandidates.map((row) => `${row.priceAmount}|${row.currency}`)
  );

  if (distinctPrices.size !== 1) return null;

  const selected = pricedCandidates[0];

  return {
    amount: selected.priceAmount,
    currency: selected.currency,
    sourceRow: selected,
  };
}

export function formatScholarshipPrice(row, locale = 'en-US') {
  if (!row?.priceAmount) return row?.price || '';
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(row.priceAmount) + ' ' + (row.currency || 'USD');
}

export function normalizeScholarshipText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0130/g, 'I')
    .replace(/\u0131/g, 'i')
    .toLocaleLowerCase('en-US')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseScholarshipPrice(value) {
  const text = String(value || '').trim();
  const match = text.match(/[\d,.]+/);
  const amount = match ? Number(match[0].replace(/,/g, '')) : null;
  const currency = text.replace(/[\d,.\s]/g, '').trim() || 'USD';
  return { amount: Number.isFinite(amount) ? amount : null, currency };
}

function inferDegree(program) {
  const text = normalizeScholarshipText(program);
  if (text.includes('associate') || text.includes('diploma')) return 'Associate';
  if (text.includes('master')) return 'Master';
  if (text.includes('medicine')) return 'Medicine';
  if (text.includes('dentistry')) return 'Dentistry';
  if (text.includes('pharmacy')) return 'Pharmacy';
  return 'Bachelor';
}

function inferLanguage(value) {
  const text = normalizeScholarshipText(value);
  const hasEnglish = text.includes('english');
  const hasTurkish = text.includes('turkish');
  if (hasEnglish && hasTurkish) return 'Turkish / English';
  if (hasEnglish) return 'English';
  if (hasTurkish) return 'Turkish';
  return '';
}

function inferCity(university) {
  const text = normalizeScholarshipText(university);
  if (text.includes('ankara') || text.includes('ufuk') || text.includes('ostim')) return 'Ankara';
  return 'Istanbul';
}

function getScholarshipLogo(university) {
  return _getUniversityLogo(university);
}

function getUniversityCityToken(value) {
  const text = normalizeScholarshipText(value);
  if (text.includes('ankara')) return 'ankara';
  if (text.includes('istanbul')) return 'istanbul';
  return '';
}

function normalizeUniversityKey(value) {
  const tokens = normalizeScholarshipText(value)
    .split(' ')
    .filter((token) => token && !['istanbul', 'ankara', 'university', 'universitesi', 'vakif', 'technical'].includes(token));
  return tokens.join(' ') || normalizeScholarshipText(value);
}

function getSelectionCategory(major, degree) {
  const text = normalizeScholarshipText(major);

  if (text.includes('medicine')) return 'medicine';
  if (text.includes('dentistry') || text.includes('dental')) return 'dentistry';
  if (text.includes('pharmacy')) return 'pharmacy';
  if (text.includes('physiotherapy') || text.includes('physical therapy')) return 'physiotherapy';
  if (text.includes('artificial intelligence')) return 'ai';
  if (text.includes('software')) return 'software';
  if (text.includes('computer engineering')) return 'computer';

  const degreeText = normalizeScholarshipText(degree);
  if (degreeText.includes('master')) return 'master';
  if (degreeText.includes('associate') || degreeText.includes('diploma')) return 'associate';
  if (degreeText.includes('bachelor')) return 'bachelor';

  return '';
}

function rowIsGeneralBachelor(row) {
  const text = normalizeScholarshipText(row.program);
  return row.degree === 'Bachelor' && text.includes('bachelor');
}

function rowMatchesCategory(row, category) {
  const text = normalizeScholarshipText(row.program);
  if (category === 'medicine') return text.includes('medicine');
  if (category === 'dentistry') return text.includes('dentistry');
  if (category === 'pharmacy') return text.includes('pharmacy');
  if (category === 'physiotherapy') {
    return text.includes('physiotherapy') || text.includes('physical therapy');
  }
  if (category === 'software') return text.includes('software');
  if (category === 'computer') return text.includes('computer');
  if (category === 'ai') return text.includes('artificial intelligence');
  if (category === 'master') return text.includes('master');
  if (category === 'associate') return text.includes('associate') || text.includes('diploma');
  return rowIsGeneralBachelor(row);
}

function rowExplicitlyNamesMajor(row, major) {
  const rowText = normalizeScholarshipText(row.program);
  const majorText = normalizeScholarshipText(major);
  if (!rowText || !majorText) return false;

  const aliases = [];
  if (majorText.includes('medicine')) aliases.push('medicine');
  else if (majorText.includes('dentistry') || majorText.includes('dental')) aliases.push('dentistry');
  else if (majorText.includes('pharmacy')) aliases.push('pharmacy');
  else if (majorText.includes('physiotherapy') || majorText.includes('physical therapy')) aliases.push('physiotherapy');
  else if (majorText.includes('artificial intelligence')) aliases.push('artificial intelligence');
  else if (majorText.includes('computer engineering')) aliases.push('computer engineering');
  else if (majorText.includes('software engineering')) aliases.push('software engineering');
  else aliases.push(majorText);

  return aliases.some((alias) => rowText.includes(alias));
}

function scholarshipLanguageMatches(rowLanguage, preferredLanguage) {
  if (!rowLanguage || !preferredLanguage) return false;
  if (rowLanguage === 'Turkish / English') {
    return ['Turkish', 'English', 'Turkish / English'].includes(preferredLanguage);
  }
  return rowLanguage === preferredLanguage;
}
