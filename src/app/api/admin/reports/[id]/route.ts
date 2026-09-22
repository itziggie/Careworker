import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error, status } = await requireRole("admin");
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const body = await request.json();
  const action = body.action as "reviewed" | "dismissed" | undefined;
  if (!action || !["reviewed", "dismissed"].includes(action)) {
    return NextResponse.json({ error: "action must be reviewed or dismissed" }, { status: 400 });
  }

  const report = await prisma.report.update({ where: { id }, data: { status: action } });
  return NextResponse.json(report);
}
