/**
 * Smart AI Provider
 * 
 * Tries Gemini first (cloud API, always available if key is set),
 * falls back to Ollama (local, requires running server).
 * If both fail, errors propagate to the caller.
 */

import { GeminiService } from './gemini';
import { OllamaService } from './ollama';

const useGemini = !!process.env.GEMINI_API_KEY;

// Quick check if Ollama is reachable
async function isOllamaAvailable(): Promise<boolean> {
    try {
        const host = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${host}/api/tags`, { signal: controller.signal });
        clearTimeout(timeout);
        return res.ok;
    } catch {
        return false;
    }
}

export class AIProvider {
    static async summarize(text: string, provider?: "gemini" | "ollama" | "auto"): Promise<string> {
        // Explicit provider requests
        if (provider === "gemini" && useGemini) {
            return await GeminiService.summarize(text);
        }
        if (provider === "ollama") {
            return await OllamaService.summarize(text);
        }

        // Auto mode: Try Gemini first
        if (useGemini) {
            try {
                return await GeminiService.summarize(text);
            } catch (err) {
                console.warn('⚠️ Gemini summarize failed, trying Ollama...', err);
            }
        }

        // Fallback to Ollama
        if (await isOllamaAvailable()) {
            return await OllamaService.summarize(text);
        }

        throw new Error('No AI provider available. Set GEMINI_API_KEY or run Ollama locally.');
    }

    static async generateTags(title: string, content: string, provider?: "gemini" | "ollama" | "auto"): Promise<string[]> {
        if (provider === "gemini" && useGemini) {
            return await GeminiService.generateTags(title, content);
        }
        if (provider === "ollama") {
            return await OllamaService.generateTags(title, content);
        }

        if (useGemini) {
            try {
                return await GeminiService.generateTags(title, content);
            } catch (err) {
                console.warn('⚠️ Gemini tags failed, trying Ollama...', err);
            }
        }

        if (await isOllamaAvailable()) {
            return await OllamaService.generateTags(title, content);
        }

        throw new Error('No AI provider available. Set GEMINI_API_KEY or run Ollama locally.');
    }

    static async chat(
        messages: { role: string; content: string }[],
        knowledge: { title: string; content: string }[],
        provider?: "gemini" | "ollama" | "auto"
    ): Promise<string> {
        if (provider === "gemini" && useGemini) {
            return await GeminiService.chat(messages, knowledge);
        }
        if (provider === "ollama") {
            return await OllamaService.chat(messages, knowledge);
        }

        if (useGemini) {
            try {
                return await GeminiService.chat(messages, knowledge);
            } catch (err) {
                console.warn('⚠️ Gemini chat failed, trying Ollama...', err);
            }
        }

        if (await isOllamaAvailable()) {
            return await OllamaService.chat(messages, knowledge);
        }

        throw new Error('No AI provider available. Set GEMINI_API_KEY or run Ollama locally.');
    }
}
