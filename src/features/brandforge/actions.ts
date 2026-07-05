import { z } from 'genkit';
import { ai, hasGoogleAIKey } from '@/ai/genkit';

type StrategyInput = {
  brandName?: string;
  industry?: string;
  mission?: string;
  audience?: string;
  goals?: string;
  documentBase64?: string;
  documentMimeType?: string;
};

export function fallbackStrategy(input: StrategyInput) {
  const brandName = input.brandName || 'Foundrie AI';
  const industry = input.industry || 'AI-era business tools';
  const mission = input.mission || 'help founders and professionals start something great';

  return {
    metrics: { clarity: 82, visibility: 68, authority: 74, consistency: 79 },
    positioningMoat: `${brandName} should own the space where practical execution, intelligent tooling, and premium brand trust converge for ${industry}.`,
    narrativeSynthesis: `${brandName} is strongest when it presents itself as an operating layer, not a loose toolkit. The core story should connect ambition to execution: define the opportunity, sharpen the public signal, and compound proof over time. The mission is to ${mission}, with a brand voice that feels precise, credible, and momentum-oriented.`,
    focusAreas: ['Sharper category language', 'Proof-led storytelling', 'Consistent founder voice', 'Outcome-specific content pillars'],
    authorityStrengths: ['Clear suite architecture', 'Strong founder-market relevance', 'Credible AI-era positioning'],
    visibilityGaps: ['Needs more repeatable thought leadership', 'Needs clearer proof points by audience segment'],
    roadmap: {
      days30: 'Lock category narrative, refine voice guardrails, publish proof-led founder content, and define primary conversion paths.',
      days60: 'Launch a consistent editorial cadence, build owned proof assets, and turn early outcomes into public case studies.',
      days90: 'Scale distribution partnerships, systematize platform campaigns, and measure brand-to-pipeline conversion.',
    },
    calendar: [
      {
        week: 1,
        theme: 'Category clarity',
        post1: {
          platform: 'LinkedIn',
          format: 'Founder POV',
          hook: 'The AI era does not reward scattered tools.',
          body: 'It rewards operating systems that compound better decisions.',
          cta: 'Map your next move with Foundrie AI.',
          fullDraft: 'The AI era does not reward scattered tools.\n\nIt rewards operating systems that compound better decisions.\n\nFoundrie AI is being built around that belief: one place to shape the work, the company, and the public signal behind both.\n\nMap your next move with Foundrie AI.',
        },
        post2: {
          platform: 'X',
          format: 'Thread',
          hook: 'A modern founder needs more than a template.',
          body: 'They need a loop: idea, validation, brand, proof, growth.',
          cta: 'Start forging.',
          fullDraft: 'A modern founder needs more than a template.\n\nThey need a loop:\n1. Idea\n2. Validation\n3. Brand\n4. Proof\n5. Growth\n\nThat is the Foundrie AI thesis. Start forging.',
        },
      },
      {
        week: 2,
        theme: 'Trust and proof',
        post1: {
          platform: 'LinkedIn',
          format: 'Case narrative',
          hook: 'Trust compounds when the story matches the evidence.',
          body: 'Document the proof behind every product and professional move.',
          cta: 'Build the evidence trail.',
          fullDraft: 'Trust compounds when the story matches the evidence.\n\nThe strongest builders do not just announce progress. They document what they learned, what changed, and why the next move matters.\n\nBuild the evidence trail.',
        },
        post2: {
          platform: 'Instagram',
          format: 'Carousel',
          hook: 'Brand is not decoration.',
          body: 'It is the memory system for your market.',
          cta: 'Make the signal unmistakable.',
          fullDraft: 'Brand is not decoration.\n\nIt is the memory system for your market.\n\nMake the signal unmistakable.',
        },
      },
    ],
    opportunities: [
      { id: 'opp-1', type: 'Podcast', name: 'AI Business Builders', status: 'new' },
      { id: 'opp-2', type: 'Speaking', name: 'Modern Founder Forum', status: 'new' },
      { id: 'opp-3', type: 'Partner', name: 'Innovation Hub Founder Series', status: 'new' },
    ],
  };
}

const BrandStrategySchema = z.object({
  metrics: z.object({
    clarity: z.number().min(0).max(100),
    visibility: z.number().min(0).max(100),
    authority: z.number().min(0).max(100),
    consistency: z.number().min(0).max(100),
  }),
  positioningMoat: z.string(),
  narrativeSynthesis: z.string(),
  focusAreas: z.array(z.string()),
  authorityStrengths: z.array(z.string()),
  visibilityGaps: z.array(z.string()),
  roadmap: z.object({
    days30: z.string(),
    days60: z.string(),
    days90: z.string(),
  }),
  calendar: z.array(z.object({
    week: z.union([z.string(), z.number()]),
    theme: z.string(),
    post1: z.object({
      platform: z.string(),
      format: z.string(),
      hook: z.string(),
      body: z.string(),
      cta: z.string(),
      fullDraft: z.string(),
    }),
    post2: z.object({
      platform: z.string(),
      format: z.string(),
      hook: z.string(),
      body: z.string(),
      cta: z.string(),
      fullDraft: z.string(),
    }),
  })),
  opportunities: z.array(z.object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    status: z.string(),
  })),
});

export async function generateBrandStrategy(input: StrategyInput) {
  if (!hasGoogleAIKey) return fallbackStrategy(input);
  try {
    const response = await ai.generate({
      config: { temperature: 0.35, maxOutputTokens: 4096 },
      output: { schema: BrandStrategySchema },
      system: `You are BrandForge, a premium AI brand strategy system inside Foundrie AI. Produce practical, evidence-aware brand strategy artifacts for founders, executives, companies, and professionals. Use the Foundrie voice: precise, premium, warm, direct, and execution-oriented. Avoid green as a brand cue and avoid vague marketing filler.`,
      prompt: `Create a complete BrandForge strategy artifact.

Brand/person name: ${input.brandName || 'Not provided'}
Industry/niche: ${input.industry || 'Not provided'}
Mission: ${input.mission || 'Not provided'}
Audience: ${input.audience || 'Not provided'}
Goals: ${input.goals || 'Not provided'}

Return JSON only. Metrics must be 0-100. Calendar must include at least two weeks with two fully drafted posts per week. Opportunities must be realistic partnership/media/speaking opportunities.`,
    });
    return response.output || fallbackStrategy(input);
  } catch {
    return fallbackStrategy(input);
  }
}

const VoiceSchema = z.object({
  personaTraits: z.array(z.string()),
  toneSliders: z.record(z.number()),
  styleGuide: z.string(),
  emojiUsage: z.string(),
  hashtagStrategy: z.string(),
  forbiddenTopics: z.array(z.string()),
});

export async function discoverBrandVoice(input: { url?: string; sampleText?: string }) {
  const fallback = {
    personaTraits: ['Professional', 'Innovative', 'Helpful', 'Bold'],
    toneSliders: {
      'Formal vs Casual': 38,
      'Serious vs Playful': 42,
      'Concise vs Detailed': 36,
    },
    styleGuide:
      'Use plain, confident language. Make outcomes concrete. Avoid hype, vague superlatives, and unsupported claims. Keep calls to action direct.',
    emojiUsage: 'Sparse (Max 1 per post)',
    hashtagStrategy: 'Niche & Targeted',
    forbiddenTopics: ['Legal Advice', 'Investment Advice', 'Unverified Claims', 'Confidential Roadmap'],
  };
  if (!hasGoogleAIKey) return fallback;
  try {
    const response = await ai.generate({
      config: { temperature: 0.2, maxOutputTokens: 1800 },
      output: { schema: VoiceSchema },
      system: 'You are a brand voice analyst. Infer a premium, usable brand voice system from the provided source material.',
      prompt: `Source URL, if any: ${input.url || 'None'}
Sample text, if any:
${input.sampleText || 'None'}

Return concise JSON for BrandForge. Tone slider values must be 0-100.`,
    });
    return response.output || fallback;
  } catch {
    return fallback;
  }
}

const OptimizedPostSchema = z.object({
  optimizedContent: z.string(),
  suggestions: z.array(z.string()),
  bestTime: z.string(),
});

export async function optimizeBrandPost(input: { content?: string; platforms?: string[]; brandIdentity?: any }) {
  const content = String(input.content || '').trim();
  const fallback = {
    optimizedContent: content
      ? `${content}\n\nSharper takeaway: make the signal obvious, the value concrete, and the next step unmistakable.`
      : 'Build the signal before you chase the spotlight.',
    suggestions: ['Lead with the practical outcome.', 'Use one concrete proof point.', 'Close with a specific next step.'],
    bestTime: 'Today @ 4:30 PM',
  };
  if (!hasGoogleAIKey) return fallback;
  try {
    const response = await ai.generate({
      config: { temperature: 0.35, maxOutputTokens: 1200 },
      output: { schema: OptimizedPostSchema },
      system: 'You are BrandForge content intelligence. Improve social copy without making unsupported claims. Keep the voice premium, concise, and Foundrie-aligned.',
      prompt: `Original content:
${content}

Platforms: ${(input.platforms || []).join(', ') || 'General'}
Brand identity: ${JSON.stringify(input.brandIdentity || {})}

Return optimized content, 3 suggestions, and a best time string.`,
    });
    return response.output || fallback;
  } catch {
    return fallback;
  }
}

const DraftReplySchema = z.object({
  primaryDraft: z.string(),
  alternates: z.array(z.string()),
  toneAnalysis: z.string(),
  riskFlags: z.array(z.string()),
});

export async function draftBrandReply(input: { inboxItem?: any; brandGuide?: any }) {
  const author = input.inboxItem?.author?.displayName || 'there';
  const fallback = {
    primaryDraft: `Thanks, ${author}. That is exactly the sequence we recommend: sharpen the brand signal while the business evidence is being built, so the market can understand both what is changing and why it matters.`,
    alternates: [
      `Appreciate this, ${author}. The strongest path is usually to make validation and brand-building reinforce each other instead of treating them as separate workstreams.`,
      `Great question, ${author}. I would start with one clear customer problem, validate it with evidence, then turn that evidence into public trust through consistent brand execution.`,
    ],
    toneAnalysis: 'Credible, warm, concise',
    riskFlags: ['Low risk'],
  };
  if (!hasGoogleAIKey) return fallback;
  try {
    const response = await ai.generate({
      config: { temperature: 0.3, maxOutputTokens: 1400 },
      output: { schema: DraftReplySchema },
      system: 'You are BrandForge Inbox Copilot. Draft short, safe, on-brand replies. Do not provide legal, financial, medical, or investment advice.',
      prompt: `Inbox item:
${JSON.stringify(input.inboxItem || {})}

Brand guide:
${JSON.stringify(input.brandGuide || {})}

Return a primary reply, two alternates, tone analysis, and risk flags.`,
    });
    return response.output || fallback;
  } catch {
    return fallback;
  }
}
