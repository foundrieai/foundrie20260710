import { NextResponse } from 'next/server';
import { optimizeBrandPost } from '@/features/brandforge/actions';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json(await optimizeBrandPost(body));
}
