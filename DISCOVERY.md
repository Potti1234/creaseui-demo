# Discovery and validation

Completed locally on October 21, 2026. Workspace: `creaseui-demo-blind-a-oct21`. Preview: http://127.0.0.1:5186/.

## Baseline and discovery

- Read `TASK.md`, `ENVIRONMENT.md`, `.agents/skills/creaseui-components/SKILL.md`, and the user-level shadcn, interface polish, and Playwright guidance.
- Preserved the starter's Foldkit / `@foldkit/ui` 0.164.0 and Effect / platform-browser 4.0.0-rc.117 compatibility baseline.
- Used only the supplied registry at `http://127.0.0.1:62830/r/` for CreaseUI. Its pinned source snapshot is `842062f6f8a9c1316414406da19866c8dd726972`.
- Used npm; installed the exact local lint tarball `vendor/creaseui-lint-0.1.0.tgz` as a development dependency.
- Inspected the catalog, installed source, component contracts, and mirrored `source/docs/registry.md`. No sibling project or earlier application/review files were read.

## Commands and components

```sh
npm install
npm install --save-dev ./vendor/creaseui-lint-0.1.0.tgz
npx creaseui-lint info --catalog --renderer tailwind --json
npx creaseui-lint info --json
npx shadcn@latest info --json
npx shadcn@latest view @crease/sidebar @crease/chart @crease/table @crease/typography @crease/card
npx shadcn@latest add @crease/sidebar @crease/chart @crease/table @crease/card @crease/button @crease/input @crease/badge @crease/typography @crease/checkbox @crease/empty @crease/separator @crease/progress --yes
npx shadcn@latest add @crease/stack @crease/grid @crease/text @crease/heading @crease/section @crease/toggle-group @crease/pagination @crease/avatar @crease/status-dot --yes
npx shadcn@latest add @crease/stat --yes
npx creaseui-lint init --renderer tailwind --components src/ui --components src/lib
npx creaseui-lint inspect --component chart
npx creaseui-lint inspect --component sidebar
npm run check
npx creaseui-lint scope --baseline 4fc34d5dcfaeb000fa0065b2759fbb12ebbe8d0d --allow-enforcement-changes
npm run dev -- --host 127.0.0.1 --port 5186 --strictPort
```

The application composes the installed Sidebar, Card, Stat, ECharts Chart, Table, Text, Heading, Stack, Grid, Button, Badge, Input, Checkbox, ToggleGroup, Pagination, Avatar, Progress, StatusDot, Separator, and Empty components. Registry dependencies supplied their helpers, icons, utilities, and theme.

## Result

Built **Northstar Commerce**, a restrained green and neutral store dashboard with realistic orders and internally consistent 7-, 30-, and 90-day revenue series. The selected period updates KPIs, product revenue, the line chart, its accessible table alternative, and the report CSV. The chart supports hover tooltips and responsive resizing.

Overview, Orders, and Analytics are working sidebar views. Orders support live search by ID/name/email/product, payment filters, empty-state reset, three-way amount sorting, six-row pagination, per-row/page selection, filtered or selected CSV downloads, expandable product/shipping details, and marking a paid order fulfilled. Search/filter changes clear selection so hidden rows cannot create misleading export counts. Fulfillment updates are reflected in exports. All sample changes remain in the browser's Foldkit model and reset on refresh.

## Source adaptations and workarounds

- `shadcn docs @crease/sidebar` did not support the custom registry identifier and exited after its error, including a Windows Node/libuv assertion. `shadcn view` printed registry contents but also emitted the same exit-time assertion. The actual `add` commands succeeded. Used the installed source and the item-linked local documentation instead of substituting public React/shadcn APIs.
- The initial receipt registered `src/ui` only. CreaseUI also installs rendering helpers into `src/lib`; initial doctor correctly reported incomplete coverage. Re-ran the initializer with both directories, which registered the exact installed helpers. Final doctor reports complete coverage. No lint rule was disabled, ignored, or reduced in severity.
- The registry's icon helper is implementation-only under the generated receipt. Added a small public `src/ui/icon.ts` adapter that delegates to that installed helper, accepts its typed icon names, and emits no custom raw SVG. Registered it through the initializer.
- Kept appearance in installed component sources and theme tokens. Added named responsive Stack variants, semantic visually-hidden Text, Table alignment/focusability, Button expanded/download semantics, payment Badge variants, static Sidebar branding/profile rows, and a named dashboard chart height. Application views contain no raw markup or ad hoc appearance classes.
- Used native anchor download semantics for generated CSVs. The report contains the selected revenue period; order CSVs contain the filtered or selected orders, with proper CSV escaping.
- Crease's global CSS checker correctly rejected a global `font-variant-numeric` declaration. Removed it; numeric component props and Stat's built-in tabular numerals own numeric typography.
- Playwright's synchronous `checkbox.check()` verification raced Foldkit's asynchronous model update. The browser check uses click followed by waiting for the updated export label. Escape dismissal likewise waits for the dialog to disappear. These were verification timing changes; the controls worked in the browser.
- `scope` reports four deliberate setup additions: `crease.lock.json`, `eslint.config.js`, and npm `lint` / `check` scripts. The explicit system-change mode records those additions for review; it is not a feature lint bypass.

## Validation

`npm run check` passed with exit 0:

- TypeScript `tsc --noEmit`.
- ESLint with the strict `creaseui()` preset, no errors or warnings.
- CreaseUI doctor: 36 owned files, 38 inspected sources, zero uncovered UI modules, **coverage complete**.
- CreaseUI CSS: one stylesheet, zero violations, zero unverifiable inputs.
- Vite production build.

Playwright CLI ran a real Chrome browser at 1440×1080 and 390×844. All 16 recorded interaction checks passed: initial metrics/series; synchronized period changes; order search; empty-state/filter reset; both amount sorts; pagination; exact six-row selected export; actual CSV filename/download; fulfillment; sidebar navigation and chart remount; desktop collapse; mobile document overflow; drawer navigation dismissal; Escape dismissal. Screenshots were visually reviewed at both sizes. The mobile table scrolls within its card, with no document-wide overflow.

Diagnostics remain in the intentionally gitignored `output/` directory:

- `initial-info.json`, `initial-catalog.json`, `initial-typecheck.txt`, `initial-eslint.txt`, `initial-doctor.txt`, `initial-css.txt`, `initial-audit.json`.
- `setup-doctor.txt`, `final-checks.txt`, `final-scope.txt`, `final-audit.json`.
- `playwright/interaction-checks.txt`, `playwright/checks.js`, `playwright/desktop-final.png`, `playwright/mobile-final.png`, `playwright/selected-orders.csv`.

## Remaining limitations

No functional or task blocker remains. This is a realistic local sample application with no backend persistence. The development runtime occasionally emits Foldkit slow-view/patch warnings during initial mount or viewport changes; browser verification found no runtime errors.

`npm audit` reports four high findings in the supplied development lint package's transitive `@stylexjs/eslint-plugin → micromatch → braces` chain, with no available fix reported. Preserved the requested lint tarball and recorded the audit instead of replacing the supplied package. These findings are outside the application runtime dependency tree.

The assigned preview server remains running on port 5186. No push, publication, or PR was performed.
