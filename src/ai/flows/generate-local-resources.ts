'use server';

/**
 * @fileOverview Generates a founder's LOCAL startup ecosystem resources
 * (incubators, grants, government programs, communities, advisors) for a given
 * geography, tailored to their venture and industry.
 */

import { ai, assertGoogleAIConfigured } from '@/ai/genkit';
import { z } from 'genkit';

const LocalResourcesInputSchema = z.object({
  location: z.string().describe('Founder location, e.g. "Austin, TX", "London, UK", or "Remote".'),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  startupDescription: z.string().optional(),
});
export type LocalResourcesInput = z.infer<typeof LocalResourcesInputSchema>;

const ResourceItemSchema = z.object({
  name: z.string().describe('Name of the organization or program.'),
  description: z.string().describe('One or two sentences: what it offers and why it is relevant to this founder.'),
  url: z.string().optional().describe('Official website if you are confident it is correct; omit rather than guess.'),
});

const LocalResourcesOutputSchema = z.object({
  location: z.string(),
  categories: z.array(
    z.object({
      category: z.string().describe('e.g. "Incubators & Accelerators", "Grants & Non-Dilutive Funding", "Government Programs", "Communities & Meetups", "Legal & Accounting", "Universities & Research".'),
      items: z.array(ResourceItemSchema),
    })
  ),
});
export type LocalResourcesOutput = z.infer<typeof LocalResourcesOutputSchema>;

export async function generateLocalResources(input: LocalResourcesInput): Promise<LocalResourcesOutput> {
  return generateLocalResourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLocalResourcesPrompt',
  input: { schema: LocalResourcesInputSchema },
  output: { schema: LocalResourcesOutputSchema },
  prompt: `You are a startup ecosystem researcher helping a founder find REAL, locally relevant resources to build their company.

Founder location: {{location}}
Company: {{companyName}}
Industry: {{industry}}
Venture: {{startupDescription}}

Produce a practical, specific list of startup-building resources for this location, grouped into these categories (include a category only when you have real entries for it):
- Incubators & Accelerators
- Grants & Non-Dilutive Funding
- Government Programs (SBA, SBDC, SCORE, and state/city economic development)
- Communities & Meetups
- Legal & Accounting / Advisors
- Universities & Research

Rules:
- Prefer well-established, verifiable organizations. National programs that exist everywhere (SBA, SBDC, SCORE) should be localized to the founder's state or city when possible.
- If the location is "Remote", unclear, or not provided, focus on top national and online programs that are usable from anywhere, and say so.
- Do NOT invent organizations. If you are unsure a specific local org exists, describe the type of resource and how to find it instead of fabricating a name. Omit the url whenever you are not confident it is correct.
- Tailor picks to the industry when relevant (hardware vs. SaaS vs. biotech vs. consumer).
- Three to six items per category is plenty. Be concrete and immediately useful.`,
});

const generateLocalResourcesFlow = ai.defineFlow(
  {
    name: 'generateLocalResourcesFlow',
    inputSchema: LocalResourcesInputSchema,
    outputSchema: LocalResourcesOutputSchema,
  },
  async (input) => {
    assertGoogleAIConfigured();
    const { output } = await prompt(input);
    if (!output?.categories) {
      throw new Error('Local resource generation failed.');
    }
    return output;
  }
);
