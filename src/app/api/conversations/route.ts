import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";

export async function GET() {
  const { user, error, status } = await requireUser();
  if (error || !user) return NextResponse.json({ error }, { status });

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: user.id } } },
    orderBy: { createdAt: "desc" },
    include: {
      careRequest: true,
      match: true,
      participants: { include: { user: { select: { id: true, name: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return NextResponse.json(conversations);
}
