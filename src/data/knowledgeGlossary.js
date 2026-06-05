import { knowledgeBlogPosts } from './knowledgeBlogPosts';

const TERM_SLUG_BY_TITLE = {
  'ای‌کامِت چیست؟': 'e-ikamet',
  'اقامت دانشجویی یعنی چه؟': 'student-residence-permit',
  'اداره مهاجرت ترکیه چه نقشی دارد؟': 'turkey-migration-authority',
  'اداره مهاجرت ترکیه چیست؟': 'turkey-migration-authority',
  'اقامت کوتاه‌مدت چیست؟': 'short-term-residence-permit',
  'نوع پرونده یعنی چه؟': 'residence-file-type',
  'هارچ چیست؟': 'harc-fee',
  'کارت اقامت چیست؟': 'residence-card',
  'معافیت یعنی چه؟': 'residence-fee-exemption',
  'دولت الکترونیک ترکیه چیست؟': 'turkey-e-government',
  'شماره هویت خارجی چیست؟': 'foreign-identity-number',
  'حریم خصوصی در این مسیر یعنی چه؟': 'student-data-privacy',
  'ثبت آدرس یعنی چه؟': 'address-registration',
  'مدرک سکونت چیست؟': 'proof-of-residence',
  'آدرس نادرست چه خطری دارد؟': 'wrong-address-risk',
};

const EXTRA_TERM_SLUG_BY_TITLE = {
  'معافیت ویزای ۹۰ روزه ترکیه چیست؟': 'turkey-90-day-visa-exemption',
  'راندوو اقامت چیست؟': 'residence-randevu',
  'باشورو اقامت چیست؟': 'residence-basvuru',
  'بیمه سلامت اقامت چیست؟': 'residence-health-insurance',
  'برگه دانشجویی چیست؟': 'student-certificate',
  'برگه نوتر آدرس چیست؟': 'notarized-address-document',
  'عکس بیومتریک چیست؟': 'biometric-photo',
  'مهر ورود پاسپورت چیست؟': 'passport-entry-stamp',
  'کیملیک قبلی چیست؟': 'previous-kimlik',
  'شماره ترک فعال چیست؟': 'active-turkish-phone',
  'وضعیت تأهل در فرم اقامت چیست؟': 'marital-status',
};

Object.assign(EXTRA_TERM_SLUG_BY_TITLE, {
  'YİMER 157 چیست؟': 'yimer-157',
  'اقامت خانوادگی ترکیه چیست؟': 'family-residence-permit',
  'حامی در اقامت خانوادگی یعنی چه؟': 'residence-supporter',
  'اقامت همراه یعنی چه؟': 'companion-residence',
  'مدرک نسبت خانوادگی و تأیید سفارت چیست؟': 'family-relationship-proof',
  'دفتر اداره مهاجرت یعنی چه؟': 'migration-office',
  'واسطه غیرمطمئن در پرونده اقامت یعنی چه؟': 'unsafe-intermediary',
  'شرکت مشاوره ثبت‌شده یعنی چه؟': 'registered-consultancy',
});

Object.assign(EXTRA_TERM_SLUG_BY_TITLE, {
  'قانون ۹۰/۱۸۰ ترکیه چیست؟': 'turkey-90-180-rule',
  'پنجره ۱۸۰ روزه متحرک چیست؟': 'rolling-180-day-window',
  'ورود مجدد به ترکیه چیست؟': 'turkey-re-entry',
  'ظرفیت باقی‌مانده اقامت بدون ویزا چیست؟': 'remaining-visa-free-days',
  'ورود مشروط ۱۰ روزه چیست؟': 'conditional-entry-10-days',
  'مهلت قانونی حضور در ترکیه چیست؟': 'lawful-stay-period',
});

Object.assign(EXTRA_TERM_SLUG_BY_TITLE, {
  'قرارداد اجاره نوتر شده چیست؟': 'notarized-rental-contract',
  'نامه خوابگاه رسمی چیست؟': 'official-dormitory-letter',
  'نفوس ترکیه چیست؟': 'turkey-nufus',
  'برگه نفوس یا Yerleşim Yeri Belgesi چیست؟': 'yerlesim-yeri-belgesi',
});

const ALL_TERM_SLUG_BY_TITLE = {
  ...TERM_SLUG_BY_TITLE,
  ...EXTRA_TERM_SLUG_BY_TITLE,
};

const TERM_DETAILS = {
  'e-ikamet': {
    title: { fa: 'ای‌کامِت', en: 'e-Ikamet' },
    question: { fa: 'ای‌کامِت چیست و چرا برای دانشجوی ترکیه مهم است؟', en: 'What is e-Ikamet?' },
    category: 'اقامت دانشجویی',
    summary: 'ای‌کامِت سامانه آنلاین ثبت درخواست اجازه اقامت در ترکیه است. دانشجو از این مسیر، اطلاعات پرونده اقامت، نوع درخواست و مراحل اولیه را وارد و پیگیری می‌کند.',
    sections: [
      { heading: 'تعریف ساده', body: 'ای‌کامِت یعنی مسیر اینترنتی شروع پرونده اقامت. دانشجو بعد از پذیرش و ورود به ترکیه، برای قانونی ماندن در کشور باید وضعیت اقامت خود را مشخص کند و این سامانه یکی از مهم‌ترین بخش‌های این مسیر است.' },
      { heading: 'چه زمانی به درد دانشجو می‌خورد؟', body: 'وقتی دانشجو می‌خواهد برای اولین بار اقامت بگیرد، اقامت خود را تمدید کند، اطلاعات وقت مراجعه را بررسی کند، یا بداند چه مدارکی باید برای پرونده آماده باشد.' },
      { heading: 'اشتباه رایج', body: 'بعضی دانشجوها فکر می‌کنند ای‌کامِت فقط یک فرم ساده است. در واقع اطلاعاتی که اینجا وارد می‌شود باید با پاسپورت، آدرس، بیمه، دانشگاه و زمان ورود دانشجو هماهنگ باشد.' },
    ],
    checklist: ['پاسپورت معتبر', 'مدرک پذیرش یا ثبت‌نام دانشگاه', 'آدرس محل زندگی', 'بیمه معتبر', 'کنترل دقیق اطلاعات قبل از ثبت نهایی'],
    faq: [
      { q: 'آیا ای‌کامِت همان اقامت است؟', a: 'خیر. ای‌کامِت سامانه درخواست است؛ اقامت نتیجه بررسی پرونده و طی شدن مسیر رسمی است.' },
      { q: 'آیا دانشجو باید خودش وارد سامانه شود؟', a: 'اطلاعات پنل شخصی حساس است. مشاور می‌تواند مسیر را توضیح دهد، اما دانشجو باید مراقب اطلاعات ورود و مدارک خود باشد.' },
    ],
    en: {
      summary: 'e-Ikamet is the online system of Turkey for submitting a residence permit request. Through it, a student enters and follows the residence file information, the request type and the first steps of the process.',
      sections: [
        { heading: 'Simple definition', body: 'e-Ikamet is the online starting point of the residence file. After admission and arrival in Turkey, a student must define a residence status to stay legally, and this system is one of the most important parts of that path.' },
        { heading: 'When does a student need it?', body: 'When a student applies for residence for the first time, renews the residence, checks appointment information, or wants to know which documents the file needs.' },
        { heading: 'Common mistake', body: 'Some students think e-Ikamet is only a simple form. In reality, the information entered here must match the passport, address, insurance, university and arrival date of the student.' },
      ],
      checklist: ['Valid passport', 'University admission or enrollment document', 'Place of residence (address)', 'Valid insurance', 'Review the data carefully before final submission'],
      faq: [
        { q: 'Is e-Ikamet the same as residence?', a: 'No. e-Ikamet is the request system; residence is the result of the file review and the official process.' },
        { q: 'Should the student log in personally?', a: 'Personal account data is sensitive. An advisor can explain the path, but the student should protect the login details and documents.' },
      ],
    },
  },
  'student-residence-permit': {
    title: { fa: 'اقامت دانشجویی', en: 'Student residence permit' },
    question: { fa: 'اقامت دانشجویی ترکیه یعنی چه؟', en: 'What is a student residence permit?' },
    category: 'اقامت دانشجویی',
    summary: 'اقامت دانشجویی اجازه قانونی حضور دانشجو در ترکیه برای ادامه تحصیل است و با گرفتن پذیرش دانشگاه به‌صورت خودکار صادر نمی‌شود.',
    sections: [
      { heading: 'تعریف ساده', body: 'وقتی دانشجو در ترکیه تحصیل می‌کند، باید از نظر قانونی اجازه ماندن در کشور را داشته باشد. اقامت دانشجویی همان چارچوب قانونی برای این حضور است.' },
      { heading: 'فرق آن با پذیرش دانشگاه', body: 'پذیرش دانشگاه نشان می‌دهد دانشجو از نظر آموزشی مسیر ورود به دانشگاه را دارد، اما اقامت دانشجویی موضوع حقوقی و اداری حضور در کشور است و مسیر جداگانه دارد.' },
      { heading: 'چرا باید زود بررسی شود؟', body: 'چون زمان ورود، شهر، آدرس، بیمه و مدارک دانشگاهی می‌تواند روی مسیر اقامت اثر بگذارد. عقب انداختن این موضوع معمولاً ریسک پرونده را زیاد می‌کند.' },
    ],
    checklist: ['وضعیت پذیرش یا ثبت‌نام دانشگاه', 'تاریخ ورود به ترکیه', 'محل سکونت', 'بیمه', 'نوع پرونده: اولین درخواست یا تمدید'],
    faq: [
      { q: 'آیا پذیرش دانشگاه برای اقامت کافی است؟', a: 'نه همیشه. پذیرش پایه مهمی است، اما مراحل اقامت باید جداگانه پیگیری شود.' },
      { q: 'آیا اقامت دانشجویی برای همه یکسان است؟', a: 'مسیر کلی شبیه است، اما مدارک و زمان‌بندی می‌تواند با شرایط دانشجو فرق کند.' },
    ],
    en: {
      summary: 'A student residence permit is the legal permission for a student to stay in Turkey to continue studying, and it is not issued automatically just by receiving university admission.',
      sections: [
        { heading: 'Simple definition', body: 'When a student studies in Turkey, there must be legal permission to remain in the country. The student residence permit is the legal framework for that presence.' },
        { heading: 'How it differs from admission', body: 'University admission shows the academic path into the university, but the residence permit is the legal and administrative matter of being in the country, and it follows a separate process.' },
        { heading: 'Why review it early?', body: 'Because arrival date, city, address, insurance and university documents can all affect the residence path. Delaying it usually increases the risk of the file.' },
      ],
      checklist: ['University admission or enrollment status', 'Arrival date in Turkey', 'Place of residence', 'Insurance', 'File type: first application or renewal'],
      faq: [
        { q: 'Is admission enough for residence?', a: 'Not always. Admission is an important basis, but the residence steps must be handled separately.' },
        { q: 'Is the student residence permit the same for everyone?', a: 'The general path is similar, but documents and timing can differ with the situation of the student.' },
      ],
    },
  },
  'turkey-migration-authority': {
    title: { fa: 'اداره مهاجرت ترکیه', en: 'Turkey migration authority' },
    question: { fa: 'اداره مهاجرت ترکیه چه کاری انجام می‌دهد؟', en: 'What does Turkey migration authority do?' },
    category: 'قوانین اقامت',
    summary: 'اداره مهاجرت ترکیه نهاد اصلی رسیدگی به امور اقامت خارجی‌هاست و برای فهم انواع اقامت و مسیرهای رسمی باید به آن رجوع کرد.',
    sections: [
      { heading: 'تعریف ساده', body: 'اداره مهاجرت ترکیه نهادی است که پرونده‌های مربوط به حضور قانونی خارجی‌ها را بررسی می‌کند. برای دانشجو، این یعنی اقامت و تمدید اقامت باید با چارچوب همین نهاد فهمیده شود.' },
      { heading: 'چرا برای دانشجو مهم است؟', body: 'دانشجو ممکن است از دوستان، شبکه‌های اجتماعی یا تجربه‌های قبلی اطلاعات بگیرد، اما تصمیم نهایی باید با مسیر رسمی هماهنگ باشد. نوع اقامت، مدارک و زمان‌بندی همگی به همین چارچوب مربوط‌اند.' },
      { heading: 'اشتباه رایج', body: 'اشتباه رایج این است که دانشجو همه انواع اقامت را یکی بداند. اقامت دانشجویی، اقامت کوتاه‌مدت و مسیرهای دیگر می‌توانند شرایط متفاوت داشته باشند.' },
    ],
    checklist: ['شناخت نوع اقامت', 'بررسی منبع رسمی', 'تشخیص اولین درخواست یا تمدید', 'هماهنگی آدرس و بیمه', 'کنترل تغییرات احتمالی قانون'],
    faq: [
      { q: 'آیا اداره مهاجرت همان دانشگاه است؟', a: 'خیر. دانشگاه موضوع آموزشی را مدیریت می‌کند، اما اقامت در چارچوب اداری و قانونی جدا بررسی می‌شود.' },
      { q: 'آیا قوانین اقامت همیشه ثابت است؟', a: 'جزئیات می‌تواند تغییر کند؛ برای همین باید تاریخ و منبع رسمی بررسی شود.' },
    ],
    en: {
      summary: 'The Turkey migration authority is the main body handling the residence affairs of foreigners, and it is the reference point for understanding residence types and official paths.',
      sections: [
        { heading: 'Simple definition', body: 'The Turkey migration authority is the body that reviews files related to the legal presence of foreigners. For a student, this means residence and its renewal must be understood within the framework of this body.' },
        { heading: 'Why it matters for students', body: 'A student may collect information from friends, social media or past experiences, but the final decision must align with the official path. Residence type, documents and timing all relate to this framework.' },
        { heading: 'Common mistake', body: 'A common mistake is to treat all residence types as identical. Student residence, short-term residence and other paths can have different conditions.' },
      ],
      checklist: ['Know the residence type', 'Check the official source', 'Identify first application versus renewal', 'Align address and insurance', 'Watch for possible rule changes'],
      faq: [
        { q: 'Is the migration authority the same as the university?', a: 'No. The university handles academics, while residence is reviewed separately within an administrative and legal framework.' },
        { q: 'Are residence rules always fixed?', a: 'Details can change, so the date and the official source should be checked.' },
      ],
    },
  },
  'short-term-residence-permit': {
    title: { fa: 'اقامت کوتاه‌مدت', en: 'Short-term residence permit' },
    question: { fa: 'اقامت کوتاه‌مدت در ترکیه چیست؟', en: 'What is short-term residence?' },
    category: 'انواع اقامت',
    summary: 'اقامت کوتاه‌مدت یکی از انواع اجازه اقامت در ترکیه است و با اقامت دانشجویی یکی نیست. انتخاب مسیر باید با هدف و شرایط واقعی فرد هماهنگ باشد.',
    sections: [
      { heading: 'تعریف ساده', body: 'اقامت کوتاه‌مدت یک دسته اقامتی برای برخی شرایط غیر از مسیر دانشجویی است. این عبارت برای دانشجو مهم است چون نباید هر نوع اقامت را با اقامت دانشجویی اشتباه بگیرد.' },
      { heading: 'برای دانشجو چه اهمیتی دارد؟', body: 'اگر دانشجو قبلاً نوع دیگری از اقامت داشته یا وضعیتش تغییر کرده، ممکن است لازم باشد نوع پرونده با دقت بیشتری بررسی شود.' },
      { heading: 'اشتباه رایج', body: 'بعضی افراد فکر می‌کنند هر اقامتی در ترکیه یک مسیر دارد. در عمل نوع اقامت می‌تواند مدارک، زمان‌بندی و پاسخ پرونده را تغییر دهد.' },
    ],
    checklist: ['هدف حضور در ترکیه', 'وضعیت تحصیلی', 'سابقه اقامت قبلی', 'مدارک لازم برای همان نوع اقامت', 'مشورت قبل از انتخاب مسیر'],
    faq: [
      { q: 'آیا دانشجو باید اقامت کوتاه‌مدت بگیرد؟', a: 'نه لزوماً. دانشجو معمولاً باید مسیر مناسب وضعیت تحصیلی خود را بررسی کند.' },
      { q: 'اگر قبلاً اقامت کوتاه‌مدت داشته باشم چه؟', a: 'باید نوع پرونده و تغییر وضعیت با دقت بررسی شود.' },
    ],
    en: {
      summary: 'Short-term residence is one of the residence permit types in Turkey and is not the same as student residence. The path should match the real purpose and situation of the person.',
      sections: [
        { heading: 'Simple definition', body: 'Short-term residence is a residence category for certain situations other than the student path. The term matters for a student because not every residence type should be confused with student residence.' },
        { heading: 'Why it matters for students', body: 'If a student previously held another residence type or the status changed, the file type may need a more careful review.' },
        { heading: 'Common mistake', body: 'Some people think every residence in Turkey follows one path. In practice, the residence type can change the documents, the timing and the outcome of the file.' },
      ],
      checklist: ['Purpose of being in Turkey', 'Study status', 'Previous residence history', 'Documents required for that residence type', 'Get advice before choosing the path'],
      faq: [
        { q: 'Should a student get short-term residence?', a: 'Not necessarily. A student usually needs the path suited to the study status.' },
        { q: 'What if I previously held short-term residence?', a: 'The file type and any change of status should be reviewed carefully.' },
      ],
    },
  },
  'residence-file-type': {
    title: { fa: 'نوع پرونده اقامت', en: 'Residence file type' },
    question: { fa: 'نوع پرونده اقامت یعنی چه؟', en: 'What is residence file type?' },
    category: 'پرونده اقامت',
    summary: 'نوع پرونده مشخص می‌کند دانشجو برای اولین بار درخواست می‌دهد، تمدید دارد، تغییر وضعیت دارد یا سابقه اقامت قبلی در ترکیه داشته است.',
    sections: [
      { heading: 'تعریف ساده', body: 'نوع پرونده یعنی پرونده دانشجو در کدام وضعیت اداری قرار دارد. اولین درخواست با تمدید یا تغییر وضعیت یکسان نیست.' },
      { heading: 'چرا مهم است؟', body: 'مدارک، زمان اقدام، توضیحاتی که باید داده شود و حتی ریسک‌های پرونده ممکن است با نوع پرونده تغییر کند.' },
      { heading: 'اشتباه رایج', body: 'دانشجو فقط می‌پرسد «برای اقامت چه کار کنم؟» اما قبل از پاسخ باید معلوم شود پرونده او اولین درخواست است یا تمدید یا تغییر وضعیت.' },
    ],
    checklist: ['اولین درخواست یا تمدید', 'تاریخ ورود', 'اقامت قبلی', 'تغییر شهر یا دانشگاه', 'آدرس و بیمه'],
    faq: [
      { q: 'آیا نوع پرونده روی مدارک اثر دارد؟', a: 'بله. ممکن است مدارک و زمان‌بندی را تغییر دهد.' },
      { q: 'از کجا بفهمم نوع پرونده من چیست؟', a: 'باید سابقه اقامت، تاریخ ورود و وضعیت فعلی دانشگاه و آدرس بررسی شود.' },
    ],
    en: {
      summary: 'The file type defines whether the student is applying for the first time, renewing, changing status, or previously held another residence in Turkey.',
      sections: [
        { heading: 'Simple definition', body: 'File type means which administrative situation the file of the student is in. A first application is not the same as a renewal or a change of status.' },
        { heading: 'Why it matters', body: 'Documents, the time to act, the explanations needed and even the risks of the file can change with the file type.' },
        { heading: 'Common mistake', body: 'A student simply asks what to do for residence, but before any answer it must be clear whether the file is a first application, a renewal or a change of status.' },
      ],
      checklist: ['First application or renewal', 'Arrival date', 'Previous residence', 'Change of city or university', 'Address and insurance'],
      faq: [
        { q: 'Does file type affect documents?', a: 'Yes. It can change the documents and the timing.' },
        { q: 'How do I know my file type?', a: 'Residence history, arrival date and the current university and address situation should be reviewed.' },
      ],
    },
  },
  'harc-fee': {
    title: { fa: 'هارچ', en: 'Harc fee' },
    question: { fa: 'هارچ در پرونده اقامت ترکیه چیست؟', en: 'What is harc?' },
    category: 'هزینه اقامت',
    summary: 'هارچ نوعی عوارض یا هزینه قانونی دولتی است که ممکن است در بعضی پرونده‌های اقامت مطرح شود و با هزینه کارت اقامت یکی نیست.',
    sections: [
      { heading: 'تعریف ساده', body: 'هارچ را می‌توان یک هزینه قانونی دولتی دانست که بسته به نوع پرونده و شرایط فرد ممکن است مطرح شود.' },
      { heading: 'فرق آن با کارت اقامت', body: 'هزینه کارت اقامت مربوط به صدور کارت است، اما هارچ می‌تواند هزینه جداگانه‌ای باشد. یکی دانستن این دو باعث اشتباه در بودجه‌بندی می‌شود.' },
      { heading: 'اشتباه رایج', body: 'بعضی دانشجوها از تجربه یک نفر دیگر نتیجه می‌گیرند که همه معاف هستند یا همه باید یک مبلغ ثابت بدهند. این برداشت دقیق نیست.' },
    ],
    checklist: ['سال پرونده', 'ملیت دانشجو', 'نوع درخواست', 'هزینه کارت اقامت', 'هزینه‌های جانبی مثل بیمه و مدارک'],
    faq: [
      { q: 'آیا همه دانشجوها هارچ می‌دهند؟', a: 'نه لزوماً. شرایط باید با پرونده و منبع رسمی بررسی شود.' },
      { q: 'آیا هارچ همان کارت اقامت است؟', a: 'خیر. این دو را باید جداگانه فهمید.' },
    ],
    en: {
      summary: 'Harç is a kind of legal government levy or fee that may apply to some residence files, and it is not the same as the residence card fee.',
      sections: [
        { heading: 'Simple definition', body: 'Harç can be seen as a legal government fee that may apply depending on the file type and the situation of the person.' },
        { heading: 'How it differs from the residence card', body: 'The residence card fee relates to issuing the card, but harç can be a separate cost. Treating them as one leads to budgeting mistakes.' },
        { heading: 'Common mistake', body: 'Some students conclude from a single experience that everyone is exempt or everyone pays a fixed amount. That assumption is not accurate.' },
      ],
      checklist: ['File year', 'Student nationality', 'Request type', 'Residence card fee', 'Side costs such as insurance and documents'],
      faq: [
        { q: 'Does every student pay harç?', a: 'Not necessarily. Conditions should be checked with the file and the official source.' },
        { q: 'Is harç the same as the residence card?', a: 'No. The two should be understood separately.' },
      ],
    },
  },
  'residence-card': {
    title: { fa: 'کارت اقامت', en: 'Residence card' },
    question: { fa: 'کارت اقامت ترکیه چیست؟', en: 'What is a residence card?' },
    category: 'مدارک اقامت',
    summary: 'کارت اقامت مدرک رسمی اجازه اقامت فرد در ترکیه است و معمولاً بعد از طی شدن مسیر بررسی پرونده صادر می‌شود.',
    sections: [
      { heading: 'تعریف ساده', body: 'کارت اقامت مثل مدرک رسمی وضعیت اقامت فرد در ترکیه است. دانشجو بعد از طی مراحل اداری، در صورت تأیید پرونده، این کارت را دریافت می‌کند.' },
      { heading: 'چه اطلاعاتی به آن مربوط است؟', body: 'اطلاعات هویتی، نوع اقامت، مدت اعتبار و ارتباط آن با پرونده اقامت دانشجو اهمیت دارد.' },
      { heading: 'اشتباه رایج', body: 'بعضی دانشجوها فکر می‌کنند گرفتن کارت فقط یک پرداخت ساده است. در واقع کارت نتیجه بررسی کل پرونده است.' },
    ],
    checklist: ['درستی اطلاعات هویتی', 'مدت اعتبار', 'آدرس تحویل', 'هماهنگی با نوع اقامت', 'نگهداری امن کارت'],
    faq: [
      { q: 'آیا کارت اقامت همان ویزا است؟', a: 'خیر. کارت اقامت مدرک وضعیت اقامت داخل ترکیه است.' },
      { q: 'اگر کارت دیر برسد چه باید کرد؟', a: 'باید وضعیت پرونده و مسیر رسمی پیگیری بررسی شود.' },
    ],
    en: {
      summary: 'The residence card is the official document of residence permission in Turkey and is usually issued after the file review process is completed.',
      sections: [
        { heading: 'Simple definition', body: 'The residence card is like the official document of the residence status of a person in Turkey. After the administrative steps, if the file is approved, the student receives this card.' },
        { heading: 'What information relates to it?', body: 'Identity information, residence type, validity period and the link to the residence file of the student all matter.' },
        { heading: 'Common mistake', body: 'Some students think getting the card is only a simple payment. In reality, the card is the result of reviewing the whole file.' },
      ],
      checklist: ['Correct identity information', 'Validity period', 'Delivery address', 'Alignment with the residence type', 'Keep the card safe'],
      faq: [
        { q: 'Is the residence card the same as a visa?', a: 'No. The residence card is the document of residence status inside Turkey.' },
        { q: 'What if the card arrives late?', a: 'The file status and the official follow-up path should be checked.' },
      ],
    },
  },
  'residence-fee-exemption': {
    title: { fa: 'معافیت هزینه اقامت', en: 'Residence fee exemption' },
    question: { fa: 'معافیت هزینه اقامت یعنی چه؟', en: 'What is residence fee exemption?' },
    category: 'هزینه اقامت',
    summary: 'معافیت یعنی در شرایط خاص، فرد از پرداخت بخشی از هزینه قانونی معاف باشد؛ اما این موضوع عمومی، ثابت و قابل تعمیم به همه دانشجویان نیست.',
    sections: [
      { heading: 'تعریف ساده', body: 'معافیت یعنی قانون در یک شرایط مشخص، پرداخت یک هزینه را برای فرد لازم نداند یا بخشی از آن را حذف کند.' },
      { heading: 'چرا برای دانشجو حساس است؟', body: 'اگر دانشجو فکر کند همه معاف هستند، ممکن است بودجه اشتباه بچیند. اگر هم فکر کند هیچ معافیتی وجود ندارد، ممکن است هزینه را بیش از حد تخمین بزند.' },
      { heading: 'اشتباه رایج', body: 'شنیدن تجربه یک نفر و تعمیم دادن آن به همه دانشجویان. معافیت می‌تواند به ملیت، سال و نوع پرونده وابسته باشد.' },
    ],
    checklist: ['ملیت', 'سال اقدام', 'نوع اقامت', 'منبع رسمی هزینه', 'هزینه‌های جداگانه پرونده'],
    faq: [
      { q: 'آیا معافیت برای همه است؟', a: 'خیر. باید پرونده و منبع رسمی بررسی شود.' },
      { q: 'آیا معافیت یعنی هیچ هزینه‌ای ندارم؟', a: 'نه همیشه. ممکن است بعضی هزینه‌ها جداگانه باقی بمانند.' },
    ],
    en: {
      summary: 'Exemption means that in specific conditions a person does not pay part of a legal fee; but this is not general, fixed, or applicable to every student.',
      sections: [
        { heading: 'Simple definition', body: 'Exemption means that the law, in a specific situation, does not require a fee or removes part of it.' },
        { heading: 'Why it is sensitive for students', body: 'If a student assumes everyone is exempt, the budget may be planned wrongly. If a student assumes no exemption exists, the cost may be overestimated.' },
        { heading: 'Common mistake', body: 'Hearing a single experience and generalizing it to all students. Exemption can depend on nationality, year and file type.' },
      ],
      checklist: ['Nationality', 'Application year', 'Residence type', 'Official source for the fee', 'Separate file costs'],
      faq: [
        { q: 'Is the exemption for everyone?', a: 'No. The file and the official source should be checked.' },
        { q: 'Does exemption mean no cost at all?', a: 'Not always. Some costs may remain separate.' },
      ],
    },
  },
  'turkey-e-government': {
    title: { fa: 'دولت الکترونیک ترکیه', en: 'Turkey e-Government' },
    question: { fa: 'دولت الکترونیک ترکیه چیست؟', en: 'What is Turkey e-Government?' },
    category: 'خدمات دیجیتال',
    summary: 'دولت الکترونیک ترکیه درگاه آنلاین خدمات دولتی است و دانشجو ممکن است برای استعلام‌ها، پیگیری‌ها و امور اداری به آن نیاز پیدا کند.',
    sections: [
      { heading: 'تعریف ساده', body: 'دولت الکترونیک ترکیه مثل یک پنجره آنلاین برای خدمات دولتی است. بسیاری از امور اداری که قبلاً حضوری انجام می‌شد، ممکن است از این مسیر قابل پیگیری باشد.' },
      { heading: 'چه زمانی برای دانشجو مهم می‌شود؟', body: 'بعد از ورود، اقامت، دریافت شماره هویت خارجی یا شروع امور اداری، دانشجو ممکن است برای برخی خدمات به این درگاه نیاز داشته باشد.' },
      { heading: 'اشتباه رایج', body: 'دادن رمز یا اطلاعات ورود به افراد دیگر بدون دلیل روشن. این پنل به اطلاعات شخصی وصل است و باید با احتیاط استفاده شود.' },
    ],
    checklist: ['شماره هویت خارجی', 'رمز امن', 'عدم اشتراک بی‌احتیاط اطلاعات', 'شناخت خدمت مورد نیاز', 'بررسی وضعیت پرونده'],
    faq: [
      { q: 'آیا از روز اول ورود به ترکیه لازم است؟', a: 'نه همیشه. نیاز به آن به مرحله پرونده و خدمات مورد نظر بستگی دارد.' },
      { q: 'آیا می‌شود رمز را به مشاور داد؟', a: 'اصل کار حفظ حریم خصوصی است. هرگونه اشتراک اطلاعات باید بسیار بااحتیاط باشد.' },
    ],
    en: {
      summary: 'The Turkish e-Government (e-Devlet) is the online portal for government services, and a student may need it for inquiries, follow-ups and administrative matters.',
      sections: [
        { heading: 'Simple definition', body: 'The Turkish e-Government is like an online window for government services. Many administrative tasks that were once done in person may be followed through this path.' },
        { heading: 'When does it matter for a student?', body: 'After arrival, residence, receiving a foreign identity number, or starting administrative matters, a student may need this portal for some services.' },
        { heading: 'Common mistake', body: 'Giving a password or login details to others without a clear reason. This panel is linked to personal data and must be used carefully.' },
      ],
      checklist: ['Foreign identity number', 'A secure password', 'Do not share data carelessly', 'Know the service you need', 'Check the file status'],
      faq: [
        { q: 'Is it needed from the first day in Turkey?', a: 'Not always. The need depends on the file stage and the service in question.' },
        { q: 'Can I give the password to an advisor?', a: 'The principle is to protect privacy. Any sharing of information should be done very carefully.' },
      ],
    },
  },
  'foreign-identity-number': {
    title: { fa: 'شماره هویت خارجی', en: 'Foreign identity number' },
    question: { fa: 'شماره هویت خارجی در ترکیه چیست؟', en: 'What is a foreign identity number?' },
    category: 'شناسه دانشجو',
    summary: 'شماره هویت خارجی یک شناسه رسمی برای افراد خارجی در ترکیه است و در بسیاری از خدمات اداری و دیجیتال کاربرد دارد.',
    sections: [
      { heading: 'تعریف ساده', body: 'این شماره برای شناسایی فرد خارجی در سیستم‌های اداری ترکیه استفاده می‌شود. دانشجو ممکن است در مسیر اقامت و خدمات دولتی با آن روبه‌رو شود.' },
      { heading: 'چرا مهم است؟', body: 'بسیاری از پیگیری‌ها، استعلام‌ها و خدمات دیجیتال ممکن است به این شماره وابسته باشند.' },
      { heading: 'اشتباه رایج', body: 'دانشجو نباید شماره هویت و اطلاعات مرتبط با آن را مثل یک اطلاعات عمومی بی‌اهمیت بداند. این شناسه به پرونده شخصی او وصل است.' },
    ],
    checklist: ['نگهداری امن شماره', 'هماهنگی با کارت یا پرونده اقامت', 'استفاده در خدمات دولتی', 'عدم ارسال بی‌احتیاط', 'بررسی صحت رقم‌ها'],
    faq: [
      { q: 'آیا شماره هویت خارجی همان شماره پاسپورت است؟', a: 'خیر. این یک شناسه اداری جدا در ترکیه است.' },
      { q: 'آیا برای همه خدمات لازم است؟', a: 'نه، اما برای بسیاری از خدمات اداری می‌تواند مهم باشد.' },
    ],
    en: {
      summary: 'The foreign identity number is an official identifier for foreigners in Turkey and is used in many administrative and digital services.',
      sections: [
        { heading: 'Simple definition', body: 'This number is used to identify a foreigner in the administrative systems of Turkey. A student may encounter it during the residence path and government services.' },
        { heading: 'Why it matters', body: 'Many follow-ups, inquiries and digital services may depend on this number.' },
        { heading: 'Common mistake', body: 'A student should not treat the identity number and its related information as unimportant public data. This identifier is linked to the personal file.' },
      ],
      checklist: ['Keep the number safe', 'Align it with the residence card or file', 'Use it for government services', 'Do not send it carelessly', 'Check that the digits are correct'],
      faq: [
        { q: 'Is the foreign identity number the same as the passport number?', a: 'No. It is a separate administrative identifier in Turkey.' },
        { q: 'Is it needed for all services?', a: 'No, but it can be important for many administrative services.' },
      ],
    },
  },
  'student-data-privacy': {
    title: { fa: 'حریم خصوصی دانشجو', en: 'Student data privacy' },
    question: { fa: 'حریم خصوصی دانشجو در پرونده‌های ترکیه یعنی چه؟', en: 'What is student data privacy?' },
    category: 'امنیت اطلاعات',
    summary: 'حریم خصوصی یعنی اطلاعات پنل، رمزها، مدارک، شماره‌های شناسایی و جزئیات پرونده دانشجو نباید بی‌احتیاط در اختیار دیگران قرار بگیرد.',
    sections: [
      { heading: 'تعریف ساده', body: 'هر اطلاعاتی که به هویت، اقامت، دانشگاه، شماره تماس، رمز ورود یا مدارک دانشجو مربوط است باید با احتیاط مدیریت شود.' },
      { heading: 'چرا مهم است؟', body: 'چون یک اشتباه در ارسال رمز یا مدرک می‌تواند باعث سوءاستفاده، تغییر اطلاعات یا از دست رفتن کنترل پرونده شود.' },
      { heading: 'رفتار درست', body: 'مشاور باید مسیر را توضیح دهد، اما دانشجو هم باید بداند چه اطلاعاتی را، به چه کسی و برای چه کاری می‌دهد.' },
    ],
    checklist: ['عدم ارسال رمز در چت‌های عمومی', 'کنترل گیرنده مدارک', 'استفاده از مسیرهای امن', 'حفظ کپی مدارک', 'پرسیدن دلیل نیاز به هر اطلاعات'],
    faq: [
      { q: 'آیا همه مدارک را می‌توان در هر پیام‌رسانی فرستاد؟', a: 'بهتر است نه. اطلاعات حساس باید با احتیاط و مسیر امن ارسال شود.' },
      { q: 'آیا مشاور می‌تواند راهنمایی کند بدون داشتن رمز؟', a: 'در بسیاری موارد بله. اصل کار آموزش مسیر و کنترل ریسک است.' },
    ],
    en: {
      summary: 'Privacy means that panel information, passwords, documents, identification numbers and file details of a student should not be shared carelessly with others.',
      sections: [
        { heading: 'Simple definition', body: 'Any information related to identity, residence, university, phone number, login password or documents of a student must be handled carefully.' },
        { heading: 'Why it matters', body: 'Because one mistake in sending a password or document can lead to misuse, data changes or loss of control over the file.' },
        { heading: 'Right behavior', body: 'An advisor should explain the path, but the student should also know what information is given, to whom, and for what purpose.' },
      ],
      checklist: ['Do not send passwords in public chats', 'Check who receives documents', 'Use secure channels', 'Keep copies of documents', 'Ask why each piece of information is needed'],
      faq: [
        { q: 'Can all documents be sent through any messenger?', a: 'Better not. Sensitive information should be sent carefully and through a secure channel.' },
        { q: 'Can an advisor help without having the password?', a: 'In many cases yes. The core work is teaching the path and managing risk.' },
      ],
    },
  },
  'address-registration': {
    title: { fa: 'ثبت آدرس', en: 'Address registration' },
    question: { fa: 'ثبت آدرس در ترکیه یعنی چه؟', en: 'What is address registration?' },
    category: 'آدرس و سکونت',
    summary: 'ثبت آدرس یعنی محل سکونت فرد در سیستم رسمی ثبت شود. برای دانشجو، آدرس می‌تواند با اقامت و پیگیری‌های اداری ارتباط داشته باشد.',
    sections: [
      { heading: 'تعریف ساده', body: 'ثبت آدرس یعنی مشخص شود دانشجو در ترکیه کجا زندگی می‌کند و این اطلاعات در مسیر رسمی قابل پیگیری باشد.' },
      { heading: 'چرا برای دانشجو مهم است؟', body: 'آدرس ممکن است در پرونده اقامت، خدمات اداری، پیگیری‌ها یا تغییر محل سکونت اهمیت پیدا کند.' },
      { heading: 'اشتباه رایج', body: 'بعضی دانشجوها آدرس را فقط یک نشانی معمولی می‌دانند؛ در حالی که در ترکیه می‌تواند یک داده رسمی مهم باشد.' },
    ],
    checklist: ['آدرس دقیق', 'مدرک سکونت', 'خوابگاه یا خانه اجاره‌ای', 'تغییر آدرس', 'هماهنگی با پرونده اقامت'],
    faq: [
      { q: 'آیا آدرس برای اقامت مهم است؟', a: 'بله. می‌تواند بخشی از اطلاعات مهم پرونده باشد.' },
      { q: 'اگر آدرس عوض شود چه؟', a: 'باید مسیر درست تغییر آدرس بررسی و پیگیری شود.' },
    ],
    en: {
      summary: 'Address registration means recording the place of residence of a person in the official system. For a student, the address can relate to residence and administrative follow-ups.',
      sections: [
        { heading: 'Simple definition', body: 'Address registration means defining where the student lives in Turkey so that this information can be followed through the official path.' },
        { heading: 'Why it matters for students', body: 'The address can matter in the residence file, administrative services, follow-ups, or a change of residence.' },
        { heading: 'Common mistake', body: 'Some students see the address as just an ordinary location, whereas in Turkey it can be important official data.' },
      ],
      checklist: ['Accurate address', 'Proof of residence', 'Dorm or rental housing', 'Change of address', 'Alignment with the residence file'],
      faq: [
        { q: 'Does the address matter for residence?', a: 'Yes. It can be part of the important file information.' },
        { q: 'What if the address changes?', a: 'The correct address-change path should be reviewed and followed.' },
      ],
    },
  },
  'proof-of-residence': {
    title: { fa: 'مدرک سکونت', en: 'Proof of residence' },
    question: { fa: 'مدرک سکونت برای دانشجو چیست؟', en: 'What is proof of residence?' },
    category: 'آدرس و سکونت',
    summary: 'مدرک سکونت سندی است که نشان می‌دهد دانشجو در یک محل مشخص زندگی می‌کند؛ مثل قرارداد اجاره، مدرک خوابگاه یا سند مشابه.',
    sections: [
      { heading: 'تعریف ساده', body: 'مدرک سکونت یعنی چیزی که آدرس واقعی دانشجو را قابل اثبات کند. نوع مدرک بسته به خوابگاه، خانه اجاره‌ای یا شرایط دیگر فرق می‌کند.' },
      { heading: 'چرا مهم است؟', body: 'بدون مدرک قابل قبول، توضیح آدرس ممکن است کافی نباشد. دانشجو باید از همان ابتدا بداند چه چیزی برای محل سکونت او قابل ارائه است.' },
      { heading: 'اشتباه رایج', body: 'دانشجو خانه یا خوابگاه را انتخاب می‌کند، اما بعداً متوجه می‌شود مدرک لازم را درست نگرفته است.' },
    ],
    checklist: ['قرارداد اجاره یا مدرک خوابگاه', 'نام و آدرس دقیق', 'تاریخ اعتبار', 'هماهنگی با پرونده اقامت', 'نگهداری نسخه قابل ارائه'],
    faq: [
      { q: 'آیا مدرک خوابگاه کافی است؟', a: 'ممکن است کافی باشد، اما باید نوع مدرک و شرایط پرونده بررسی شود.' },
      { q: 'آیا قول شفاهی صاحب‌خانه کافی است؟', a: 'معمولاً برای مسیر اداری، مدرک قابل ارائه لازم است.' },
    ],
    en: {
      summary: 'Proof of residence is a document showing that a student lives at a specific place, such as a rental contract, a dorm document or a similar record.',
      sections: [
        { heading: 'Simple definition', body: 'Proof of residence means something that can verify the real address of the student. The type of document differs depending on a dorm, rented housing or other conditions.' },
        { heading: 'Why it matters', body: 'Without an acceptable document, explaining the address may not be enough. A student should know from the start what can be provided for the residence.' },
        { heading: 'Common mistake', body: 'A student chooses a house or dorm but later realizes the required document was not properly obtained.' },
      ],
      checklist: ['Rental contract or dorm document', 'Exact name and address', 'Validity date', 'Alignment with the residence file', 'Keep a presentable copy'],
      faq: [
        { q: 'Is a dorm document enough?', a: 'It may be enough, but the document type and the file conditions should be checked.' },
        { q: 'Is a verbal promise from the landlord enough?', a: 'For the administrative path, a presentable document is usually required.' },
      ],
    },
  },
  'wrong-address-risk': {
    title: { fa: 'ریسک آدرس نادرست', en: 'Wrong address risk' },
    question: { fa: 'آدرس نادرست در ترکیه چه خطری برای دانشجو دارد؟', en: 'What is wrong address risk?' },
    category: 'آدرس و سکونت',
    summary: 'آدرس نادرست یا ناقص می‌تواند باعث تأخیر، مشکل اداری یا حتی جریمه شود. دانشجو باید آدرس را دقیق و قابل اثبات نگه دارد.',
    sections: [
      { heading: 'تعریف ساده', body: 'آدرس نادرست یعنی آدرسی که با محل واقعی زندگی، مدرک سکونت یا اطلاعات رسمی دانشجو هماهنگ نیست.' },
      { heading: 'چه مشکلی ایجاد می‌کند؟', body: 'ممکن است پیگیری پرونده سخت شود، اطلاعات رسمی ناسازگار شود، یا دانشجو در تغییر آدرس و امور اداری دچار دردسر شود.' },
      { heading: 'رفتار درست', body: 'دانشجو باید از همان ابتدا آدرس واقعی، مدرک سکونت و تغییرات بعدی را جدی بگیرد و قبل از اقدام، مسیر درست را بررسی کند.' },
    ],
    checklist: ['نوشتن آدرس کامل', 'هماهنگی با مدرک سکونت', 'ثبت تغییر آدرس', 'پرهیز از آدرس صوری', 'بررسی منبع رسمی برای جریمه‌ها'],
    faq: [
      { q: 'آیا آدرس ناقص هم مشکل‌ساز است؟', a: 'بله، اگر باعث ناسازگاری یا عدم پیگیری درست شود.' },
      { q: 'آیا عدد جریمه همیشه ثابت است؟', a: 'خیر. جزئیات باید با منبع رسمی و سال مربوطه بررسی شود.' },
    ],
    en: {
      summary: 'A wrong or incomplete address can cause delays, administrative problems or even a fine. A student should keep the address accurate and verifiable.',
      sections: [
        { heading: 'Simple definition', body: 'A wrong address is one that does not match the real place of residence, the proof of residence, or the official information of the student.' },
        { heading: 'What problems does it cause?', body: 'Following the file may become harder, official information may become inconsistent, or the student may face trouble with address changes and administrative matters.' },
        { heading: 'Right behavior', body: 'A student should take the real address, the proof of residence and later changes seriously from the start, and review the correct path before acting.' },
      ],
      checklist: ['Write the full address', 'Align it with the proof of residence', 'Register an address change', 'Avoid fake addresses', 'Check the official source for fines'],
      faq: [
        { q: 'Is an incomplete address also a problem?', a: 'Yes, if it causes inconsistency or prevents proper follow-up.' },
        { q: 'Is the fine amount always fixed?', a: 'No. Details should be checked with the official source and the relevant year.' },
      ],
    },
  },
};

const EXTRA_TERM_DETAILS = {
  'turkey-90-day-visa-exemption': {
    title: { fa: 'معافیت ویزای ۹۰ روزه ترکیه', en: 'Turkey 90-day visa exemption' },
    question: { fa: 'معافیت ویزای ۹۰ روزه ترکیه برای دانشجوی ایرانی یعنی چه؟', en: 'What does Turkey 90-day visa exemption mean?' },
    category: 'قوانین اقامت',
    summary: 'برای شهروند ایرانی، ورود کوتاه‌مدت به ترکیه معمولا بدون ویزا و تا ۹۰ روز در هر دوره ۱۸۰ روزه ممکن است؛ اما این مهلت جای اقامت دانشجویی را نمی‌گیرد.',
    sections: [
      { heading: 'تعریف ساده', body: 'معافیت ویزای ۹۰ روزه یعنی شهروند ایرانی برای سفر کوتاه‌مدت معمولا بدون گرفتن ویزای جداگانه وارد ترکیه می‌شود و تا سقف ۹۰ روز در بازه ۱۸۰ روزه اجازه حضور کوتاه‌مدت دارد.' },
      { heading: 'چرا برای دانشجو مهم است؟', body: 'دانشجو ممکن است با همین معافیت وارد ترکیه شود، اما اگر قصد تحصیل و ماندن طولانی‌تر دارد، باید قبل از پایان مهلت قانونی برای اقامت دانشجویی اقدام کند.' },
      { heading: 'اشتباه رایج', body: 'بعضی‌ها تصور می‌کنند چون ورود بدون ویزا بوده، دیگر اقامت لازم نیست. این برداشت درست نیست؛ ورود کوتاه‌مدت و اقامت دانشجویی دو موضوع جدا هستند.' },
    ],
    checklist: ['تاریخ ورود به ترکیه', 'محاسبه ۹۰ روز در ۱۸۰ روز', 'هدف سفر یا تحصیل', 'زمان شروع پرونده اقامت', 'کنترل مهر ورود پاسپورت'],
    faq: [
      { q: 'آیا ۹۰ روز یعنی دقیقا سه ماه تقویمی؟', a: 'بهتر است آن را ۹۰ روز در هر دوره ۱۸۰ روزه بدانیم، نه صرفا سه ماه تقویمی. تاریخ ورود باید دقیق بررسی شود.' },
      { q: 'اگر دانشجو بیشتر از ۹۰ روز می‌ماند چه باید بکند؟', a: 'باید قبل از پایان مهلت قانونی، برای نوع مناسب اقامت اقدام کند و پرونده را عقب نیندازد.' },
    ],
    en: {
      summary: 'Iranian citizens are generally visa-exempt for short stays in Turkey for up to 90 days within 180 days, but this does not replace student residence.',
      sections: [
        { heading: 'Simple definition', body: 'It allows short-term entry and stay, generally up to 90 days within 180 days.' },
        { heading: 'Why it matters for students', body: 'A student entering with this exemption still needs residence if staying longer for study.' },
        { heading: 'Common mistake', body: 'Short-term visa exemption is not the same as student residence.' },
      ],
      checklist: ['Arrival date', '90/180 calculation', 'Study purpose', 'Residence timing', 'Passport entry stamp'],
      faq: [
        { q: 'Is it exactly three calendar months?', a: 'It is better understood as 90 days within 180 days.' },
        { q: 'What if the student stays longer?', a: 'The student should apply for the proper residence before the lawful stay expires.' },
      ],
    },
  },
  'residence-randevu': {
    title: { fa: 'راندوو اقامت', en: 'Residence appointment' },
    question: { fa: 'راندوو اقامت ترکیه چیست و چرا برای دانشجو مهم است؟', en: 'What is a residence appointment?' },
    category: 'پرونده اقامت',
    summary: 'راندوو یعنی وقت مراجعه یا مرحله زمان‌بندی اداری پرونده اقامت. دانشجو باید اطلاعات و مدارک را قبل از رسیدن به این مرحله آماده کند.',
    sections: [
      { heading: 'تعریف ساده', body: 'راندوو در مسیر اقامت یعنی پرونده بعد از ثبت درخواست به زمان یا مسیر مشخصی برای تکمیل و بررسی وصل می‌شود.' },
      { heading: 'چه اطلاعاتی لازم دارد؟', body: 'نام مادر به لاتین، شماره ترک فعال، ایمیل، وضعیت تأهل، اطلاعات پاسپورت، تاریخ ورود، آدرس و مدارک دانشجویی از مواردی هستند که قبل از راندوو باید آماده باشند.' },
      { heading: 'اشتباه رایج', body: 'اشتباه رایج این است که دانشجو اول راندوو می‌خواهد و بعد تازه دنبال مدرک می‌گردد. ترتیب درست این است که مدارک اصلی از قبل بررسی شوند.' },
    ],
    checklist: ['اطلاعات هویتی', 'شماره تلفن ترکیه', 'ایمیل فعال', 'آدرس قابل اثبات', 'مدارک دانشگاهی و پاسپورت'],
    faq: [
      { q: 'آیا راندوو همان باشورو است؟', a: 'خیر. باشورو یعنی درخواست؛ راندوو یعنی وقت یا مرحله پیگیری مرتبط با آن درخواست.' },
      { q: 'اگر مدرک ناقص باشد چه می‌شود؟', a: 'ممکن است پرونده به اصلاح، تأخیر یا تکمیل مدارک نیاز پیدا کند.' },
    ],
    en: {
      summary: 'Randevu is the appointment or administrative timing step in the residence file.',
      sections: [
        { heading: 'Simple definition', body: 'It connects the submitted residence file to an appointment or next administrative step.' },
        { heading: 'What it needs', body: 'Identity, phone, email, address, passport and university details should be ready.' },
        { heading: 'Common mistake', body: 'Students often seek an appointment before preparing the file.' },
      ],
      checklist: ['Identity data', 'Turkish phone', 'Active email', 'Address proof', 'University and passport documents'],
      faq: [
        { q: 'Is randevu the same as başvuru?', a: 'No. Başvuru is the application; randevu is the appointment or next file step.' },
        { q: 'What if documents are missing?', a: 'The file may need correction or completion.' },
      ],
    },
  },
  'residence-basvuru': {
    title: { fa: 'باشورو اقامت', en: 'Residence application' },
    question: { fa: 'باشورو اقامت ترکیه یعنی چه؟', en: 'What does residence başvuru mean?' },
    category: 'پرونده اقامت',
    summary: 'باشورو یعنی ثبت درخواست اقامت. در پرونده دانشجویی، باشورو باید با پاسپورت، تاریخ ورود، بیمه، آدرس و وضعیت دانشگاه هماهنگ باشد.',
    sections: [
      { heading: 'تعریف ساده', body: 'باشورو همان درخواست رسمی است که برای اقامت ثبت می‌شود. این کلمه در ترکی به معنی درخواست یا اپلیکیشن است.' },
      { heading: 'در اقامت دانشجویی', body: 'در اقامت دانشجویی، باشورو باید نشان دهد دانشجو چه نوع اقامتی می‌خواهد، چه زمانی وارد شده، کجا زندگی می‌کند و مدرک دانشجویی او چیست.' },
      { heading: 'اشتباه رایج', body: 'انتخاب نوع درخواست اشتباه یا وارد کردن اطلاعات ناهماهنگ می‌تواند پرونده را به دردسر بیندازد.' },
    ],
    checklist: ['نوع اقامت', 'تاریخ ورود', 'پاسپورت', 'بیمه سلامت', 'آدرس و برگه دانشجویی'],
    faq: [
      { q: 'باشورو را چه زمانی باید ثبت کرد؟', a: 'برای دانشجوی تازه‌وارد، باید قبل از پایان مهلت قانونی حضور و بعد از آماده شدن اطلاعات اصلی پرونده اقدام شود.' },
      { q: 'آیا بعد از باشورو کار تمام است؟', a: 'خیر. بعد از درخواست باید مدارک، راندوو و وضعیت پرونده هم پیگیری شود.' },
    ],
    en: {
      summary: 'Başvuru means residence application. It should match the passport, entry date, insurance, address and university status.',
      sections: [
        { heading: 'Simple definition', body: 'Başvuru means application or request.' },
        { heading: 'For students', body: 'It should reflect the correct residence type, arrival date, address and student proof.' },
        { heading: 'Common mistake', body: 'Wrong file type or inconsistent data can create problems.' },
      ],
      checklist: ['Residence type', 'Entry date', 'Passport', 'Health insurance', 'Address and student certificate'],
      faq: [
        { q: 'When should it be submitted?', a: 'Before the lawful stay expires and after core file data is ready.' },
        { q: 'Is the file finished after başvuru?', a: 'No. The appointment and file status must also be followed.' },
      ],
    },
  },
  'residence-health-insurance': {
    title: { fa: 'بیمه سلامت اقامت', en: 'Residence health insurance' },
    question: { fa: 'بیمه سلامت برای اقامت دانشجویی ترکیه چیست؟', en: 'What is residence health insurance?' },
    category: 'مدارک اقامت',
    summary: 'بیمه سلامت معتبر یکی از مدارک مهم پرونده اقامت است و باید با بازه زمانی و شرایط دانشجو هماهنگ باشد.',
    sections: [
      { heading: 'تعریف ساده', body: 'بیمه سلامت مدرکی است که پوشش درمانی دانشجو را در دوره اقامت نشان می‌دهد و در پرونده اقامت بررسی می‌شود.' },
      { heading: 'چرا مهم است؟', body: 'اگر بیمه با تاریخ پرونده، سن یا وضعیت دانشجو هماهنگ نباشد، پرونده ممکن است ناقص شود یا نیاز به اصلاح پیدا کند.' },
      { heading: 'نقش آکا', body: 'آکا می‌تواند به دانشجو کمک کند مسیر درست بیمه را بفهمد، زمان مناسب را بررسی کند و بیمه را با چک‌لیست اقامت هماهنگ کند.' },
    ],
    checklist: ['بازه اعتبار بیمه', 'هماهنگی با تاریخ پرونده', 'نام و اطلاعات پاسپورت', 'نوع بیمه مناسب دانشجو', 'نگهداری نسخه قابل ارائه'],
    faq: [
      { q: 'آیا هر بیمه‌ای قابل قبول است؟', a: 'باید با شرایط پرونده و مسیر رسمی هماهنگ باشد؛ انتخاب بیمه بدون بررسی می‌تواند مشکل‌ساز شود.' },
      { q: 'آیا آکا در بیمه کمک می‌کند؟', a: 'بله، آکا می‌تواند در فهم مسیر و هماهنگی بیمه با پرونده اقامت راهنمایی کند.' },
    ],
    en: {
      summary: 'Valid health insurance is an important residence document and should match the student file period and situation.',
      sections: [
        { heading: 'Simple definition', body: 'It shows health coverage for the residence period.' },
        { heading: 'Why it matters', body: 'Mismatch in dates or file situation can create correction needs.' },
        { heading: 'ACCA support', body: 'ACCA can help the student understand and coordinate the insurance path.' },
      ],
      checklist: ['Insurance validity', 'File date alignment', 'Passport data', 'Suitable insurance type', 'Presentable copy'],
      faq: [
        { q: 'Is any insurance enough?', a: 'It should fit the file conditions.' },
        { q: 'Can ACCA help?', a: 'Yes, with guidance and coordination.' },
      ],
    },
  },
  'student-certificate': {
    title: { fa: 'برگه دانشجویی', en: 'Student certificate' },
    question: { fa: 'برگه دانشجویی در پرونده اقامت ترکیه چیست؟', en: 'What is a student certificate?' },
    category: 'مدارک اقامت',
    summary: 'برگه دانشجویی مدرکی است که وضعیت دانشجویی فعال فرد را نشان می‌دهد و در اقامت دانشجویی نقش کلیدی دارد.',
    sections: [
      { heading: 'تعریف ساده', body: 'برگه دانشجویی یا öğrenci belgesi مدرکی است که نشان می‌دهد فرد در دانشگاه ثبت‌نام یا وضعیت دانشجویی فعال دارد.' },
      { heading: 'چرا مهم است؟', body: 'چون اقامت دانشجویی باید به وضعیت واقعی تحصیل وصل باشد. بدون مدرک معتبر، اثبات دانشجو بودن سخت می‌شود.' },
      { heading: 'اشتباه رایج', body: 'دانشجو فکر می‌کند نامه پذیرش همیشه کافی است، در حالی که در بسیاری از پرونده‌ها مدرک وضعیت دانشجویی فعال اهمیت دارد.' },
    ],
    checklist: ['نام دانشجو', 'نام دانشگاه', 'وضعیت فعال', 'تاریخ صدور', 'نسخه قابل ارائه'],
    faq: [
      { q: 'اگر هنوز برگه دانشجویی ندارم چه کنم؟', a: 'باید زمان‌بندی ثبت‌نام دانشگاه و مسیر اقامت با هم بررسی شود.' },
      { q: 'آیا پذیرش همان برگه دانشجویی است؟', a: 'نه همیشه. پذیرش و گواهی دانشجویی می‌توانند کاربرد متفاوت داشته باشند.' },
    ],
    en: {
      summary: 'A student certificate proves active student status and is important for student residence.',
      sections: [
        { heading: 'Simple definition', body: 'It confirms active university enrollment or student status.' },
        { heading: 'Why it matters', body: 'Student residence must connect to real study status.' },
        { heading: 'Common mistake', body: 'Admission letters and active student certificates are not always the same.' },
      ],
      checklist: ['Student name', 'University name', 'Active status', 'Issue date', 'Presentable copy'],
      faq: [
        { q: 'What if it is not issued yet?', a: 'University registration timing and residence timing should be reviewed.' },
        { q: 'Is admission the same?', a: 'Not always.' },
      ],
    },
  },
  'notarized-address-document': {
    title: { fa: 'برگه نوتر آدرس', en: 'Notarized address document' },
    question: { fa: 'برگه نوتر آدرس برای اقامت ترکیه چیست؟', en: 'What is a notarized address document?' },
    category: 'آدرس و سکونت',
    summary: 'برگه نوتر آدرس یا مدرک آدرس قابل اثبات برای نشان دادن محل سکونت دانشجو استفاده می‌شود و بسته به خانه، خوابگاه یا قرارداد می‌تواند متفاوت باشد.',
    sections: [
      { heading: 'تعریف ساده', body: 'نوتر در ترکیه نقش دفتر اسناد رسمی را دارد. برگه نوتر آدرس یعنی مدرکی که آدرس یا قرارداد سکونت را قابل استنادتر می‌کند.' },
      { heading: 'برای دانشجو', body: 'اگر دانشجو در خانه اجاره‌ای یا خوابگاه است، نوع مدرک آدرس باید با محل واقعی سکونت و مدارک قابل ارائه هماهنگ باشد.' },
      { heading: 'اشتباه رایج', body: 'استفاده از آدرس صوری یا ناهماهنگ می‌تواند باعث تأخیر، مشکل اداری یا ریسک پرونده شود.' },
    ],
    checklist: ['آدرس واقعی', 'نوع سکونت', 'قرارداد یا مدرک خوابگاه', 'هماهنگی با پرونده', 'خوانا بودن مدرک'],
    faq: [
      { q: 'آیا هر آدرسی قابل ثبت است؟', a: 'خیر. آدرس باید واقعی، قابل اثبات و هماهنگ با مدارک باشد.' },
      { q: 'اگر خوابگاه باشم چه می‌شود؟', a: 'مدرک خوابگاه و مسیر قابل ارائه باید جداگانه بررسی شود.' },
    ],
    en: {
      summary: 'A notarized address document helps prove the student residence address when required.',
      sections: [
        { heading: 'Simple definition', body: 'A notary makes an address or housing document more formally usable.' },
        { heading: 'For students', body: 'The document type depends on apartment, dormitory or other housing.' },
        { heading: 'Common mistake', body: 'Fake or inconsistent addresses create file risks.' },
      ],
      checklist: ['Real address', 'Housing type', 'Contract or dorm document', 'File alignment', 'Readable document'],
      faq: [
        { q: 'Can any address be used?', a: 'No. It should be real and provable.' },
        { q: 'What about dormitory?', a: 'Dorm documents should be reviewed separately.' },
      ],
    },
  },
  'biometric-photo': {
    title: { fa: 'عکس بیومتریک', en: 'Biometric photo' },
    question: { fa: 'عکس بیومتریک برای اقامت ترکیه چیست؟', en: 'What is a biometric photo?' },
    category: 'مدارک اقامت',
    summary: 'عکس بیومتریک عکس استاندارد هویتی برای پرونده‌های رسمی است و باید جدید، واضح و مطابق معیارهای اداری باشد.',
    sections: [
      { heading: 'تعریف ساده', body: 'عکس بیومتریک عکسی است که برای تشخیص هویت در پرونده‌های رسمی استفاده می‌شود و با عکس معمولی تفاوت دارد.' },
      { heading: 'نکته مهم', body: 'عکس باید جدید، واضح، بدون ادیت نامناسب و قابل استفاده برای پرونده رسمی باشد.' },
      { heading: 'اشتباه رایج', body: 'استفاده از عکس قدیمی، عکس موبایلی یا عکس غیراستاندارد می‌تواند باعث رد یا اصلاح مدرک شود.' },
    ],
    checklist: ['جدید بودن عکس', 'زمینه مناسب', 'وضوح چهره', 'هماهنگی با استاندارد رسمی', 'نگهداری نسخه دیجیتال و چاپی'],
    faq: [
      { q: 'آیا عکس موبایل کافی است؟', a: 'معمولا برای پرونده رسمی باید عکس بیومتریک استاندارد تهیه شود.' },
      { q: 'چند عکس لازم است؟', a: 'تعداد دقیق را باید طبق چک‌لیست همان پرونده بررسی کرد.' },
    ],
    en: {
      summary: 'A biometric photo is an official identity photo used in residence files.',
      sections: [
        { heading: 'Simple definition', body: 'It is a standardized identity photo.' },
        { heading: 'Important point', body: 'It should be recent, clear and official-file ready.' },
        { heading: 'Common mistake', body: 'Old or non-standard photos can create correction needs.' },
      ],
      checklist: ['Recent photo', 'Suitable background', 'Clear face', 'Official standard', 'Digital and printed copies'],
      faq: [
        { q: 'Is a phone photo enough?', a: 'Usually a standard biometric photo is needed.' },
        { q: 'How many photos?', a: 'The exact count should be checked for the file.' },
      ],
    },
  },
  'passport-entry-stamp': {
    title: { fa: 'مهر ورود پاسپورت', en: 'Passport entry stamp' },
    question: { fa: 'مهر ورود پاسپورت چه نقشی در اقامت ترکیه دارد؟', en: 'What is the passport entry stamp?' },
    category: 'مدارک اقامت',
    summary: 'مهر ورود پاسپورت تاریخ ورود دانشجو به ترکیه را نشان می‌دهد و برای محاسبه مهلت قانونی حضور و زمان‌بندی اقامت مهم است.',
    sections: [
      { heading: 'تعریف ساده', body: 'مهر ورود علامت رسمی ورود به کشور است که معمولا در پاسپورت ثبت می‌شود و تاریخ ورود را نشان می‌دهد.' },
      { heading: 'چرا مهم است؟', body: 'برای دانشجوی ایرانی، تاریخ ورود روی محاسبه مهلت ۹۰ روزه و زمان مناسب ثبت اقامت اثر دارد.' },
      { heading: 'اشتباه رایج', body: 'دانشجو تاریخ ورود را تقریبی می‌گوید یا عکس واضح از مهر ندارد. این موضوع در زمان‌بندی پرونده مشکل ایجاد می‌کند.' },
    ],
    checklist: ['صفحه دارای مهر ورود', 'خوانا بودن تاریخ', 'هماهنگی با بلیت یا سابقه سفر', 'محاسبه مهلت قانونی', 'نگهداری عکس واضح'],
    faq: [
      { q: 'اگر مهر ورود خوانا نباشد چه کنم؟', a: 'باید اطلاعات ورود از مسیرهای قابل اثبات و رسمی‌تر بررسی شود.' },
      { q: 'چرا تاریخ ورود مهم است؟', a: 'چون مهلت قانونی حضور و زمان‌بندی درخواست اقامت به آن وابسته است.' },
    ],
    en: {
      summary: 'The passport entry stamp shows the arrival date and matters for lawful-stay timing.',
      sections: [
        { heading: 'Simple definition', body: 'It is the official mark of entering the country.' },
        { heading: 'Why it matters', body: 'It affects 90-day timing and residence planning.' },
        { heading: 'Common mistake', body: 'Students rely on approximate dates or unclear photos.' },
      ],
      checklist: ['Entry stamp page', 'Readable date', 'Travel consistency', 'Lawful stay calculation', 'Clear photo'],
      faq: [
        { q: 'What if it is unreadable?', a: 'Arrival information should be checked through reliable proof.' },
        { q: 'Why is the date important?', a: 'Residence timing depends on it.' },
      ],
    },
  },
  'previous-kimlik': {
    title: { fa: 'کیملیک قبلی', en: 'Previous residence card' },
    question: { fa: 'کیملیک قبلی در پرونده اقامت یعنی چه؟', en: 'What is a previous kimlik?' },
    category: 'مدارک اقامت',
    summary: 'کیملیک قبلی یعنی کارت اقامت یا شناسه اقامتی قبلی فرد در ترکیه. وجود آن می‌تواند نوع پرونده جدید را تغییر دهد.',
    sections: [
      { heading: 'تعریف ساده', body: 'کیملیک قبلی همان کارت اقامتی است که فرد قبلا در ترکیه دریافت کرده است.' },
      { heading: 'چرا مهم است؟', body: 'اگر دانشجو قبلا اقامت داشته باشد، پرونده ممکن است تمدید، تغییر وضعیت یا مسیر متفاوتی نسبت به اولین درخواست باشد.' },
      { heading: 'اشتباه رایج', body: 'نادیده گرفتن اقامت قبلی می‌تواند باعث انتخاب نوع پرونده اشتباه شود.' },
    ],
    checklist: ['عکس کارت قبلی', 'شماره شناسه خارجی', 'تاریخ اعتبار', 'نوع اقامت قبلی', 'وضعیت تمدید یا تغییر'],
    faq: [
      { q: 'اگر کیملیک قبلی من منقضی شده باشد مهم است؟', a: 'بله، سابقه اقامت همچنان برای تشخیص مسیر جدید اهمیت دارد.' },
      { q: 'آیا بدون اعلام کیملیک قبلی می‌شود اقدام کرد؟', a: 'بهتر است سابقه واقعی پرونده پنهان نشود و درست بررسی شود.' },
    ],
    en: {
      summary: 'Previous kimlik means the earlier residence card or foreign identity record in Turkey.',
      sections: [
        { heading: 'Simple definition', body: 'It is the residence card previously issued in Turkey.' },
        { heading: 'Why it matters', body: 'It can change the file type from first application to renewal or status change.' },
        { heading: 'Common mistake', body: 'Ignoring past residence can lead to choosing the wrong file type.' },
      ],
      checklist: ['Card photo', 'Foreign identity number', 'Validity dates', 'Previous residence type', 'Renewal or change status'],
      faq: [
        { q: 'Does an expired card matter?', a: 'Yes, residence history can still matter.' },
        { q: 'Can I ignore it?', a: 'The real history should be reviewed.' },
      ],
    },
  },
  'active-turkish-phone': {
    title: { fa: 'شماره ترک فعال', en: 'Active Turkish phone number' },
    question: { fa: 'شماره ترک فعال برای پرونده اقامت چیست؟', en: 'What is an active Turkish phone number?' },
    category: 'پرونده اقامت',
    summary: 'شماره ترک فعال شماره تلفن ترکیه‌ای است که دانشجو به آن دسترسی دارد و برای پیامک‌ها، پیگیری‌ها و ارتباطات اداری پرونده استفاده می‌شود.',
    sections: [
      { heading: 'تعریف ساده', body: 'شماره ترک فعال یعنی سیم‌کارت یا شماره تلفنی در ترکیه که روشن، در دسترس و متعلق به مسیر ارتباطی دانشجو باشد.' },
      { heading: 'چرا مهم است؟', body: 'بعضی اطلاع‌رسانی‌ها، پیامک‌ها یا پیگیری‌ها ممکن است از طریق شماره ثبت‌شده انجام شود.' },
      { heading: 'اشتباه رایج', body: 'استفاده از شماره فرد دیگر یا شماره‌ای که بعدا از دسترس خارج می‌شود، پیگیری پرونده را سخت می‌کند.' },
    ],
    checklist: ['در دسترس بودن شماره', 'فعال بودن سیم‌کارت', 'دریافت پیامک', 'هماهنگی با اطلاعات پرونده', 'نگهداری شماره تا پایان مسیر'],
    faq: [
      { q: 'آیا می‌شود شماره دوست را داد؟', a: 'بهتر است شماره‌ای ثبت شود که دانشجو واقعا به آن دسترسی پایدار دارد.' },
      { q: 'اگر شماره عوض شود چه می‌شود؟', a: 'ممکن است پیگیری‌ها سخت‌تر شود و باید مسیر اصلاح اطلاعات بررسی شود.' },
    ],
    en: {
      summary: 'An active Turkish phone number is a reachable number used for residence file communication.',
      sections: [
        { heading: 'Simple definition', body: 'It is a working Turkish phone number accessible to the student.' },
        { heading: 'Why it matters', body: 'Notifications and follow-ups may use the registered number.' },
        { heading: 'Common mistake', body: 'Using someone else’s number can make follow-up difficult.' },
      ],
      checklist: ['Reachable number', 'Active SIM', 'SMS access', 'File consistency', 'Keep the number active'],
      faq: [
        { q: 'Can I use a friend’s number?', a: 'A stable number accessible to the student is safer.' },
        { q: 'What if it changes?', a: 'Information correction may need to be reviewed.' },
      ],
    },
  },
  'marital-status': {
    title: { fa: 'وضعیت تأهل', en: 'Marital status' },
    question: { fa: 'وضعیت تأهل در فرم اقامت ترکیه یعنی چه؟', en: 'What is marital status in a residence form?' },
    category: 'مدارک اقامت',
    summary: 'وضعیت تأهل یعنی مجرد یا متأهل بودن فرد و باید در فرم‌های رسمی با اطلاعات هویتی و مدارک شخصی هماهنگ باشد.',
    sections: [
      { heading: 'تعریف ساده', body: 'وضعیت تأهل در فرم اقامت یعنی فرد از نظر رسمی مجرد، متأهل یا در وضعیت خانوادگی دیگری است.' },
      { heading: 'چرا مهم است؟', body: 'فرم اقامت یک فرم رسمی است و اطلاعات هویتی باید دقیق و هماهنگ با مدارک فرد باشد.' },
      { heading: 'اشتباه رایج', body: 'وارد کردن اطلاعات تقریبی یا بی‌توجهی به تفاوت مدارک فارسی، ترکی یا لاتین می‌تواند باعث ناهماهنگی شود.' },
    ],
    checklist: ['مجرد یا متأهل بودن', 'هماهنگی با مدارک هویتی', 'املای لاتین اطلاعات', 'بررسی تغییرات خانوادگی', 'پرهیز از حدس زدن'],
    faq: [
      { q: 'آیا وضعیت تأهل برای دانشجو هم مهم است؟', a: 'بله، چون فرم اقامت اطلاعات هویتی رسمی را ثبت می‌کند.' },
      { q: 'اگر اشتباه وارد شود چه می‌شود؟', a: 'ممکن است نیاز به اصلاح اطلاعات یا توضیح اضافه ایجاد شود.' },
    ],
    en: {
      summary: 'Marital status means whether the person is single, married or in another official family status.',
      sections: [
        { heading: 'Simple definition', body: 'It records the official family status of the applicant.' },
        { heading: 'Why it matters', body: 'Residence forms require accurate identity information.' },
        { heading: 'Common mistake', body: 'Guessing or inconsistent spellings can create problems.' },
      ],
      checklist: ['Single or married', 'Identity document alignment', 'Latin spelling', 'Family status changes', 'Avoid guessing'],
      faq: [
        { q: 'Does it matter for students?', a: 'Yes, it is official identity information.' },
        { q: 'What if entered incorrectly?', a: 'Correction or additional explanation may be needed.' },
      ],
    },
  },
};

Object.assign(EXTRA_TERM_DETAILS, {
  'yimer-157': {
    title: { fa: 'YİMER 157', en: 'YIMER 157' },
    question: { fa: 'YİMER 157 چیست و چه زمانی باید تماس بگیریم؟', en: 'What is YIMER 157?' },
    category: 'قوانین اقامت',
    summary: 'YİMER 157 مرکز ارتباط اتباع خارجی و مسیر رسمی پرسش درباره اقامت، ویزا، حمایت بین‌المللی و وضعیت‌های مرتبط با اداره مهاجرت ترکیه است.',
    sections: [
      { heading: 'تعریف ساده', body: 'YİMER 157 یعنی مرکز ارتباطی که اتباع خارجی می‌توانند برای اطلاعات رسمی و راهنمایی درباره امور مهاجرتی ترکیه از آن استفاده کنند.' },
      { heading: 'چه زمانی مهم است؟', body: 'وقتی زمان قانونی تمام شده، پرونده مبهم است، کسی وعده راه غیررسمی می‌دهد یا دانشجو می‌خواهد آخرین قانون را بداند، YİMER 157 یکی از مسیرهای امن‌تر برای شروع پرسش است.' },
      { heading: 'اشتباه رایج', body: 'اشتباه این است که دانشجو به جای منبع رسمی، به پیام‌های شبکه اجتماعی یا فردی که ادعای آشنا در اداره مهاجرت دارد اعتماد کند.' },
    ],
    checklist: ['شماره پرونده در صورت وجود', 'تاریخ ورود یا پایان اقامت', 'نوع درخواست', 'شهر محل پرونده', 'یادداشت پاسخ دریافتی'],
    faq: [
      { q: 'آیا ۱۵۷ جای مشاور خصوصی است؟', a: '۱۵۷ منبع رسمی اطلاع‌رسانی است. مشاور می‌تواند در نظم پرونده کمک کند، اما قانون باید از منبع رسمی بررسی شود.' },
      { q: 'آیا برای هر پرونده جواب قطعی می‌دهد؟', a: 'برای شرایط خاص ممکن است مراجعه به دفتر اداره مهاجرت یا بررسی مدارک لازم شود.' },
    ],
    en: {
      summary: 'YIMER 157 is an official foreigners communication center for migration-related information in Turkey.',
      sections: [
        { heading: 'Simple definition', body: 'It is an official communication channel for foreigners.' },
        { heading: 'When it matters', body: 'Use it for unclear legal timing, file questions or suspicious promises.' },
        { heading: 'Common mistake', body: 'Trusting social media or alleged inside contacts instead of official sources.' },
      ],
      checklist: ['File number if any', 'Arrival or expiry date', 'Application type', 'Province', 'Record the answer'],
      faq: [
        { q: 'Is it a private consultant?', a: 'No. It is an official information channel.' },
        { q: 'Does it solve every case?', a: 'Some cases need office review.' },
      ],
    },
  },
  'family-residence-permit': {
    title: { fa: 'اقامت خانوادگی ترکیه', en: 'Family residence permit' },
    question: { fa: 'اقامت خانوادگی ترکیه برای خانواده دانشجو یعنی چه؟', en: 'What is family residence permit?' },
    category: 'انواع اقامت',
    summary: 'اقامت خانوادگی برای همه بستگان دانشجو نیست؛ طبق توضیح رسمی، دانشجو فقط می‌تواند برای همسر و فرزندان در پرونده اقامت خانوادگی نقش حامی داشته باشد.',
    sections: [
      { heading: 'تعریف ساده', body: 'اقامت خانوادگی یکی از انواع اقامت ترکیه است که برای اعضای خانواده واجد شرایط و با وجود حامی قابل بررسی است.' },
      { heading: 'برای دانشجو', body: 'در مورد دانشجو، منبع رسمی می‌گوید اقامت دانشجویی فقط امکان حمایت از همسر و فرزندان را در درخواست خانوادگی می‌دهد و برای سایر بستگان حق ایجاد نمی‌کند.' },
      { heading: 'اشتباه رایج', body: 'اشتباه رایج این است که والدین، خواهر، برادر یا بستگان درجه دو را خودکار زیر پرونده دانشجو بدانیم.' },
    ],
    checklist: ['همسر یا فرزند بودن', 'مدرک رسمی نسبت خانوادگی', 'بیمه و آدرس', 'توان مالی/شرایط حامی', 'بررسی رسمی با اداره مهاجرت'],
    faq: [
      { q: 'آیا والدین دانشجو زیر اقامت خانوادگی دانشجو می‌آیند؟', a: 'به صورت خودکار نه. طبق متن رسمی دانشجو برای همسر و فرزندان نقش حامی دارد و سایر بستگان باید جداگانه بررسی شوند.' },
      { q: 'آیا نتیجه پرونده خانواده صددرصد است؟', a: 'هیچ نتیجه‌ای را نباید تضمین کرد؛ اما نسبت نزدیک و مدارک رسمی کامل پرونده را قابل دفاع‌تر می‌کند.' },
    ],
    en: {
      summary: 'Family residence is not automatic for all relatives of a student.',
      sections: [
        { heading: 'Simple definition', body: 'It is a residence type for eligible family members with a supporter.' },
        { heading: 'For students', body: 'Official guidance limits student supporter status to spouse and children.' },
        { heading: 'Common mistake', body: 'Assuming parents or siblings automatically fit the same route.' },
      ],
      checklist: ['Spouse or child', 'Official relationship proof', 'Insurance and address', 'Supporter conditions', 'Official review'],
      faq: [
        { q: 'Are parents automatically included?', a: 'No. They should be reviewed separately.' },
        { q: 'Is approval guaranteed?', a: 'No file result should be guaranteed.' },
      ],
    },
  },
  'residence-supporter': {
    title: { fa: 'حامی یا اسپانسر اقامت', en: 'Residence supporter' },
    question: { fa: 'حامی در پرونده اقامت خانوادگی یعنی چه؟', en: 'What is a residence supporter?' },
    category: 'پرونده اقامت',
    summary: 'حامی فردی است که طبق قانون و شرایط رسمی می‌تواند مبنای درخواست اقامت خانوادگی بعضی اعضای خانواده باشد.',
    sections: [
      { heading: 'تعریف ساده', body: 'حامی یا supporter کسی است که از نظر پرونده‌ای، نسبت و شرایط لازم را برای حمایت از درخواست اقامت خانوادگی دارد.' },
      { heading: 'دانشجو به عنوان حامی', body: 'دانشجو طبق منبع رسمی فقط برای همسر و فرزندان می‌تواند در پرونده خانوادگی نقش حامی داشته باشد.' },
      { heading: 'اشتباه رایج', body: 'تصور اینکه دانشجو می‌تواند برای هر عضو خانواده یا بستگان درجه دو حامی اقامت خانوادگی باشد، دقیق نیست.' },
    ],
    checklist: ['نوع نسبت', 'مدرک رسمی نسبت', 'آدرس', 'بیمه', 'شرایط مالی/پرونده‌ای'],
    faq: [
      { q: 'حامی یعنی ضامن قطعی قبولی؟', a: 'خیر. حامی بودن فقط یکی از شروط پرونده است و نتیجه باید توسط اداره مهاجرت بررسی شود.' },
      { q: 'دانشجو برای چه کسانی حامی است؟', a: 'طبق توضیح رسمی، برای همسر و فرزندان در درخواست اقامت خانوادگی.' },
    ],
    en: {
      summary: 'A supporter is the person whose status supports an eligible family residence application.',
      sections: [
        { heading: 'Simple definition', body: 'The supporter is the legal basis for a family residence request.' },
        { heading: 'Student as supporter', body: 'Official guidance limits this to spouse and children.' },
        { heading: 'Common mistake', body: 'Assuming all relatives can be supported this way.' },
      ],
      checklist: ['Relationship type', 'Relationship proof', 'Address', 'Insurance', 'File conditions'],
      faq: [
        { q: 'Does supporter mean approval?', a: 'No.' },
        { q: 'Who can a student support?', a: 'Spouse and children under official conditions.' },
      ],
    },
  },
  'companion-residence': {
    title: { fa: 'اقامت همراه', en: 'Companion residence' },
    question: { fa: 'اقامت همراه در ترکیه یعنی چه و چرا باید با دقت استفاده شود؟', en: 'What does companion residence mean?' },
    category: 'انواع اقامت',
    summary: 'اقامت همراه بیشتر یک اصطلاح گفتاری است؛ در سیستم رسمی باید برای هر فرد جداگانه و با نوع اقامت درست درخواست ثبت شود.',
    sections: [
      { heading: 'تعریف ساده', body: 'وقتی خانواده همراه دانشجو به ترکیه می‌آیند، در فارسی گاهی به آن اقامت همراه می‌گویند.' },
      { heading: 'نکته رسمی', body: 'این اصطلاح نباید جای نوع اقامت رسمی را بگیرد. هر فرد باید پرونده و دلیل حضور خودش را داشته باشد.' },
      { heading: 'اشتباه رایج', body: 'فکر کنیم چون فرد همراه دانشجوست، خودکار اقامت می‌گیرد. این برداشت خطرناک است.' },
    ],
    checklist: ['نسبت فرد با دانشجو', 'هدف حضور در ترکیه', 'نوع اقامت مناسب', 'مدارک نسبت', 'بررسی با اداره مهاجرت'],
    faq: [
      { q: 'آیا همراه بودن کافی است؟', a: 'خیر. باید نوع اقامت رسمی و مدارک فرد مشخص باشد.' },
      { q: 'آیا همراه همان اقامت خانوادگی است؟', a: 'نه همیشه. اقامت خانوادگی شرایط مشخص خود را دارد.' },
    ],
    en: {
      summary: 'Companion residence is a conversational term; official applications must use the correct residence type for each person.',
      sections: [
        { heading: 'Simple definition', body: 'It refers informally to family accompanying the student.' },
        { heading: 'Official point', body: 'Each person needs the correct official residence route.' },
        { heading: 'Common mistake', body: 'Assuming accompaniment alone is enough.' },
      ],
      checklist: ['Relationship', 'Purpose of stay', 'Residence type', 'Relationship proof', 'Official review'],
      faq: [
        { q: 'Is accompanying enough?', a: 'No.' },
        { q: 'Is it always family residence?', a: 'Not always.' },
      ],
    },
  },
  'family-relationship-proof': {
    title: { fa: 'مدرک نسبت خانوادگی', en: 'Family relationship proof' },
    question: { fa: 'مدرک نسبت خانوادگی و تأیید سفارت در پرونده اقامت چیست؟', en: 'What is family relationship proof?' },
    category: 'مدارک اقامت',
    summary: 'برای پرونده خانواده، نسبت خانوادگی باید با سند رسمی، ترجمه و در صورت نیاز تأیید سفارت، کنسولگری یا مسیر قانونی کشور مربوطه قابل اثبات باشد.',
    sections: [
      { heading: 'تعریف ساده', body: 'مدرک نسبت خانوادگی یعنی سندی که نشان دهد فرد واقعا همسر، فرزند یا عضو خانواده واجد شرایط است.' },
      { heading: 'مسیر رسمی', body: 'سند ازدواج، گواهی تولد یا مدارک مشابه ممکن است به ترجمه، نوتر، آپوستیل یا تأیید سفارت/کنسولگری نیاز داشته باشند.' },
      { heading: 'اشتباه رایج', body: 'فکر کنیم توضیح شفاهی یا عکس ساده از سند برای اداره مهاجرت کافی است.' },
    ],
    checklist: ['سند رسمی', 'ترجمه معتبر', 'نوتر یا آپوستیل در صورت نیاز', 'تأیید سفارت/کنسولگری در صورت نیاز', 'هماهنگی نام‌ها و تاریخ‌ها'],
    faq: [
      { q: 'آیا ترجمه ساده کافی است؟', a: 'بسته به پرونده ممکن است کافی نباشد و تأییدهای رسمی لازم شود.' },
      { q: 'چرا نام‌ها مهم‌اند؟', a: 'هر ناهماهنگی در نام، تاریخ تولد یا نسبت می‌تواند پرونده را سخت کند.' },
    ],
    en: {
      summary: 'Family relationship proof should be official, translated and certified when required.',
      sections: [
        { heading: 'Simple definition', body: 'It proves the family relationship.' },
        { heading: 'Official path', body: 'Marriage or birth records may need translation, notary, apostille or consular confirmation.' },
        { heading: 'Common mistake', body: 'Assuming a simple photo or verbal explanation is enough.' },
      ],
      checklist: ['Official document', 'Certified translation', 'Notary or apostille', 'Consular confirmation if needed', 'Name/date consistency'],
      faq: [
        { q: 'Is a simple translation enough?', a: 'Not always.' },
        { q: 'Why are names important?', a: 'Inconsistency can complicate the file.' },
      ],
    },
  },
  'migration-office': {
    title: { fa: 'دفتر اداره مهاجرت', en: 'Migration office' },
    question: { fa: 'دفتر اداره مهاجرت چه زمانی باید مراجعه شود؟', en: 'When should a migration office be visited?' },
    category: 'قوانین اقامت',
    summary: 'دفتر اداره مهاجرت مسیر رسمی پیگیری حضوری پرونده و پرسش درباره وضعیت‌های خاص است.',
    sections: [
      { heading: 'تعریف ساده', body: 'دفتر اداره مهاجرت شعبه رسمی رسیدگی به پرونده‌های اقامت در شهر یا استان مربوطه است.' },
      { heading: 'چه زمانی مهم است؟', body: 'وقتی پرونده از حالت ساده خارج شده، زمان قانونی تمام شده، مدارک مبهم است یا پیام رسمی دریافت شده، مراجعه یا پرسش رسمی اهمیت پیدا می‌کند.' },
      { heading: 'اشتباه رایج', body: 'به جای مسیر رسمی، دنبال فردی بگردیم که ادعا می‌کند در همان دفتر آشنا دارد.' },
    ],
    checklist: ['شماره پرونده', 'پاسپورت', 'مدارک قبلی', 'پیام یا اطلاعیه دریافتی', 'پرسش‌های دقیق قبل از مراجعه'],
    faq: [
      { q: 'آیا هر مسئله‌ای نیاز به مراجعه حضوری دارد؟', a: 'نه. بعضی سوال‌ها از YİMER 157 یا سامانه رسمی قابل بررسی است.' },
      { q: 'اگر پرونده مشکل‌دار شد چه کنم؟', a: 'به جای واسطه، مسیر رسمی اداره مهاجرت یا ۱۵۷ را بررسی کنید.' },
    ],
    en: {
      summary: 'A migration office is the official in-person route for file-specific residence issues.',
      sections: [
        { heading: 'Simple definition', body: 'It is the official provincial office for residence files.' },
        { heading: 'When it matters', body: 'Special, unclear or problematic cases may need official office guidance.' },
        { heading: 'Common mistake', body: 'Looking for alleged inside contacts instead of official channels.' },
      ],
      checklist: ['File number', 'Passport', 'Previous documents', 'Official message', 'Prepared questions'],
      faq: [
        { q: 'Does every issue need a visit?', a: 'No.' },
        { q: 'What if the file is problematic?', a: 'Use official channels.' },
      ],
    },
  },
  'unsafe-intermediary': {
    title: { fa: 'واسطه غیرمطمئن اقامت', en: 'Unsafe residence intermediary' },
    question: { fa: 'واسطه غیرمطمئن در پرونده اقامت چه خطری دارد؟', en: 'What is an unsafe residence intermediary?' },
    category: 'امنیت اطلاعات',
    summary: 'واسطه غیرمطمئن با وعده آشنا در اداره مهاجرت، حل قطعی پرونده یا دور زدن قانون می‌تواند باعث ضرر مالی، افشای مدارک و ریسک اقامت شود.',
    sections: [
      { heading: 'تعریف ساده', body: 'واسطه غیرمطمئن فرد یا کانالی است که بدون قرارداد و مسئولیت قابل پیگیری، وعده حل قطعی پرونده می‌دهد.' },
      { heading: 'نشانه خطر', body: 'ادعای آشنا در اداره مهاجرت، درخواست پول نقد بی‌رسید، وعده حل بعد از پایان مهلت قانونی و درخواست مدارک حساس در پیام‌رسان‌ها نشانه خطر است.' },
      { heading: 'رفتار درست', body: 'قانون را از اداره مهاجرت، YİMER 157 یا شرکت قابل پیگیری بپرسید و مدارک را بی‌احتیاط ارسال نکنید.' },
    ],
    checklist: ['قرارداد یا رسید', 'ثبت و نشانی قابل بررسی', 'عدم وعده قطعی', 'حفظ مدارک هویتی', 'پرسش از منبع رسمی'],
    faq: [
      { q: 'اگر کسی گفت در اداره مهاجرت آشنا دارد چه کنم؟', a: 'به این وعده تکیه نکنید و وضعیت را از مسیر رسمی بررسی کنید.' },
      { q: 'خطر اصلی چیست؟', a: 'از دست رفتن زمان قانونی، پول، اطلاعات خصوصی و امنیت پرونده.' },
    ],
    en: {
      summary: 'Unsafe intermediaries can risk money, documents and legal timing through untraceable promises.',
      sections: [
        { heading: 'Simple definition', body: 'An untraceable person promising guaranteed file solutions.' },
        { heading: 'Danger signs', body: 'Inside contacts, cash without receipt, deadline bypass promises and document requests over unsafe channels.' },
        { heading: 'Right behavior', body: 'Check official sources and use traceable providers.' },
      ],
      checklist: ['Contract or receipt', 'Traceable registration', 'No guaranteed promises', 'Protect ID documents', 'Ask official sources'],
      faq: [
        { q: 'What if they claim inside contacts?', a: 'Do not rely on it.' },
        { q: 'What is the risk?', a: 'Money, timing, data and file security.' },
      ],
    },
  },
  'registered-consultancy': {
    title: { fa: 'شرکت مشاوره ثبت‌شده', en: 'Registered consultancy' },
    question: { fa: 'شرکت مشاوره ثبت‌شده برای امور اقامت یعنی چه؟', en: 'What is a registered consultancy?' },
    category: 'امنیت اطلاعات',
    summary: 'شرکت مشاوره قابل پیگیری باید ثبت، نشانی، قرارداد یا رسید، شرح خدمات و مسئولیت روشن داشته باشد؛ اما قانون اقامت همچنان باید از منبع رسمی بررسی شود.',
    sections: [
      { heading: 'تعریف ساده', body: 'شرکت مشاوره ثبت‌شده یا danışmanlık یعنی مجموعه‌ای که هویت تجاری و خدماتش قابل بررسی و پیگیری است.' },
      { heading: 'چه چیزی را چک کنیم؟', body: 'ثبت شرکت، نشانی، قرارداد، رسید، محدوده خدمات، سیاست نگهداری مدارک و مسئول پاسخ‌گویی باید روشن باشد.' },
      { heading: 'مرز مهم', body: 'مشاور می‌تواند نظم و آماده‌سازی پرونده را بهتر کند، اما جای اداره مهاجرت را نمی‌گیرد و نباید وعده نتیجه قطعی بدهد.' },
    ],
    checklist: ['ثبت شرکت', 'نشانی و راه ارتباطی', 'قرارداد یا رسید', 'شرح خدمات', 'حریم خصوصی مدارک'],
    faq: [
      { q: 'آیا مشاور می‌تواند قانون را تغییر دهد؟', a: 'خیر. قانون و تصمیم پرونده در اختیار مراجع رسمی است.' },
      { q: 'آیا هر مشاوری قابل اعتماد است؟', a: 'نه. باید قابل پیگیری، شفاف و بدون وعده غیرواقعی باشد.' },
    ],
    en: {
      summary: 'A registered consultancy should be traceable, contracted and clear about services and data handling.',
      sections: [
        { heading: 'Simple definition', body: 'A traceable service provider with verifiable business identity.' },
        { heading: 'What to check', body: 'Registration, address, contract, receipt, service scope and data handling.' },
        { heading: 'Important boundary', body: 'Consultants do not replace official migration rules.' },
      ],
      checklist: ['Company registration', 'Address and contact', 'Contract or receipt', 'Service scope', 'Document privacy'],
      faq: [
        { q: 'Can a consultant change the law?', a: 'No.' },
        { q: 'Is every consultant safe?', a: 'No. It should be traceable and transparent.' },
      ],
    },
  },
});

Object.assign(EXTRA_TERM_DETAILS, {
  'turkey-90-180-rule': {
    title: { fa: 'قانون ۹۰/۱۸۰ ترکیه', en: 'Turkey 90/180 rule' },
    question: { fa: 'قانون ۹۰/۱۸۰ ترکیه چیست و چرا برای دانشجوی ایرانی مهم است؟', en: 'What is Turkey 90/180 rule?' },
    category: 'قوانین اقامت',
    summary: 'قانون ۹۰/۱۸۰ یعنی حضور کوتاه‌مدت بدون اقامت معتبر در ترکیه معمولاً نمی‌تواند از ۹۰ روز در هر بازه ۱۸۰ روزه بیشتر شود. این قانون برای دانشجوهایی که هنوز اقامت دانشجویی نگرفته‌اند بسیار مهم است.',
    sections: [
      { heading: 'تعریف ساده', body: 'هر روزی که می‌خواهید وارد ترکیه شوید یا وضعیت حضور خود را بررسی کنید، باید ۱۸۰ روز گذشته را نگاه کنید و ببینید چند روز داخل ترکیه بوده‌اید.' },
      { heading: 'چرا برای دانشجو مهم است؟', body: 'دانشجو ممکن است برای ثبت‌نام، آماده‌سازی مدارک یا اقامت چند بار وارد و خارج شود. اگر تعداد روزها درست حساب نشود، ورود مجدد یا شروع پرونده اقامت می‌تواند پرریسک شود.' },
      { heading: 'اشتباه رایج', body: 'تصور اینکه با خروج از ترکیه، ۹۰ روز دوباره از صفر شروع می‌شود. این برداشت درست نیست.' },
    ],
    checklist: ['تاریخ ورود', 'تاریخ خروج', 'روزهای حضور در ۱۸۰ روز گذشته', 'وضعیت اقامت معتبر', 'هدف سفر یا تحصیل'],
    faq: [
      { q: 'آیا این قانون فقط برای ایرانی‌هاست؟', a: 'خیر. اصل ۹۰ روز در ۱۸۰ روز برای بسیاری از مسیرهای ورود کوتاه‌مدت مطرح است، اما شرایط هر ملیت باید از منبع رسمی بررسی شود.' },
      { q: 'آیا داشتن پذیرش دانشگاه این قانون را حذف می‌کند؟', a: 'خیر. پذیرش دانشگاه جای اقامت معتبر یا مجوز قانونی حضور بلندمدت را نمی‌گیرد.' },
    ],
    en: {
      summary: 'The 90/180 rule limits short stay without residence to 90 days in any rolling 180-day period.',
      sections: [
        { heading: 'Simple definition', body: 'Look back 180 days from the relevant date and count the stay days.' },
        { heading: 'Why it matters', body: 'Students may enter and exit before residence is ready, so timing matters.' },
        { heading: 'Common mistake', body: 'Leaving Turkey does not reset the count.' },
      ],
      checklist: ['Entry date', 'Exit date', 'Stay days', 'Residence status', 'Purpose of stay'],
      faq: [
        { q: 'Is it only for Iranians?', a: 'No. Nationality-specific rules should be checked officially.' },
        { q: 'Does admission remove the rule?', a: 'No.' },
      ],
    },
  },
  'rolling-180-day-window': {
    title: { fa: 'پنجره ۱۸۰ روزه متحرک', en: 'Rolling 180-day window' },
    question: { fa: 'پنجره ۱۸۰ روزه متحرک در محاسبه اقامت ترکیه یعنی چه؟', en: 'What is a rolling 180-day window?' },
    category: 'قوانین اقامت',
    summary: 'پنجره ۱۸۰ روزه متحرک یعنی بازه محاسبه همیشه نسبت به همان روز ورود یا بررسی عقب می‌رود و ۱۸۰ روز گذشته را می‌سنجد؛ نه یک بازه ثابت شش‌ماهه.',
    sections: [
      { heading: 'تعریف ساده', body: 'اگر امروز می‌خواهید وارد ترکیه شوید، باید از امروز ۱۸۰ روز به عقب برگردید و روزهای حضور داخل ترکیه را حساب کنید.' },
      { heading: 'چرا متحرک است؟', body: 'چون با گذشت هر روز، یک روز جدید وارد محاسبه می‌شود و یک روز قدیمی ممکن است از بازه خارج شود.' },
      { heading: 'اشتباه رایج', body: 'اشتباه رایج این است که دانشجو بازه را مثل اول ژانویه تا آخر ژوئن حساب کند. در عمل محاسبه به روز بررسی وابسته است.' },
    ],
    checklist: ['روز بررسی', '۱۸۰ روز گذشته', 'روزهای ورود و خروج', 'روزهای آزادشده', 'برنامه ورود بعدی'],
    faq: [
      { q: 'آیا این بازه از اول سال شروع می‌شود؟', a: 'خیر. از همان روزی که وضعیت بررسی می‌شود ۱۸۰ روز به عقب حساب می‌شود.' },
      { q: 'آیا با گذشت زمان ظرفیت جدید آزاد می‌شود؟', a: 'بله، وقتی روزهای قدیمی از پنجره ۱۸۰ روزه خارج شوند، ظرفیت به همان میزان آزاد می‌شود.' },
    ],
    en: {
      summary: 'A rolling 180-day window counts backwards from the relevant date.',
      sections: [
        { heading: 'Simple definition', body: 'Look back 180 days from the check date.' },
        { heading: 'Why rolling?', body: 'The window moves every day.' },
        { heading: 'Common mistake', body: 'Treating it like a fixed calendar half-year.' },
      ],
      checklist: ['Check date', 'Past 180 days', 'Entry and exit days', 'Released days', 'Next entry plan'],
      faq: [
        { q: 'Does it start on January 1?', a: 'No.' },
        { q: 'Can capacity return over time?', a: 'Yes.' },
      ],
    },
  },
  'turkey-re-entry': {
    title: { fa: 'ورود مجدد به ترکیه', en: 'Turkey re-entry' },
    question: { fa: 'ورود مجدد به ترکیه بعد از خروج برای دانشجو یعنی چه؟', en: 'What is Turkey re-entry?' },
    category: 'قوانین اقامت',
    summary: 'ورود مجدد یعنی بعد از خروج از ترکیه دوباره بخواهید وارد کشور شوید. در این مرحله روزهای قبلی حضور، مهرهای پاسپورت، هدف سفر و ظرفیت باقی‌مانده اهمیت پیدا می‌کند.',
    sections: [
      { heading: 'تعریف ساده', body: 'وقتی دانشجو بعد از یک خروج کوتاه یا بلند دوباره به مرز ترکیه می‌رسد، ورود او مثل یک بررسی جدید انجام می‌شود.' },
      { heading: 'چه چیزی بررسی می‌شود؟', body: 'تعداد روزهای حضور در ۱۸۰ روز گذشته، اعتبار پاسپورت، هدف سفر، مدارک و وجود یا نبود مانع ورود می‌تواند مهم باشد.' },
      { heading: 'اشتباه رایج', body: 'تصور اینکه هر ورود جدید یعنی یک مهلت ۹۰ روزه جدید. این برداشت برای قانون ۹۰/۱۸۰ اشتباه است.' },
    ],
    checklist: ['پاسپورت', 'مهر ورود و خروج', 'روزهای باقی‌مانده', 'مدارک هدف سفر', 'وضعیت اقامت یا درخواست اقامت'],
    faq: [
      { q: 'آیا ورود مجدد همیشه بدون مشکل است؟', a: 'نه. اگر ظرفیت قانونی تمام شده باشد یا مدارک و هدف سفر مبهم باشد، ریسک ایجاد می‌شود.' },
      { q: 'آیا داشتن بلیت برگشت کافی است؟', a: 'تنها کافی نیست؛ روزهای مجاز و شرایط ورود هم باید درست باشد.' },
    ],
    en: {
      summary: 'Re-entry means entering Turkey again after a previous exit.',
      sections: [
        { heading: 'Simple definition', body: 'A new border check after leaving Turkey.' },
        { heading: 'What matters', body: 'Stay days, passport, purpose and documents.' },
        { heading: 'Common mistake', body: 'Assuming every new entry creates a new 90 days.' },
      ],
      checklist: ['Passport', 'Stamps', 'Remaining days', 'Purpose documents', 'Residence status'],
      faq: [
        { q: 'Is re-entry always safe?', a: 'No.' },
        { q: 'Is a return ticket enough?', a: 'Not by itself.' },
      ],
    },
  },
  'remaining-visa-free-days': {
    title: { fa: 'ظرفیت باقی‌مانده اقامت بدون ویزا', en: 'Remaining visa-free days' },
    question: { fa: 'ظرفیت باقی‌مانده اقامت بدون ویزا در ترکیه یعنی چه؟', en: 'What are remaining visa-free days?' },
    category: 'قوانین اقامت',
    summary: 'ظرفیت باقی‌مانده یعنی از سقف حضور کوتاه‌مدت مجاز، بعد از کم کردن روزهای استفاده‌شده در ۱۸۰ روز گذشته، چند روز دیگر برای ماندن بدون اقامت معتبر باقی مانده است.',
    sections: [
      { heading: 'تعریف ساده', body: 'اگر سقف شما ۹۰ روز باشد و در ۱۸۰ روز گذشته ۸۰ روز داخل ترکیه بوده باشید، ظرفیت تقریبی باقی‌مانده شما ۱۰ روز است.' },
      { heading: 'چرا تقریبی می‌گوییم؟', body: 'چون محاسبه دقیق به تاریخ‌های ورود و خروج و روز بررسی وابسته است. گاهی یک یا چند روز با تغییر تاریخ ورود بعدی آزاد می‌شود.' },
      { heading: 'اشتباه رایج', body: 'حساب کردن سه ماه تقویمی به جای روزهای واقعی حضور.' },
    ],
    checklist: ['تعداد روز استفاده‌شده', 'تاریخ ورود بعدی', 'روزهای خارج‌شده از پنجره', 'مهرهای پاسپورت', 'برنامه اقامت'],
    faq: [
      { q: 'آیا ظرفیت باقی‌مانده همیشه دقیقاً همان عدد ذهنی من است؟', a: 'نه. باید با تاریخ‌های واقعی ورود و خروج حساب شود.' },
      { q: 'اگر روزها تمام شود چه باید کرد؟', a: 'برای ماندن بیشتر باید مسیر اقامت معتبر یا راهکار رسمی بررسی شود.' },
    ],
    en: {
      summary: 'Remaining visa-free days are the unused days left after counting previous stay in the rolling window.',
      sections: [
        { heading: 'Simple definition', body: '90 minus used days inside the relevant window.' },
        { heading: 'Why approximate?', body: 'Exact count depends on real entry and exit dates.' },
        { heading: 'Common mistake', body: 'Counting calendar months instead of stay days.' },
      ],
      checklist: ['Used days', 'Next entry date', 'Released days', 'Passport stamps', 'Residence plan'],
      faq: [
        { q: 'Is the count always intuitive?', a: 'No.' },
        { q: 'What if days are used up?', a: 'A valid residence path or official option is needed.' },
      ],
    },
  },
  'conditional-entry-10-days': {
    title: { fa: 'ورود مشروط ۱۰ روزه', en: 'Conditional 10-day entry' },
    question: { fa: 'ورود مشروط ۱۰ روزه ترکیه چیست و چرا نباید روی آن حساب قطعی کرد؟', en: 'What is conditional 10-day entry?' },
    category: 'قوانین اقامت',
    summary: 'ورود مشروط ۱۰ روزه حالتی است که ممکن است فرد در مرز تعهد بدهد ظرف ۱۰ روز برای اقامت اقدام کند. این حالت قطعی، قابل تضمین یا جایگزین برنامه‌ریزی درست اقامت نیست.',
    sections: [
      { heading: 'تعریف ساده', body: 'یعنی فردی که زمان کوتاه‌مدت او تکمیل شده، در برخی شرایط ممکن است با شرط اقدام سریع برای اقامت اجازه ورود بگیرد.' },
      { heading: 'چرا پرریسک است؟', body: 'چون تصمیم نهایی می‌تواند به پرونده، مرز ورودی، مدارک، سابقه ورود و خروج و نظر مقام مرزی وابسته باشد.' },
      { heading: 'رفتار درست', body: 'دانشجو نباید اقامت خود را به امید ورود مشروط عقب بیندازد. بهتر است قبل از پایان مهلت قانونی، پرونده اقامت آماده شود.' },
    ],
    checklist: ['بررسی منبع رسمی', 'مدارک کامل', 'هدف روشن سفر', 'برنامه اقامت', 'پرهیز از وعده قطعی'],
    faq: [
      { q: 'آیا ورود مشروط حق قطعی است؟', a: 'خیر. نباید به‌عنوان راه‌حل تضمینی معرفی شود.' },
      { q: 'آیا برای دانشجو پیشنهاد می‌شود؟', a: 'به‌عنوان برنامه اصلی خیر؛ دانشجو باید قبل از پایان مهلت قانونی اقدام کند.' },
    ],
    en: {
      summary: 'Conditional 10-day entry may require a commitment to apply for residence quickly, but it is not guaranteed.',
      sections: [
        { heading: 'Simple definition', body: 'A possible conditional border entry in certain cases.' },
        { heading: 'Why risky?', body: 'It depends on case details and border decision.' },
        { heading: 'Right behavior', body: 'Do not delay student residence planning.' },
      ],
      checklist: ['Official source', 'Complete documents', 'Clear purpose', 'Residence plan', 'No guarantees'],
      faq: [
        { q: 'Is it a right?', a: 'No.' },
        { q: 'Should students rely on it?', a: 'No.' },
      ],
    },
  },
  'lawful-stay-period': {
    title: { fa: 'مهلت قانونی حضور در ترکیه', en: 'Lawful stay period in Turkey' },
    question: { fa: 'مهلت قانونی حضور در ترکیه برای دانشجو یعنی چه؟', en: 'What is lawful stay period in Turkey?' },
    category: 'قوانین اقامت',
    summary: 'مهلت قانونی حضور یعنی بازه‌ای که فرد می‌تواند بدون نقض قانون در ترکیه بماند؛ این بازه ممکن است بر اساس معافیت ویزا، ویزا یا کارت اقامت معتبر باشد.',
    sections: [
      { heading: 'تعریف ساده', body: 'برای دانشجو، مهلت قانونی حضور یعنی تا چه تاریخی می‌تواند در ترکیه بماند و چه زمانی باید برای اقامت یا تمدید اقدام کند.' },
      { heading: 'چرا مهم است؟', body: 'اگر این مهلت اشتباه حساب شود، ثبت‌نام دانشگاه، راندوو اقامت یا ورود مجدد ممکن است دچار مشکل شود.' },
      { heading: 'اشتباه رایج', body: 'فکر کردن به اینکه چون هدف تحصیل است، زمان قانونی حضور خودبه‌خود بیشتر می‌شود. هدف تحصیل باید با پرونده اقامت معتبر پشتیبانی شود.' },
    ],
    checklist: ['نوع ورود', 'تاریخ پایان مهلت', 'وضعیت اقامت', 'مدارک دانشگاهی', 'زمان اقدام'],
    faq: [
      { q: 'آیا مهلت قانونی همان تاریخ شروع کلاس است؟', a: 'خیر. تاریخ کلاس و مهلت قانونی حضور دو موضوع جدا هستند.' },
      { q: 'اگر مهلت نزدیک تمام شدن است چه کنم؟', a: 'باید فوراً وضعیت را با مسیر رسمی و مدارک پرونده بررسی کنید.' },
    ],
    en: {
      summary: 'Lawful stay period is the time a person may remain in Turkey legally based on visa exemption, visa or valid residence.',
      sections: [
        { heading: 'Simple definition', body: 'How long the student can legally stay.' },
        { heading: 'Why it matters', body: 'Wrong timing can affect residence and re-entry.' },
        { heading: 'Common mistake', body: 'Assuming study purpose automatically extends stay.' },
      ],
      checklist: ['Entry type', 'Expiry date', 'Residence status', 'University documents', 'Action timing'],
      faq: [
        { q: 'Is it the class start date?', a: 'No.' },
        { q: 'What if it is close to expiry?', a: 'Review the official route immediately.' },
      ],
    },
  },
});

Object.assign(EXTRA_TERM_DETAILS, {
  'address-registration': {
    title: { fa: 'ثبت آدرس', en: 'Address registration' },
    question: { fa: 'ثبت آدرس در ترکیه برای دانشجو یعنی چه؟', en: 'What is address registration in Turkey for students?' },
    category: 'آدرس و سکونت',
    summary: 'ثبت آدرس یعنی محل سکونت دانشجو در سیستم رسمی ترکیه ثبت شود. برای دانشجو این موضوع هم به پرونده اقامت وصل می‌شود و هم بعداً در امور بانکی، گواهی‌نامه، خدمات دولتی و تمدیدهای اداری کاربرد پیدا می‌کند.',
    sections: [
      { heading: 'تعریف ساده', body: 'ثبت آدرس یعنی دولت ترکیه بداند دانشجو در کدام آدرس واقعی زندگی می‌کند و این آدرس با مدارک سکونت او هماهنگ باشد.' },
      { heading: 'در مسیر اقامت', body: 'قبل از گرفتن کارت اقامت، دانشجو باید مدرک آدرس قابل ارائه داشته باشد. بعد از تایید اقامت نیز باید ثبت رسمی آدرس را در مسیر نفوس پیگیری کند.' },
      { heading: 'اشتباه رایج', body: 'بعضی دانشجوها فکر می‌کنند نوشتن یک آدرس در فرم کافی است. در عمل، آدرس باید قابل اثبات باشد و با خوابگاه یا قرارداد اجاره هماهنگ باشد.' },
    ],
    checklist: ['آدرس واقعی و کامل', 'مدرک سکونت قابل ارائه', 'هماهنگی با پرونده اقامت', 'پیگیری بعد از تایید اقامت', 'به‌روزرسانی بعد از جابه‌جایی'],
    faq: [
      { q: 'آیا ثبت آدرس همان نوشتن آدرس در فرم است؟', a: 'خیر. نوشتن آدرس فقط بخشی از مسیر است. ثبت آدرس یعنی آدرس با مدرک سکونت و مسیر رسمی هماهنگ شود.' },
      { q: 'آیا بعد از گرفتن اقامت هم باید کاری انجام داد؟', a: 'بله. بعد از تایید اقامت، ثبت رسمی آدرس در مسیر نفوس باید پیگیری شود.' },
    ],
    en: {
      summary: 'Address registration records the student residence address in Turkey’s official system.',
      sections: [
        { heading: 'Simple definition', body: 'It confirms where the student actually lives.' },
        { heading: 'Residence path', body: 'Proof is needed before the appointment and official registration follows residence approval.' },
        { heading: 'Common mistake', body: 'Typing an address is not the same as having a provable address.' },
      ],
      checklist: ['Real address', 'Proof of residence', 'Residence file alignment', 'Post-approval follow-up', 'Update after moving'],
      faq: [
        { q: 'Is it only typing an address?', a: 'No.' },
        { q: 'Does it matter after approval?', a: 'Yes.' },
      ],
    },
  },
  'proof-of-residence': {
    title: { fa: 'مدرک سکونت', en: 'Proof of residence' },
    question: { fa: 'مدرک سکونت برای اقامت دانشجویی ترکیه چیست؟', en: 'What is proof of residence for student residence in Turkey?' },
    category: 'آدرس و سکونت',
    summary: 'مدرک سکونت سندی است که نشان می‌دهد دانشجو واقعاً در یک آدرس مشخص زندگی می‌کند. برای خوابگاه، نامه رسمی خوابگاه و برای خانه اجاره‌ای، قرارداد اجاره نوترشده از مهم‌ترین نمونه‌هاست.',
    sections: [
      { heading: 'تعریف ساده', body: 'مدرک سکونت یعنی چیزی که آدرس واقعی دانشجو را قابل اثبات کند، نه فقط یک نشانی شفاهی یا پیام غیررسمی.' },
      { heading: 'نمونه‌های رایج', body: 'اگر دانشجو در خوابگاه است، مدرک خوابگاه مطرح می‌شود. اگر خانه اجاره کرده، نسخه نوترشده قرارداد اجاره اهمیت پیدا می‌کند.' },
      { heading: 'اشتباه رایج', body: 'دانشجو محل سکونت را انتخاب می‌کند اما قبل از راندوو متوجه می‌شود مدرک رسمی لازم را از خوابگاه یا صاحب‌خانه نگرفته است.' },
    ],
    checklist: ['نام دانشجو', 'آدرس کامل', 'نوع محل سکونت', 'تاریخ یا وضعیت اسکان', 'مهر، امضا یا تایید قابل ارائه'],
    faq: [
      { q: 'آیا پیام خوابگاه کافی است؟', a: 'معمولاً باید مدرک رسمی قابل ارائه داشته باشید، نه فقط پیام یا عکس غیررسمی.' },
      { q: 'آیا قول صاحب‌خانه کافی است؟', a: 'خیر. برای مسیر اداری معمولاً مدرک قابل ارائه لازم است.' },
    ],
    en: {
      summary: 'Proof of residence verifies the student’s real address, such as an official dormitory document or notarized rental contract.',
      sections: [
        { heading: 'Simple definition', body: 'It proves where the student lives.' },
        { heading: 'Examples', body: 'Dormitory document or notarized rental contract.' },
        { heading: 'Common mistake', body: 'Choosing housing before checking whether a proper document can be issued.' },
      ],
      checklist: ['Student name', 'Full address', 'Housing type', 'Stay status', 'Official confirmation'],
      faq: [
        { q: 'Is a message enough?', a: 'Usually no.' },
        { q: 'Is a verbal promise enough?', a: 'No.' },
      ],
    },
  },
  'wrong-address-risk': {
    title: { fa: 'ریسک آدرس نادرست', en: 'Wrong address risk' },
    question: { fa: 'آدرس نادرست یا صوری در ترکیه چه خطری برای دانشجو دارد؟', en: 'What risk does a wrong or fake address create in Turkey?' },
    category: 'آدرس و سکونت',
    summary: 'آدرس نادرست، ناقص یا صوری می‌تواند باعث ناهماهنگی در پرونده اقامت، ثبت نفوس، دریافت ابلاغیه‌ها، تمدید اقامت و کارهای اداری مثل بانک یا گواهی‌نامه شود.',
    sections: [
      { heading: 'تعریف ساده', body: 'آدرس نادرست یعنی آدرسی که با محل واقعی زندگی، مدرک سکونت یا اطلاعات رسمی دانشجو هماهنگ نیست.' },
      { heading: 'مشکل عملی', body: 'اگر آدرس اشتباه باشد، دانشجو ممکن است در ثبت آدرس، تمدید اقامت، دریافت نامه‌ها یا خدمات اداری با مشکل روبه‌رو شود.' },
      { heading: 'رفتار درست', body: 'از آدرس صوری استفاده نکنید، مدرک واقعی بگیرید و اگر محل سکونت تغییر کرد، مسیر ثبت یا به‌روزرسانی آدرس را پیگیری کنید.' },
    ],
    checklist: ['پرهیز از آدرس صوری', 'ثبت آدرس واقعی', 'هماهنگی با مدرک سکونت', 'به‌روزرسانی بعد از جابه‌جایی', 'بررسی منبع رسمی برای پرونده‌های خاص'],
    faq: [
      { q: 'آیا آدرس صوری خطرناک است؟', a: 'بله. ممکن است در اقامت و خدمات اداری بعدی مشکل ایجاد کند.' },
      { q: 'اگر خانه عوض شود چه باید کرد؟', a: 'باید مدرک جدید آماده شود و مسیر به‌روزرسانی آدرس بررسی شود.' },
    ],
    en: {
      summary: 'A wrong, incomplete or fake address can create residence and administrative risks.',
      sections: [
        { heading: 'Simple definition', body: 'An address that does not match real housing or documents.' },
        { heading: 'Practical issue', body: 'It may affect renewals, notices and services.' },
        { heading: 'Right behavior', body: 'Use a real address and update it after moving.' },
      ],
      checklist: ['Avoid fake address', 'Use real address', 'Match proof', 'Update after moving', 'Check official route'],
      faq: [
        { q: 'Is a fake address risky?', a: 'Yes.' },
        { q: 'What if I move?', a: 'Update the address.' },
      ],
    },
  },
  'notarized-address-document': {
    title: { fa: 'برگه نوتر آدرس', en: 'Notarized address document' },
    question: { fa: 'برگه نوتر آدرس در پرونده اقامت ترکیه چیست؟', en: 'What is a notarized address document?' },
    category: 'آدرس و سکونت',
    summary: 'برگه نوتر آدرس یا مدرک نوترشده آدرس یعنی سندی که از مسیر دفتر نوتر برای اثبات آدرس قابل استنادتر شده است. در پرونده دانشجو، این موضوع بیشتر درباره قرارداد اجاره نوترشده مطرح می‌شود.',
    sections: [
      { heading: 'تعریف ساده', body: 'نوتر در ترکیه نقش دفتر اسناد رسمی را دارد. وقتی مدرک آدرس یا قرارداد اجاره در نوتر تایید می‌شود، برای پرونده‌های اداری قابل ارائه‌تر می‌شود.' },
      { heading: 'برای دانشجو', body: 'اگر دانشجو خانه اجاره کرده، باید از قبل با صاحب‌خانه هماهنگ کند که قرارداد اجاره نوترشده برای اقامت آماده شود.' },
      { heading: 'اشتباه رایج', body: 'دانشجو قرارداد را می‌بندد و بعداً متوجه می‌شود صاحب‌خانه برای نوتر همکاری نمی‌کند یا مدارک لازم کامل نیست.' },
    ],
    checklist: ['هماهنگی قبل از قرارداد', 'حضور صاحب‌خانه یا نماینده مجاز', 'قرارداد خوانا', 'آدرس کامل', 'نگهداری نسخه قابل ارائه'],
    faq: [
      { q: 'آیا نوتر را باید قبل از قرارداد هماهنگ کرد؟', a: 'بله. بهتر است قبل از امضا مطمئن شوید صاحب‌خانه برای نوتر همکاری می‌کند.' },
      { q: 'آیا برای خوابگاه هم قرارداد نوتر لازم است؟', a: 'معمولاً خوابگاه مسیر مدرک خودش را دارد و باید نامه رسمی خوابگاه گرفته شود.' },
    ],
    en: {
      summary: 'A notarized address document is a more formally usable address proof, often relevant to rental contracts.',
      sections: [
        { heading: 'Simple definition', body: 'A notary makes the document more presentable for official files.' },
        { heading: 'For students', body: 'Coordinate the notarized rental contract before signing.' },
        { heading: 'Common mistake', body: 'Signing before confirming landlord cooperation.' },
      ],
      checklist: ['Coordinate early', 'Landlord cooperation', 'Readable contract', 'Full address', 'Keep a copy'],
      faq: [
        { q: 'Should it be coordinated early?', a: 'Yes.' },
        { q: 'Does dormitory need the same document?', a: 'Usually dormitory has its own official document.' },
      ],
    },
  },
  'notarized-rental-contract': {
    title: { fa: 'قرارداد اجاره نوتر شده', en: 'Notarized rental contract' },
    question: { fa: 'قرارداد اجاره نوتر شده برای اقامت دانشجویی ترکیه چیست؟', en: 'What is a notarized rental contract?' },
    category: 'آدرس و سکونت',
    summary: 'قرارداد اجاره نوترشده نسخه‌ای از قرارداد خانه است که در دفتر نوتر تایید شده و برای پرونده اقامت، مدرک آدرس و برخی کارهای اداری دانشجو قابل ارائه‌تر می‌شود.',
    sections: [
      { heading: 'تعریف ساده', body: 'وقتی دانشجو خانه اجاره می‌کند، قرارداد اجاره می‌تواند در دفتر نوتر تایید شود تا به عنوان مدرک رسمی‌تر آدرس استفاده شود.' },
      { heading: 'قبل از امضا', body: 'دانشجو باید قبل از بستن قرارداد به صاحب‌خانه بگوید برای اقامت به قرارداد نوترشده نیاز دارد و درباره حضور یا مدارک صاحب‌خانه هماهنگ کند.' },
      { heading: 'نکته مهم', body: 'نباید روی وعده بعداً درست می‌شود حساب کرد. اگر صاحب‌خانه همکاری نکند، پرونده اقامت و ثبت آدرس دانشجو می‌تواند دچار مشکل شود.' },
    ],
    checklist: ['نام درست دانشجو', 'آدرس کامل خانه', 'مشخصات صاحب‌خانه', 'هماهنگی نوتر', 'نسخه خوانا برای پرونده'],
    faq: [
      { q: 'آیا قبل از اجاره باید درباره نوتر صحبت کنم؟', a: 'بله. این موضوع را قبل از امضا روشن کنید.' },
      { q: 'اگر صاحب‌خانه همکاری نکند چه؟', a: 'ریسک اداری دارد و بهتر است قبل از نهایی کردن خانه، مسیر جایگزین یا ملک دیگر بررسی شود.' },
    ],
    en: {
      summary: 'A notarized rental contract is a lease verified through a notary and used as stronger proof of address.',
      sections: [
        { heading: 'Simple definition', body: 'A lease confirmed by a notary.' },
        { heading: 'Before signing', body: 'Confirm the landlord will cooperate.' },
        { heading: 'Important point', body: 'Do not rely on vague promises.' },
      ],
      checklist: ['Student name', 'Full address', 'Landlord details', 'Notary coordination', 'Readable copy'],
      faq: [
        { q: 'Should I discuss it before signing?', a: 'Yes.' },
        { q: 'What if the landlord refuses?', a: 'It creates administrative risk.' },
      ],
    },
  },
  'official-dormitory-letter': {
    title: { fa: 'نامه خوابگاه رسمی', en: 'Official dormitory letter' },
    question: { fa: 'نامه خوابگاه رسمی برای اقامت دانشجویی ترکیه چیست؟', en: 'What is an official dormitory letter?' },
    category: 'آدرس و سکونت',
    summary: 'نامه خوابگاه رسمی مدرکی است که خوابگاه برای اثبات محل سکونت دانشجو صادر می‌کند. این مدرک برای پرونده اقامت و گاهی ثبت آدرس بعد از اقامت کاربرد دارد.',
    sections: [
      { heading: 'تعریف ساده', body: 'اگر دانشجو در خوابگاه زندگی می‌کند، خوابگاه باید مدرکی بدهد که نشان دهد دانشجو واقعاً در آن آدرس اسکان دارد.' },
      { heading: 'چه چیزهایی باید روشن باشد؟', body: 'نام دانشجو، نام خوابگاه، آدرس کامل، تاریخ یا وضعیت اسکان و تایید خوابگاه باید قابل تشخیص باشد.' },
      { heading: 'اشتباه رایج', body: 'دانشجو فقط رسید پرداخت یا پیام خوابگاه را نگه می‌دارد، اما برای پرونده رسمی ممکن است نامه مهر، امضا یا تایید الکترونیکی لازم شود.' },
    ],
    checklist: ['نام دانشجو', 'نام خوابگاه', 'آدرس کامل', 'تاریخ یا وضعیت اسکان', 'مهر، امضا یا تایید الکترونیکی'],
    faq: [
      { q: 'آیا رسید پرداخت خوابگاه کافی است؟', a: 'نه همیشه. بهتر است نامه رسمی یا مدرک قابل تایید خوابگاه گرفته شود.' },
      { q: 'آیا برای ثبت آدرس بعد از اقامت هم کاربرد دارد؟', a: 'ممکن است لازم شود، پس بهتر است نسخه قابل ارائه آن نگهداری شود.' },
    ],
    en: {
      summary: 'An official dormitory letter proves that the student lives in a dormitory address.',
      sections: [
        { heading: 'Simple definition', body: 'A dormitory-issued proof of residence.' },
        { heading: 'Required clarity', body: 'Student name, dormitory name, full address and confirmation.' },
        { heading: 'Common mistake', body: 'Keeping only a receipt or informal message.' },
      ],
      checklist: ['Student name', 'Dormitory name', 'Full address', 'Stay status', 'Official confirmation'],
      faq: [
        { q: 'Is a receipt enough?', a: 'Not always.' },
        { q: 'Can it matter later?', a: 'Yes.' },
      ],
    },
  },
  'turkey-nufus': {
    title: { fa: 'نفوس ترکیه', en: 'Turkish Nüfus' },
    question: { fa: 'نفوس ترکیه چیست و چرا برای دانشجو مهم است؟', en: 'What is Turkish Nüfus and why does it matter for students?' },
    category: 'خدمات دولتی ترکیه',
    summary: 'نفوس به اداره و سیستم ثبت اطلاعات جمعیتی و آدرس در ترکیه گفته می‌شود. برای دانشجو، نفوس یعنی جایی که بعد از تایید اقامت، ثبت رسمی آدرس و گواهی محل سکونت می‌تواند از مسیر آن پیگیری شود.',
    sections: [
      { heading: 'تعریف ساده', body: 'نفوس اداره‌ای است که اطلاعات هویتی و آدرس افراد را در ترکیه مدیریت می‌کند. برای خارجی‌ها، بعد از گرفتن اقامت، موضوع آدرس در این مسیر اهمیت پیدا می‌کند.' },
      { heading: 'برای دانشجو', body: 'وقتی کارت اقامت تایید شد، دانشجو باید آدرس خود را در سیستم رسمی ثبت یا پیگیری کند تا بعداً برای کارهای اداری دچار ناهماهنگی نشود.' },
      { heading: 'کاربردها', body: 'برگه نفوس یا گواهی محل سکونت می‌تواند در بانک، گواهی‌نامه، تمدید اقامت، مکاتبات رسمی و بعضی خدمات دولتی کاربرد داشته باشد.' },
    ],
    checklist: ['کارت اقامت یا وضعیت تایید شده', 'مدرک سکونت', 'آدرس کامل', 'ثبت یا به‌روزرسانی آدرس', 'نگهداری گواهی محل سکونت'],
    faq: [
      { q: 'آیا نفوس همان اداره مهاجرت است؟', a: 'خیر. اداره مهاجرت پرونده اقامت را بررسی می‌کند، اما نفوس با ثبت آدرس و اطلاعات جمعیتی مرتبط است.' },
      { q: 'آیا قبل از اقامت هم نفوس می‌گیرم؟', a: 'مسیر اصلی ثبت آدرس رسمی برای دانشجو معمولاً بعد از تایید یا دریافت اقامت پیگیری می‌شود.' },
    ],
    en: {
      summary: 'Nüfus is the Turkish civil registry and address registration system.',
      sections: [
        { heading: 'Simple definition', body: 'It manages civil and address records.' },
        { heading: 'For students', body: 'After residence approval, official address registration becomes important.' },
        { heading: 'Uses', body: 'It can matter for banks, driving license, renewal and services.' },
      ],
      checklist: ['Residence status', 'Proof of residence', 'Full address', 'Address update', 'Residence certificate'],
      faq: [
        { q: 'Is it the Migration Authority?', a: 'No.' },
        { q: 'Does it matter before residence?', a: 'The main registration path is usually after approval.' },
      ],
    },
  },
  'yerlesim-yeri-belgesi': {
    title: { fa: 'برگه نفوس یا گواهی محل سکونت', en: 'Yerleşim Yeri Belgesi' },
    question: { fa: 'برگه نفوس یا Yerleşim Yeri Belgesi در ترکیه چیست؟', en: 'What is Yerleşim Yeri Belgesi in Turkey?' },
    category: 'خدمات دولتی ترکیه',
    summary: 'برگه نفوس یا گواهی محل سکونت سندی است که نشان می‌دهد آدرس فرد در سیستم رسمی ترکیه ثبت شده است. دانشجو ممکن است برای امور بانکی، گواهی‌نامه، خدمات دولتی یا کارهای اقامتی به آن نیاز پیدا کند.',
    sections: [
      { heading: 'تعریف ساده', body: 'این برگه مثل گواهی رسمی آدرس است و نشان می‌دهد محل سکونت ثبت‌شده فرد چیست.' },
      { heading: 'برای دانشجو', body: 'بعد از ثبت رسمی آدرس، دانشجو می‌تواند در مسیرهای رسمی مربوط، گواهی محل سکونت یا برگه نفوس را دریافت یا ارائه کند.' },
      { heading: 'اشتباه رایج', body: 'بعضی دانشجوها فکر می‌کنند قرارداد خانه یا نامه خوابگاه برای همه کارهای بعدی کافی است، اما بعضی ادارات یا بانک‌ها ممکن است گواهی ثبت‌شده آدرس را بخواهند.' },
    ],
    checklist: ['ثبت آدرس انجام شده', 'اطلاعات هویتی درست', 'آدرس کامل', 'نسخه قابل ارائه', 'به‌روزرسانی بعد از تغییر آدرس'],
    faq: [
      { q: 'آیا برگه نفوس همان قرارداد اجاره است؟', a: 'خیر. قرارداد اجاره مدرک سکونت است، اما برگه نفوس نشان می‌دهد آدرس در سیستم رسمی ثبت شده است.' },
      { q: 'برای بانک لازم می‌شود؟', a: 'ممکن است بانک یا نهاد اداری برای اثبات آدرس از دانشجو گواهی محل سکونت بخواهد.' },
    ],
    en: {
      summary: 'Yerleşim Yeri Belgesi is an official residence/address certificate.',
      sections: [
        { heading: 'Simple definition', body: 'It confirms the registered address.' },
        { heading: 'For students', body: 'It can be requested after official address registration.' },
        { heading: 'Common mistake', body: 'Assuming a lease always replaces an official address certificate.' },
      ],
      checklist: ['Address registered', 'Correct identity data', 'Full address', 'Presentable copy', 'Update after moving'],
      faq: [
        { q: 'Is it the same as a lease?', a: 'No.' },
        { q: 'Can a bank ask for it?', a: 'Yes, it may.' },
      ],
    },
  },
});

const ALL_TERM_DETAILS = {
  ...TERM_DETAILS,
  ...EXTRA_TERM_DETAILS,
};

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function buildGlossaryTerms() {
  const related = {};

  knowledgeBlogPosts.forEach((post) => {
    post.glossary.forEach((item) => {
      const slug = ALL_TERM_SLUG_BY_TITLE[item.title];
      if (!slug) return;
      if (!related[slug]) related[slug] = { labels: [], posts: [], definitions: [] };
      related[slug].labels.push(...item.labels);
      related[slug].definitions.push(item.definition);
      related[slug].posts.push({
        slug: post.slug,
        title: post.fa.title,
        excerpt: post.fa.excerpt,
        href: `?page=blog&post=${post.slug}`,
      });
    });
  });

  return Object.entries(ALL_TERM_DETAILS).map(([slug, detail]) => {
    const rel = related[slug] || { labels: [], posts: [], definitions: [] };
    return {
      slug,
      ...detail,
      href: `?page=glossary&term=${encodeURIComponent(slug)}`,
      visual: {
        src: `/assets/glossary/${slug}.svg`,
        alt: `${detail.title.fa} - تصویر آموزشی فرهنگ‌نامه آکا`,
      },
      labels: unique([detail.title.fa, detail.title.en, ...rel.labels]),
      relatedPosts: unique(rel.posts.map((post) => post.slug)).map((postSlug) => rel.posts.find((post) => post.slug === postSlug)),
      sourceDefinitions: unique(rel.definitions),
    };
  });
}

export const glossaryTerms = buildGlossaryTerms();

export function getGlossaryTermBySlug(slug) {
  return glossaryTerms.find((term) => term.slug === slug) || null;
}

export function getGlossaryTermForGlossaryItem(item) {
  if (!item) return null;
  const slug = ALL_TERM_SLUG_BY_TITLE[item.title];
  return getGlossaryTermBySlug(slug);
}
