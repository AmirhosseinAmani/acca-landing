const universityLogos = [
  {
    name: "Acibadem University",
    src: "/assets/optimized/uni-acibadem.webp",
  },
  {
    name: "Istanbul Arel University",
    src: "/assets/optimized/uni-arel-96.webp",
  },
  {
    name: "Atlas University",
    src: "/assets/optimized/uni-atlas.webp",
  },
  {
    name: "Istanbul Aydin University",
    src: "/assets/optimized/uni-aydin-96.webp",
  },
  {
    name: "Bahcesehir University",
    src: "/assets/optimized/uni-bahcesehir-96.webp",
  },
  {
    name: "Biruni University",
    src: "/assets/optimized/uni-biruni.webp",
  },
  {
    name: "Istinye University",
    src: "/assets/optimized/uni-istinye.webp",
  },
  {
    name: "Nisantasi University",
    src: "/assets/optimized/uni-nisantasi-96.webp",
  },
  {
    name: "Yeditepe University",
    src: "/assets/optimized/uni-yeditepe.webp",
  },
  {
    name: "Medipol University",
    src: "/assets/optimized/uni-medipol-96.webp",
  },
  {
    name: "Istanbul Kent University",
    src: "/assets/optimized/uni-kent-96.webp",
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
                      width="96"
                      height="96"
                      className="university-logo"
                      loading={row === 0 ? 'eager' : 'lazy'}
                      decoding="async"
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
