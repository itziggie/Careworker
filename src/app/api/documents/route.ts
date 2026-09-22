import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { DOCUMENT_TYPES } from "@/lib/constants";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = new Set(["application/pdf", "image/png", "image/jpeg"]);

export async function POST(request: Request) {
  const { user, error, status } = await requireRole("caregiver");
  if (error || !user) return NextResponse.json({ error }, { status });

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return NextResponse.json({ error: "Create your caregiver profile first" }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const docType = formData.get("docType");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (typeof docType !== "string" || !DOCUMENT_TYPES.includes(docType as (typeof DOCUMENT_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: "Only PDF, PNG, or JPEG files are allowed" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", profile.id);
  await mkdir(uploadsDir, { recursive: true });

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const safeName = `${randomUUID()}.${ext}`;
  const filePath = path.join(uploadsDir, safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const document = await prisma.document.create({
    data: {
      caregiverProfileId: profile.id,
      fileName: file.name,
      fileUrl: `/uploads/${profile.id}/${safeName}`,
      docType,
    },
  });

  // A new document reopens verification for admin review.
  await prisma.caregiverProfile.update({
    where: { id: profile.id },
    data: { verificationStatus: profile.verificationStatus === "verified" ? "pending" : profile.verificationStatus },
  });

  return NextResponse.json(document, { status: 201 });
}
