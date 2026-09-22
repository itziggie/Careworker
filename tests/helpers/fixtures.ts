import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export async function createFamily(overrides: Partial<{ name: string; email: string }> = {}) {
  return prisma.user.create({
    data: {
      email: overrides.email ?? `family-${randomUUID()}@example.com`,
      passwordHash: "not-used-in-tests",
      name: overrides.name ?? "Test Family",
      role: "family",
    },
  });
}

export async function createCaregiverWithProfile(
  overrides: Partial<{ name: string; email: string }> = {}
) {
  const user = await prisma.user.create({
    data: {
      email: overrides.email ?? `caregiver-${randomUUID()}@example.com`,
      passwordHash: "not-used-in-tests",
      name: overrides.name ?? "Test Caregiver",
      role: "caregiver",
    },
  });
  const profile = await prisma.caregiverProfile.create({
    data: {
      userId: user.id,
      location: "Cairo",
      careCapabilities: JSON.stringify(["mobility"]),
      languages: JSON.stringify(["ar"]),
      availability: JSON.stringify({ days: ["mon"], hours: "9-5" }),
      preferredWorkType: "visit_based",
    },
  });
  return { user, profile };
}

export async function createCareRequest(familyUserId: string) {
  return prisma.careRequest.create({
    data: {
      familyUserId,
      location: "Cairo",
      startDate: new Date(),
      hoursSchedule: "9-5 weekdays",
      careType: "visit_based",
      requiredTasks: JSON.stringify(["mobility"]),
    },
  });
}

export async function createApplication(careRequestId: string, caregiverProfileId: string) {
  return prisma.application.create({
    data: {
      careRequestId,
      caregiverProfileId,
      message: "I would love to help with this care request.",
    },
  });
}

export async function createMatch(
  careRequestId: string,
  caregiverProfileId: string,
  status: "proposed" | "confirmed" | "completed" | "cancelled" = "confirmed"
) {
  return prisma.match.create({
    data: {
      careRequestId,
      caregiverProfileId,
      status,
      confirmedAt: status === "confirmed" || status === "completed" ? new Date() : null,
    },
  });
}

/** Builds a family + caregiver + care request + match in one call for tests that just need a confirmed match to act on. */
export async function createMatchedPair(
  matchStatus: "proposed" | "confirmed" | "completed" | "cancelled" = "confirmed"
) {
  const family = await createFamily();
  const { user: caregiverUser, profile: caregiverProfile } = await createCaregiverWithProfile();
  const careRequest = await createCareRequest(family.id);
  const match = await createMatch(careRequest.id, caregiverProfile.id, matchStatus);
  return { family, caregiverUser, caregiverProfile, careRequest, match };
}
