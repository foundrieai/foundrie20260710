'use client';

import { cn } from '@/lib/utils';

/**
 * The platform's "AI is working" indicator: a molten flame that flickers while a
 * request is in flight. Deliberately unmissable so a user never wonders whether
 * their click registered (and never double-fires a billable AI call). Respects
 * prefers-reduced-motion.
 */
export function ProcessingFlame({
  label,
  sublabel,
  size = 'md',
  className,
}: {
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const px = size === 'sm' ? 20 : size === 'lg' ? 56 : 34;
  return (
    <div className={cn('flex items-center gap-3', className)} role="status" aria-live="polite">
      <Flame px={px} />
      {(label || sublabel) && (
        <div className="min-w-0">
          {label && (
            <p className="flex items-center gap-1 text-sm font-semibold text-white">
              <span>{label}</span>
              <span className="flame-dots inline-flex">
                <span className="animate-[flameDots_1.4s_ease-in-out_infinite]">.</span>
                <span className="animate-[flameDots_1.4s_ease-in-out_infinite] [animation-delay:0.2s]">.</span>
                <span className="animate-[flameDots_1.4s_ease-in-out_infinite] [animation-delay:0.4s]">.</span>
              </span>
            </p>
          )}
          {sublabel && <p className="mt-0.5 text-xs text-white/55">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}

function Flame({ px }: { px: number }) {
  const id = 'flame-grad';
  return (
    <svg width={px} height={px} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id={id} x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffc400" />
          <stop offset="0.4" stopColor="#ff7a00" />
          <stop offset="0.72" stopColor="#ff0055" />
          <stop offset="1" stopColor="#e600c9" />
        </linearGradient>
        <radialGradient id="flame-core-grad" cx="16" cy="22" r="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff7d6" />
          <stop offset="1" stopColor="#ffb300" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Outer flame body */}
      <path
        className="flame-outer"
        d="M16 2c1.6 4.2-1.2 6.6-3.2 9.2-2 2.6-3.6 5-3.6 8.3C9.2 25.4 12.2 29 16 29s6.8-3.4 6.8-9.2c0-2.6-1-4.4-2.4-6.2-.7 1.3-1.7 2-2.9 2.2 1.6-3 1.4-7-1.5-14z"
        fill={`url(#${id})`}
      />
      {/* Inner bright core */}
      <path
        className="flame-core"
        d="M16 15c1.1 2.2 2.6 3.6 2.6 6.2 0 2.9-1.4 4.8-2.6 4.8s-2.6-1.6-2.6-4.5c0-2.2 1.1-3.9 2.6-6.5z"
        fill="url(#flame-core-grad)"
      />
    </svg>
  );
}
