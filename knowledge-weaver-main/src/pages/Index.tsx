import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Sparkles, FileText, Search, MessageCircle, Globe,
  Brain, Zap, Star, TrendingUp, Shield, Tag, Pin, Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientMesh } from "@/components/ui/gradient-mesh";
import { CursorSpotlight } from "@/components/ui/cursor-spotlight";
import { ParticleBackground } from "@/components/ui/particle-background";
import { FloatingElement } from "@/components/ui/floating-element";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";

/* ───── Stagger animation config (fast) ───── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const child = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

/* ───── Live demo card data ───── */
const demoThoughts = [
  { title: "Learn Rust for WASM", type: "note" as const, tags: ["rust", "wasm"], time: "2m ago" },
  { title: "Interesting AI paper on RAG", type: "link" as const, tags: ["ai", "rag"], time: "1h ago" },
  { title: "Connection: creativity + constraints", type: "insight" as const, tags: ["creativity"], time: "3h ago" },
];
const typeColors = {
  note: "from-blue-500/20 to-blue-600/20 text-blue-400",
  link: "from-green-500/20 to-emerald-600/20 text-green-400",
  insight: "from-amber-500/20 to-orange-600/20 text-amber-400",
};
const typeEmoji = { note: "📝", link: "🔗", insight: "💡" };

const Index = () => {
  return (
    <Layout>
      {/* Background layers */}
      <GradientMesh className="opacity-50" />
      <ParticleBackground density={25} />
      <CursorSpotlight size={350} intensity={0.1} />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-14">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-6 glass px-4 py-2 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI-Powered Knowledge System
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-display leading-[1.05] mb-4 text-balance">
            {["Your", "mind,", "extended."].map((word, i) => (
              <motion.span
                key={word}
                className="inline-block mr-3 sm:mr-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 + i * 0.08, type: "spring", stiffness: 200 }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            className="text-base sm:text-lg md:text-xl text-body max-w-xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.25 }}
          >
            Capture every thought. Let AI find patterns, connections, and insights you'd never spot on your own.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Link to="/dashboard">
              <MagneticButton
                className="rounded-full px-8 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl glow-primary"
                strength={0.4}
              >
                Start Capturing <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </Link>
            <Link to="/docs">
              <Button size="lg" variant="outline" className="rounded-full px-8 glass border-white/20 hover:bg-white/10">
                Read the Docs
              </Button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="flex items-center justify-center gap-6 sm:gap-10 text-sm text-muted-foreground"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.35 }}
          >
            <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-green-400" /> Local-first</div>
            <div className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-yellow-400" /> AI-powered</div>
            <div className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-blue-400" /> Open source</div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ LIVE PREVIEW ═══════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <GlassCard tilt={false} glow={true} className="p-4 sm:p-6 md:p-8 overflow-hidden">
              {/* Mock nav */}
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
                <span className="font-display text-sm italic text-display">Dashboard Preview</span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                </div>
              </div>

              {/* Quick capture mockup */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 mb-5 flex items-center gap-3">
                <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-sm text-muted-foreground flex-1">Drop a thought here...</span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* Mini thought cards */}
              <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-3" variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
                {demoThoughts.map((thought) => (
                  <motion.div key={thought.title} variants={child}>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 hover:bg-white/8 transition-colors group">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-5 h-5 rounded-md bg-gradient-to-br ${typeColors[thought.type]} flex items-center justify-center text-[10px]`}>
                          {typeEmoji[thought.type]}
                        </span>
                        <span className="text-sm text-display font-medium truncate">{thought.title}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {thought.tags.map(t => (
                            <Badge key={t} variant="secondary" className="text-[10px] bg-white/5 border border-white/10 text-muted-foreground py-0">
                              {t}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{thought.time}</span>
                      </div>
                      {/* Hover actions */}
                      <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-purple-400 flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" /> Summarize</span>
                        <span className="text-[10px] text-blue-400 flex items-center gap-0.5"><Tag className="w-2.5 h-2.5" /> Auto-tag</span>
                        <span className="text-[10px] text-yellow-400 flex items-center gap-0.5"><Pin className="w-2.5 h-2.5" /> Pin</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </GlassCard>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════ FEATURES GRID ═══════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-display mb-3">
                Everything your brain needs
              </h2>
              <p className="text-body max-w-lg mx-auto text-sm sm:text-base">
                Capture, connect, and converse with your knowledge. AI does the heavy lifting.
              </p>
            </div>
          </ScrollReveal>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-30px" }}
          >
            {[
              {
                icon: Zap, emoji: "⚡",
                title: "Capture Zone",
                description: "Quick-drop thoughts, notes, links, and insights. Keyboard-first with auto-save.",
                color: "text-yellow-400",
              },
              {
                icon: Sparkles, emoji: "✨",
                title: "Auto AI Summarization",
                description: "Every thought gets an instant AI summary. Recall ideas in seconds.",
                color: "text-purple-400",
              },
              {
                icon: Tag, emoji: "🏷️",
                title: "Smart Tagging",
                description: "AI suggests tags based on content. Build your personal taxonomy effortlessly.",
                color: "text-blue-400",
              },
              {
                icon: MessageCircle, emoji: "💬",
                title: "Chat with Your Brain",
                description: "Ask questions about your knowledge. Get witty, contextual responses with connections.",
                color: "text-green-400",
              },
              {
                icon: Compass, emoji: "🔍",
                title: "Pattern Detective",
                description: "AI finds recurring themes, obsessions, and hidden connections across your thoughts.",
                color: "text-pink-400",
              },
              {
                icon: Pin, emoji: "📌",
                title: "Pin & Revisit",
                description: "Star your best ideas. The dashboard surfaces them so they don't get lost.",
                color: "text-orange-400",
              },
              {
                icon: Search, emoji: "🔎",
                title: "Search & Filter",
                description: "Full-text search, tag filters, type filters, and smart sorting across all thoughts.",
                color: "text-cyan-400",
              },
              {
                icon: TrendingUp, emoji: "📊",
                title: "Insights Dashboard",
                description: "Activity heatmaps, type distribution, theme clouds — see your thinking patterns.",
                color: "text-emerald-400",
              },
              {
                icon: Shield, emoji: "🔒",
                title: "Local-First Privacy",
                description: "Your data lives in your browser. Works offline. Syncs with backend when available.",
                color: "text-red-400",
              },
            ].map((feature, i) => (
              <motion.div key={feature.title} variants={child}>
                <GlassCard className="p-5 sm:p-6 h-full hover:scale-[1.02] transition-transform duration-300" tilt={false} glow={true}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center text-base">
                      {feature.emoji}
                    </div>
                    <h3 className="font-display text-base sm:text-lg text-display">{feature.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-body leading-relaxed">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 border-t border-white/5 relative z-10">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-display mb-3">
                How it works
              </h2>
              <p className="text-body text-sm sm:text-base">Three steps to a better brain.</p>
            </div>
          </ScrollReveal>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-30px" }}
          >
            {[
              {
                step: "01",
                title: "Capture",
                desc: "Drop any thought — note, link, or insight. The quick-capture bar is always ready.",
                icon: FileText,
                gradient: "from-blue-500/20 to-blue-600/10",
              },
              {
                step: "02",
                title: "Enhance",
                desc: "AI instantly summarizes, tags, and connects your thoughts to existing knowledge.",
                icon: Sparkles,
                gradient: "from-purple-500/20 to-purple-600/10",
              },
              {
                step: "03",
                title: "Discover",
                desc: "Chat with your brain, explore patterns, and surface insights you'd never find alone.",
                icon: Brain,
                gradient: "from-pink-500/20 to-pink-600/10",
              },
            ].map((item) => (
              <motion.div key={item.step} variants={child}>
                <GlassCard tilt={false} glow={false} className="p-6 text-center h-full">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.gradient} border border-white/10 flex items-center justify-center`}>
                    <item.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Step {item.step}</div>
                  <h3 className="font-display text-xl text-display mb-2">{item.title}</h3>
                  <p className="text-sm text-body leading-relaxed">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ MINDSPACE PREVIEW ═══════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-display mb-3">
                Your Mindspace, visualized
              </h2>
              <p className="text-body text-sm sm:text-base max-w-lg mx-auto">
                The Pattern Detective analyzes your thoughts to find what matters most.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ScrollReveal>
              <GlassCard tilt={false} glow={true} className="p-6">
                <h3 className="font-display text-base text-display mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" /> Theme Cloud
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    { tag: "productivity", size: 20 },
                    { tag: "AI", size: 24 },
                    { tag: "design", size: 16 },
                    { tag: "rust", size: 18 },
                    { tag: "creativity", size: 22 },
                    { tag: "web3", size: 14 },
                    { tag: "focus", size: 17 },
                    { tag: "patterns", size: 19 },
                  ].map((item) => (
                    <FloatingElement key={item.tag} delay={Math.random() * 2} duration={3 + Math.random() * 2}>
                      <span
                        className="font-display text-purple-400 cursor-default"
                        style={{
                          fontSize: `${item.size}px`,
                          textShadow: item.size > 18 ? "0 0 15px rgba(139,92,246,0.3)" : "none",
                        }}
                      >
                        {item.tag}
                      </span>
                    </FloatingElement>
                  ))}
                </div>
              </GlassCard>
            </ScrollReveal>

            <ScrollReveal>
              <GlassCard tilt={false} glow={true} className="p-6">
                <h3 className="font-display text-base text-display mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-pink-400" /> AI Insights
                </h3>
                <div className="space-y-3">
                  {[
                    "You've been obsessing over **AI** and **creativity** — maybe there's a project hiding there?",
                    "Your thinking peaks on **Wednesdays** — schedule your ideation sessions then.",
                    "5 thoughts pinned this week — you're curating well! ⭐",
                  ].map((insight, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-2 p-2.5 rounded-lg hover:bg-white/5 transition-colors"
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <Sparkles className="w-3 h-3 mt-1 shrink-0 text-purple-400" />
                      <p
                        className="text-xs sm:text-sm text-body leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-300">$1</strong>'),
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 border-t border-white/5 relative z-10">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center">
            <FloatingElement delay={0} duration={4}>
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shadow-float">
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
            </FloatingElement>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-display mb-3">
              Ready to think better?
            </h2>
            <p className="text-body mb-8 text-sm sm:text-base">
              Start building your second brain today. It only takes one thought.
            </p>
            <Link to="/dashboard">
              <MagneticButton
                className="rounded-full px-8 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-2xl glow-primary"
                strength={0.5}
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </Layout>
  );
};

export default Index;
