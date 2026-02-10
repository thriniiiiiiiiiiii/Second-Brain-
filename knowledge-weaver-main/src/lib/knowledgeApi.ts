const API_URL = "/api/knowledge";

/* =========================
   NOTE TYPE
========================= */
export type Note = {
  id: string;
  title: string;
  content: string;
  summary?: string | null;
  tags?: string[];
  type?: string;
  createdAt: string;
};

/* =========================
   GET ALL NOTES
========================= */
export async function getAllNotes(): Promise<Note[]> {
  const res = await fetch(API_URL, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch notes");
  }

  return res.json();
}

// Alias for backward compatibility
export const fetchNotes = getAllNotes;

/* =========================
   CREATE NOTE
========================= */
export async function createNote(data: {
  title: string;
  content: string;
  type?: string;
  tags?: string[];
}): Promise<Note> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create note");
  }

  return res.json();
}

// Alias for backward compatibility
export const saveNote = createNote;

/* =========================
   DELETE NOTE
========================= */
export async function deleteNote(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete note");
  }
}