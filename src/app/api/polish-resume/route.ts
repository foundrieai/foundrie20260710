import { NextResponse } from 'next/server';
import { polish } from '@/features/resumait/actions';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json(await polish(body));
}
