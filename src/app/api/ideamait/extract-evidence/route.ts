import { NextResponse } from 'next/server';
import { extractEvidence } from '@/ai/flows/extract-evidence';
import { aiErrorResponse } from '@/ai/ai-errors';

export async function POST(request: Request) {
  try {
    const { rawContent, hintContext } = await request.json();

    if (!rawContent || typeof rawContent !== 'string') {
      return NextResponse.json({ error: 'rawContent is required' }, { status: 400 });
    }

    const result = await extractEvidence({ rawContent, hintContext });
    return NextResponse.json(result);
  } catch (error) {
    return aiErrorResponse(error, 'ideamait/extract-evidence');
  }
}
