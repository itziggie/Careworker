import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";
import { CaregiverVerifyActions } from "@/components/caregiver-verify-actions";
import { VERIFICATION_STATUSES } from "@/lib/constants";

export default async function AdminCaregiversPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/login");

  const { status } = await searchParams;
  const filter = status && (VERIFICATION_STATUSES as readonly string[]).includes(status) ? status : "pending";

  const profiles = await prisma.caregiverProfile.findMany({
    where: { verificationStatus: filter },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true, phone: true } }, documents: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-stone-900">Caregiver verification</h1>

      <div className="mt-4 flex gap-2">
        {VERIFICATION_STATUSES.map((s) => (
          <a
            key={s}
            href={`/admin/caregivers?status=${s}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${
              filter === s ? "border-teal-600 bg-teal-50 text-teal-800" : "border-stone-300 text-stone-600"
            }`}
          >
            {s}
          </a>
        ))}
      </div>

      <ul className="mt-6 space-y-4">
        {profiles.map((p) => {
          const capabilities: string[] = JSON.parse(p.careCapabilities);
          return (
            <li key={p.id} className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-stone-900">{p.user.name}</p>
                  <p className="text-xs text-stone-500">
                    {p.user.email} · {p.user.phone ?? "no phone"}
                  </p>
                  <p className="mt-1 text-sm text-stone-700">{p.location} · {p.experienceYears} yrs experience</p>
                  <p className="mt-1 text-xs text-stone-500">Capabilities: {capabilities.join(", ")}</p>
                  {p.education && <p className="text-xs text-stone-500">Education: {p.education}</p>}
                </div>
                <Badge status={p.verificationStatus} />
              </div>

              <div className="mt-3">
                <p className="text-xs font-medium text-stone-500">Documents</p>
                {p.documents.length === 0 ? (
                  <p className="text-xs text-stone-400">None uploaded</p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {p.documents.map((d) => (
                      <li key={d.id}>
                        <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-teal-700 hover:underline">
                          {d.fileName} ({d.docType})
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {p.verificationStatus === "pending" && (
                <div className="mt-3">
                  <CaregiverVerifyActions profileId={p.id} />
                </div>
              )}
            </li>
          );
        })}
        {profiles.length === 0 && <p className="text-sm text-stone-500">No profiles in this status.</p>}
      </ul>
    </div>
  );
}
