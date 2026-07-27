/* Astronaut Studio v8: stable rigging, modular gear, and a persistent creator editor. */

export const ASTRONAUT_CONFIG_VERSION = 8;
export const ASTRONAUT_STORAGE_KEY = `acca-astronaut-v${ASTRONAUT_CONFIG_VERSION}`;

export const SUIT_COLORS = [
  { id: 'eva', hex: 0xebece7, fa: 'سفید اصلی EVA', en: 'Original EVA' },
  { id: 'pearl', hex: 0xe8e0cf, fa: 'صدفی آکاکو', en: 'ACCA pearl' },
  { id: 'arctic', hex: 0xd9eef0, fa: 'یخی قطبی', en: 'Arctic ice' },
  { id: 'lunar', hex: 0x8f9ba2, fa: 'خاکستری ماه', en: 'Lunar grey' },
  { id: 'graphite', hex: 0x96999d, fa: 'گرافیتی روشن', en: 'Light graphite' },
  { id: 'navy', hex: 0x93a0b3, fa: 'سرمه‌ای روشن', en: 'Light mission navy' },
  { id: 'emerald', hex: 0x94bcb5, fa: 'زمردی روشن', en: 'Light orbit emerald' },
  { id: 'mars', hex: 0xccaba5, fa: 'مریخی روشن', en: 'Light Mars red' },
  { id: 'plum', hex: 0xb7adbe, fa: 'آلویی روشن', en: 'Light cosmic plum' },
];

export const PACK_PRIMARY_COLORS = SUIT_COLORS;

export const ACCENT_COLORS = [
  { id: 'orange', hex: 0xf28b35, fa: 'نارنجی ایمنی', en: 'Safety orange' },
  { id: 'gold', hex: 0xc7a65a, fa: 'طلایی آکاکو', en: 'ACCA gold' },
  { id: 'emerald', hex: 0x10a47f, fa: 'زمردی', en: 'Emerald' },
  { id: 'navy', hex: 0x1d4b91, fa: 'آبی فضایی', en: 'Space blue' },
  { id: 'cyan', hex: 0x20a7c9, fa: 'فیروزه‌ای الکتریک', en: 'Electric cyan' },
  { id: 'red', hex: 0xd7474f, fa: 'قرمز مأموریت', en: 'Mission red' },
  { id: 'violet', hex: 0x7659c7, fa: 'بنفش کیهانی', en: 'Cosmic violet' },
  { id: 'silver', hex: 0xaeb8c2, fa: 'نقره‌ای تیتانیوم', en: 'Titanium silver' },
  { id: 'graphite', hex: 0x222a33, fa: 'زغالی', en: 'Charcoal' },
];

export const PACK_COLORS = [
  { id: 'eva', hex: 0xe6e9e6, fa: 'سفید EVA', en: 'EVA white' },
  { id: 'pearl', hex: 0xd8d0bf, fa: 'صدفی', en: 'Pearl' },
  { id: 'lunar', hex: 0x89969d, fa: 'خاکستری ماه', en: 'Lunar grey' },
  { id: 'graphite', hex: 0x17202d, fa: 'گرافیتی', en: 'Graphite' },
  { id: 'navy', hex: 0x173c69, fa: 'سرمه‌ای مأموریت', en: 'Mission navy' },
  { id: 'emerald', hex: 0x147562, fa: 'زمردی مدار', en: 'Orbit emerald' },
  { id: 'mars', hex: 0x93483b, fa: 'مریخی', en: 'Mars red' },
  { id: 'orange', hex: 0xe88435, fa: 'نارنجی ایمنی', en: 'Safety orange' },
  { id: 'gold', hex: 0xb9944f, fa: 'طلایی آکاکو', en: 'ACCA gold' },
];

export const VISOR_COLORS = [
  { id: 'original', hex: 0x241f22, fa: 'شیشه اصلی مشکی', en: 'Original black' },
  { id: 'gold', hex: 0xb88935, fa: 'طلایی تیره', en: 'Deep gold' },
  { id: 'amber', hex: 0xd26925, fa: 'کهربایی', en: 'Amber' },
  { id: 'smoke', hex: 0x202d3b, fa: 'دودی', en: 'Smoke' },
  { id: 'ice', hex: 0x4788a7, fa: 'یخی', en: 'Ice blue' },
  { id: 'emerald', hex: 0x217d68, fa: 'زمردی', en: 'Emerald' },
  { id: 'ruby', hex: 0x7e2935, fa: 'یاقوتی', en: 'Ruby' },
  { id: 'violet', hex: 0x57407d, fa: 'بنفش شفق', en: 'Aurora violet' },
  { id: 'silver', hex: 0x8da1ad, fa: 'آینه نقره‌ای', en: 'Silver mirror' },
];

export const PACK_SHADOW_COLORS = [
  { id: 'graphite', hex: 0x202832, fa: 'گرافیت تیره', en: 'Dark graphite' },
  { id: 'black', hex: 0x0b0f14, fa: 'مشکی عمیق', en: 'Deep black' },
  { id: 'midnight', hex: 0x101b2d, fa: 'نیمه‌شب', en: 'Midnight' },
  { id: 'navy', hex: 0x142846, fa: 'سرمه‌ای تیره', en: 'Dark navy' },
  { id: 'forest', hex: 0x12352d, fa: 'سبز جنگلی', en: 'Deep forest' },
  { id: 'burgundy', hex: 0x4a2028, fa: 'زرشکی تیره', en: 'Dark burgundy' },
  { id: 'plum', hex: 0x38243f, fa: 'آلویی تیره', en: 'Dark plum' },
  { id: 'espresso', hex: 0x34251f, fa: 'قهوه‌ای اسپرسو', en: 'Espresso' },
  { id: 'gunmetal', hex: 0x39434a, fa: 'فلز تیره', en: 'Gunmetal' },
];

export const SUIT_FINISHES = [
  {
    id: 'standard',
    fa: 'استاندارد',
    en: 'Standard',
    roughness: 0.7,
    metalness: 0,
    clearcoat: 0.08,
    pattern: 'none',
    patternScale: 1,
    patternStrength: 0,
    sheen: 0.1,
  },
  {
    id: 'fabric',
    fa: 'پارچه EVA',
    en: 'EVA fabric',
    roughness: 0.78,
    metalness: 0,
    clearcoat: 0.04,
    pattern: 'weave',
    patternScale: 155,
    patternStrength: 0.075,
    sheen: 0.18,
  },
  {
    id: 'polymer',
    fa: 'پلیمر براق',
    en: 'Gloss polymer',
    roughness: 0.34,
    metalness: 0.02,
    clearcoat: 0.62,
    pattern: 'microfiber',
    patternScale: 220,
    patternStrength: 0.035,
    sheen: 0.24,
  },
  {
    id: 'velvet',
    fa: 'مخمل فضایی',
    en: 'Space velvet',
    roughness: 0.95,
    metalness: 0,
    clearcoat: 0,
    pattern: 'velvet',
    patternScale: 180,
    patternStrength: 0.12,
    sheen: 0.68,
  },
];

export const ACCENT_FINISHES = [
  { id: 'matte', fa: 'مات', en: 'Matte', roughness: 0.82, metalness: 0.03, clearcoat: 0.02 },
  { id: 'gloss', fa: 'براق', en: 'Gloss', roughness: 0.2, metalness: 0.08, clearcoat: 0.82 },
  { id: 'titanium', fa: 'تیتانیومی', en: 'Titanium', roughness: 0.24, metalness: 0.88, clearcoat: 0.34 },
  { id: 'metallic', fa: 'فلزی', en: 'Metallic', roughness: 0.3, metalness: 0.72, clearcoat: 0.22 },
];

export const HELMET_OPTIONS = [
  { id: 'classic', fa: 'کلاه اصلی EVA', en: 'Classic EVA' },
  { id: 'comms', fa: 'آنتن ارتباطی', en: 'Communications' },
  { id: 'explorer', fa: 'چراغ‌های EVA', en: 'EVA work lights' },
  { id: 'camera', fa: 'دوربین و چراغ EVA', en: 'EVA camera and light' },
  { id: 'sunshield', fa: 'سایه‌بان محافظ', en: 'Protective sun shade' },
];

export const PACK_OPTIONS = [
  { id: 'standard', fa: 'PLSS اصلی', en: 'Original PLSS' },
  { id: 'compact', fa: 'پکیج فشرده', en: 'Compact pack' },
  { id: 'explorer', fa: 'پکیج اکتشافی', en: 'Explorer pack' },
  { id: 'jetpack', fa: 'جت‌پک', en: 'Jetpack' },
  { id: 'student', fa: 'کوله دانشجویی', en: 'Student backpack' },
  { id: 'minimal', fa: 'بدون افزونه', en: 'No add-on' },
];

export const CHEST_OPTIONS = [
  { id: 'dcm', fa: 'کنترل‌پنل EVA', en: 'EVA control panel' },
  { id: 'terminal', fa: 'ترمینال آکاکو', en: 'ACCA terminal' },
  { id: 'camera', fa: 'دوربین مأموریت', en: 'Mission camera' },
  { id: 'oxygen', fa: 'کنترل اکسیژن PLSS', en: 'PLSS oxygen control' },
  { id: 'telemetry', fa: 'تله‌متری EVA', en: 'EVA telemetry' },
  { id: 'clean', fa: 'لباس ساده', en: 'Clean suit' },
];

export const LOGO_OPTIONS = [
  { id: 'acca', fa: 'نشان آکاکو', en: 'ACCA mission' },
  { id: 'turkey', fa: 'پرچم ترکیه', en: 'Türkiye flag' },
  { id: 'iran', fa: 'پرچم ایران', en: 'Iran flag' },
  { id: 'azerbaijan', fa: 'پرچم آذربایجان', en: 'Azerbaijan flag' },
  { id: 'acca-mark', fa: 'نشان دوم آکاکو', en: 'ACCA emblem' },
  { id: 'university', fa: 'نشان دانشگاه', en: 'University emblem' },
  { id: 'orbit', fa: 'نشان مدار', en: 'Orbit badge' },
  { id: 'lunar', fa: 'ماموریت ماه', en: 'Lunar mission' },
  { id: 'science', fa: 'پژوهش فضایی', en: 'Space research' },
  { id: 'none', fa: 'بدون نشان', en: 'No patch' },
];

export const POSE_OPTIONS = [
  { id: 'float', fa: 'شناوری آرام', en: 'Calm float' },
  { id: 'reference', fa: 'شناوری مرجع', en: 'Reference float' },
  { id: 'drift', fa: 'چرخش مداری', en: 'Orbital drift' },
  { id: 'sit', fa: 'نشستن در فضا', en: 'Space sit' },
  { id: 'walk', fa: 'راه‌رفتن', en: 'Moon walk' },
  { id: 'jet', fa: 'پرواز با جت‌پک', en: 'Jet flight' },
];

export const EDITOR_MATERIALS = [
  { id: 'cobalt', hex: 0x1557b0, roughness: 0.13, metalness: 0.82, clearcoat: 0.82, fa: 'کبالت کروم', en: 'Cobalt chrome' },
  { id: 'charcoal', hex: 0x171b20, roughness: 0.9, metalness: 0.05, clearcoat: 0.02, fa: 'زغالی مات', en: 'Matte charcoal' },
  { id: 'diamond', hex: 0xdcefff, roughness: 0.045, metalness: 0.16, clearcoat: 1, fa: 'یخ الماسی', en: 'Diamond ice' },
  { id: 'titanium', hex: 0x8f9da8, roughness: 0.22, metalness: 0.9, clearcoat: 0.34, fa: 'تیتانیوم فضایی', en: 'Space titanium' },
  { id: 'silver', hex: 0xc5ccd2, roughness: 0.42, metalness: 0.78, clearcoat: 0.2, fa: 'نقره برس‌خورده', en: 'Brushed silver' },
  { id: 'ceramic', hex: 0xf0f1eb, roughness: 0.3, metalness: 0.03, clearcoat: 0.58, fa: 'سرامیک سفید', en: 'White ceramic' },
  { id: 'emerald-chrome', hex: 0x087c66, roughness: 0.12, metalness: 0.68, clearcoat: 0.84, fa: 'کروم زمردی', en: 'Emerald chrome' },
  { id: 'mars-copper', hex: 0xa84d32, roughness: 0.28, metalness: 0.76, clearcoat: 0.38, fa: 'مس مریخی', en: 'Mars copper' },
  { id: 'gold-foil', hex: 0xc99d3d, roughness: 0.24, metalness: 0.8, clearcoat: 0.42, fa: 'فویل طلایی', en: 'Gold foil' },
  { id: 'obsidian', hex: 0x090d15, roughness: 0.08, metalness: 0.34, clearcoat: 0.96, fa: 'شیشه ابسیدین', en: 'Obsidian glass' },
  { id: 'cotton', hex: 0xe8e5dc, roughness: 0.92, metalness: 0, clearcoat: 0.01, pattern: 'weave', patternScale: 150, patternStrength: 0.18, sheen: 0.2, fa: 'پنبه بافت‌دار', en: 'Woven cotton' },
  { id: 'polyester', hex: 0xdce5e8, roughness: 0.48, metalness: 0.02, clearcoat: 0.2, pattern: 'microfiber', patternScale: 230, patternStrength: 0.1, sheen: 0.32, fa: 'پلی‌استر فنی', en: 'Technical polyester' },
  { id: 'velvet', hex: 0x182235, roughness: 0.96, metalness: 0, clearcoat: 0, pattern: 'velvet', patternScale: 185, patternStrength: 0.13, sheen: 0.62, fa: 'مخمل فضایی', en: 'Space velvet' },
  { id: 'carbon-fiber', hex: 0x151b23, roughness: 0.3, metalness: 0.32, clearcoat: 0.48, pattern: 'carbon', patternScale: 115, patternStrength: 0.2, sheen: 0.08, fa: 'فیبر کربن', en: 'Carbon fiber' },
  { id: 'eva-rubber', hex: 0x20252b, roughness: 0.8, metalness: 0.01, clearcoat: 0.04, pattern: 'rubber', patternScale: 95, patternStrength: 0.12, sheen: 0.04, fa: 'لاستیک EVA', en: 'EVA rubber' },
  { id: 'kevlar', hex: 0xb3984e, roughness: 0.66, metalness: 0.04, clearcoat: 0.08, pattern: 'weave', patternScale: 175, patternStrength: 0.16, sheen: 0.12, fa: 'بافت کولار', en: 'Kevlar weave' },
];

export const DEFAULT_EDITOR_TARGET_STATE = Object.freeze({
  position: Object.freeze([0, 0, 0]),
  rotation: Object.freeze([0, 0, 0]),
  scale: Object.freeze([1, 1, 1]),
  material: 'default',
});

const GLOBAL_EDITOR_TARGET_DEFAULTS = Object.freeze({
  'hw.pack.standard': Object.freeze({
    position: Object.freeze([0, 0.246, 0.07]),
    rotation: Object.freeze([1.369, 0, 0]),
    scale: Object.freeze([1, 1, 1]),
    material: 'titanium',
  }),
  'hw.pack.compact': Object.freeze({
    position: Object.freeze([0, 0.191, 0.058]),
    rotation: Object.freeze([2.028, 0, 0]),
    scale: Object.freeze([1, 1, 1]),
    material: 'titanium',
  }),
  'hw.pack.explorer': Object.freeze({
    position: Object.freeze([0, 0, 0]),
    rotation: Object.freeze([0, 0, 0]),
    scale: Object.freeze([1, 1, 1]),
    material: 'titanium',
  }),
  'hw.pack.jetpack': Object.freeze({
    position: Object.freeze([0, 0, 0]),
    rotation: Object.freeze([0, 0, 0]),
    scale: Object.freeze([1, 1, 1]),
    material: 'titanium',
  }),
  'hw.pack.student': Object.freeze({
    position: Object.freeze([-0.003, 0.241, 0.05]),
    rotation: Object.freeze([0.857, 0, 0]),
    scale: Object.freeze([1, 1, 1]),
    material: 'titanium',
  }),
  'hw.chest.dcm': Object.freeze({
    position: Object.freeze([0, 0, 0]),
    rotation: Object.freeze([0.936, 0, 0]),
    scale: Object.freeze([0.818, 0.819, 0.907]),
    material: 'titanium',
  }),
  'hw.chest.terminal': Object.freeze({
    position: Object.freeze([0, 0, 0]),
    rotation: Object.freeze([0, 0, 0]),
    scale: Object.freeze([1, 1, 1]),
    material: 'titanium',
  }),
  'hw.chest.camera': Object.freeze({
    position: Object.freeze([0, 0, 0]),
    rotation: Object.freeze([0, 0, 0]),
    scale: Object.freeze([1, 1, 1]),
    material: 'titanium',
  }),
  'hw.chest.oxygen': Object.freeze({
    position: Object.freeze([0, 0, 0]),
    rotation: Object.freeze([0, 0, 0]),
    scale: Object.freeze([1, 1, 1]),
    material: 'titanium',
  }),
  'hw.chest.telemetry': Object.freeze({
    position: Object.freeze([0, 0, 0]),
    rotation: Object.freeze([0, 0, 0]),
    scale: Object.freeze([1, 1, 1]),
    material: 'titanium',
  }),
  'hw.patch.chest': Object.freeze({
    position: Object.freeze([0.007, 0.01, 0.025]),
    rotation: Object.freeze([-4.475, 0, 1.036]),
    scale: Object.freeze([1, 1, 1]),
    material: 'titanium',
  }),
  'hw.patch.rightSleeve': Object.freeze({
    position: Object.freeze([0.16, 0.125, -0.055]),
    rotation: Object.freeze([-26.035, 28.319, 24.146]),
    scale: Object.freeze([1, 1, 1.033]),
    material: 'titanium',
  }),
  'hw.patch.leftSleeve': Object.freeze({
    position: Object.freeze([-0.162, 0.114, -0.063]),
    rotation: Object.freeze([-36.687, -39.217, -27.04]),
    scale: Object.freeze([1, 1, 1]),
    material: 'titanium',
  }),
});

const POSE_EDITOR_TARGET_DEFAULTS = Object.freeze({
  float: Object.freeze({
    'edit.character': Object.freeze({
      position: Object.freeze([0, 0.1, 0]),
      rotation: Object.freeze([0, 0, 0]),
      scale: Object.freeze([1, 1, 1]),
      material: 'default',
    }),
    'hw.patch.rightSleeve': Object.freeze({
      position: Object.freeze([0.149, 0.116, -0.06]),
      rotation: Object.freeze([-39.441, 28.834, 31.111]),
      scale: Object.freeze([1, 1, 1.033]),
      material: 'titanium',
    }),
    'hw.patch.leftSleeve': Object.freeze({
      position: Object.freeze([-0.156, 0.11, -0.066]),
      rotation: Object.freeze([-40.41, -37.653, -38.802]),
      scale: Object.freeze([1, 1, 1]),
      material: 'titanium',
    }),
  }),
});

const JOINT_EDITOR_TARGETS = [
  { id: 'rig.left.shoulder', fa: 'شانه و آستین چپ', en: 'Left shoulder and upper sleeve', materialScope: 'bodyPart' },
  { id: 'rig.left.elbow', fa: 'ساعد چپ', en: 'Left forearm sleeve', materialScope: 'bodyPart' },
  { id: 'rig.left.hand', fa: 'دستکش چپ', en: 'Left glove', materialScope: 'bodyPart' },
  { id: 'rig.right.shoulder', fa: 'شانه و آستین راست', en: 'Right shoulder and upper sleeve', materialScope: 'bodyPart' },
  { id: 'rig.right.elbow', fa: 'ساعد راست', en: 'Right forearm sleeve', materialScope: 'bodyPart' },
  { id: 'rig.right.hand', fa: 'دستکش راست', en: 'Right glove', materialScope: 'bodyPart' },
  { id: 'rig.left.hip', fa: 'ران چپ', en: 'Left hip', materialScope: 'none' },
  { id: 'rig.left.knee', fa: 'زانوی چپ', en: 'Left knee', materialScope: 'none' },
  { id: 'rig.right.hip', fa: 'ران راست', en: 'Right hip', materialScope: 'none' },
  { id: 'rig.right.knee', fa: 'زانوی راست', en: 'Right knee', materialScope: 'none' },
];

export const MODEL_PART_EDITOR_TARGETS = [
  { id: 'body.helmet.shell', fa: 'پوسته اصلی کلاه', en: 'Base helmet shell', materialScope: 'bodyPart' },
  { id: 'body.pack.shell', fa: 'بدنه اصلی کوله', en: 'Built-in backpack shell', materialScope: 'bodyPart' },
  { id: 'body.hose.right.upper', fa: 'شیلنگ بالایی راست', en: 'Right upper hose', materialScope: 'bodyPart' },
  { id: 'body.hose.right.lower', fa: 'شیلنگ پایینی راست', en: 'Right lower hose', materialScope: 'bodyPart' },
  { id: 'body.hose.left.upper', fa: 'شیلنگ بالایی چپ', en: 'Left upper hose', materialScope: 'bodyPart' },
  { id: 'body.hose.left.lower', fa: 'شیلنگ پایینی چپ', en: 'Left lower hose', materialScope: 'bodyPart' },
  { id: 'body.connector.right.upper', fa: 'اتصال بالایی راست سینه', en: 'Right upper chest connector', materialScope: 'bodyPart' },
  { id: 'body.connector.right.lower', fa: 'اتصال پایینی راست سینه', en: 'Right lower chest connector', materialScope: 'bodyPart' },
  { id: 'body.connector.left.upper', fa: 'اتصال بالایی چپ سینه', en: 'Left upper chest connector', materialScope: 'bodyPart' },
  { id: 'body.connector.left.lower', fa: 'اتصال پایینی چپ سینه', en: 'Left lower chest connector', materialScope: 'bodyPart' },
  { id: 'body.chest.panel', fa: 'پنل پایه سینه', en: 'Built-in chest panel', materialScope: 'bodyPart' },
];

export const BODY_MATERIAL_TARGET_IDS = Object.freeze([
  ...MODEL_PART_EDITOR_TARGETS.map((target) => target.id),
  ...JOINT_EDITOR_TARGETS
    .filter((target) => target.materialScope === 'bodyPart')
    .map((target) => target.id),
]);

const PATCH_EDITOR_TARGETS = [
  { id: 'hw.patch.leftSleeve', fa: 'لوگوی آستین چپ', en: 'Left sleeve patch', materialScope: 'decal' },
  { id: 'hw.patch.rightSleeve', fa: 'لوگوی آستین راست', en: 'Right sleeve patch', materialScope: 'decal' },
  { id: 'hw.patch.chest', fa: 'لوگوی مرکزی', en: 'Center chest patch', materialScope: 'decal' },
];

export function getAstronautEditorTargetOptions(config = {}) {
  const targets = [
    { id: 'edit.character', fa: 'کل فضانورد', en: 'Whole astronaut', materialScope: 'suit' },
    ...JOINT_EDITOR_TARGETS,
    ...MODEL_PART_EDITOR_TARGETS,
  ];
  if (config.logo !== 'none') targets.push(...PATCH_EDITOR_TARGETS);
  if (config.helmet && config.helmet !== 'classic') targets.push({
    id: `hw.helmet.${config.helmet}`,
    fa: 'تجهیز فعلی کلاه',
    en: 'Active helmet gear',
    materialScope: 'hardware',
  });
  if (config.pack && config.pack !== 'minimal') targets.push({
    id: `hw.pack.${config.pack}`,
    fa: 'کوله فعلی',
    en: 'Active life-support pack',
    materialScope: 'hardware',
  });
  if (config.chest && config.chest !== 'clean') targets.push({
    id: `hw.chest.${config.chest}`,
    fa: 'ماژول فعلی سینه',
    en: 'Active chest module',
    materialScope: 'hardware',
  });
  return targets;
}

const ALL_EDITOR_TARGET_IDS = new Set([
  'edit.character',
  ...JOINT_EDITOR_TARGETS.map((target) => target.id),
  ...MODEL_PART_EDITOR_TARGETS.map((target) => target.id),
  ...PATCH_EDITOR_TARGETS.map((target) => target.id),
  ...HELMET_OPTIONS.map((option) => `hw.helmet.${option.id}`),
  ...PACK_OPTIONS.map((option) => `hw.pack.${option.id}`),
  ...CHEST_OPTIONS.map((option) => `hw.chest.${option.id}`),
]);

const EDITOR_MATERIAL_IDS = new Set(['default', ...EDITOR_MATERIALS.map((material) => material.id)]);
const POSE_IDS = new Set(POSE_OPTIONS.map((option) => option.id));

function cleanEditorVector(value, fallback, minimum, maximum) {
  return fallback.map((defaultValue, index) => {
    const number = Number(value?.[index]);
    if (!Number.isFinite(number)) return defaultValue;
    return Math.round(Math.min(maximum, Math.max(minimum, number)) * 1000) / 1000;
  });
}

function sanitizeEditorTargets(raw) {
  const targets = {};
  const entries = raw && typeof raw === 'object'
    ? Object.entries(raw).slice(0, 64)
    : [];
  entries.forEach(([id, value]) => {
    if (!ALL_EDITOR_TARGET_IDS.has(id) || !value || typeof value !== 'object') return;
    targets[id] = {
      position: cleanEditorVector(value.position, [0, 0, 0], -1.25, 1.25),
      rotation: cleanEditorVector(value.rotation, [0, 0, 0], -180, 180),
      scale: cleanEditorVector(value.scale, [1, 1, 1], 0.2, 3),
      material: EDITOR_MATERIAL_IDS.has(value.material) ? value.material : 'default',
    };
  });
  return targets;
}

function sanitizeEditorConfig(raw) {
  const targets = sanitizeEditorTargets(raw?.targets);
  const poseTargets = {};
  const poseEntries = raw?.poseTargets && typeof raw.poseTargets === 'object'
    ? Object.entries(raw.poseTargets).slice(0, POSE_OPTIONS.length)
    : [];
  poseEntries.forEach(([pose, rawTargets]) => {
    if (!POSE_IDS.has(pose)) return;
    const sanitizedTargets = sanitizeEditorTargets(rawTargets);
    if (Object.keys(sanitizedTargets).length > 0) poseTargets[pose] = sanitizedTargets;
  });
  return { targets, poseTargets };
}

export function getAstronautEditorTargetState(config, id) {
  const pose = config?.pose;
  const state = config?.editor?.poseTargets?.[pose]?.[id]
    || config?.editor?.targets?.[id]
    || POSE_EDITOR_TARGET_DEFAULTS[pose]?.[id]
    || GLOBAL_EDITOR_TARGET_DEFAULTS[id]
    || DEFAULT_EDITOR_TARGET_STATE;
  return {
    position: [...state.position],
    rotation: [...state.rotation],
    scale: [...state.scale],
    material: state.material,
  };
}

export const DEFAULT_ASTRONAUT_CONFIG = Object.freeze({
  v: ASTRONAUT_CONFIG_VERSION,
  suit: 'lunar',
  suitFinish: 'standard',
  accent: 'graphite',
  accentFinish: 'matte',
  visor: 'original',
  helmet: 'comms',
  pack: 'standard',
  packPrimary: 'arctic',
  packSecondary: 'graphite',
  packShadow: 'gunmetal',
  chest: 'clean',
  chestColor: 'eva',
  logo: 'iran',
  pose: 'reference',
  editor: Object.freeze({
    targets: Object.freeze({}),
    poseTargets: Object.freeze({}),
  }),
});

const ASTRONAUT_PRESET_BASE = Object.freeze({
  v: ASTRONAUT_CONFIG_VERSION,
  suit: 'eva',
  suitFinish: 'standard',
  accent: 'navy',
  accentFinish: 'matte',
  visor: 'ice',
  helmet: 'classic',
  pack: 'standard',
  packPrimary: 'eva',
  packSecondary: 'navy',
  packShadow: 'graphite',
  chest: 'dcm',
  chestColor: 'eva',
  logo: 'acca',
  pose: 'float',
  editor: DEFAULT_ASTRONAUT_CONFIG.editor,
});

export const ASTRONAUT_PRESETS = [
  { id: 'eva', fa: 'EVA کلاسیک', en: 'Classic EVA', config: { ...ASTRONAUT_PRESET_BASE, accent: 'orange', visor: 'original', packSecondary: 'graphite' } },
  {
    id: 'acca',
    fa: 'مأموریت آکاکو',
    en: 'ACCA Mission',
    config: { ...ASTRONAUT_PRESET_BASE, suit: 'pearl', accent: 'gold', helmet: 'comms', packPrimary: 'pearl', packSecondary: 'navy', chest: 'terminal', pose: 'reference' },
  },
  {
    id: 'bosphorus',
    fa: 'اکسپلورر بسفر',
    en: 'Bosphorus Explorer',
    config: { ...ASTRONAUT_PRESET_BASE, accent: 'emerald', visor: 'ice', helmet: 'explorer', pack: 'explorer', packPrimary: 'eva', packSecondary: 'emerald', logo: 'turkey', pose: 'drift' },
  },
  {
    id: 'night',
    fa: 'مدار شب',
    en: 'Night Orbit',
    config: { ...ASTRONAUT_PRESET_BASE, suit: 'graphite', accent: 'gold', visor: 'smoke', helmet: 'camera', pack: 'compact', packPrimary: 'graphite', packSecondary: 'gold', logo: 'orbit' },
  },
  {
    id: 'student',
    fa: 'دانشجوی فضایی',
    en: 'Space Student',
    config: { ...ASTRONAUT_PRESET_BASE, suit: 'navy', accent: 'emerald', helmet: 'sunshield', pack: 'student', packPrimary: 'navy', packSecondary: 'emerald', chest: 'terminal', logo: 'acca', pose: 'float' },
  },
  {
    id: 'jet',
    fa: 'جت رانر',
    en: 'Jet Runner',
    config: { ...ASTRONAUT_PRESET_BASE, suit: 'lunar', accent: 'red', visor: 'gold', helmet: 'comms', pack: 'jetpack', packPrimary: 'lunar', packSecondary: 'mars', chest: 'camera', logo: 'iran', pose: 'jet' },
  },
];

const OPTION_IDS = {
  suit: SUIT_COLORS.map((option) => option.id),
  suitFinish: SUIT_FINISHES.map((option) => option.id),
  accent: ACCENT_COLORS.map((option) => option.id),
  accentFinish: ACCENT_FINISHES.map((option) => option.id),
  visor: VISOR_COLORS.map((option) => option.id),
  helmet: HELMET_OPTIONS.map((option) => option.id),
  pack: PACK_OPTIONS.map((option) => option.id),
  packPrimary: PACK_PRIMARY_COLORS.map((option) => option.id),
  packSecondary: PACK_COLORS.map((option) => option.id),
  packShadow: PACK_SHADOW_COLORS.map((option) => option.id),
  chest: CHEST_OPTIONS.map((option) => option.id),
  chestColor: PACK_COLORS.map((option) => option.id),
  logo: LOGO_OPTIONS.map((option) => option.id),
  pose: POSE_OPTIONS.map((option) => option.id),
};

const LEGACY_VALUE_MAP = {
  suit: { white: 'eva', cream: 'pearl', gold: 'pearl', sky: 'lunar', violet: 'lunar', crimson: 'mars', rose: 'pearl' },
  visor: { goldmirror: 'gold', space: 'original', violet: 'smoke', rose: 'ruby' },
  helmet: { antenna: 'comms', scout: 'explorer', cap: 'sunshield', gradcap: 'sunshield', fin: 'classic' },
  pack: { backpack: 'standard', tanks: 'jetpack', none: 'minimal' },
  logo: { earth: 'azerbaijan', mars: 'acca-mark' },
};

function migrateLegacyConfig(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const migrated = { ...raw, v: ASTRONAUT_CONFIG_VERSION };
  Object.entries(LEGACY_VALUE_MAP).forEach(([key, values]) => {
    if (values[migrated[key]]) migrated[key] = values[migrated[key]];
  });
  if (raw.v === 2 && raw.visor === 'gold') migrated.visor = 'original';
  if (raw.pack === 'student') migrated.pack = 'student';
  if (raw.pack === 'jetpack') migrated.pack = 'jetpack';
  if (raw.pose === 'wave' || raw.pose === 'stand') migrated.pose = 'float';
  else if (['sit', 'walk', 'jet'].includes(raw.pose)) migrated.pose = raw.pose;
  return migrated;
}

export function sanitizeAstronautConfig(raw) {
  const input = migrateLegacyConfig(raw);
  const next = { ...DEFAULT_ASTRONAUT_CONFIG };
  if (input && typeof input === 'object') {
    Object.keys(OPTION_IDS).forEach((key) => {
      if (OPTION_IDS[key].includes(input[key])) next[key] = input[key];
    });
    next.editor = sanitizeEditorConfig(input.editor);
  } else {
    next.editor = sanitizeEditorConfig(null);
  }
  return next;
}

function readStoredConfig() {
  try {
    const stored = window.localStorage.getItem(ASTRONAUT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.v === ASTRONAUT_CONFIG_VERSION) return sanitizeAstronautConfig(parsed);
    }
    // This revision establishes a new site-wide brand default. Older saved
    // customizations intentionally do not override it.
  } catch {
    // Storage must never block the hero.
  }
  return { ...DEFAULT_ASTRONAUT_CONFIG };
}

export function loadAstronautConfig() {
  const config = readStoredConfig();
  // ?pose=… lets us (and the visitor) deep-link a pose for quick testing.
  try {
    const requested = new URLSearchParams(window.location.search).get('pose');
    if (requested && OPTION_IDS.pose.includes(requested)) config.pose = requested;
  } catch {
    // ignore malformed URLs
  }
  return config;
}

export function saveAstronautConfig(config) {
  try {
    window.localStorage.setItem(ASTRONAUT_STORAGE_KEY, JSON.stringify(sanitizeAstronautConfig(config)));
  } catch {
    // Keep customization session-local when storage is unavailable.
  }
}

export function randomAstronautConfig() {
  const preset = ASTRONAUT_PRESETS[Math.floor(Math.random() * ASTRONAUT_PRESETS.length)];
  return sanitizeAstronautConfig(preset.config);
}

const HEX_BY_ID = {
  suit: Object.fromEntries(SUIT_COLORS.map((option) => [option.id, option.hex])),
  accent: Object.fromEntries(ACCENT_COLORS.map((option) => [option.id, option.hex])),
  visor: Object.fromEntries(VISOR_COLORS.map((option) => [option.id, option.hex])),
  packPrimary: Object.fromEntries(PACK_PRIMARY_COLORS.map((option) => [option.id, option.hex])),
  pack: Object.fromEntries(PACK_COLORS.map((option) => [option.id, option.hex])),
  packShadow: Object.fromEntries(PACK_SHADOW_COLORS.map((option) => [option.id, option.hex])),
};

export function resolveAstronautColors(config) {
  const safe = sanitizeAstronautConfig(config);
  return {
    suit: HEX_BY_ID.suit[safe.suit],
    accent: HEX_BY_ID.accent[safe.accent],
    visor: HEX_BY_ID.visor[safe.visor],
    packPrimary: HEX_BY_ID.packPrimary[safe.packPrimary],
    packSecondary: HEX_BY_ID.pack[safe.packSecondary],
    packShadow: HEX_BY_ID.packShadow[safe.packShadow],
    chestColor: HEX_BY_ID.pack[safe.chestColor],
  };
}

export function toCssHex(hex) {
  return `#${hex.toString(16).padStart(6, '0')}`;
}
