## What changed

<!-- The behaviour, not the file list — the diff already lists the files. -->

## Why

<!-- What was wrong, or what this enables. A reviewer coming back in six months
     reads this first. -->

## How it was verified

<!-- Be specific and honest. "Tests pass" is what CI already says; this section
     is for what CI cannot check.

     For a UI change, at minimum:
       - which screen, at which widths
       - loaded in Arabic (/ar/...) and the layout survived
       - screenshots attached

     For a data change:
       - what you saw against the real database, rather than assumed

     And what is still unverified. -->

## Anything reviewers should push back on

<!-- Shortcuts taken, decisions you are unsure about, follow-ups deliberately
     left out. A declared shortcut is a decision; a discovered one is a defect.
     Delete this section only if there is genuinely nothing. -->

---

- [ ] `make ci-local` passes
- [ ] Checked on the preview deployment, not only localhost
- [ ] Checked in Arabic (RTL) if this touches the UI
- [ ] No new `any`, no new lint suppressions
- [ ] No migration in this repository (the schema lives in the dashboard repo)
