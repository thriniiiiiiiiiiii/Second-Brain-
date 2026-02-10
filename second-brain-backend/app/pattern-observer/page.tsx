'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────
interface RelatedNote {
    id: string;
    title: string;
    tags: string[];
    createdAt: string;
    type: string;
}

interface Insight {
    id: string;
    theme: string;
    count: number;
    insight: string;
    period: string;
    relatedNotes: RelatedNote[];
    createdAt: string;
}

interface InsightsData {
    runId?: string;
    completedAt?: string;
    totalNotes?: number;
    themesFound?: number;
    insights: Insight[];
    message?: string;
}

interface TimelineEntry {
    weekStart: string;
    weekEnd: string;
    tags: Record<string, number>;
    totalNotes: number;
}

interface RunStatus {
    hasRun: boolean;
    id?: string;
    status?: string;
    totalNotes?: number;
    themesFound?: number;
    error?: string;
    startedAt?: string;
    completedAt?: string;
    message?: string;
}

// ─── Helpers ───────────────────────────────────────────────
const PERIOD_LABELS: Record<string, string> = {
    last_7_days: 'Past Week',
    last_30_days: 'Past Month',
    all_time: 'All Time',
};

const PERIOD_COLORS: Record<string, string> = {
    last_7_days: '#6366f1',
    last_30_days: '#8b5cf6',
    all_time: '#a78bfa',
};

const TAG_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
    '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

// ─── Component ─────────────────────────────────────────────
export default function PatternObserverPage() {
    const [insights, setInsights] = useState<InsightsData | null>(null);
    const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
    const [status, setStatus] = useState<RunStatus | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [insightsRes, timelineRes, statusRes] = await Promise.all([
                fetch('/api/ai/pattern-observer/insights'),
                fetch('/api/ai/pattern-observer/timeline'),
                fetch('/api/ai/pattern-observer/status'),
            ]);
            const [insightsData, timelineData, statusData] = await Promise.all([
                insightsRes.json(),
                timelineRes.json(),
                statusRes.json(),
            ]);
            setInsights(insightsData);
            setTimeline(timelineData.timeline || []);
            setStatus(statusData);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const runAnalysis = async () => {
        setIsRunning(true);
        try {
            const res = await fetch('/api/ai/pattern-observer/run', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                // Refresh data after analysis completes
                await fetchData();
            }
        } catch (err) {
            console.error('Failed to run analysis:', err);
        } finally {
            setIsRunning(false);
        }
    };

    const filteredInsights = insights?.insights?.filter(
        (i) => activeFilter === 'all' || i.period === activeFilter
    ) || [];

    // Timeline chart calculations
    const maxNotes = Math.max(...timeline.map((t) => t.totalNotes), 1);
    const allTimelineTags = [...new Set(timeline.flatMap((t) => Object.keys(t.tags)))].slice(0, 10);

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner} />
                <p style={styles.loadingText}>Loading Pattern Observer...</p>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            {/* ─── Header ─────────────────────────────────── */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.logoIcon}>🧠</div>
                    <div>
                        <h1 style={styles.title}>AI Pattern Observer</h1>
                        <p style={styles.subtitle}>
                            Discover recurring themes and watch your thinking evolve
                        </p>
                    </div>
                </div>
                <div style={styles.headerRight}>
                    {status?.hasRun && (
                        <div style={styles.statusBadge}>
                            <span
                                style={{
                                    ...styles.statusDot,
                                    backgroundColor:
                                        status.status === 'completed'
                                            ? '#22c55e'
                                            : status.status === 'running'
                                                ? '#eab308'
                                                : '#ef4444',
                                }}
                            />
                            <span style={styles.statusText}>
                                {status.status === 'completed'
                                    ? `Last run ${status.completedAt ? timeAgo(status.completedAt) : ''}`
                                    : status.status === 'running'
                                        ? 'Analysis running...'
                                        : 'Last run failed'}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={runAnalysis}
                        disabled={isRunning}
                        style={{
                            ...styles.runButton,
                            opacity: isRunning ? 0.6 : 1,
                            cursor: isRunning ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isRunning ? (
                            <>
                                <span style={styles.btnSpinner} />
                                Analyzing...
                            </>
                        ) : (
                            <>⚡ Run Analysis Now</>
                        )}
                    </button>
                </div>
            </header>

            {/* ─── Stats Bar ──────────────────────────────── */}
            {insights?.totalNotes !== undefined && (
                <div style={styles.statsBar}>
                    <div style={styles.statCard}>
                        <span style={styles.statNumber}>{insights.totalNotes}</span>
                        <span style={styles.statLabel}>Total Notes</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statNumber}>{insights.themesFound}</span>
                        <span style={styles.statLabel}>Themes Found</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statNumber}>{timeline.length}</span>
                        <span style={styles.statLabel}>Weeks Tracked</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statNumber}>{allTimelineTags.length}</span>
                        <span style={styles.statLabel}>Unique Tags</span>
                    </div>
                </div>
            )}

            {/* ─── Period Filter ──────────────────────────── */}
            <div style={styles.filterBar}>
                {['all', 'last_7_days', 'last_30_days', 'all_time'].map((period) => (
                    <button
                        key={period}
                        onClick={() => setActiveFilter(period)}
                        style={{
                            ...styles.filterChip,
                            backgroundColor: activeFilter === period ? '#6366f1' : 'rgba(255,255,255,0.05)',
                            color: activeFilter === period ? '#fff' : '#94a3b8',
                            border: activeFilter === period ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        {period === 'all' ? 'All Periods' : PERIOD_LABELS[period]}
                    </button>
                ))}
            </div>

            {/* ─── Insights Grid ──────────────────────────── */}
            {filteredInsights.length > 0 ? (
                <div style={styles.insightsGrid}>
                    {filteredInsights.map((insight) => (
                        <div
                            key={insight.id}
                            style={{
                                ...styles.insightCard,
                                borderLeft: `3px solid ${PERIOD_COLORS[insight.period] || '#6366f1'}`,
                            }}
                            onClick={() =>
                                setExpandedInsight(expandedInsight === insight.id ? null : insight.id)
                            }
                        >
                            <div style={styles.insightHeader}>
                                <div style={styles.themeTag}>
                                    <span style={styles.themeIcon}>🏷️</span>
                                    <span style={styles.themeName}>{insight.theme}</span>
                                </div>
                                <div style={styles.insightMeta}>
                                    <span style={styles.countBadge}>{insight.count} notes</span>
                                    <span
                                        style={{
                                            ...styles.periodBadge,
                                            backgroundColor: `${PERIOD_COLORS[insight.period] || '#6366f1'}22`,
                                            color: PERIOD_COLORS[insight.period] || '#6366f1',
                                        }}
                                    >
                                        {PERIOD_LABELS[insight.period] || insight.period}
                                    </span>
                                </div>
                            </div>

                            <p style={styles.insightText}>{insight.insight}</p>

                            {/* Expanded: Related Notes */}
                            {expandedInsight === insight.id && insight.relatedNotes.length > 0 && (
                                <div style={styles.relatedNotes}>
                                    <h4 style={styles.relatedTitle}>📎 Related Notes</h4>
                                    <div style={styles.notesList}>
                                        {insight.relatedNotes.slice(0, 8).map((note) => (
                                            <div key={note.id} style={styles.noteItem}>
                                                <div style={styles.noteTop}>
                                                    <span style={styles.noteTitle}>{note.title}</span>
                                                    <span style={styles.noteDate}>{formatDate(note.createdAt)}</span>
                                                </div>
                                                <div style={styles.noteTags}>
                                                    {note.tags.slice(0, 4).map((tag) => (
                                                        <span key={tag} style={styles.miniTag}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={styles.expandHint}>
                                {expandedInsight === insight.id ? '▲ Collapse' : '▼ Show related notes'}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>🔍</div>
                    <h3 style={styles.emptyTitle}>No patterns detected yet</h3>
                    <p style={styles.emptyText}>
                        Click &quot;Run Analysis Now&quot; to analyze your notes for recurring themes and patterns.
                    </p>
                </div>
            )}

            {/* ─── Timeline Section ───────────────────────── */}
            {timeline.length > 0 && (
                <section style={styles.timelineSection}>
                    <h2 style={styles.sectionTitle}>📈 Thinking Evolution Timeline</h2>
                    <p style={styles.sectionSubtitle}>
                        How your note-taking activity and themes evolve over time
                    </p>

                    {/* Bar chart */}
                    <div style={styles.chartContainer}>
                        <div style={styles.chartBars}>
                            {timeline.map((entry, idx) => (
                                <div key={entry.weekStart} style={styles.chartColumn}>
                                    <div style={styles.barWrapper}>
                                        {/* Stacked bars for each tag */}
                                        {Object.entries(entry.tags)
                                            .sort(([, a], [, b]) => b - a)
                                            .slice(0, 5)
                                            .map(([tag, count], tagIdx) => (
                                                <div
                                                    key={tag}
                                                    title={`${tag}: ${count} notes`}
                                                    style={{
                                                        height: `${Math.max((count / maxNotes) * 180, 4)}px`,
                                                        backgroundColor:
                                                            TAG_COLORS[allTimelineTags.indexOf(tag) % TAG_COLORS.length],
                                                        borderRadius: tagIdx === 0 ? '4px 4px 0 0' : '0',
                                                        minHeight: '4px',
                                                        width: '100%',
                                                        transition: 'height 0.4s ease',
                                                    }}
                                                />
                                            ))}
                                    </div>
                                    <div style={styles.chartLabel}>
                                        {new Date(entry.weekStart).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </div>
                                    <div style={styles.chartCount}>{entry.totalNotes}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tag Legend */}
                    <div style={styles.legend}>
                        {allTimelineTags.slice(0, 10).map((tag, idx) => (
                            <div key={tag} style={styles.legendItem}>
                                <span
                                    style={{
                                        ...styles.legendDot,
                                        backgroundColor: TAG_COLORS[idx % TAG_COLORS.length],
                                    }}
                                />
                                <span style={styles.legendText}>{tag}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ─── Footer ──────────────────────────────────── */}
            <footer style={styles.footer}>
                <p>
                    Pattern Observer runs automatically every 24 hours ·{' '}
                    {status?.completedAt && `Last analysis: ${formatDate(status.completedAt)}`}
                </p>
            </footer>
        </div>
    );
}

// ─── Styles ────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#0a0a0f',
        color: '#e2e8f0',
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        padding: '0',
    },
    loadingContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0f',
        color: '#e2e8f0',
        gap: '16px',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '3px solid rgba(99,102,241,0.2)',
        borderTopColor: '#6366f1',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    loadingText: {
        fontSize: '14px',
        color: '#94a3b8',
    },

    // Header
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '32px 40px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%)',
        flexWrap: 'wrap' as const,
        gap: '16px',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    logoIcon: {
        fontSize: '36px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        borderRadius: '12px',
        width: '56px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: '28px',
        fontWeight: 700,
        margin: 0,
        background: 'linear-gradient(135deg, #e2e8f0, #c4b5fd)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        fontSize: '14px',
        color: '#64748b',
        margin: '4px 0 0',
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    statusBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 14px',
        borderRadius: '20px',
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
    },
    statusDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        display: 'inline-block',
    },
    statusText: {
        fontSize: '13px',
        color: '#94a3b8',
    },
    runButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 600,
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
    },
    btnSpinner: {
        width: '14px',
        height: '14px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 0.8s linear infinite',
    },

    // Stats Bar
    statsBar: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px',
        padding: '24px 40px',
    },
    statCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        borderRadius: '12px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.2s ease',
    },
    statNumber: {
        fontSize: '32px',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    statLabel: {
        fontSize: '12px',
        color: '#64748b',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
        marginTop: '4px',
    },

    // Filter Bar
    filterBar: {
        display: 'flex',
        gap: '10px',
        padding: '0 40px 24px',
        flexWrap: 'wrap' as const,
    },
    filterChip: {
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },

    // Insights Grid
    insightsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '16px',
        padding: '0 40px 32px',
    },
    insightCard: {
        padding: '20px',
        borderRadius: '12px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
    },
    insightHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
        flexWrap: 'wrap' as const,
        gap: '8px',
    },
    themeTag: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    themeIcon: {
        fontSize: '16px',
    },
    themeName: {
        fontSize: '16px',
        fontWeight: 600,
        color: '#e2e8f0',
        textTransform: 'capitalize' as const,
    },
    insightMeta: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    countBadge: {
        fontSize: '12px',
        fontWeight: 600,
        padding: '3px 10px',
        borderRadius: '12px',
        backgroundColor: 'rgba(99,102,241,0.15)',
        color: '#a5b4fc',
    },
    periodBadge: {
        fontSize: '11px',
        fontWeight: 500,
        padding: '3px 10px',
        borderRadius: '12px',
    },
    insightText: {
        fontSize: '14px',
        lineHeight: '1.6',
        color: '#94a3b8',
        margin: '0 0 12px',
    },
    expandHint: {
        fontSize: '11px',
        color: '#475569',
        textAlign: 'center' as const,
        paddingTop: '8px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
    },

    // Related Notes
    relatedNotes: {
        marginTop: '16px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    relatedTitle: {
        fontSize: '13px',
        fontWeight: 600,
        color: '#94a3b8',
        margin: '0 0 12px',
    },
    notesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    noteItem: {
        padding: '10px 12px',
        borderRadius: '8px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
    },
    noteTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
    },
    noteTitle: {
        fontSize: '13px',
        fontWeight: 500,
        color: '#c4b5fd',
    },
    noteDate: {
        fontSize: '11px',
        color: '#475569',
    },
    noteTags: {
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap' as const,
    },
    miniTag: {
        fontSize: '10px',
        padding: '2px 8px',
        borderRadius: '8px',
        backgroundColor: 'rgba(99,102,241,0.1)',
        color: '#818cf8',
    },

    // Empty State
    emptyState: {
        textAlign: 'center' as const,
        padding: '80px 40px',
    },
    emptyIcon: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    emptyTitle: {
        fontSize: '20px',
        fontWeight: 600,
        color: '#e2e8f0',
        margin: '0 0 8px',
    },
    emptyText: {
        fontSize: '14px',
        color: '#64748b',
        maxWidth: '400px',
        margin: '0 auto',
    },

    // Timeline Section
    timelineSection: {
        padding: '32px 40px 40px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
    },
    sectionTitle: {
        fontSize: '22px',
        fontWeight: 700,
        margin: '0 0 4px',
        color: '#e2e8f0',
    },
    sectionSubtitle: {
        fontSize: '14px',
        color: '#64748b',
        margin: '0 0 32px',
    },

    // Chart
    chartContainer: {
        padding: '24px',
        borderRadius: '12px',
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        overflowX: 'auto' as const,
    },
    chartBars: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        minHeight: '220px',
        paddingBottom: '40px',
        position: 'relative' as const,
    },
    chartColumn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: '1 1 40px',
        minWidth: '40px',
        position: 'relative' as const,
    },
    barWrapper: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '48px',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    chartLabel: {
        fontSize: '10px',
        color: '#475569',
        marginTop: '8px',
        whiteSpace: 'nowrap' as const,
    },
    chartCount: {
        fontSize: '11px',
        color: '#64748b',
        fontWeight: 600,
    },

    // Legend
    legend: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '12px',
        marginTop: '20px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    legendDot: {
        width: '10px',
        height: '10px',
        borderRadius: '3px',
        display: 'inline-block',
    },
    legendText: {
        fontSize: '12px',
        color: '#94a3b8',
        textTransform: 'capitalize' as const,
    },

    // Footer
    footer: {
        padding: '24px 40px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        textAlign: 'center' as const,
        fontSize: '12px',
        color: '#334155',
    },
};
