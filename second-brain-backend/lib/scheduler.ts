import { prisma } from './db';
import { runPatternAnalysis } from './pattern-observer';

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const MIN_GAP_MS = 23 * 60 * 60 * 1000; // 23h minimum gap

let schedulerStarted = false;
let intervalId: ReturnType<typeof setInterval> | null = null;

async function shouldRunAnalysis(): Promise<boolean> {
    try {
        const lastRun = await prisma.patternRun.findFirst({
            where: { status: 'completed' },
            orderBy: { completedAt: 'desc' },
        });

        if (!lastRun || !lastRun.completedAt) return true;

        const elapsed = Date.now() - lastRun.completedAt.getTime();
        return elapsed >= MIN_GAP_MS;
    } catch (err) {
        console.error('⚠️ Scheduler: Error checking last run:', err);
        return false;
    }
}

async function scheduledRun() {
    console.log('🔄 Pattern Observer: Checking if analysis should run...');

    const shouldRun = await shouldRunAnalysis();
    if (!shouldRun) {
        console.log('⏭️ Pattern Observer: Skipping — last run was less than 23 hours ago.');
        return;
    }

    console.log('🧠 Pattern Observer: Starting scheduled analysis...');
    try {
        const result = await runPatternAnalysis();
        console.log(
            `✅ Pattern Observer: Analysis complete — ${result.totalNotes} notes, ${result.themesFound} themes found.`
        );
    } catch (err) {
        console.error('❌ Pattern Observer: Scheduled analysis failed:', err);
    }
}

export function startScheduler() {
    if (schedulerStarted) {
        console.log('⚠️ Pattern Observer: Scheduler already running.');
        return;
    }

    schedulerStarted = true;
    console.log('🚀 Pattern Observer: Scheduler started (runs every 24 hours).');

    // Run once after a 10-second delay to allow the server to fully start
    setTimeout(() => {
        scheduledRun();
    }, 10_000);

    // Then run every 24 hours
    intervalId = setInterval(scheduledRun, TWENTY_FOUR_HOURS);
}

export function stopScheduler() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        schedulerStarted = false;
        console.log('🛑 Pattern Observer: Scheduler stopped.');
    }
}
