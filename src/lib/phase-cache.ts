/**
 * Local fallback cache for phase progress.
 *
 * Phase state is derived from the founder's own venture material, so it is
 * scoped to the signed-in user and cleared on sign-out. Without that scoping a
 * shared or kiosk machine hands one user's progress to the next person who
 * signs in. Signed-out users are never cached at all.
 */

const PREFIX = 'launchcode:';

const scopedKey = (uid: string, phase: string) => `${PREFIX}${uid}:phase:${phase}`;

/**
 * Removes the pre-scoping keys (`launchcode:phase:psf`), which were shared
 * across every user of the browser. Called on read so existing installs shed
 * the exposure without needing the user to do anything.
 */
function purgeLegacyKeys() {
  try {
    for (const phase of ['psf', 'pmf', 'gtm', 'growth', 'exit']) {
      window.localStorage.removeItem(`${PREFIX}phase:${phase}`);
    }
  } catch {
    /* Storage unavailable; nothing to purge. */
  }
}

export function readPhaseCache(uid: string | undefined, phase: string): any | null {
  purgeLegacyKeys();
  if (!uid) return null;
  try {
    const raw = window.localStorage.getItem(scopedKey(uid, phase));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    try {
      window.localStorage.removeItem(scopedKey(uid, phase));
    } catch {
      /* ignore */
    }
    return null;
  }
}

export function writePhaseCache(uid: string | undefined, phase: string, state: unknown) {
  if (!uid) return;
  try {
    window.localStorage.setItem(scopedKey(uid, phase), JSON.stringify(state));
  } catch {
    /* Quota or unavailable storage; Firestore remains the source of truth. */
  }
}

/** Drops every cached phase and handoff on sign-out, for all users on this device. */
export function clearPhaseCache() {
  try {
    const doomed: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(PREFIX)) doomed.push(key);
    }
    doomed.forEach((key) => window.localStorage.removeItem(key));
    window.sessionStorage.removeItem('foundrie:ideation:founderProfile');
  } catch {
    /* ignore */
  }
}
