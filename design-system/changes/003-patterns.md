# 003: Patterns

Chapter 7. A design-system change: new patterns in `src/design`, two component changes, a product lint rule, and the end of migration mode.

## Why

After chapter 6 the three views drew issues with three different rows (D3 had no enforcing code), statuses could not be changed at all (D7), and the group header still carried the last override. Each view also built its own list.

## What changed

- `src/design/issue-row.ts`: `IssueRow`, the one row for every list, with its parts in a fixed order.
- `src/design/property-picker.ts`: `PropertyPicker`, crease's dropdown menu with the domain's vocabulary. The page keeps one menu Model, for the open menu.
- `src/design/issue-group.ts`: `IssueGroup`. Its header is an `item` with the `muted` variant, which removes the `bg-muted` override.
- `src/design/issue-collection.ts`: `IssueCollection`, the body of every list page: controls, an optional summary, then groups, rows or an empty state.
- The three views shrink to choosing issues and controls.
- `src/ui/button.ts`: an `ariaExpanded` prop for disclosure buttons. Passing `aria-expanded` through `buttonAttributes` is rejected by the lint as an appearance override.
- `src/ui/dropdown-menu.ts`: focus returns to the trigger when a selection closes the menu, not only on an explicit close.
- `eslint.config.js`: no migration mode; feature code may not import `@/ui/item` or `@/ui/dropdown-menu`. The ratchet is 0.
- `design-system/patterns.md`: the vocabulary, with what each pattern is for and when not to use it.
