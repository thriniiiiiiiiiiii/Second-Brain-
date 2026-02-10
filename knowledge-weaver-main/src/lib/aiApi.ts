/**
 * AI API — Frontend client for Backend AI services
 *
 * Calls the backend API at /api/ai/* (proxied by Vite to localhost:3000)
 */

import { toast } from "sonner";

const API_BASE = "/api/ai";
const PROVIDER_KEY = "knowledge-weaver-ai-provider";

export type Message = {
    role: "user" | "assistant";
    content: string;
};

export type AIProvider = "auto" | "gemini" | "ollama";

/* ─────────── Provider Management ─────────── */

export function getProvider(): AIProvider {
    return (localStorage.getItem(PROVIDER_KEY) as AIProvider) || "auto";
}

export function setProvider(provider: AIProvider) {
    localStorage.setItem(PROVIDER_KEY, provider);
}

function getHeaders() {
    return {
        "Content-Type": "application/json",
        "X-AI-Provider": getProvider(),
    };
}

/* ─────────── API Calls ─────────── */

/**
 * Summarize content using Backend AI
 */
export async function summarize(content: string, itemId?: string): Promise<string> {
    const res = await fetch(`${API_BASE}/summarize`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ content, itemId }),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Summarization failed");
    }

    const data = await res.json();
    return data.summary;
}

/**
 * Auto-generate tags using Backend AI
 */
export async function autoTag(title: string, content: string, itemId?: string): Promise<string[]> {
    const res = await fetch(`${API_BASE}/auto-tag`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ title, content, itemId }),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Auto-tagging failed");
    }

    const data = await res.json();
    return data.tags;
}

/**
 * Chat with your knowledge base using Backend AI
 */
export async function chat(messages: Message[]): Promise<string> {
    const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Chat failed");
    }

    const data = await res.json();
    return data.response;
}

// Re-export specific backend features if needed in future
