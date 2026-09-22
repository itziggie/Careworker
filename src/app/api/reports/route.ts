import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/require-role";
import { reportSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const { user, error, status } = await requireUser();
  if (error || !user) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  if (parsed.data.reportedUserId === user.id) {
    return NextResponse.json({ error: "You cannot report yourself" }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: {
      reporterId: user.id,
      reportedUserId: parsed.data.reportedUserId,
      reason: parsed.data.reason,
      details: parsed.data.details || null,
    },
  });

  return NextResponse.json(report, { status: 201 });
}

export async function GET() {
  const { user, error, status } = await requireRole("admin");
  if (error || !user) return NextResponse.json({ error }, { status });

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      reportedUser: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(reports);
}
