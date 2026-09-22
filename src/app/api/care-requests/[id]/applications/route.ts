import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error, status } = await requireRole("family", "admin");
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const careRequest = await prisma.careRequest.findUnique({ where: { id } });
  if (!careRequest) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role === "family" && careRequest.familyUserId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const applications = await prisma.application.findMany({
    where: { careRequestId: id },
    orderBy: { createdAt: "desc" },
    include: {
      caregiverProfile: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });

  return NextResponse.json(applications);
}
