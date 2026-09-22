// Point the app's Prisma singleton at a dedicated test database instead of
// the dev.db used by `npm run dev`, and satisfy the AUTH_SECRET production
// guard in src/auth.ts (tests run with NODE_ENV=test, but set a real value
// regardless so a future change to that check doesn't silently break tests).
process.env.DATABASE_URL = "file:./test.db";
process.env.AUTH_SECRET = "test-secret-not-the-env-example-placeholder";
process.env.NEXTAUTH_URL = "http://localhost:3000";
