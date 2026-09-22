import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PATCH } from "@/app/api/matches/[id]/route";
import { createFamily, createMatchedPair } from "../helpers/fixtures";

function patchRequest(action: string) {
  return new Request("http://localhost/api/matches/x", {
    method: "PATCH",
    body: JSON.stringify({ action }),
  });
}

describe("PATCH /api/matches/[id]", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
  });

  it("lets the family mark a confirmed match complete", async () => {
    const { family, match } = await createMatchedPair("confirmed");

    vi.mocked(auth).mockResolvedValue({
      user: { id: family.id, role: "family", name: family.name, email: family.email },
    } as never);

    const res = await PATCH(patchRequest("complete"), { params: Promise.resolve({ id: match.id }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("completed");
    expect(body.completedAt).not.toBeNull();
  });

  it("reopens the care request when a match is cancelled", async () => {
    const { family, match, careRequest } = await createMatchedPair("confirmed");
    await prisma.careRequest.update({ where: { id: careRequest.id }, data: { status: "matched" } });

    vi.mocked(auth).mockResolvedValue({
      user: { id: family.id, role: "family", name: family.name, email: family.email },
    } as never);

    const res = await PATCH(patchRequest("cancel"), { params: Promise.resolve({ id: match.id }) });
    expect(res.status).toBe(200);

    const reopened = await prisma.careRequest.findUniqueOrThrow({ where: { id: careRequest.id } });
    expect(reopened.status).toBe("open");
  });

  it("lets the matched caregiver act on their own match", async () => {
    const { caregiverUser, match } = await createMatchedPair("confirmed");

    vi.mocked(auth).mockResolvedValue({
      user: { id: caregiverUser.id, role: "caregiver", name: caregiverUser.name, email: caregiverUser.email },
    } as never);

    const res = await PATCH(patchRequest("complete"), { params: Promise.resolve({ id: match.id }) });
    expect(res.status).toBe(200);
  });

  it("forbids a user who is not part of the match and not an admin", async () => {
    const { match } = await createMatchedPair("confirmed");
    const stranger = await createFamily();

    vi.mocked(auth).mockResolvedValue({
      user: { id: stranger.id, role: "family", name: stranger.name, email: stranger.email },
    } as never);

    const res = await PATCH(patchRequest("complete"), { params: Promise.resolve({ id: match.id }) });
    expect(res.status).toBe(403);
  });

  it("refuses to act on a match that is already closed", async () => {
    const { family, match } = await createMatchedPair("completed");

    vi.mocked(auth).mockResolvedValue({
      user: { id: family.id, role: "family", name: family.name, email: family.email },
    } as never);

    const res = await PATCH(patchRequest("cancel"), { params: Promise.resolve({ id: match.id }) });
    expect(res.status).toBe(400);
  });
});
