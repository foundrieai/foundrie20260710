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

const FounderProfileSchema = z.object({
  coreSkills: z.array(z.string()).describe('Core Technical & Operational Skills'),
  industryExpertise: z.array(z.string()).describe('Industry Expertise & Domain Nuances'),
  unfairAdvantages: z.array(z.string()).describe('Unfair Advantages / Unique Insights derived from background'),
  summary: z.string().describe('A synthesized paragraph of their profile'),
});

export type FounderProfile = z.infer<typeof FounderProfileSchema>;

export async function isIdeationAIConfigured(): Promise<boolean> {
  return hasGoogleAIKey;
}

const extractFounderProfileFlow = ai.defineFlow(
  {
    name: 'extractFounderProfile',
    inputSchema: z.object({ profileText: z.string() }),
    outputSchema: FounderProfileSchema,
  },
  async (input) => {
    assertGoogleAIConfigured();

    const { output } = await ai.generate({
      model: MODEL_ID,
      system: `You are an elite profiling analyst for a premier venture studio. Your job is to extract a world-class founder profile from the raw context provided.`,
      prompt: `Analyze the following founder background/context:
"${input.profileText}"

Extract and output:
- Core Technical & Operational Skills
- Industry Expertise & Domain Nuances
- Unfair Advantages / Unique Insights
- A concise synthesis summary paragraph.`,
      output: { schema: FounderProfileSchema },
      config: {
        temperature: 0.3,
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }
    });

    if (!output) throw new Error('Failed to extract founder profile.');
    return output;
  }
);

export async function extractFounderProfile(input: { profileText: string }): Promise<FounderProfile> {
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

    const { output } = await ai.generate({
      model: MODEL_ID,
      system: `You are an elite B2B SaaS startup ideation engine. You specialize in generating high-potential business ideas tailored to a user's specific experience and expertise.`,
      prompt: `Your highly specific goal:
1. Review the Founder Profile below, specifically their Unfair Advantages.
2. Directly map this skillset to highly viable B2B SaaS opportunities.
3. Focus heavily on generating ideas representing industries ripe for Private Equity consolidation or that represent highly scalable models primed for regular venture capital funding.
4. Tightly bridge the user's exact background with these specific market criteria.

CREATIVITY & MOONSHOT MODIFIER:
${creativityPrompt}

Founder Profile:
${profileText}

Ensure the ideas represent uncrowded niches, systemic inefficiencies, or severe workflow bottlenecks relevant to the user's domain. Provide practical revenue models and clear VC / PE angles.

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
