import { useState } from 'react';
import { Star } from 'lucide-react';

/** Minimal 5-star control. Interactive when `onRate` is provided, otherwise a
 *  read-only display (supports half-filled average via `value` like 4.3). */
export default function StarRating({
  value = 0,
  onRate,
  size = 30,
  darkMode = false,
  readOnly = false,
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  const interactive = !readOnly && typeof onRate === 'function';

  return (
    <div
      className="inline-flex items-center gap-1.5"
      onMouseLeave={() => interactive && setHover(0)}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`${value} / 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, shown - (n - 1))); // 0..1 for partial
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHover(n)}
            onClick={() => interactive && onRate(n)}
            aria-label={`${n}`}
            className={`relative grid place-items-center transition ${
              interactive ? 'cursor-pointer hover:scale-110 active:scale-90' : 'cursor-default'
            }`}
          >
            {/* empty base */}
            <Star size={size} strokeWidth={1.5} className={darkMode ? 'text-white/25' : 'text-black/15'} />
            {/* filled overlay, clipped for partial averages */}
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} strokeWidth={1.5} className="fill-[#C6A768] text-[#C6A768]" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
