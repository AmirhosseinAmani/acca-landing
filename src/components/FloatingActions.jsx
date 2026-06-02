import { Download, X } from 'lucide-react';
import { COMPANY_INSTAGRAM_URL, COMPANY_WHATSAPP_URL } from '../constants/contact';

/*
 * FloatingActions — the single shared container for every fixed/floating
 * action on the site. Centralizing them here keeps the z-index scale and the
 * on-screen positions organized (no random per-component `fixed` elements).
 *
 * Z-INDEX SCALE (documented so values stay intentional, not random):
 *   z-0    background orbs
 *   z-10   page content
 *   z-40   floating actions  ← this component (social dock + install pill)
 *   z-50   sticky nav + mobile menu
 *   z-[80] consultation modal (must sit above the floating actions)
 *
 * LAYOUT — opposite corners so nothing ever overlaps at any viewport width:
 *   • bottom-RIGHT : WhatsApp + Instagram social dock (always visible)
 *   • bottom-LEFT  : compact PWA "install" pill (only when installable)
 * Both honour iOS safe-area insets and use position:fixed (no layout shift).
 */

// lucide-react no longer ships brand glyphs, so the recognizable WhatsApp /
// Instagram marks are inlined as SVG (currentColor → inherits button text).
function WhatsAppIcon({ size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon({ size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 2.163c3.204 0 3.584.012 4.849.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.849.07-3.205 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0m0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324M12 16a4 4 0 110-8 4 4 0 010 8m6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881" />
    </svg>
  );
}

const SOCIAL_BUTTONS = [
  {
    id: 'whatsapp',
    href: COMPANY_WHATSAPP_URL,
    Icon: WhatsAppIcon,
    labelFa: 'گفتگو در واتساپ',
    labelEn: 'Chat on WhatsApp',
    // WhatsApp brand green.
    btn: 'bg-[#25D366] hover:bg-[#1ebe5d] text-white',
  },
  {
    id: 'instagram',
    href: COMPANY_INSTAGRAM_URL,
    Icon: InstagramIcon,
    labelFa: 'اینستاگرام ACCA EDU',
    labelEn: 'ACCA EDU on Instagram',
    // Instagram brand gradient.
    btn: 'bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white',
  },
];

export default function FloatingActions({
  isFa = false,
  installVisible = false,
  onInstall,
  onDismissInstall,
}) {
  // env(safe-area-inset-*) keeps the buttons clear of the iOS home indicator
  // and notch; the px fallbacks apply everywhere else. viewport-fit=cover is
  // already set in index.html so these resolve correctly.
  const rightDockStyle = {
    bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)',
    right: 'calc(env(safe-area-inset-right, 0px) + 1rem)',
  };
  const leftDockStyle = {
    bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)',
    left: 'calc(env(safe-area-inset-left, 0px) + 1rem)',
  };

  return (
    <>
      {/* Social dock — bottom-right, always visible, small/medium round buttons. */}
      <div
        className="fixed z-40 flex flex-col items-end gap-3"
        style={rightDockStyle}
      >
        {SOCIAL_BUTTONS.map(({ id, href, Icon, labelFa, labelEn, btn }) => {
          const label = isFa ? labelFa : labelEn;
          return (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className={`${btn} grid h-12 w-12 place-items-center rounded-full outline-none ring-0 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 active:scale-95 sm:h-14 sm:w-14`}
            >
              <Icon size={22} />
              <span className="sr-only">{label}</span>
            </a>
          );
        })}
      </div>

      {/* Install pill — bottom-left, compact, only when the browser allows it. */}
      {installVisible && (
        <div className="fixed z-40 max-w-[calc(100vw-7rem)]" style={leftDockStyle}>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#071A3D] py-1 pl-1 pr-1.5 text-white shadow-[0_12px_40px_rgba(7,26,61,0.3)] ring-1 ring-white/12">
            <button
              type="button"
              onClick={onInstall}
              aria-label={isFa ? 'نصب اپلیکیشن ACCA EDU' : 'Install the ACCA EDU app'}
              className="inline-flex items-center gap-2 rounded-full py-1.5 pl-1 pr-2.5 text-xs font-black outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#C6A768]"
            >
              <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-[#C6A768] text-[#071A3D]">
                <Download size={14} strokeWidth={2.6} />
              </span>
              <span className="hidden truncate sm:inline">
                {isFa ? 'نصب اپ' : 'Install app'}
              </span>
            </button>
            <button
              type="button"
              onClick={onDismissInstall}
              aria-label={isFa ? 'بستن پیشنهاد نصب' : 'Dismiss install prompt'}
              className="grid h-6 w-6 flex-none place-items-center rounded-full text-white/70 outline-none transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <X size={14} strokeWidth={2.6} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
