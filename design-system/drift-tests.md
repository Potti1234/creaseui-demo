# Drift tests

A drift test gives the same ordinary ticket to several builders who cannot see each other's work, and compares what they make. Where the results differ, the design system has not made a decision yet. (After Matt Rothenberg, "You Don't Have a Design System".)

## 2026-10-27, at `chapter-11`: the Bugs view

Three agents, each in its own worktree, got the same ticket: "Add a Bugs view. The sidebar gets an entry 'Bugs' under Workspace, next to All issues and My issues. It shows the open issues (not Done) that have the label Bug, grouped by status. The sidebar entry shows how many there are, like the other entries."

| | Agent A | Agent B | Agent C |
|---|---|---|---|
| Found `AGENTS.md`, `patterns.md`, `boundaries.md` | yes | yes | yes |
| Built the page with `IssueCollection`, grouped | yes | yes | yes |
| New rows, menus or classes | none | none | none |
| Enforcement changes (`npm run scope`) | 0 | 0 | 0 |
| `npm run check`, browser check | pass, 11/11 | pass, 11/11 | pass, 11/11 |
| Screenshot of the Bugs page | identical (same file hash) | identical | identical |
| Where the filter lives | `src/domain.ts` | `src/domain.ts` | `src/features/bugs.ts` |
| Tests | in `test/update.test.ts` | new `test/bugs.test.ts` | new `test/bugs.test.ts` |

The screens did not drift. The code did, in one place the system had not decided: where a view's filter lives. Decision D11 now decides it. Agent B's change was adopted.

## The same day: the board ticket

A fourth agent got "Add a board view to All issues". `patterns.md` told it a board is a new pattern. It built the pattern, the card and a change record inside the feature task and asked for the card decision to be reviewed. The result is good and passes every check, but the decision was made in the wrong place. `AGENTS.md` now says to describe such a change and stop. The board is reviewed as a design-system change in chapter 13.
