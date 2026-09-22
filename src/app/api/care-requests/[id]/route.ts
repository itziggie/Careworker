import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error, status } = await requireUser();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const careRequest = await prisma.careRequest.findUnique({
    where: { id },
    include: { familyUser: { select: { id: true, name: true } } },
  });

  if (!careRequest) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(careRequest);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error, status } = await requireUser();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const careRequest = await prisma.careRequest.findUnique({ where: { id } });
  if (!careRequest) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (careRequest.familyUserId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const allowedStatuses = ["open", "closed", "cancelled"];
  if (!body.status || !allowedStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.careRequest.update({
    where: { id },
    data: { status: body.status },
  });

  return NextResponse.json(updated);
}
