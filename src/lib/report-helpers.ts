import { SectionKey, Report } from './types';

export const sectionHeadings: Record<SectionKey, string> = {
  purpose: 'Company Purpose',
  problem: 'Problem',
  solution: 'Solution',
  whyNow: 'Why Now',
  marketSize: 'Market Size',
  competition: 'Competition & Differentiation',
  productRoadmap: 'Product & Roadmap',
  businessModel: 'Business Model & Go-to-Market',
  traction: 'Traction & Metrics',
  team: 'Team',
  financials: 'Financial Projections & Funding Plan',
  risks: 'Risks & Mitigation',
  actionPlan: 'Action Plan',
  sources: 'Research Sources',
};

export const scoreCategories = {
  marketPotential: { label: 'Market Potential', weight: 30 },
  competitiveEdge: { label: 'Competitive Edge', weight: 25 },
  technicalFeasibility: { label: 'Technical Feasibility', weight: 20 },
  financialViability: { label: 'Financial Viability', weight: 25 },
};

export const businessQuotes = [
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Ideas are easy. Implementation is hard.", author: "Guy Kawasaki" },
  { text: "Your most unhappy customers are your greatest source of learning.", author: "Bill Gates" },
  { text: "Risk comes from not knowing what you're doing.", author: "Warren Buffett" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Chase the vision, not the money; the money will end up following you.", author: "Tony Hsieh" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "Business opportunities are like buses, there's always another one coming.", author: "Richard Branson" },
];

export const progressMessages: Record<string, string> = {
  purpose: "Defining the core 'Why' behind your venture...",
  problem: "Quantifying the pain points in the current market...",
  solution: "Engineering the 'Polished' version of your solution...",
  whyNow: "Analyzing timing, market tailwinds, and catalyst events...",
  marketSize: "Synthesizing TAM/SAM/SOM from global data points...",
  competition: "Mapping the competitive landscape and finding your MOAT...",
  productRoadmap: "Sequencing the path from MVP to market dominance...",
  businessModel: "Constructing high-margin revenue frameworks...",
  traction: "Defining the metrics that matter for your first check...",
  team: "Identifying critical talent gaps and hiring priorities...",
  financials: "Modeling conservative and aggressive growth scenarios...",
  risks: "Performing a black-swan stress test on your assumptions...",
  actionPlan: "Drafting the 90-day execution blueprint...",
  sources: "Verifying research against evidence-informed data...",
  scores: "Finalizing your Venture Validation Score...",
};

/**
 * Calculates the weighted overall score for a report based on its individual category scores.
 * @param scores The scores object from the report.
 * @returns A number between 0 and 10, or 0 if scores are missing.
 */
export function calculateOverallScore(scores?: Report['scores']): number {
  if (!scores) return 0;

  const weightedSum = 
    (scores.marketPotential?.score || 0) * (scoreCategories.marketPotential.weight / 100) +
    (scores.competitiveEdge?.score || 0) * (scoreCategories.competitiveEdge.weight / 100) +
    (scores.technicalFeasibility?.score || 0) * (scoreCategories.technicalFeasibility.weight / 100) +
    (scores.financialViability?.score || 0) * (scoreCategories.financialViability.weight / 100);

  return weightedSum;
}
