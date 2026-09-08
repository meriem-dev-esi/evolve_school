# Foundations week — the pairing plan

One week, four people, four tracks, pairs rotating daily. At the end of it
everybody has touched the whole app once, everybody has paired with everybody,
and the four area owners for the sprints that follow have picked themselves.

## Why the repository already has code in it

The starting line was built by a maintainer before this week began: repository
configuration, CI, the six guards, the Supabase clients, the middleware, and one
finished page.

That is not the interesting work being taken away. It is the opposite. A blank
repository teaches nothing, because there is nothing to pattern-match against —
the first week goes into arguing about folder names and discovering that the
Supabase cookie handling has to be written a particular way. What is here
instead is a **worked example**: one page that goes all the way through, so
every question of the form "where does this go?" has an answer you can read
rather than guess.

Two other reasons, said plainly:

- **Branch protection needs organisation admin.** Nobody else can create the
  rulesets, so the repository has to be handed over already protected.
- **The starting line is the one thing that cannot be split four ways.** Four
  people cannot each set up CI. Everything after it can be split, and is.

What was *not* built, on purpose: the design tokens are a provisional greyscale,
the home page is a placeholder, and there is no header, footer, language
switcher or sign-in screen. Those are this week.

## The four tracks

Each is two days for a pair. Each ends in a merged pull request.

### Track 1 · Design tokens and primitives

Replace the provisional palette in `app/globals.css` with the real brand, and
build the three primitives everything else will use: `Button`, `Card`,
`Container`.

**Done when** a rebrand is a one-file diff, `/disciplines` renders in the brand
without any change to its own file, and `scripts/design_token_guard.sh` still
passes.

**You will learn** why the guard exists, by being the person who benefits from
it. The previous site had the brand colour written as a literal in eleven files.

### Track 2 · Layout shell

Header, navigation, footer, language switcher, and the chrome for `error.tsx`
and `not-found.tsx`. The switcher must preserve the current path — switching
language on `/fr/disciplines` lands on `/ar/disciplines`, not on the home page.

**Done when** every route shares the shell, the switcher round-trips all three
languages on a deep path, and the header is usable at 375px wide.

**Watch for** the language switcher: it is the single most common place to reach
for `next/link` out of habit. `scripts/boundary_guard.sh` will stop you, and the
comment on that check explains what it prevents.

### Track 3 · Supabase authentication

Sign-in, sign-up, the OAuth callback route, sign-out, and reading the caller's
`profiles` row on the server.

**Done when** a user can sign in, refresh, and still be signed in; and a Server
Component can name the signed-in user without a client-side fetch.

**Read first** the comment in `lib/supabase/middleware.ts` about `getUser()`
versus `getSession()`. One reads the cookie and trusts it, the other revalidates
with the auth server. A forged cookie passes the first and fails the second.

### Track 4 · Internationalisation and RTL

Structure the message files so they scale past the ten keys they hold now, get
the Arabic plural rules right, and audit every existing screen in RTL.

**Done when** `/ar` is correct at every route — not merely translated, but
mirrored: icons, arrows, spacing, and the order of elements in a row.

**Do the audit with the browser on `/ar` the whole time.** Every RTL bug this
project will ever have is invisible in French and obvious in Arabic.

## The rotation

Two pairs at a time, rotating daily. Over the week every person works with all
three of the others, and on two different tracks.

| Day       | Pair      | Track                | Pair      | Track            |
| --------- | --------- | -------------------- | --------- | ---------------- |
| Monday    | **A + B** | 1 · Design tokens    | **C + D** | 2 · Layout shell |
| Tuesday   | **A + D** | 1 · Design tokens    | **C + B** | 2 · Layout shell |
| Wednesday | **A + C** | 3 · Authentication   | **B + D** | 4 · i18n and RTL |
| Thursday  | **A + C** | 3 · Authentication   | **B + D** | 4 · i18n and RTL |
| Friday    | all four  | Integration and demo | all four  | Retrospective    |

Three rules make it work:

**One person stays, one person rotates.** A anchors track 1 across Monday and
Tuesday while B hands over to D; C anchors track 2 while D hands over to B. The
anchor carries the context, so the rotation costs a briefing rather than a
restart. Rotating both people means starting over, which is why "we tried pair
rotation and it was slow" is usually this mistake.

**Tracks 1 and 2 must be merged by Tuesday evening.** Tracks 3 and 4 sit on top
of them. If a track is not going to land, say so Tuesday lunchtime, not Wednesday
morning.

**The handover is written, not spoken.** Whoever rotates off leaves a comment on
the draft pull request: what is done, what is half-done, what they would do
next. Five minutes, and it is the first time most people write for a colleague
rather than for a marker.

## Inside a pairing day

- **Driver and navigator, swapping every 25 minutes.** Set a timer. The swap is
  not optional and not negotiable at the moment it fires.
- **The navigator does not touch the keyboard.** This is the whole discipline. A
  navigator who reaches over becomes a second driver, and the pair becomes one
  person working while another watches.
- **The navigator's job is the level above the cursor**: is this the right
  approach, is there a token for that, will this survive RTL, should this be its
  own component.
- **Commit at every swap.** Twelve small commits squash into one clean commit at
  merge; one enormous commit stays enormous.
- **Draft pull request opened on the morning of day one**, not the evening of
  day two.
- **Blocked for 45 minutes means you say so in the channel.** Not an hour, not
  "after lunch". Interns routinely burn two days rather than look slow, and that
  is the single most expensive habit on a team this size.

## What the maintainer does this week

Not pairing. Floating.

- **Review within two hours during the week.** A one-week foundations sprint
  cannot absorb an overnight review cycle; a pull request that sits until
  tomorrow costs a third of a track.
- **Sit in on each pair for twenty minutes a day.** Watch, do not take the
  keyboard. What you are looking for is whether the navigator is navigating.
- **Review hardest this week of any week all project.** The standards set in the
  foundations week are the standards you get in week ten. A shortcut waved
  through on Tuesday is precedent by Friday.
- **Answer schema questions the same day.** They are blocking by definition, and
  they belong to the dashboard repository, which the pairs cannot reach.

## Friday

Morning is integration: merge everything, fix what integration broke. Four
tracks built in parallel will collide somewhere, and finding out on Friday with
everyone present is the cheap version.

Afternoon, three things:

1. **Demo the app to the academy manager.** Not slides. The running site, in all
   three languages, with the disciplines coming out of the real database. This
   is the moment the project stops being an exercise.
2. **Pick area owners for the sprints.** By Friday people have discovered what
   they are drawn to, and self-selection beats assignment. Cover all four:
   design system and public pages · auth, profile and pack gating · catalogue,
   course and lesson player · community, projects and comments.
3. **Retrospective, 30 minutes, exactly one action item.** One that gets tracked
   and revisited. Four action items means zero.
