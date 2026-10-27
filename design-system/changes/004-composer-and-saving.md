# 004: The composer and saving

Chapter 8. Adds two patterns and browser storage; it installs crease's `dialog`, `field`, `textarea` and `alert`, so the lock file changes.

## Why

Decision D8 (one way to create an issue, a draft that survives closing) had no code, and every change was lost on reload.

## What changed

- `src/design/issue-composer.ts`: `IssueComposer`, crease's dialog with a title field and the three PropertyPickers. The draft is an issue with the id `DRAFT` in the page Model, so closing the dialog keeps it and the pickers work on it unchanged.
- Validation: a trimmed title of 1 to 200 characters. The error shows after the first attempt and disappears when the title becomes valid; focus returns to the title.
- Ctrl/Cmd+Enter creates the issue: a key binding that is active only while the composer is open.
- `src/storage.ts`: the issues are stored under `crease-tasks/v1` through Effect's `KeyValueStore`, provided in `src/main.ts` as `localStorage`. They are read once, in the app's Flags; unreadable data falls back to the sample with a notice. `SaveIssues` runs after every change to an issue and interrupts an older save that is still running.
- `src/design/save-notice.ts`: `SaveNotice`, shown when a save fails (with Retry) or saved data could not be read.
- The header has the page's one primary action, New issue. It reads "New issue (draft)" while a draft is kept.
