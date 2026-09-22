import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const roleHome: Record<string, string> = {
  family: "/family",
  caregiver: "/caregiver",
  admin: "/admin",
};

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect(roleHome[session.user.role] ?? "/");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">
        Find trusted care for your elderly relative
      </h1>
      <p className="mt-4 text-lg text-stone-600">
        Careworker replaces fragmented Facebook groups and WhatsApp chains with structured,
        admin-verified caregiver profiles and requests — built for families in Egypt.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/signup"
          className="rounded-md bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          Log in
        </Link>
      </div>

      <div className="mt-16 grid gap-6 text-left sm:grid-cols-3">
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900">For families</h2>
          <p className="mt-2 text-sm text-stone-600">
            Post a structured care request and review verified caregiver applications.
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900">For caregivers</h2>
          <p className="mt-2 text-sm text-stone-600">
            Build a credentialed profile, browse relevant requests, and apply directly.
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900">Trust & safety</h2>
          <p className="mt-2 text-sm text-stone-600">
            Admin document review, verification badges, and reviews after every match.
          </p>
        </div>
      </div>
    </div>
  );
}
