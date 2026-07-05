import { NextResponse } from 'next/server';
import { assessActivity } from '@/ai/flows/assess-activity';

export async function POST(request: Request) {
  try {
    const { context, taggedEvidence } = await request.json();
    const result = await assessActivity({ context, taggedEvidence });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Activity assessment failed', error);
    return NextResponse.json({ error: 'Activity assessment failed' }, { status: 500 });
  }
}
