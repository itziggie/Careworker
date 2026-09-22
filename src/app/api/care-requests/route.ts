import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/require-role";
import { careRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const { user, error, status } = await requireRole("family");
  if (error || !user) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const parsed = careRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;
  const careRequest = await prisma.careRequest.create({
    data: {
      familyUserId: user.id,
      location: data.location,
      startDate: new Date(data.startDate),
      hoursSchedule: data.hoursSchedule,
      careType: data.careType,
      requiredTasks: JSON.stringify(data.requiredTasks),
      preferredAttributes: data.preferredAttributes || null,
      budgetMin: data.budgetMin ?? null,
      budgetMax: data.budgetMax ?? null,
      notes: data.notes || null,
    },
  });

  return NextResponse.json(careRequest, { status: 201 });
}

export async function GET(request: Request) {
  const { user, error, status } = await requireUser();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") ?? "mine";

  if (scope === "mine" && user.role === "family") {
    const requests = await prisma.careRequest.findMany({
      where: { familyUserId: user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } },
    });
    return NextResponse.json(requests);
  }

  if (scope === "feed" && user.role === "caregiver") {
    const location = searchParams.get("location") ?? undefined;
    const careType = searchParams.get("careType") ?? undefined;

    const requests = await prisma.careRequest.findMany({
      where: {
        status: "open",
        ...(location ? { location: { contains: location } } : {}),
        ...(careType ? { careType } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { familyUser: { select: { name: true } } },
    });
    return NextResponse.json(requests);
  }

  return NextResponse.json({ error: "Invalid scope for role" }, { status: 400 });
}
