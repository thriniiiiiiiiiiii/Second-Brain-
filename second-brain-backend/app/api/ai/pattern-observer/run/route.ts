import { NextRequest, NextResponse } from 'next/server';
import { runPatternAnalysis } from '@/lib/pattern-observer';
import { startScheduler } from '@/lib/scheduler';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Scheduler is started via instrumentation.ts

export async function POST(_request: NextRequest) {
    try {
        // Run analysis in background, return immediately with run ID
        const result = await runPatternAnalysis();

        return NextResponse.json(
            {
                success: true,
                runId: result.runId,
                status: result.status,
                totalNotes: result.totalNotes,
                themesFound: result.themesFound,
            },
            { headers: CORS_HEADERS }
        );
    } catch (error: any) {
        console.error('Pattern Observer run error:', error);
        return NextResponse.json(
            { error: error.message || 'Analysis failed' },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}
