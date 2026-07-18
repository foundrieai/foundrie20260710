'use client';

import { useEffect, useState } from 'react';
import { Compass, X } from 'lucide-react';
import { useUser } from '@/firebase';

const onboardingKey = (uid: string, phaseId: string) => `foundrie:onboarding:${uid}:phase-${phaseId}`;

/**
 * First-run "operator briefing" for a phase. Shown once per user per phase
 * (localStorage, foundrie: convention). Voice: confident operator-mentor —
 * direct, high-signal, respects the founder, no fluff.
 */
export function PhaseOnboarding({ phaseId, phaseName }: { phaseId: string; phaseName: string }) {
  const { user } = useUser();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;
    try {
      setShow(window.localStorage.getItem(onboardingKey(user.uid, phaseId)) !== '1');
    } catch {
      setShow(true);
    }
  }, [user, phaseId]);

  if (!show) return null;

  const dismiss = () => {
    if (user) {
      try { window.localStorage.setItem(onboardingKey(user.uid, phaseId), '1'); } catch {}
    }
    setShow(false);
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-[var(--lc-psf)]/30 bg-[var(--lc-psf)]/8 p-5 md:p-6">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss briefing"
        className="absolute right-3 top-3 text-white/40 transition-colors hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--lc-psf)]/15 text-[var(--lc-psf)]">
          <Compass className="h-5 w-5" />
        </div>
        <div className="min-w-0 pr-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--lc-psf)]">How {phaseName} works</p>
          <p className="mt-2 text-sm leading-relaxed text-white/80">
            Work the activities top to bottom. Add real evidence, let Ideamait pressure-test it, then make the founder call.
            You do not need to be perfect here — you need to be honest about what you know and what you are still guessing.
            Clear the exit milestones and the next phase unlocks. If you get stuck, I am one click away in the bottom-right.
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="mt-4 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
          >
            Got it — let us work
          </button>
        </div>
      </div>
    </div>
  );
}
