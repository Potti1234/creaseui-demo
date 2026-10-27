# Principles and decisions

A principle says what we want. A decision says what a builder does about it, and it names the place in the code that enforces it. When a decision has no enforcing place yet, the last column says which chapter adds one.

## 1. The issue is the loudest thing on the screen

Navigation, toolbars and metadata stay quiet so a person scanning the list reads titles first.

| Decision | Enforced by |
|---|---|
| D1. An issue row has one height (36px) and never wraps. A long title is cut with an ellipsis; metadata keeps its place at the end. | `item({ size: 'xs', layout: 'inline' })` in `src/ui/item.ts`; the allowed values are in `crease.lock.json` |
| D2. Metadata in a row (identifier, labels, date, assignee) uses the small secondary text style. | `IssueRow` in `src/design/issue-row.ts`; labels through `badge`'s `outline` look (`src/ui/badge.ts`) |
| D3. Every view shows an issue with the same row: same parts, same order. | `IssueRow`; feature code may not import `@/ui/item` (`eslint.config.js`) |
| D12. On a board an issue is a card, not a row. The card has the row's parts in the row's order (priority, identifier, status; title; labels, date, assignee), stacked on three lines. Its title may wrap, and so may its labels: the card's exception to D1, which stays a rule for rows. A card has a width, not a fixed height, and a cut title would hide most of itself in a column. Its metadata follows D2 and its pickers D7. Every board uses this card. | `IssueCard` in `src/design/issue-board.ts`; feature code may not import `@/ui/item` (`eslint.config.js`); the board steps of `npm run check:browser` (columns at 1280px, a status change on a card) |

## 2. Actions are few and predictable

| Decision | Enforced by |
|---|---|
| D4. A regular button has two intents: `primary` for the one main action of a region, `secondary` for everything else. It has one height (28px). | `button`'s props in `src/ui/button.ts`; the allowed values are in `crease.lock.json`; at most one `primary` per file (`crease-tasks/one-primary-action`) |
| D5. An icon-only button always has an accessible name. | `ButtonShape` in `src/ui/button.ts`: `shape: 'icon'` requires `ariaLabel` |
| D6. The main action of a page sits in the header's action area. | The page header pattern (chapter 7) |

## 3. Small changes happen in place

| Decision | Enforced by |
|---|---|
| D7. Status, priority and assignee change through a picker opened from the row, without leaving the list. Focus returns to the row afterwards. | `PropertyPicker` in `src/design/property-picker.ts`; feature code may not import `@/ui/dropdown-menu`; the menu returns focus to its trigger after a selection (`src/ui/dropdown-menu.ts`) |
| D8. Creating an issue opens the composer, the only way to create one. The draft survives closing it. | `IssueComposer` in `src/design/issue-composer.ts`; the draft lives in the page Model, not in the dialog |

## 4. The keyboard reaches everything, the pointer too

| Decision | Enforced by |
|---|---|
| D9. Every action has a pointer route. Keys are shortcuts, never the only way. | Review; the browser check (`npm run check:browser`) drives every workflow by pointer, and Ctrl+Enter only as a second route |

## 5. One vocabulary

| Decision | Enforced by |
|---|---|
| D10. Priorities are Urgent, High, Medium, Low and No priority, in that order, everywhere. Statuses are Backlog, Todo, In Progress, In Review and Done. | The domain schemas in `src/domain.ts` |

## 6. A view says which issues it lists, once

| Decision | Enforced by |
|---|---|
| D11. Which issues a view lists is a named predicate in `src/domain.ts` (`isOpen`, `isOpenBug`). The view's list and its sidebar count use the same predicate. | Review; the drift test of chapter 12 (two of three agents did this unasked) |

## How these change

A decision changes in a commit that also changes its enforcing code, with the reason in the commit message. A view that needs something these decisions forbid is a design-system question first: either the decision gains a case, or the view changes.
