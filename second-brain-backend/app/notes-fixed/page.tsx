"use client";

import { useEffect, useState } from "react";

export default function NotesFixed() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/knowledge", { cache: "no-store" });
    const data = await res.json();
    setNotes(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addNote() {
    await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "UI sanity test",
        content: "If you see this after refresh, UI is fixed.",
      }),
    });

    await load(); // 🔥 force reload
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>🧠 Notes (Guaranteed)</h1>

      <button onClick={addNote}>➕ Add Test Note</button>

      <pre>{JSON.stringify(notes, null, 2)}</pre>
    </div>
  );
}
