/**
 * Resources content — single source of truth for the /resources listing.
 * Add an entry here to publish a new card; the page's search and filters are
 * fully data-driven from this file.
 */

export type ResourceAccent = 'gold' | 'ember' | 'verm' | 'rose' | 'mag';

export interface ResourceArticle {
  id: string;
  title: string;
  category: string; // primary filter bucket
  tags: string[]; // descriptive labels shown on the card
  excerpt: string;
  readTime: string;
  accent: ResourceAccent;
  href: string;
}

export const resourceCategories = ['All', 'Founders', 'Growth', 'Career', 'AI Tools', 'Branding', 'Updates'] as const;

export const resourceArticles: ResourceArticle[] = [
  {
    id: 'you-built-it-now-what',
    title: 'You Built It — Now What?',
    category: 'Founders',
    tags: ['Vibe Coding', 'Scaling', 'Technical Debt'],
    excerpt:
      'In the AI era, building a prototype has never been faster — but that speed introduces significant technical debt. Learn how to scale beyond the prototype and build a foundation that inspires investor confidence.',
    readTime: '7 min read',
    accent: 'gold',
    href: '#',
  },
  {
    id: 'accelerate-startup-growth-2026',
    title: 'How to Accelerate the Growth of Your Startup in 2026 and Beyond',
    category: 'Growth',
    tags: ['Startup Growth', 'AEO', 'Automation'],
    excerpt:
      'A definitive guide to the strategies, tools, and growth frameworks defining high-performance startups in the 2026 AI landscape — from Artificial Intelligence Engine Optimization to automating your revenue engine.',
    readTime: '12 min read',
    accent: 'ember',
    href: '#',
  },
  {
    id: 'navigating-ai-job-market-2026',
    title: 'Navigating the AI Job Market in 2026',
    category: 'Career',
    tags: ['Career', 'AI Strategy', 'Future of Work'],
    excerpt:
      'The artificial intelligence revolution is reshaping the global job market. Discover the emerging roles, the skills becoming obsolete, and the strategies to future-proof your career and position yourself as an indispensable asset.',
    readTime: '6 min read',
    accent: 'rose',
    href: '#',
  },
  {
    id: 'idea-to-mvp-founder-first',
    title: 'From Idea to MVP: The Founder-First Framework',
    category: 'Founders',
    tags: ['Founders', 'Startups', 'MVP'],
    excerpt:
      'Building a successful startup requires rigorous validation, not just a great idea. The Founder-First Framework helps you test your hypotheses and build a Minimum Viable Product that resonates with your target audience.',
    readTime: '6 min read',
    accent: 'mag',
    href: '#',
  },
  {
    id: 'prompt-engineering-fundamentals',
    title: 'Prompt Engineering Fundamentals',
    category: 'AI Tools',
    tags: ['Prompting', 'AI Tools', 'Productivity'],
    excerpt:
      'Effective communication with artificial intelligence models is becoming a critical skill across every profession. Master the fundamentals of prompt design — clarity, context, and constraints — to extract maximum value from your tools.',
    readTime: '7 min read',
    accent: 'verm',
    href: '#',
  },
  {
    id: 'professional-brand-ai-era',
    title: 'Building Your Professional Brand in the AI Era',
    category: 'Branding',
    tags: ['Branding', 'Career', 'Identity'],
    excerpt:
      'When everyone has access to the same powerful AI tools, differentiation comes from your unique perspective and authentic voice. Build a compelling professional brand that establishes you as a thought leader in your field.',
    readTime: '6 min read',
    accent: 'rose',
    href: '#',
  },
  {
    id: 'finding-founder-market-fit',
    title: 'Finding Founder-Market Fit',
    category: 'Founders',
    tags: ['Founders', 'Strategy', 'Market Fit'],
    excerpt:
      'Product-market fit gets the attention, but founder-market fit is often the unsung hero of startup success. Discover the intersection where your unique capabilities meet a significant market need.',
    readTime: 'Webinar',
    accent: 'gold',
    href: '#',
  },
  {
    id: 'more-resources-incoming',
    title: 'More Resources Incoming',
    category: 'Updates',
    tags: ['Updates', 'Platform', 'News'],
    excerpt:
      'The Foundrie AI resource library is growing — advanced playbooks, in-depth industry reports, and exclusive video content are on the way. Join the waitlist to be notified as soon as new resources arrive.',
    readTime: 'Coming soon',
    accent: 'ember',
    href: '#',
  },
];
