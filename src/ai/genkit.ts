import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const apiKey =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.GOOGLE_GENAI_API_KEY;

export const MODEL_ID = process.env.GEMINI_MODEL_ID || 'googleai/gemini-2.5-flash';
export const hasGoogleAIKey = !!apiKey;

export function assertGoogleAIConfigured() {
  if (!hasGoogleAIKey) {
    throw new Error('Gemini API key is missing. Add GEMINI_API_KEY, GOOGLE_API_KEY, or GOOGLE_GENAI_API_KEY to run AI generation locally.');
  }
}

export const ai = genkit({
  plugins: apiKey ? [googleAI({ apiKey })] : [],
  model: MODEL_ID,
});
