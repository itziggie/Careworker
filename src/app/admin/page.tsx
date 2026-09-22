import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const [pendingCaregivers, openRequests, openReports, verifiedCaregivers] = await Promise.all([
    prisma.caregiverProfile.count({ where: { verificationStatus: "pending" } }),
    prisma.careRequest.count({ where: { status: "open" } }),
    prisma.report.count({ where: { status: "open" } }),
    prisma.caregiverProfile.count({ where: { verificationStatus: "verified" } }),
  ]);

  const cards = [
    { label: "Pending caregiver verifications", value: pendingCaregivers, href: "/admin/caregivers?status=pending" },
    { label: "Verified caregivers", value: verifiedCaregivers, href: "/admin/caregivers?status=verified" },
    { label: "Open care requests", value: openRequests, href: "/admin/requests" },
    { label: "Open reports", value: openReports, href: "/admin/reports" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-stone-900">Admin dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-lg border border-stone-200 bg-white p-4 hover:border-teal-300 hover:shadow-sm"
          >
            <p className="text-2xl font-semibold text-stone-900">{c.value}</p>
            <p className="mt-1 text-sm text-stone-600">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
