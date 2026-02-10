import { NextResponse } from 'next/server';
import { getTimeline } from '@/lib/pattern-observer';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET() {
    try {
        const timeline = await getTimeline();

        return NextResponse.json({ timeline }, { headers: CORS_HEADERS });
    } catch (error: any) {
        console.error('Pattern Observer timeline error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch timeline' },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}
