/**
 * Thought Store — localStorage-based data layer with API sync
 * 
 * Provides a resilient data layer that works offline (localStorage)
 * and syncs with the backend API when available.
 */

export type Thought = {
    id: string;
    title: string;
    content: string;
    type: "note" | "link" | "insight";
    tags: string[];
    sourceUrl?: string;
    summary?: string;
    pinned: boolean;
    createdAt: string;
};

const STORAGE_KEY = "knowledge-weaver-thoughts";

/* ─────────── localStorage helpers ─────────── */

function loadLocal(): Thought[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveLocal(thoughts: Thought[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(thoughts));
}

/* ─────────── API helpers ─────────── */

import { getAllNotes, createNote, deleteNote } from "./knowledgeApi";

/* ─────────── Public Store API ─────────── */

export async function getAllThoughts(): Promise<Thought[]> {
    try {
        // Try API first
        const apiData = await getAllNotes();

        // Merge with local pinned state
        const local = loadLocal();
        const pinnedIds = new Set(local.filter(t => t.pinned).map(t => t.id));

        const merged: Thought[] = apiData.map(note => ({
            id: note.id,
            title: note.title,
            content: note.content,
            type: (note.type as any) || "note",
            tags: note.tags || [],
            summary: note.summary || undefined,
            sourceUrl: undefined, // Backend doesn't support yet
            createdAt: note.createdAt,
            pinned: pinnedIds.has(note.id)
        }));

        saveLocal(merged);
        return merged;
    } catch (e) {
        console.warn("API sync failed, using local backup", e);
        return loadLocal();
    }
}

export async function addThought(thought: Omit<Thought, "id" | "createdAt" | "pinned">): Promise<Thought> {
    const tempId = "temp-" + Date.now() + Math.random().toString(36).slice(2, 6);
    const newThought: Thought = {
        ...thought,
        id: tempId,
        pinned: false,
        createdAt: new Date().toISOString(),
    };

    // Save locally immediately (Optimistic UI)
    const all = loadLocal();
    all.unshift(newThought);
    saveLocal(all);

    // Sync with API
    try {
        const savedNote = await createNote({
            title: thought.title,
            content: thought.content,
            type: thought.type,
            tags: thought.tags
        });

        // Update local ID with server ID
        const updated = loadLocal().map(t =>
            t.id === tempId ? {
                ...t,
                id: savedNote.id,
                createdAt: savedNote.createdAt,
                summary: savedNote.summary || t.summary
            } : t
        );
        saveLocal(updated);

        return {
            ...newThought,
            id: savedNote.id,
            createdAt: savedNote.createdAt,
            summary: savedNote.summary || newThought.summary
        };
    } catch (e) {
        console.error("Failed to save to API", e);
        // Keep the local one with temp ID
        return newThought;
    }
}

export function togglePin(id: string): Thought[] {
    const all = loadLocal();
    const updated = all.map(t =>
        t.id === id ? { ...t, pinned: !t.pinned } : t
    );
    saveLocal(updated);
    return updated;
}

export function updateThought(id: string, updates: Partial<Thought>): Thought[] {
    const all = loadLocal();
    const updated = all.map(t =>
        t.id === id ? { ...t, ...updates } : t
    );
    saveLocal(updated);
    return updated;
}

export async function deleteThought(id: string): Promise<Thought[]> {
    const all = loadLocal();
    const updated = all.filter(t => t.id !== id);
    saveLocal(updated);

    // Fire and forget delete
    deleteNote(id).catch(err => console.error("Failed to delete remote note", err));

    return updated;
}

export function getPinned(): Thought[] {
    return loadLocal().filter(t => t.pinned);
}

export function getRecent(count = 5): Thought[] {
    return loadLocal()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, count);
}

export function getTagStats(): { tag: string; count: number }[] {
    const allTags = loadLocal().flatMap(t => t.tags);
    const counts: Record<string, number> = {};
    allTags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
    });
    return Object.entries(counts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
}

export function getTypeStats(): { type: string; count: number }[] {
    const thoughts = loadLocal();
    const counts: Record<string, number> = {};
    thoughts.forEach(t => {
        counts[t.type] = (counts[t.type] || 0) + 1;
    });
    return Object.entries(counts)
        .map(([type, count]) => ({ type, count }));
}

export function getActivityByDay(): { day: string; count: number }[] {
    const thoughts = loadLocal();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts: Record<string, number> = {};
    days.forEach(d => (counts[d] = 0));
    thoughts.forEach(t => {
        const day = days[new Date(t.createdAt).getDay()];
        counts[day] = (counts[day] || 0) + 1;
    });
    return days.map(day => ({ day, count: counts[day] }));
}

export function generateLocalInsights(): string[] {
    const thoughts = loadLocal();
    if (thoughts.length === 0) return ["Start capturing thoughts to see insights!"];

    const insights: string[] = [];
    const tagStats = getTagStats();
    const typeStats = getTypeStats();

    // Total count
    insights.push(`You've captured ${thoughts.length} thought${thoughts.length > 1 ? "s" : ""} so far. Keep going! 🧠`);

    // Top tags
    if (tagStats.length > 0) {
        const top = tagStats.slice(0, 3).map(t => `**${t.tag}** (${t.count})`).join(", ");
        insights.push(`Your top themes: ${top}`);
    }

    // Pinned
    const pinned = thoughts.filter(t => t.pinned);
    if (pinned.length > 0) {
        insights.push(`${pinned.length} thought${pinned.length > 1 ? "s" : ""} pinned as important ⭐`);
    }

    // Type balance
    const notes = typeStats.find(t => t.type === "note")?.count || 0;
    const links = typeStats.find(t => t.type === "link")?.count || 0;
    const ideas = typeStats.find(t => t.type === "insight")?.count || 0;

    if (notes > links && notes > ideas) {
        insights.push("You're a note-taker at heart — lots of written thoughts 📝");
    } else if (links > notes) {
        insights.push("You're a curator — collecting lots of links 🔗");
    } else if (ideas > 0) {
        insights.push("You've been having insights — that's where breakthroughs happen 💡");
    }

    // Recency
    const lastWeek = thoughts.filter(t => {
        const diff = Date.now() - new Date(t.createdAt).getTime();
        return diff < 7 * 24 * 60 * 60 * 1000;
    });
    if (lastWeek.length > 0) {
        insights.push(`${lastWeek.length} thought${lastWeek.length > 1 ? "s" : ""} captured this week — you're on a roll! 🔥`);
    }

    return insights;
}
