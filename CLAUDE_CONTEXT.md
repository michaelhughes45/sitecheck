# CLAUDE_CONTEXT.md

Context for Claude (Claude Code) when working on this project.

## What this project is

SiteCheck is a React Native (Expo) field inspection and incident reporting
app, built to prepare for a Mobile Application Developer interview at
FacilIQ, a proptech company whose product does this exact job for property
managers and facility teams. The goal isn't just a working app — it's a
project I can speak to fluently in an interview, so the *how* and *why*
behind each change matters as much as the code itself.

Core architecture (see README.md for full detail):
- `src/components/DynamicForm.js` — data-driven adaptive form engine
- `src/data/*Template.js` — form definitions consumed by DynamicForm
- `src/storage/db.js` + `src/storage/sync.js` — offline-first persistence
  and a sync queue that drains when connectivity returns
- `src/screens/*` — navigation destinations
- Backend upload is currently stubbed (`fakeUploadToServer` in `sync.js`)

## Working agreement

**Before writing any code**, explain what you're about to do: which
files you'll touch, the approach you're taking, and why — in plain
language, a few sentences, not a wall of text. If there's a design
choice with real tradeoffs (e.g. how to structure a new field type),
say what you're choosing and why briefly.

**After writing the code**, summarize what you actually did: files
changed, anything that differed from the plan, and anything I should
manually verify (e.g. "test this on a physical device since it touches
the camera permission flow").

Don't skip either step, even for small changes — the point is that I
can follow along and explain any part of this in an interview.

## Git workflow

- Assume a GitHub remote is already configured for this repo (`origin`).
  If it isn't yet, tell me before trying to push instead of guessing.
- Work in small, reviewable commits during a milestone if it helps, but
  the key rule is: **once a milestone is complete and verified working,
  commit and push to GitHub before starting the next milestone.**
- Commit messages should name the milestone and summarize what changed,
  e.g. `M2: add fire safety template + multi-select field type`.
- Never push work that doesn't run — verify the app still starts and
  the changed flow works before pushing.
- Confirm with me before pushing if anything about the remote or branch
  is ambiguous.

## Milestones

Roughly equal-sized chunks of work, one per day. Adjust scope as needed
if a milestone is running long or short — flag it if so, rather than
silently over/under-delivering.

### Milestone 1 — Baseline verified & repo live ✅ Complete
- [x] Install dependencies, run the app in Expo Go on a physical device
- [x] Click through every screen once: Home → Property → Site Audit →
  submit → History; Property → Report Incident → submit → History
- [x] Confirm data survives an app restart (AsyncStorage persistence)
- [x] Confirm photo capture works and the retake flow works
- [x] Toggle airplane mode to confirm the pending-sync banner and badges
  behave correctly, then reconnect and confirm the queue drains
- [x] Initialize git (if not already) and push the working baseline to
  GitHub — pushed to `michaelhughes45/sitecheck`, `main` branch

Unplanned prerequisite work: the project was scaffolded on Expo SDK 51,
which `npm audit` flagged with 26 vulnerabilities. Upgraded to SDK 54
(not the latest, 57 — the App Store/Play Store build of Expo Go is
still stuck on 54 pending Apple's review of newer builds) before any
of the above could be verified. Also dropped the unused `expo-camera`
dependency and migrated `app.json`'s deprecated `splash` key to the
`expo-splash-screen` config plugin.

### Milestone 2 — Extend the form engine ✅ Complete
- [x] Add one new field type to `DynamicForm.js` (e.g. multi-select or a
  1–5 rating), proving the engine generalizes beyond the original five
  types — added `rating` (1-5 pill buttons)
- [x] Add one new inspection template (e.g. a fire-safety checklist) that
  uses at least one conditional chain, to demonstrate the template
  system scales without touching rendering code — added
  `FIRE_SAFETY_TEMPLATE`, with a 3-level conditional chain
  (`alarms_tested` → `alarm_issue_severity` → `evacuation_confidence`)
  that also exercises the new `rating` type
- [x] Add basic required-field validation with inline error states
- [x] Commit and push

Unplanned follow-on work: the fire safety template wasn't reachable
from any screen, so `PropertyDetailScreen` and `InspectionFormScreen`
were reworked to select a template by id (`templateId` route param)
instead of `InspectionFormScreen` hardcoding the site audit template.
While doing that, found `HistoryScreen`'s summary line only understood
site-audit answer keys, so a fire safety record would always have
misleadingly shown "No issues found" — split into per-template summary
functions and labeled each entry with its template title.

### Milestone 3 — Real feature depth ✅ Complete
- [x] Replace `fakeUploadToServer` with a real sync target — chose a
  realistic mocked API layer (`src/api/client.js`) over standing up a
  real backend: it simulates request/response JSON shapes, network
  latency, and two distinct failure modes (a retryable 503 and a
  non-retryable 400), which forced `sync.js` to actually branch on
  error type — a real, if small, transient-vs-permanent-failure
  handling. Retryable failures stay queued and bump an `attempts`
  count; non-retryable failures are pulled from the queue and the
  record is flagged with `syncError` instead of retrying forever.
- [x] Add one feature beyond FacilIQ's stated feature set — added a
  cross-property `DashboardScreen`, reachable via a header button from
  Home, showing flagged-issue / pending-sync / sync-failed totals
  across all properties plus a per-property breakdown that jumps into
  that property's History.
- [x] Commit and push

Unplanned follow-on work: the non-retryable failure path (`syncError`)
had no way to surface in the UI, so it would've been dead state —
added a "Sync failed" badge and inline error message to
`HistoryScreen`. While doing that, extracted the inspection
flag/summary logic out of `HistoryScreen` into a shared
`src/data/summarize.js` so the new Dashboard could compute the same
"flagged" counts without duplicating that logic.

### Milestone 4 — Polish & interview readiness
- UI polish pass: loading states, empty states, error states
- Handle edge cases (e.g. camera permission denied, submitting an
  audit with no answers)
- Update README.md to reflect anything that changed since Milestone 1
- Prepare a short, scripted demo walkthrough (2–3 minutes) tying
  design decisions back to real field conditions
- Final commit, push, and tag a release (e.g. `v1.0-interview-ready`)
