import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error, status } = await requireUser();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const match = await prisma.match.findUnique({
    where: { id },
    include: { careRequest: true, caregiverProfile: true },
  });
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isFamily = match.careRequest.familyUserId === user.id;
  const isCaregiver = match.caregiverProfile.userId === user.id;
  if (!isFamily && !isCaregiver && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const action = body.action as "complete" | "cancel" | undefined;
  if (!action || !["complete", "cancel"].includes(action)) {
    return NextResponse.json({ error: "action must be complete or cancel" }, { status: 400 });
  }
  if (!["proposed", "confirmed"].includes(match.status)) {
    return NextResponse.json({ error: "Match is already closed" }, { status: 400 });
  }

  const updated = await prisma.match.update({
    where: { id },
    data:
      action === "complete"
        ? { status: "completed", completedAt: new Date() }
        : { status: "cancelled", cancelledAt: new Date() },
  });

  if (action === "cancel") {
    await prisma.careRequest.update({ where: { id: match.careRequestId }, data: { status: "open" } });
  }

  return NextResponse.json(updated);
}
