'use server';

/**
 * @fileOverview This file contains the modular Genkit flows for generating a startup validation report with the IDEAMAIT persona.
 * Hard Locked to Gemini 2.5.
 * Enforcement: STRICT WHITELABEL MANDATE (Zero self-reference).
 */

import {MODEL_ID, ai, assertGoogleAIConfigured} from '@/ai/genkit';
import {Report, SectionKey} from '@/lib/types';
import {z} from 'genkit';

/**
 * Utility function to wrap AI calls in a retry loop with exponential backoff.
 * Target: Surviving 503 Service Unavailable and 429 Rate Limit spikes.
 */
async function withRetry<T>(fn: () => Promise<T>, sectionName: string, retries = 3, delay = 2000): Promise<T> {
  assertGoogleAIConfigured();

  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error.message || "";
    const isRetryable = errorMsg.includes('503') || errorMsg.includes('429') || errorMsg.includes('Service Unavailable') || errorMsg.includes('high demand');
    
    if (retries > 0 && isRetryable) {
      console.warn(`[IDEAMAIT RETRY] Section "${sectionName}" hit a service spike (${retries} left). Retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
      return withRetry(fn, sectionName, retries - 1, delay * 2);
    }
    console.error(`[IDEAMAIT FATAL] Section "${sectionName}" failed after retries or hit a non-retryable error:`, errorMsg);
    throw error;
  }
}

// 1. Flow for Company Name and Tagline
const CompanyNameAndTaglineInputSchema = z.object({
  description: z.string().describe('A detailed description of the startup idea.'),
});
const CompanyNameAndTaglineOutputSchema = z.object({
  companyName: z.string().describe('A suitable and creative name for the company.'),
  tagline: z.string().describe('A short, compelling tagline for the company.'),
});
export type CompanyNameAndTaglineOutput = z.infer<typeof CompanyNameAndTaglineOutputSchema>;

const nameAndTaglinePrompt = ai.definePrompt({
  name: 'generateNameAndTaglinePrompt',
  model: MODEL_ID,
  input: {schema: CompanyNameAndTaglineInputSchema},
  output: {schema: CompanyNameAndTaglineOutputSchema},
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are a world-class brand strategist. Given this startup: "{{description}}" - generate a brand identity. 

STRICT WHITELABEL MANDATE: Do NOT use the words "IDEAIT", "IDEAMAIT", or "LAUNCHCODE" in the name or tagline.

NAME: 1-2 syllables, avoid -ify/-ia/-ly suffixes, evoke feeling not features, favor invented words/metaphors/verbs-as-nouns, easy to say and own. 
TAGLINE: max 7 words, unified with the name, captures emotional promise not features, active/imperative voice, no clichés like empowering/seamless/AI-driven. 

Return ONLY JSON: {"companyName":"Name","tagline":"Tagline"}.`,
});

const generateNameAndTaglineFlow = ai.defineFlow(
  {
    name: 'generateNameAndTaglineFlow',
    inputSchema: CompanyNameAndTaglineInputSchema,
    outputSchema: CompanyNameAndTaglineOutputSchema,
  },
  async input => {
    return withRetry(async () => {
      const {output} = await nameAndTaglinePrompt(input);
      if (!output) {
        throw new Error('Failed to generate company name and tagline.');
      }
      return output;
    }, "Identity Generation");
  }
);

export async function generateNameAndTagline(description: string): Promise<CompanyNameAndTaglineOutput> {
  return generateNameAndTaglineFlow({description});
}

// 2. Flow for Individual Report Sections
const ReportSectionInputSchema = z.object({
  companyDescription: z.string(),
  sectionToGenerate: z.string().describe('The specific section of the report to generate.'),
  reportSoFar: z.string().optional().describe('JSON string of the report content generated so far.'),
  companyName: z.string().optional(),
  location: z.string().optional(),
});
const ReportSectionOutputSchema = z.object({
  content: z.string().describe('The generated markdown content for the specified section.'),
});
export type ReportSectionOutput = z.infer<typeof ReportSectionOutputSchema>;
export type ReportSectionInput = z.infer<typeof ReportSectionInputSchema>;

const sectionGenerationPrompt = ai.definePrompt(
  {
    name: 'generateReportSectionPrompt',
    model: MODEL_ID,
    system: `You are an elite startup validation analyst known for "Optimistic Realism." Your goal is to validate the founder's vision while ensuring business math adheres to 90th-percentile industry benchmarks, specifically accounting for the deflationary effects of AI.

    **STRICT WHITELABEL MANDATE:**
    - Zero Self-Reference: You must NEVER refer to yourself, "IDEAIT", "IDEAMAIT", or "LAUNCHCODE" within the generated report content.
    - Perspective: The report must be written from a neutral, third-party "Investment Analyst" perspective.
    - Attribution: Replace all mentions of internal AI benchmarks (e.g., "IDEAMAIT industry benchmarks") with objective phrasing such as "90th-percentile industry standards" or "standard venture capital valuation metrics."
    - Brand Isolation: Ensure that any internal branding is restricted to the UI only and never bleeds into this analytical text.

    **HYPERLOCAL INTELLIGENCE AUDIT (Surgical Rule):**
    - If a location is provided, perform a Hyperlocal Intelligence Audit. Analyze local competitor density, regional regulatory hurdles, and local economic benchmarks (COGS/Labor) to refine the Financial and Market Viability scores.
    
    **MARKET & GROWTH BRAKE:**
    - Market Size: Year 1 revenue CANNOT exceed 0.1% of the SOM.
    - Competition: If the value prop can be replicated via "vibe-coding" in <1 week, identify this as a critical risk and cap Competitive Edge at 6.0.

    **ECONOMIC ANCHOR (FINANCIALS):**
    - Efficiency: Reduce traditional R&D/Dev headcount costs by 40% to reflect AI-accelerated prototyping. Shift saved capital toward Customer Acquisition.
    - CAC Guardrail: Assume a minimum CAC consistent with the top 10% of the Industry.
    - Operational Floor: Every $1 of revenue must be supported by min $0.40 in combined COGS and OpEx.
    - Profitability: Do not show net profitability before Month 18 unless the Current Stage is "Revenue-generating".

    **CRITICAL OPERATIONAL RULES:**
    1. THE POLISHER: Extrapolate the user's idea to its most viable, scalable form.
    2. THE TEAM: If no specific founders are listed, architect the ideal strategic team structure (Founding DNA, critical hiring sequence, and board composition) required for this venture to scale.
    3. AUTHORITY: Provide hyperlinked citations to reliable online authorities.
    4. COMPLETION MARKER: Signal the end of output with [ANALYSIS_COMPLETE].`,
    input: { schema: ReportSectionInputSchema },
    output: { schema: ReportSectionOutputSchema },
    config: {
      maxOutputTokens: 8192, 
      safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      ],
    },
    prompt: `Company: {{companyName}}
    Idea: "{{companyDescription}}"
    Section: **{{sectionToGenerate}}**.

    Context from generated sections:
    {{{reportSoFar}}}

    **INSTRUCTIONS:**
    - Provide deep, evidence-informed markdown analysis using the "Optimistic Realism" persona.
    - Praise innovation in text, but use numbers to reflect harsh market discipline.
    - If user input is < 100 words, penalize Technical Feasibility by -0.5 for unknown risks.
    - Ensure ZERO mention of IDEAIT, IDEAMAIT, or LAUNCHCODE.
    - Append [ANALYSIS_COMPLETE] only when finished.`,
  }
);

const generateReportSectionFlow = ai.defineFlow(
  {
    name: 'generateReportSectionFlow',
    inputSchema: ReportSectionInputSchema,
    outputSchema: ReportSectionOutputSchema,
  },
  async (input) => {
    return withRetry(async () => {
      const { output } = await sectionGenerationPrompt(input);
      if (!output?.content) {
        throw new Error(`AI returned empty content for section: ${input.sectionToGenerate}`);
      }
      return { content: output.content.trim() };
    }, input.sectionToGenerate);
  }
);

export async function generateReportSection(input: ReportSectionInput): Promise<string> {
  const result = await generateReportSectionFlow(input);
  return result.content;
}

// 3. Flow for Continuing Truncated Sections
const ContinueSectionInputSchema = z.object({
  companyDescription: z.string(),
  sectionToGenerate: z.string(),
  companyName: z.string().optional(),
  partialContent: z.string().describe('The content that was cut off.'),
});
export type ContinueSectionInput = z.infer<typeof ContinueSectionInputSchema>;

const continueSectionPrompt = ai.definePrompt({
  name: 'continueReportSectionPrompt',
  model: MODEL_ID,
  system: `You are an investment analyst continuing a high-fidelity startup analysis as an "Optimistic Realist" VC. 
  STRICT WHITELABEL MANDATE: NEVER refer to yourself, "IDEAIT", "IDEAMAIT", or "LAUNCHCODE".`,
  input: { schema: ContinueSectionInputSchema },
  output: { schema: ReportSectionOutputSchema },
  config: {
    maxOutputTokens: 8192,
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `Section: {{sectionToGenerate}}
  Company: {{companyName}}

  Analysis so far ended here:
  """
  {{partialContent}}
  """

  Resume the analysis. End with [ANALYSIS_COMPLETE]. Ensure zero self-references.`,
});

const continueReportSectionFlow = ai.defineFlow(
  {
    name: 'continueReportSectionFlow',
    inputSchema: ContinueSectionInputSchema,
    outputSchema: ReportSectionOutputSchema,
  },
  async (input) => {
    return withRetry(async () => {
      const { output } = await continueSectionPrompt(input);
      if (!output?.content) {
        throw new Error(`AI failed to continue section: ${input.sectionToGenerate}`);
      }
      return { content: output.content.trim() };
    }, `Continuation: ${input.sectionToGenerate}`);
  }
);

export async function continueReportSection(input: ContinueSectionInput): Promise<string> {
  const result = await continueReportSectionFlow(input);
  return result.content;
}

// 4. Flow for Final Scores
const ScoringInputSchema = z.object({
  fullReportContent: z.string(),
  userInput: z.string().optional(),
});
const ScoresSchema = z.object({
  marketPotential: z.object({score: z.number().min(0).max(10), rationale: z.string()}),
  competitiveEdge: z.object({score: z.number().min(0).max(10), rationale: z.string()}),
  technicalFeasibility: z.object({score: z.number().min(0).max(10), rationale: z.string()}),
  financialViability: z.object({score: z.number().min(0).max(10), rationale: z.string()}),
});
export type ReportScores = z.infer<typeof ScoresSchema>;

const scoringPrompt = ai.definePrompt({
    name: 'generateScoresPrompt',
    model: MODEL_ID,
    system: `You are a Senior VC Analyst practicing "Optimistic Realism". Score based on the opportunity.
    STRICT WHITELABEL MANDATE: ZERO mentions of "IDEAIT", "IDEAMAIT", or "LAUNCHCODE" in rationales.`,
    input: { schema: ScoringInputSchema },
    output: { schema: ScoresSchema },
    config: {
      safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      ],
    },
    prompt: `Analyze the full report and provide weighted scores (7.5 - 9.2 for strong ideas). 
    
    Report:
    {{{fullReportContent}}}
    
    Return ONLY JSON. Ensure rationales attribute findings to neutral investment frameworks.`
});

const generateScoresFlow = ai.defineFlow(
  {
    name: 'generateScoresFlow',
    inputSchema: ScoringInputSchema,
    outputSchema: ScoresSchema,
  },
  async (input) => {
    return withRetry(async () => {
      const { output } = await scoringPrompt(input);
      if (!output) throw new Error('AI failed to generate scores.');
      return output;
    }, "Final Scoring");
  }
);

export async function generateScores(fullReportContent: Report['content'], userInput?: string): Promise<ReportScores> {
  return generateScoresFlow({ 
    fullReportContent: JSON.stringify(fullReportContent),
    userInput: userInput 
  });
}
