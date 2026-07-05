import { NextResponse } from 'next/server';
import { generateBrandStrategy } from '@/features/brandforge/actions';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json(await generateBrandStrategy(body));
}
