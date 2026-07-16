import type { FounderProfile } from '@/ai/flows/generate-ideation-concepts';

/**
 * Hands the founding team from Ideation to Validation. The profile is derived
 * from resumes, so it is deliberately kept in sessionStorage rather than a URL
 * or any long-lived store: it stays on the user's device, is scoped to the tab,
 * and is cleared as soon as it has been read into a report.
 */
const HANDOFF_KEY = 'foundrie:ideation:founderProfile';

export function stashFounderProfile(profile: FounderProfile) {
  try {
    window.sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(profile));
  } catch {
    /* Storage may be unavailable; the report simply falls back to an ideal team. */
  }
}

/** Reads and clears the handed-off profile. Returns null when there is none. */
export function consumeFounderProfile(): FounderProfile | null {
  try {
    const raw = window.sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(HANDOFF_KEY);
    return JSON.parse(raw) as FounderProfile;
  } catch {
    return null;
  }
}

const bullets = (label: string, items?: string[]) =>
  items?.length ? `${label}:\n${items.map((i) => `  - ${i}`).join('\n')}\n` : '';

/**
 * Renders a founder profile as the prompt-facing FOUNDING TEAM block. Returns
 * undefined when there is no profile, which is the signal to the prompt that it
 * may architect an ideal team instead.
 */
export function formatFounderContext(profile?: FounderProfile | null): string | undefined {
  if (!profile?.founders?.length) return undefined;

  const people = profile.founders
    .map((f, i) => {
      const who = f.name?.trim() || f.label || `Founder ${i + 1}`;
      return [
        `${who}${f.name?.trim() && f.label ? ` (${f.label})` : ''}`,
        f.summary ? `  ${f.summary}` : '',
        bullets('  Core skills', f.coreSkills),
        bullets('  Industry expertise', f.industryExpertise),
        bullets('  Unfair advantages', f.unfairAdvantages),
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');

  return [
    `This venture has ${profile.founders.length} founder${profile.founders.length > 1 ? 's' : ''}.`,
    '',
    people,
    '',
    profile.summary ? `Team synthesis: ${profile.summary}` : '',
    bullets('Combined unfair advantages', profile.unfairAdvantages),
    bullets('How the founders reinforce each other', profile.complementarity),
    bullets('Known capability gaps', profile.teamGaps),
  ]
    .filter(Boolean)
    .join('\n')
    .trim();
}
