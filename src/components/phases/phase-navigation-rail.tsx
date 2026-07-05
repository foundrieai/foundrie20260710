'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const ALL_PHASES = [
  { id: 'psf', label: 'Problem-Solution', shortLabel: 'PSF', href: '/phases/psf', accent: 'var(--lc-pmf)' },
  { id: 'pmf', label: 'Product-Market', shortLabel: 'PMF', href: '/phases/pmf', accent: 'var(--lc-pmf)' },
  { id: 'gtm', label: 'Go-to-Market', shortLabel: 'GTM', href: '/phases/gtm', accent: 'var(--lc-pmf)' },
  { id: 'growth', label: 'Growth', shortLabel: 'Growth', href: '/phases/growth', accent: 'var(--lc-pmf)' },
  { id: 'exit', label: 'Maturity & Exit', shortLabel: 'Exit', href: '/phases/exit', accent: 'var(--lc-pmf)' },
];

export function PhaseNavigationRail({
  currentPhaseId,
  unlockedPhases = ['psf'],
  enableDevSkip = false
}: {
  currentPhaseId: string;
  unlockedPhases?: string[];
  enableDevSkip?: boolean;
}) {
  const currentIndex = ALL_PHASES.findIndex((phase) => phase.id === currentPhaseId);
  const effectiveUnlockedPhases = enableDevSkip
    ? ALL_PHASES.filter((phase) => phase.href !== '#').map((phase) => phase.id)
    : unlockedPhases;

  return (
    <div className="border-b border-[var(--lc-divider)] bg-[var(--lc-bg)] px-6 py-4">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-5 gap-2">
          {ALL_PHASES.map((phase, index) => {
            const isUnlocked = effectiveUnlockedPhases.includes(phase.id);
            const isActive = phase.id === currentPhaseId;
            const isComplete = isUnlocked && index < currentIndex;
            const node = (
              <div
                className={cn(
                  'flex min-h-20 flex-col items-center justify-center gap-2 rounded-[var(--lc-radius-ctrl)] border px-2 py-3 text-center transition-colors',
                  isActive && 'bg-[var(--lc-card)]',
                  !isUnlocked && 'opacity-60'
                )}
                style={{
                  borderColor: isActive ? phase.accent : isComplete ? 'var(--lc-ok-border)' : 'var(--lc-border-muted)',
                }}
              >
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border font-code text-xs',
                    isComplete && 'border-[var(--lc-ok-border)] bg-[var(--lc-ok)] text-white',
                    !isComplete && !isActive && 'border-[var(--lc-border-muted)] text-[var(--lc-text-faint)]'
                  )}
                  style={isActive ? { borderColor: phase.accent, color: phase.accent } : undefined}
                >
                  {!isUnlocked ? <Lock className="h-3.5 w-3.5" /> : isComplete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </div>
                <div>
                  <p className="font-code text-[10px] uppercase tracking-[0.12em] text-[var(--lc-text-faint)]">{phase.shortLabel}</p>
                  <p className="mt-0.5 hidden text-xs text-[var(--lc-text-muted)] sm:block">{phase.label}</p>
                </div>
              </div>
            );

            return isUnlocked && phase.href !== '#' ? (
              <Link key={phase.id} href={enableDevSkip ? `${phase.href}?dev=1` : phase.href} className="block">
                {node}
              </Link>
            ) : (
              <div key={phase.id}>{node}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
