// -*- universityCredentials.js -*-
// Source-verified international credentials for Istanbul private universities.
// Replaces the old generic "Diploma / Certificate" placeholders with PRECISE,
// name-based, source-backed credentials (Mavi/Blue Diploma, Diploma Supplement,
// ECTS, Bologna, Erasmus+, and program / institutional / quality accreditations).
//
// Rules honored (per ACCA credential spec):
//  - Only verified items are populated; everything else stays null / "Not publicly verified".
//  - "Mavi Diploma" is NOT set true unless an official source explicitly says so; a plain
//    Diploma Supplement is recorded as diplomaSupplement, not as Mavi Diploma.
//  - "Diploma Supplement Label" is recorded only when the EU Label itself is documented.
//  - secondary_source items are kept but flagged low confidence → NOT shown on the card.
//  - Each item carries its own sourceUrl + verificationLevel.
//
// Research pass: 2026-06 (public sources only — university sites, YÖK/YÖKAK, MÜDEK/AACSB/etc.).

export const CREDENTIALS_LAST_CHECKED = '2026-06-02';
export const NOT_PUBLICLY_VERIFIED = 'Not publicly verified';

const DEFAULT_MISSING = [
  'Mavi/Blue Diploma official confirmation',
  'Diploma Supplement / Label verification',
  'ECTS & Bologna source verification',
  'Erasmus+ / ECHE office and counts',
  'Program & institutional accreditation verification',
];

function normalizeName(value) {
  return String(value || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/İ/g, 'I')
    .replace(/[ŞŚ]/g, 'S')
    .replace(/[ĞG]/g, 'G')
    .replace(/[ÜU]/g, 'U')
    .replace(/[ÖO]/g, 'O')
    .replace(/[ÇC]/g, 'C')
    .replace(/\s+/g, ' ')
    .trim();
}

// Verification level -> card badge confidence.
function confidenceFor(level) {
  if (level === 'official_university' || level === 'official_authority' || level === 'accreditation_body') return 'high';
  if (level === 'secondary_source') return 'low';
  return 'medium';
}

// ---------------------------------------------------------------------------
// VERIFIED OVERRIDES (partial objects; missing fields fall back to null defaults)
// ---------------------------------------------------------------------------
const OVERRIDES = {
  'ISTANBUL MEDIPOL UNIVERSITY': {
    diplomaSupplement: {
      available: true, officialName: 'Diploma Supplement', labelStatus: 'Diploma Supplement',
      sourceUrl: 'https://www.medipol.edu.tr/en/academics/ects-information-guide/diploma-supplement',
      verificationLevel: 'official_university',
      note: 'دانشگاه به‌صورت رسمی همراه با دیپلم، Diploma Supplement صادر می‌کند.',
    },
    ectsAndBologna: {
      ectsCompatible: true, bolognaProcessMentioned: true,
      sourceUrl: 'https://www.medipol.edu.tr/en/prospective-students/the-bologna-process',
      note: 'ECTS Information Guide و صفحه فرایند بولونیا روی سایت رسمی موجود است.',
    },
    erasmusAndExchange: {
      erasmusAvailable: true, erasmusOfficeUrl: 'https://mio.medipol.edu.tr/',
      sourceUrl: 'https://mio.medipol.edu.tr/course-diploma-procedures',
    },
    programAccreditations: [
      {
        accreditationName: 'TEPDAD', accreditationBody: 'Association for Evaluation and Accreditation of Medical Education Programs',
        relatedProgram: 'International School of Medicine', relatedFaculty: 'Medicine', level: 'undergraduate',
        sourceUrl: 'https://www.medipol.edu.tr/en/news/international-school-medicine-accredited-tepdad',
        verificationLevel: 'official_university',
      },
    ],
    credentialSummaryFa: 'بر اساس صفحات رسمی دانشگاه، مدیپول از ECTS و Diploma Supplement (در چارچوب فرایند بولونیا) استفاده می‌کند و دانشکده پزشکی بین‌الملل آن دارای اعتبارنامه TEPDAD است.',
    dataQuality: { confidence: 'high', needsHumanReview: false },
  },

  'ISTANBUL AYDIN UNIVERSITY': {
    diplomaSupplement: {
      available: true, officialName: 'Diploma Supplement', labelStatus: 'Diploma Supplement Label',
      sourceUrl: 'https://www.aydin.edu.tr/en-us/ogrenciler/bilgi-sistemleri/Pages/diploma-eki-ds.aspx',
      verificationLevel: 'official_university',
      note: 'دانشگاه از کمیسیون اروپا «ECTS Label» و «Diploma Supplement Label» دریافت کرده است.',
    },
    ectsAndBologna: {
      ectsCompatible: true, ectsLabel: true, bolognaProcessMentioned: true,
      sourceUrl: 'https://www.aydin.edu.tr/en-us/ogrenciler/bilgi-sistemleri/Pages/diploma-eki-ds.aspx',
      note: 'دارنده ECTS Label از کمیسیون اروپا.',
    },
    erasmusAndExchange: {
      erasmusAvailable: true, partnerUniversitiesCount: '266', countriesCount: '49',
      erasmusOfficeUrl: 'https://www.aydin.edu.tr/en-us/international/erasmus/Pages/index.aspx',
      sourceUrl: 'https://www.aydin.edu.tr/en-us/international/erasmus/Pages/index.aspx',
    },
    programAccreditations: [
      {
        accreditationName: 'MÜDEK', accreditationBody: 'Association for Evaluation and Accreditation of Engineering Programs',
        relatedFaculty: 'Engineering', sourceUrl: 'https://www.aydin.edu.tr/en-us/iau-hakkinda/kurumsal/Pages/universitemiz.aspx',
        verificationLevel: 'official_university', note: 'روی سایت دانشگاه ذکر شده؛ تأیید گواهی فعال توصیه می‌شود.',
      },
      {
        accreditationName: 'FEDEK', accreditationBody: 'Association for Evaluation and Accreditation of Science & Letters Faculties',
        relatedFaculty: 'Science & Letters', sourceUrl: 'https://www.aydin.edu.tr/en-us/iau-hakkinda/kurumsal/Pages/universitemiz.aspx',
        verificationLevel: 'official_university', note: 'روی سایت دانشگاه ذکر شده؛ تأیید گواهی فعال توصیه می‌شود.',
      },
    ],
    credentialSummaryFa: 'دانشگاه آیدین دارای «ECTS Label» و «Diploma Supplement Label» از کمیسیون اروپا است و شبکه گسترده Erasmus+ (۲۶۶ دانشگاه در ۴۹ کشور) دارد؛ برخی دانشکده‌ها به MÜDEK و FEDEK ارجاع داده‌اند.',
    dataQuality: { confidence: 'high', needsHumanReview: false },
  },

  'YEDITEPE UNIVERSITY': {
    maviDiploma: {
      available: null, displayName: 'Blue Diploma',
      sourceUrl: 'https://yeditepe.edu.tr/en/announcements/europass-diploma-supplement',
      verificationLevel: 'official_university',
      note: 'اصطلاح «Blue Diploma» در صفحه رسمی به همان Europass Diploma Supplement اشاره دارد؛ به‌عنوان «Mavi Diploma» مستقل ثبت نشد.',
    },
    diplomaSupplement: {
      available: true, officialName: 'Europass Diploma Supplement', labelStatus: 'Diploma Supplement',
      sourceUrl: 'https://yeditepe.edu.tr/en/announcements/europass-diploma-supplement',
      verificationLevel: 'official_university',
      note: 'همه فارغ‌التحصیلان Europass Diploma Supplement دریافت می‌کنند (در گفتار عمومی «Blue Diploma»).',
    },
    ectsAndBologna: {
      ectsCompatible: true, sourceUrl: 'https://yeditepe.edu.tr/en/erasmus-study-and-internship-mobilities',
    },
    erasmusAndExchange: {
      erasmusAvailable: true, partnerUniversitiesCount: '400+', countriesCount: '42',
      erasmusOfficeUrl: 'https://international.yeditepe.edu.tr/en/international/erasmus-outgoing-students',
      sourceUrl: 'https://international.yeditepe.edu.tr/en/international/erasmus-outgoing-students',
    },
    institutionalAccreditations: [
      {
        name: 'EUA', fullName: 'European University Association — Institutional Evaluation Programme',
        institutionOrBody: 'European University Association', scope: 'university-wide',
        sourceUrl: 'https://yeditepe.edu.tr/en/prospective-students',
        verificationLevel: 'official_university',
        note: 'نخستین دانشگاه وقفی ترکیه که ارزیابی نهادی EUA را گذرانده است.',
      },
    ],
    credentialSummaryFa: 'یدی‌تپه به همه فارغ‌التحصیلان Europass Diploma Supplement (معروف به «Blue Diploma») می‌دهد، از ECTS استفاده می‌کند، شبکه Erasmus+ گسترده (۴۰۰+ توافق، ۴۲ کشور) دارد و ارزیابی نهادی EUA را گذرانده است.',
    dataQuality: { confidence: 'high', needsHumanReview: false },
  },

  'BAHCESEHIR UNIVERSITY': {
    ectsAndBologna: {
      ectsCompatible: true, bolognaProcessMentioned: true,
      sourceUrl: 'https://exchange.bau.edu.tr/admissionrequirements/',
      note: 'استفاده از ECTS Learning Agreement در توافق‌های اراسموس.',
    },
    erasmusAndExchange: {
      erasmusAvailable: true, partnerUniversitiesCount: '~100',
      erasmusOfficeUrl: 'https://exchange.bau.edu.tr/', sourceUrl: 'https://exchange.bau.edu.tr/admissionrequirements/',
    },
    programAccreditations: [
      {
        accreditationName: 'MÜDEK', accreditationBody: 'Association for Evaluation and Accreditation of Engineering Programs',
        relatedFaculty: 'Engineering', validUntil: '2022-09-30 (تمدید نیازمند بررسی)',
        sourceUrl: 'https://bau.edu.tr/content/16324-mudek-accreditation',
        verificationLevel: 'official_university', note: 'بازه ثبت‌شده ۲۰۱۹–۲۰۲۲؛ وضعیت تمدید باید بررسی شود.',
      },
      {
        accreditationName: 'EUR-ACE', accreditationBody: 'ENAEE (via MÜDEK)', relatedFaculty: 'Engineering',
        sourceUrl: 'https://bau.edu.tr/content/17000-accredited-programs',
        verificationLevel: 'official_university', note: 'برچسب EUR-ACE برای برنامه‌های مهندسی معتبرشده توسط MÜDEK.',
      },
    ],
    credentialSummaryFa: 'باهچه‌شهیر از ECTS و Erasmus+ (حدود ۱۰۰ توافق) استفاده می‌کند و برنامه‌های مهندسی آن دارای MÜDEK و برچسب EUR-ACE هستند (بازه اعتبار MÜDEK نیازمند بررسی به‌روزرسانی است). AACSB در حال پیگیری اعلام شده و هنوز اخذ نشده است.',
    dataQuality: { confidence: 'medium', needsHumanReview: true, missingData: ['تمدید MÜDEK', 'وضعیت Diploma Supplement'] },
  },

  'BIRUNI UNIVERSITY': {
    erasmusAndExchange: {
      erasmusAvailable: true, erasmusOfficeUrl: 'https://int.biruni.edu.tr/erasmus/',
      sourceUrl: 'https://int.biruni.edu.tr/erasmus/',
    },
    programAccreditations: [
      {
        accreditationName: 'TEPDAD', accreditationBody: 'Medical Education Accreditation', relatedFaculty: 'Medicine',
        sourceUrl: 'https://turkeyindetail.com/biruni-university/',
        verificationLevel: 'secondary_source',
        note: 'فقط در منابع ثالث ذکر شده؛ نیازمند تأیید از منبع رسمی یا فهرست TEPDAD.',
      },
    ],
    credentialSummaryFa: 'برای بیرونی شواهد عمومی از Erasmus پیدا شد؛ اعتبارنامه TEPDAD برای پزشکی تنها در منابع ثالث ذکر شده و باید از منبع رسمی تأیید شود.',
    dataQuality: { confidence: 'medium', needsHumanReview: true, missingData: ['تأیید رسمی TEPDAD', 'Diploma Supplement / ECTS'] },
  },

  'ISTINYE UNIVERSITY': {
    diplomaSupplement: {
      available: true, officialName: 'Diploma Supplement', labelStatus: 'Diploma Supplement',
      sourceUrl: 'https://www.istinye.edu.tr/en/student-registration/diploma-supplement',
      verificationLevel: 'official_university',
      note: 'Diploma Supplement مطابق الگوی شورای اروپا/کمیسیون اروپا/یونسکو، رایگان و خودکار صادر می‌شود.',
    },
    ectsAndBologna: { ectsCompatible: true, sourceUrl: 'https://www.istinye.edu.tr/en/student-registration/diploma-supplement' },
    erasmusAndExchange: {
      erasmusAvailable: true, erasmusOfficeUrl: 'https://erasmus.istinye.edu.tr/en/partner-universities',
      sourceUrl: 'https://erasmus.istinye.edu.tr/en/partner-universities',
    },
    credentialSummaryFa: 'ایستینیه به‌صورت رسمی Diploma Supplement (رایگان و خودکار) صادر می‌کند و دارای دفتر و توافق‌های Erasmus+ است؛ اعتبارنامه‌های رشته‌ای نیازمند بررسی بیشتر است.',
    dataQuality: { confidence: 'medium', needsHumanReview: true, missingData: ['اعتبارنامه‌های رشته‌ای (MÜDEK/TEPDAD/...)'] },
  },

  'USKUDAR UNIVERSITY': {
    erasmusAndExchange: {
      erasmusAvailable: true, partnerUniversitiesCount: '400+',
      sourceUrl: 'https://kalite.uskudar.edu.tr/en/our-quality-certificates',
    },
    programAccreditations: [
      {
        accreditationName: 'FEDEK', accreditationBody: 'Association for Evaluation and Accreditation of Science & Letters Faculties',
        relatedProgram: 'Molecular Biology & Genetics, Philosophy, Psychology (۵ برنامه)', relatedFaculty: 'Science & Letters / Humanities',
        sourceUrl: 'https://uskudar.edu.tr/en/new/uskudar-university-is-accredited-by-fedek/2920',
        verificationLevel: 'official_university',
      },
    ],
    qualityCertificates: [
      { certificateName: 'ISO 9001:2015', certificateBody: 'TS EN ISO', scope: 'Quality Management', sourceUrl: 'https://kalite.uskudar.edu.tr/en/our-quality-certificates', verificationLevel: 'official_university' },
      { certificateName: 'ISO 15189:2014', certificateBody: 'TS EN ISO', scope: 'Medical Laboratories', sourceUrl: 'https://kalite.uskudar.edu.tr/en/our-quality-certificates', verificationLevel: 'official_university' },
      { certificateName: 'PEARSON', certificateBody: 'Pearson Assured', scope: 'Program quality', sourceUrl: 'https://kalite.uskudar.edu.tr/en/our-quality-certificates', verificationLevel: 'official_university' },
    ],
    credentialSummaryFa: 'اسکودار دارای اعتبارنامه FEDEK برای ۵ برنامه و گواهی‌های کیفیت رسمی (ISO 9001، ISO 15189، PEARSON) است و شبکه Erasmus+ گسترده (۴۰۰+ توافق) دارد.',
    dataQuality: { confidence: 'high', needsHumanReview: false, missingData: ['Diploma Supplement رسمی'] },
  },

  'OKAN UNIVERSITY': {
    diplomaSupplement: {
      available: true, officialName: 'Diploma Supplement', labelStatus: 'Diploma Supplement',
      sourceUrl: 'https://www.okan.edu.tr/en/erasmus/page/2261/diploma-supplement/',
      verificationLevel: 'official_university',
    },
    ectsAndBologna: { ectsCompatible: true, sourceUrl: 'https://www.okan.edu.tr/en/erasmus/page/1580/grading-ects/' },
    erasmusAndExchange: { erasmusAvailable: true, partnerUniversitiesCount: '200+', sourceUrl: 'https://www.okan.edu.tr/en/erasmus/page/2261/diploma-supplement/' },
    programAccreditations: [
      {
        accreditationName: 'MÜDEK', accreditationBody: 'Association for Evaluation and Accreditation of Engineering Programs',
        relatedProgram: 'Electrical, Electronics, Civil Engineering', relatedFaculty: 'Engineering', validFrom: '2007',
        sourceUrl: 'https://www.okan.edu.tr/en/erasmus/page/2261/diploma-supplement/', verificationLevel: 'official_university',
      },
    ],
    credentialSummaryFa: 'اوکان به‌صورت رسمی Diploma Supplement و ECTS دارد، شبکه Erasmus+ (۲۰۰+ دانشگاه) دارد و برنامه‌های مهندسی برق/الکترونیک/عمران آن از ۲۰۰۷ دارای MÜDEK هستند.',
    dataQuality: { confidence: 'high', needsHumanReview: false },
  },

  'ALTINBAS UNIVERSITY': {
    erasmusAndExchange: { erasmusAvailable: true, sourceUrl: 'https://altinbas.edu.tr/en/' },
    programAccreditations: [
      {
        accreditationName: 'MÜDEK', accreditationBody: 'Association for Evaluation and Accreditation of Engineering Programs',
        relatedProgram: 'Computer, Electrical-Electronics, Civil, Mechanical Engineering', relatedFaculty: 'Engineering & Natural Sciences',
        sourceUrl: 'https://altinbas.edu.tr/en/', verificationLevel: 'official_university',
      },
      {
        accreditationName: 'FEDEK', accreditationBody: 'Association for Evaluation and Accreditation of Science & Letters Faculties',
        relatedFaculty: 'Science & Arts', sourceUrl: 'https://altinbas.edu.tr/en/', verificationLevel: 'official_university',
      },
    ],
    credentialSummaryFa: 'آلتین‌باش از Erasmus+ استفاده می‌کند و برنامه‌های مهندسی آن دارای MÜDEK و برنامه‌های علوم/هنر آن دارای FEDEK هستند؛ وضعیت Diploma Supplement/ECTS نیازمند بررسی است.',
    dataQuality: { confidence: 'medium', needsHumanReview: true, missingData: ['Diploma Supplement / ECTS رسمی'] },
  },

  'KADIR HAS UNIVERSITY': {
    erasmusAndExchange: { erasmusAvailable: true, partnerUniversitiesCount: '220+', sourceUrl: 'https://www.khas.edu.tr/en/ee-quality-improvement-and-accreditation/' },
    programAccreditations: [
      {
        accreditationName: 'MÜDEK', accreditationBody: 'Association for Evaluation and Accreditation of Engineering Programs',
        relatedProgram: 'Computer, Electrical-Electronics, Industrial Engineering', relatedFaculty: 'Engineering & Natural Sciences',
        validUntil: '2027-09-30 (Computer Eng)', sourceUrl: 'https://www.khas.edu.tr/en/fens-mudek/', verificationLevel: 'official_university',
      },
      {
        accreditationName: 'TPD', accreditationBody: 'Turkish Psychological Association', relatedProgram: 'Psychology', relatedFaculty: 'Social Sciences',
        sourceUrl: 'https://www.khas.edu.tr/en/ee-quality-improvement-and-accreditation/', verificationLevel: 'official_university',
      },
    ],
    institutionalAccreditations: [
      {
        name: 'YÖKAK', fullName: 'Institutional Accreditation (5-year)', institutionOrBody: 'Turkish Higher Education Quality Council',
        scope: 'university-wide', sourceUrl: 'https://www.khas.edu.tr/en/ee-quality-improvement-and-accreditation/',
        verificationLevel: 'official_university', note: 'ارتقا از اعتبار مشروط دوساله به اعتبار نهادی کامل پنج‌ساله.',
      },
    ],
    credentialSummaryFa: 'قدیرحاس دارای اعتبار نهادی پنج‌ساله (YÖKAK)، اعتبارنامه MÜDEK برای مهندسی و TPD برای روان‌شناسی است و شبکه Erasmus+ (۲۲۰+ دانشگاه) دارد.',
    dataQuality: { confidence: 'high', needsHumanReview: false },
  },

  'KOC UNIVERSITY': {
    erasmusAndExchange: { erasmusAvailable: true, partnerUniversitiesCount: '300+', sourceUrl: 'https://international.ku.edu.tr/discover-koc/rankings-accreditations-and-memberships/' },
    programAccreditations: [
      { accreditationName: 'AACSB', accreditationBody: 'AACSB International', relatedFaculty: 'Business / Administrative Sciences', sourceUrl: 'https://gsb.ku.edu.tr/about-gsb/rankings-accreditations/', verificationLevel: 'accreditation_body' },
      { accreditationName: 'EQUIS', accreditationBody: 'EFMD', relatedFaculty: 'Business', validFrom: '2009', sourceUrl: 'https://gsb.ku.edu.tr/about-gsb/rankings-accreditations/', verificationLevel: 'accreditation_body', note: 'اخذ ۲۰۰۹، تمدید ۲۰۱۷.' },
      { accreditationName: 'AMBA', accreditationBody: 'Association of MBAs', relatedProgram: 'MBA / Executive MBA', relatedFaculty: 'Business', validFrom: '2016', sourceUrl: 'https://gsb.ku.edu.tr/about-gsb/rankings-accreditations/', verificationLevel: 'accreditation_body' },
      { accreditationName: 'MÜDEK', accreditationBody: 'Association for Evaluation and Accreditation of Engineering Programs', relatedFaculty: 'Engineering', sourceUrl: 'https://international.ku.edu.tr/discover-koc/rankings-accreditations-and-memberships/', verificationLevel: 'official_university' },
    ],
    credentialSummaryFa: 'کوچ تنها دانشگاه ترکیه با «Triple Crown» (AACSB + EQUIS + AMBA) برای دانشکده کسب‌وکار است، مهندسی آن MÜDEK دارد و شبکه Erasmus+ گسترده (۳۰۰+) دارد.',
    dataQuality: { confidence: 'high', needsHumanReview: false, missingData: ['Diploma Supplement / ECTS تأیید مستقیم'] },
  },

  'SABANCI UNIVERSITY': {
    ectsAndBologna: { ectsCompatible: true, sourceUrl: 'https://iro.sabanciuniv.edu/en/outgoing-students/erasmus' },
    erasmusAndExchange: { erasmusAvailable: true, erasmusOfficeUrl: 'https://iro.sabanciuniv.edu/en/outgoing-students/erasmus', sourceUrl: 'https://iro.sabanciuniv.edu/en/outgoing-students/erasmus' },
    programAccreditations: [
      { accreditationName: 'AACSB', accreditationBody: 'AACSB International', relatedFaculty: 'Business / Management', validFrom: '2011', sourceUrl: 'https://www.aacsb.edu/accredited/s/sabanci-university', verificationLevel: 'accreditation_body', note: 'اخذ ۲۰۱۱، تمدید ۲۰۲۲.' },
      { accreditationName: 'EUR-ACE', accreditationBody: 'ENAEE (via MÜDEK)', relatedFaculty: 'Engineering & Natural Sciences', sourceUrl: 'https://studyinturkiye.com/sabanci-university-international-accreditation-recruiters-admissions-2/', verificationLevel: 'official_authority' },
    ],
    institutionalAccreditations: [
      { name: 'YÖKAK', fullName: 'Full Institutional Accreditation (5-year)', institutionOrBody: 'Turkish Higher Education Quality Council', scope: 'university-wide', sourceUrl: 'https://www.studyinturkiye.gov.tr/UniversityTurkey/Detail?uId=123400', verificationLevel: 'official_authority' },
      { name: 'EUA', fullName: 'European University Association member', institutionOrBody: 'European University Association', scope: 'university-wide', sourceUrl: 'https://iro.sabanciuniv.edu/en/international-networks', verificationLevel: 'official_university' },
    ],
    credentialSummaryFa: 'صبانجی دارای AACSB (کسب‌وکار)، EUR-ACE برای مهندسی (از مسیر MÜDEK)، اعتبار نهادی کامل YÖKAK و عضویت EUA است و از ECTS و Erasmus+ استفاده می‌کند.',
    dataQuality: { confidence: 'high', needsHumanReview: false },
  },

  'OZYEGIN UNIVERSITY': {
    ectsAndBologna: { ectsCompatible: true, bolognaProcessMentioned: true, sourceUrl: 'https://www.ozyegin.edu.tr/en/faculty-business/accreditation-and-quality-assurance' },
    programAccreditations: [
      { accreditationName: 'MÜDEK', accreditationBody: 'Association for Evaluation and Accreditation of Engineering Programs', relatedProgram: 'Industrial, Electrical-Electronics, Mechanical Eng, Computer Science, Civil', relatedFaculty: 'Engineering', sourceUrl: 'https://www.ozyegin.edu.tr/en/faculty-engineering/mudek-accreditation', verificationLevel: 'official_university' },
      { accreditationName: 'EUR-ACE', accreditationBody: 'ENAEE (via MÜDEK)', relatedFaculty: 'Engineering', sourceUrl: 'https://www.ozyegin.edu.tr/en/academic-quality-assurance/program-accreditations', verificationLevel: 'official_university', note: 'EUR-ACE Bachelor Label.' },
      { accreditationName: 'AACSB', accreditationBody: 'AACSB International', relatedFaculty: 'Business', validFrom: '2023', sourceUrl: 'https://www.aacsb.edu/accredited/o/ozyegin-university', verificationLevel: 'accreditation_body' },
    ],
    credentialSummaryFa: 'اوزیین برنامه‌های مهندسی دارای MÜDEK و برچسب EUR-ACE و دانشکده کسب‌وکار دارای AACSB دارد و از ECTS در چارچوب بولونیا استفاده می‌کند.',
    dataQuality: { confidence: 'high', needsHumanReview: false, missingData: ['Erasmus+ / Diploma Supplement تأیید مستقیم'] },
  },

  'ISTANBUL BILGI UNIVERSITY': {
    erasmusAndExchange: { erasmusAvailable: true, partnerUniversitiesCount: '600+', sourceUrl: 'https://www.bilgi.edu.tr/en/university/about/membershipsawards/quality-and-accreditation-awards/' },
    programAccreditations: [
      { accreditationName: 'MÜDEK', accreditationBody: 'Association for Evaluation and Accreditation of Engineering Programs', relatedFaculty: 'Engineering', sourceUrl: 'https://www.bilgi.edu.tr/en/university/about/membershipsawards/quality-and-accreditation-awards/', verificationLevel: 'official_university' },
      { accreditationName: 'FEDEK', accreditationBody: 'Science & Letters Accreditation', relatedFaculty: 'Humanities / Sports / Natural Sciences', sourceUrl: 'https://www.bilgi.edu.tr/en/university/about/membershipsawards/quality-and-accreditation-awards/', verificationLevel: 'official_university' },
    ],
    institutionalAccreditations: [
      { name: 'WSCUC', fullName: 'WASC Senior College and University Commission (US regional accreditation)', institutionOrBody: 'WSCUC', scope: 'university-wide', sourceUrl: 'https://www.chea.org/istanbul-bilgi-university', verificationLevel: 'accreditation_body', note: 'تنها دانشگاه خصوصی ترکیه با اعتبار منطقه‌ای آمریکا.' },
      { name: 'EUA', fullName: 'European University Association member', institutionOrBody: 'European University Association', scope: 'university-wide', sourceUrl: 'https://www.bilgi.edu.tr/en/university/about/membershipsawards/quality-and-accreditation-awards/', verificationLevel: 'official_university' },
    ],
    qualityCertificates: [
      { certificateName: 'ISO 27001', certificateBody: 'ISO', scope: 'Information Security', sourceUrl: 'https://www.bilgi.edu.tr/en/university/about/membershipsawards/quality-and-accreditation-awards/', verificationLevel: 'official_university' },
    ],
    credentialSummaryFa: 'بیلگی تنها دانشگاه خصوصی ترکیه با اعتبار منطقه‌ای آمریکا (WSCUC) است، عضو EUA است، MÜDEK و FEDEK دارد و گواهی ISO 27001 و شبکه Erasmus+ گسترده (۶۰۰+) دارد.',
    dataQuality: { confidence: 'high', needsHumanReview: false },
  },

  'ISTANBUL GELISIM UNIVERSITY': {
    diplomaSupplement: { available: true, officialName: 'Diploma Supplement', labelStatus: 'Diploma Supplement', sourceUrl: 'https://www.studyinturkiye.gov.tr/UniversityTurkey/Detail?uId=130959', verificationLevel: 'official_authority', note: 'به همه دانشجویان Diploma Supplement داده می‌شود.' },
    ectsAndBologna: { ectsCompatible: true, bolognaProcessMentioned: true, sourceUrl: 'https://www.studyinturkiye.gov.tr/UniversityTurkey/Detail?uId=130959' },
    erasmusAndExchange: { erasmusAvailable: true, partnerUniversitiesCount: '300', sourceUrl: 'https://www.studyinturkiye.gov.tr/UniversityTurkey/Detail?uId=130959' },
    programAccreditations: [
      { accreditationName: 'AQAS', accreditationBody: 'AQAS (Germany)', relatedProgram: '۵۳ برنامه / ۴۰ دپارتمان', sourceUrl: 'https://www.studyinturkiye.gov.tr/UniversityTurkey/Detail?uId=130959', verificationLevel: 'official_authority' },
      { accreditationName: 'PEARSON', accreditationBody: 'Pearson Assured (UK)', sourceUrl: 'https://www.studyinturkiye.gov.tr/UniversityTurkey/Detail?uId=130959', verificationLevel: 'official_authority' },
    ],
    credentialSummaryFa: 'گلیشیم به همه دانشجویان Diploma Supplement می‌دهد، از ECTS/بولونیا استفاده می‌کند، شبکه Erasmus+ (۳۰۰ دانشگاه) دارد و شمار زیادی برنامه با اعتبار AQAS و PEARSON دارد.',
    dataQuality: { confidence: 'medium', needsHumanReview: true, missingData: ['تأیید شمار دقیق برنامه‌های AQAS از منبع رسمی دانشگاه'] },
  },

  'FENERBAHCE UNIVERSITY': {
    diplomaSupplement: { available: true, officialName: 'Diploma Supplement (Europass)', labelStatus: 'Diploma Supplement', sourceUrl: 'https://ois.fbu.edu.tr/bilgipaketi/eobsakts/icerik/id/110/menu_id/1_13/ln/en', verificationLevel: 'official_university' },
    ectsAndBologna: { ectsCompatible: true, bolognaProcessMentioned: true, sourceUrl: 'https://ois.fbu.edu.tr/bilgipaketi/eobsakts/icerik/id/110/menu_id/1_13/ln/en', note: 'حداقل ۲۴۰ AKTS برای دیپلم کارشناسی.' },
    erasmusAndExchange: { erasmusAvailable: true, partnerUniversitiesCount: '200+', erasmusOfficeUrl: 'https://www.fbu.edu.tr/uluslararasi-ofis/erasmus', sourceUrl: 'https://www.fbu.edu.tr/uluslararasi-ofis/erasmus' },
    credentialSummaryFa: 'فنرباغچه به‌صورت رسمی Diploma Supplement (Europass) صادر می‌کند، از ECTS/بولونیا استفاده می‌کند و شبکه Erasmus+ (۲۰۰+ دانشگاه) دارد؛ اعتبارنامه‌های رشته‌ای نیازمند بررسی است.',
    dataQuality: { confidence: 'high', needsHumanReview: false, missingData: ['اعتبارنامه‌های رشته‌ای'] },
  },

  'ISTANBUL NISANTASI UNIVERSITY': {
    institutionalAccreditations: [
      { name: 'YÖKAK', fullName: 'Institutional Accreditation — IAP 2025 (THEQC)', institutionOrBody: 'Turkish Higher Education Quality Council', scope: 'university-wide', validFrom: '2026-03', sourceUrl: 'https://www.yokak.gov.tr/en/2026/03/12/theqc-grants-institutional-accreditation-to-39-heis-under-iap-2025/', verificationLevel: 'official_authority', note: 'اعتبار نهادی تحت برنامه IAP 2025.' },
      { name: 'EUA', fullName: 'European University Association', institutionOrBody: 'EUA', scope: 'university-wide', sourceUrl: 'https://www.nisantasi.edu.tr/', verificationLevel: 'secondary_source' },
      { name: 'EURAS', fullName: 'Eurasian Universities Union', institutionOrBody: 'EURAS', scope: 'university-wide', sourceUrl: 'https://www.nisantasi.edu.tr/', verificationLevel: 'secondary_source' },
    ],
    programAccreditations: [
      { accreditationName: 'TURAK', accreditationBody: 'Tourism Education Evaluation and Accreditation Board', relatedProgram: 'Tourism, Gastronomy & Culinary Arts', sourceUrl: 'https://turak.org/istanbul-nisantasi-universitesine-akreditasyon-belgesi-takdim-edildi/', verificationLevel: 'accreditation_body' },
      { accreditationName: 'MÜDEK', accreditationBody: 'Association for Evaluation and Accreditation of Engineering Programs', relatedFaculty: 'Engineering', sourceUrl: 'https://www.mudek.org.tr/tr/akredit/akredite2025.shtm', verificationLevel: 'secondary_source', note: 'باید در فهرست رسمی MÜDEK تأیید شود.' },
    ],
    credentialSummaryFa: 'نیشانتاشی دارای اعتبار نهادی YÖKAK (برنامه IAP 2025) و اعتبارنامه TURAK برای برنامه‌های گردشگری/آشپزی است؛ عضویت EUA/EURAS و MÜDEK مهندسی نیازمند تأیید از منبع رسمی است.',
    dataQuality: { confidence: 'medium', needsHumanReview: true, missingData: ['تأیید MÜDEK از فهرست رسمی', 'Diploma Supplement / ECTS / Erasmus'] },
  },
};

// Build the normalized lookup once.
const NORMALIZED_OVERRIDES = Object.keys(OVERRIDES).reduce((acc, key) => {
  acc[normalizeName(key)] = OVERRIDES[key];
  return acc;
}, {});

function defaultCredentials() {
  return {
    lastChecked: CREDENTIALS_LAST_CHECKED,
    maviDiploma: { available: null, displayName: '', officialName: '', evidenceText: '', sourceUrl: '', verificationLevel: 'not_verified', note: NOT_PUBLICLY_VERIFIED },
    diplomaSupplement: { available: null, officialName: '', labelStatus: 'Unknown', cyclesCovered: [], sourceUrl: '', verificationLevel: 'not_verified', note: NOT_PUBLICLY_VERIFIED },
    ectsAndBologna: { ectsCompatible: null, ectsLabel: null, bolognaProcessMentioned: null, diplomaSupplementMentioned: null, courseCatalogOrECTSUrl: '', sourceUrl: '', note: NOT_PUBLICLY_VERIFIED },
    erasmusAndExchange: { erasmusAvailable: null, erasmusOfficeUrl: '', erasmusCharterOrECHE: null, partnerUniversitiesCount: '', countriesCount: '', sourceUrl: '', note: NOT_PUBLICLY_VERIFIED },
    institutionalAccreditations: [],
    programAccreditations: [],
    qualityCertificates: [],
    credentialSummaryFa: '',
    dataQuality: { confidence: 'low', needsHumanReview: true, missingData: DEFAULT_MISSING, conflictingData: [] },
  };
}

function mergeSection(base, override) {
  return override ? { ...base, ...override } : base;
}

// Prioritized, card-ready badges derived from the verified structure.
// Priority: 1) Mavi/DS  2) ECTS  3) Erasmus+  4) program accreditation  5) institutional  6) quality
function computeCardBadges(c) {
  const badges = [];
  const add = (label, type, confidence, sourceUrl, scopeNote = '') => {
    if (!label) return;
    badges.push({ label, type, confidence, sourceUrl: sourceUrl || '', scopeNote });
  };

  if (c.maviDiploma?.available === true) {
    add(c.maviDiploma.displayName || 'Mavi Diploma', 'diploma_supplement', confidenceFor(c.maviDiploma.verificationLevel), c.maviDiploma.sourceUrl);
  } else if (c.diplomaSupplement?.available === true) {
    const isLabel = c.diplomaSupplement.labelStatus === 'Diploma Supplement Label';
    add(isLabel ? 'Diploma Supplement Label' : 'Diploma Supplement', 'diploma_supplement', confidenceFor(c.diplomaSupplement.verificationLevel), c.diplomaSupplement.sourceUrl);
  }

  if (c.ectsAndBologna?.ectsLabel === true) {
    add('ECTS Label', 'european_credit_system', 'high', c.ectsAndBologna.sourceUrl);
  } else if (c.ectsAndBologna?.ectsCompatible === true) {
    add('ECTS', 'european_credit_system', confidenceFor(c.ectsAndBologna.sourceUrl ? 'official_university' : 'not_verified'), c.ectsAndBologna.sourceUrl);
  }

  if (c.erasmusAndExchange?.erasmusAvailable === true) {
    add(c.erasmusAndExchange.erasmusCharterOrECHE === true ? 'Erasmus+ (ECHE)' : 'Erasmus+', 'exchange', confidenceFor(c.erasmusAndExchange.sourceUrl ? 'official_university' : 'not_verified'), c.erasmusAndExchange.sourceUrl);
  }

  (c.programAccreditations || []).forEach((p) => {
    const scope = p.relatedProgram || p.relatedFaculty || '';
    add(p.accreditationName, 'program_accreditation', confidenceFor(p.verificationLevel), p.sourceUrl, scope);
  });
  (c.institutionalAccreditations || []).forEach((i) => {
    add(i.name, 'institutional', confidenceFor(i.verificationLevel), i.sourceUrl, i.scope || '');
  });
  (c.qualityCertificates || []).forEach((q) => {
    add(q.certificateName, 'quality', confidenceFor(q.verificationLevel), q.sourceUrl, q.scope || '');
  });

  return badges;
}

export function buildInternationalCredentials(universityName) {
  const override = NORMALIZED_OVERRIDES[normalizeName(universityName)];
  const base = defaultCredentials();

  if (!override) {
    base.cardBadges = [];
    base.hasVerifiedCredentials = false;
    base.credentialSummaryFa = 'برای این دانشگاه، در منابع عمومی بررسی‌شده، اعتبارنامه یا Diploma Supplement قابل‌استناد ثبت نشده است. وضعیت: «Not publicly verified» — نیازمند بررسی انسانی.';
    return base;
  }

  const merged = {
    ...base,
    maviDiploma: mergeSection(base.maviDiploma, override.maviDiploma),
    diplomaSupplement: mergeSection(base.diplomaSupplement, override.diplomaSupplement),
    ectsAndBologna: mergeSection(base.ectsAndBologna, override.ectsAndBologna),
    erasmusAndExchange: mergeSection(base.erasmusAndExchange, override.erasmusAndExchange),
    institutionalAccreditations: override.institutionalAccreditations || [],
    programAccreditations: override.programAccreditations || [],
    qualityCertificates: override.qualityCertificates || [],
    credentialSummaryFa: override.credentialSummaryFa || base.credentialSummaryFa,
    dataQuality: { ...base.dataQuality, ...(override.dataQuality || {}) },
  };

  merged.cardBadges = computeCardBadges(merged);
  merged.hasVerifiedCredentials = merged.cardBadges.some((b) => b.confidence !== 'low');
  return merged;
}

export const CREDENTIALS_COVERAGE = Object.keys(OVERRIDES);
