import { NextResponse } from 'next/server';
import { assessActivity } from '@/ai/flows/assess-activity';
import { aiErrorResponse } from '@/ai/ai-errors';

export async function POST(request: Request) {
  try {
    const { context, taggedEvidence } = await request.json();
    const result = await assessActivity({ context, taggedEvidence });
    return NextResponse.json(result);
  } catch (error) {
    return aiErrorResponse(error, 'ideamait/assess-activity');
  }
}
