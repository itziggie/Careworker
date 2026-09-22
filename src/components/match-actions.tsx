"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MatchActions({ matchId }: { matchId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"complete" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "complete" | "cancel") {
    if (action === "cancel" && !confirm("Cancel this match? This cannot be undone.")) return;
    setLoading(action);
    setError(null);
    const res = await fetch(`/api/matches/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setLoading(null);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => act("complete")}
        disabled={loading !== null}
        className="rounded-md bg-teal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-800 disabled:opacity-50"
      >
        {loading === "complete" ? "..." : "Mark engagement completed"}
      </button>
      <button
        onClick={() => act("cancel")}
        disabled={loading !== null}
        className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {loading === "cancel" ? "..." : "Cancel match"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
