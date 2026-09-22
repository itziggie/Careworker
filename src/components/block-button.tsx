"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BlockButton({ blockedId, blockedName }: { blockedId: string; blockedName: string }) {
  const router = useRouter();
  const [blocked, setBlocked] = useState(false);

  async function handleBlock() {
    if (!confirm(`Block ${blockedName}? You won't be able to message each other anymore.`)) return;
    const res = await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockedId }),
    });
    if (res.ok) {
      setBlocked(true);
      router.refresh();
    }
  }

  if (blocked) return <span className="text-xs text-stone-500">Blocked</span>;

  return (
    <button onClick={handleBlock} className="text-xs text-red-600 hover:underline">
      Block {blockedName}
    </button>
  );
}
