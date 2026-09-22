import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";
import { ReportResolveActions } from "@/components/report-resolve-actions";

export default async function AdminReportsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      reportedUser: { select: { id: true, name: true, email: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-stone-900">Reports</h1>
      <ul className="mt-6 space-y-3">
        {reports.map((r) => (
          <li key={r.id} className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-stone-900">
                  {r.reporter.name} reported {r.reportedUser.name}
                </p>
                <p className="mt-1 text-sm text-stone-700">{r.reason}</p>
                {r.details && <p className="mt-1 text-xs text-stone-500">{r.details}</p>}
                <p className="mt-1 text-xs text-stone-400">{new Date(r.createdAt).toLocaleString()}</p>
              </div>
              <Badge status={r.status} />
            </div>
            {r.status === "open" && (
              <div className="mt-3">
                <ReportResolveActions reportId={r.id} />
              </div>
            )}
          </li>
        ))}
        {reports.length === 0 && <p className="text-sm text-stone-500">No reports filed.</p>}
      </ul>
    </div>
  );
}
