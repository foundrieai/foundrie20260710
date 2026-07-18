/**
 * Centralized account entitlement + admin checks.
 *
 * The "first validation free, then paid" model: every user gets one full
 * validation report free; creating additional reports and entering the
 * post-validation phases (psf→exit) requires a paid subscription.
 *
 * NOTE: this is a SOFT gate. Firestore rules let a user write their own
 * `users/{uid}` doc, so a determined user could edit `subscription` directly.
 * Tightening that (or real Stripe) is a follow-up; today there is no billing.
 *
 * ENFORCEMENT IS OFF BY DEFAULT. Because there is no checkout yet, a hard wall
 * would strand users with no way to pay. The gating logic below only bites when
 * `NEXT_PUBLIC_PLAN_GATING=on` — flip that once billing exists (and decide
 * grandfathering for existing accounts at that point).
 */

export const ADMIN_EMAILS = ['hello@thesiliconhill.com', 'robertkwilliams.dc@gmail.com'];

/** Master switch. Gating does nothing until this is turned on. */
export function isPlanGatingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PLAN_GATING === 'on';
}

type UserLike =
  | {
      email?: string | null;
      admin?: boolean;
      claims?: { admin?: boolean };
    }
  | null
  | undefined;

export function isAdminUser(user: UserLike): boolean {
  if (!user) return false;
  const email = (user.email || '').toLowerCase();
  if (ADMIN_EMAILS.includes(email)) return true;
  if (user.admin === true) return true;
  if (user.claims?.admin === true) return true;
  return false;
}

type ProfileLike =
  | {
      subscription?: 'free' | 'pro' | 'enterprise' | string;
      reportsGenerated?: number;
    }
  | null
  | undefined;

/** Paid = any non-free subscription. */
export function isPaidPlan(profile: ProfileLike): boolean {
  const sub = profile?.subscription;
  return sub === 'pro' || sub === 'enterprise';
}

/** Free users may create their first validation report but not more. */
export function canCreateReport(user: UserLike, profile: ProfileLike): boolean {
  if (!isPlanGatingEnabled()) return true;
  if (isAdminUser(user) || isPaidPlan(profile)) return true;
  return (profile?.reportsGenerated ?? 0) < 1;
}

/** Post-validation phases (psf→exit) require a paid plan. */
export function canAccessPhases(user: UserLike, profile: ProfileLike): boolean {
  if (!isPlanGatingEnabled()) return true;
  return isAdminUser(user) || isPaidPlan(profile);
}
