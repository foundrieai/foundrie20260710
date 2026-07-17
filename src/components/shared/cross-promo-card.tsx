'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import type { PlatformTool } from '@/lib/platform';
import { type CrossPromo, isPromoDismissed, dismissPromo } from '@/lib/cross-promotions';

const ACCENT_HEX: Record<PlatformTool['accent'], string> = {
  gold: '#ffc400', ember: '#ff7a00', verm: '#ff3000', rose: '#ff0055', mag: '#e600c9',
};

/**
 * A contextual nudge toward another tool, surfaced at a genuine journey moment.
 * Dismissible per user; once dismissed it stays gone for that user on that
 * device. Visually matches the dashboard ProductCard so it reads as part of the
 * platform, not an advertisement bolted on.
 */
export function CrossPromoCard({ promo, className }: { promo: CrossPromo; className?: string }) {
  const { user } = useUser();
  // Start hidden so a dismissed prompt never flashes before we can read state.
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(isPromoDismissed(user?.uid, promo.id));
  }, [user?.uid, promo.id]);

  if (hidden) return null;

  const Icon = promo.tool.icon;
  const accent = ACCENT_HEX[promo.tool.accent];

  const handleDismiss = () => {
    dismissPromo(user?.uid, promo.id);
    setHidden(true);
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors duration-300 hover:border-white/25',
        className
      )}
    >
      <span className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#ffc400,#ff7a00,#ff3000,#ff0055,#e600c9)] opacity-80" />
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ background: `radial-gradient(circle at 85% 0%, ${accent}1f, transparent 46%)` }}
      />
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss suggestion"
        className="absolute right-3 top-3 z-10 grid h-7 w-7 place-items-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white/80"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative flex items-center gap-2 pr-8">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-black/30"
          style={{ color: accent }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">{promo.eyebrow}</p>
      </div>

      <h3 className="relative mt-4 text-base font-bold leading-snug text-white">{promo.headline}</h3>
      <p className="relative mt-2 text-sm leading-6 text-white/60">{promo.body}</p>

      <Link
        href={promo.tool.href}
        className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-bold"
        style={{ color: accent }}
      >
        {promo.tool.cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
