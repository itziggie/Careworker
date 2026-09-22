import { prisma } from "@/lib/prisma";

export async function getOrCreateConversationForMatch(
  matchId: string,
  careRequestId: string,
  participantUserIds: string[]
) {
  const existing = await prisma.conversation.findUnique({ where: { matchId } });
  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      matchId,
      careRequestId,
      participants: {
        create: participantUserIds.map((userId) => ({ userId })),
      },
    },
  });
}
