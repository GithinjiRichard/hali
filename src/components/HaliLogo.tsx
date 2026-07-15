/**
 * Original Hali brand mark.
 *
 * Concept: a bold, rounded "H" — for Hali — built from two ribbon strokes,
 * joined at the crossbar by a single fuel drop. The drop is the whole idea:
 * one small, ordinary thing (a drop of fuel) sitting at the center of
 * something bigger (a nation's cost of living). Warm gold on cream, or
 * gold on charcoal in dark mode — never a cold corporate blue.
 *
 * `variant="mark"` renders the icon alone (nav, favicon, app icon).
 * `variant="lockup"` renders the icon + wordmark, with an optional tagline.
 */
export function HaliMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Hali"
    >
      <rect width="48" height="48" rx="13" className="fill-accent dark:fill-accentDark" />
      {/* Left stroke of the H */}
      <path
        d="M14 10 C14 10 12 10 12 12 L12 36 C12 38 14 38 14 38 C14 38 16 38 16 36 L16 12 C16 10 14 10 14 10Z"
        fill="#FAF8F4"
        opacity="0.96"
      />
      {/* Right stroke of the H */}
      <path
        d="M34 10 C34 10 32 10 32 12 L32 36 C32 38 34 38 34 38 C34 38 36 38 36 36 L36 12 C36 10 34 10 34 10Z"
        fill="#FAF8F4"
        opacity="0.96"
      />
      {/* Crossbar */}
      <rect x="14" y="21.5" width="20" height="5" rx="2.5" fill="#FAF8F4" opacity="0.96" />
      {/* The fuel drop — the whole idea, sitting right at the center */}
      <path
        d="M24 16.5c2.6 3 4.2 5.2 4.2 7.6a4.2 4.2 0 1 1-8.4 0c0-2.4 1.6-4.6 4.2-7.6Z"
        className="fill-accent dark:fill-accentDark"
      />
    </svg>
  );
}

export default function HaliLogo({
  size = 36,
  showTagline = true,
  className = "",
}: {
  size?: number;
  showTagline?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <HaliMark size={size} />
      <div className="flex flex-col leading-tight">
        <span className="font-display font-bold text-lg tracking-tight text-ink dark:text-inkDark">
          Hali
        </span>
        {showTagline && (
          <span className="text-[10px] uppercase text-muted dark:text-mutedDark font-mono-data tracking-wider">
            East Africa &middot; Fuel &amp; Energy
          </span>
        )}
      </div>
    </div>
  );
}
