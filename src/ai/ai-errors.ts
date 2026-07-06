import { NextResponse } from 'next/server';

/**
 * Maps raw AI/Genkit errors to production-safe, user-facing messages and HTTP
 * statuses. Keeps internal details (stack traces, provider errors) out of the
 * response while still logging them server-side.
 */
export interface AIErrorInfo {
  status: number;
  code: string;
  message: string;
}

export function classifyAIError(error: unknown): AIErrorInfo {
  const raw = error instanceof Error ? error.message : String(error ?? '');
  const msg = raw.toLowerCase();

  if (msg.includes('api key') || msg.includes('api_key') || msg.includes('not configured') || msg.includes('permission_denied')) {
    return {
      status: 503,
      code: 'ai_unconfigured',
      message: 'Foundrie AI is temporarily unavailable. Please try again shortly.',
    };
  }
  if (msg.includes('quota') || msg.includes('rate limit') || msg.includes('rate-limit') || msg.includes('resource_exhausted') || msg.includes('429')) {
    return {
      status: 429,
      code: 'ai_rate_limited',
      message: 'Foundrie AI is handling high demand right now. Please try again in a moment.',
    };
  }
  if (msg.includes('safety') || msg.includes('blocked') || msg.includes('recitation')) {
    return {
      status: 422,
      code: 'ai_blocked',
      message: 'This request could not be processed. Please adjust your input and try again.',
    };
  }
  if (msg.includes('deadline') || msg.includes('timeout') || msg.includes('timed out') || msg.includes('504')) {
    return {
      status: 504,
      code: 'ai_timeout',
      message: 'This is taking longer than expected. Please try again.',
    };
  }
  return {
    status: 500,
    code: 'ai_error',
    message: 'Something went wrong while generating this. Please try again.',
  };
}

/** Build a JSON error response for an AI route and log the underlying cause. */
export function aiErrorResponse(error: unknown, logLabel: string): NextResponse {
  const info = classifyAIError(error);
  console.error(`[AI] ${logLabel} (${info.code}):`, error instanceof Error ? error.message : error);
  return NextResponse.json({ error: info.message, code: info.code }, { status: info.status });
}
