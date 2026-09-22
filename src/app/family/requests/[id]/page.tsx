import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";
import { ApplicationActions } from "@/components/application-actions";
import { MatchActions } from "@/components/match-actions";
import { ReviewForm } from "@/components/review-form";
import { ReportButton } from "@/components/report-button";

export default async function FamilyRequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "family") redirect("/login");

  const { id } = await params;
  const careRequest = await prisma.careRequest.findUnique({ where: { id } });
  if (!careRequest || careRequest.familyUserId !== session.user.id) notFound();

  const applications = await prisma.application.findMany({
    where: { careRequestId: id },
    orderBy: { createdAt: "desc" },
    include: { caregiverProfile: { include: { user: { select: { id: true, name: true } } } } },
  });

  const match = await prisma.match.findFirst({
    where: { careRequestId: id, status: { in: ["proposed", "confirmed", "completed"] } },
    include: {
      caregiverProfile: { include: { user: { select: { id: true, name: true } } } },
      reviews: true,
    },
  });

  const requiredTasks: string[] = JSON.parse(careRequest.requiredTasks);
  const myReview = match?.reviews.find((r) => r.reviewerId === session.user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/family" className="text-sm text-teal-700 hover:underline">
        &larr; My requests
      </Link>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">
            {careRequest.careType === "live_in" ? "Live-in care" : "Visit-based care"} — {careRequest.location}
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Starts {new Date(careRequest.startDate).toLocaleDateString()} · {careRequest.hoursSchedule}
          </p>
        </div>
        <Badge status={careRequest.status} />
      </div>

      <div className="mt-4 rounded-lg border border-stone-200 bg-white p-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-stone-500">Required tasks</dt>
            <dd className="mt-1 text-stone-800">{requiredTasks.join(", ")}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Preferred attributes</dt>
            <dd className="mt-1 text-stone-800">{careRequest.preferredAttributes || "—"}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Budget</dt>
            <dd className="mt-1 text-stone-800">
              {careRequest.budgetMin || careRequest.budgetMax
                ? `EGP ${careRequest.budgetMin ?? "?"} – ${careRequest.budgetMax ?? "?"} / month`
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-stone-500">Notes</dt>
            <dd className="mt-1 text-stone-800">{careRequest.notes || "—"}</dd>
          </div>
        </dl>
      </div>

      {match && (
        <div className="mt-6 rounded-lg border border-teal-200 bg-teal-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-900">
                Matched with {match.caregiverProfile.user.name}
              </p>
              <Badge status={match.status} />
            </div>
            <div className="flex items-center gap-3">
              <Link href="/messages" className="text-sm font-medium text-teal-700 hover:underline">
                Open messages
              </Link>
              <ReportButton reportedUserId={match.caregiverProfile.user.id} reportedUserName={match.caregiverProfile.user.name} />
            </div>
          </div>
          {["confirmed", "completed"].includes(match.status) && (
            <div className="mt-3">
              <MatchActions matchId={match.id} />
            </div>
          )}
          {["confirmed", "completed"].includes(match.status) && !myReview && (
            <div className="mt-3">
              <ReviewForm matchId={match.id} revieweeName={match.caregiverProfile.user.name} />
            </div>
          )}
        </div>
      )}

      <h2 className="mt-8 text-lg font-semibold text-stone-900">
        Applications ({applications.length})
      </h2>
      {applications.length === 0 ? (
        <p className="mt-2 text-sm text-stone-600">No applications yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {applications.map((app) => (
            <li key={app.id} className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-stone-900">{app.caregiverProfile.user.name}</p>
                  <p className="text-xs text-stone-500">
                    {app.caregiverProfile.experienceYears} yrs experience · {app.caregiverProfile.location}
                    {app.caregiverProfile.verificationStatus === "verified" && (
                      <span className="ml-2 text-teal-700">✓ Verified</span>
                    )}
                  </p>
                </div>
                <Badge status={app.status} />
              </div>
              <p className="mt-2 text-sm text-stone-700">{app.message}</p>
              {app.status === "pending" && careRequest.status === "open" && (
                <div className="mt-3">
                  <ApplicationActions applicationId={app.id} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
