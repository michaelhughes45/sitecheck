# SiteCheck

A field inspection and incident reporting app for property/facility teams,
built as an interview-prep project. It mirrors the core workflow of a
proptech field app: dynamic, adaptive inspection forms; offline-first data
capture; and a sync queue that uploads once connectivity returns.

## Getting started

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) to run it on your phone, or
press `i` / `a` in the terminal for a simulator.

## Project structure

```
App.js                        Root component, wires up connectivity → sync
src/
  data/
    properties.js             Sample property list
    inspectionTemplates.js    The site audit form definition (conditional logic)
    incidentTemplate.js       The incident report form definition
  components/
    DynamicForm.js            The adaptive form engine — the core of the app
  storage/
    db.js                     AsyncStorage-backed local persistence + sync queue
    sync.js                   NetInfo listener that drains the queue when online
  screens/
    HomeScreen.js              Property list + pending-sync banner
    PropertyDetailScreen.js    Actions: start audit / report incident / history
    InspectionFormScreen.js    Wraps DynamicForm with the audit template
    IncidentReportScreen.js    Wraps DynamicForm with the incident template
    HistoryScreen.js           Past records with synced/pending badges
  navigation/
    index.js                  Stack navigator
```

## How the adaptive form engine works

Each template (`inspectionTemplates.js`, `incidentTemplate.js`) is a plain
array of question objects. A question can declare `conditionalOn`, pointing
at another question's id and the answer value required for it to appear —
e.g. "exterior condition = Needs attention" reveals a photo + notes field
that stays hidden otherwise.

`DynamicForm` re-evaluates visibility on every answer change, and — this is
the detail worth mentioning in an interview — it walks the dependency chain
and clears any answer whose parent condition is no longer met, so a value
typed into a field that later gets hidden can never be silently submitted.

Because the form is data-driven, adding a new question type or an entirely
new inspection template (e.g. a fire-safety checklist) requires no changes
to the rendering code, only a new template file.

## How offline-first works

Every inspection or incident is written straight to `AsyncStorage` and
immediately queued in a sync table (`db.js`). `sync.js` subscribes to
`NetInfo` connectivity events; the moment the device transitions from
offline to online, it drains the queue, uploading each record (currently
simulated — swap `fakeUploadToServer` for a real API call) and marking it
synced. The History screen shows a "Pending" vs "Synced" badge per record,
and the Home screen surfaces a banner with the pending count so field
users always know what hasn't made it to the server yet.

## What's stubbed vs. real

- **Real**: local persistence, offline queueing, conditional form logic,
  photo capture, navigation, sync-trigger-on-reconnect.
- **Stubbed**: the actual backend upload (`fakeUploadToServer` in
  `sync.js`) — swap in a `fetch()` call to a real API when one exists.
  Property data is hardcoded rather than fetched.

## Possible next steps

- Real backend + auth
- Per-question required-field validation
- Template versioning (so in-flight audits survive a template update)
- Push notifications for high-severity incidents
