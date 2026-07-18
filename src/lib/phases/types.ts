export interface PhaseData {
  id: string;
  journeyPosition: number;
  journeyTotal: number;
  name: string;
  accentColor: string;
  tagline: string;
  subPhases: string[];
}

export interface ActivityData {
  id: string;
  title?: string;
  subtitle: string;
  learnMore: string;
  evidenceFields: Array<{
    id: string;
    label: string;
    type: 'text' | 'number' | 'textarea';
    placeholder?: string;
    unit?: string;
  }>;
  ideamaitOpening: string;
  secondaryAction: {
    label: string;
    promptText: string;
  };
}

export interface DeliverableData {
  id: string;
  title: string;
  description: string;
  linkedTool?: string;
  linkedToolLabel?: string;
}

export interface MilestoneData {
  id: string;
  label: string;
  target: string;
}

export interface PitfallData {
  severity: 'critical' | 'warning' | 'watch';
  text: string;
}

export interface FundingData {
  label: string;
  amount: string;
}

export interface SubPhaseData {
  id: string;
  label: string;
  activities: ActivityData[];
  deliverables: DeliverableData[];
  exitMilestones: MilestoneData[];
  pitfalls: PitfallData[];
  funding: FundingData[];
  teamShape: string[];
}

export interface FullPhaseData extends PhaseData {
  subPhasesData: SubPhaseData[];
}

export interface IdeamaitContext {
  companyName: string;
  startupDescription: string;
  reportScores?: {
    marketPotential?: number;
    competitiveEdge?: number;
    technicalFeasibility?: number;
    financialViability?: number;
    overall?: number;
  };
  currentPhase: string;
  currentSubPhase: string;
  currentPhaseName: string;
  daysInPhase: number;
  activitiesCompleted: string[];
  activitiesRemaining: string[];
  deliverablesCompleted: string[];
  deliverablesRemaining: string[];
  milestonesMet: string[];
  milestonesRemaining: string[];
  overallProgressPct: number;
  currentActivityName?: string;
  currentActivityEvidence?: Record<string, string | number>;
  conversationHistory?: Array<{ role: 'agent' | 'founder'; content: string }>;
  latestFounderOsMetrics?: any;
  location?: string;
  industry?: string;
}

export type ActivityAssessmentSignal = 'insufficient' | 'weak' | 'developing' | 'strong';

export interface ActivityAssessment {
  signal: ActivityAssessmentSignal;
  confidence: number;
  rationale: string;
  gaps: string[];
  recommendedStatus: 'keep-gathering' | 'ready-to-accept';
  assessedAt?: any;
}

export type FounderDecision = 'accepted' | 'still-testing' | 'overridden' | null;

export type ActivityAuditEvent = 'evidence-added' | 'assessed' | 'accepted' | 'still-testing' | 'overridden' | 'reopened';

export interface ActivityAuditTrailEntry {
  at: any;
  event: ActivityAuditEvent;
  detail: string;
}

export interface ActivityState {
  evidence?: Record<string, string | number>;
  evidenceIds?: string[];
  status?: string;
  validationResult?: any;
  conversation?: Array<{ role: 'agent' | 'founder'; content: string }>;
  aiAssessment?: ActivityAssessment | null;
  founderDecision?: FounderDecision;
  isOverride?: boolean;
  auditTrail?: ActivityAuditTrailEntry[];
}
