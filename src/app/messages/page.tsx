import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function MessagesListPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: session.user.id } } },
    orderBy: { createdAt: "desc" },
    include: {
      careRequest: true,
      participants: { include: { user: { select: { id: true, name: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-stone-900">Messages</h1>

      {conversations.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">
          No conversations yet — they open automatically once a match is confirmed.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {conversations.map((c) => {
            const other = c.participants.find((p) => p.userId !== session.user.id)?.user;
            const lastMessage = c.messages[0];
            return (
              <li key={c.id}>
                <Link
                  href={`/messages/${c.id}`}
                  className="block rounded-lg border border-stone-200 bg-white p-4 hover:border-teal-300 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-stone-900">{other?.name ?? "Conversation"}</p>
                    {c.careRequest && (
                      <span className="text-xs text-stone-500">{c.careRequest.location}</span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-stone-600">
                    {lastMessage ? lastMessage.body : "No messages yet — say hello."}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
