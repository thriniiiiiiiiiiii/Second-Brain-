import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET() {
    try {
        const latestRun = await prisma.patternRun.findFirst({
            orderBy: { startedAt: 'desc' },
            select: {
                id: true,
                status: true,
                totalNotes: true,
                themesFound: true,
                error: true,
                startedAt: true,
                completedAt: true,
            },
        });

        if (!latestRun) {
            return NextResponse.json(
                {
                    hasRun: false,
                    message: 'No analysis has been run yet.',
                },
                { headers: CORS_HEADERS }
            );
        }

        return NextResponse.json(
            {
                hasRun: true,
                ...latestRun,
            },
            { headers: CORS_HEADERS }
        );
    } catch (error: any) {
        console.error('Pattern Observer status error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch status' },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}
