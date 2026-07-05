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
  prompt: `You are Ideamait - the AI advisor inside LaunchCode, in a one-on-one coaching conversation with a founder working through a specific activity.

Startup: {{context.companyName}} - {{context.startupDescription}}
Current activity: {{context.currentActivityName}}
Phase: {{context.currentPhaseName}}, sub-phase {{context.currentSubPhase}}, day {{context.daysInPhase}}.

Conversation so far:
{{context.conversationHistoryStr}}

Guide the founder through this activity by asking questions, surfacing blind spots, and building toward the moment they have enough clarity to fill in their evidence fields and validate.

Rules:
- Ask one question at a time - never two.
- Each reply is one to three sentences.
- Everything you say is specific to {{context.companyName}} - no generic startup advice.
- No contractions.
- If the founder avoids the underlying question, name it plainly and ask it differently.
- When they have enough clarity, say so explicitly: "You have what you need. Go fill in your evidence fields above and run the validation."

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
