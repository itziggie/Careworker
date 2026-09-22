"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CARE_TASK_OPTIONS, LANGUAGE_OPTIONS } from "@/lib/constants";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type InitialData = {
  photoUrl: string;
  bio: string;
  location: string;
  travelRadiusKm: number;
  education: string;
  certifications: string[];
  experienceYears: number;
  careCapabilities: string[];
  languages: string[];
  availabilityDays: string[];
  availabilityHours: string;
  preferredWorkType: "live_in" | "visit_based" | "both";
} | null;

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function CaregiverProfileForm({ initial }: { initial: InitialData }) {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [travelRadiusKm, setTravelRadiusKm] = useState(initial?.travelRadiusKm ?? 10);
  const [education, setEducation] = useState(initial?.education ?? "");
  const [certifications, setCertifications] = useState((initial?.certifications ?? []).join(", "));
  const [experienceYears, setExperienceYears] = useState(initial?.experienceYears ?? 0);
  const [careCapabilities, setCareCapabilities] = useState<string[]>(initial?.careCapabilities ?? []);
  const [languages, setLanguages] = useState<string[]>(initial?.languages ?? []);
  const [availabilityDays, setAvailabilityDays] = useState<string[]>(initial?.availabilityDays ?? []);
  const [availabilityHours, setAvailabilityHours] = useState(initial?.availabilityHours ?? "");
  const [preferredWorkType, setPreferredWorkType] = useState<"live_in" | "visit_based" | "both">(
    initial?.preferredWorkType ?? "both"
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);

    const res = await fetch("/api/caregiver-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        photoUrl,
        bio,
        location,
        travelRadiusKm,
        education,
        certifications: certifications
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        experienceYears,
        careCapabilities,
        languages,
        availabilityDays,
        availabilityHours,
        preferredWorkType,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    setSaved(true);
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-stone-700">Photo URL (optional)</label>
        <input
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="https://..."
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Short bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700">Location</label>
          <input
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Cairo, Nasr City"
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">Travel radius (km)</label>
          <input
            type="number"
            min={0}
            value={travelRadiusKm}
            onChange={(e) => setTravelRadiusKm(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Education / nursing credentials</label>
        <input
          value={education}
          onChange={(e) => setEducation(e.target.value)}
          placeholder="BSc Nursing, Cairo University"
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Certifications (comma-separated)</label>
        <input
          value={certifications}
          onChange={(e) => setCertifications(e.target.value)}
          placeholder="First Aid, Elderly Care Certificate"
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Years of experience</label>
        <input
          type="number"
          min={0}
          value={experienceYears}
          onChange={(e) => setExperienceYears(Number(e.target.value))}
          className="mt-1 w-32 rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Care capabilities</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {CARE_TASK_OPTIONS.map((task) => (
            <button
              type="button"
              key={task}
              onClick={() => setCareCapabilities((prev) => toggle(prev, task))}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                careCapabilities.includes(task)
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
        <label className="block text-sm font-medium text-stone-700">Languages</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((lang) => (
            <button
              type="button"
              key={lang}
              onClick={() => setLanguages((prev) => toggle(prev, lang))}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                languages.includes(lang)
                  ? "border-teal-600 bg-teal-50 text-teal-800"
                  : "border-stone-300 text-stone-600 hover:border-stone-400"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Availability — days</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <button
              type="button"
              key={day}
              onClick={() => setAvailabilityDays((prev) => toggle(prev, day))}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                availabilityDays.includes(day)
                  ? "border-teal-600 bg-teal-50 text-teal-800"
                  : "border-stone-300 text-stone-600 hover:border-stone-400"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Availability — hours</label>
        <input
          required
          value={availabilityHours}
          onChange={(e) => setAvailabilityHours(e.target.value)}
          placeholder="08:00-18:00"
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Preferred work type</label>
        <div className="mt-1 flex gap-2 rounded-lg bg-stone-100 p-1">
          {(["visit_based", "live_in", "both"] as const).map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => setPreferredWorkType(type)}
              className={`flex-1 rounded-md py-2 text-sm font-medium capitalize transition ${
                preferredWorkType === type ? "bg-white text-stone-900 shadow" : "text-stone-500"
              }`}
            >
              {type.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-teal-700">Profile saved.</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-teal-700 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
