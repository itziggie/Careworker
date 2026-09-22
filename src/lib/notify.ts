import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/lib/constants";

export async function notify(
  userId: string,
  type: NotificationType,
  payload: Record<string, unknown>
) {
  await prisma.notification.create({
    data: { userId, type, payload: JSON.stringify(payload) },
  });

  // MVP email stub: the pilot doesn't have SMTP configured yet, so we
  // log what would be sent. Swap this for a real mailer (Resend, SES)
  // when notifications need to leave the platform.
  console.log(`[email stub] to user ${userId} — ${type}`, payload);
}
