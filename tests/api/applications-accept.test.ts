import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PATCH } from "@/app/api/applications/[id]/route";
import {
  createFamily,
  createCaregiverWithProfile,
  createCareRequest,
  createApplication,
} from "../helpers/fixtures";

function patchRequest(action: string) {
  return new Request("http://localhost/api/applications/x", {
    method: "PATCH",
    body: JSON.stringify({ action }),
  });
}

describe("PATCH /api/applications/[id]", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
  });

  it("accepting an application confirms a match, closes the request, and opens a conversation", async () => {
    const family = await createFamily();
    const { user: caregiverUser, profile: caregiverProfile } = await createCaregiverWithProfile();
    const careRequest = await createCareRequest(family.id);
    const application = await createApplication(careRequest.id, caregiverProfile.id);

    vi.mocked(auth).mockResolvedValue({
      user: { id: family.id, role: "family", name: family.name, email: family.email },
    } as never);

    const res = await PATCH(patchRequest("accept"), {
      params: Promise.resolve({ id: application.id }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.match.status).toBe("confirmed");
    expect(body.application.status).toBe("accepted");

    const updatedRequest = await prisma.careRequest.findUniqueOrThrow({ where: { id: careRequest.id } });
    expect(updatedRequest.status).toBe("matched");

    const conversation = await prisma.conversation.findUnique({ where: { matchId: body.match.id } });
    expect(conversation).not.toBeNull();
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId: conversation!.id },
    });
    expect(participants.map((p) => p.userId).sort()).toEqual([caregiverUser.id, family.id].sort());
  });

  it("rejects a family that doesn't own the care request", async () => {
    const family = await createFamily();
    const otherFamily = await createFamily();
    const { profile: caregiverProfile } = await createCaregiverWithProfile();
    const careRequest = await createCareRequest(family.id);
    const application = await createApplication(careRequest.id, caregiverProfile.id);

    vi.mocked(auth).mockResolvedValue({
      user: { id: otherFamily.id, role: "family", name: otherFamily.name, email: otherFamily.email },
    } as never);

    const res = await PATCH(patchRequest("accept"), {
      params: Promise.resolve({ id: application.id }),
    });
    expect(res.status).toBe(403);

    const unchanged = await prisma.application.findUniqueOrThrow({ where: { id: application.id } });
    expect(unchanged.status).toBe("pending");
  });

  it("refuses to act on an application that is already resolved", async () => {
    const family = await createFamily();
    const { profile: caregiverProfile } = await createCaregiverWithProfile();
    const careRequest = await createCareRequest(family.id);
    const application = await createApplication(careRequest.id, caregiverProfile.id);
    await prisma.application.update({ where: { id: application.id }, data: { status: "rejected" } });

    vi.mocked(auth).mockResolvedValue({
      user: { id: family.id, role: "family", name: family.name, email: family.email },
    } as never);

    const res = await PATCH(patchRequest("accept"), {
      params: Promise.resolve({ id: application.id }),
    });
    expect(res.status).toBe(400);
  });

  it("requires authentication", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const res = await PATCH(patchRequest("accept"), {
      params: Promise.resolve({ id: "does-not-matter" }),
    });
    expect(res.status).toBe(401);
  });
});
