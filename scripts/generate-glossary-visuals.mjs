import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const outDir = path.resolve('public/assets/glossary');

const terms = [
  ['e-ikamet', 'laptop-form'],
  ['student-residence-permit', 'student-card'],
  ['turkey-migration-authority', 'government-passport'],
  ['short-term-residence-permit', 'calendar-suitcase'],
  ['residence-file-type', 'folders'],
  ['harc-fee', 'receipt-coins'],
  ['residence-card', 'id-card'],
  ['residence-fee-exemption', 'fee-exemption'],
  ['turkey-e-government', 'phone-key'],
  ['foreign-identity-number', 'number-id'],
  ['student-data-privacy', 'privacy-shield'],
  ['address-registration', 'map-pin'],
  ['proof-of-residence', 'home-document'],
  ['wrong-address-risk', 'wrong-map'],
  ['turkey-90-day-visa-exemption', 'passport-calendar'],
  ['turkey-90-180-rule', 'passport-calendar'],
  ['rolling-180-day-window', 'calendar-suitcase'],
  ['turkey-re-entry', 'passport-stamp'],
  ['remaining-visa-free-days', 'calendar-suitcase'],
  ['conditional-entry-10-days', 'calendar-clock'],
  ['lawful-stay-period', 'passport-calendar'],
  ['residence-randevu', 'calendar-clock'],
  ['residence-basvuru', 'application-upload'],
  ['residence-health-insurance', 'health-shield'],
  ['student-certificate', 'certificate-cap'],
  ['notarized-address-document', 'notary-address'],
  ['notarized-rental-contract', 'notary-address'],
  ['official-dormitory-letter', 'home-document'],
  ['turkey-nufus', 'government-passport'],
  ['yerlesim-yeri-belgesi', 'map-pin'],
  ['biometric-photo', 'biometric-camera'],
  ['passport-entry-stamp', 'passport-stamp'],
  ['previous-kimlik', 'previous-cards'],
  ['active-turkish-phone', 'active-phone'],
  ['marital-status', 'marital-form'],
  ['yimer-157', 'active-phone'],
  ['family-residence-permit', 'home-document'],
  ['residence-supporter', 'health-shield'],
  ['companion-residence', 'previous-cards'],
  ['family-relationship-proof', 'certificate-cap'],
  ['migration-office', 'government-passport'],
  ['unsafe-intermediary', 'wrong-map'],
  ['registered-consultancy', 'certificate-cap'],
];

const colors = {
  navy: '#071A3D',
  navy2: '#0A2B5E',
  cream: '#F7F1E8',
  cream2: '#EFE6D7',
  gold: '#C6A768',
  green: '#008767',
  green2: '#45C7A3',
  red: '#E35B4F',
  white: '#FFFFFF',
  ink: '#24324D',
  muted: '#99A0AE',
};

const shell = (slug, body) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-labelledby="title">
  <title>${slug} glossary concept visual</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${colors.cream}"/>
      <stop offset="0.55" stop-color="${colors.white}"/>
      <stop offset="1" stop-color="${colors.cream2}"/>
    </linearGradient>
    <linearGradient id="navy" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${colors.navy2}"/>
      <stop offset="1" stop-color="${colors.navy}"/>
    </linearGradient>
    <linearGradient id="green" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${colors.green2}"/>
      <stop offset="1" stop-color="${colors.green}"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-25%" width="140%" height="160%">
      <feDropShadow dx="0" dy="20" stdDeviation="22" flood-color="#071A3D" flood-opacity="0.14"/>
    </filter>
    <filter id="smallShadow" x="-20%" y="-25%" width="140%" height="160%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#071A3D" flood-opacity="0.13"/>
    </filter>
    <style>
      .line{stroke:${colors.navy};stroke-width:12;stroke-linecap:round;stroke-linejoin:round;fill:none}
      .thin{stroke:${colors.navy};stroke-width:7;stroke-linecap:round;stroke-linejoin:round;fill:none}
      .mutedLine{stroke:${colors.muted};stroke-width:8;stroke-linecap:round;fill:none}
      .paper{fill:${colors.white};stroke:#E6E1D8;stroke-width:3;filter:url(#smallShadow)}
      .chip{fill:${colors.cream};stroke:#E8DDCA;stroke-width:3}
    </style>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="1040" cy="120" r="210" fill="${colors.green}" opacity="0.08"/>
  <circle cx="190" cy="590" r="250" fill="${colors.gold}" opacity="0.10"/>
  <path d="M85 210C215 110 365 90 525 148" class="thin" opacity="0.08"/>
  <path d="M805 612C940 520 1060 508 1198 568" class="thin" opacity="0.08"/>
  ${body}
</svg>`;

const lineRows = (x, y, widths = [170, 230, 145], gap = 34) => widths.map((w, i) =>
  `<rect x="${x}" y="${y + i * gap}" width="${w}" height="14" rx="7" fill="${i === 0 ? colors.navy : colors.muted}" opacity="${i === 0 ? 0.28 : 0.34}"/>`
).join('');

const documentSvg = (x, y, w, h, accent = colors.green) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="30" class="paper"/>
  <rect x="${x + 42}" y="${y + 42}" width="${w * 0.34}" height="18" rx="9" fill="${accent}" opacity="0.9"/>
  ${lineRows(x + 42, y + 92, [w * 0.70, w * 0.58, w * 0.66, w * 0.48], 42)}
  <rect x="${x + 42}" y="${y + h - 86}" width="${w - 84}" height="40" rx="20" fill="${colors.cream}"/>
`;

const cardSvg = (x, y, w, h, accent = colors.green) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="34" fill="${colors.white}" stroke="#DDE3E6" stroke-width="3" filter="url(#softShadow)"/>
  <circle cx="${x + 78}" cy="${y + 82}" r="38" fill="url(#green)"/>
  <rect x="${x + 140}" y="${y + 54}" width="${w - 205}" height="16" rx="8" fill="${colors.navy}" opacity="0.25"/>
  <rect x="${x + 140}" y="${y + 92}" width="${w - 260}" height="13" rx="7" fill="${colors.muted}" opacity="0.38"/>
  <rect x="${x + 42}" y="${y + h - 72}" width="${w - 84}" height="46" rx="23" fill="${accent}" opacity="0.12"/>
`;

const laptop = () => `
  <rect x="272" y="158" width="620" height="376" rx="34" fill="url(#navy)" filter="url(#softShadow)"/>
  <rect x="305" y="190" width="554" height="306" rx="22" fill="${colors.white}"/>
  <rect x="358" y="242" width="160" height="18" rx="9" fill="${colors.green}"/>
  ${lineRows(358, 295, [405, 300, 360, 250], 46)}
  <rect x="358" y="448" width="270" height="38" rx="19" fill="${colors.green}" opacity="0.16"/>
  <path d="M208 538h748l66 74H142l66-74z" fill="${colors.navy}" filter="url(#smallShadow)"/>
  <path d="M760 402l80 36-42 18 29 54-34 16-29-55-36 39 32-108z" fill="${colors.gold}" stroke="${colors.navy}" stroke-width="6"/>
`;

const studentCard = () => `
  <path d="M356 300c0-92 74-166 166-166s166 74 166 166-74 166-166 166-166-74-166-166z" fill="${colors.green}" opacity="0.12"/>
  <circle cx="520" cy="252" r="68" fill="${colors.gold}" opacity="0.95"/>
  <path d="M384 490c26-94 88-138 136-138s110 44 136 138" fill="url(#navy)" filter="url(#smallShadow)"/>
  <path d="M398 188l122-54 122 54-122 54-122-54z" fill="${colors.navy}"/>
  <path d="M640 194v78" class="thin"/>
  ${cardSvg(690, 248, 320, 210, colors.gold)}
  <path d="M180 554h220l-28-134H208l-28 134z" fill="${colors.white}" stroke="#E6E1D8" stroke-width="4" filter="url(#smallShadow)"/>
  <path d="M205 420l85-70 85 70" class="thin"/>
`;

const governmentPassport = () => `
  <path d="M298 520V280h520v240" fill="${colors.white}" stroke="#DFE3EA" stroke-width="4" filter="url(#softShadow)"/>
  <path d="M252 280h612L558 144 252 280z" fill="url(#navy)"/>
  ${[330, 430, 530, 630, 730].map((x) => `<rect x="${x}" y="310" width="52" height="210" rx="12" fill="${colors.cream}" stroke="#E3D8C7" stroke-width="3"/>`).join('')}
  <rect x="220" y="520" width="680" height="52" rx="20" fill="${colors.navy}"/>
  <rect x="805" y="166" width="250" height="340" rx="30" fill="${colors.navy}" filter="url(#softShadow)"/>
  <circle cx="930" cy="322" r="72" fill="${colors.gold}" opacity="0.92"/>
  <path d="M890 322h80M930 282v80" class="thin" stroke="${colors.navy}"/>
`;

const calendarSuitcase = () => `
  <rect x="282" y="168" width="420" height="350" rx="34" fill="${colors.white}" stroke="#E2DED7" stroke-width="4" filter="url(#softShadow)"/>
  <rect x="282" y="168" width="420" height="92" rx="34" fill="url(#green)"/>
  <circle cx="395" cy="345" r="34" fill="${colors.gold}"/>
  <circle cx="492" cy="345" r="34" fill="${colors.gold}" opacity="0.65"/>
  <circle cx="589" cy="345" r="34" fill="${colors.gold}" opacity="0.35"/>
  <text x="492" y="455" text-anchor="middle" font-size="92" font-family="Arial, sans-serif" font-weight="800" fill="${colors.navy}">90</text>
  <rect x="720" y="282" width="250" height="230" rx="38" fill="${colors.navy}" filter="url(#smallShadow)"/>
  <path d="M785 282v-42c0-28 24-52 60-52s60 24 60 52v42" class="thin" stroke="${colors.navy}"/>
  <rect x="758" y="340" width="176" height="26" rx="13" fill="${colors.gold}"/>
`;

const folders = () => `
  <path d="M292 212h260l54 54h382v310H292z" fill="${colors.gold}" filter="url(#softShadow)"/>
  <path d="M236 292h270l54 54h438v250H236z" fill="${colors.white}" stroke="#E4DED2" stroke-width="4" filter="url(#smallShadow)"/>
  <path d="M330 378h560M330 448h450M330 518h520" class="mutedLine"/>
  <circle cx="898" cy="478" r="72" fill="${colors.green}" opacity="0.18"/>
  <path d="M864 478h68M898 444v68" class="thin" stroke="${colors.green}"/>
`;

const receiptCoins = () => `
  ${documentSvg(348, 126, 355, 468, colors.gold)}
  <path d="M408 500h235" class="mutedLine"/>
  <circle cx="805" cy="438" r="88" fill="${colors.gold}" filter="url(#smallShadow)"/>
  <circle cx="882" cy="504" r="70" fill="${colors.green}" filter="url(#smallShadow)"/>
  <path d="M774 438h62M851 504h62" class="thin" stroke="${colors.white}"/>
`;

const idCard = () => `
  ${cardSvg(292, 196, 640, 330, colors.green)}
  <circle cx="430" cy="360" r="68" fill="${colors.gold}"/>
  <path d="M342 486c25-64 63-94 88-94s63 30 88 94" fill="${colors.navy}" opacity="0.85"/>
  <rect x="564" y="290" width="260" height="18" rx="9" fill="${colors.navy}" opacity="0.28"/>
  <rect x="564" y="346" width="310" height="16" rx="8" fill="${colors.muted}" opacity="0.42"/>
  <rect x="564" y="396" width="240" height="16" rx="8" fill="${colors.muted}" opacity="0.34"/>
`;

const feeExemption = () => `
  ${documentSvg(318, 150, 340, 430, colors.red)}
  <circle cx="792" cy="380" r="132" fill="${colors.green}" opacity="0.14"/>
  <path d="M792 248l112 46v74c0 86-50 142-112 174-62-32-112-88-112-174v-74l112-46z" fill="url(#green)" filter="url(#softShadow)"/>
  <path d="M735 389l36 36 84-94" stroke="${colors.white}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M440 436h100M414 482h152" class="mutedLine"/>
`;

const phoneKey = () => `
  <rect x="402" y="118" width="310" height="500" rx="48" fill="${colors.navy}" filter="url(#softShadow)"/>
  <rect x="432" y="168" width="250" height="390" rx="28" fill="${colors.white}"/>
  <circle cx="557" cy="596" r="16" fill="${colors.cream}"/>
  <rect x="474" y="226" width="166" height="18" rx="9" fill="${colors.green}"/>
  ${lineRows(474, 282, [150, 116, 166], 48)}
  <circle cx="818" cy="350" r="82" fill="${colors.gold}" filter="url(#smallShadow)"/>
  <path d="M806 350a34 34 0 1 0-18 30l-2 44h38v-34h34v-34h-42z" fill="${colors.navy}"/>
`;

const numberId = () => `
  ${cardSvg(302, 210, 620, 300, colors.gold)}
  <text x="612" y="390" text-anchor="middle" font-size="74" font-family="Arial, sans-serif" font-weight="800" letter-spacing="10" fill="${colors.navy}">99***</text>
  <circle cx="412" cy="358" r="56" fill="${colors.green}"/>
  <path d="M380 454c17-48 49-72 32-72s15 24 32 72" fill="${colors.navy}" opacity="0.55"/>
`;

const privacyShield = () => `
  <path d="M640 132l210 84v132c0 152-92 250-210 308-118-58-210-156-210-308V216l210-84z" fill="url(#navy)" filter="url(#softShadow)"/>
  <path d="M640 220l112 45v80c0 80-47 132-112 166-65-34-112-86-112-166v-80l112-45z" fill="${colors.green}" opacity="0.9"/>
  <rect x="586" y="338" width="108" height="92" rx="18" fill="${colors.white}"/>
  <path d="M606 338v-30c0-33 24-58 34-58s34 25 34 58v30" class="thin" stroke="${colors.white}"/>
  <circle cx="640" cy="382" r="12" fill="${colors.navy}"/>
`;

const mapPin = () => `
  <path d="M240 246l250-86 250 86 300-86v358l-300 86-250-86-250 86z" fill="${colors.white}" stroke="#E5DFD3" stroke-width="4" filter="url(#softShadow)"/>
  <path d="M490 160v358M740 246v358" class="mutedLine"/>
  <path d="M640 206c-88 0-160 70-160 156 0 126 160 258 160 258s160-132 160-258c0-86-72-156-160-156z" fill="url(#green)" filter="url(#smallShadow)"/>
  <circle cx="640" cy="360" r="58" fill="${colors.white}"/>
  <path d="M604 378l36-60 36 60z" fill="${colors.gold}"/>
`;

const homeDocument = () => `
  <path d="M296 498V330l164-136 164 136v168z" fill="${colors.white}" stroke="#E2DED7" stroke-width="5" filter="url(#softShadow)"/>
  <path d="M258 346l202-168 202 168" class="line"/>
  <rect x="418" y="404" width="84" height="94" rx="12" fill="${colors.gold}"/>
  ${documentSvg(706, 164, 300, 386, colors.green)}
  <path d="M760 466h194" class="mutedLine"/>
`;

const wrongMap = () => `
  <path d="M248 232l250-82 250 82 286-82v368l-286 82-250-82-250 82z" fill="${colors.white}" stroke="#E5DFD3" stroke-width="4" filter="url(#softShadow)"/>
  <path d="M498 150v368M748 232v368" class="mutedLine"/>
  <path d="M630 256c-70 0-128 56-128 126 0 100 128 210 128 210s128-110 128-210c0-70-58-126-128-126z" fill="${colors.red}" filter="url(#smallShadow)"/>
  <path d="M594 358l72 72M666 358l-72 72" stroke="${colors.white}" stroke-width="18" stroke-linecap="round"/>
`;

const passportCalendar = () => `
  <rect x="294" y="148" width="270" height="410" rx="34" fill="${colors.navy}" filter="url(#softShadow)"/>
  <circle cx="430" cy="332" r="82" fill="${colors.gold}"/>
  <path d="M350 332h160M430 252c42 54 42 106 0 160M430 252c-42 54-42 106 0 160" class="thin"/>
  <rect x="640" y="196" width="360" height="310" rx="34" fill="${colors.white}" stroke="#E2DED7" stroke-width="4" filter="url(#smallShadow)"/>
  <rect x="640" y="196" width="360" height="84" rx="34" fill="url(#green)"/>
  <text x="820" y="424" text-anchor="middle" font-size="96" font-family="Arial, sans-serif" font-weight="800" fill="${colors.navy}">90</text>
`;

const calendarClock = () => `
  <rect x="310" y="158" width="430" height="380" rx="36" fill="${colors.white}" stroke="#E2DED7" stroke-width="4" filter="url(#softShadow)"/>
  <rect x="310" y="158" width="430" height="96" rx="36" fill="url(#green)"/>
  <circle cx="520" cy="382" r="92" fill="${colors.cream}" stroke="#E4D9C7" stroke-width="4"/>
  <path d="M520 326v62l48 34" class="line"/>
  <circle cx="824" cy="414" r="112" fill="${colors.gold}" opacity="0.95" filter="url(#smallShadow)"/>
  <path d="M780 414h88M824 370v88" class="thin"/>
`;

const applicationUpload = () => `
  ${documentSvg(310, 132, 430, 470, colors.green)}
  <circle cx="842" cy="376" r="124" fill="url(#green)" filter="url(#softShadow)"/>
  <path d="M842 452V300M782 360l60-60 60 60" stroke="${colors.white}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <rect x="760" y="482" width="164" height="28" rx="14" fill="${colors.white}" opacity="0.9"/>
`;

const healthShield = () => `
  <path d="M640 126l210 82v136c0 154-94 252-210 310-116-58-210-156-210-310V208l210-82z" fill="url(#green)" filter="url(#softShadow)"/>
  <path d="M640 326c40-74 142-58 142 32 0 80-142 158-142 158s-142-78-142-158c0-90 102-106 142-32z" fill="${colors.white}"/>
  <path d="M640 308v112M584 364h112" stroke="${colors.red}" stroke-width="20" stroke-linecap="round"/>
`;

const certificateCap = () => `
  ${documentSvg(334, 176, 420, 380, colors.gold)}
  <path d="M760 232l172-74 172 74-172 74-172-74z" fill="${colors.navy}" filter="url(#smallShadow)"/>
  <path d="M832 284v72c48 36 152 36 200 0v-72" fill="${colors.navy}" opacity="0.9"/>
  <path d="M1092 244v92" class="thin" stroke="${colors.gold}"/>
  <circle cx="1092" cy="352" r="16" fill="${colors.gold}"/>
`;

const notaryAddress = () => `
  ${documentSvg(294, 150, 390, 430, colors.gold)}
  <path d="M820 178l164 132v224H656V310z" fill="${colors.white}" stroke="#E2DED7" stroke-width="5" filter="url(#softShadow)"/>
  <path d="M618 326l202-164 202 164" class="line"/>
  <circle cx="810" cy="462" r="80" fill="${colors.gold}" opacity="0.94"/>
  <path d="M760 462h100M810 412v100" class="thin"/>
`;

const biometricCamera = () => `
  <rect x="318" y="138" width="430" height="500" rx="42" fill="${colors.white}" stroke="#E2DED7" stroke-width="4" filter="url(#softShadow)"/>
  <circle cx="533" cy="322" r="78" fill="${colors.gold}"/>
  <path d="M386 540c46-104 102-150 147-150s101 46 147 150" fill="${colors.navy}" opacity="0.9"/>
  <path d="M380 228h72M614 228h72M380 584h72M614 584h72" class="thin" stroke="${colors.green}"/>
  <rect x="790" y="292" width="212" height="158" rx="34" fill="${colors.navy}" filter="url(#smallShadow)"/>
  <circle cx="896" cy="371" r="52" fill="${colors.white}"/>
  <circle cx="896" cy="371" r="26" fill="${colors.green}"/>
`;

const passportStamp = () => `
  <path d="M246 186h330c58 0 92 34 92 92v310H338c-58 0-92-34-92-92z" fill="${colors.navy}" filter="url(#softShadow)"/>
  <path d="M668 278c0-58 34-92 92-92h280v402H668z" fill="${colors.white}" stroke="#E2DED7" stroke-width="4" filter="url(#smallShadow)"/>
  <circle cx="462" cy="382" r="76" fill="${colors.gold}"/>
  <path d="M790 352l184 100M974 352L790 452" stroke="${colors.red}" stroke-width="20" stroke-linecap="round" opacity="0.85"/>
  <rect x="772" y="318" width="220" height="168" rx="32" fill="none" stroke="${colors.red}" stroke-width="12" opacity="0.8"/>
`;

const previousCards = () => `
  <g transform="rotate(-8 520 362)">${cardSvg(270, 238, 470, 250, colors.gold)}</g>
  <g transform="rotate(6 742 344)">${cardSvg(542, 188, 500, 280, colors.green)}</g>
  <path d="M560 566c70-52 184-52 254 0" class="thin" stroke="${colors.gold}"/>
  <path d="M782 518l36 36-36 36" class="thin" stroke="${colors.gold}"/>
`;

const activePhone = () => `
  <rect x="472" y="112" width="300" height="510" rx="50" fill="${colors.navy}" filter="url(#softShadow)"/>
  <rect x="504" y="164" width="236" height="392" rx="30" fill="${colors.white}"/>
  <circle cx="622" cy="592" r="16" fill="${colors.cream}"/>
  <path d="M840 238c72 72 72 188 0 260M898 184c104 104 104 272 0 376" class="thin" stroke="${colors.green}"/>
  <circle cx="622" cy="350" r="86" fill="${colors.green}" opacity="0.14"/>
  <path d="M572 348l34 34 70-82" stroke="${colors.green}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
`;

const maritalForm = () => `
  ${documentSvg(344, 142, 420, 468, colors.green)}
  <circle cx="852" cy="344" r="72" fill="${colors.gold}" filter="url(#smallShadow)"/>
  <circle cx="936" cy="344" r="72" fill="${colors.gold}" opacity="0.74" filter="url(#smallShadow)"/>
  <circle cx="828" cy="300" r="42" fill="${colors.navy}"/>
  <path d="M758 448c30-84 76-122 70-122s40 38 70 122" fill="${colors.navy}"/>
  <circle cx="958" cy="300" r="42" fill="${colors.green}"/>
  <path d="M888 448c30-84 76-122 70-122s40 38 70 122" fill="${colors.green}"/>
`;

const scenes = {
  'laptop-form': laptop,
  'student-card': studentCard,
  'government-passport': governmentPassport,
  'calendar-suitcase': calendarSuitcase,
  folders,
  'receipt-coins': receiptCoins,
  'id-card': idCard,
  'fee-exemption': feeExemption,
  'phone-key': phoneKey,
  'number-id': numberId,
  'privacy-shield': privacyShield,
  'map-pin': mapPin,
  'home-document': homeDocument,
  'wrong-map': wrongMap,
  'passport-calendar': passportCalendar,
  'calendar-clock': calendarClock,
  'application-upload': applicationUpload,
  'health-shield': healthShield,
  'certificate-cap': certificateCap,
  'notary-address': notaryAddress,
  'biometric-camera': biometricCamera,
  'passport-stamp': passportStamp,
  'previous-cards': previousCards,
  'active-phone': activePhone,
  'marital-form': maritalForm,
};

await mkdir(outDir, { recursive: true });

for (const [slug, scene] of terms) {
  const body = scenes[scene]();
  await writeFile(path.join(outDir, `${slug}.svg`), shell(slug, body), 'utf8');
}

console.log(`Generated ${terms.length} glossary visuals in ${outDir}`);
