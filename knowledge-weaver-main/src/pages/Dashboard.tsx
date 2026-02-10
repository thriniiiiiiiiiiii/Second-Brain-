import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plus, Search, Filter, SortAsc, Tag, FileText, Link2, Lightbulb,
  Sparkles, MessageSquare, X, Clock, Zap, Brain, ArrowRight, Trash2,
  Pin, PinOff, TrendingUp, Star, Send, Compass
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import AIChat from "@/components/dashboard/AIChat";
import ApiKeySettings from "@/components/dashboard/ApiKeySettings";
import { ModeToggle } from "@/components/mode-toggle";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientMesh } from "@/components/ui/gradient-mesh";
import { Footer } from "@/components/layout/Footer";
import { ParticleBackground } from "@/components/ui/particle-background";
import { CursorSpotlight } from "@/components/ui/cursor-spotlight";
import { FloatingElement } from "@/components/ui/floating-element";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import * as aiApi from "@/lib/aiApi";
import * as store from "@/lib/thoughtStore";
import type { Thought } from "@/lib/thoughtStore";

/* ───────────────────────────── Types ───────────────────────────── */

export type KnowledgeItem = Thought;

const typeIcons = { note: FileText, link: Link2, insight: Lightbulb };

/* ─────────────── Character Count Circular Progress ─────────────── */

const CircularProgress = ({ current, max }: { current: number; max: number }) => {
  const pct = Math.min(current / max, 1);
  const r = 14;
  const circ = 2 * Math.PI * r;
  const over = current > max;

  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      <svg width="36" height="36" viewBox="0 0 36 36" className="rotate-[-90deg]">
        <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor"
          className="text-muted/30" strokeWidth="2.5" />
        <motion.circle
          cx="18" cy="18" r={r} fill="none"
          className={over ? "text-red-500" : "text-purple-500"}
          strokeWidth="2.5" strokeLinecap="round"
          initial={{ strokeDasharray: circ, strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
          stroke="currentColor"
        />
      </svg>
      <span className={`absolute text-[10px] font-semibold ${over ? "text-red-400" : "text-muted-foreground"}`}>
        {max - current}
      </span>
    </div>
  );
};

/* ────────────────── Sparkle Success Indicator ────────────────── */

const SuccessSparkles = () => (
  <div className="pointer-events-none fixed inset-0 z-[100]">
    {Array.from({ length: 12 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full"
        style={{
          left: `${50 + (Math.random() - 0.5) * 40}%`,
          top: `${50 + (Math.random() - 0.5) * 40}%`,
          background: `hsl(${260 + Math.random() * 60}, 80%, 65%)`,
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 1.5, 0], opacity: [1, 0.8, 0] }}
        transition={{ duration: 0.8, delay: i * 0.04, ease: "easeOut" }}
      />
    ))}
  </div>
);

/* ──────────────────── Quick Capture (Always Visible) ──────────────────── */

const QuickCapture = ({ onAdd }: { onAdd: (title: string, content: string) => void }) => {
  const [value, setValue] = useState("");

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    // If text contains a newline, split into title + content
    const lines = text.split("\n");
    const title = lines[0].slice(0, 80);
    const content = lines.length > 1 ? lines.slice(1).join("\n") : title;
    onAdd(title, content);
    setValue("");
  };

  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard tilt={false} glow={false} className="p-4">
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <Textarea
              placeholder="Quick capture — drop a thought here... (Shift+Enter for new line, Enter to save)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              className="bg-transparent border-0 p-0 resize-none min-h-[40px] max-h-[120px] focus-visible:ring-0 text-sm placeholder:text-muted-foreground/60"
            />
          </div>
          <MagneticButton
            onClick={submit}
            strength={0.2}
            className="rounded-full w-8 h-8 p-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shrink-0 flex items-center justify-center"
          >
            <Send className="w-3.5 h-3.5" />
          </MagneticButton>
        </div>
      </GlassCard>
    </motion.div>
  );
};

/* ──────────────────── Full Capture Form (Dialog) ──────────────────── */

const MAX_CONTENT = 2000;

const CaptureForm = ({ onAdd }: { onAdd: (item: KnowledgeItem) => void }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"note" | "link" | "insight">("note");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [sourceUrl, setSourceUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const submit = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    onAdd({
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      type,
      tags,
      sourceUrl: sourceUrl.trim() || undefined,
      pinned: false,
      createdAt: new Date().toISOString(),
    });
    setTitle(""); setContent(""); setType("note"); setTags([]); setSourceUrl("");
    setOpen(false);
    setShowSparkles(true);
    setTimeout(() => setShowSparkles(false), 1000);
    toast.success("Knowledge captured ✨");
  };

  return (
    <>
      {showSparkles && <SuccessSparkles />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <MagneticButton
            className="rounded-full gap-2 px-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg"
            strength={0.3}
          >
            <Plus className="w-4 h-4" /> Capture
          </MagneticButton>
        </DialogTrigger>
        <DialogContent className="glass border-black/10 dark:border-white/10 max-w-md backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl gradient-text">Capture Knowledge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="glow-input rounded-lg transition-all duration-300">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 focus-visible:ring-0"
              />
            </div>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass border-black/10 dark:border-white/10 backdrop-blur-xl">
                <SelectItem value="note">📝 Note</SelectItem>
                <SelectItem value="link">🔗 Link</SelectItem>
                <SelectItem value="insight">💡 Insight</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <div className="glow-input rounded-lg transition-all duration-300">
                <Textarea
                  placeholder="What's on your mind..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 min-h-[100px] focus-visible:ring-0 pr-14"
                />
              </div>
              <div className="absolute right-2 bottom-2">
                <CircularProgress current={content.length} max={MAX_CONTENT} />
              </div>
            </div>
            {type === "link" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="glow-input rounded-lg transition-all duration-300"
              >
                <Input
                  placeholder="Source URL"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 focus-visible:ring-0"
                />
              </motion.div>
            )}
            <div>
              <div className="flex gap-2 mb-2">
                <div className="flex-1 glow-input rounded-lg transition-all duration-300">
                  <Input
                    placeholder="Add tag... (press Enter)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 focus-visible:ring-0"
                  />
                </div>
                <Button variant="outline" onClick={addTag}
                  className="border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 shrink-0 h-10 px-3">
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <AnimatePresence>
                    {tags.map((t, i) => (
                      <motion.div
                        key={t}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15, delay: i * 0.05 }}
                      >
                        <Badge
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-destructive/20 bg-purple-500/15 text-purple-300 border border-purple-500/20 transition-colors"
                          onClick={() => setTags(tags.filter((x) => x !== t))}
                        >
                          {t} <X className="w-3 h-3 ml-1" />
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
            <MagneticButton
              onClick={submit}
              strength={0.2}
              className="w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 font-medium"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Save Knowledge
            </MagneticButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* ──────────────────── Knowledge Card ──────────────────── */

const KnowledgeCard = ({
  item, onSummarize, onAutoTag, onDelete, onTogglePin, isLoading, index
}: {
  item: KnowledgeItem;
  onSummarize: (id: string) => void;
  onAutoTag: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  isLoading?: string | null;
  index: number;
}) => {
  const Icon = typeIcons[item.type];
  const isBusy = isLoading === item.id;

  return (
    <ScrollReveal delay={Math.min(index * 0.05, 0.2)}>
      <GlassCard
        tilt={false}
        glow={true}
        className="p-5 animated-gradient-border group"
      >
        {/* Pin indicator */}
        {item.pinned && (
          <motion.div
            className="absolute top-2 right-2 z-20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </motion.div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <h3 className="font-display text-base text-display leading-tight">{item.title}</h3>
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" />
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Content */}
        <p className="text-sm text-body line-clamp-2 mb-3 leading-relaxed">{item.content}</p>

        {/* AI Summary */}
        {item.summary && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-purple-500/10 mb-3"
          >
            <p className="text-xs text-purple-300 flex items-start gap-2">
              <Sparkles className="w-3 h-3 mt-0.5 shrink-0 text-purple-400" />
              {item.summary}
            </p>
          </motion.div>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-white/5 border border-white/10 text-muted-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
          <div className="flex gap-1.5">
            <Button
              size="sm" variant="ghost"
              className="text-xs h-7 text-muted-foreground hover:text-purple-400 gap-1 hover:bg-purple-500/10"
              onClick={() => onSummarize(item.id)} disabled={isBusy}
            >
              <Zap className="w-3 h-3" /> {isBusy ? "..." : "Summarize"}
            </Button>
            <Button
              size="sm" variant="ghost"
              className="text-xs h-7 text-muted-foreground hover:text-blue-400 gap-1 hover:bg-blue-500/10"
              onClick={() => onAutoTag(item.id)} disabled={isBusy}
            >
              <Tag className="w-3 h-3" /> {isBusy ? "..." : "Auto-tag"}
            </Button>
            <Button
              size="sm" variant="ghost"
              className={`text-xs h-7 gap-1 ${item.pinned
                ? "text-yellow-400 hover:text-yellow-500 hover:bg-yellow-500/10"
                : "text-muted-foreground hover:text-yellow-400 hover:bg-yellow-500/10"
                }`}
              onClick={() => onTogglePin(item.id)}
            >
              {item.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
              {item.pinned ? "Unpin" : "Pin"}
            </Button>
          </div>
          <Button
            size="sm" variant="ghost"
            className="text-xs h-7 text-muted-foreground hover:text-red-400 gap-1 hover:bg-red-500/10"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this thought?")) onDelete(item.id);
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </GlassCard>
    </ScrollReveal>
  );
};

/* ──────────────── Animated Empty State ──────────────── */

const EmptyState = () => (
  <motion.div
    className="text-center py-20"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
  >
    <FloatingElement delay={0} duration={4}>
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shadow-float">
        <Brain className="w-10 h-10 text-purple-400/60" />
      </div>
    </FloatingElement>
    <motion.h3
      className="font-display text-xl text-display mb-2"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
    >
      Your knowledge awaits
    </motion.h3>
    <motion.p
      className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
    >
      Start capturing thoughts, links, and insights to build your second brain.
    </motion.p>
  </motion.div>
);

/* ──────────────────── Skeleton Loader ──────────────────── */

const SkeletonCard = () => (
  <div className="rounded-xl border border-white/5 bg-white/5 p-5 h-[180px] w-full overflow-hidden relative">
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    <div className="flex items-center gap-3 mb-4">
      <div className="w-7 h-7 rounded-lg bg-white/10" />
      <div className="h-4 w-32 bg-white/10 rounded" />
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 w-full bg-white/10 rounded" />
      <div className="h-3 w-3/4 bg-white/10 rounded" />
    </div>
    <div className="flex gap-2">
      <div className="h-6 w-16 rounded-full bg-white/10" />
      <div className="h-6 w-16 rounded-full bg-white/10" />
    </div>
  </div>
);

/* ──────────────── Mindspace Sections ──────────────── */

const FreshThoughts = ({ items }: { items: KnowledgeItem[] }) => {
  const recent = items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <ScrollReveal>
      <div className="mb-8">
        <h2 className="font-display text-lg text-display mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" /> Fresh Thoughts
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {recent.map((item) => {
            const Icon = typeIcons[item.type];
            return (
              <motion.div
                key={item.id}
                className="snap-start shrink-0 w-[260px]"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <GlassCard tilt={false} glow={false} className="p-4 h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-display text-sm text-display truncate">{item.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.content}</p>
                  {item.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {item.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px] bg-white/5 border border-white/10 text-muted-foreground">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ScrollReveal>
  );
};

const PinnedIdeas = ({ items, onTogglePin }: { items: KnowledgeItem[]; onTogglePin: (id: string) => void }) => {
  const pinned = items.filter(i => i.pinned);
  if (pinned.length === 0) return null;

  return (
    <ScrollReveal delay={0.1}>
      <div className="mb-8">
        <h2 className="font-display text-lg text-display mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Ideas Worth Revisiting
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pinned.map((item) => {
            const Icon = typeIcons[item.type];
            return (
              <motion.div key={item.id} whileHover={{ scale: 1.02 }}>
                <GlassCard tilt={false} glow={true} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-display text-sm text-display truncate">{item.title}</span>
                    </div>
                    <button onClick={() => onTogglePin(item.id)} className="text-yellow-400 hover:text-yellow-500 transition-colors">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ScrollReveal>
  );
};

const EmergingPatterns = ({ items }: { items: KnowledgeItem[] }) => {
  const tagStats = useMemo(() => {
    const counts: Record<string, number> = {};
    items.flatMap(i => i.tags).forEach(tag => { counts[tag] = (counts[tag] || 0) + 1; });
    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [items]);

  if (tagStats.length === 0) return null;

  const maxCount = tagStats[0]?.count || 1;

  return (
    <ScrollReveal delay={0.15}>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg text-display flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" /> Emerging Patterns
          </h2>
          <Link to="/patterns" className="text-xs text-muted-foreground hover:text-purple-400 transition-colors flex items-center gap-1">
            Explore <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <GlassCard tilt={false} glow={false} className="p-4">
          <div className="flex flex-wrap gap-2">
            {tagStats.map((stat, i) => {
              const intensity = stat.count / maxCount;
              return (
                <motion.div
                  key={stat.tag}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 15 }}
                >
                  <Badge
                    className="cursor-default transition-all duration-300 text-purple-700 dark:text-purple-300"
                    style={{
                      fontSize: `${Math.max(11, 11 + intensity * 6)}px`,
                      background: `rgba(139, 92, 246, ${0.1 + intensity * 0.2})`,
                      borderColor: `rgba(139, 92, 246, ${0.2 + intensity * 0.3})`,
                    }}
                  >
                    {stat.tag} <span className="ml-1 opacity-60">×{stat.count}</span>
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </ScrollReveal>
  );
};

const InsightPreview = ({ items }: { items: KnowledgeItem[] }) => {
  const insights = useMemo(() => store.generateLocalInsights(), [items]);

  if (insights.length === 0) return null;

  return (
    <ScrollReveal delay={0.2}>
      <div className="mb-8">
        <h2 className="font-display text-lg text-display mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4 text-pink-400" /> AI Insights
        </h2>
        <GlassCard tilt={false} glow={true} className="p-4">
          <div className="space-y-2">
            {insights.slice(0, 4).map((insight, i) => (
              <motion.p
                key={i}
                className="text-sm text-body flex items-start gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Sparkles className="w-3 h-3 mt-1 shrink-0 text-purple-400" />
                <span dangerouslySetInnerHTML={{
                  __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-300">$1</strong>')
                }} />
              </motion.p>
            ))}
          </div>
        </GlassCard>
      </div>
    </ScrollReveal>
  );
};

/* ══════════════════════════ DASHBOARD ══════════════════════════ */

const Dashboard = () => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    store.getAllThoughts()
      .then((data) => setItems(data))
      .catch(() => toast.error("Failed to load notes"))
      .finally(() => setLoading(false));
  }, []);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [showChat, setShowChat] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) =>
        i.title.toLowerCase().includes(q) ||
        i.content.toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (typeFilter === "pinned") result = result.filter((i) => i.pinned);
    else if (typeFilter !== "all") result = result.filter((i) => i.type === typeFilter);

    return [...result].sort((a, b) => {
      // Pinned items first
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return sortBy === "date"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : a.title.localeCompare(b.title);
    });
  }, [items, search, typeFilter, sortBy]);

  const addItem = async (item: KnowledgeItem) => {
    try {
      const newItem = await store.addThought({
        title: item.title,
        content: item.content,
        type: item.type,
        tags: item.tags,
        sourceUrl: item.sourceUrl,
        summary: item.summary,
      });
      setItems((prev) => [newItem, ...prev]);

      // Auto-summarize in the background
      try {
        const summary = await aiApi.summarize(newItem.content);
        const updated = store.updateThought(newItem.id, { summary });
        setItems(updated);
      } catch (error) {
        console.warn("Auto-summary failed:", error);
        toast.error("Auto-summary paused (Rate Limit). Try manually later.");
      }

      // Auto-tag in the background
      try {
        const newTags = await aiApi.autoTag(newItem.title, newItem.content);
        if (newTags.length > 0) {
          const current = items.find(i => i.id === newItem.id);
          const existingTags = current?.tags || newItem.tags;
          const updated = store.updateThought(newItem.id, {
            tags: [...new Set([...existingTags, ...newTags])]
          });
          setItems(updated);
        }
      } catch {
        // Silent fail for auto-tag
      }
    } catch {
      toast.error("Failed to save note");
    }
  };

  const handleQuickCapture = async (title: string, content: string) => {
    const item: KnowledgeItem = {
      id: "",
      title,
      content,
      type: "note",
      tags: [],
      pinned: false,
      createdAt: new Date().toISOString(),
    };
    await addItem(item);
    toast.success("Thought captured ⚡");
  };

  const handleSummarize = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setLoadingItemId(id);
    try {
      const summary = await aiApi.summarize(item.content);
      const updated = store.updateThought(id, { summary });
      setItems(updated);
      toast.success("Summary generated ✨");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Summarization failed");
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleAutoTag = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setLoadingItemId(id);
    try {
      const newTags = await aiApi.autoTag(item.title, item.content);
      const updated = store.updateThought(id, {
        tags: [...new Set([...item.tags, ...newTags])]
      });
      setItems(updated);
      toast.success("Tags generated ✨");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auto-tagging failed");
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const updated = await store.deleteThought(id);
    setItems(updated);
    toast.success("Thought deleted");
  };

  const handleTogglePin = (id: string) => {
    const updated = store.togglePin(id);
    setItems(updated);
    const item = updated.find(i => i.id === id);
    toast.success(item?.pinned ? "Pinned ⭐" : "Unpinned");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <GradientMesh className="opacity-40" />
      <ParticleBackground density={15} />
      <CursorSpotlight size={350} intensity={0.1} />

      {/* ───── Nav ───── */}
      <nav className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <FloatingElement delay={0} duration={5}>
            <Link to="/" className="font-display text-xl italic text-display hover:scale-105 transition-transform">
              Second Brain
            </Link>
          </FloatingElement>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/patterns">
              <MagneticButton
                strength={0.2}
                className="rounded-full gap-1.5 text-xs sm:text-sm px-3 py-1.5 glass border-white/10 text-muted-foreground hover:text-display"
              >
                <Compass className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Patterns</span>
              </MagneticButton>
            </Link>
            <ApiKeySettings />
            <ModeToggle />
            <MagneticButton
              strength={0.2}
              className={`rounded-full gap-1.5 text-xs sm:text-sm px-3 py-1.5 ${showChat
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "glass border-white/10 text-muted-foreground hover:text-display"
                }`}
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Ask</span>
            </MagneticButton>
            <CaptureForm onAdd={addItem} />
          </div>
        </div>
      </nav>

      {/* ───── Main Content ───── */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-8 flex gap-8 relative z-10">
        <div className="flex-1 min-w-0">
          {/* Quick Capture */}
          <QuickCapture onAdd={handleQuickCapture} />

          {/* Mindspace Sections */}
          {!loading && items.length > 0 && (
            <>
              <FreshThoughts items={items} />
              <PinnedIdeas items={items} onTogglePin={handleTogglePin} />
              <EmergingPatterns items={items} />
              <InsightPreview items={items} />
            </>
          )}

          {/* Divider */}
          {items.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">All Thoughts</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
          )}

          {/* Search & filter controls */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 mb-6"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative flex-1 glow-input rounded-full transition-all duration-300">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search your brain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 rounded-full focus-visible:ring-0"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32 bg-white/5 border-white/10 rounded-full">
                <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass border-white/10 backdrop-blur-xl">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="note">Notes</SelectItem>
                <SelectItem value="link">Links</SelectItem>
                <SelectItem value="insight">Insights</SelectItem>
                <SelectItem value="pinned">⭐ Pinned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-32 bg-white/5 border-white/10 rounded-full">
                <SortAsc className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass border-white/10 backdrop-blur-xl">
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Knowledge cards grid */}
          <div className="grid md:grid-cols-2 gap-5">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                  >
                    <SkeletonCard />
                  </motion.div>
                ))
              ) : (
                filtered.map((item, i) => (
                  <KnowledgeCard
                    key={item.id}
                    item={item}
                    onSummarize={handleSummarize}
                    onAutoTag={handleAutoTag}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                    isLoading={loadingItemId}
                    index={i}
                  />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Empty state */}
          {!loading && filtered.length === 0 && <EmptyState />}
        </div>

        {/* AI Chat Panel — Desktop */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="shrink-0 hidden lg:block"
            >
              <AIChat items={items} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Chat — Mobile Overlay */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowChat(false)} />
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[80vh] rounded-t-2xl overflow-hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <AIChat items={items} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default Dashboard;
