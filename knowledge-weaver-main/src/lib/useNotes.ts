import { useEffect, useState } from "react";

export function useNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    const res = await fetch("/api/knowledge", { cache: "no-store" });
    const data = await res.json();
    setNotes(data);
    setLoading(false);
  }

  async function addNote(note: { title: string; content: string }) {
    await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });

    await reload(); // 🔑 THIS WAS MISSING BEFORE
  }

  useEffect(() => {
    reload();
  }, []);

  return { notes, loading, addNote, reload };
}
