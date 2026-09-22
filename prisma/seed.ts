import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  const adminPassword = await hash("admin1234");
  const admin = await prisma.user.upsert({
    where: { email: "admin@careworker.eg" },
    update: {},
    create: {
      email: "admin@careworker.eg",
      passwordHash: adminPassword,
      name: "Careworker Admin",
      role: "admin",
    },
  });

  const familyPassword = await hash("family1234");
  const family = await prisma.user.upsert({
    where: { email: "family@example.com" },
    update: {},
    create: {
      email: "family@example.com",
      passwordHash: familyPassword,
      name: "Mona Farouk",
      phone: "+20 100 000 0001",
      role: "family",
    },
  });

  const caregiverUsers = [
    { email: "sara.n@example.com", name: "Sara Nabil" },
    { email: "hoda.m@example.com", name: "Hoda Mahmoud" },
    { email: "ahmed.k@example.com", name: "Ahmed Kamal" },
  ];

  const caregiverPassword = await hash("caregiver1234");
  const caregiverProfiles = [];
  for (const cg of caregiverUsers) {
    const user = await prisma.user.upsert({
      where: { email: cg.email },
      update: {},
      create: {
        email: cg.email,
        passwordHash: caregiverPassword,
        name: cg.name,
        phone: "+20 100 000 0002",
        role: "caregiver",
      },
    });

    const profile = await prisma.caregiverProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        location: "Cairo, Nasr City",
        travelRadiusKm: 15,
        education: "BSc Nursing, Cairo University",
        certifications: JSON.stringify(["First Aid", "Elderly Care Certificate"]),
        experienceYears: 4,
        careCapabilities: JSON.stringify([
          "Mobility assistance",
          "Medication management",
          "Companionship",
        ]),
        languages: JSON.stringify(["Arabic", "English"]),
        availability: JSON.stringify({ days: ["Sun", "Mon", "Tue", "Wed", "Thu"], hours: "08:00-18:00" }),
        preferredWorkType: "visit_based",
        verificationStatus: "verified",
        bio: `${cg.name} is a nursing graduate with hands-on elderly care experience.`,
      },
    });
    caregiverProfiles.push(profile);
  }

  const careRequest = await prisma.careRequest.create({
    data: {
      familyUserId: family.id,
      location: "Cairo, Heliopolis",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      hoursSchedule: "Weekdays, 9am-5pm",
      careType: "visit_based",
      requiredTasks: JSON.stringify(["Mobility assistance", "Meal preparation", "Companionship"]),
      preferredAttributes: "Female caregiver, Arabic-speaking, experience with dementia patients preferred",
      budgetMin: 4000,
      budgetMax: 6000,
      notes: "My mother is 78 and needs daytime support while I'm at work.",
      status: "open",
    },
  });

  await prisma.application.create({
    data: {
      careRequestId: careRequest.id,
      caregiverProfileId: caregiverProfiles[0].id,
      message: "I'd love to help care for your mother. I have 4 years of experience with elderly daytime care.",
      status: "pending",
    },
  });

  console.log("Seed complete:");
  console.log({ admin: admin.email, family: family.email, caregivers: caregiverUsers.map((c) => c.email) });
  console.log("Passwords: admin1234 / family1234 / caregiver1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
