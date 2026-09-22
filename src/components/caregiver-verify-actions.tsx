"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CaregiverVerifyActions({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"verify" | "reject" | null>(null);

  async function act(action: "verify" | "reject") {
    let notes: string | null = null;
    if (action === "reject") {
      notes = window.prompt("Reason for rejecting this profile (shown to the caregiver):");
      if (notes === null) return;
    }
    setLoading(action);
    await fetch(`/api/admin/caregivers/${profileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => act("verify")}
        disabled={loading !== null}
        className="rounded-md bg-teal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-800 disabled:opacity-50"
      >
        {loading === "verify" ? "..." : "Verify"}
      </button>
      <button
        onClick={() => act("reject")}
        disabled={loading !== null}
        className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {loading === "reject" ? "..." : "Reject"}
      </button>
    </div>
  );
}
