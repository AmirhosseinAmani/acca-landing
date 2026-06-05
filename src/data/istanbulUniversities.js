import { getUniversityLogo } from './universityLogoMap';
import { buildInternationalCredentials } from './universityCredentials';
import { getTheRankings } from './theRankings';

const LAST_CHECKED = '2026-06-01';
const NOT_PUBLICLY_AVAILABLE = 'Not publicly available';

const defaultInfo = {
  city: 'İstanbul',
  country: 'Turkey',
  sector: 'Private',
};

const S = 'https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/icons/';
const logoUrls = {
  acibadem:   S + 'acibadem.svg',
  arel:       '/assets/optimized/uni-arel-240.webp',
  atlas:      S + 'atlas.svg',
  aydin:      '/assets/optimized/uni-aydin-240.webp',
  bahcesehir: '/assets/optimized/uni-bahcesehir-240.webp',
  beykoz:     S + 'beykoz-universitesi-seeklogo.png',
  // beykent: logo was incorrect — omitted until a verified replacement is provided
  biruni:     S + 'biruni-universitesi-seeklogo.svg',
  esenyurt:   S + 'essenyurt.png',
  fenerbahce: S + 'fenerbahce.svg',
  galata:     S + 'IstanbulGalataUniversitesi_Logo_Dikey_ENG1.jpg',
  gedik:      S + 'Gedik.png',
  gelisim:    S + 'Gelisim.png',
  isik:       S + 'isik-universitesi-logo-png_seeklogo-73715.png',
  istinye:    S + 'istinye-universitesi-seeklogo.svg',
  kent:       S + 'Kent.png',
  kultura:    S + 'istanbul-kultur-universitesi-seeklogo.svg',
  medipol:    S + 'Medipol.png',
  nisantasi:  S + 'Nisantasi.png',
  okan:       S + 'okan.png',
  yeditepe:   S + 'yeditepe-universitesi-seeklogo.svg',
  yeniyuzyil: S + 'Yeniyuzil.png',
};

const records = [
  {
    id: '144',
    name: 'İstanbul Galata University',
    logo: logoUrls.galata,
    foundedIn: '',
    programsCount: '32',
    announcementsCount: '0',
    website: 'https://galata.edu.tr/en',
    academicCalendar: '',
    address: 'Evliya Çelebi Mahallesi Meşrutiyet Caddesi No:62 Tepebaşı / Beyoğlu / İSTANBUL',
    campuses: ['Galata: Evliya Çelebi Mahallesi, Tepebaşı, Meşrutiyet Cd. No:62, 34430 Beyoğlu/İstanbul'],
  },
  {
    id: '88',
    name: 'BEZMIALEM VAKIF UNIVERSITY',
    foundedIn: '2010',
    programsCount: '0',
    announcementsCount: '0',
    website: 'https://bezmialem.edu.tr/tr',
    academicCalendar: 'https://bezmialem.edu.tr/ogrenci-isleri/tr/Sayfalar/akademik-takvim.aspx',
    address: 'Topkapı, Adnan Menderes Blv., 34093 Fatih/İstanbul',
    campuses: ['Topkapı Campus: Topkapı Mahallesi Adnan Menderes Vatan Bulvarı 34093 Fatih/İstanbul'],
  },
  {
    id: '87',
    name: 'FATIH SULTAN MEHMET VAKIF UNIVERSITY',
    foundedIn: '2010',
    programsCount: '77',
    announcementsCount: '2',
    website: 'https://www.fsm.edu.tr/',
    academicCalendar: 'https://ogrenci.fsm.edu.tr/Ogrenci-Isleri-Daire-Baskanligi-Akademik-Takvim--2025-2025-Akademik-Takvim',
    address: 'Sütlüce Mah. Halıcıoğlu Kavşağı No:12 Beyoğlu / ISTANBUL',
    campuses: ['Haliç Campus: Sütlüce Mah. Halıcıoğlu Kavşağı No:12 Beyoğlu / İstanbul'],
  },
  {
    id: '53',
    name: 'DOGUS UNIVERSITY',
    foundedIn: '1997',
    programsCount: '130',
    announcementsCount: '7',
    website: 'https://www.dogus.edu.tr/',
    academicCalendar: 'https://www.dogus.edu.tr/en/academics/academic-calendar',
    address: 'Esenkent, Dudullu Osb Mah, Nato Yolu Cd 265/ 1, 34775 Ümraniye/İstanbul',
    campuses: [
      'Çengelköy Campus: Bahçelievler, Bosna Blv No: 140, 34680 Üsküdar/İstanbul',
      'Dudullu Campus: Esenkent, Dudullu Osb Mah, Nato Yolu Cd 265/ 1, 34775 Ümraniye/İstanbul',
    ],
  },
  {
    id: '51',
    name: 'ISTANBUL TICARET UNIVERSITY',
    foundedIn: '2001',
    programsCount: '120',
    announcementsCount: '1',
    website: 'https://ticaret.edu.tr/',
    academicCalendar: 'https://ticaret.edu.tr/akademik-takvim/',
    address: 'Örnektepe, İmrahor Cd. No: 88/2, 34445 Beyoğlu/İstanbul, Türkiye',
    campuses: ['Sütlüce Campus: Örnektepe Mah. İmrahor Cad. No: 88/2, Beyoğlu 34445 / İstanbul'],
  },
  {
    id: '50',
    name: 'KOC UNIVERSITY',
    foundedIn: '1993',
    programsCount: '78',
    announcementsCount: '10',
    website: '',
    academicCalendar: '',
    address: 'Rumelifeneri, Koç Ünv. No:117, 34450 Sarıyer/İstanbul',
    campuses: [
      'Rumeli Feneri Main Campus: Rumelifeneri, Koç Ünv. No:117, 34450 Sarıyer/İstanbul',
      'West Campus (batı kampus): Zekeriyaköy, 34450 Sarıyer/İstanbul',
    ],
  },
  {
    id: '47',
    name: 'IBN HALDUN UNIVERSITY',
    foundedIn: '2015',
    programsCount: '71',
    announcementsCount: '31',
    website: 'https://www.ihu.edu.tr/en',
    academicCalendar: 'https://oidb.ihu.edu.tr/en/academic-calendar',
    address: 'Başak Mah. Ordu Cad. No:3 P.K. 34480 Başakşehir/İstanbul',
    campuses: ['Başakşehir Campus: Başak Mah. Ordu Cad. No:3 P.K. 34480 Başakşehir/İstanbul'],
  },
  {
    id: '46',
    name: 'SABANCI UNIVERSITY',
    foundedIn: '1995',
    programsCount: '13',
    announcementsCount: '2',
    website: 'https://www.sabanciuniv.edu/en',
    academicCalendar: 'https://www.sabanciuniv.edu/en/academic-calendar?b=2024&c=16&d=en',
    address: 'Sabancı University Tuzla Campus - Orta Mahalle, Üniversite Caddesi No:27 Tuzla, 34956 İstanbul',
    campuses: ['main: Sabancı University Tuzla Campus - Orta Mahalle, Üniversite Caddesi No:27 Tuzla, 34956 İstanbul'],
  },
  {
    id: '45',
    name: 'KADIR HAS UNIVERSITY',
    foundedIn: '1997',
    programsCount: '56',
    announcementsCount: '11',
    website: 'https://www.khas.edu.tr/en/',
    academicCalendar: 'https://akademiktakvim.khas.edu.tr/',
    address: 'Cibali Mah. Kadir Has Cad. 34083 Fatih, İstanbul-TURKEY',
    campuses: ['Main: Cibali Mah. Kadir Has Cad. 34083 Fatih, İstanbul-TURKEY'],
  },
  {
    id: '41',
    name: 'ISTANBUL ESENYURT UNIVERSITY',
    logo: logoUrls.esenyurt,
    foundedIn: '2013',
    programsCount: '113',
    announcementsCount: '12',
    website: 'https://www.esenyurt.edu.tr/',
    academicCalendar: 'https://esenyurt.edu.tr/tr/Icerik/Detay/akademik-takvim-2',
    address: 'Namık Kemal, Adile Naşit Blv. No:1, 34510 Esenyurt/İstanbul',
    campuses: ['Main: Namık Kemal, Adile Naşit Blv. No:1, 34510 Esenyurt/İstanbul'],
  },
  {
    id: '38',
    name: 'FENERBAHCE UNIVERSITY',
    logo: logoUrls.fenerbahce,
    foundedIn: '2016',
    programsCount: '72',
    announcementsCount: '48',
    website: 'https://www.fbu.edu.tr/',
    academicCalendar: 'https://www.fbu.edu.tr/ogrenciler/303/akademik-takvim?dil=en',
    address: 'Atatürk Mah. Ataşehir Bulvarı, Metropol İstanbul, 34758, Ataşehir - İstanbul',
    campuses: ['Main Campus: Atatürk Mah. Ataşehir Bulvarı, Metropol İstanbul, 34758, Ataşehir - İstanbul'],
  },
  {
    id: '33',
    name: 'ISTANBUL GEDIK UNIVERSITY',
    logo: logoUrls.gedik,
    foundedIn: '2010',
    programsCount: '141',
    announcementsCount: '34',
    website: 'https://international.gedik.edu.tr/',
    academicCalendar: 'https://www.gedik.edu.tr/ogrenciler/kayitli-ogrenciler/akademik-takvim',
    address: 'İstanbul Gedik University, Cumhuriyet, İlkbahar Sk. No:1, 34876 Kartal/İstanbul',
    campuses: [
      'Nişantaşı Campus: Teşvikiye Mahallesi Hüsrev Gerede Caddesi No: 110 34365 Şişli İstanbul',
      'Pendik Campus: Sülüntepe Mahallesi Yunus Emre Caddesi No: 1/1 Şeyhli 34913 Pendik İstanbul',
      'Çamlık Campus: Çamlık Mahallesi Nazende Sokak No: 2 Çamlık Spor Tesisleri Karşısı Kurtköy İSTANBUL',
    ],
  },
  {
    id: '32',
    name: 'ISTANBUL TOPKAPI UNIVERSITY',
    foundedIn: '2009',
    programsCount: '176',
    announcementsCount: '83',
    website: 'https://www.topkapi.edu.tr/',
    academicCalendar: 'https://www.topkapi.edu.tr/tr-TR/akademik-takvim/12973',
    address: 'Kazlıçeşme Campus : Kazlıçeşme, Prof. Muammer Aksoy Cad. No: 10, 34087 Zeytinburnu/İstanbul',
    campuses: [
      'Gayrettepe Campus: Gayrettepe Mah., Büyükdere Cd. No: ?, 34349 Beşiktaş/İstanbul',
      'Bahçeşehir Campus: Orhan Gazi, Hoşdere-Esenyurt Yolu No:37, 34538 Esenyurt/İstanbul',
      'Altunizade Campus: Altunizade, Kuşbakışı Cd. No:2, 34662 Üsküdar/İstanbul',
    ],
  },
  {
    id: '30',
    name: 'YEDITEPE UNIVERSITY',
    foundedIn: '1996',
    programsCount: '283',
    announcementsCount: '38',
    website: 'https://yeditepe.edu.tr/tr',
    academicCalendar: 'https://yeditepe.edu.tr/en/academic/academic-calendar',
    address: 'İnönü Mah. Kayışdağı Cad. 26 Ağustos Yerleşimi 34755 Ataşehir - İstanbul',
    campuses: ['Yeditepe Campus: İnönü Mah. Kayışdağı Cad. 26 Ağustos Yerleşimi'],
    logo: logoUrls.yeditepe,
  },
  {
    id: '28',
    name: 'USKUDAR UNIVERSITY',
    foundedIn: '1999',
    programsCount: '191',
    announcementsCount: '58',
    website: '',
    academicCalendar: 'https://uskudar.edu.tr/en/academic-calendar',
    address: 'Altunizade Mh. Üniversite Sokağı No: 14 PK:34662 Üsküdar / İstanbul / TURKEY',
    campuses: [
      'NP Health Campus: Saray Mahallesi Ahmet Tevfik İleri Caddesi No:5 ÜMRANİYE/İSTANBUL',
      'Çarşı Campus: Mimar Sinan, Selmani Pak Cd., 34672 Üsküdar/İstanbul',
      'Medicine: Saray Mahallesi Siteyolu Cad. No:27 34768 Umraniye İSTANBUL',
    ],
  },
  {
    id: '27',
    name: 'OZYEGIN UNIVERSITY',
    foundedIn: '2007',
    programsCount: '67',
    announcementsCount: '19',
    website: 'https://www.ozyegin.edu.tr/en',
    academicCalendar: 'https://www.ozyegin.edu.tr/sites/default/files/upload/OgrenciHizmetleri/2021-2022_akademik_takvim_eng_6.pdf',
    address: 'Nişantepe, Orman Sk. No:13, 34794 Çekmeköy/İstanbul',
    campuses: ['Nişantepe Campus: Nişantepe, Orman Sk. No:13, 34794 Çekmeköy/İstanbul'],
  },
  {
    id: '25',
    name: 'OKAN UNIVERSITY',
    logo: logoUrls.okan,
    foundedIn: '2003-2004',
    programsCount: '276',
    announcementsCount: '46',
    website: '',
    academicCalendar: 'https://www.okan.edu.tr/en/page/8917/2025-2026-academic-calender/',
    address: 'İstanbul Okan University Tuzla Campus, 34959 Tuzla / ISTANBUL / Turkey',
    campuses: [
      'Kadikoy Campus: Uzunçayır Cad. No: 4/A 34722 Hasanpaşa - Kadıköy / İstanbul',
      'Mecidiyekoy Campus: Gülbahar Mah, Oya Sok, No: 23 / A, Mecidiyeköy - Şişli / İstanbul',
    ],
  },
  {
    id: '24',
    name: 'ISTANBUL NISANTASI UNIVERSITY',
    foundedIn: '2009',
    programsCount: '216',
    announcementsCount: '72',
    website: 'https://www.nisantasi.edu.tr/',
    academicCalendar: 'https://www.nisantasi.edu.tr/akademik-takvim',
    address: 'Maslak Mahalesi, Taşyoncası Sokak, No: 1V ve No:1Y Sarıyer-İSTANBUL',
    campuses: [
      'Kagithane: Kağıthane',
      'Neotech Campus: Maslak Mahallesi, Taşyoncası Sokak, No: 1V ve No:1Y, 34398 Sarıyer/İstanbul',
    ],
    logo: logoUrls.nisantasi,
  },
  {
    id: '23',
    name: 'MALTEPE UNIVERSITY',
    foundedIn: '',
    programsCount: '40',
    announcementsCount: '6',
    website: '',
    academicCalendar: '',
    address: '',
    campuses: ['Maltepe Campus: Büyükbakkalköy, Maltepe Ünv. Marmara Eğitim Köyü, 34857 Maltepe/İstanbul'],
  },
  {
    id: '21',
    name: 'ISTINYE UNIVERSITY',
    foundedIn: 'April 2015',
    programsCount: '174',
    announcementsCount: '79',
    website: 'https://www.istinye.edu.tr/',
    academicCalendar: 'https://www.istinye.edu.tr/en/student-registration/academic-calendar',
    address: 'Istinye University Vadi Campus, Ayazağa Mah. Azerbaycan Cad. (Vadi İstanbul 4A) Blok No: 3H Sarıyer/İSTANBUL',
    campuses: [
      'Topkapi Campus: Maltepe, İstinye Üniversitesi Topkapı Kampüsü, Teyyareci Sami Sk. No.3, 34010 Zeytinburnu/İstanbul',
      'Vadi Campus: Ayazağa, Azerbaycan Cd. No: 4/a, 34396 Sarıyer/İstanbul',
    ],
    logo: logoUrls.istinye,
  },
  {
    id: '20',
    name: 'ISTANBUL YENI YUZYIL UNIVERSITY',
    logo: logoUrls.yeniyuzyil,
    foundedIn: '',
    programsCount: '86',
    announcementsCount: '46',
    website: 'https://yeniyuzyil.edu.tr/ / https://international.yeniyuzyil.edu.tr/',
    academicCalendar: 'https://yeniyuzyil.edu.tr/ogrenci/akademik-takvim.aspx',
    address: 'Maltepe Mahallesi, Yılanlı Ayazma Caddesi, No: 26 P.K. 34010 Cevizlibağ / Zeytinburnu / İstanbul',
    campuses: [
      'Topkapı Dr. Azmi Ofluoğlu Yerleşkesi: Maltepe Mahallesi, Yılanlı Ayazma Caddesi, No: 26 P.K. 34010 Cevizlibağ / Zeytinburnu / İstanbul',
      'Dentistry Hospital: Sütlüce Mahallesi, Binektaşı Sokak, No:10 Beyoğlu / İstanbul / TURKEY',
    ],
  },
  {
    id: '19',
    name: 'ISTANBUL SABAHATTIN ZAIM UNIVERSITY',
    foundedIn: '2010',
    programsCount: '134',
    announcementsCount: '21',
    website: 'https://www.izu.edu.tr',
    academicCalendar: 'https://izu.edu.tr/ogrenci/kayit-kabul/akademik-takvim/2023-2024-egitim-ogretim-yili-lisans-ve-lisansustu-akademik-takvim',
    address: 'Halkalı Cad. No: 281 Halkalı Küçükçekmece / İSTANBUL',
    campuses: ['Halkali Central Campus: Halkalı Cad. No: 281 Halkalı, Küçükçekmece / İSTANBUL 34303'],
  },
  {
    id: '18',
    name: 'ISTANBUL MEDIPOL UNIVERSITY',
    foundedIn: '2009',
    programsCount: '176',
    announcementsCount: '135',
    website: 'https://mio.medipol.edu.tr/',
    academicCalendar: 'https://mio.medipol.edu.tr/academic-calendar-2',
    address: 'Kavacık, Ekinciler Cd. No:19, 34810 Beykoz/İstanbul',
    campuses: [
      'Haliç Campus: Cibali, Atatürk Blv. 25, 34083 Fatih/İstanbul',
      'Kavacik North Campus: Kavacık, Ekinciler Cd. No:19, 34810 Beykoz/İstanbul',
      'Kavacik South Campus: Kavacık, Ekinciler Cd. No:19, 34810 Beykoz/İstanbul',
    ],
    logo: logoUrls.medipol,
  },
  {
    id: '17',
    name: 'ISTANBUL KULTUR UNIVERSITY',
    logo: logoUrls.kultura,
    foundedIn: '1997',
    programsCount: '165',
    announcementsCount: '31',
    website: '',
    academicCalendar: 'https://www.iku.edu.tr/en/academic-calendar',
    address: 'Kültür College Administration Building 34156 Bakırköy/İstanbul',
    campuses: [
      'Kavacik South Campus: Kavacık, Ekinciler Cd. No:19, 34810 Beykoz/İstanbul',
      'Incirli Campus: Zuhuratbaba, Yol Başı Sk., 34147 Bakırköy/İstanbul',
    ],
  },
  {
    id: '16',
    name: 'ISTANBUL KENT UNIVERSITY',
    foundedIn: '2016',
    programsCount: '85',
    announcementsCount: '39',
    website: 'https://www.kent.edu.tr/',
    academicCalendar: 'https://www.kent.edu.tr/academic-calendar-101711',
    address: 'Cihangir, Sıraselviler Cd. No:71, 34433 Beyoğlu/İstanbul',
    campuses: [
      'Taksim campus: Cihangir, Sıraselviler Cd. No:71, 34433 Beyoğlu/İstanbul',
      'Kâğıthane campus: Merkez, Cendere Cad. NO:24, 34406 Kâğıthane/İstanbul',
    ],
    logo: logoUrls.kent,
  },
  {
    id: '15',
    name: 'ISTANBUL GELISIM UNIVERSITY',
    logo: logoUrls.gelisim,
    foundedIn: '2008',
    programsCount: '258',
    announcementsCount: '176',
    website: 'https://www.gelisim.edu.tr/tr/gelisim-anasayfa',
    academicCalendar: 'https://gelisim.edu.tr/en/academic-calendar',
    address: 'Cihangir Mahallesi Şehit Jandarma Komando Er Hakan Öner Sk. No:1 Avcılar / İSTANBUL',
    campuses: ['Avcilar Campus: Cihangir, Avcılar İstanbul TR, Oğul Sk. No:10, 34310 Beylikdüzü Osb/Beylikdüzü'],
  },
  {
    id: '14',
    name: 'ISTANBUL BILGI UNIVERSITY',
    foundedIn: '1996',
    programsCount: '157',
    announcementsCount: '62',
    website: 'https://www.bilgi.edu.tr/en/',
    academicCalendar: 'https://www.bilgi.edu.tr/en/life-at-bilgi/student/academic-calendars/',
    address: 'Emniyettepe Mahallesi, Kazım Karabekir Cd. No:13 D:2, 34060 Eyüpsultan/İstanbul',
    campuses: ['santralistanbul Campus: Emniyettepe, Kazım Karabekir Cd. No:2/20, 34060 Eyüpsultan/İstanbul'],
  },
  {
    id: '13',
    name: 'ISTANBUL AYDIN UNIVERSITY',
    foundedIn: '2003',
    programsCount: '399',
    announcementsCount: '155',
    website: 'https://www.aydin.edu.tr/tr-tr/Pages/default.aspx',
    academicCalendar: 'https://www.aydin.edu.tr/en-us/ogrenciler/kayit-kabul/Pages/akademik-takvim.aspx',
    address: 'Halit Aydın Kampüsü No:38 , Sefaköy-Küçükçekmece, Istanbul, PK: 34295',
    campuses: ['Beşyol Campus: Beşyol, İnönü Cd. No:38, 34295 Küçükçekmece/İstanbul'],
    logo: logoUrls.aydin,
  },
  {
    id: '12',
    name: 'ISTANBUL ATLAS UNIVERSITY',
    foundedIn: '2018',
    programsCount: '101',
    announcementsCount: '74',
    website: 'https://www.atlas.edu.tr',
    academicCalendar: 'https://www.atlas.edu.tr/akademik-takvim/',
    address: 'Hamidiye, Anadolu Cd. no:40, 34408, 34403 Kâğıthane/İstanbul',
    campuses: [
      'Atlas Vadi Campus: Anadolu Cad. No:40 Kağıthane İstanbul',
      'Atlas Valley Campus: ATLAS VADİ KAMPÜSÜ 2020. ANADOLU CAD. NO:40 KAĞITHANE İSTANBUL',
    ],
    logo: logoUrls.atlas,
  },
  {
    id: '11',
    name: 'ISTANBUL AREL UNIVERSITY',
    foundedIn: '2007',
    programsCount: '138',
    announcementsCount: '19',
    website: 'https://www.istanbularel.edu.tr/',
    academicCalendar: 'https://www.arel.edu.tr/akademik-takvim',
    address: 'Türkoba, Erguvan Sk. No:26 / K, 34537 Tepekent / İstanbul',
    campuses: [
      'Sefakoy Campus: Kemalpaşa, No:, Halkalı Cd No:101, 34295 Küçükçekmece/İstanbul',
      'Cevizlibağ Campus: Merkez Efendi Mahallesi, Eski Londra Asfaltı Cd. No 1/3, 34010 Zeytinburnu/İstanbul',
    ],
    logo: logoUrls.arel,
  },
  {
    id: '10',
    name: 'ISIK UNIVERSITY',
    logo: logoUrls.isik,
    foundedIn: '1996',
    programsCount: '64',
    announcementsCount: '48',
    website: '',
    academicCalendar: 'https://www.isikun.edu.tr/international/academic-calendar',
    address: 'Meşrutiyet Mahallesi, Üniversite Sokak No:2 Şile / Istanbul - Türkiye',
    campuses: [
      'Maslak Campus: Levent, Pınar maslak, Büyükdere Cd. No: 106, 34398 Sarıyer/İstanbul',
      'Sile Campus: Meşrutiyet, Işık Ünv., 34980 Şile/İstanbul',
    ],
  },
  {
    id: '9',
    name: 'HALIC UNIVERSITY',
    foundedIn: '1998',
    programsCount: '171',
    announcementsCount: '39',
    website: 'https://halic.edu.tr/en',
    academicCalendar: 'https://halic.edu.tr/en/student/academic-calendar/2023-2024-academic-calendar',
    address: 'Güzeltepe Mahallesi, 15 Temmuz Şehitler Caddesi, No:14/12 34060 Eyüpsultan - İSTANBUL',
    campuses: ['Campus: Güzeltepe, Bayramoğlu Sk. 5a, 34060 Eyüpsultan/İstanbul'],
  },
  {
    id: '8',
    name: 'BIRUNI UNIVERSITY',
    foundedIn: '2014',
    programsCount: '94',
    announcementsCount: '138',
    website: 'https://www.biruni.edu.tr/',
    academicCalendar: 'https://www.biruni.edu.tr/ogrenci/akademik-takvim',
    address: 'Merkezefendi Mahallesi G/75 Sk. No: 1-13 Zeytinburnu/İstanbul',
    campuses: ['Main Campus: Merkezefendi, 75 Sk No:1-13 M. G, 34015 Zeytinburnu/İstanbul'],
    logo: logoUrls.biruni,
  },
  {
    id: '7',
    name: 'BEYKOZ UNIVERSITY',
    logo: logoUrls.beykoz,
    foundedIn: '2008',
    programsCount: '65',
    announcementsCount: '25',
    website: 'https://www.beykoz.edu.tr/',
    academicCalendar: 'https://www.beykoz.edu.tr/content/editor/6516b23950e8e_lpe-takvim-ingilizce-192023.pdf',
    address: 'Kavacık, Orhan Veli Kanık Cd. No: 114, 34000 Beykoz/İstanbul',
    campuses: [
      'Kavacık School of Foreign Languages Campus: Fatih Sultan Mehmet Caddesi Şehit Er Cengiz Karcıoğlu Sokak No: 7 Kavacık Beykoz İstanbul',
      'Çubuklu Campus: Fırın Street No: 1 Çubuklu',
      'Kavacık Campus: Vatan Caddesi No: 69 PK: 34805 Kavacık',
    ],
  },
  {
    id: '6',
    name: 'BEYKENT UNIVERSITY',
    foundedIn: '1997',
    programsCount: '234',
    announcementsCount: '76',
    website: 'https://www.beykent.edu.tr/',
    academicCalendar: 'https://www.beykent.edu.tr/en/academic/academic-calendar',
    address: 'Cumhuriyet, Turgut Özal Blv. No: 147, 34500 Büyükçekmece/İstanbul',
    campuses: [
      'Taksim campus: Cihangir, Sıraselviler Cd. No:65, 34433 Beyoğlu/İstanbul',
      'Hadimkoy campus: Akçaburgaz, 34522 Esenyurt/İstanbul',
      'Beylikdüzü campus: Cumhuriyet, Turgut Özal Blv. No: 147, 34500 Büyükçekmece/İstanbul',
    ],
  },
  {
    id: '5',
    name: 'BAHCESEHIR UNIVERSITY',
    foundedIn: '1998',
    programsCount: '283',
    announcementsCount: '87',
    website: 'www.int.bau.edu.tr',
    academicCalendar: 'https://bau.edu.tr/content/2513-academic-calendar',
    address: 'Yıldız, Çırağan Cd., 34349 Beşiktaş/İstanbul',
    campuses: [
      'Göztepe Campus: Sahrayı Cedid Mahallesi, Batman Sokak, No: 66',
      'Beşiktaş South Campus: Yıldız, Çırağan Cd., 34349 Beşiktaş/İstanbul',
    ],
    logo: logoUrls.bahcesehir,
  },
  {
    id: '1',
    name: 'ALTINBAS UNIVERSITY',
    foundedIn: '2008',
    programsCount: '122',
    announcementsCount: '51',
    website: 'www.altinbas.edu.tr',
    academicCalendar: 'https://altinbas.edu.tr/Pages/takvim.aspx',
    address: 'Mahmutbey Dilmenler Caddesi, No:26, 34217 Bağcılar - İSTANBUL',
    campuses: [
      'Bakirkoy Campus: Zuhuratbaba, İncirli Cd. No:11',
      'Mahmutbey Campus: Mahmutbey, Dilmenler Cd. No:26, 34217 Bağcılar/İstanbul',
      'Bakırköy Campus: Kartaltepe Mah. İncirli cad. No:11 Bakırköy / İstanbul',
    ],
  },
];

function normalizeExternalUrl(value) {
  if (!value) return '';
  const firstUrl = String(value).split(/\s+\/\s+|\s+/).find(Boolean);
  if (!firstUrl) return '';
  return /^https?:\/\//i.test(firstUrl) ? firstUrl : `https://${firstUrl}`;
}

function asNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function source(label, url, scope) {
  if (!url) return null;

  return {
    label,
    sourceUrl: url,
    scope,
    lastChecked: LAST_CHECKED,
  };
}

function compactNumberLabel(value, fallback) {
  if (value === null) return fallback;
  if (value >= 200) return '200+ Programs';
  if (value >= 150) return '150+ Programs';
  if (value >= 100) return '100+ Programs';
  if (value >= 50) return '50+ Programs';
  return `${value} Programs`;
}

function hasMedicalSignal(record) {
  const text = [
    record.name,
    record.address,
    ...(record.campuses || []),
  ].join(' ').toLowerCase();

  return /hospital|clinic|health|medical|medicine|dental|np health|sağlık|saglik/.test(text);
}

function rankingDisplayValue(item) {
  if (!item) return '';
  return item.rankRange || item.rank || '';
}

function rankingLabel(item) {
  if (!item) return '';
  if (item.rankingType === 'Impact Rankings') return `THE Impact: ${rankingDisplayValue(item)}`;
  if (item.rankingType === 'Subject Rankings') {
    return `THE ${item.subject}: ${rankingDisplayValue(item)}`;
  }
  return `THE: ${rankingDisplayValue(item)}`;
}

function rankingNarrativeLabel(item, isFa) {
  if (!item) return '';
  const value = rankingDisplayValue(item);
  if (item.rankingType === 'Impact Rankings') {
    return isFa ? `\u0631\u062a\u0628\u0647 \u0627\u062b\u0631\u06af\u0630\u0627\u0631\u06cc THE ${value}` : `THE Impact ${value}`;
  }
  if (item.rankingType === 'Subject Rankings') {
    return isFa
      ? `\u0631\u062a\u0628\u0647 \u0645\u0648\u0636\u0648\u0639\u06cc ${item.subject} ${value}`
      : `THE ${item.subject} ${value}`;
  }
  return isFa ? `\u0631\u062a\u0628\u0647 \u062c\u0647\u0627\u0646\u06cc THE ${value}` : `THE World ${value}`;
}

function buildTheRankingSummary(theRankings) {
  if (!theRankings?.listed) {
    return {
      status: 'not_listed',
      badgeFa: 'در THE ثبت نشده',
      badgeEn: 'THE: Not listed',
      noteFa: 'پروفایل THE در منابع عمومی منتخب پیدا نشد.',
      noteEn: 'THE profile not found in selected public sources',
      items: [],
      cardItems: [],
      needsHumanReview: false,
    };
  }

  const items = [...(theRankings.rankings || [])].sort(
    (a, b) => Number(a.displayPriority || 99) - Number(b.displayPriority || 99)
  );

  if (!items.length) {
    return {
      status: 'profile',
      badgeFa: 'پروفایل THE',
      badgeEn: 'THE Profile',
      noteFa: 'برای این دانشگاه پروفایل عمومی در Times Higher Education پیدا شده، اما رتبه مشخصی در منابع بررسی‌شده نمایش داده نشده است.',
      noteEn: 'A public Times Higher Education profile was found, but no specific ranking row is displayed in the reviewed source.',
      items,
      cardItems: [],
      needsHumanReview: false,
    };
  }

  return {
    status: 'listed',
    badgeFa: 'دارای رتبه THE',
    badgeEn: 'THE Listed',
    noteFa: 'بر اساس داده‌های Times Higher Education، این دانشگاه در یکی از رتبه‌بندی‌های منتخب THE ثبت شده است.',
    noteEn: 'According to Times Higher Education data, this university is listed in at least one THE ranking.',
    items,
    cardItems: items.slice(0, 2).map((item) => ({
      label: rankingLabel(item),
      sourceUrl: item.sourceUrl,
    })),
    needsHumanReview: Boolean(theRankings.dataQuality?.needsHumanReview),
  };
}

function buildUniversityNarrative(record, context, isFa) {
  const {
    websiteUrl,
    calendarUrl,
    campuses,
    programCount,
    medicalSignal,
    rankingSummary,
    internationalCredentials,
    theProfileFacts,
  } = context;
  const name = record.name;
  const city = record.city || defaultInfo.city;
  const founded = record.foundedIn && record.foundedIn !== NOT_PUBLICLY_AVAILABLE
    ? record.foundedIn
    : '';
  const campusText = buildCampusPositionText(record, campuses, isFa);
  const programText = buildProgramPositionText(programCount, isFa);
  const rankingText = buildRankingPositionText(rankingSummary, isFa);
  const profileFactsText = buildProfileFactsText(theProfileFacts, isFa);
  const pathwayText = buildPathwayPositionText(internationalCredentials, {
    calendarUrl,
    websiteUrl,
    medicalSignal,
  }, isFa);

  if (isFa) {
    const foundedText = founded
      ? ` \u0627\u0632 \u0633\u0627\u0644 ${founded}`
      : '';
    return [
      `${name}${foundedText} \u062f\u0631 ${city} \u0628\u0631\u0627\u06cc \u062f\u0627\u0646\u0634\u062c\u0648\u06cc\u0627\u0646 \u0628\u06cc\u0646\u200c\u0627\u0644\u0645\u0644\u0644\u06cc \u06a9\u0647 \u0645\u06cc\u200c\u062e\u0648\u0627\u0647\u0646\u062f \u0645\u0633\u06cc\u0631 \u067e\u0630\u06cc\u0631\u0634 \u062f\u0631 \u062a\u0631\u06a9\u06cc\u0647 \u0631\u0627 \u0628\u0627 \u062f\u0627\u062f\u0647 \u0648\u0627\u0642\u0639\u06cc \u0645\u0642\u0627\u06cc\u0633\u0647 \u06a9\u0646\u0646\u062f \u0642\u0627\u0628\u0644 \u0628\u0631\u0631\u0633\u06cc \u0627\u0633\u062a.`,
      campusText,
      programText,
      rankingText,
      profileFactsText,
      pathwayText,
    ].filter(Boolean).join(' ');
  }

  const foundedText = founded ? `, founded in ${founded},` : '';
  return [
    `${name}${foundedText} gives international applicants a concrete ${city} option for comparing admission routes in Turkey.`,
    campusText,
    programText,
    rankingText,
    profileFactsText,
    pathwayText,
  ].filter(Boolean).join(' ');
}

function buildCampusPositionText(record, campuses, isFa) {
  const campusCount = campuses.length;
  const primaryCampus = getPrimaryCampusLabel(campuses[0] || record.address);

  if (isFa) {
    if (campusCount > 1) {
      return `\u0627\u0632 \u0646\u0638\u0631 \u0645\u06a9\u0627\u0646\u06cc\u060c ${campusCount} \u06a9\u0645\u067e\u0648\u0633 \u0628\u0631\u0627\u06cc \u0622\u0646 \u062b\u0628\u062a \u0634\u062f\u0647 \u0648 \u06a9\u0645\u067e\u0648\u0633 \u0634\u0627\u062e\u0635 \u062f\u0631 ${primaryCampus} \u062f\u0631 \u062f\u06cc\u062f \u0627\u0648\u0644 \u0642\u0631\u0627\u0631 \u0645\u06cc\u200c\u06af\u06cc\u0631\u062f.`;
    }
    if (primaryCampus) {
      return `\u0646\u0642\u0637\u0647 \u0645\u06a9\u0627\u0646\u06cc \u0627\u0635\u0644\u06cc \u0622\u0646 \u062f\u0631 ${primaryCampus} \u062b\u0628\u062a \u0634\u062f\u0647 \u0648 \u0628\u0631\u0627\u06cc \u0628\u0631\u0631\u0633\u06cc \u0645\u0633\u06cc\u0631 \u062d\u0636\u0648\u0631\u06cc \u0648 \u062e\u062f\u0645\u0627\u062a \u062f\u0627\u0646\u0634\u062c\u0648\u06cc\u06cc \u0645\u0647\u0645 \u0627\u0633\u062a.`;
    }
    return '';
  }

  if (campusCount > 1) {
    return `Its footprint is multi-campus, with ${campusCount} recorded campuses and a visible campus reference at ${primaryCampus}.`;
  }
  if (primaryCampus) {
    return `Its main recorded location is ${primaryCampus}, which helps applicants assess commute, housing, and student-service fit.`;
  }
  return '';
}

function buildProgramPositionText(programCount, isFa) {
  if (!programCount) {
    return isFa
      ? '\u062f\u0631 \u06a9\u0627\u062a\u0627\u0644\u0648\u06af \u0641\u0639\u0644\u06cc \u0633\u0627\u06cc\u062a\u060c \u062f\u0627\u062f\u0647 \u0631\u0634\u062a\u0647 \u0628\u0631\u0627\u06cc \u0627\u06cc\u0646 \u062f\u0627\u0646\u0634\u06af\u0627\u0647 \u06a9\u0627\u0645\u0644 \u0646\u06cc\u0633\u062a \u0648 \u067e\u06cc\u0634 \u0627\u0632 \u062a\u0635\u0645\u06cc\u0645 \u0628\u0627\u06cc\u062f \u0628\u0627 \u0645\u0646\u0628\u0639 \u0631\u0633\u0645\u06cc \u0686\u06a9 \u0634\u0648\u062f.'
      : 'The current ACCA catalog does not expose complete program rows for this university, so applicants should verify the final list against the official source.';
  }

  if (isFa) {
    if (programCount >= 200) return `\u0628\u0627 ${programCount} \u0631\u0634\u062a\u0647 \u062b\u0628\u062a\u200c\u0634\u062f\u0647\u060c \u06af\u0632\u06cc\u0646\u0647\u200c\u0627\u06cc \u0645\u0646\u0627\u0633\u0628 \u0628\u0631\u0627\u06cc \u0645\u0642\u0627\u06cc\u0633\u0647 \u06af\u0633\u062a\u0631\u062f\u0647 \u0631\u0634\u062a\u0647\u060c \u0632\u0628\u0627\u0646 \u062a\u062d\u0635\u06cc\u0644 \u0648 \u0634\u0647\u0631\u06cc\u0647 \u0627\u0633\u062a.`;
    if (programCount >= 100) return `\u0628\u0627 ${programCount} \u0631\u0634\u062a\u0647 \u062b\u0628\u062a\u200c\u0634\u062f\u0647\u060c \u0628\u0631\u0627\u06cc \u062f\u0627\u0646\u0634\u062c\u0648\u06cc\u0627\u0646\u06cc \u06a9\u0647 \u0686\u0646\u062f \u0645\u0633\u06cc\u0631 \u067e\u0630\u06cc\u0631\u0634 \u0631\u0627 \u0647\u0645\u200c\u0632\u0645\u0627\u0646 \u0645\u06cc\u200c\u0633\u0646\u062c\u0646\u062f \u06af\u0632\u06cc\u0646\u0647\u200c\u0627\u06cc \u062f\u0627\u062f\u0647\u200c\u0645\u062d\u0648\u0631 \u0627\u0633\u062a.`;
    if (programCount >= 50) return `${programCount} \u0631\u0634\u062a\u0647 \u062b\u0628\u062a\u200c\u0634\u062f\u0647 \u062f\u0627\u0631\u062f \u0648 \u0628\u0631\u0627\u06cc \u0627\u0646\u062a\u062e\u0627\u0628 \u0647\u062f\u0641\u0645\u0646\u062f \u0631\u0634\u062a\u0647 \u0628\u0627 \u062a\u0645\u0631\u06a9\u0632 \u0645\u062a\u0648\u0633\u0637 \u0645\u0646\u0627\u0633\u0628 \u0627\u0633\u062a.`;
    return `\u06a9\u0627\u062a\u0627\u0644\u0648\u06af \u0641\u0639\u0644\u06cc ${programCount} \u0631\u0634\u062a\u0647 \u0646\u0634\u0627\u0646 \u0645\u06cc\u200c\u062f\u0647\u062f\u061b \u067e\u0633 \u0627\u06cc\u0646 \u067e\u0631\u0648\u0641\u0627\u06cc\u0644 \u0628\u06cc\u0634\u062a\u0631 \u0628\u0631\u0627\u06cc \u062c\u0633\u062a\u062c\u0648\u06cc \u062f\u0642\u06cc\u0642 \u0631\u0634\u062a\u0647 \u0645\u0641\u06cc\u062f \u0627\u0633\u062a.`;
  }

  if (programCount >= 200) return `With ${programCount} recorded programs, it is best suited to broad program, language, and tuition comparisons.`;
  if (programCount >= 100) return `With ${programCount} recorded programs, it works well for applicants comparing several admission routes at once.`;
  if (programCount >= 50) return `Its ${programCount} recorded programs make it a focused mid-sized catalog for targeted program selection.`;
  return `Its current catalog shows ${programCount} recorded programs, so it is most useful for focused checks rather than broad search.`;
}

function buildRankingPositionText(rankingSummary, isFa) {
  const items = rankingSummary?.items || [];
  if (!items.length) {
    return isFa
      ? '\u062f\u0627\u062f\u0647 \u0631\u062a\u0628\u0647\u200c\u0628\u0646\u062f\u06cc THE \u0628\u0631\u0627\u06cc \u0622\u0646 \u062f\u0631 \u06a9\u0627\u0631\u062a \u062a\u0635\u0645\u06cc\u0645 \u0628\u0647\u200c\u0639\u0646\u0648\u0627\u0646 \u0645\u062f\u0631\u06a9 \u0642\u0637\u0639\u06cc \u0646\u0645\u06cc\u200c\u0622\u06cc\u062f \u0648 \u0628\u0627\u06cc\u062f \u0628\u0627 \u0645\u0646\u0627\u0628\u0639 \u0631\u0633\u0645\u06cc \u0645\u06a9\u0645\u0644 \u0634\u0648\u062f.'
      : 'THE ranking data is not used as a decisive proof for this card and should be supplemented with official university checks.';
  }

  const primary = items[0];
  const secondary = items.find((item) => item.rankingType === 'Subject Rankings');
  const primaryLabel = rankingNarrativeLabel(primary, isFa);
  const secondaryLabel = secondary ? rankingNarrativeLabel(secondary, isFa) : '';

  if (isFa) {
    return secondaryLabel
      ? `\u062f\u0631 \u062f\u0627\u062f\u0647\u200c\u0647\u0627\u06cc THE\u060c ${primaryLabel} \u0648 ${secondaryLabel} \u0628\u0631\u0627\u06cc \u0645\u0642\u0627\u06cc\u0633\u0647 \u0622\u06a9\u0627\u062f\u0645\u06cc\u06a9 \u0622\u0646 \u062f\u0631 \u062f\u0633\u062a\u0631\u0633 \u0627\u0633\u062a.`
      : `\u062f\u0631 \u062f\u0627\u062f\u0647\u200c\u0647\u0627\u06cc THE\u060c ${primaryLabel} \u0628\u0631\u0627\u06cc \u0628\u0631\u0631\u0633\u06cc \u0627\u0648\u0644\u06cc\u0647 \u062c\u0627\u06cc\u06af\u0627\u0647 \u0622\u06a9\u0627\u062f\u0645\u06cc \u0622\u0646 \u062b\u0628\u062a \u0634\u062f\u0647 \u0627\u0633\u062a.`;
  }

  return secondaryLabel
    ? `For academic positioning, the stored THE data includes ${primaryLabel} and ${secondaryLabel}.`
    : `For academic positioning, the stored THE data includes ${primaryLabel}.`;
}

function buildProfileFactsText(theProfileFacts, isFa) {
  const studentCount = theProfileFacts?.studentCount;
  const internationalPercent = theProfileFacts?.internationalStudentsPercent;

  if (studentCount && internationalPercent) {
    return isFa
      ? `\u067e\u0631\u0648\u0641\u0627\u06cc\u0644 THE \u0647\u0645\u0686\u0646\u06cc\u0646 ${studentCount} \u062f\u0627\u0646\u0634\u062c\u0648 \u0648 ${internationalPercent} \u062f\u0627\u0646\u0634\u062c\u0648\u06cc \u0628\u06cc\u0646\u200c\u0627\u0644\u0645\u0644\u0644\u06cc \u0646\u0634\u0627\u0646 \u0645\u06cc\u200c\u062f\u0647\u062f\u060c \u06a9\u0647 \u0628\u0631\u0627\u06cc \u062a\u0635\u0645\u06cc\u0645 \u062f\u0627\u0646\u0634\u062c\u0648\u06cc \u062e\u0627\u0631\u062c\u06cc \u0627\u0631\u0632\u0634\u0645\u0646\u062f \u0627\u0633\u062a.`
      : `THE profile facts show ${studentCount} students and ${internationalPercent} international students, which is useful for international-applicant fit.`;
  }

  if (studentCount) {
    return isFa
      ? `\u067e\u0631\u0648\u0641\u0627\u06cc\u0644 THE \u0628\u0631\u0627\u06cc \u0622\u0646 ${studentCount} \u062f\u0627\u0646\u0634\u062c\u0648 \u0646\u0634\u0627\u0646 \u0645\u06cc\u200c\u062f\u0647\u062f.`
      : `THE profile facts show ${studentCount} students.`;
  }

  return '';
}

function buildPathwayPositionText(credentials, { calendarUrl, websiteUrl, medicalSignal }, isFa) {
  const credentialLabels = (credentials?.cardBadges || [])
    .filter((badge) => badge.confidence !== 'low')
    .map((badge) => badge.label)
    .slice(0, 3);
  const supportSignals = [
    credentialLabels.length ? credentialLabels.join(', ') : '',
    calendarUrl ? (isFa ? '\u062a\u0642\u0648\u06cc\u0645 \u0622\u06a9\u0627\u062f\u0645\u06cc\u06a9 \u0639\u0645\u0648\u0645\u06cc' : 'a public academic calendar') : '',
    websiteUrl ? (isFa ? '\u0648\u0628\u200c\u0633\u0627\u06cc\u062a \u0631\u0633\u0645\u06cc' : 'an official website') : '',
    medicalSignal ? (isFa ? '\u0646\u0634\u0627\u0646\u0647\u200c\u0647\u0627\u06cc \u0633\u0644\u0627\u0645\u062a/\u0628\u0627\u0644\u06cc\u0646\u06cc' : 'health or clinical signals') : '',
  ].filter(Boolean);

  if (!supportSignals.length) return '';

  return isFa
    ? `\u0628\u0631\u0627\u06cc \u0645\u0633\u06cc\u0631 \u067e\u0630\u06cc\u0631\u0634\u060c \u0646\u06a9\u0627\u062a \u0642\u0627\u0628\u0644 \u0628\u0631\u0631\u0633\u06cc \u0634\u0627\u0645\u0644 ${supportSignals.join('\u060c ')} \u0627\u0633\u062a.`
    : `For admission due diligence, useful signals include ${supportSignals.join(', ')}.`;
}

function getPrimaryCampusLabel(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.split(':')[0].split(',')[0].trim();
}

export function buildUniversitySlug(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ä°/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function buildDecisionProfile(record) {
  const websiteUrl = normalizeExternalUrl(record.website);
  const calendarUrl = normalizeExternalUrl(record.academicCalendar);
  const campuses = (record.campuses || []).filter(Boolean);
  const programCount = asNumber(record.programsCount);
  const announcementsCount = asNumber(record.announcementsCount);
  const medicalSignal = hasMedicalSignal(record);
  const theRankings = getTheRankings(record.name);
  const rankingSummary = buildTheRankingSummary(theRankings);
  const theProfileFacts = theRankings?.profileFacts || {};
  const rankingItems = rankingSummary.items || [];
  const internationalCredentials = buildInternationalCredentials(record.name);
  const hasWorldRanking = rankingItems.some((item) => item.rankingType === 'World University Rankings');
  const hasImpactRanking = rankingItems.some((item) => item.rankingType === 'Impact Rankings');
  const hasSubjectRanking = rankingItems.some((item) => item.rankingType === 'Subject Rankings');

  const sources = [
    theRankings?.listed
      ? source('Times Higher Education Profile', theRankings.profileUrl, 'ranking profile')
      : null,
    source('Official university website', websiteUrl, 'institutional profile'),
    source('Academic calendar', calendarUrl, 'academic calendar'),
  ].filter(Boolean);

  const keyNumbers = [
    {
      id: 'founded',
      labelFa: 'تاسیس',
      labelEn: 'Founded',
      value: record.foundedIn || NOT_PUBLICLY_AVAILABLE,
      sourceUrl: websiteUrl,
      lastChecked: LAST_CHECKED,
    },
    {
      id: 'programs',
      labelFa: 'رشته‌ها',
      labelEn: 'Programs',
      value: programCount,
      sourceUrl: websiteUrl,
      lastChecked: LAST_CHECKED,
    },
    {
      id: 'campuses',
      labelFa: 'کمپوس‌ها',
      labelEn: 'Campuses',
      value: campuses.length || null,
      sourceUrl: websiteUrl,
      lastChecked: LAST_CHECKED,
    },
    {
      id: 'announcements',
      labelFa: 'اعلان‌ها',
      labelEn: 'Announcements',
      value: announcementsCount,
      sourceUrl: websiteUrl,
      lastChecked: LAST_CHECKED,
    },
  ];

  const practicalFacilities = [
    websiteUrl ? 'Official website available' : null,
    calendarUrl ? 'Academic calendar available' : null,
    theRankings?.listed ? 'Times Higher Education profile available' : null,
    campuses.length > 1 ? 'Multi-campus profile' : null,
    medicalSignal ? 'Health or clinical campus signal' : null,
  ].filter(Boolean);

  const displayBadges = [
    rankingSummary.status === 'listed' ? 'THE Listed' : null,
    rankingSummary.status === 'profile' ? 'THE Profile' : null,
    compactNumberLabel(programCount, null),
    campuses.length > 1 ? `${campuses.length} Campuses` : null,
    websiteUrl ? 'Official Website' : null,
    calendarUrl ? 'Academic Calendar' : null,
    medicalSignal ? 'Clinical Signal' : null,
  ].filter(Boolean).slice(0, 6);

  const missingData = [
    'QS/CWUR/URAP ranking verification',
    'Erasmus+ office and partner counts',
    'ECTS / Diploma Supplement verification',
    'USMLE-related pathway verification',
    'Accreditation and certificate program verification',
    'Hospital / clinic / practical facility count verification',
  ];

  const specialFeatureFa = medicalSignal
    ? 'در داده‌های عمومی موجود، نشانه‌هایی از فضای سلامت یا آموزش بالینی دیده می‌شود و نیازمند بررسی منبع رسمی است.'
    : programCount && programCount >= 150
      ? 'تنوع بالای برنامه‌ها این دانشگاه را برای مقایسه رشته‌ها گزینه‌ای قابل بررسی می‌کند.'
      : 'این دانشگاه برای بررسی اولیه پذیرش، برنامه‌ها و مسیرهای رسمی قابل مقایسه است.';

  const specialFeatureEn = medicalSignal
    ? 'Public profile data includes health or clinical signals that should be verified against official sources.'
    : programCount && programCount >= 150
      ? 'A broad program portfolio makes this university useful for program comparison.'
      : 'This university is suitable for an initial admission and pathway review.';

  return {
    lastChecked: LAST_CHECKED,
    theRankings,
    dataQuality: {
      confidence: theRankings?.listed ? 'high' : sources.length ? 'medium' : 'low',
      needsHumanReview: Boolean(theRankings?.dataQuality?.needsHumanReview),
      missingData: [...(theRankings?.dataQuality?.missingData || []), ...missingData],
    },
    rankingSummary,
    profileFacts: theProfileFacts,
    keyNumbers,
    practicalFacilities,
    internationalCredentials,
    displayBadges,
    specialFeatureFa,
    specialFeatureEn,
    microSummaryFa: buildUniversityNarrative(record, {
      websiteUrl,
      calendarUrl,
      campuses,
      programCount,
      medicalSignal,
      rankingSummary,
      internationalCredentials,
      theProfileFacts,
    }, true),
    microSummaryEn: buildUniversityNarrative(record, {
      websiteUrl,
      calendarUrl,
      campuses,
      programCount,
      medicalSignal,
      rankingSummary,
      internationalCredentials,
      theProfileFacts,
    }, false),
    sources,
    filters: {
      hasTheRanking: rankingSummary.status === 'listed',
      hasWorldRanking,
      hasImpactRanking,
      hasSubjectRanking,
      hasTheProfile: Boolean(theRankings?.listed),
      hasVerifiedCredentials: Boolean(internationalCredentials?.hasVerifiedCredentials),
      hasWebsite: Boolean(websiteUrl),
      hasAcademicCalendar: Boolean(calendarUrl),
      highProgramCount: Boolean(programCount && programCount >= 100),
      multiCampus: campuses.length > 1,
      medicalSignal,
      hasSourceCoverage: sources.length > 0,
    },
  };
}

export const istanbulUniversities = records.map((record) => {
  const logo = record.logo || getUniversityLogo(record.name);
  const decisionProfile = buildDecisionProfile(record);

  return {
    ...defaultInfo,
    ...record,
    slug: buildUniversitySlug(record.name),
    logo,
    logoStatus: logo ? 'matched' : 'missing',
    decisionProfile,
  };
});
