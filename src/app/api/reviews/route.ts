import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";
import { reviewSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const { user, error, status } = await requireUser();
  if (error || !user) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({
    where: { id: parsed.data.matchId },
    include: { careRequest: true, caregiverProfile: true },
  });
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  if (!["confirmed", "completed"].includes(match.status)) {
    return NextResponse.json({ error: "Reviews are only available after a confirmed match" }, { status: 400 });
  }

  const isFamily = match.careRequest.familyUserId === user.id;
  const isCaregiver = match.caregiverProfile.userId === user.id;
  if (!isFamily && !isCaregiver) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const revieweeId = isFamily ? match.caregiverProfile.userId : match.careRequest.familyUserId;

  const existing = await prisma.review.findUnique({
    where: { matchId_reviewerId: { matchId: match.id, reviewerId: user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "You already reviewed this match" }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: {
      matchId: match.id,
      reviewerId: user.id,
      revieweeId,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
