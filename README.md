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

This app holds no service-role key and writes no migrations. Every query runs as
the caller, so Postgres applies the permission rules and the frontend does not
restate them. Need a column? Raise it with a maintainer; it goes through the
dashboard repository.

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
