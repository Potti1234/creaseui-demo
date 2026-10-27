# Patterns

The product's own vocabulary, built from crease components in `src/design`. Each name stands for decisions a builder does not have to make again. The full rules are in a comment at the top of each file; this page says what each pattern is for and when not to use it.

| Pattern | File | Use it for | Do not use it for |
|---|---|---|---|
| `IssueCollection` | `src/design/issue-collection.ts` | The body of any page that lists issues: All issues, My issues, search results, saved views | A single issue's page, or a list of something that is not an issue |
| `IssueGroup` | `src/design/issue-group.ts` | Issues of one status under a collapsible header; `IssueCollection` uses it for grouped lists | Grouping by anything other than status (not decided yet: ask first) |
| `IssueRow` | `src/design/issue-row.ts` | One issue in any list. Parts and order are fixed: priority, identifier, status, title, labels, date, assignee | A card layout, a board (chapter 12 decides the card) |
| `PropertyPicker` | `src/design/property-picker.ts` | Changing status, priority or assignee where it is shown | Editing text, or properties that need more than one value at once |

## How a page is described in this vocabulary

"A page for one project's issues" is an `IssueCollection` with the issues of that project, grouped by status. It needs no new layout, row or menu. A request that does not fit these names (a timeline, a board) is a new pattern: decide it, add it here and in `src/design`, then build the page.

## Enforced by

- Feature code may not import `@/ui/item` or `@/ui/dropdown-menu` (`no-restricted-imports` in `eslint.config.js`), so issue rows and property menus come from these patterns.
- The patterns compose crease components only; the strict lint checks them like any other application file.
