import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!,
});

// Helper to safely extract text from Claude response
function extractText(content: Anthropic.ContentBlock[]): string {
  const textBlock = content.find((block) => block.type === "text");
  return textBlock && "text" in textBlock ? textBlock.text : "";
}

export class ClaudeService {
  static async summarize(text: string): Promise<string> {
    try {
      const message = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: `Summarize this note in one sentence:\n\n${text}`,
          },
        ],
      });

      return extractText(message.content);
    } catch (err) {
      console.error("Claude summarize failed:", err);
      throw err; // Propagate error to route handler
    }
  }

  static async generateTags(
    title: string,
    content: string
  ): Promise<string[]> {
    try {
      const message = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: `Give 3 short tags for this note.\nTitle: ${title}\nContent: ${content}\nReturn comma-separated.`,
          },
        ],
      });

      const text = extractText(message.content);
      return text
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } catch (err) {
      console.error("Claude tags failed:", err);
      throw err; // Propagate error to route handler
    }
  }

  static async chat(
    messages: { role: string; content: string }[],
    knowledge: { title: string; content: string }[]
  ): Promise<string> {
    try {
      // Build context from knowledge items
      const context = knowledge
        .map((k) => `### ${k.title}\n${k.content}`)
        .join("\n\n");

      const systemPrompt = context
        ? `You are a helpful assistant. Use the following knowledge to help answer questions:\n\n${context}`
        : "You are a helpful assistant.";

      // Convert messages to Anthropic format
      const anthropicMessages = messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        system: systemPrompt,
        messages: anthropicMessages,
      });

      return extractText(response.content);
    } catch (err) {
      console.error("Claude chat failed:", err);
      throw err; // Propagate error to route handler
    }
  }
}
