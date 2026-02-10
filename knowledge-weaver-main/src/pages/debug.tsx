"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/knowledge", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <pre>{error}</pre>;

  return (
    <div style={{ padding: 24 }}>
      <h1>DEBUG: RAW KNOWLEDGE</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
