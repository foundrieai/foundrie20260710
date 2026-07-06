/**
 * Pricing configuration — the single source of truth for the /pricing page.
 *
 * Everything the page renders (tabs, toggle, featured card, CTA labels, prices,
 * and features) is driven by this file. To revise pricing once the cost model
 * lands, edit ONLY the values here — no layout or markup changes required.
 *
 * NOTE: All prices below are PLACEHOLDERS pending the finalized cost model.
 */

export type BillingCycle = 'monthly' | 'annual';

export interface PricingCTA {
  label: string;
  href: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  /** Numeric monthly price in USD. null when the plan is custom or one-time. */
  monthly: number | null;
  /** Numeric annual TOTAL in USD. null when custom/one-time. */
  annual: number | null;
  /** Display string used instead of a number, e.g. "Custom", "$5,000", "From $10,000". */
  customLabel?: string;
  /** Unit shown beside a custom price, e.g. "per cohort". */
  unit?: string;
  /** Whether the Monthly/Annual toggle changes this plan's displayed price. */
  cycleAware: boolean;
  features: string[];
  cta: PricingCTA;
  /** Optional ribbon, e.g. "Best Value", "Most popular". */
  badge?: string;
  /** Visually highlight this plan as the recommended option. */
  featured?: boolean;
}

export interface PricingTab {
  id: string;
  label: string;
  blurb: string;
  plans: PricingPlan[];
}

export const ANNUAL_DISCOUNT_LABEL = 'Save ~20%';

const GET_STARTED = '/signup';
const CONTACT = '/connect';

export const pricingTabs: PricingTab[] = [
  {
    id: 'individuals',
    label: 'Individuals',
    blurb: 'For jobseekers, founders, and builders working solo.',
    plans: [
      {
        id: 'free',
        name: 'Free',
        tagline: 'Explore Foundrie',
        monthly: 0,
        annual: 0,
        cycleAware: false,
        features: [
          'Limited access across Resumait, LaunchCode, and BrandEngine',
          'One active workspace',
          'Community resources and guides',
        ],
        cta: { label: 'Get started', href: GET_STARTED },
      },
      {
        id: 'career',
        name: 'Career',
        tagline: 'Land your next role',
        monthly: 19,
        annual: 180,
        cycleAware: true,
        features: [
          'Full Resumait resume optimization',
          'Ideamait career guidance',
          'Application and job tracker',
        ],
        cta: { label: 'Get started', href: GET_STARTED },
      },
      {
        id: 'builder',
        name: 'Builder',
        tagline: 'Validate your startup',
        monthly: 39,
        annual: 390,
        cycleAware: true,
        features: [
          'LaunchCode workspaces',
          'Evidence-based validation reports',
          'Phase-by-phase execution roadmap',
        ],
        cta: { label: 'Get started', href: GET_STARTED },
      },
      {
        id: 'pro',
        name: 'Pro',
        tagline: 'Company, brand & career',
        monthly: 69,
        annual: 690,
        cycleAware: true,
        features: [
          'Everything in Career and Builder',
          'Full BrandEngine access',
          'Priority AI processing',
        ],
        cta: { label: 'Start free trial', href: GET_STARTED },
        badge: 'Best Value',
        featured: true,
      },
    ],
  },
  {
    id: 'teams',
    label: 'Teams',
    blurb: 'For startups and organizations building together.',
    plans: [
      {
        id: 'team',
        name: 'Team',
        tagline: 'Startups & small teams',
        monthly: 199,
        annual: 1910,
        cycleAware: true,
        features: [
          '3 seats included',
          'Shared workspaces',
          'Approval workflows',
        ],
        cta: { label: 'Start free trial', href: GET_STARTED },
        badge: 'Most popular',
        featured: true,
      },
      {
        id: 'growth-team',
        name: 'Growth Team',
        tagline: 'Growing organizations',
        monthly: 499,
        annual: 4790,
        cycleAware: true,
        features: [
          '10 seats included',
          'Team analytics and reporting',
          'Role-based permissions',
          'Priority support',
        ],
        cta: { label: 'Book a demo', href: CONTACT },
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        tagline: 'Large organizations',
        monthly: null,
        annual: null,
        customLabel: 'Custom',
        cycleAware: false,
        features: [
          'SSO and admin controls',
          'Security review',
          'Dedicated support',
        ],
        cta: { label: 'Contact sales', href: CONTACT },
      },
    ],
  },
  {
    id: 'programs',
    label: 'Programs & Enterprise',
    blurb: 'For accelerators, incubators, universities, and workforce organizations.',
    plans: [
      {
        id: 'pilot-cohort',
        name: 'Pilot Cohort',
        tagline: 'Launch partners',
        monthly: null,
        annual: null,
        customLabel: '$5,000',
        unit: 'per cohort',
        cycleAware: false,
        features: [
          '8-week program',
          'Up to 25 participants',
          'Admin dashboard',
        ],
        cta: { label: 'Talk to us', href: CONTACT },
        badge: 'Best for launch partners',
        featured: true,
      },
      {
        id: 'standard-cohort',
        name: 'Standard Cohort',
        tagline: 'Incubators & universities',
        monthly: null,
        annual: null,
        customLabel: 'From $10,000',
        unit: 'per cohort',
        cycleAware: false,
        features: [
          '12-week program',
          'Up to 25 participants',
          'Cohort analytics',
        ],
        cta: { label: 'Talk to us', href: CONTACT },
      },
      {
        id: 'annual-partner',
        name: 'Annual Partner',
        tagline: 'Institutions & workforce orgs',
        monthly: null,
        annual: null,
        customLabel: 'Custom',
        cycleAware: false,
        features: [
          'Multiple cohorts per year',
          'Institution-wide reporting',
          'Dedicated support',
        ],
        cta: { label: 'Contact us', href: CONTACT },
      },
    ],
  },
];

/** Resolve the price strings to render for a plan under the current billing cycle. */
export function resolvePrice(plan: PricingPlan, cycle: BillingCycle): { amount: string; period: string; note?: string } {
  if (plan.customLabel) {
    return { amount: plan.customLabel, period: plan.unit ?? '' };
  }
  if (plan.monthly === 0) {
    return { amount: '$0', period: 'forever' };
  }
  if (!plan.cycleAware || cycle === 'monthly') {
    return { amount: `$${plan.monthly}`, period: '/mo' };
  }
  const perMonth = plan.annual != null ? Math.round(plan.annual / 12) : plan.monthly;
  return { amount: `$${plan.annual}`, period: '/yr', note: `≈ $${perMonth}/mo, billed annually` };
}
