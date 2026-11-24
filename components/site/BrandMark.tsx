/**
 * Visit Rwanda Academy brand mark: a gold sun over the thousand hills, set in an
 * emerald seal. Used by the navigation, footer, loading screen and favicon.
 */
export function BrandMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Visit Rwanda Academy">
      <defs>
        <linearGradient id="vr-seal" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1a9a71" />
          <stop offset="0.55" stopColor="#12775a" />
          <stop offset="1" stopColor="#06231c" />
        </linearGradient>
        <linearGradient id="vr-gold" x1="14" y1="12" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f0d79a" />
          <stop offset="1" stopColor="#c9a44c" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="url(#vr-seal)" />
      <circle cx="24" cy="24" r="19.5" fill="none" stroke="#f0d79a" strokeOpacity="0.35" strokeWidth="0.9" />
      <circle cx="24" cy="19.5" r="5" fill="url(#vr-gold)" />
      <g stroke="#f0d79a" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.85">
        <path d="M24 9.5v2.4M15.7 12.6l1.7 1.7M32.3 12.6l-1.7 1.7M12.6 19.5h2.4M33 19.5h2.4" />
      </g>
      <path
        d="M7.5 33.5c4.2-6.4 7.2-9.6 10.1-9.6 3 0 4.6 4.6 7.1 4.6 2.6 0 4.2-6.1 7.4-6.1 2.5 0 4.6 3.2 8.4 11.1"
        fill="none"
        stroke="url(#vr-gold)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 38.2h30" stroke="#f0d79a" strokeOpacity="0.45" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
