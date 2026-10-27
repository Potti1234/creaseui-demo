# 003: Patterns

Chapter 7. A design-system change: new patterns in `src/design`, four component changes, a product lint rule, and the end of migration mode.

## Why

After chapter 6 the three views drew issues with three different rows (D3 had no enforcing code), statuses could not be changed at all (D7), and the group header still carried the last override. Each view also built its own list, and the sidebar had only two links: no teams, no saved views, no person.

## What changed

- `src/design/issue-row.ts`: `IssueRow`, the one row for every list, with its parts in a fixed order.
- `src/design/property-picker.ts`: `PropertyPicker`, crease's dropdown menu with the domain's vocabulary. The page keeps one menu Model, for the open menu.
- `src/design/issue-group.ts`: `IssueGroup`. Its header is an `item` with the `muted` variant, which removes the `bg-muted` override.
- `src/design/issue-collection.ts`: `IssueCollection`, the body of every list page: controls, an optional summary, then groups, rows or an empty state.
- `src/design/app-sidebar.ts`: `AppSidebar`, the navigation of every page: workspace, personal links, teams with their pages, saved views, and the signed-in person with the theme switch.
- `src/domain.ts`: two teams, Engineering and Design; every issue belongs to one.
- `src/features/views.ts`: the saved views Urgent & high and Unassigned, each a name, an icon and a filter.
- The views shrink to choosing issues and controls. All issues also serves a team's Issues page, with that team's issues.
- `src/ui/button.ts`: an `ariaExpanded` prop for disclosure buttons. Passing `aria-expanded` through `buttonAttributes` is rejected by the lint as an appearance override.
- `src/ui/sidebar.ts`: an `indent` option on `sidebarMenuButton` for a team's pages. crease's sub-menu button is an anchor, which cannot take focus without an `href`, and has no place for a count.
- `src/ui/avatar.ts`: an `accent` tone for the fallback. The default fill has the same colour as the sidebar, so initials on the sidebar had no visible circle.
- `src/ui/dropdown-menu.ts`: focus returns to the trigger when a selection closes the menu, not only on an explicit close.
- `eslint.config.js`: no migration mode; feature code may not import `@/ui/item` or `@/ui/dropdown-menu`. The ratchet is 0.
- `design-system/patterns.md`: the vocabulary, with what each pattern is for and when not to use it.
