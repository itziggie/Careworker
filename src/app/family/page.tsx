import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";

export default async function FamilyDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "family") redirect("/login");

  const requests = await prisma.careRequest.findMany({
    where: { familyUserId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">My care requests</h1>
        <Link
          href="/family/requests/new"
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          + New request
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-stone-300 p-10 text-center">
          <p className="text-stone-600">You haven&apos;t posted a care request yet.</p>
          <Link href="/family/requests/new" className="mt-3 inline-block text-sm font-medium text-teal-700 hover:underline">
            Post your first request
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {requests.map((r) => (
            <li key={r.id}>
              <Link
                href={`/family/requests/${r.id}`}
                className="block rounded-lg border border-stone-200 bg-white p-4 hover:border-teal-300 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-stone-900">
                      {r.careType === "live_in" ? "Live-in care" : "Visit-based care"} — {r.location}
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      Starts {new Date(r.startDate).toLocaleDateString()} · {r.hoursSchedule}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-stone-500">{r._count.applications} applications</span>
                    <Badge status={r.status} />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
