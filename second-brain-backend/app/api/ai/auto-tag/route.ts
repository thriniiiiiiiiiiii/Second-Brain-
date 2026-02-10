import { NextRequest, NextResponse } from 'next/server';
import { AIProvider } from '@/lib/ai-provider';
import { prisma } from '@/lib/db';

import { corsHeaders } from '@/lib/cors';

export async function POST(request: NextRequest) {
  try {
    const { itemId, title, content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const provider = request.headers.get('X-AI-Provider') as any;
    const tags = await AIProvider.generateTags(title || 'Untitled', content, provider);

    if (itemId) {
      const item = await prisma.knowledge.findUnique({
        where: { id: itemId },
      });

      if (item) {
        const merged = [...new Set([...item.tags, ...tags])];
        await prisma.knowledge.update({
          where: { id: itemId },
          data: { tags: merged },
        });
      }
    }

    return NextResponse.json({ tags }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Auto-tag error:', error);
    const status = error.status || 500;
    const message = error.message || 'Auto-tagging failed';
    return NextResponse.json(
      { error: message },
      { status, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}