import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Send, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PublicQuery = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { answer: string; sources: { title: string; type: string }[] }>(null);

  const handleQuery = () => {
    if (!query.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setResult({
        answer: "Transformers use self-attention mechanisms for parallel processing. The key innovation is multi-head attention allowing simultaneous focus on different representation subspaces.",
        sources: [
          { title: "Understanding Transformer Architecture", type: "note" },
          { title: "PostgreSQL vs Vector Search", type: "note" },
        ],
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-display transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-display italic text-display">Public Query</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div className="w-full max-w-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-10">
            <Search className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-3xl text-display mb-2">Query the Brain</h1>
            <p className="text-body text-sm">Public API endpoint. Embeddable via iframe.</p>
          </div>

          <div className="bg-secondary rounded-xl p-3 mb-6 text-xs font-mono text-muted-foreground">
            <span className="text-accent">GET</span> /api/public/brain/query?q={query || "..."}
          </div>

          <div className="flex gap-3 mb-8">
            <Input placeholder="Ask anything..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleQuery()} className="bg-card border-border rounded-full" />
            <Button onClick={handleQuery} disabled={loading || !query.trim()} className="rounded-full px-6 gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Query
            </Button>
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-sm mb-3">Answer</h3>
              <p className="text-sm text-body leading-relaxed mb-5">{result.answer}</p>
              <div>
                <h4 className="text-xs text-muted-foreground mb-2">Sources</h4>
                {result.sources.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm py-2 border-b border-border last:border-0">
                    <ExternalLink className="w-3 h-3 text-accent" />
                    <span className="text-display">{s.title}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{s.type}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PublicQuery;
