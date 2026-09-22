import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/lib/constants";

// Edge-safe config used by middleware. No Node-only dependencies
// (bcrypt, Prisma) may be imported from this file.
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      const t = token as typeof token & { id?: string; role?: Role };
      if (user) {
        t.id = user.id;
        t.role = user.role as Role;
      }
      return t;
    },
    session: async ({ session, token }) => {
      const t = token as typeof token & { id?: string; role?: Role };
      if (session.user) {
        session.user.id = t.id as string;
        session.user.role = t.role as Role;
      }
      return session;
    },
    authorized: ({ auth, request }) => {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const role = auth?.user?.role;

      const protectedPrefixes: Record<string, string> = {
        "/family": "family",
        "/caregiver": "caregiver",
        "/admin": "admin",
      };

      const matchedPrefix = Object.keys(protectedPrefixes).find((p) =>
        pathname.startsWith(p)
      );
      if (!matchedPrefix) return true;

      if (!isLoggedIn) return false;
      return role === protectedPrefixes[matchedPrefix];
    },
  },
};
