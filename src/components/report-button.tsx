"use client";

import { useState } from "react";

export function ReportButton({ reportedUserId, reportedUserName }: { reportedUserId: string; reportedUserName: string }) {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  async function handleReport() {
    const reason = window.prompt(`Report ${reportedUserName} — what's the issue?`);
    if (!reason || reason.trim().length < 5) return;

    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportedUserId, reason }),
    });
    setStatus(res.ok ? "sent" : "error");
  }

  if (status === "sent") return <span className="text-xs text-stone-500">Report submitted to admin</span>;

  return (
    <button onClick={handleReport} className="text-xs text-red-600 hover:underline">
      Report {reportedUserName}
    </button>
  );
}
