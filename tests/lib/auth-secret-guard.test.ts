import { describe, it, expect } from "vitest";
import { assertAuthSecretConfigured } from "@/lib/env-guard";

function envWith(overrides: Partial<NodeJS.ProcessEnv>): NodeJS.ProcessEnv {
  return { ...overrides } as NodeJS.ProcessEnv;
}

describe("assertAuthSecretConfigured", () => {
  it("does not throw outside production", () => {
    expect(() =>
      assertAuthSecretConfigured(
        envWith({ NODE_ENV: "test", AUTH_SECRET: "replace-with-a-random-32-byte-secret" })
      )
    ).not.toThrow();
  });

  it("does not throw during next build's production-mode page-data collection", () => {
    expect(() =>
      assertAuthSecretConfigured(
        envWith({
          NODE_ENV: "production",
          NEXT_PHASE: "phase-production-build",
          AUTH_SECRET: "replace-with-a-random-32-byte-secret",
        })
      )
    ).not.toThrow();
  });

  it("throws when serving in production with the .env.example placeholder secret", () => {
    expect(() =>
      assertAuthSecretConfigured(
        envWith({ NODE_ENV: "production", AUTH_SECRET: "replace-with-a-random-32-byte-secret" })
      )
    ).toThrow(/AUTH_SECRET/);
  });

  it("throws when serving in production with no AUTH_SECRET set at all", () => {
    expect(() => assertAuthSecretConfigured(envWith({ NODE_ENV: "production" }))).toThrow(
      /AUTH_SECRET/
    );
  });

  it("does not throw when serving in production with a real secret", () => {
    expect(() =>
      assertAuthSecretConfigured(
        envWith({ NODE_ENV: "production", AUTH_SECRET: "a-real-random-secret-nobody-else-has" })
      )
    ).not.toThrow();
  });
});
