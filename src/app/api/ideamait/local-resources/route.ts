import { NextResponse } from 'next/server';
import { generateLocalResources } from '@/ai/flows/generate-local-resources';
import { aiErrorResponse } from '@/ai/ai-errors';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { location, companyName, industry, startupDescription } = body || {};
    const data = await generateLocalResources({
      location: location || 'Remote',
      companyName,
      industry,
      startupDescription,
    });
    return NextResponse.json({ data });
  } catch (error) {
    return aiErrorResponse(error, 'ideamait/local-resources');
  }
}
