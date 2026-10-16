# Agent discovery log — Pleat renderer

Blind run: CreaseUI checked out at `devin/1791907682-design-reliability` (PR #28, `b4a8d356`), registry built to
`.registry/`, served by `serve-registry.mjs` on `127.0.0.1:4873`, lint packed to `vendor/creaseui-lint-0.1.0.tgz`.
Demo branch `experiment/agent-discovery-pleat` from `939dd57` (merge-base `98679232`, verified).

I did **not** read `src/ui`, `src/stylex`, `src/pleat`, `src/docs` or `registry.json` of creaseui, nor any other
`experiment/*` branch. Sources used: the skill file, `creaseui-lint info|inspect`, item JSON (`meta`/`docs`) for
items I had chosen, `docs/registry.md` (linked from item `docs`), the installed sources in this project, and the
public `foldkit` / `@foldkit/ui` type declarations in `node_modules`.

## (a) Discovery commands, in order

| # | Command / action | What it told me |
|---|---|---|
| 1 | read `.agents/skills/creaseui-components/SKILL.md` | Workflow: `info` → `inspect --component <name>` → install `pleat-<item>` via shadcn → compose installed source → `eslint` / `doctor` / `css`. Stateful components own a parent-routed `Model`/`Message`/`update`. Component names appear only as examples (sidebar, table, chartContainer). |
| 2 | `npx creaseui-lint --help` | Usage for `init / doctor / css / info / inspect / scope / audit` (exit 2). |
| 3 | `npx creaseui-lint info` (+ `--json`) before install | exit 2: `renderer unknown`, `policy unknown`, `receipt missing; run creaseui-lint init`; aliases listed; `artifacts: []`, `registries: {}`. **No catalogue of available components.** |
| 4 | `npx creaseui-lint inspect --component table` | `no install receipt at crease.lock.json; run creaseui-lint init first` (exit 1). `inspect` with no arg: exit 2. |
| 5 | `npx creaseui-lint init --renderer pleat --dry-run` (before installing) | exit 2: `Invalid @creaseui/lint configuration: --components <dir> (the installed component directory) is required when components.json has no ui/lib alias` (see finding F2). |
| 6 | Name probing: `curl -o /dev/null -w %{http_code} http://127.0.0.1:4873/<guess>.json` | Because nothing in the allowed tools lists components, I guessed shadcn-style names. **200:** `pleat-button, -table, -dialog, -input, -select, -badge, -empty, -card, -field, -label, -input-group, -form, -native-select, -combobox, -core, -foldkit, -heading, -typography, -stack, -separator, -item, -toolbar, -avatar, -data-table, -section, -sidebar, -text, -kbd, -alert-dialog, -sheet, -spinner, -tokens, -style, -reset, -contracts`, `icons`, `crease-theme`, `crease-core`. **404 (wrong guesses):** `pleat, pleat-theme, pleat-empty-state, pleat-page-header, pleat-header, pleat-search, pleat-utils, theme, pleat-page, pleat-flex, pleat-box, pleat-container, pleat-layout, pleat-icons, pleat-icon, pleat-search-input, pleat-app-shell, pleat-theme-default, pleat-crease-theme`. |
| 7 | read `meta`/`docs` of the candidate items' JSON | `meta.stateOwnership` (stateless vs parent-model), `publicExports`, contract ids (e.g. `composition.section`). `docs` points to `docs/registry.md`, which I read. |
| 8 | `npx shadcn@latest add http://127.0.0.1:4873/pleat-{button,table,dialog,input,native-select,badge,empty,card,field,stack,heading,text}.json` | Installed components + shared libs (core, foldkit, tokens, reset, style, contracts…) into `src/ui/pleat`, `src/lib`. Added `csstype` dependency. |
| 9 | `npx creaseui-lint init --renderer pleat` | Wrote `crease.lock.json`, `eslint.config.js`; `receipt: 44 artifacts, 16 raw-rendering files`. |
| 10 | `npx creaseui-lint info` | Now lists installed artifacts, renderer `pleat`, policy `crease-default-v1`. |
| 11 | `inspect --component` button / table / dialog / input / badge / empty / card / field / stack / heading / text | Props, exports, state ownership, contracts for each. `dialog` = parent-model stateful (`Model, Message, OutMessage, init, update, open, close, dialog`); everything else stateless. |
| 12 | `inspect --component native-select` → `nativeSelect` → `pleat-native-select` | First form fails although installed (finding F3); the other two work. |
| 13 | read installed sources (`dialog.ts`, `button.ts`, `lib/button.ts`, `table.ts`, `input.ts`, `lib/input.ts`, `native-select.ts`, `badge.ts`, `empty.ts`, `card.ts`, `field.ts`, `stack.ts`, `heading.ts`, `text.ts`, `contracts.ts`, `tokens.ts`) + `foldkit`/`@foldkit/ui` d.ts | Exact prop types; dialog slots; `layoutStyle()` from contracts; tokens reference global CSS vars (finding F5). |
| 14 | `npx eslint .` on the untouched starter | `Raw \`main\` rendering is forbidden in application views (no-raw-composition, contract composition.section). Install the replacement with \`npx shadcn@latest add Potti1234/creaseui/pleat-section\`.` → discovered `pleat-section`. |
| 15 | `npx creaseui-lint doctor` (baseline) | `coverage complete` + `note no installed replacement for: control.textarea, control.combobox, control.label, composition.form, composition.grid, composition.center, composition.section, …` — this note is effectively the only contract catalogue the tools give. |
| 16 | `npx shadcn@latest add http://127.0.0.1:4873/pleat-section.json`, `inspect --component section` | `section` with `variant` (`section`/`transparent`/`muted`), padding scale, `maxWidth`. |
| 17 | `creaseui-lint init` re-run, then delete + re-run (see F4) | Registers `section.ts` (45 artifacts, 17 raw-rendering files). |
| 18 | browser run → unstyled page; read `crease-theme.json` (`registry:theme`); `npx shadcn@latest add http://127.0.0.1:4873/crease-theme.json --yes` | Fails on empty `styles.css` (F6); works after adding a comment. Adds `:root` / `.dark` tokens. |

## (b) Components chosen and why

| Need | Component | Why |
|---|---|---|
| Page shell | `pleat-section` (`variant: 'transparent'`, `padding: 8`, `maxWidth: 960`) | Lint replacement for raw `main`/`section` (contract `composition.section`). |
| Layout | `pleat-stack` (`vStack`, `hStack` with `justify: 'between'`, `wrap`) | Stateless composition; avoids raw `div` + styles. |
| Title / description | `pleat-heading` (`level: 1`), `pleat-text` (`color: 'secondary'`, `weight: 'medium'`) | Typography components. |
| Buttons (Invite, Cancel, Send, Clear search) | `pleat-button` (`variant: 'outline'` for secondary actions, `isDisabled` on Send when email empty) | Control contract. |
| Search + email | `pleat-input` (`onInput`, `type: 'search' / 'email'`, `label`, `ariaLabel`) | `onInput` fires per keystroke → filter as you type. |
| Role select | `pleat-native-select` (`options`, `onChange`) | Simple stateless select; `pleat-select`/`pleat-combobox` are stateful popovers — unnecessary for 3 fixed options. |
| Member list | `pleat-table` (`table`, `tableHeader/Body/Row/Head/Cell`) | Static table; `pleat-data-table` not needed (no sorting/paging). |
| Status | `pleat-badge` (`secondary` = Active, `outline` = Invited, `destructive` = Suspended) | Named variants instead of colors. |
| No results | `pleat-empty` (`emptyHeader/Title/Description/Content`) + “Clear search” button | Empty-state contract. |
| List container | `pleat-card` + `cardContent` | Groups search + table. |
| Dialog form group | `pleat-field` (`fieldGroup`) | Spacing between email and role controls. |
| Invite dialog | `pleat-dialog` | Parent-model stateful: `Dialog.Model` lives in the app `Model`, `GotInviteDialogMessage` routes `Dialog.Message` through `Dialog.update`; `Dialog.open/close` used from `ClickedInviteMember / ClickedCancelInvite / ClickedSendInvite`; commands mapped with `Command.mapMessages`. Escape / close-X go through the same route. |
| Tokens | `crease-theme` | Defines `--primary`, `--background`, `--border` … used by Pleat tokens (F5). |

## (c) Wrong guesses, API mistakes, lint/type errors and resolutions

1. **19 wrong registry-name guesses** (404s listed in step 6). Resolved by more guessing — there is no allowed listing tool.
2. **`init --dry-run` before installing** failed with the misleading `--components` message (F2). Resolved: install first, then init.
3. **`inspect --component native-select`** (the file/item name) said “not installed” (F3). Resolved: `--component nativeSelect` / `pleat-native-select`.
4. **Raw `main` in the starter** → `crease/no-raw-composition`. Resolved by installing `pleat-section` and composing with it.
5. **Installing `pleat-section` after `init`** → `npx eslint .` gave 4 errors inside the *installed* `src/ui/pleat/section.ts`
   (`'@pleat/core' is a renderer authoring API reserved for registered component and theme files…`,
   `Raw \`section\` rendering is forbidden in application views…`, `\`Class\` authors appearance directly…`,
   `\`Style\` authors appearance directly…`) and `doctor` exit 2:
   `problem src/ui/pleat/section.ts is installed in src/ui but not registered in crease.lock.json; re-run creaseui-lint init`,
   `coverage feature-only`. Re-running init did not fix it (F4). Resolved by deleting the tool-generated
   `crease.lock.json` and running `creaseui-lint init --renderer pleat` again with every component installed (equivalent
   to the VERIFY order “init after installing components”). Lock diff is purely additive (section entry). Lint config,
   ignores and rules untouched; the stray `creaseui-lint.config.mjs` that init writes was not wired in and not committed.
6. **App code:** `tsc --noEmit` and `eslint .` passed on the first write of `src/app/main.ts` (APIs were read from the
   installed sources first). No type errors to resolve.
7. **Unstyled page** (black-text button, transparent dialog panel) on first browser run → missing theme (F5). Resolved by
   installing `crease-theme` (after F6 workaround).
8. **Test harness:** the first scripted run typed before the input had focus and lost characters; also
   `@foldkit/vite-plugin` preserves the model across page reloads server-side, so a fresh tab inherited `search: "gra"`.
   Resolved by clicking the input before typing and restarting `vite` for a clean state. Not app bugs.

## (d) CreaseUI bugs and doc gaps

- **F1 — no discoverable component catalogue.** The skill says to start with `creaseui-lint info`, but before install it
  only prints `renderer unknown … receipt missing; run creaseui-lint init`, and after install it lists only what is
  installed. `inspect` needs an installed name and a receipt. The only hints of what exists are lint fix messages
  (`Install the replacement with … pleat-section`) and the `doctor` note of missing contracts. Every component name
  had to be guessed against the registry server (19 misses).
- **F2 — misleading init error.** Before anything is installed, `init --renderer pleat --dry-run` says
  `Invalid @creaseui/lint configuration: --components <dir> (the installed component directory) is required when components.json has no ui/lib alias`
  — but `components.json` *does* have `"ui": "@/ui"` and `"lib": "@/lib"`. The real cause is that no components exist yet.
- **F3 — `inspect` does not accept the kebab item/file name.** `npx creaseui-lint inspect --component native-select` →
  `native-select is not installed in this pleat project. Install it with \`npx shadcn@latest add Potti1234/creaseui/pleat-native-select\` …`
  (exit 1) although `src/ui/pleat/native-select.ts` is installed and in the receipt; `nativeSelect` and
  `pleat-native-select` work. The error recommends installing the very item already installed.
- **F4 — `init` cannot update an existing receipt, but `doctor` tells you to re-run it.** After adding `pleat-section`,
  `npx creaseui-lint init --renderer pleat` prints `keep crease.lock.json (already present; not overwritten)` and
  `receipt: 45 artifacts, 17 raw-rendering files` (suggesting success) yet writes nothing; doctor keeps reporting
  `src/ui/pleat/section.ts is installed in src/ui but not registered in crease.lock.json; re-run creaseui-lint init`.
  There is no `--force`/`--update` flag. It also writes a new `creaseui-lint.config.mjs` and says
  `add: import crease from './creaseui-lint.config.mjs'  and spread  ...crease  into its exported array` even though
  `eslint.config.js` (written by the same init) already contains the identical `creaseui({...})` block.
- **F5 — Pleat components do not depend on the theme they need.** Installed `src/ui/pleat/tokens.ts` resolves to
  `var(--primary)`, `var(--background)`, `var(--border)` …, but no `pleat-*` item lists `crease-theme` in
  `registryDependencies`, while `docs/registry.md` says every UI item declares `crease-theme`. Result: a page that
  passes every check renders unstyled. Even with `crease-theme` these are still defined by nothing:
  `--stylex-input-surface`, `--stylex-outline-surface`, `--stylex-outline-hover`, `--stylex-muted-hover`,
  `--stylex-destructive-surface`, `--stylex-soft-destructive-*`, `--font-mono`. `creaseui-lint css` reports
  `0 violations, 0 unverifiable` throughout, so it does not catch undefined tokens.
- **F6 — `crease-theme` install fails on an empty stylesheet.** On the starter’s empty `src/styles.css`,
  `npx shadcn@latest add http://127.0.0.1:4873/crease-theme.json --yes` →
  `Something went wrong. … Cannot read properties of undefined (reading 'proxyOf')`. Works once the file has any
  content (I added a `/* Crease theme tokens */` comment).
- **F7 — `crease-theme` is Tailwind-only.** It writes `@custom-variant dark (...)` and `@theme inline { --color-*, --font-sans, --radius-* }`.
  The Pleat/Vite project has no Tailwind, so `vite build` warns `[lightningcss minify] Unknown at rule: @custom-variant`
  and `Unknown at rule: @theme`, and the `--color-*` aliases plus `--font-sans` never exist. The theme’s own base layer
  (`* { border-color: var(--color-border) }`, `body { background-color: var(--color-background) … }`) is therefore
  invalid: borders fall back to `currentColor` (black card/table borders in the screenshots) and the font stays the
  browser serif default. Not worked around (would require ad hoc CSS).
- **F8 — `creaseui-lint init --help`** crashes with a raw stack trace:
  `TypeError [ERR_PARSE_ARGS_UNKNOWN_OPTION]: Unknown option '--help'`.
- **Minor:** dev server logs `[foldkit] Slow view: 20.6ms (budget: 16ms), triggered by init` (vite terminal; no browser console errors).

## (e) Final check outputs (demo root, final tree)

```
$ npm install --no-audit --no-fund
up to date in 235ms
$ npx creaseui-lint init --renderer pleat
keep    crease.lock.json (already present; not overwritten)
keep    eslint.config.js (existing config is never replaced)
        add: import crease from './creaseui-lint.config.mjs'  and spread  ...crease  into its exported array
write   creaseui-lint.config.mjs          # stray file, deleted, not committed (F4)
receipt: 45 artifacts, 17 raw-rendering files
$ npx tsc --noEmit
(exit 0)
$ npx vite build
[lightningcss minify] Unknown at rule: @custom-variant   # F7
[lightningcss minify] Unknown at rule: @theme            # F7
dist/index.html                   0.40 kB │ gzip:   0.27 kB
dist/assets/index-B8UkBbdu.css    4.16 kB │ gzip:   0.98 kB
dist/assets/index-DK8b5ssi.js   454.62 kB │ gzip: 139.73 kB
✓ built in 371ms
$ npx eslint .
(exit 0, no output)
$ npx creaseui-lint doctor
ok      receipt valid (renderer pleat, policy crease-default-v1, 45 owned files)
ok      46 source files inspected, 0 uncovered UI modules
note    no installed replacement for: control.textarea, control.combobox, control.label, composition.form, composition.grid, composition.center, navigation.nav, navigation.link, composition.list, composition.separator, control.disclosure, feedback.progress (diagnostics show install commands)
ok      1 stylesheets inspected
coverage complete
$ npx creaseui-lint css
css: 1 stylesheets, 0 violations, 0 unverifiable
```

### Browser check (`npx vite`, Playwright over CDP, 1280×900)

- initial: 6 rows
- type `gra` → 1 row (Grace Hopper)
- type `zzz` → 0 rows, “No members found” empty state; “Clear search” → value `""`, 6 rows
- Invite member → dialog open, Send disabled while email empty; type email → Cancel → dialog closed, still 6 rows
- reopen → email reset to `""`; `new.person@acme.io` + role Viewer → Send invite → dialog closed, 7 rows, last row
  `new.person  new.person@acme.io  Viewer  Invited`
- Escape closes the dialog
- console errors/warnings: `[]`
