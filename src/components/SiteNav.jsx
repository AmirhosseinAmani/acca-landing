import { ArrowLeft } from 'lucide-react';
import { MAIN_NAV, goBack } from '../lib/navigation';

/** Shared cross-navigation for the main content pages
 *  (Blog · Universities · Programs). Hidden below `lg`. */
export function MainNav({ active, isFa, darkMode }) {
  return (
    <nav
      aria-label={isFa ? 'پیمایش اصلی' : 'Main navigation'}
      className="hidden items-center gap-1 text-sm font-black lg:flex"
    >
      {MAIN_NAV.map((item) => {
        const isActive = active === item.key;
        return (
          <a
            key={item.key}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`${
              isActive
                ? darkMode
                  ? 'bg-white/10 text-white'
                  : 'bg-[#071A3D]/[0.06] text-[#071A3D]'
                : darkMode
                  ? 'text-white/70 hover:text-white'
                  : 'text-black/60 hover:text-black'
            } whitespace-nowrap rounded-full px-3.5 py-2 transition`}
          >
            {isFa ? item.fa : item.en}
          </a>
        );
      })}
    </nav>
  );
}

/** Smart "Back" button — returns to the exact previous in-site page. */
export function BackButton({ fallback = '/', isFa, darkMode, className = '' }) {
  return (
    <button
      type="button"
      onClick={() => goBack(fallback)}
      aria-label={isFa ? 'بازگشت به صفحه قبل' : 'Back to previous page'}
      className={`${
        darkMode ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-black/5 text-black hover:bg-black/10'
      } inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black transition active:scale-95 sm:text-sm ${className}`}
    >
      <ArrowLeft size={16} className={isFa ? 'rotate-180' : ''} />
      {isFa ? 'بازگشت' : 'Back'}
    </button>
  );
}
