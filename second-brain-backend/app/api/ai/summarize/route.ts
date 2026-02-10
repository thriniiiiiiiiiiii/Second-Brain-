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
    const { itemId, content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const provider = request.headers.get('X-AI-Provider') as any;
    const summary = await AIProvider.summarize(content, provider);

    if (itemId) {
      await prisma.knowledge.update({
        where: { id: itemId },
        data: { summary },
      });
    }

    return NextResponse.json({ summary }, { headers: CORS_HEADERS });
  } catch (error: any) {
    console.error('Summarize error:', error);
    const status = error.status || 500;
    const message = error.message || 'Summarization failed';
    return NextResponse.json(
      { error: message },
      { status, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}