# Contributing

Read this once before your first pull request, then keep it open for the first
week. It is short because the rules that matter are enforced by scripts rather
than by remembering them.

## Setup

```bash
git clone git@github.com:GROUPREV/evolve-web.git
cd evolve-web
cp .env.example .env.local     # ask a maintainer for the values
make setup
make dev                       # http://localhost:3000
```

`.env.local` is gitignored and must stay that way. Both Supabase values in it
are public by design — they are compiled into the JavaScript bundle and are
protected by row-level security, not by secrecy — but the habit of pasting
credentials into tracked files is the one that eventually catches a real one.
`scripts/secret_guard.sh` fails the build if it does.

## Branching

```text
fix/short-description ─┐
feat/another-thing   ──┼──▶  development  ──▶  main
chore/third-thing    ──┘     (integration)     (release)
```

| Branch                        | Purpose                                    | Merge method  |
| ----------------------------- | ------------------------------------------ | ------------- |
| `main`                        | Release. What production serves.            | Merge commit  |
| `development`                 | Integration. Everything lands here first.   | Squash        |
| `feat/*` `fix/*` `chore/*`    | One change each.                            | —             |

Branch from `development`, never from `main`. Branching from `main` means
building on top of work that has already been integrated, and the merge will
say so — usually as a conflict in a file you never opened.

You cannot push to `development` or `main`, force-push them, delete them, or
merge a red pull request into them. That is enforced by organisation rulesets,
not by convention, and it applies to everyone including the person who set them
up. See `guides/branch-protection.md` in the `GROUPREV/docs` repository.

**This is meant to be freeing, not restrictive.** You cannot break this
repository. Push early, push unfinished work, open draft pull requests on day
one of a task. The worst outcome available to you is a red check.

## The loop

```bash
git checkout development
git pull
git checkout -b feat/discipline-cards
# ... work, committing as you go ...
make ci-local                     # everything CI runs, locally, in ~1 min
git push -u origin HEAD
gh pr create                      # bases on development automatically
```

Run `make ci-local` before every push. CI runs the same script plus a production
build. A red pull request costs four minutes to find out what one minute would
have told you.

Open the pull request as a **draft** when you start, not when you finish. Work
nobody can see is work nobody can help with, and "I'll open it when it's ready"
is how a 900-line diff arrives on the last day of a sprint.

## What CI enforces

Six things, in the order that fails cheapest first.

| Check           | Catches                                                                |
| --------------- | ---------------------------------------------------------------------- |
| Secrets         | a credential in a tracked file; reports the line, never the value       |
| Boundaries      | `lib/` importing a component; `next/link`; `process.env` outside config |
| Design tokens   | a hex colour in markup; `pl-`/`pr-` classes that break Arabic           |
| Component size  | a `.tsx` file over 300 lines                                            |
| Format and lint | Biome                                                                   |
| Typecheck       | everything else                                                         |

Plus a production build, which only CI runs.

These are executable rules, not conventions. Each one exists because breaking it
caused a real problem — the reason is written at the top of each script in
`scripts/`. **If a guard blocks you and the rule is wrong, change the rule in
the same pull request and say why.** Do not add a quiet exemption; an exemption
list nobody reviews is a guard that has stopped working.

## Writing the pull request

The template asks four questions. The third is the one that matters.

**"How was this verified"** is not for "tests pass" — that is what CI already
says. It is for what CI *cannot* check: which screen you exercised and at what
width, whether you loaded the Arabic page and the layout survived, what you
checked against real data rather than assumed, what is still unverified.

**Say what you are unsure about.** A declared shortcut is a decision. A
discovered one is a defect. Nobody has ever been in trouble here for writing
"I wasn't sure this was the right place for it" in a pull request.

Keep pull requests under about 400 changed lines. Over that, a reviewer skims
instead of reading, and skimmed code is unreviewed code. If a change is
genuinely bigger, split it into a stack and say so.

## Review

Every pull request needs **one peer review before a maintainer looks at it.**

Reviewing is not a formality you perform on the way to a merge — it is half of
the job you are here to learn. Read the diff, run the branch, and comment.

Prefix comments so the author knows what is blocking:

- `blocking:` — must change before merge
- `suggestion:` — worth considering, author decides
- `nit:` — style or taste, never blocking
- `question:` — you want to understand, not to change

Without prefixes, juniors treat every comment as fatal and seniors wonder why a
one-word note stalled a branch for a day.

## Definition of Done

A change is done when all eight are true:

1. Branch named `feat/` `fix/` or `chore/`, based on and targeting `development`
2. `make ci-local` green locally, CI green on the pull request
3. Template filled in, including how it was verified
4. Approved by one peer, then by a maintainer
5. Checked on the preview deployment, not only on localhost
6. UI changes: screenshots at mobile and desktop width, **and in Arabic**
7. No new `any`, no new lint suppressions
8. Docs updated if behaviour changed

## Architecture

```text
app/          routes, pages, layouts   may import components/ and lib/
components/   presentation             may import lib/, never app/
lib/          data and plumbing        imports neither
  ├── data/       queries — one file per table, all `server-only`
  ├── supabase/   the three clients: server, browser, middleware
  └── env.ts      the only file that reads process.env
i18n/         locale routing and message loading
messages/     fr.json · ar.json · en.json
scripts/      the guards
```

`scripts/boundary_guard.sh` enforces the arrows. The direction is the point: a
data function that imports a component is the start of a cycle, and the symptom
shows up three files away from the import that caused it.

### The one page to read first

`app/[locale]/disciplines/page.tsx` is the reference implementation. It goes all
the way through — route, query, row-level security, rendered markup, three
languages, right-to-left — against the real database, with nothing mocked. Read
it alongside `lib/data/categories.ts` and the `categories_select_all` policy in
`evolve_academy_dashboard/supabase/migrations/0002_cms_schema.sql`. They are one
mechanism written in three places.

When you build a new data-backed page, copy its shape.

### The database is not ours

The schema lives in the **`evolve_academy_dashboard` repository** and is enforced
by row-level security in Postgres. This app reads it as the signed-in user — or
as `anon` for a visitor — and there is no service-role client anywhere. That is
what makes it safe to query straight from a Server Component without an
authorization check in the component: the check already happened, in the
database.

**Do not write migrations here.** If you need a column, a table, or a policy
change, raise it with a maintainer and it goes through the dashboard repository.
Working around a missing column in the frontend is the one shortcut that will
get a pull request closed rather than reviewed.

## Arabic

Arabic is right-to-left, and it is a first-class language here rather than a
translation added at the end.

- Use logical properties: `ps-4` and `pe-4`, never `pl-4` and `pr-4`. The guard
  fails on the physical ones.
- Import `Link` from `@/i18n/navigation`, never from `next/link`. Next's own
  `Link` drops the locale, so an Arabic reader lands on the French page.
- Load `/ar/...` before you open the pull request. Every RTL bug this project
  will have is invisible until you do, and obvious the moment you do.
