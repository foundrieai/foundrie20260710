import type { LucideIcon } from 'lucide-react';
import { BadgeCheck, BriefcaseBusiness, Building2, Flame, Layers3, Palette, Rocket, ScrollText, Sparkles, UserRoundCheck } from 'lucide-react';

export type PlatformToolStatus = 'live' | 'placeholder' | 'incoming';

export interface PlatformTool {
  name: string;
  suite: 'Company' | 'Career' | 'Platform';
  status: PlatformToolStatus;
  label: string;
  href: string;
  cta: string;
  description: string;
  accent: 'gold' | 'ember' | 'verm' | 'rose' | 'mag';
  icon: LucideIcon;
}

export interface PlatformSuite {
  name: 'Company' | 'Career';
  href: string;
  kicker: string;
  headline: string;
  description: string;
  icon: LucideIcon;
  tools: PlatformTool[];
}

export const launchCodeTool: PlatformTool = {
  name: 'LaunchCode',
  suite: 'Company',
  status: 'live',
  label: 'Company flagship',
  href: '/company/launchcode',
  cta: 'Enter LaunchCode',
  description:
    'The evidence-first founder operating system for ideation, validation, and execution from raw idea to fundable company.',
  accent: 'ember',
  icon: Rocket,
};

export const resumaitTool: PlatformTool = {
  name: 'Resumait',
  suite: 'Career',
  status: 'live',
  label: 'Career flagship',
  href: '/career/resumait',
  cta: 'Enter Resumait',
  description:
    'An ATS optimization engine that parses the target role, scores fit, rewrites with discipline, and exports polished career materials.',
  accent: 'mag',
  icon: ScrollText,
};

export const brandForgeTool: PlatformTool = {
  name: 'BrandForge',
  suite: 'Platform',
  status: 'live',
  label: 'Cross-suite brand system',
  href: '/brandforge',
  cta: 'Enter BrandForge',
  description:
    'A presence-and-reputation engine that learns voice, builds strategy, drafts content, manages engagement, and turns brand into a strategic asset.',
  accent: 'rose',
  icon: Palette,
};

export const platformSuites: PlatformSuite[] = [
  {
    name: 'Company',
    href: '/company',
    kicker: 'Company Suite',
    headline: 'Build the company from first spark to funded scale.',
    description:
      'The Company suite is for founders and the organizations that back them. It replaces scattered advice, half-finished templates, and premature optimism with a single evidence-first path from raw idea to fundable company.',
    icon: Building2,
    tools: [launchCodeTool, brandForgeTool],
  },
  {
    name: 'Career',
    href: '/career',
    kicker: 'Career Suite',
    headline: 'Engineer the career and reputation behind the work.',
    description:
      'The Career suite is for jobseekers, professionals, executives, and teams building authority. Resumait helps win the opportunity in front of you. BrandForge builds the presence that brings the next opportunity to you.',
    icon: BriefcaseBusiness,
    tools: [resumaitTool, brandForgeTool],
  },
];

export const platformTools: PlatformTool[] = [
  launchCodeTool,
  {
    name: 'Ideamait',
    suite: 'Company',
    status: 'live',
    label: 'AI advisor',
    href: '/phases/psf',
    cta: 'Open phase coach',
    description:
      'The embedded advisor inside LaunchCode, guiding founders through evidence, decisions, and phase-by-phase execution.',
    accent: 'gold',
    icon: Sparkles,
  },
  {
    name: 'Program Mode',
    suite: 'Company',
    status: 'placeholder',
    label: 'Cohort layer',
    href: '/company',
    cta: 'View Company Suite',
    description:
      'A future operating layer for accelerators, incubators, universities, and venture programs running entire founder cohorts.',
    accent: 'verm',
    icon: Layers3,
  },
  brandForgeTool,
  resumaitTool,
];

export const platformStats = [
  { value: '02', label: 'Primary suites', detail: 'Career and Company' },
  { value: '03', label: 'Flagship tools', detail: 'LaunchCode, Resumait, BrandForge' },
  { value: '05', label: 'LaunchCode phases', detail: 'From first spark to scale' },
  { value: '01', label: 'Shared foundry', detail: 'One platform architecture' },
];

export const companyJourney = [
  {
    phase: '01',
    title: 'Ideate',
    description: 'Turn raw founder context into sharper startup concepts.',
    icon: Flame,
  },
  {
    phase: '02',
    title: 'Validate',
    description: 'Pressure-test the opportunity before building too much too soon.',
    icon: BadgeCheck,
  },
  {
    phase: '03',
    title: 'Fit',
    description: 'Move through Problem-Solution Fit, Product-Market Fit, and Go-to-Market Fit.',
    icon: UserRoundCheck,
  },
  {
    phase: '04',
    title: 'Scale',
    description: 'Instrument growth, refine the model, and prepare the company for capital and expansion.',
    icon: Rocket,
  },
];
