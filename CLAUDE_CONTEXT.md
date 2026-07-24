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

### Milestone 1 — Baseline verified & repo live
- Install dependencies, run the app in Expo Go on a physical device
- Click through every screen once: Home → Property → Site Audit →
  submit → History; Property → Report Incident → submit → History
- Confirm data survives an app restart (AsyncStorage persistence)
- Confirm photo capture works and the retake flow works
- Toggle airplane mode to confirm the pending-sync banner and badges
  behave correctly, then reconnect and confirm the queue drains
- Initialize git (if not already) and push the working baseline to
  GitHub

### Milestone 2 — Extend the form engine
- Add one new field type to `DynamicForm.js` (e.g. multi-select or a
  1–5 rating), proving the engine generalizes beyond the original five
  types
- Add one new inspection template (e.g. a fire-safety checklist) that
  uses at least one conditional chain, to demonstrate the template
  system scales without touching rendering code
- Add basic required-field validation with inline error states
- Commit and push

### Milestone 3 — Real feature depth
- Replace `fakeUploadToServer` with a real sync target — either a
  minimal real backend (simple Express endpoint or Firebase) or, at
  minimum, a realistic mocked API layer with proper request/response
  shapes and error handling
- Add one feature that goes beyond FacilIQ's stated feature set, to
  show initiative — candidates: a cross-property dashboard summarizing
  flagged issues, or search/filter on the History screen
- Commit and push

### Milestone 4 — Polish & interview readiness
- UI polish pass: loading states, empty states, error states
- Handle edge cases (e.g. camera permission denied, submitting an
  audit with no answers)
- Update README.md to reflect anything that changed since Milestone 1
- Prepare a short, scripted demo walkthrough (2–3 minutes) tying
  design decisions back to real field conditions
- Final commit, push, and tag a release (e.g. `v1.0-interview-ready`)
