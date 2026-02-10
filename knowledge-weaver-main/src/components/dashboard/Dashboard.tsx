"use client";

import { useEffect, useState } from "react";
import { getAllNotes, Note } from "@/lib/knowledgeApi";
import NoteCreator from "./NoteCreator";
import AIChat from "./AIChat";

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadNotes() {
    const data = await getAllNotes();
    setNotes(data);
  }

  useEffect(() => {
    loadNotes().finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* LEFT */}
      <div className="lg:col-span-2 space-y-4">
        <NoteCreator onSaved={loadNotes} />

        {notes.map((n) => (
          <div key={n.id} className="border p-4 rounded-lg">
            <h3 className="font-semibold">{n.title}</h3>
            <p className="text-sm mt-2">{n.content}</p>
            {n.summary && (
              <p className="text-xs italic mt-2 text-muted-foreground">
                AI: {n.summary}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <AIChat items={notes.map(n => ({ ...n, pinned: false, type: (n.type || "note") as "note" | "link" | "insight", tags: n.tags || [] }))} />
    </div>
  );
}
