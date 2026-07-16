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
  founderContext: z.string().optional().describe('The real founding team, formatted for the prompt. Absent when the user never supplied founder material.'),
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
    2. THE TEAM:
       - When a FOUNDING TEAM section is supplied below, it describes the REAL founders of this venture, drawn from their own resumes and profiles. You MUST ground the Team section in those actual people: address each founder individually, assess how their real skills, industry expertise, and unfair advantages fit THIS specific venture, name the concrete gaps the team does not cover, and give the resulting hiring sequence. Never ignore a supplied founder, and never replace real founders with a generic archetype. Where a founder's background materially strengthens or weakens the venture, say so plainly and let it inform the analysis in other sections too.
       - Only when NO founding team is supplied may you architect the ideal strategic team structure (Founding DNA, critical hiring sequence, and board composition) required for this venture to scale.
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
{{#if founderContext}}

    **FOUNDING TEAM (the real founders of this venture — use these actual people, do not invent a team):**
    {{{founderContext}}}
{{/if}}

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
  founderContext: z.string().optional().describe('The real founding team, so a continuation does not lose them mid-section.'),
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
{{#if founderContext}}

  **FOUNDING TEAM (the real founders — keep grounding the analysis in these actual people):**
  {{{founderContext}}}
{{/if}}

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
  userInput: z.string().optional().describe("The founder's own words. This, not the polished analysis, is what is being scored."),
  founderContext: z.string().optional().describe('The real founding team, where supplied.'),
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
    system: `You are a Senior VC Analyst scoring a venture at investment committee. You are respected because your scores discriminate: a founder can tell from your number alone whether they have something real. Inflated scores are a failure of your job, because they cost founders years pursuing ideas you should have flagged.

    STRICT WHITELABEL MANDATE: ZERO mentions of "IDEAIT", "IDEAMAIT", or "LAUNCHCODE" in rationales.

    **CALIBRATION (binding):**
    - 9.0-10.0: Exceptional. Rare. Reserved for a genuinely category-defining opportunity with evidence behind it. Most portfolios contain none of these.
    - 7.0-8.9: Strong. A clear, differentiated opportunity with real evidence.
    - 5.0-6.9: Median. THE TYPICAL SUBMISSION LANDS HERE. A plausible idea whose advantage or evidence is unproven.
    - 3.0-4.9: Weak. A material flaw in the market, the moat, the economics, or the feasibility.
    - 0.0-2.9: Fatally flawed. No viable path as described.

    **ANTI-INFLATION RULES (binding):**
    1. SCORE THE FOUNDER'S ACTUAL SUBMISSION, NOT THE ANALYSIS. The report you are given was written to extrapolate the idea to its most viable form. That polish is the analyst's work, not the founder's evidence, and it MUST NOT raise the score. Where the report asserts strength the founder's own input does not support, score the founder's input.
    2. Absence of evidence is not evidence. Unproven demand, an unvalidated moat, or an untested assumption caps the affected dimension at 6.9 regardless of how compelling the concept reads.
    3. A thin or vague submission cannot score above 6.0 on dimensions it fails to address. You cannot infer strength the founder never demonstrated.
    4. Do not cluster. The four dimensions measure different things and should rarely be within 0.5 of each other. If they are, you have not discriminated.
    5. Never round toward optimism. When torn between two scores, take the lower and explain the gap that would close it.

    **RATIONALE REQUIREMENTS:**
    - Every rationale must name the SPECIFIC weakness or gap that held the score down, in plain language.
    - Every rationale must then name the CONCRETE, achievable action that would raise the score, and what it would raise it to.
    - Be direct about problems and constructive about the path. Never praise to cushion a low score, and never soften the number itself. A founder reading a 4.5 should understand exactly why and exactly what to do next.`,
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
    prompt: `Score this venture against the binding calibration and anti-inflation rules.
{{#if userInput}}

    **THE FOUNDER'S ACTUAL SUBMISSION — THIS IS WHAT YOU ARE SCORING:**
    """
    {{{userInput}}}
    """
{{/if}}
{{#if founderContext}}

    **FOUNDING TEAM:**
    {{{founderContext}}}
{{/if}}

    **THE ANALYST'S REPORT — CONTEXT ONLY.** This was written to extrapolate the idea to its most viable form. Use it to understand the opportunity and the market. Its optimism is NOT evidence and MUST NOT raise the score{{#if userInput}}; where it outruns the founder's submission above, score the submission{{/if}}:
    """
    {{{fullReportContent}}}
    """

    Before returning, verify each score against the calibration band and confirm you have not clustered the four dimensions. Remember that the median submission scores 5.0-6.9.

    Return ONLY JSON. Each rationale must name the specific gap that held the score down and the concrete action that would raise it. Attribute findings to neutral investment frameworks.`
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

export async function generateScores(
  fullReportContent: Report['content'],
  userInput?: string,
  founderContext?: string
): Promise<ReportScores> {
  return generateScoresFlow({
    fullReportContent: JSON.stringify(fullReportContent),
    userInput,
    founderContext,
  });
}
