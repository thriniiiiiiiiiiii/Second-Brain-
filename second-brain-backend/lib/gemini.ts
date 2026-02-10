import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing!");
} else {
    console.log(`✅ Gemini initialized with key starting: ${apiKey.substring(0, 4)}...`);
}

const genAI = new GoogleGenerativeAI(apiKey || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export class GeminiService {
    static async summarize(text: string): Promise<string> {
        try {
            const prompt = `Summarize this note in one sentence:\n\n${text}`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (err) {
            console.error("Gemini summarize failed:", err);
            throw err;
        }
    }

    static async generateTags(title: string, content: string): Promise<string[]> {
        try {
            const prompt = `Give 3 short tags for this note.\nTitle: ${title}\nContent: ${content}\nReturn comma-separated tags only.`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return text
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
        } catch (err) {
            console.error("Gemini tags failed:", err);
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

            const systemInstruction = context
                ? `You are a helpful assistant. Use the following knowledge to help answer questions:\n\n${context}`
                : "You are a helpful assistant.";

            // Gemini history format
            const history = messages.slice(0, -1).map((m) => ({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }],
            }));

            const lastMessage = messages[messages.length - 1].content;

            const chatSession = model.startChat({
                history: history,
                systemInstruction: { role: "system", parts: [{ text: systemInstruction }] },
            });

            const result = await chatSession.sendMessage(lastMessage);
            return result.response.text();
        } catch (err) {
            console.error("Gemini chat failed:", err);
            throw err;
        }
    }
}
