import { NextResponse } from 'next/server';
import { ideamaitPhaseCoach } from '@/ai/flows/ideamait-phase-coach';
import { aiErrorResponse } from '@/ai/ai-errors';

export async function POST(request: Request) {
  try {
    const { context } = await request.json();
    const response = await ideamaitPhaseCoach({ context });
    return NextResponse.json({ response });
  } catch (error) {
    return aiErrorResponse(error, 'ideamait/phase-coach');
  }
}
