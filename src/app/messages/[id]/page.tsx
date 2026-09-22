import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MessageThread } from "@/components/message-thread";
import { ReportButton } from "@/components/report-button";
import { BlockButton } from "@/components/block-button";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { participants: { include: { user: { select: { id: true, name: true } } } } },
  });

  if (!conversation) notFound();
  const isParticipant = conversation.participants.some((p) => p.userId === session.user.id);
  if (!isParticipant) notFound();

  const other = conversation.participants.find((p) => p.userId !== session.user.id)?.user;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/messages" className="text-sm text-teal-700 hover:underline">
        &larr; Messages
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-900">{other?.name ?? "Conversation"}</h1>
        {other && (
          <div className="flex items-center gap-3">
            <ReportButton reportedUserId={other.id} reportedUserName={other.name} />
            <BlockButton blockedId={other.id} blockedName={other.name} />
          </div>
        )}
      </div>

      <div className="mt-4">
        <MessageThread conversationId={conversation.id} currentUserId={session.user.id} />
      </div>
    </div>
  );
}
