# Patterns

The product's own vocabulary, built from crease components in `src/design`. Each name stands for decisions a builder does not have to make again. The full rules are in a comment at the top of each file; this page says what each pattern is for and when not to use it.

| Pattern | File | Use it for | Do not use it for |
|---|---|---|---|
| `AppSidebar` | `src/design/app-sidebar.ts` | The navigation of every page: personal links, teams and their pages, saved views, the signed-in person | Navigation inside a page (tabs, a list of settings) |
| `IssueDetail` | `src/design/issue-detail.ts` | One issue on its own page: title and description edited in place, properties through PropertyPicker | Creating an issue (that is `IssueComposer`) |
| `CommandMenu` | `src/design/command-menu.ts` | The one Ctrl+K menu of the app: actions, places, issues | Choosing a value for a field (that is a picker) |
| `IssueCollection` | `src/design/issue-collection.ts` | The body of any page that lists issues: All issues, My issues, search results, saved views | A single issue's page, or a list of something that is not an issue |
| `IssueGroup` | `src/design/issue-group.ts` | Issues of one status under a collapsible header; `IssueCollection` uses it for grouped lists | Grouping by anything other than status (not decided yet: ask first) |
| `IssueRow` | `src/design/issue-row.ts` | One issue in any list. Parts and order are fixed: priority, identifier, status, title, labels, date, assignee | A card layout, a board (chapter 12 decides the card) |
| `PropertyPicker` | `src/design/property-picker.ts` | Changing status, priority or assignee where it is shown, in rows and in the composer | Editing text, or properties that need more than one value at once |
| `IssueComposer` | `src/design/issue-composer.ts` | Creating an issue: a dialog with a draft, a required title and the three pickers | Editing an existing issue (that changes in place, without a draft) |
| `SaveNotice` | `src/design/save-notice.ts` | Telling the person that the browser did not keep a change, or could not read saved data, with Retry when it can help | Confirming a successful save: success needs no message |

## How a page is described in this vocabulary

"A page for one project's issues" is an `IssueCollection` with the issues of that project, grouped by status, and a link in `AppSidebar`. A saved view is an entry in `src/features/views.ts`: a name, an icon and a filter. It needs no new layout, row or menu. A request that does not fit these names (a timeline, a board) is a new pattern: decide it, add it here and in `src/design`, then build the page.

## Enforced by

- Feature code may not import `@/ui/item` or `@/ui/dropdown-menu` (`no-restricted-imports` in `eslint.config.js`), so issue rows and property menus come from these patterns.
- The patterns compose crease components only; the strict lint checks them like any other application file.
