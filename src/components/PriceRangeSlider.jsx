export default function PriceRangeSlider({
  value,
  bounds,
  onChange,
  darkMode,
  isFa,
  label,
  minLabel,
  maxLabel,
  clearLabel,
  currencyLabel = 'USD',
  className = '',
}) {
  const safeBounds = normalizeBounds(bounds);
  const disabled = safeBounds.max <= safeBounds.min;
  const currentMin = disabled ? 0 : clampNumber(toNumber(value?.min, safeBounds.min), safeBounds.min, safeBounds.max);
  const currentMax = disabled ? 0 : clampNumber(toNumber(value?.max, safeBounds.max), safeBounds.min, safeBounds.max);
  const minValue = Math.min(currentMin, currentMax);
  const maxValue = Math.max(currentMin, currentMax);
  const minPercent = disabled ? 0 : ((minValue - safeBounds.min) / (safeBounds.max - safeBounds.min)) * 100;
  const maxPercent = disabled ? 100 : ((maxValue - safeBounds.min) / (safeBounds.max - safeBounds.min)) * 100;
  const step = getStep(safeBounds);

  const updateMin = (nextValue) => {
    if (disabled) return;
    const nextMin = clampNumber(Number(nextValue), safeBounds.min, maxValue);
    onChange({ min: nextMin, max: maxValue });
  };

  const updateMax = (nextValue) => {
    if (disabled) return;
    const nextMax = clampNumber(Number(nextValue), minValue, safeBounds.max);
    onChange({ min: minValue, max: nextMax });
  };

  const resetRange = () => {
    onChange({ min: '', max: '' });
  };

  return (
    <div
      data-price-range-control
      className={`${className} ${darkMode ? 'bg-white/8 border-white/10' : 'bg-white/85 border-black/10'} rounded-[22px] border p-4`}
    >
      <style>{`
        .acca-price-range input[type='range'] {
          pointer-events: none;
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          height: 28px;
        }
        .acca-price-range input[type='range']::-webkit-slider-thumb {
          pointer-events: auto;
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border: 0;
          border-radius: 9999px;
          background: transparent;
          box-shadow: none;
          cursor: grab;
        }
        .acca-price-range input[type='range']:active::-webkit-slider-thumb {
          cursor: grabbing;
        }
        .acca-price-range input[type='range']::-moz-range-thumb {
          pointer-events: auto;
          width: 28px;
          height: 28px;
          border: 0;
          border-radius: 9999px;
          background: transparent;
          box-shadow: none;
          cursor: grab;
        }
        .acca-price-range input[type='range']:active::-moz-range-thumb {
          cursor: grabbing;
        }
        .acca-price-range input[type='range']::-webkit-slider-runnable-track {
          background: transparent;
          border: 0;
        }
      `}</style>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className={`${darkMode ? 'text-white/45' : 'text-black/45'} text-xs font-black uppercase tracking-[0.13em]`}>
            {label}
          </div>
          <div className="mt-1 text-sm font-black text-emerald-500">
            {disabled
              ? '-'
              : `${formatMoney(minValue, isFa, currencyLabel)} - ${formatMoney(maxValue, isFa, currencyLabel)}`}
          </div>
        </div>

        <button
          type="button"
          onClick={resetRange}
          disabled={disabled}
          className={`${darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'} rounded-full px-3 py-2 text-xs font-black opacity-60 transition hover:opacity-100 disabled:pointer-events-none disabled:opacity-25`}
        >
          {clearLabel}
        </button>
      </div>

      <div className="acca-price-range relative h-9" dir="ltr">
        <div className={`${darkMode ? 'bg-white/12' : 'bg-black/10'} absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full`} />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-emerald-500"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
        {!disabled && (
          <>
            <div
              aria-hidden="true"
              data-price-range-thumb="min"
              className="pointer-events-none absolute top-1/2 z-40 h-[21px] w-[21px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-emerald-500 shadow-[0_8px_24px_rgba(16,185,129,0.35)]"
              style={{ left: `${minPercent}%` }}
            />
            <div
              aria-hidden="true"
              data-price-range-thumb="max"
              className="pointer-events-none absolute top-1/2 z-40 h-[21px] w-[21px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-emerald-500 shadow-[0_8px_24px_rgba(16,185,129,0.35)]"
              style={{ left: `${maxPercent}%` }}
            />
          </>
        )}
        <input
          aria-label={minLabel}
          type="range"
          min={safeBounds.min}
          max={safeBounds.max}
          step={step}
          value={minValue}
          onChange={(event) => updateMin(event.target.value)}
          disabled={disabled}
          className="absolute inset-x-0 top-1/2 z-20 w-full -translate-y-1/2"
        />
        <input
          aria-label={maxLabel}
          type="range"
          min={safeBounds.min}
          max={safeBounds.max}
          step={step}
          value={maxValue}
          onChange={(event) => updateMax(event.target.value)}
          disabled={disabled}
          className="absolute inset-x-0 top-1/2 z-30 w-full -translate-y-1/2"
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2" dir={isFa ? 'rtl' : 'ltr'}>
        <label className="block">
          <span className={`${darkMode ? 'text-white/42' : 'text-black/42'} mb-2 block text-xs font-black`}>
            {minLabel}
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={disabled ? '' : Math.round(minValue)}
            min={safeBounds.min}
            max={safeBounds.max}
            step={step}
            onChange={(event) => updateMin(event.target.value)}
            disabled={disabled}
            className={`${darkMode ? 'bg-white/8 border-white/10 text-white' : 'bg-white border-black/10 text-black'} h-11 w-full rounded-[16px] border px-3 text-sm font-black outline-none disabled:opacity-40`}
            dir="ltr"
          />
        </label>

        <label className="block">
          <span className={`${darkMode ? 'text-white/42' : 'text-black/42'} mb-2 block text-xs font-black`}>
            {maxLabel}
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={disabled ? '' : Math.round(maxValue)}
            min={safeBounds.min}
            max={safeBounds.max}
            step={step}
            onChange={(event) => updateMax(event.target.value)}
            disabled={disabled}
            className={`${darkMode ? 'bg-white/8 border-white/10 text-white' : 'bg-white border-black/10 text-black'} h-11 w-full rounded-[16px] border px-3 text-sm font-black outline-none disabled:opacity-40`}
            dir="ltr"
          />
        </label>
      </div>
    </div>
  );
}

function normalizeBounds(bounds) {
  const min = Number(bounds?.min);
  const max = Number(bounds?.max);

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: 0, max: 0 };
  }

  return min <= max ? { min, max } : { min: max, max: min };
}

function toNumber(value, fallback) {
  if (value === '' || value === null || typeof value === 'undefined') return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function getStep(bounds) {
  const distance = Math.abs(bounds.max - bounds.min);
  if (distance >= 10000) return 100;
  if (distance >= 1000) return 50;
  if (distance >= 100) return 10;
  return 1;
}

function formatMoney(value, isFa, currencyLabel) {
  const formatted = new Intl.NumberFormat(isFa ? 'fa-IR' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(value);

  return currencyLabel ? `${formatted} ${currencyLabel}` : formatted;
}