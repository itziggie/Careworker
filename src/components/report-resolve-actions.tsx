"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReportResolveActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"reviewed" | "dismissed" | null>(null);

  async function act(action: "reviewed" | "dismissed") {
    setLoading(action);
    await fetch(`/api/admin/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => act("reviewed")}
        disabled={loading !== null}
        className="rounded-md bg-teal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-800 disabled:opacity-50"
      >
        {loading === "reviewed" ? "..." : "Mark reviewed"}
      </button>
      <button
        onClick={() => act("dismissed")}
        disabled={loading !== null}
        className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-50"
      >
        {loading === "dismissed" ? "..." : "Dismiss"}
      </button>
    </div>
  );
}
