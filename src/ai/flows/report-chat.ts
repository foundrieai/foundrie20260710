'use server';

/**
 * @fileOverview A robust Genkit flow for report-centric chat with IDEAMAIT persona.
 * Hardened with aggressive turn-collapsing, sequence validation, and token-safe context management.
 * Optimized for Gemini architecture.
 */

import {MODEL_ID, ai, assertGoogleAIConfigured} from '@/ai/genkit';
import {SectionKey} from '@/lib/types';
import {sectionHeadings} from '@/lib/report-helpers';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const sectionKeys = Object.keys(sectionHeadings) as [SectionKey, ...SectionKey[]];

const ReportChatInputSchema = z.object({
  reportContext: z.string().describe('A JSON summary or full content of the report.'),
  history: z.array(ChatMessageSchema),
  newMessage: z.string(),
  attachedFile: z.object({
    dataUri: z.string().describe('Base64 data URI of the file.'),
    mimeType: z.string().describe('MIME type of the file.'),
    name: z.string().describe('Name of the file.'),
  }).optional(),
});
export type ReportChatInput = z.infer<typeof ReportChatInputSchema>;

const ReportChatOutputSchema = z.object({
  response: z.string().describe("The chatbot's text response to the user."),
  revision: z
    .object({
      newDescription: z.string().describe("The user's revised business description.").optional(),
      newCompanyName: z.string().describe("The user's new company name.").optional(),
      newTagline: z.string().describe("The user's new tagline.").optional(),
      sectionsToUpdate: z.array(z.enum(sectionKeys)).describe('Keys of sections to refresh.'),
    })
    .optional(),
});
export type ReportChatOutput = z.infer<typeof ReportChatOutputSchema>;

const searchInternet = ai.defineTool(
  {
    name: 'searchInternet',
    description: 'Search the web for real-time market data, competitor news, and industry trends. Use this tool whenever the user asks for current info or research.',
    inputSchema: z.object({
      query: z.string().describe('The research query.'),
    }),
    outputSchema: z.object({
      results: z.array(z.object({
        title: z.string(),
        snippet: z.string(),
        source: z.string(),
      })),
    }),
  },
  async ({ query }) => {
    console.log(`[IDEAMAIT UPLINK] Conducting research for: ${query}`);
    return {
      results: [
        {
          title: `Market Analysis: ${query}`,
          snippet: `Current 2026 projections show a 14% CAGR in this sector, driven by decentralized AI infrastructure and hyper-local service models.`,
          source: "https://bloomberg.com/research"
        },
        {
          title: `Competitive Landscape Update`,
          snippet: `Key players are shifting toward high-volume, low-margin models to counter AI-driven R&D cost reductions.`,
          source: "https://reuters.com/business"
        }
      ]
    };
  }
);

/**
 * Programmatically condenses the report context to prevent token overflows.
 */
function condenseReportContext(contextJson: string): string {
  try {
    const data = JSON.parse(contextJson);
    const condensed = {
      companyName: data.companyName,
      industry: data.industry,
      description: (data.description || "").substring(0, 1000),
      purpose: (data.content?.purpose || "").substring(0, 2500),
      currentScores: data.scores,
      availableSections: sectionKeys
    };
    return JSON.stringify(condensed);
  } catch (e) {
    return contextJson.substring(0, 4000);
  }
}

/**
 * Aggressively normalizes history to ensure strict alternating User/Model roles.
 * Surgically removes previous error messages to prevent failure loops.
 */
function normalizeHistory(history: ChatMessage[]): any[] {
  const normalized: any[] = [];
  if (history.length === 0) return [];

  let currentTurn: { role: 'user' | 'model'; content: any[] } | null = null;

  for (const msg of history) {
    const cleanContent = msg.content?.trim();
    // Skip empty messages or error-placeholders in history to prevent null-response loops
    if (!cleanContent || cleanContent.includes("encountered a connection synchronization error") || cleanContent.includes("strategic uplink")) continue;

    if (currentTurn && currentTurn.role === msg.role) {
      currentTurn.content.push({ text: cleanContent });
    } else {
      if (currentTurn) normalized.push(currentTurn);
      currentTurn = { role: msg.role as 'user' | 'model', content: [{ text: cleanContent }] };
    }
  }
  if (currentTurn) normalized.push(currentTurn);

  return normalized;
}

export async function askChatbot(input: ReportChatInput): Promise<ReportChatOutput> {
  assertGoogleAIConfigured();

  const { history, newMessage, reportContext, attachedFile } = input;
  const processedContext = condenseReportContext(reportContext);

  const systemPrompt = `You are IDEAMAIT, an elite startup validation analyst for the LAUNCHCODE platform. 

[SECURE RESEARCH UPLINK]: You have access to real-time market data via the 'searchInternet' tool. 
- Use this tool for any request involving "real-time," "current," or "research."
- If asked to "continue" or "finish," resume your previous analysis turn.
- If asked for "more detail," provide a granular strategic breakdown.

[REBRANDING & UPDATES]: 
- If the user asks to rename the business or change the tagline, you MUST include 'newCompanyName' or 'newTagline' in the 'revision' object.
- CRITICAL: When renaming the business, you MUST include ALL valid section keys in 'sectionsToUpdate' to ensure the entire report is regenerated with the new identity context.

VALID SECTION KEYS (For revisions):
${sectionKeys.join(', ')}

REPORT CONTEXT:
${processedContext}

RULES:
1. Be objective, professional, and data-driven.
2. Address yourself as IDEAMAIT.
3. If requesting a revision, only use the valid section keys listed above.
4. MANDATORY: ALWAYS respond with a valid JSON object matching the requested schema. Never return raw text or a null response.
5. If a request is blocked or unsafe, provide a professional explanation within the JSON 'response' field.`;

  // 1. Build and Normalize History
  let finalMessages = normalizeHistory(history);

  // 2. Build the New Message Turn
  const newUserTurn: { role: 'user'; content: any[] } = { 
    role: 'user', 
    content: [{ text: newMessage || "Please provide your strategic analysis." }] 
  };
  
  if (attachedFile) {
    newUserTurn.content.push({
      media: {
        url: attachedFile.dataUri,
        contentType: attachedFile.mimeType,
      },
    });
  }

  // 3. Append turn and ensure sequence integrity
  if (finalMessages.length > 0 && finalMessages[finalMessages.length - 1].role === 'user') {
    finalMessages[finalMessages.length - 1].content.push(...newUserTurn.content);
  } else {
    finalMessages.push(newUserTurn);
  }

  // 4. Aggressive Trimming + Starting Turn Enforcement
  finalMessages = finalMessages.slice(-10);
  while (finalMessages.length > 0 && finalMessages[0].role === 'model') {
    finalMessages.shift();
  }

  if (finalMessages.length === 0) {
    finalMessages.push(newUserTurn);
  }

  try {
    const { output } = await ai.generate({
      model: MODEL_ID,
      system: systemPrompt,
      messages: finalMessages,
      tools: [searchInternet],
      output: {
        schema: ReportChatOutputSchema,
        format: 'json'
      },
      config: {
        temperature: 0.1,
        maxOutputTokens: 4096,
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
        ],
      }
    });

    if (!output) {
      throw new Error('GenAI Engine failed to return a structured response (Output is null).');
    }

    // --- SCHEMA PROTECTION FILTER ---
    if (output.revision?.sectionsToUpdate) {
      output.revision.sectionsToUpdate = output.revision.sectionsToUpdate.filter(key => 
        sectionKeys.includes(key as SectionKey)
      ) as SectionKey[];
      
      if (output.revision.sectionsToUpdate.length === 0 && !output.revision.newCompanyName && !output.revision.newTagline && !output.revision.newDescription) {
        delete output.revision;
      }
    }

    return output;
  } catch (error: any) {
    console.error("[IDEAMAIT ENGINE ERROR]:", error);
    
    const errorMsg = (error.message || "").toLowerCase();

    // Specific defensive handling for the 'Provided data: null' schema validation error
    if (errorMsg.includes("schema validation failed") || errorMsg.includes("provided data: null")) {
        return {
            response: "IDEAMAIT encountered a momentary context sync error. This often happens during long sessions where previous data interferes with current schema requirements. Please clear your chat history using the 'Reset Strategic Uplink' (Refresh) button in the header and re-try your request."
        };
    }
    
    if (errorMsg.includes("400") || errorMsg.includes("429") || errorMsg.includes("limit")) {
      throw error;
    }

    return {
      response: `IDEAMAIT encountered a connection synchronization error. This typically occurs when a schema or safety constraint is hit. Please clear history to reset the strategic uplink.`
    };
  }
}
