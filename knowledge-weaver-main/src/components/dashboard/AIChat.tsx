import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MagneticButton } from "@/components/ui/magnetic-button";
import * as aiApi from "@/lib/aiApi";
import type { Thought } from "@/lib/thoughtStore";

type Message = { role: "user" | "assistant"; content: string };

interface AIChatProps {
  items?: Thought[];
}

/**
 * AI Chat Panel — Context-aware brain companion
 */
const AIChat = ({ items = [] }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! 👋 I'm your brain companion. Ask me anything about your thoughts, patterns, or connections. I know everything you've captured!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Build context from knowledge items
  const buildContext = (): string => {
    if (items.length === 0) return "";
    const thoughtSummaries = items
      .slice(0, 30) // Limit to avoid token overflow
      .map(
        (item) =>
          `- [${item.type}] "${item.title}": ${item.content.slice(0, 200)}${item.content.length > 200 ? "..." : ""
          } (tags: ${item.tags.join(", ") || "none"}${item.pinned ? ", ⭐ pinned" : ""
          })`
      )
      .join("\n");

    return `Here are the user's captured thoughts for context:\n${thoughtSummaries}\n\nUse this context to give personalized, insightful responses. Be witty but helpful. Reference their specific thoughts when relevant. Look for patterns and connections between ideas.`;
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Add context about knowledge items
      const context = buildContext();
      const conversationMessages = updatedMessages
        .filter((_, i) => i > 0 || updatedMessages[0].role === "user")
        .map((msg, i) => {
          if (i === 0 && context) {
            return { ...msg, content: `${context}\n\nUser question: ${msg.content}` };
          }
          return msg;
        });

      const reply = await aiApi.chat(conversationMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      // Fallback: generate a local response based on context
      const fallbackResponse = generateLocalResponse(input.trim(), items);
      setMessages((prev) => [...prev, { role: "assistant", content: fallbackResponse }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] lg:sticky lg:top-20 flex flex-col rounded-t-2xl lg:rounded-2xl glass border-white/10 overflow-hidden shadow-float">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <span className="font-display text-sm gradient-text">Chat with Your Brain</span>
        {items.length > 0 && (
          <span className="text-[10px] text-muted-foreground ml-auto">
            {items.length} thoughts loaded
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div className="flex items-end gap-2 max-w-[85%]">
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0 mb-1">
                    <Bot className="w-3 h-3 text-purple-400" />
                  </div>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "glass border-white/10"
                    }`}
                >
                  {msg.content.split("\n").map((line, j) => (
                    <span key={j}>
                      {line.split(/(\*\*.*?\*\*)/).map((part, k) =>
                        part.startsWith("**") && part.endsWith("**")
                          ? <strong key={k}>{part.slice(2, -2)}</strong>
                          : part
                      )}
                      {j < msg.content.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0 mb-1">
                    <User className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-end gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0 mb-1">
                <Bot className="w-3 h-3 text-purple-400" />
              </div>
              <div className="glass border-white/10 px-4 py-3 rounded-2xl flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-purple-400"
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <div className="flex-1 glow-input rounded-full transition-all duration-300">
            <Input
              placeholder="Ask about patterns, connections, themes..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              className="bg-white/5 border-white/10 rounded-full focus-visible:ring-0"
            />
          </div>
          <MagneticButton
            onClick={send}
            disabled={loading || !input.trim()}
            strength={0.3}
            className="rounded-full w-9 h-9 p-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shrink-0 flex items-center justify-center disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </MagneticButton>
        </div>
      </div>
    </div>
  );
};

/* ─────────── Local Fallback Response ─────────── */

function generateLocalResponse(query: string, items: Thought[]): string {
  const q = query.toLowerCase();

  if (items.length === 0) {
    return "You haven't captured any thoughts yet! Start by adding some notes, links, or insights and I'll be able to help you find patterns and connections. 🧠";
  }

  // Pattern-related queries
  if (q.includes("pattern") || q.includes("theme") || q.includes("recurring")) {
    const tags = items.flatMap((i) => i.tags);
    const counts: Record<string, number> = {};
    tags.forEach((t) => (counts[t] = (counts[t] || 0) + 1));
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) return "I see you haven't tagged many thoughts yet. Try adding tags to see patterns emerge! 🏷️";

    const top = sorted.slice(0, 5).map(([tag, count]) => `**${tag}** (${count}×)`).join(", ");
    return `Looking at your brain, here are your recurring themes: ${top}\n\nThese are the topics you keep coming back to. Seems like they're on your mind a lot! 🔍`;
  }

  // Search queries
  if (q.includes("about") || q.includes("find") || q.includes("search")) {
    const keywords = q.replace(/about|find|search|tell me|what|do i have|anything/gi, "").trim().split(" ");
    const matches = items.filter((item) =>
      keywords.some((k) =>
        k.length > 2 &&
        (item.title.toLowerCase().includes(k) ||
          item.content.toLowerCase().includes(k) ||
          item.tags.some((t) => t.toLowerCase().includes(k)))
      )
    );

    if (matches.length > 0) {
      const list = matches.slice(0, 5).map((m) => `• **${m.title}**: ${m.content.slice(0, 100)}...`).join("\n");
      return `Found ${matches.length} related thought${matches.length > 1 ? "s" : ""}:\n\n${list}`;
    }
    return "Hmm, I couldn't find anything matching that in your brain. Try capturing some thoughts about it! 💭";
  }

  // Stats
  if (q.includes("how many") || q.includes("stats") || q.includes("count")) {
    const pinned = items.filter((i) => i.pinned).length;
    const notes = items.filter((i) => i.type === "note").length;
    const links = items.filter((i) => i.type === "link").length;
    const insights = items.filter((i) => i.type === "insight").length;
    return `📊 Your brain stats:\n\n• **${items.length}** total thoughts\n• **${notes}** notes, **${links}** links, **${insights}** insights\n• **${pinned}** pinned favorites\n• **${new Set(items.flatMap((i) => i.tags)).size}** unique tags\n\nKeep feeding your brain! 🧠`;
  }

  // Default
  return `Interesting question! You have **${items.length}** thoughts captured. I can help you find patterns, search your thoughts, or discover connections. Try asking:\n\n• "What are my recurring themes?"\n• "Find thoughts about [topic]"\n• "Show me my brain stats"\n• "What should I focus on?"`;
}

export default AIChat;
