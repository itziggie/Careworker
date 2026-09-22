const PLACEHOLDER_AUTH_SECRET = "replace-with-a-random-32-byte-secret";
// Next's own next/constants export for this, inlined so this guard has no
// dependency on `next` and can be unit-tested without pulling in Next.js
// or next-auth (whose ESM entry points don't resolve cleanly under Vitest).
const PHASE_PRODUCTION_BUILD = "phase-production-build";

/**
 * .env.example ships a placeholder AUTH_SECRET so the repo can be
 * committed; refuse to serve production traffic with it still in place
 * instead of silently signing sessions with a secret every clone of this
 * repo shares. Skipped during `next build`'s production-mode page-data
 * collection, which loads this module without ever serving a request.
 */
export function assertAuthSecretConfigured(env: NodeJS.ProcessEnv = process.env) {
  if (env.NODE_ENV !== "production" || env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    return;
  }
  if (!env.AUTH_SECRET || env.AUTH_SECRET === PLACEHOLDER_AUTH_SECRET) {
    throw new Error(
      "AUTH_SECRET is missing or still set to the .env.example placeholder. " +
        "Set a real random secret (e.g. `openssl rand -base64 32`) before running in production."
    );
  }
}
