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

/* ─────────── API helpers (fire-and-forget sync) ─────────── */

const API = "/api";

async function apiGet(): Promise<Thought[] | null> {
    try {
        const res = await fetch(`${API}/knowledge`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.map((item: any) => ({
            ...item,
            pinned: item.pinned ?? false,
            createdAt: item.createdAt ?? new Date().toISOString(),
        }));
    } catch {
        return null;
    }
}

async function apiCreate(thought: Omit<Thought, "id" | "createdAt">): Promise<Thought | null> {
    try {
        const res = await fetch(`${API}/knowledge`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(thought),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return { ...data, pinned: data.pinned ?? false };
    } catch {
        return null;
    }
}

async function apiDelete(id: string): Promise<boolean> {
    try {
        const res = await fetch(`${API}/knowledge/${id}`, { method: "DELETE" });
        return res.ok;
    } catch {
        return false;
    }
}

/* ─────────── Public Store API ─────────── */

export async function getAllThoughts(): Promise<Thought[]> {
    // Try API first, fall back to localStorage
    const apiData = await apiGet();
    if (apiData && apiData.length > 0) {
        // Merge with local pinned state
        const local = loadLocal();
        const pinnedIds = new Set(local.filter(t => t.pinned).map(t => t.id));
        const merged = apiData.map(t => ({ ...t, pinned: pinnedIds.has(t.id) || t.pinned }));
        saveLocal(merged);
        return merged;
    }
    return loadLocal();
}

export async function addThought(thought: Omit<Thought, "id" | "createdAt" | "pinned">): Promise<Thought> {
    const newThought: Thought = {
        ...thought,
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
        pinned: false,
        createdAt: new Date().toISOString(),
    };

    // Save locally immediately
    const all = loadLocal();
    all.unshift(newThought);
    saveLocal(all);

    // Try to sync with API
    const apiResult = await apiCreate(thought);
    if (apiResult) {
        // Update local ID with server ID
        const updated = loadLocal().map(t =>
            t.id === newThought.id ? { ...apiResult, pinned: false } : t
        );
        saveLocal(updated);
        return { ...apiResult, pinned: false };
    }

    return newThought;
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
    apiDelete(id); // fire-and-forget
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
