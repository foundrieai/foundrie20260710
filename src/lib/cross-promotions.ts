import type { PlatformTool } from './platform';
import { brandForgeTool, launchCodeTool, resumaitTool } from './platform';

/**
 * Platform-wide cross-promotion. As a user works inside one tool, they are
 * nudged toward the tool that becomes relevant at that exact moment — always at
 * a genuine journey point, never as blanket advertising. LaunchCode and Resumait
 * are the flagships; BrandForge is the bridge, so most nudges flow toward it.
 */
export interface CrossPromo {
  /** Stable id used for per-user dismissal tracking. Never reuse across moments. */
  id: string;
  /** The tool being suggested. Drives name, href, cta, accent, and icon. */
  tool: PlatformTool;
  eyebrow: string;
  headline: string;
  body: string;
}

/**
 * LaunchCode execution phases → BrandForge. Only the phases where visibility and
 * reputation genuinely matter (go-to-market onward); the earlier build phases
 * stay focused and carry no nudge.
 */
export const PHASE_CROSS_PROMOS: Record<string, CrossPromo | undefined> = {
  gtm: {
    id: 'lc-gtm-brandforge',
    tool: brandForgeTool,
    eyebrow: 'Bridge to BrandForge',
    headline: 'Going to market is a visibility problem, not only a sales problem.',
    body: 'As you launch, BrandForge builds the positioning, narrative, and publishing cadence that make the right buyers and investors find you — and take you seriously.',
  },
  growth: {
    id: 'lc-growth-brandforge',
    tool: brandForgeTool,
    eyebrow: 'Bridge to BrandForge',
    headline: 'Scaling rewards the companies people already know.',
    body: 'As you grow, BrandForge turns traction into authority — a deliberate presence engine that compounds your reputation while you stay focused on the business.',
  },
  exit: {
    id: 'lc-exit-brandforge',
    tool: brandForgeTool,
    eyebrow: 'Bridge to BrandForge',
    headline: 'Your next act starts with your name.',
    body: 'Exit-ready founders carry their reputation forward. BrandForge builds the personal and company brand that opens the next door — whatever it turns out to be.',
  },
};

/** Resumait, once a resume is optimized → BrandForge (the career-to-brand bridge). */
export const RESUMAIT_BRANDFORGE_PROMO: CrossPromo = {
  id: 'resumait-brandforge',
  tool: brandForgeTool,
  eyebrow: 'Bridge to BrandForge',
  headline: 'A sharp resume wins the room you are in. A brand fills the room.',
  body: 'Your resume is polished — now extend it into a presence that brings the next opportunity to you. BrandForge builds the personal brand around the career you just engineered.',
};

// ---------------------------------------------------------------------------
// Per-user dismissal. Scoped to the signed-in user and cleared on sign-out, so
// one person's dismissals never suppress prompts for the next user on a shared
// machine. Mirrors the convention in phase-cache.ts.
// ---------------------------------------------------------------------------

const DISMISS_PREFIX = 'foundrie:crosspromo:';
const dismissKey = (uid: string, id: string) => `${DISMISS_PREFIX}${uid}:${id}`;

export function isPromoDismissed(uid: string | undefined, id: string): boolean {
  if (!uid) return false;
  try {
    return window.localStorage.getItem(dismissKey(uid, id)) === '1';
  } catch {
    return false;
  }
}

export function dismissPromo(uid: string | undefined, id: string) {
  if (!uid) return;
  try {
    window.localStorage.setItem(dismissKey(uid, id), '1');
  } catch {
    /* Storage unavailable; the prompt simply reappears next session. */
  }
}

/** Drops every cross-promo dismissal on this device. Called on sign-out. */
export function clearCrossPromoDismissals() {
  try {
    const doomed: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(DISMISS_PREFIX)) doomed.push(key);
    }
    doomed.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    /* ignore */
  }
}

// Referenced so the flagships stay imported for future flagship-to-flagship
// nudges (e.g. Resumait → LaunchCode for entrepreneurial users).
export const CROSS_PROMO_TOOLS = { launchCodeTool, resumaitTool, brandForgeTool };
