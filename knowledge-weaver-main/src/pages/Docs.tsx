import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Layers, Compass, Bot, Globe } from "lucide-react";

const Section = ({ icon: Icon, title, children, delay = 0 }: any) => (
  <motion.section
    className="mb-16"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="flex items-center gap-3 mb-5">
      <span className="p-2.5 rounded-xl bg-secondary text-muted-foreground">
        <Icon className="w-5 h-5" />
      </span>
      <h2 className="font-display text-2xl text-display">{title}</h2>
    </div>
    <div className="text-body leading-relaxed space-y-4 pl-14">{children}</div>
  </motion.section>
);

const DocsPage = () => (
  <div className="min-h-screen bg-background">
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
        <Link to="/" className="text-muted-foreground hover:text-display transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="font-display italic text-display">Documentation</span>
      </div>
    </nav>

    <div className="max-w-3xl mx-auto px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-20">
        <h1 className="font-display text-4xl md:text-5xl text-display mb-4">
          Architecture & Design
        </h1>
        <p className="text-lg text-body max-w-xl">
          How Second Brain is built — principles, architecture, and thinking.
        </p>
      </motion.div>

      <Section icon={Layers} title="Portable Architecture" delay={0.1}>
        <p>Every layer is swappable. Presentation (React), State (React Query), API (Edge Functions), Data (PostgreSQL), AI (OpenAI-compatible). Change one without touching others.</p>
        <div className="bg-secondary rounded-xl p-5 text-sm font-mono space-y-1.5">
          <p><span className="text-accent">Presentation</span> → React + Tailwind + Framer Motion</p>
          <p><span className="text-accent">API</span> → Edge Functions (provider-agnostic)</p>
          <p><span className="text-accent">Data</span> → PostgreSQL via Supabase</p>
          <p><span className="text-accent">AI</span> → Anthropic Claude</p>
        </div>
      </Section>

      <Section icon={Compass} title="UX Principles" delay={0.15}>
        <ol className="list-decimal list-inside space-y-2.5">
          <li><strong className="text-display">Progressive disclosure</strong> — show essentials first, reveal advanced features on interaction.</li>
          <li><strong className="text-display">Immediate feedback</strong> — every action provides instant visual response.</li>
          <li><strong className="text-display">Conversational AI</strong> — natural language queries, answers cite sources.</li>
          <li><strong className="text-display">Visual hierarchy</strong> — serif for headings, sans for body; restrained accent colors.</li>
          <li><strong className="text-display">Keyboard-first</strong> — capture and search accessible via keyboard.</li>
        </ol>
      </Section>

      <Section icon={Bot} title="Agent Thinking" delay={0.2}>
        <p>Autonomous AI agents that improve the knowledge base:</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong className="text-display">Summarization</strong> — concise summaries for every entry.</li>
          <li><strong className="text-display">Auto-tagging</strong> — semantic categorization from content.</li>
          <li><strong className="text-display">Query agent</strong> — retrieval + synthesis with citations.</li>
        </ul>
      </Section>

      <Section icon={Globe} title="Infrastructure Mindset" delay={0.25}>
        <p>Two public interfaces expose Second Brain:</p>
        <div className="bg-secondary rounded-xl p-5 text-sm font-mono space-y-3">
          <div>
            <span className="text-accent">GET /api/public/brain/query?q=...</span>
            <p className="text-muted-foreground mt-1 font-sans">JSON response with answers and sources. Rate-limited, CORS-enabled.</p>
          </div>
          <div>
            <span className="text-accent">/query (Widget)</span>
            <p className="text-muted-foreground mt-1 font-sans">Embeddable search page for external sites.</p>
          </div>
        </div>
      </Section>
    </div>
  </div>
);

export default DocsPage;
