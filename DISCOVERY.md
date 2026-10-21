# Northstar dashboard

Built independently in this project with the snapshot in ENVIRONMENT.md. No sibling application or review files were inspected; nothing was pushed or published.

## Discovery and commands

- Read TASK.md, ENVIRONMENT.md and the installed project CreaseUI skill. Also used the installed shadcn, interface polish and Playwright CLI guidance.
- Installed the matching package: `npm install -D ./vendor/creaseui-lint-0.1.0.tgz eslint`.
- Discovered the real APIs with `npx creaseui-lint info --catalog`, `info`, and `inspect --component sidebar`, `chart` and `icon`.
- Used `npx shadcn@latest info --json` and `search '@crease' -q dashboard`.
- The CLI docs command did not resolve custom registry names. Used the pinned items' mirrored guide at `http://127.0.0.1:62831/source/docs/registry.md` and installed source. The guide is saved in `output/registry-guide.md`.
- Installed with `npx shadcn@latest add '@crease/sidebar' '@crease/table' '@crease/chart' '@crease/card' '@crease/button' '@crease/input' '@crease/badge' '@crease/grid' '@crease/stack' '@crease/text' '@crease/heading' '@crease/separator' '@crease/toggle-group' '@crease/dialog' '@crease/field' '@crease/empty' -y`, then added `@crease/stat`, `@crease/progress` and `@crease/alert`.
- Generated strict enforcement using `npx creaseui-lint init --renderer tailwind`, and reran it after the additional installations so they were covered. The receipt is tool generated. No rules were disabled or raw-rendering grants manually added.
- Initial catalog/info/ESLint/doctor/CSS diagnostics remain in `output/initial-*`. The starter's raw main element was the initial ESLint finding; SidebarInset now supplies the application shell.

## Product and composition

Northstar is a subscription business dashboard with Overview, Customers and Reports views. The desktop sidebar collapses to icons; the phone drawer supports navigation, Escape, focus entry/return and Tab/Shift+Tab containment. Ctrl/Cmd+B toggles the desktop sidebar.

The interface composes installed Sidebar, Card, Stat, Grid, Stack, Heading, Text, Table, Chart/ECharts, ToggleGroup, Input, Badge, Progress, Dialog, Empty and Alert components. Stateful controls use parent-owned Foldkit models, messages and updates. The product-owned metricGrid uses adaptive minimum 210px tracks and a four-column cap; all four values fit a 390px phone.

Twelve realistic sample customers support company/domain/contact search, status filters, two-way name/revenue sorting, six-row pagination, account details and filtered CSV download. Period controls synchronize 7/30/90-day collected revenue, summary and chart data. MRR, subscribers, retention and plan mix represent the current October snapshot. Reports and workspace information explain these definitions. Every chart value also has a screen-reader text equivalent.

## Source adaptations and workarounds

| Before | After |
| --- | --- |
| Neutral starter theme | Semantic green theme, tinted background/sidebar, base font smoothing |
| Small default core controls | Named Button, Toggle and Input sizes use 40px targets; spacing stays in component source |
| Only implementation-level icon helpers, no public icon catalog entry | Typed icon-name composition props in installed Button, Badge and SidebarMenuButton |
| Stack required a forbidden direction class override | Named `collapseBelow: 'xl'` composition prop in owned Stack source |
| Default chart aspect ratio too tall for this layout | Named `dashboard` size in installed ECharts host |
| ECharts 6 legacy containLabel notice | Used outerBoundsMode/outerBoundsContain as documented in installed types |
| ToggleGroup init re-export resolves to implementation-only under strict lint | Parent initializes the public serializable Model with id, Manual activation and Option.none; enforcement is unchanged |
| Button's current contract rejects dialog close attributes | Done dispatches public Dialog RequestedClose |
| Sidebar Escape only handled inside its panel and focus stayed on trigger | Parent Foldkit commands/subscription supply focus entry/return, keyboard containment and Escape, after DOM paint |
| Global numeric font declaration outside base CSS policy | Used public Stat/Text tabular-number props |
| Sort direction only shown visually | Typed TableHead sort prop emits aria-sort |
| Small close controls, with overlapping brand/dismiss targets on phones | 40px close targets and reserved mobile header space; browser geometry check confirms no overlap |
| Generic transition-all in Badge/Progress | Explicit color/border/shadow transitions for Badge and transform transition for Progress |

A request for a nonexistent public icon item briefly hit the unavailable registry harness. The parent restored that read-only harness without changing any component/docs/lint payload. No dependency on that item was introduced.

## Validation

Final diagnostics: `output/final-typecheck.txt`, `output/final-lint.txt`, `output/final-build.txt`, `output/final-info.txt`.

- `npm run typecheck`: passed.
- `npm run lint`: ESLint passed; doctor reports complete coverage, 34 inspected source files and zero uncovered UI modules; CSS reports zero violations and zero unverifiable files.
- `npm run build`: passed.

Browser checks used `npx --yes --package @playwright/cli playwright-cli -s=northstar-b ...`. Artifacts are in `output/playwright/`:

- Layers search produces one row; its account dialog opens and closes with Escape.
- Unmatched query shows Empty and Clear filters recovers the rows.
- Overdue filter produces exactly Circooles and CloudWatch. Downloaded CSV contains those two records.
- Company ascending sort, revenue descending sort, and pagination between six-row pages.
- Reports navigation and 90-day chart synchronization verified against actual ECharts data: 13 points, final value 12,780. Returning to 30-day Overview works.
- Desktop sidebar collapse/expand.
- No document overflow at phone 390x844 or tablet 768x1024. All four phone metric values fit. The table intentionally scrolls horizontally within its keyboard-focusable container.
- Mobile drawer navigation, Shift+Tab/Tab wrapping, Escape and trigger focus return.
- Mobile account dialog stays within the viewport and closes with Done/Escape.
- Reviewed screenshots at desktop 1440x1000, tablet and phone, plus settled drawer/dialog states.

Two early assertions sampled the previous Foldkit DOM immediately after clicks; waits for the resulting pagination/first-row state resolved those checks. An early dialog screenshot captured its entrance transition; `mobile-dialog-final.png` waits for opacity 1. The first mobile Escape check found the keyboard gap above; it was fixed and rerun successfully.

## Preview and limitations

`npm install`, then `npm run dev -- --host 127.0.0.1 --port 5187 --strictPort`.

The preview is left running in a hidden process at **http://127.0.0.1:5187/**. Logs: `output/vite.out.log` and `output/vite.err.log`. The starter's existing ignore rule keeps output artifacts local.

No remaining task blockers. Foldkit can emit development slow-render warnings during initial mount; no application errors were observed after adding the favicon. npm reported four dependency high-severity advisories during installation. No forced upgrades were applied; Foldkit/Effect retain the starter's pinned compatibility versions.
