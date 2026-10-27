# 004: The composer and saving

Chapter 8. Adds four patterns and browser storage; it installs crease's `dialog`, `field`, `textarea`, `alert`, `command` and `link`, so the lock file changes.

## Why

Decision D8 (one way to create an issue, a draft that survives closing) had no code, and every change was lost on reload. An issue could not be opened on its own page, and the keyboard-first product of the brief had no keyboard routes beyond the menus.

## What changed

- `src/design/issue-composer.ts`: `IssueComposer`, crease's dialog with a title field and the three PropertyPickers. The draft is an issue with the id `DRAFT` in the page Model, so closing the dialog keeps it and the pickers work on it unchanged.
- Validation: a trimmed title of 1 to 200 characters. The error shows after the first attempt and disappears when the title becomes valid; focus returns to the title.
- Ctrl/Cmd+Enter creates the issue: a key binding that is active only while the composer is open.
- `src/storage.ts`: the issues are stored under `crease-tasks/v1` through Effect's `KeyValueStore`, provided in `src/main.ts` as `localStorage`. They are read once, in the app's Flags; unreadable data falls back to the sample with a notice. `SaveIssues` runs after every change to an issue and interrupts an older save that is still running.
- `src/design/save-notice.ts`: `SaveNotice`, shown when a save fails (with Retry) or saved data could not be read.
- `src/design/issue-detail.ts`: `IssueDetail`, one issue on its own page. The row's title links to it. Title and description are edited in place and saved as you type; an empty title shows an error and is not saved. Issues gain a `description`.
- `src/design/command-menu.ts`: `CommandMenu`, crease's command in a dialog, opened with Ctrl+K or the search button in the sidebar: actions, places and issues in one list.
- `C` opens the composer when no dialog is open and focus is not in a field; the sidebar's pencil button does the same (D9).
- The theme choice is saved with the issues, so dark mode survives a reload.
- The open issue lives in the Model, not in the URL: the guide embeds this app in its pages, which own the URL.
- The header has the page's one primary action, New issue. It reads "New issue (draft)" while a draft is kept.
