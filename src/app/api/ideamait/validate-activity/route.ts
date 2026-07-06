import { NextResponse } from 'next/server';
import { ideamaitValidateActivity } from '@/ai/flows/ideamait-validate-activity';
import { aiErrorResponse } from '@/ai/ai-errors';

export async function POST(request: Request) {
  try {
    const { context } = await request.json();
    const result = await ideamaitValidateActivity({ context });
    return NextResponse.json(result);
  } catch (error) {
    return aiErrorResponse(error, 'ideamait/validate-activity');
  }
}
