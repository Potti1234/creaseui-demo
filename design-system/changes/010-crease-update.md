# 010: crease 9240b562 to d0bf498a

Chapter 15. A design-system change: it updates components, the theme, the lint package and the ESLint configuration to crease `d0bf498a`, and removes the workarounds that upstream made unnecessary.

## Why

Building chapters 2 to 14 turned up nineteen problems in crease (journal A0.1 to A0.19). Crease Tasks worked around each one in its own copy. crease fixed all nineteen in pull request #46, merged as `d0bf498a`. Taking the fixes in removes the local workarounds, so the next update has fewer local changes to merge.

## Which files changed upstream

`crease.lock.json` lists 36 source files that came from crease (its 37th file entry is `src/main.ts`, registered as the setup file). Between `9240b562` and `d0bf498a`, 13 of them changed upstream. In 8 the only change is a removed byte-order mark (A0.19), which the copies installed by the shadcn CLI never had. That leaves 5 files, plus the theme and the lint package. Each change falls into one of three groups.

**Upstream fixed what Crease Tasks had worked around.** Taken from upstream; the workaround is deleted.

| Journal | Workaround until chapter 14 | Now |
|---|---|---|
| A0.2, A0.16 | `tokens.css` split from one generated file by hand, global rules removed, sidebar tokens added at the end | The preset compiler writes tokens and geometry as two files, with the full sidebar set in light and dark |
| A0.3 | `{ ignores: ['**/*.css'] }` in `eslint.config.js` | `creaseui()` keeps registered stylesheets out of ESLint's file list |
| A0.11 | An `ariaExpanded` prop on the local Button | `ariaExpanded`, `ariaControls` and `ariaHasPopup` on every button, in `src/lib/button.ts` |
| A0.12 | A local patch in `dropdown-menu.ts` | The same condition upstream |
| A0.13 | The Inter import in `tokens.css` | The base theme in `src/styles.css` imports `@fontsource-variable/inter` |
| A0.17 | An `indent` option on `sidebarMenuButton` | Team pages use `sidebarMenuSub` and `sidebarMenuSubButton`, which renders a `<button>` without an `href` and aligns `sidebarMenuBadge` |
| A0.18 | A local `tone` on `avatarFallback` | `tone` upstream, also on `avatarGroupCount` |

**Upstream changed a file Crease Tasks had not changed.** Taken as it is.

- `sidebar.ts`: the sidebar fills the page height with `collapsible: 'none'` (A0.6); `sidebarInset` has `min-w-0` (A0.7); `sidebarMenuBadge` aligns with `md` buttons.
- `command.ts`: the broken wiring example in the closing comment is repaired (A0.19).
- The lint package (`vendor/creaseui-lint-0.1.0.tgz`, packed from `packages/lint` at `d0bf498a`): `doctor` compares receipt variants with the source (A0.9), numeric and boolean receipt variants are checked (A0.15), `scope` ignores line-ending-only differences (A0.4), the height message names `size` only where it exists (A0.5), and `hidden md:flex` counts as placement (A0.10).

**Upstream changed a file Crease Tasks had changed too.** Merged with `git merge-file` (local copy, `9240b562`, `d0bf498a`), conflicts resolved by hand.

- `src/ui/sidebar.ts`: one conflict. Upstream added a comment to `sidebarTrigger`'s `buttonVariants({ variant: 'ghost', size: 'icon' })` call; Crease Tasks calls `buttonVariants({ intent: 'secondary', shape: 'icon' })` since chapter 5. The local call stays, with the comment rewritten for it. This is the one place the file differs from upstream.
- `src/ui/avatar.ts`, `src/ui/dropdown-menu.ts`: both sides changed the same lines in the same way, apart from comments. Upstream's file is taken whole.
- `src/ui/button.ts` did not change upstream, but its local `ariaExpanded` repeated the prop `ButtonBehaviorProps` now has, and set the attribute a second time. It is removed; chapter 5's `intent` and `shape` stay.

## What is still local

- `tokens.css` gets one edit after generating: the preset still loads Inter from Google Fonts and names it `"Inter"`. The import is deleted and the name changed to `"Inter Variable"` (`design-system/theme.md`). Reported to crease as a new journal entry.
- Chapter 5's Button, `item`'s `inline` layout, chapter 10's badge look and receipt narrowing: product decisions, not workarounds.

## Checks

- `npm run check`: typecheck, lint with ratchet 0, `doctor` (four notes for the narrowed `badge` and `text`, no problems), CSS policy, lint fixtures, 38 tests.
- `npm run check:browser`: 22 of 22.
- `npx creaseui-lint scope --baseline chapter-14` lists the enforcement changes: `eslint.config.js`, the lint package and its lockfile entry.
