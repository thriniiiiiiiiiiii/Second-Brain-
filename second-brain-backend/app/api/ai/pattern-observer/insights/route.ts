import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET() {
    try {
        // Find the latest completed run
        const latestRun = await prisma.patternRun.findFirst({
            where: { status: 'completed' },
            orderBy: { completedAt: 'desc' },
            include: {
                insights: {
                    orderBy: { count: 'desc' },
                },
            },
        });

        if (!latestRun) {
            return NextResponse.json(
                { insights: [], message: 'No analysis has been completed yet. Run the analyzer first.' },
                { headers: CORS_HEADERS }
            );
        }

        // Fetch related note details for each insight
        const insightsWithNotes = await Promise.all(
            latestRun.insights.map(async (insight: any) => {
                const relatedNotes = await prisma.knowledge.findMany({
                    where: { id: { in: insight.relatedNoteIds } },
                    select: { id: true, title: true, tags: true, createdAt: true, type: true },
                    orderBy: { createdAt: 'desc' },
                });

                return {
                    id: insight.id,
                    theme: insight.theme,
                    count: insight.count,
                    insight: insight.insight,
                    period: insight.period,
                    relatedNotes,
                    createdAt: insight.createdAt,
                };
            })
        );

        return NextResponse.json(
            {
                runId: latestRun.id,
                completedAt: latestRun.completedAt,
                totalNotes: latestRun.totalNotes,
                themesFound: latestRun.themesFound,
                insights: insightsWithNotes,
            },
            { headers: CORS_HEADERS }
        );
    } catch (error: any) {
        console.error('Pattern Observer insights error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch insights' },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}
