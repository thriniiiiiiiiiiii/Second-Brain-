import { useNotes } from "@/lib/useNotes";

export default function Notes() {
  const { notes, loading, addNote } = useNotes();

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <button
        onClick={() =>
          addNote({
            title: "Real app note",
            content: "Now notes NEVER disappear.",
          })
        }
      >
        ➕ Add
      </button>

      {notes.map((n) => (
        <div key={n.id}>
          <h3>{n.title}</h3>
          <p>{n.content}</p>
        </div>
      ))}
    </div>
  );
}
