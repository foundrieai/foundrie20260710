
import type { Timestamp } from 'firebase/firestore';

export interface Idea {
  title: string;
  tagline: string;
  problem: string;
  solution: string;
  targetMarket: string;
  revenueModel: string;
  competitiveEdge: string;
  vcAngle: string;
  peAngle: string;
  marketPotentialScore: number;
  financialViabilityScore: number;
  isBookmarked: boolean;
}

// User
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  lastLoginAt: string;
  subscription: 'free' | 'pro' | 'enterprise';
  reportsGenerated: number;
  reportsRemaining: number;
}

// Chat Message
export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

// Full Report structure for on-demand generation
export interface Report {
  id: string;
  userId: string;

  // Input
  companyName: string;
  description: string;
  industry: string;
  targetMarket?: string;
  location?: string;
  stage: 'Idea' | 'MVP' | 'Beta' | 'Revenue-generating';
  
  // Generated Content
  tagline?: string;
  executiveSummary?: string;
  isPromoted?: boolean;
  content: {
    purpose: string;
    problem: string;
    solution: string;
    whyNow: string;
    marketSize: string;
    competition: string;
    productRoadmap: string;
    businessModel: string;
    traction: string;
    team: string;
    financials: string;
    risks: string;
    actionPlan: string;
    sources: string;
  };
  scores?: {
    marketPotential: { score: number; rationale: string };
    competitiveEdge: { score: number; rationale: string };
    technicalFeasibility: { score: number; rationale: string };
    financialViability: { score: number; rationale: string };
  };

  // Metadata
  status: 'draft' | 'generating' | 'complete' | 'error';
  createdAt: string; // Using ISO string for simplicity
  updatedAt: string;
}


export type SectionKey = keyof Report['content'];

export type Industry = 'FinTech' | 'HealthTech' | 'EdTech' | 'SaaS' | 'Consumer' | 'Marketplace' | 'AI/ML' | 'Climate/Energy' | 'Other';
export const industries: Industry[] = ['FinTech', 'HealthTech', 'EdTech', 'SaaS', 'Consumer', 'Marketplace', 'AI/ML', 'Climate/Energy', 'Other'];

export type Stage = 'Idea' | 'MVP' | 'Beta' | 'Revenue-generating';
export const stages: Stage[] = ['Idea', 'MVP', 'Beta', 'Revenue-generating'];

export type EvidenceSource = 'typed' | 'pasted' | 'uploaded' | 'screenshot' | 'imported';

export type EvidenceStrength = 'weak' | 'moderate' | 'strong';

export type EvidenceSignalType = 'behavioral' | 'stated' | 'quantitative' | 'qualitative';

export interface ExtractedEvidenceMetric {
  label: string;
  value: string;
  unit?: string;
}

export interface ExtractedEvidence {
  summary: string;
  metrics: ExtractedEvidenceMetric[];
  quotes: string[];
  entities: string[];
  signalType: EvidenceSignalType;
}

export interface EvidenceTags {
  phaseId?: string;
  subPhaseId?: string;
  activityId?: string;
  milestoneId?: string;
  assumptionId?: string;
  segment?: string;
}

export interface EvidenceItem {
  id: string;
  createdAt: Timestamp;
  source: EvidenceSource;
  rawContent: string;
  storagePath?: string;
  extracted: ExtractedEvidence | null;
  tags: EvidenceTags;
  strength: EvidenceStrength;
}

export interface DecisionLogEntry {
  id: string;
  createdAt: Timestamp;
  phaseId?: string;
  title: string;
  rationale: string;
  supportingEvidenceIds: string[];
  optionsRejected: string[];
  knownRisks: string[];
  decidedBy: string;
  outcomeNote?: string;
  outcomeUpdatedAt?: Timestamp;
}
