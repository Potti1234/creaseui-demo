# Drift tests

A drift test gives the same ordinary ticket to several builders who cannot see each other's work, and compares what they make. Where the results differ, the design system has not made a decision yet. (After Matt Rothenberg, "You Don't Have a Design System".)

## 2026-10-28, at `chapter-11`: the Active bugs view

Three agents, each in its own worktree, got the same ticket: "Add an 'Active bugs' view. The sidebar's Views section gets an entry 'Active bugs', next to Urgent & high and Unassigned. It shows the issues that have the label Bug and whose status is Todo, In Progress or In Review, grouped by status."

| | Agent A | Agent B | Agent C |
|---|---|---|---|
| Found `AGENTS.md` and `patterns.md` | yes | yes | yes |
| Added one entry to `src/features/views.ts` | yes | yes | yes |
| New layouts, rows, menus or classes | none | none | none |
| Enforcement changes (`npm run scope`) | 0 | 0 | 0 |
| `npm run check`, browser check | pass, 15/15 | pass, 15/15 | pass, 15/15 |
| Screenshot of the Active bugs page | identical (same file hash) | identical | identical |
| The view's id | `bugs` | `active-bugs` | `active-bugs` |
| Tests | new `test/views.test.ts` | new `test/views.test.ts` | in `test/update.test.ts` |

The screens did not drift, and the filter is the same code in the same place in all three: `patterns.md` says a saved view is an entry in `src/features/views.ts`. The code differed in two details the system had not decided, the id and the place of the tests. Decision D11 now decides both. Agent B's change was adopted.

## The same day: the board ticket

A fourth agent got "Add a board view to team pages", with a Board link under each team. `patterns.md` names no board. The agent built the pattern, the card and a change record inside the feature task, and changed decision D3 in `principles.md` to cover cards. The result passes every check, but a decision was changed in a feature task and the columns run off the screen at 1280 pixels. `AGENTS.md` now says to describe such a change and stop, without editing decisions. The board is reviewed as a design-system change in chapter 13.
