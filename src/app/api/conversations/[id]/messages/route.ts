import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-role";
import { messageSchema } from "@/lib/validation";
import { notify } from "@/lib/notify";

async function assertParticipant(conversationId: string, userId: string) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  return !!participant;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error, status } = await requireUser();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  if (!(await assertParticipant(id, user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true } } },
  });

  await prisma.message.updateMany({
    where: { conversationId: id, senderId: { not: user.id }, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json(messages);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error, status } = await requireUser();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const body = await request.json();
  const parsed = messageSchema.safeParse({ ...body, conversationId: id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { participants: true },
  });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant = conversation.participants.some((p) => p.userId === user.id);
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const otherParticipants = conversation.participants.filter((p) => p.userId !== user.id);
  const block = await prisma.block.findFirst({
    where: {
      OR: otherParticipants.map((p) => ({
        OR: [
          { blockerId: user.id, blockedId: p.userId },
          { blockerId: p.userId, blockedId: user.id },
        ],
      })),
    },
  });
  if (block) {
    return NextResponse.json({ error: "Messaging is unavailable between these accounts" }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: { conversationId: id, senderId: user.id, body: parsed.data.body },
  });

  for (const participant of otherParticipants) {
    await notify(participant.userId, "new_message", { conversationId: id, messageId: message.id });
  }

  return NextResponse.json(message, { status: 201 });
}
