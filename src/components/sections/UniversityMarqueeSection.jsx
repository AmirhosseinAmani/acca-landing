const universityLogos = [
  {
    name: "Acibadem University",
    src: "https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/icons/acibadem.svg",
  },
  {
    name: "Istanbul Arel University",
    src: "https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/icons/arel.png",
  },
  {
    name: "Atlas University",
    src: "https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/icons/atlas.svg",
  },
  {
    name: "Istanbul Aydin University",
    src: "https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/icons/aydin.jpg",
  },
  {
    name: "Bahcesehir University",
    src: "https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/icons/bahcesehir.png",
  },
  {
    name: "Biruni University",
    src: "https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/icons/biruni-universitesi-seeklogo.svg",
  },
  {
    name: "Istinye University",
    src: "https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/icons/istinye-universitesi-seeklogo.svg",
  },
  {
    name: "Nisantasi University",
    src: "https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/icons/Nisantasi.png",
  },
  {
    name: "Yeditepe University",
    src: "https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/icons/yeditepe-universitesi-seeklogo.svg",
  },
  {
    name: "Medipol University",
    src: "https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/icons/Medipol.png",
  },
  {
    name: "Istanbul Kent University",
    src: "https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/icons/Kent.png",
  },
];

const marqueeRows = [0, 1];

export default function UniversityMarqueeSection({ darkMode, isFa }) {
  return (
<section className="relative z-20 overflow-hidden pb-8 pt-1 sm:pt-3 lg:-mt-10 lg:pb-10">
        <div className="sr-only">
          <h2>
            {isFa ? 'دانشگاه‌های خصوصی استانبول' : 'Private Universities of Istanbul'}
          </h2>
        </div>

        <div className="logo-marquee py-3 select-none">
          <div className="logo-track">
            {marqueeRows.map((row) => (
              <div className="logo-group" key={row} aria-hidden={row === 1}>
                {universityLogos.map((uni) => (
                  <div
                    key={`${uni.name}-${row}`}
                    className={`${darkMode ? 'darkGlass' : 'glass'} university-logo-card`}
                  >
                    <img
                      src={uni.src}
                      alt={uni.name}
                      className="university-logo"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
  );
}
