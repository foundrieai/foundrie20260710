import { NextResponse } from 'next/server';
import { ideamaitConversation } from '@/ai/flows/ideamait-conversation';

export async function POST(request: Request) {
  try {
    const { context } = await request.json();
    const reply = await ideamaitConversation({ context });
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Conversation failed', error);
    return NextResponse.json({ error: 'Conversation failed' }, { status: 500 });
  }
}
