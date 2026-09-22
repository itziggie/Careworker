import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";

const roleHome: Record<string, string> = {
  family: "/family",
  caregiver: "/caregiver",
  admin: "/admin",
};

export async function Nav() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href={user ? roleHome[user.role] : "/"} className="text-lg font-semibold text-teal-800">
          Careworker
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              {user.role === "family" && (
                <>
                  <Link href="/family" className="text-sm text-stone-600 hover:text-stone-900">
                    My requests
                  </Link>
                  <Link href="/family/requests/new" className="text-sm text-stone-600 hover:text-stone-900">
                    New request
                  </Link>
                </>
              )}
              {user.role === "caregiver" && (
                <>
                  <Link href="/caregiver/feed" className="text-sm text-stone-600 hover:text-stone-900">
                    Browse requests
                  </Link>
                  <Link href="/caregiver/applications" className="text-sm text-stone-600 hover:text-stone-900">
                    My applications
                  </Link>
                  <Link href="/caregiver/profile" className="text-sm text-stone-600 hover:text-stone-900">
                    My profile
                  </Link>
                </>
              )}
              {user.role === "admin" && (
                <>
                  <Link href="/admin/caregivers" className="text-sm text-stone-600 hover:text-stone-900">
                    Verification
                  </Link>
                  <Link href="/admin/requests" className="text-sm text-stone-600 hover:text-stone-900">
                    Requests
                  </Link>
                  <Link href="/admin/reports" className="text-sm text-stone-600 hover:text-stone-900">
                    Reports
                  </Link>
                </>
              )}
              <Link href="/messages" className="text-sm text-stone-600 hover:text-stone-900">
                Messages
              </Link>
              <span className="text-sm text-stone-400">{user.name}</span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-stone-600 hover:text-stone-900">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
