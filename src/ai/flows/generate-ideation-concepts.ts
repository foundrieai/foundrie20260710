'use server';

import { MODEL_ID, ai, assertGoogleAIConfigured, hasGoogleAIKey } from '@/ai/genkit';
import { z } from 'genkit';

const IdeationConceptSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  problem: z.string(),
  solution: z.string(),
  targetMarket: z.string(),
  revenueModel: z.string(),
  competitiveEdge: z.string(),
  vcAngle: z.string(),
  peAngle: z.string(),
  marketPotentialScore: z.number().min(1).max(10).describe('1-10 scale'),
  financialViabilityScore: z.number().min(1).max(10).describe('1-10 scale'),
});

const IdeationOutputSchema = z.array(IdeationConceptSchema);

export type IdeationConcept = z.infer<typeof IdeationConceptSchema>;

// One entry per founder. The model must never merge or omit a founder, so each
// founder in the input gets their own breakdown here, in input order.
const FounderBreakdownSchema = z.object({
  label: z.string().describe('Which founder this describes, matching the input delimiter exactly, e.g. "Founder 2"'),
  name: z.string().describe('The founder name if their material states it; otherwise an empty string'),
  coreSkills: z.array(z.string()).describe('This founder only: Core Technical & Operational Skills'),
  industryExpertise: z.array(z.string()).describe('This founder only: Industry Expertise & Domain Nuances'),
  unfairAdvantages: z.array(z.string()).describe('This founder only: Unfair Advantages / Unique Insights'),
  summary: z.string().describe('A concise synthesis of this founder alone'),
});

const FounderProfileSchema = z.object({
  founders: z.array(FounderBreakdownSchema).describe('Exactly one entry per founder in the input, in order. Never merge or omit a founder.'),
  // The remaining fields are team-level: the union/synthesis across every founder.
  coreSkills: z.array(z.string()).describe('Team-level: combined Core Technical & Operational Skills across all founders'),
  industryExpertise: z.array(z.string()).describe('Team-level: combined Industry Expertise & Domain Nuances across all founders'),
  unfairAdvantages: z.array(z.string()).describe('Team-level: combined Unfair Advantages / Unique Insights across all founders'),
  summary: z.string().describe('A synthesis of the founding team as a whole, explicitly accounting for every founder'),
  complementarity: z.array(z.string()).describe('How the founders reinforce each other. Empty array when there is only one founder.'),
  teamGaps: z.array(z.string()).describe('Capability gaps the team does not cover, relevant to hiring or co-founder search'),
});

export type FounderBreakdown = z.infer<typeof FounderBreakdownSchema>;
export type FounderProfile = z.infer<typeof FounderProfileSchema>;

export async function isIdeationAIConfigured(): Promise<boolean> {
  return hasGoogleAIKey;
}

const extractFounderProfileFlow = ai.defineFlow(
  {
    name: 'extractFounderProfile',
    inputSchema: z.object({
      profileText: z.string(),
      founderCount: z.number().min(1).describe('How many founders are present in profileText'),
    }),
    outputSchema: FounderProfileSchema,
  },
  async (input) => {
    assertGoogleAIConfigured();

    const isTeam = input.founderCount > 1;

    const { output } = await ai.generate({
      model: MODEL_ID,
      system: `You are an elite profiling analyst for a premier venture studio. You profile founding teams. You never conflate one founder with another, and you never let the first or most detailed founder crowd out the rest.`,
      prompt: `You are analyzing a founding team of exactly ${input.founderCount} founder${isTeam ? 's' : ''}.
Each founder's material appears below, delimited by a line of the form "--- Founder N Profile ---".

FOUNDER MATERIAL:
"""
${input.profileText}
"""

Mandatory rules:
1. The "founders" array MUST contain exactly ${input.founderCount} entr${isTeam ? 'ies' : 'y'} — one per delimiter, in the same order. Never merge two founders into one entry, and never omit a founder, even if their material is thin or overlaps heavily with another founder's.
2. Each entry must be derived ONLY from that founder's own delimited section. Do not attribute one founder's skills, employers, or advantages to another.
3. Set "label" to the delimiter's founder (for example "Founder 2"). Set "name" to that person's name if their material states it, otherwise an empty string.
4. If a founder's section is thin, still produce their entry and reflect only what it actually supports. Do not invent detail.
${isTeam
  ? `5. The team-level fields (coreSkills, industryExpertise, unfairAdvantages, summary) must synthesize ACROSS ALL ${input.founderCount} founders — not just the first or the most detailed one. The "summary" must explicitly account for what EACH founder contributes to the team.
6. "complementarity" must explain how these specific founders reinforce one another.
7. "teamGaps" must name capabilities this team collectively lacks.`
  : `5. The team-level fields restate this single founder's profile. Return an empty "complementarity" array.
6. "teamGaps" must name capabilities this solo founder lacks and would need to hire for or find a co-founder for.`}`,
      output: { schema: FounderProfileSchema },
      config: {
        temperature: 0.3,
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }
    });

    if (!output) throw new Error('Failed to extract founder profile.');
    // Guard the contract the UI depends on: a report that silently drops a
    // founder is worse than a visible failure, so surface it instead.
    if (output.founders.length !== input.founderCount) {
      throw new Error(
        `The profile analysis covered ${output.founders.length} of ${input.founderCount} founders. Please try again.`
      );
    }
    return output;
  }
);

export async function extractFounderProfile(input: { profileText: string; founderCount: number }): Promise<FounderProfile> {
  return extractFounderProfileFlow(input);
}

const generateIdeationConceptsFlow = ai.defineFlow(
  {
    name: 'generateIdeationConcepts',
    inputSchema: z.object({ 
      founderProfile: FounderProfileSchema, 
      creativityLevel: z.number().min(1).max(5).describe('1=Low (Safe), 3=Balanced, 5=Visionary/Moonshot') 
    }),
    outputSchema: IdeationOutputSchema,
  },
  async (input) => {
    assertGoogleAIConfigured();

    let temperature = 0.7;
    let creativityPrompt = "";

    if (input.creativityLevel === 1) {
      temperature = 0.2;
      creativityPrompt = "Stay safe. Focus on obvious horizontal pain points and standard B2B SaaS models that require minimal market education.";
    } else if (input.creativityLevel === 2) {
      temperature = 0.4;
      creativityPrompt = "Stay practical. Focus on clear, validated B2B SaaS solutions within the founder's explicit domain.";
    } else if (input.creativityLevel === 3) {
      temperature = 0.7;
      creativityPrompt = "Balanced creativity. Seek uncrowded niches and systemic inefficiencies that bridge the founder's expertise with adjacent domains.";
    } else if (input.creativityLevel === 4) {
      temperature = 0.9;
      creativityPrompt = "High creativity. Explore non-obvious cross-domain combinations and deep technical moats. Push the boundaries of the founder's unfair advantage.";
    } else {
      temperature = 1.0;
      creativityPrompt = "Visionary Moonshot. Devise category-defining, audacious B2B opportunities that aggressively leverage the founder's unfair advantages to disrupt stagnant industries. Seek blue-ocean strategies.";
    }

    const profileText = JSON.stringify(input.founderProfile, null, 2);
    const founderCount = input.founderProfile.founders?.length ?? 1;
    const isTeam = founderCount > 1;

    const { output } = await ai.generate({
      model: MODEL_ID,
      system: `You are an elite B2B SaaS startup ideation engine. You generate high-potential business ideas tailored to the specific experience and expertise of a founding team.`,
      prompt: `Your highly specific goal:
1. Review the Founder Profile below, specifically the Unfair Advantages.
2. Directly map this skillset to highly viable B2B SaaS opportunities.
3. Focus heavily on generating ideas representing industries ripe for Private Equity consolidation or that represent highly scalable models primed for regular venture capital funding.
4. Tightly bridge the founders' exact background with these specific market criteria.
${isTeam
  ? `5. This is a founding TEAM of ${founderCount} founders. Every idea must draw on the COMBINED team, not one founder alone. Prefer ideas that are credible precisely because these founders are together — where one founder's domain access meets another's technical or operational strength. Across the set of 5 ideas, every founder's background must be meaningfully used at least once.`
  : `5. This is a solo founder. Every idea must be credible for this founder to start alone.`}

CREATIVITY & MOONSHOT MODIFIER:
${creativityPrompt}

Founder Profile${isTeam ? ` (team of ${founderCount}; "founders" holds each founder individually, and the top-level fields are the team synthesis)` : ''}:
${profileText}

Ensure the ideas represent uncrowded niches, systemic inefficiencies, or severe workflow bottlenecks relevant to the ${isTeam ? "team's combined domains" : "founder's domain"}. Provide practical revenue models and clear VC / PE angles.

Return exactly 5 ideas in the specified JSON array format.`,
      output: { schema: IdeationOutputSchema },
      config: {
        temperature: temperature,
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        ],
      }
    });

    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error('AI failed to generate ideation concepts.');
    }
    return output;
  }
);

export async function generateIdeationConcepts(input: { founderProfile: FounderProfile, creativityLevel: number }): Promise<IdeationConcept[]> {
  return generateIdeationConceptsFlow(input);
}
