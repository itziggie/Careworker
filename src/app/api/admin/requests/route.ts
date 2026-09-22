import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";

export async function GET() {
  const { user, error, status } = await requireRole("admin");
  if (error || !user) return NextResponse.json({ error }, { status });

  const requests = await prisma.careRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      familyUser: { select: { id: true, name: true, email: true } },
      _count: { select: { applications: true, matches: true } },
    },
  });

  return NextResponse.json(requests);
}
