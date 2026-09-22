import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";
import { ApplyButton } from "@/components/apply-button";
import { CARE_TYPES } from "@/lib/constants";

export default async function CaregiverFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string; careType?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "caregiver") redirect("/login");

  const { location, careType } = await searchParams;

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: session.user.id } });

  const requests = await prisma.careRequest.findMany({
    where: {
      status: "open",
      ...(location ? { location: { contains: location } } : {}),
      ...(careType ? { careType } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { familyUser: { select: { name: true } } },
  });

  const myApplications = profile
    ? await prisma.application.findMany({ where: { caregiverProfileId: profile.id } })
    : [];
  const appliedRequestIds = new Set(myApplications.map((a) => a.careRequestId));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-stone-900">Browse care requests</h1>

      {!profile && (
        <p className="mt-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          Create your caregiver profile before applying to requests.
        </p>
      )}

      <form className="mt-4 flex flex-wrap gap-2" method="get">
        <input
          name="location"
          defaultValue={location}
          placeholder="Filter by location"
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
        <select
          name="careType"
          defaultValue={careType ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        >
          <option value="">Any care type</option>
          {CARE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "live_in" ? "Live-in" : "Visit-based"}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md border border-stone-300 px-3 py-2 text-sm hover:bg-stone-50">
          Filter
        </button>
      </form>

      <ul className="mt-6 space-y-3">
        {requests.map((r) => {
          const requiredTasks: string[] = JSON.parse(r.requiredTasks);
          return (
            <li key={r.id} className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-stone-900">
                    {r.careType === "live_in" ? "Live-in care" : "Visit-based care"} — {r.location}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    Starts {new Date(r.startDate).toLocaleDateString()} · {r.hoursSchedule}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">Tasks: {requiredTasks.join(", ")}</p>
                  {(r.budgetMin || r.budgetMax) && (
                    <p className="mt-1 text-xs text-stone-500">
                      Budget: EGP {r.budgetMin ?? "?"} – {r.budgetMax ?? "?"} / month
                    </p>
                  )}
                </div>
                <Badge status={r.careType} />
              </div>

              <div className="mt-3">
                {appliedRequestIds.has(r.id) ? (
                  <span className="text-sm text-stone-500">Already applied</span>
                ) : profile ? (
                  <ApplyButton careRequestId={r.id} />
                ) : null}
              </div>
            </li>
          );
        })}
        {requests.length === 0 && <p className="text-sm text-stone-500">No open requests match your filters.</p>}
      </ul>
    </div>
  );
}
