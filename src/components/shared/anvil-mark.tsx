import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * The Foundrie anvil, on its own, in the molten gradient — for surfaces where the
 * full logo+wordmark already appears elsewhere (e.g. the nav bar) and repeating
 * it would be redundant. Inline SVG so it stays crisp at any size and needs no
 * external asset. Links home, matching <Logo />.
 */
export function AnvilMark({ className, size = 44 }: { className?: string; size?: number }) {
  return (
    <Link
      href="/"
      aria-label="Foundrie AI — home"
      className={cn('inline-flex items-center', className)}
    >
      <svg width={size} height={size} viewBox="0 0 60 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="anvil-molten" x1="2" y1="8" x2="56" y2="27" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffc400" />
            <stop offset="0.38" stopColor="#ff7a00" />
            <stop offset="0.68" stopColor="#ff0055" />
            <stop offset="1" stopColor="#e600c9" />
          </linearGradient>
        </defs>
        {/* Horn (pointed) on the left; flat working face; stepped heel on the
            right; waisted body into a flared foot. Drawn clockwise from the horn tip. */}
        <path
          d="M2 11.5 L16 8 L56 8 L56 15 L38 15 L40 22 L46 22 L46 27 L18 27 L18 22 L24 22 L26 15 L14 15 Z"
          fill="url(#anvil-molten)"
        />
      </svg>
    </Link>
  );
}
