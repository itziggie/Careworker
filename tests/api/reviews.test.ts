import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

import { auth } from "@/auth";
import { POST } from "@/app/api/reviews/route";
import { createFamily, createMatchedPair } from "../helpers/fixtures";

function reviewRequest(matchId: string, rating = 5) {
  return new Request("http://localhost/api/reviews", {
    method: "POST",
    body: JSON.stringify({ matchId, rating, comment: "Great experience" }),
  });
}

describe("POST /api/reviews", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
  });

  it("lets a family member review a confirmed match", async () => {
    const { family, match } = await createMatchedPair("confirmed");

    vi.mocked(auth).mockResolvedValue({
      user: { id: family.id, role: "family", name: family.name, email: family.email },
    } as never);

    const res = await POST(reviewRequest(match.id));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.rating).toBe(5);
  });

  it("blocks reviews before the match is confirmed", async () => {
    const { family, match } = await createMatchedPair("proposed");

    vi.mocked(auth).mockResolvedValue({
      user: { id: family.id, role: "family", name: family.name, email: family.email },
    } as never);

    const res = await POST(reviewRequest(match.id));
    expect(res.status).toBe(400);
  });

  it("allows a review once the match is completed", async () => {
    const { family, match } = await createMatchedPair("completed");

    vi.mocked(auth).mockResolvedValue({
      user: { id: family.id, role: "family", name: family.name, email: family.email },
    } as never);

    const res = await POST(reviewRequest(match.id));
    expect(res.status).toBe(201);
  });

  it("forbids a reviewer who isn't part of the match", async () => {
    const { match } = await createMatchedPair("confirmed");
    const stranger = await createFamily();

    vi.mocked(auth).mockResolvedValue({
      user: { id: stranger.id, role: "family", name: stranger.name, email: stranger.email },
    } as never);

    const res = await POST(reviewRequest(match.id));
    expect(res.status).toBe(403);
  });

  it("rejects a second review from the same reviewer on the same match", async () => {
    const { family, match } = await createMatchedPair("confirmed");

    vi.mocked(auth).mockResolvedValue({
      user: { id: family.id, role: "family", name: family.name, email: family.email },
    } as never);

    const first = await POST(reviewRequest(match.id));
    expect(first.status).toBe(201);

    const second = await POST(reviewRequest(match.id));
    expect(second.status).toBe(409);
  });
});
