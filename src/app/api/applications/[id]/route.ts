import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { notify } from "@/lib/notify";
import { getOrCreateConversationForMatch } from "@/lib/conversation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error, status } = await requireRole("family");
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const body = await request.json();
  const action = body.action as "accept" | "reject" | undefined;
  if (!action || !["accept", "reject"].includes(action)) {
    return NextResponse.json({ error: "action must be accept or reject" }, { status: 400 });
  }

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      careRequest: true,
      caregiverProfile: true,
    },
  });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (application.careRequest.familyUserId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (application.status !== "pending") {
    return NextResponse.json({ error: "Application already resolved" }, { status: 400 });
  }

  if (action === "reject") {
    const updated = await prisma.application.update({
      where: { id },
      data: { status: "rejected" },
    });
    return NextResponse.json(updated);
  }

  // Accept: create the match, confirm it, and close the request.
  const [updatedApplication, match] = await prisma.$transaction([
    prisma.application.update({ where: { id }, data: { status: "accepted" } }),
    prisma.match.create({
      data: {
        careRequestId: application.careRequestId,
        caregiverProfileId: application.caregiverProfileId,
        status: "confirmed",
        confirmedAt: new Date(),
      },
    }),
    prisma.careRequest.update({ where: { id: application.careRequestId }, data: { status: "matched" } }),
  ]);

  await getOrCreateConversationForMatch(match.id, application.careRequestId, [
    user.id,
    application.caregiverProfile.userId,
  ]);

  await notify(application.caregiverProfile.userId, "match_confirmed", {
    careRequestId: application.careRequestId,
    matchId: match.id,
  });
  await notify(user.id, "match_confirmed", {
    careRequestId: application.careRequestId,
    matchId: match.id,
  });

  return NextResponse.json({ application: updatedApplication, match });
}
