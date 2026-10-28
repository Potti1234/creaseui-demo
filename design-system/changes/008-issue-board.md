# 008: The board and the card

Chapter 13. A design-system change for the product decision "Each team's issues can be shown as a board, one column per status, each issue a card." It adds two patterns (`IssueBoard`, `IssueCard`) and one decision (D12). D1 to D11 are unchanged. No component, theme, receipt or lint change: the board and the card compose existing crease components with values `crease.lock.json` already allows, and the placement classes (`flex-1`, `min-w-44`) the component contract accepts.

## Why

Each team's page needed a board. `patterns.md` named a board as a new pattern to decide first, and `IssueRow` left the card undecided. The first version was built inside a feature task (see `drift-tests.md`, "the board ticket"): it changed D3 there, and its columns ran off the screen at 1280px. This record is that proposal, reviewed.

## What changed

- `design-system/principles.md`: **D12**, the card. A board shows an issue as a card with the row's parts in the row's order, on three lines; unlike a row (D1), its title and labels may wrap; the first line does not. D3 keeps its chapter-12 wording: every *list* view still uses the one row, and D12 is the board's case beside it, not an edit of it.
- `src/design/issue-card.ts`: `IssueCard`. An `item` with the `outline` look and the `sm` size: priority, identifier and status; the title (a link to the issue page); labels, date and assignee. Priority, status and assignee are PropertyPickers (D7); focus returns to the trigger in the card.
- `src/design/issue-board.ts`: `IssueBoard`. One column per status in workflow order (`STATUSES_IN_ORDER`), empty columns included, each headed like a group without the collapse button. Columns share the board's width equally (`flex-1`) down to 176px (`min-w-44`); below that the board scrolls sideways in its own region (`stack`'s `isScrollable`), never the page.
- `src/design/issue-collection.ts`: a fourth body, `board`, so the board shares the controls bar with the list. A board is never replaced by the empty state.
- `src/design/app-sidebar.ts`: the rules name Board as a team's second page, without a count.
- `design-system/patterns.md`: `IssueBoard` and `IssueCard`, and "a team's board" in the page vocabulary.
- `src/model.ts`: the views `board:eng` and `board:des`; `teamIdOf`, `teamPage(teamId, 'list' | 'board')` and `isBoardView`; the Message `ToggledLayout`.
- `src/features/issues.ts`, `src/view.ts`: a Board link under each team, a Layout switch on a team's page (the grouping control is hidden on a board), Go to entries in the command menu. A new issue created on a board belongs to that team, as on its list.
- `test/update.test.ts`: Stories for the board (see R3 and R4 below).
- `scripts/check-browser.mjs`: six board steps (see R3).

## Review notes and how they were resolved

- **R1, columns cut off at 1280px.** Columns were a fixed 272px and never shrank, so five of them (1408px) did not fit the 1008px board at 1280px, and the board's scrollbar sat below the cards with nothing pointing to it. Columns now share the width (192px each at 1280px) down to a 176px minimum. The board starts to scroll sideways below about 1200px of window width (sidebar open), inside its own region; the page does not scroll at any width the check measures (1280, 900, 480).
- **R2, the card's title wraps and D3 was edited.** D3 is back to its chapter-12 wording. The card is D12, with its enforcing places: `IssueCard`, the import rule that keeps `@/ui/item` out of feature code, and a browser step that compares a card's parts with the same issue's row. `patterns.md` and the comment in `issue-card.ts` point to D12.
- **R3, checks.** `scripts/check-browser.mjs` gains: the sidebar's Board link opens the board with its five columns and is marked active; the Layout switch opens the same board (same text) and the sidebar follows; at 1280px all five columns are visible, equal in width, and neither page nor board scrolls sideways; at 900px and 480px the board scrolls in its region, the page does not, and no column is under 176px; D12, a card's parts equal the row's, its first line is one line and a long title wraps; D7 on a board, a status change moves the card to its column and focus returns to its status glyph. With the old fixed 272px columns the 1280px step fails. Stories keep the two board tests of the proposal and add five: the Layout switch from a list and from a board, the switch on a page that is not a team's, the Board link leaving a search and an open issue, and opening and closing an issue from a card.
- **R4, two routes to a board.** The Layout switch no longer builds its own target. It sends `ToggledLayout`, which `update` turns into the same `SelectedView` the sidebar's other link sends, through the one helper `teamPage`. A Story asserts the two routes produce equal Models; the browser step asserts the same board and the sidebar's active mark on both routes. **There is no drag and drop**, by decision: a card moves between columns when its status changes through its picker, which is the pointer and keyboard route (D7, D9). Drag and drop would be a third route that needs its own keyboard equivalent; it is not part of this change.

## Migration

For feature code and anyone building on chapter 12:

- **Showing issues as cards.** Use `IssueCollection` with `body: { kind: 'board', issues }`. Do not render `IssueCard` in a list or `IssueRow` on a board; feature code still may not import `@/ui/item`.
- **`CollectionBody` has a fourth kind, `board`.** A `switch` over `body.kind` outside `issue-collection.ts` must handle it (there is none in the app today; TypeScript reports a missed case).
- **Team pages.** Name a team's page with `teamPage(teamId, 'list' | 'board')` from `src/model.ts`, not with a string; ask which team a view belongs to with `teamIdOf(view)`. Code that compared `model.view` with `'team:eng'` or `'team:des'` to mean "this team's page" must also accept the board (`teamIdOf` does). A third team needs two `View` literals and a case in `teamPage`.
- **Saved data.** None. The open view is not saved, so stored issues load unchanged.
- **Browser check.** It now has 21 steps instead of 15. A run reports `browser check: n of 21`.

## Open

- `design-system/verification.md` does not list the board steps yet; this task does not cover that file.
- The board's own scrollbar sits below its tallest column. Below about 1200px the cut-off last column is the only sign above it that more columns follow. A visible edge or a sticky scrollbar would be a change to `stack` or the theme, which this change does not make.
- Grouping and collapsed groups do not apply to a board; the "Grouped by status" control is hidden there. A board's column order is the workflow order; sorting within a column follows the view.
