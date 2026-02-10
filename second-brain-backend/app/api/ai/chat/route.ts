import { NextRequest, NextResponse } from 'next/server';
import { AIProvider } from '@/lib/ai-provider';
import { prisma } from '@/lib/db';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const items = await prisma.knowledge.findMany({
      orderBy: { createdAt: 'desc' },
      select: { title: true, content: true },
      take: 20,
    });

    const provider = request.headers.get('X-AI-Provider') as any;
    const response = await AIProvider.chat(messages, items, provider);

    return NextResponse.json({ response }, { headers: CORS_HEADERS });
  } catch (error: any) {
    console.error('Chat error:', error);
    const status = error.status || 500;
    const message = error.message || 'Chat failed';
    return NextResponse.json(
      { error: message },
      { status, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}