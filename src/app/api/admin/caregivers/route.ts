import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";

export async function GET(request: Request) {
  const { user, error, status } = await requireRole("admin");
  if (error || !user) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("status");

  const profiles = await prisma.caregiverProfile.findMany({
    where: filter ? { verificationStatus: filter } : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true, phone: true } }, documents: true },
  });

  return NextResponse.json(profiles);
}
