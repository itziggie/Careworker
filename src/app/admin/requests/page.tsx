import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";

export default async function AdminRequestsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const requests = await prisma.careRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      familyUser: { select: { id: true, name: true, email: true } },
      _count: { select: { applications: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-stone-900">All care requests</h1>
      <ul className="mt-6 space-y-3">
        {requests.map((r) => (
          <li key={r.id} className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-stone-900">
                  {r.careType === "live_in" ? "Live-in care" : "Visit-based care"} — {r.location}
                </p>
                <p className="text-xs text-stone-500">
                  Family: {r.familyUser.name} ({r.familyUser.email}) · {r._count.applications} applications
                </p>
              </div>
              <Badge status={r.status} />
            </div>
          </li>
        ))}
        {requests.length === 0 && <p className="text-sm text-stone-500">No care requests yet.</p>}
      </ul>
    </div>
  );
}
