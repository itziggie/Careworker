import { auth } from "@/auth";
import type { Role } from "@/lib/constants";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    return { error: "Not authenticated" as const, status: 401 as const, user: null };
  }
  return { error: null, status: 200 as const, user: session.user };
}

export async function requireRole(...roles: Role[]) {
  const { user, error, status } = await requireUser();
  if (error || !user) {
    return { error, status, user: null };
  }
  if (!roles.includes(user.role)) {
    return { error: "Forbidden" as const, status: 403 as const, user: null };
  }
  return { error: null, status: 200 as const, user };
}
