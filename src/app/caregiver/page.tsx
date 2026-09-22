import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function CaregiverIndex() {
  const session = await auth();
  if (!session?.user || session.user.role !== "caregiver") redirect("/login");

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: session.user.id } });
  redirect(profile ? "/caregiver/feed" : "/caregiver/profile");
}
