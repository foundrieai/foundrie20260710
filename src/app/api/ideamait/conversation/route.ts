import { NextResponse } from 'next/server';
import { ideamaitConversation } from '@/ai/flows/ideamait-conversation';
import { aiErrorResponse } from '@/ai/ai-errors';

export async function POST(request: Request) {
  try {
    const { context } = await request.json();
    const reply = await ideamaitConversation({ context });
    return NextResponse.json({ reply });
  } catch (error) {
    return aiErrorResponse(error, 'ideamait/conversation');
  }
}
