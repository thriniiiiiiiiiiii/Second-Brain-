import { prisma } from './db';
import { OllamaService } from './ollama';

// ─── Types ───────────────────────────────────────────────────
interface ThemeGroup {
    tag: string;
    noteIds: string[];
    titles: string[];
    count: number;
    oldestDate: Date;
    newestDate: Date;
}

interface TimelineEntry {
    weekStart: string;
    weekEnd: string;
    tags: Record<string, number>;
    totalNotes: number;
}

export interface AnalysisResult {
    runId: string;
    status: string;
    totalNotes: number;
    themesFound: number;
    insights: {
        theme: string;
        count: number;
        insight: string;
        relatedNoteIds: string[];
        period: string;
    }[];
    timeline: TimelineEntry[];
}

// ─── Helpers ─────────────────────────────────────────────────

function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
}

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

function daysAgo(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    return d;
}

// ─── Core Analysis ──────────────────────────────────────────

function groupByTags(
    notes: { id: string; title: string; tags: string[]; createdAt: Date }[]
): Map<string, ThemeGroup> {
    const groups = new Map<string, ThemeGroup>();

    for (const note of notes) {
        for (const tag of note.tags) {
            const normalizedTag = tag.toLowerCase().trim();
            if (!normalizedTag) continue;

            if (!groups.has(normalizedTag)) {
                groups.set(normalizedTag, {
                    tag: normalizedTag,
                    noteIds: [],
                    titles: [],
                    count: 0,
                    oldestDate: note.createdAt,
                    newestDate: note.createdAt,
                });
            }

            const group = groups.get(normalizedTag)!;
            group.noteIds.push(note.id);
            group.titles.push(note.title);
            group.count++;
            if (note.createdAt < group.oldestDate) group.oldestDate = note.createdAt;
            if (note.createdAt > group.newestDate) group.newestDate = note.createdAt;
        }
    }

    return groups;
}

function buildTimeline(
    notes: { tags: string[]; createdAt: Date }[]
): TimelineEntry[] {
    if (notes.length === 0) return [];

    const sorted = [...notes].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    const weekMap = new Map<string, { tags: Record<string, number>; totalNotes: number; weekEnd: Date }>();

    for (const note of sorted) {
        const weekStart = getStartOfWeek(note.createdAt);
        const key = formatDate(weekStart);

        if (!weekMap.has(key)) {
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            weekMap.set(key, { tags: {}, totalNotes: 0, weekEnd });
        }

        const entry = weekMap.get(key)!;
        entry.totalNotes++;

        for (const tag of note.tags) {
            const normalized = tag.toLowerCase().trim();
            if (!normalized) continue;
            entry.tags[normalized] = (entry.tags[normalized] || 0) + 1;
        }
    }

    return Array.from(weekMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([weekStart, data]) => ({
            weekStart,
            weekEnd: formatDate(data.weekEnd),
            tags: data.tags,
            totalNotes: data.totalNotes,
        }));
}

function filterNotesByPeriod(
    notes: { id: string; title: string; tags: string[]; createdAt: Date }[],
    period: 'last_7_days' | 'last_30_days' | 'all_time'
) {
    if (period === 'all_time') return notes;
    const cutoff = period === 'last_7_days' ? daysAgo(7) : daysAgo(30);
    return notes.filter((n) => n.createdAt >= cutoff);
}

// ─── Main Entry Point ───────────────────────────────────────

export async function runPatternAnalysis(): Promise<AnalysisResult> {
    // Create a run record
    const run = await prisma.patternRun.create({ data: {} });

    try {
        // 1. Fetch all knowledge items
        const allNotes = await prisma.knowledge.findMany({
            select: { id: true, title: true, tags: true, createdAt: true, content: true },
            orderBy: { createdAt: 'desc' },
        });

        if (allNotes.length === 0) {
            await prisma.patternRun.update({
                where: { id: run.id },
                data: { status: 'completed', totalNotes: 0, themesFound: 0, completedAt: new Date() },
            });
            return { runId: run.id, status: 'completed', totalNotes: 0, themesFound: 0, insights: [], timeline: [] };
        }

        // 2. Analyze across time periods
        const periods: ('last_7_days' | 'last_30_days' | 'all_time')[] = [
            'last_7_days',
            'last_30_days',
            'all_time',
        ];

        const allInsights: AnalysisResult['insights'] = [];

        for (const period of periods) {
            const filteredNotes = filterNotesByPeriod(allNotes, period);
            if (filteredNotes.length === 0) continue;

            const themeGroups = groupByTags(filteredNotes);

            // Only include themes with 2+ notes (recurring)
            const recurringThemes = Array.from(themeGroups.values())
                .filter((g) => g.count >= 2)
                .sort((a, b) => b.count - a.count)
                .slice(0, 10); // Top 10 themes per period

            for (const theme of recurringThemes) {
                // Check if we already have this theme from a narrower period
                const alreadyExists = allInsights.some(
                    (i) => i.theme === theme.tag && i.period !== period
                );
                if (alreadyExists && period === 'all_time') continue;

                // Generate AI insight
                let insight: string;
                try {
                    const periodLabel =
                        period === 'last_7_days'
                            ? 'the past week'
                            : period === 'last_30_days'
                                ? 'the past month'
                                : 'all time';

                    insight = await OllamaService.generateInsight(
                        theme.tag,
                        theme.count,
                        theme.titles.slice(0, 5),
                        periodLabel
                    );
                } catch {
                    // Fallback if Ollama is unavailable
                    const periodLabel =
                        period === 'last_7_days'
                            ? 'in the past week'
                            : period === 'last_30_days'
                                ? 'in the past month'
                                : 'across all your notes';
                    insight = `You've written ${theme.count} notes about "${theme.tag}" ${periodLabel}.`;
                }

                // Surface old related notes (notes in this theme that are older than 30 days)
                const oldCutoff = daysAgo(30);
                const oldRelatedIds = allNotes
                    .filter(
                        (n) =>
                            n.tags.some((t) => t.toLowerCase().trim() === theme.tag) &&
                            n.createdAt < oldCutoff
                    )
                    .map((n) => n.id);

                const relatedNoteIds = [...new Set([...theme.noteIds, ...oldRelatedIds])];

                allInsights.push({
                    theme: theme.tag,
                    count: theme.count,
                    insight,
                    relatedNoteIds,
                    period,
                });
            }
        }

        // 3. Build timeline
        const timeline = buildTimeline(allNotes);

        // 4. Persist insights
        for (const ins of allInsights) {
            await prisma.patternInsight.create({
                data: {
                    theme: ins.theme,
                    count: ins.count,
                    insight: ins.insight,
                    relatedNoteIds: ins.relatedNoteIds,
                    period: ins.period,
                    runId: run.id,
                },
            });
        }

        // 5. Update run status
        await prisma.patternRun.update({
            where: { id: run.id },
            data: {
                status: 'completed',
                totalNotes: allNotes.length,
                themesFound: allInsights.length,
                completedAt: new Date(),
            },
        });

        return {
            runId: run.id,
            status: 'completed',
            totalNotes: allNotes.length,
            themesFound: allInsights.length,
            insights: allInsights,
            timeline,
        };
    } catch (error: any) {
        // Mark run as failed
        await prisma.patternRun.update({
            where: { id: run.id },
            data: {
                status: 'failed',
                error: error.message || 'Unknown error',
                completedAt: new Date(),
            },
        });
        throw error;
    }
}

// ─── Timeline Fetcher (standalone) ──────────────────────────

export async function getTimeline(): Promise<TimelineEntry[]> {
    const allNotes = await prisma.knowledge.findMany({
        select: { tags: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
    });
    return buildTimeline(allNotes);
}
