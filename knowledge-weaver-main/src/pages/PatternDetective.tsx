import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
    Brain, TrendingUp, Tag, Sparkles, ArrowLeft, Clock,
    FileText, Link2, Lightbulb, BarChart3, Calendar, Star,
    Zap, Target, Layers
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/mode-toggle";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientMesh } from "@/components/ui/gradient-mesh";
import { CursorSpotlight } from "@/components/ui/cursor-spotlight";
import { FloatingElement } from "@/components/ui/floating-element";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Footer } from "@/components/layout/Footer";
import * as store from "@/lib/thoughtStore";
import type { Thought } from "@/lib/thoughtStore";

const typeIcons = { note: FileText, link: Link2, insight: Lightbulb };

/* ──────────────── Theme Cloud ──────────────── */

const ThemeCloud = ({ items }: { items: Thought[] }) => {
    const tagStats = useMemo(() => {
        const counts: Record<string, number> = {};
        items.flatMap(i => i.tags).forEach(tag => { counts[tag] = (counts[tag] || 0) + 1; });
        return Object.entries(counts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);
    }, [items]);

    if (tagStats.length === 0) {
        return (
            <GlassCard tilt={false} glow={false} className="p-8 text-center">
                <Tag className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Add tags to your thoughts to see your theme cloud</p>
            </GlassCard>
        );
    }

    const maxCount = tagStats[0]?.count || 1;

    return (
        <GlassCard tilt={false} glow={true} className="p-6">
            <div className="flex flex-wrap gap-2 justify-start">
                {tagStats.map((stat) => {
                    const intensity = stat.count / maxCount;
                    // Discrete size tiers for cleaner look
                    const sizeClass = intensity > 0.8 ? "px-4 py-2 text-base font-semibold" :
                        intensity > 0.4 ? "px-3 py-1.5 text-sm font-medium" :
                            "px-2.5 py-1 text-xs";

                    const colorClass = intensity > 0.8 ? "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30" :
                        intensity > 0.4 ? "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20" :
                            "bg-white/5 text-muted-foreground border-white/10";

                    return (
                        <div
                            key={stat.tag}
                            className={`rounded-full border transition-colors ${sizeClass} ${colorClass}`}
                        >
                            {stat.tag} <span className="opacity-50 ml-1 text-[0.8em]">×{stat.count}</span>
                        </div>
                    );
                })}
            </div>
        </GlassCard>
    );
};

/* ──────────────── Recurring Obsessions ──────────────── */

const RecurringObsessions = ({ items }: { items: Thought[] }) => {
    const obsessions = useMemo(() => {
        const tagStats = store.getTagStats();
        return tagStats.slice(0, 6);
    }, [items]);

    if (obsessions.length === 0) return null;

    const maxCount = obsessions[0]?.count || 1;

    return (
        <GlassCard tilt={false} glow={false} className="p-6">
            <div className="space-y-3">
                {obsessions.map((obs, i) => (
                    <motion.div
                        key={obs.tag}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                    >
                        <span className="text-sm font-medium text-display w-24 truncate">{obs.tag}</span>
                        <div className="flex-1 h-6 rounded-full bg-white/5 overflow-hidden relative">
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500/40 to-purple-500/60"
                                initial={{ width: 0 }}
                                animate={{ width: `${(obs.count / maxCount) * 100}%` }}
                                transition={{ delay: i * 0.1 + 0.3, duration: 0.6, ease: "easeOut" }}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                {obs.count}×
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </GlassCard>
    );
};

/* ──────────────── Activity Heatmap ──────────────── */

const ActivityHeatmap = ({ items }: { items: Thought[] }) => {
    const activity = useMemo(() => store.getActivityByDay(), [items]);
    const maxCount = Math.max(...activity.map(a => a.count), 1);

    return (
        <GlassCard tilt={false} glow={false} className="p-6">
            <div className="flex items-end gap-2 justify-center h-32">
                {activity.map((day, i) => {
                    const height = Math.max((day.count / maxCount) * 100, 8);
                    return (
                        <motion.div
                            key={day.day}
                            className="flex flex-col items-center gap-2 flex-1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <motion.div
                                className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-blue-500/30 to-purple-500/50 relative group"
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ delay: i * 0.1 + 0.3, duration: 0.5, ease: "easeOut" }}
                            >
                                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                    {day.count}
                                </span>
                            </motion.div>
                            <span className="text-[10px] text-muted-foreground">{day.day}</span>
                        </motion.div>
                    );
                })}
            </div>
        </GlassCard>
    );
};

/* ──────────────── Type Distribution ──────────────── */

const TypeDistribution = ({ items }: { items: Thought[] }) => {
    const stats = useMemo(() => store.getTypeStats(), [items]);
    const total = items.length || 1;

    const colors = {
        note: { from: "from-blue-500", to: "to-blue-600", bg: "bg-blue-500/20", text: "text-blue-400" },
        link: { from: "from-green-500", to: "to-emerald-600", bg: "bg-green-500/20", text: "text-green-400" },
        insight: { from: "from-amber-500", to: "to-orange-600", bg: "bg-amber-500/20", text: "text-amber-400" },
    };

    return (
        <GlassCard tilt={false} glow={false} className="p-6">
            <div className="space-y-4">
                {stats.map((stat, i) => {
                    const pct = Math.round((stat.count / total) * 100);
                    const color = colors[stat.type as keyof typeof colors] || colors.note;
                    const Icon = typeIcons[stat.type as keyof typeof typeIcons] || FileText;
                    return (
                        <motion.div
                            key={stat.type}
                            className="space-y-1.5"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-md ${color.bg} flex items-center justify-center`}>
                                        <Icon className={`w-3 h-3 ${color.text}`} />
                                    </div>
                                    <span className="text-sm text-display capitalize">{stat.type}s</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{stat.count} ({pct}%)</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                <motion.div
                                    className={`h-full rounded-full bg-gradient-to-r ${color.from} ${color.to}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ delay: i * 0.1 + 0.4, duration: 0.6 }}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </GlassCard>
    );
};

/* ──────────────── AI Insights Section ──────────────── */

const InsightsSection = ({ items }: { items: Thought[] }) => {
    const insights = useMemo(() => store.generateLocalInsights(), [items]);

    return (
        <GlassCard tilt={false} glow={true} className="p-6">
            <div className="space-y-3">
                {insights.map((insight, i) => (
                    <motion.div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                        </div>
                        <p
                            className="text-sm text-body leading-relaxed"
                            dangerouslySetInnerHTML={{
                                __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-300">$1</strong>')
                            }}
                        />
                    </motion.div>
                ))}
            </div>
        </GlassCard>
    );
};

/* ══════════════════════ PATTERN DETECTIVE ══════════════════════ */

const PatternDetective = () => {
    const [items, setItems] = useState<Thought[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        store.getAllThoughts()
            .then(setItems)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <Brain className="w-8 h-8 text-purple-400" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-x-hidden">
            <GradientMesh className="opacity-30" />
            <CursorSpotlight size={300} intensity={0.08} />

            {/* Nav */}
            <nav className="sticky top-0 z-50 glass border-b border-white/10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard">
                            <MagneticButton
                                strength={0.2}
                                className="rounded-full gap-1.5 text-sm px-3 py-1.5 glass border-white/10 text-muted-foreground hover:text-display"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" /> Back
                            </MagneticButton>
                        </Link>
                        <FloatingElement delay={0} duration={5}>
                            <span className="font-display text-xl italic text-display">Pattern Detective</span>
                        </FloatingElement>
                    </div>
                    <ModeToggle />
                </div>
            </nav>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-8 md:px-6 relative z-10">
                {/* Header */}
                <ScrollReveal>
                    <div className="text-center mb-12">
                        <FloatingElement delay={0} duration={4}>
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shadow-float">
                                <Brain className="w-8 h-8 text-purple-400" />
                            </div>
                        </FloatingElement>
                        <h1 className="font-display text-3xl md:text-4xl text-display mb-2">
                            What's on your mind?
                        </h1>
                        <p className="text-body max-w-md mx-auto">
                            Your AI detective has analyzed {items.length} thought{items.length !== 1 ? "s" : ""} to find patterns, themes, and insights.
                        </p>
                    </div>
                </ScrollReveal>

                {items.length === 0 ? (
                    <ScrollReveal>
                        <div className="text-center py-20">
                            <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h2 className="font-display text-xl text-display mb-2">No thoughts to analyze yet</h2>
                            <p className="text-sm text-muted-foreground mb-6">Start capturing thoughts on the dashboard to see patterns emerge.</p>
                            <Link to="/dashboard">
                                <MagneticButton className="rounded-full px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                    Go to Dashboard
                                </MagneticButton>
                            </Link>
                        </div>
                    </ScrollReveal>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Theme Cloud */}
                        <ScrollReveal>
                            <div>
                                <h2 className="font-display text-lg text-display mb-3 flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-purple-400" /> Theme Cloud
                                </h2>
                                <ThemeCloud items={items} />
                            </div>
                        </ScrollReveal>

                        {/* Recurring Obsessions */}
                        <ScrollReveal delay={0.1}>
                            <div>
                                <h2 className="font-display text-lg text-display mb-3 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-pink-400" /> Recurring Obsessions
                                </h2>
                                <RecurringObsessions items={items} />
                            </div>
                        </ScrollReveal>

                        {/* Activity by Day */}
                        <ScrollReveal delay={0.15}>
                            <div>
                                <h2 className="font-display text-lg text-display mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-400" /> When You Think
                                </h2>
                                <ActivityHeatmap items={items} />
                            </div>
                        </ScrollReveal>

                        {/* Type Distribution */}
                        <ScrollReveal delay={0.2}>
                            <div>
                                <h2 className="font-display text-lg text-display mb-3 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-green-400" /> Thought Types
                                </h2>
                                <TypeDistribution items={items} />
                            </div>
                        </ScrollReveal>

                        {/* AI Insights — Full Width */}
                        <ScrollReveal delay={0.25}>
                            <div className="lg:col-span-2">
                                <h2 className="font-display text-lg text-display mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-400" /> AI-Discovered Insights
                                </h2>
                                <InsightsSection items={items} />
                            </div>
                        </ScrollReveal>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default PatternDetective;
