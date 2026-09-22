"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CARE_TASK_OPTIONS } from "@/lib/constants";

export default function NewCareRequestPage() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [hoursSchedule, setHoursSchedule] = useState("");
  const [careType, setCareType] = useState<"live_in" | "visit_based">("visit_based");
  const [requiredTasks, setRequiredTasks] = useState<string[]>([]);
  const [preferredAttributes, setPreferredAttributes] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleTask(task: string) {
    setRequiredTasks((prev) => (prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/care-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location,
        startDate,
        hoursSchedule,
        careType,
        requiredTasks,
        preferredAttributes,
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        notes,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    router.push(`/family/requests/${data.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-stone-900">Post a care request</h1>
      <p className="mt-1 text-sm text-stone-600">
        The more detail you give, the better caregivers we can match you with.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700">Location</label>
            <input
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Cairo, Maadi"
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Start date</label>
            <input
              required
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Hours / schedule</label>
          <input
            required
            value={hoursSchedule}
            onChange={(e) => setHoursSchedule(e.target.value)}
            placeholder="Weekdays, 9am-5pm"
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Care type</label>
          <div className="mt-1 flex gap-2 rounded-lg bg-stone-100 p-1">
            <button
              type="button"
              onClick={() => setCareType("visit_based")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                careType === "visit_based" ? "bg-white text-stone-900 shadow" : "text-stone-500"
              }`}
            >
              Visit-based
            </button>
            <button
              type="button"
              onClick={() => setCareType("live_in")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                careType === "live_in" ? "bg-white text-stone-900 shadow" : "text-stone-500"
              }`}
            >
              Live-in
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Required care tasks</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {CARE_TASK_OPTIONS.map((task) => (
              <button
                type="button"
                key={task}
                onClick={() => toggleTask(task)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  requiredTasks.includes(task)
                    ? "border-teal-600 bg-teal-50 text-teal-800"
                    : "border-stone-300 text-stone-600 hover:border-stone-400"
                }`}
              >
                {task}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Preferred caregiver attributes</label>
          <input
            value={preferredAttributes}
            onChange={(e) => setPreferredAttributes(e.target.value)}
            placeholder="Female, Arabic-speaking, dementia experience preferred"
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700">Budget min (EGP/month)</label>
            <input
              type="number"
              min={0}
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Budget max (EGP/month)</label>
            <input
              type="number"
              min={0}
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-teal-700 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800 disabled:opacity-50"
        >
          {loading ? "Publishing..." : "Publish request"}
        </button>
      </form>
    </div>
  );
}
