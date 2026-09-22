import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";
import { ReviewForm } from "@/components/review-form";

export default async function CaregiverApplicationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "caregiver") redirect("/login");

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/caregiver/profile");

  const applications = await prisma.application.findMany({
    where: { caregiverProfileId: profile.id },
    orderBy: { createdAt: "desc" },
    include: { careRequest: { include: { familyUser: { select: { id: true, name: true } } } } },
  });

  const matches = await prisma.match.findMany({
    where: { caregiverProfileId: profile.id, status: { in: ["confirmed", "completed"] } },
    include: {
      careRequest: { include: { familyUser: { select: { id: true, name: true } } } },
      reviews: true,
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-stone-900">My applications</h1>

      <ul className="mt-4 space-y-3">
        {applications.map((app) => (
          <li key={app.id} className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-stone-900">
                  {app.careRequest.careType === "live_in" ? "Live-in care" : "Visit-based care"} — {app.careRequest.location}
                </p>
                <p className="text-xs text-stone-500">Family: {app.careRequest.familyUser.name}</p>
              </div>
              <Badge status={app.status} />
            </div>
          </li>
        ))}
        {applications.length === 0 && <p className="text-sm text-stone-500">You haven&apos;t applied to any requests yet.</p>}
      </ul>

      {matches.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-stone-900">Confirmed matches</h2>
          <ul className="mt-3 space-y-3">
            {matches.map((m) => {
              const myReview = m.reviews.find((r) => r.reviewerId === session.user.id);
              return (
                <li key={m.id} className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-stone-900">
                      {m.careRequest.familyUser.name} — {m.careRequest.location}
                    </p>
                    <Badge status={m.status} />
                  </div>
                  <Link href="/messages" className="mt-1 inline-block text-sm text-teal-700 hover:underline">
                    Open messages
                  </Link>
                  {!myReview && (
                    <div className="mt-3">
                      <ReviewForm matchId={m.id} revieweeName={m.careRequest.familyUser.name} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
