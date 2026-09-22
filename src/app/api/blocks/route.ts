import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";
import { z } from "zod";

const blockSchema = z.object({ blockedId: z.string().min(1) });

export async function POST(request: Request) {
  const { user, error, status } = await requireUser();
  if (error || !user) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const parsed = blockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "blockedId is required" }, { status: 400 });
  }
  if (parsed.data.blockedId === user.id) {
    return NextResponse.json({ error: "You cannot block yourself" }, { status: 400 });
  }

  const block = await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId: user.id, blockedId: parsed.data.blockedId } },
    update: {},
    create: { blockerId: user.id, blockedId: parsed.data.blockedId },
  });

  return NextResponse.json(block, { status: 201 });
}
