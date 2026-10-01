# Evolve Academy — website

The public site and student platform for Evolve Academy. Reads the Supabase
content that the [`evolve_academy_dashboard`](../evolve_academy_dashboard)
(Flutter Web) writes.

Next.js 15 App Router · React 19 · TypeScript strict · Tailwind 4 · Biome ·
next-intl (FR / AR / EN) · Supabase.

## Start here

```bash
cp .env.example .env.local     # ask a maintainer for the values
make setup
make dev                       # http://localhost:3000
```

Then read, in this order:

1. **[CONTRIBUTING.md](CONTRIBUTING.md)** — the loop, the guards, the definition
   of done. Twenty minutes, and it is the only process document.
2. **`app/[locale]/disciplines/page.tsx`** — the reference implementation. One
   page, all the way through: route → query → row-level security → markup →
   three languages → right-to-left, against the real database with nothing
   mocked. Every data-backed page copies its shape.
3. **[docs/week-4-foundations.md](docs/week-4-foundations.md)** — the pairing
   plan for the foundations week, and who owns what after it.

## What is here and what is not

Deliberately finished:

- Repository configuration, CI, and the six guards in `scripts/`
- The Supabase clients and the composed i18n + auth middleware
- One complete vertical slice: `/disciplines`

Deliberately unfinished, and owned by the tracks in
[docs/week-4-foundations.md](docs/week-4-foundations.md):

- The design tokens in `app/globals.css` are a provisional greyscale, not the
  brand. Replacing them should be a one-file diff.
- The home page is a placeholder so the route resolves. It is not a design.
- There is no header, footer, navigation or language switcher yet.
- There is no authentication UI yet.

If something looks half-built, check that list before assuming it is a bug.

## The database is not in this repository

The schema — `categories`, `courses`, `modules`, `lessons`,
`lesson_completions`, `comments`, `notes`, `content_submissions`,
`approval_events`, `profiles` — lives in the dashboard repository, along with
the row-level security policies that decide who may read what.

This app holds no service-role key. Most schema and row-level security policies
are maintained in the dashboard repository. The course-messaging tables and
their participant-only policies are defined in
[`supabase/migrations/20260930100000_course_messaging.sql`](supabase/migrations/20260930100000_course_messaging.sql);
apply that migration to the shared Supabase project before enabling messaging
in either portal. Every query runs as the caller, so Postgres enforces access.

Paid course revenue is recorded in `public.enrollments.payment_amount`, using
the server-side course price at checkout. The staff portal totals paid
enrollments with a saved amount and reports older rows without one separately.
The enrollment schema is managed by the dashboard repository.

The staff portal's administrator invitation action uses the
[`invite-admin` Edge Function](supabase/functions/invite-admin/index.ts).
Administrator role changes, invitations, revenue, and the administrator
overview use the [`admin-dashboard`, `admin-revenue`, `admin-update-user-role`,
and `invite-admin` Edge Functions](supabase/functions/).
Deploy them and the profile-role migration to the shared Supabase project before
using those staff portal features.
Each function verifies the caller's profile role and uses the server-side
service-role key; never add that key to the Flutter app. Configure Supabase Auth
email delivery so administrator invitations can be sent.

## Layout

```text
app/          routes, pages, layouts
components/   presentation
lib/
  ├── data/       queries — one file per table, all `server-only`
  ├── supabase/   server, browser and middleware clients
  └── env.ts      the only file that reads process.env
i18n/         locale routing and message loading
messages/     fr.json · ar.json · en.json
scripts/      the guards; `make ci-local` runs them all
```
