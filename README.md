# Careworker

Elder care marketplace MVP for Egypt — families post structured care requests,
caregivers build verified profiles and apply, matches open an in-platform
conversation, and reviews unlock after a confirmed match. Built to test
whether structured, admin-verified matching can replace fragmented
Facebook/WhatsApp sourcing (see the product spec this implements).

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS 4)
- **Prisma 6** + SQLite for local/dev persistence (swap the `datasource` in
  `prisma/schema.prisma` for Postgres/MySQL when moving past the pilot —
  the SQLite connector doesn't support native enums, so status fields are
  modeled as validated strings; see the comment at the top of the schema)
- **NextAuth (Auth.js) v5**, credentials provider, JWT sessions, role-based
  route protection via `src/proxy.ts`
- **Zod** for input validation, **bcryptjs** for password hashing

## Getting started

```bash
npm install
cp .env.example .env   # then set a real AUTH_SECRET for anything beyond local dev
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open http://localhost:3000.

### Demo accounts (from `npm run db:seed`)

| Role      | Email                    | Password       |
|-----------|--------------------------|----------------|
| Admin     | admin@careworker.eg      | admin1234      |
| Family    | family@example.com       | family1234     |
| Caregiver | sara.n@example.com       | caregiver1234  |
| Caregiver | hoda.m@example.com       | caregiver1234  |
| Caregiver | ahmed.k@example.com      | caregiver1234  |

## What's implemented (MVP scope from the product spec)

- **Family flow** — sign up, create a structured care request (location,
  schedule, live-in/visit-based, required tasks, budget, notes), review
  applications, accept a caregiver (confirms the match and opens
  messaging), mark an engagement complete/cancelled, leave a review.
- **Caregiver flow** — sign up, build a profile (credentials, experience,
  capabilities, languages, availability, preferred work type), upload
  supporting documents, browse the open-request feed with location/care-type
  filters, apply with a short intro, message after a match, leave a review.
- **Matching & communication** — request feed with filters, applications
  linked to requests, in-platform messaging (polling-based), and
  notification records for new application / new message / match confirmed
  (see **Notifications** below for what's stubbed).
- **Trust & safety** — caregiver verification status (pending/verified/
  rejected) with admin document review, report and block, reviews gated to
  confirmed/completed matches only, and a persistent disclaimer that the
  platform only facilitates introductions.
- **Admin** — dashboard with counts, caregiver verification queue (approve/
  reject with notes), full request list, and report triage (mark
  reviewed/dismissed).

### Deferred (per the spec's own scope cut)

Native apps, automated payments/escrow, advanced AI matching, voice-agent
onboarding, a full training/certification program, shift/payroll
management, and insurance integrations are all explicitly out of scope for
this pilot build.

## Notifications

`src/lib/notify.ts` writes a `Notification` row and logs what would be sent
to the console — there's no SMTP configured yet, so "email notifications"
are a stub. Swap the `console.log` for a real mailer (Resend, SES, etc.)
when the pilot needs messages to actually leave the platform. The
`schedule_reminder` notification type exists in the schema but nothing
triggers it yet — that needs a scheduled job (cron/queue), which is out of
scope for this MVP pass.

## Document storage

Caregiver-uploaded documents (ID, certifications, references) are written to
`public/uploads/<caregiverProfileId>/` on local disk — fine for a pilot on a
single instance, not for a multi-instance deployment. Move to S3/Cloud
Storage before scaling past one server.

## Auth notes

- `src/auth.config.ts` is the edge-safe config (no Prisma/bcrypt imports)
  used by `src/proxy.ts` for role-based route protection on `/family/*`,
  `/caregiver/*`, `/admin/*`. `src/auth.ts` extends it with the credentials
  provider for the full Node runtime.
- Set `trustHost: true` (already set) plus a real `AUTH_SECRET` before
  deploying anywhere other than trusted local dev.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build/run
- `npm run lint` — ESLint
- `npm run db:seed` — reseed demo data (`npx prisma migrate reset` first if
  you want a clean slate)
- `npm test` — runs the Vitest suite against a dedicated SQLite database
  (`prisma/test.db`, migrated fresh by the `pretest` script); covers the
  accept-to-match flow, review gating, match completion/cancellation, and
  the production `AUTH_SECRET` guard
