import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CaregiverProfileForm } from "@/components/caregiver-profile-form";
import { DocumentUpload } from "@/components/document-upload";
import { Badge } from "@/components/badge";

export default async function CaregiverProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "caregiver") redirect("/login");

  const profile = await prisma.caregiverProfile.findUnique({
    where: { userId: session.user.id },
    include: { documents: true },
  });

  const availability = profile ? JSON.parse(profile.availability) : { days: [], hours: "" };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">My caregiver profile</h1>
        {profile && <Badge status={profile.verificationStatus} />}
      </div>
      {profile?.verificationStatus === "pending" && (
        <p className="mt-1 text-sm text-amber-700">
          Your profile is awaiting admin review. You can still browse and apply while it&apos;s pending.
        </p>
      )}
      {profile?.verificationStatus === "rejected" && (
        <p className="mt-1 text-sm text-red-700">
          Your profile wasn&apos;t approved{profile.verificationNotes ? `: ${profile.verificationNotes}` : "."} Update it and re-submit.
        </p>
      )}

      <div className="mt-6">
        <CaregiverProfileForm
          initial={
            profile
              ? {
                  photoUrl: profile.photoUrl ?? "",
                  bio: profile.bio ?? "",
                  location: profile.location,
                  travelRadiusKm: profile.travelRadiusKm,
                  education: profile.education ?? "",
                  certifications: profile.certifications ? JSON.parse(profile.certifications) : [],
                  experienceYears: profile.experienceYears,
                  careCapabilities: JSON.parse(profile.careCapabilities),
                  languages: JSON.parse(profile.languages),
                  availabilityDays: availability.days ?? [],
                  availabilityHours: availability.hours ?? "",
                  preferredWorkType: profile.preferredWorkType as "live_in" | "visit_based" | "both",
                }
              : null
          }
        />
      </div>

      {profile && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-stone-900">Supporting documents</h2>
          <p className="mt-1 text-sm text-stone-600">
            ID, nursing/certification credentials, and references. Admins review these before verifying your profile.
          </p>
          <div className="mt-3">
            <DocumentUpload documents={profile.documents} />
          </div>
        </div>
      )}
      {!profile && (
        <p className="mt-6 text-sm text-stone-500">Save your profile first, then you can upload supporting documents.</p>
      )}
    </div>
  );
}
