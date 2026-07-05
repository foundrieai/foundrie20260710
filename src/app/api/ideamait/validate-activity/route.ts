import { NextResponse } from 'next/server';
import { ideamaitValidateActivity } from '@/ai/flows/ideamait-validate-activity';

export async function POST(request: Request) {
  try {
    const { context } = await request.json();
    const result = await ideamaitValidateActivity({ context });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Activity validation failed', error);
    return NextResponse.json({ error: 'Activity validation failed' }, { status: 500 });
  }
}
