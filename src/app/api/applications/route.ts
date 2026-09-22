import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { applicationSchema } from "@/lib/validation";
import { notify } from "@/lib/notify";

export async function POST(request: Request) {
  const { user, error, status } = await requireRole("caregiver");
  if (error || !user) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return NextResponse.json({ error: "Create your caregiver profile before applying" }, { status: 400 });
  }
  if (profile.verificationStatus === "rejected") {
    return NextResponse.json({ error: "Your profile was not approved for applications" }, { status: 403 });
  }

  const careRequest = await prisma.careRequest.findUnique({ where: { id: parsed.data.careRequestId } });
  if (!careRequest) return NextResponse.json({ error: "Care request not found" }, { status: 404 });
  if (careRequest.status !== "open") {
    return NextResponse.json({ error: "This request is no longer accepting applications" }, { status: 400 });
  }

  const existing = await prisma.application.findUnique({
    where: {
      careRequestId_caregiverProfileId: {
        careRequestId: careRequest.id,
        caregiverProfileId: profile.id,
      },
    },
  });
  if (existing) {
    return NextResponse.json({ error: "You already applied to this request" }, { status: 409 });
  }

  const application = await prisma.application.create({
    data: {
      careRequestId: careRequest.id,
      caregiverProfileId: profile.id,
      message: parsed.data.message,
    },
  });

  await notify(careRequest.familyUserId, "new_application", {
    careRequestId: careRequest.id,
    applicationId: application.id,
    caregiverName: user.name,
  });

  return NextResponse.json(application, { status: 201 });
}

export async function GET() {
  const { user, error, status } = await requireRole("caregiver");
  if (error || !user) return NextResponse.json({ error }, { status });

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json([]);

  const applications = await prisma.application.findMany({
    where: { caregiverProfileId: profile.id },
    orderBy: { createdAt: "desc" },
    include: { careRequest: true },
  });

  return NextResponse.json(applications);
}
