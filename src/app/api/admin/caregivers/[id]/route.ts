import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error, status } = await requireRole("admin");
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const body = await request.json();
  const action = body.action as "verify" | "reject" | undefined;
  if (!action || !["verify", "reject"].includes(action)) {
    return NextResponse.json({ error: "action must be verify or reject" }, { status: 400 });
  }

  const profile = await prisma.caregiverProfile.update({
    where: { id },
    data: {
      verificationStatus: action === "verify" ? "verified" : "rejected",
      verificationNotes: body.notes || null,
    },
  });

  return NextResponse.json(profile);
}
