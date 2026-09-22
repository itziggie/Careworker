"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm text-stone-600 hover:text-stone-900"
    >
      Log out
    </button>
  );
}
