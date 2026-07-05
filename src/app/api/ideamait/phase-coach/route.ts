import { NextResponse } from 'next/server';
import { ideamaitPhaseCoach } from '@/ai/flows/ideamait-phase-coach';

export async function POST(request: Request) {
  try {
    const { context } = await request.json();
    const response = await ideamaitPhaseCoach({ context });
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Phase coaching failed', error);
    return NextResponse.json({ error: 'Phase coaching failed' }, { status: 500 });
  }
}
