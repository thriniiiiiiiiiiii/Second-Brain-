import { Ollama } from 'ollama';

const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434' });
const model = process.env.OLLAMA_MODEL || 'llama3';

console.log(`✅ Ollama Service initialized (Model: ${model})`);

export class OllamaService {
    static async summarize(text: string): Promise<string> {
        try {
            const response = await ollama.generate({
                model,
                prompt: `Summarize this note in one sentence:\n\n${text}`,
                stream: false,
            });
            return response.response;
        } catch (err) {
            console.error("Ollama summarize failed:", err);
            throw err;
        }
    }

    static async generateTags(title: string, content: string): Promise<string[]> {
        try {
            const response = await ollama.generate({
                model,
                prompt: `Give 3 short tags for this note.\nTitle: ${title}\nContent: ${content}\nReturn comma-separated tags only, no numbering.`,
                stream: false,
            });
            return response.response
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
        } catch (err) {
            console.error("Ollama tags failed:", err);
            throw err;
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

            // Convert messages to Ollama format
            const ollamaMessages = [
                { role: 'system', content: systemPrompt },
                ...messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                })),
            ];

            const response = await ollama.chat({
                model,
                messages: ollamaMessages,
                stream: false,
            });

            return response.message.content;
        } catch (err) {
            console.error("Ollama chat failed:", err);
            throw err;
        }
    }

    static async generateInsight(
        theme: string,
        noteCount: number,
        sampleTitles: string[],
        periodLabel: string
    ): Promise<string> {
        try {
            const titlesText = sampleTitles.map((t) => `- "${t}"`).join('\n');
            const response = await ollama.generate({
                model,
                prompt: `You are analyzing a user's personal knowledge base. Generate a single, concise, insightful observation about this pattern:

Theme: "${theme}"
Number of notes: ${noteCount}
Time period: ${periodLabel}
Sample note titles:
${titlesText}

Write ONE sentence that is observational and insightful. Examples:
- "You've written 12 notes about AI agents in the past week — this topic is clearly on your mind."
- "Your interest in machine learning has grown steadily over the past month with 8 related notes."

Return ONLY the insight sentence, nothing else.`,
                stream: false,
            });
            return response.response.trim();
        } catch (err) {
            console.error("Ollama generateInsight failed:", err);
            throw err;
        }
    }
}
