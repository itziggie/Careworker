import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { caregiverProfileSchema } from "@/lib/validation";

export async function GET() {
  const { user, error, status } = await requireRole("caregiver");
  if (error || !user) return NextResponse.json({ error }, { status });

  const profile = await prisma.caregiverProfile.findUnique({
    where: { userId: user.id },
    include: { documents: true },
  });

  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const { user, error, status } = await requireRole("caregiver");
  if (error || !user) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const parsed = caregiverProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  const existing = await prisma.caregiverProfile.findUnique({ where: { userId: user.id } });

  const payload = {
    photoUrl: data.photoUrl || null,
    bio: data.bio || null,
    location: data.location,
    travelRadiusKm: data.travelRadiusKm,
    education: data.education || null,
    certifications: JSON.stringify(data.certifications),
    experienceYears: data.experienceYears,
    careCapabilities: JSON.stringify(data.careCapabilities),
    languages: JSON.stringify(data.languages),
    availability: JSON.stringify({ days: data.availabilityDays, hours: data.availabilityHours }),
    preferredWorkType: data.preferredWorkType,
  };

  const profile = existing
    ? await prisma.caregiverProfile.update({ where: { userId: user.id }, data: payload })
    : await prisma.caregiverProfile.create({ data: { userId: user.id, ...payload } });

  // Substantive edits after verification should be re-reviewed.
  if (existing && existing.verificationStatus === "verified") {
    await prisma.caregiverProfile.update({
      where: { userId: user.id },
      data: { verificationStatus: "pending" },
    });
  }

  return NextResponse.json(profile);
}
