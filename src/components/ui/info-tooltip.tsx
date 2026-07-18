'use client';

import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Shared hover help-icon. `position="corner"` (default) pins it to a card's
 * top-right (the original resume-optimizer usage); `position="inline"` sits it
 * next to a label. Extracted from the copies in resume-optimizer-page and
 * keyword-checklist so LaunchCode and other surfaces can reuse one component.
 */
export function InfoTooltip({
  text,
  className,
  position = 'corner',
}: {
  text: string;
  className?: string;
  position?: 'corner' | 'inline';
}) {
  return (
    <span
      className={cn(
        'group z-50',
        position === 'corner' ? 'absolute top-4 right-4' : 'relative inline-flex align-middle',
        className
      )}
    >
      <HelpCircle className="h-4 w-4 shrink-0 cursor-help text-zinc-500 transition-colors hover:text-zinc-200" />
      <span className="absolute right-0 top-6 z-[100] hidden w-72 whitespace-normal break-words rounded-xl border border-white/10 bg-zinc-900 p-4 text-[11px] font-medium normal-case leading-relaxed tracking-normal text-zinc-100 shadow-2xl animate-in fade-in zoom-in duration-200 group-hover:block">
        {text}
      </span>
    </span>
  );
}
