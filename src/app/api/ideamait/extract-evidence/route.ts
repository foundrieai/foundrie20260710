import { NextResponse } from 'next/server';
import { extractEvidence } from '@/ai/flows/extract-evidence';

export async function POST(request: Request) {
  try {
    const { rawContent, hintContext } = await request.json();

    if (!rawContent || typeof rawContent !== 'string') {
      return NextResponse.json({ error: 'rawContent is required' }, { status: 400 });
    }

    const result = await extractEvidence({ rawContent, hintContext });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Evidence extraction failed', error);
    return NextResponse.json({ error: 'Evidence extraction failed' }, { status: 500 });
  }
}
