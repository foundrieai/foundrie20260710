'use server';

import { MODEL_ID, ai, assertGoogleAIConfigured } from '@/ai/genkit';
import { z } from 'genkit';

const ideamaitConversationSchema = z.object({
  context: z.any(),
});

export async function ideamaitConversation(input: z.infer<typeof ideamaitConversationSchema>): Promise<string> {
  return ideamaitConversationFlow(input);
}

const conversationPrompt = ai.definePrompt({
  name: 'ideamaitConversationPrompt',
  model: MODEL_ID,
  input: { schema: ideamaitConversationSchema },
  output: { format: 'text' },
  config: {
    temperature: 0.7,
  },
  prompt: `You are Ideamait, the AI advisor across the Foundrie AI platform (LaunchCode for building companies, Resumait for careers, BrandForge for brand). You are in a one-on-one conversation with a user who is currently working in: {{context.currentPhaseName}}.

Context:
- Who: {{context.companyName}} - {{context.startupDescription}}
- Where they are now: {{context.currentActivityName}}

Conversation so far:
{{context.conversationHistoryStr}}

Help them make real progress on whatever they are working on right now, in this area. When they are in a LaunchCode phase, guide them toward the clarity to fill in their evidence and validate. When they are in another tool or on the dashboard, help them with that tool's job (sharpening a resume, shaping a brand, deciding their next move).

Rules:
- Ask one question at a time - never two.
- Each reply is one to three sentences.
- Be specific to their situation - no generic advice.
- No contractions.
- Confident operator-mentor voice: direct, high-signal, respects their time.
- If they avoid the underlying question, name it plainly and ask it differently.

Return only the text of your next message. No preamble.`,
});

const ideamaitConversationFlow = ai.defineFlow(
  {
    name: 'ideamaitConversation',
    inputSchema: ideamaitConversationSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    assertGoogleAIConfigured();

    const formattedInput = {
      context: {
        ...input.context,
        conversationHistoryStr: (input.context.conversationHistory || [])
          .map((msg: any) => `${msg.role === 'agent' ? 'Ideamait' : 'Founder'}: ${msg.content}`)
          .join('\n'),
      }
    };
    const { text } = await conversationPrompt(formattedInput);
    if (!text) {
      throw new Error("Conversation failed");
    }
    return text;
  }
);
