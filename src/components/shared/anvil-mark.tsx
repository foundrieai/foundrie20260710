import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const ANVIL_URL = 'https://thesiliconhill.com/wp-content/uploads/2026/07/FOUNDRIE_Logo_Anvil_v03a.png';

/**
 * The Foundrie anvil, on its own — for surfaces where the full logo+wordmark
 * already appears elsewhere (e.g. the nav bar) and repeating it would be
 * redundant. Uses the brand anvil artwork; links home, matching <Logo />.
 */
export function AnvilMark({ className, size = 44 }: { className?: string; size?: number }) {
  return (
    <Link
      href="/"
      aria-label="Foundrie AI — home"
      className={cn('inline-flex items-center', className)}
    >
      <Image
        src={ANVIL_URL}
        alt="Foundrie AI"
        width={200}
        height={160}
        priority
        className="w-auto object-contain"
        style={{ height: size }}
      />
    </Link>
  );
}
