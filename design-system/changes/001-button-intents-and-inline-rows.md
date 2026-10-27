# 001: Button intents and inline rows

Chapter 5. A design-system change: it edits components and `crease.lock.json`, so `creaseui-lint scope --baseline chapter-04` reports it and needs `--allow-enforcement-changes` after review.

## Why

The first slice styled its rows and buttons with classes. The lint counted 13 such overrides. Grouped by component, they repeated:

| Component | Override | Times | Became |
|---|---|---|---|
| `item` | `flex-nowrap` | 3 | `layout: 'inline'` |
| `itemTitle` | `truncate` (with `block w-full` once) | 3 | `layout: 'inline'` |
| `itemContent` | `flex-row items-baseline gap-2` | 1 | `layout: 'inline'` |
| `item` | `px-4`, `px-3`, `gap-2 py-1.5`, `rounded-none border-b` | 1 each | removed: the list's parent sets the inset, `itemGroupSeparator` draws the lines |
| `item` | `hover:bg-accent` | 1 | removed: rows aren't interactive until chapter 7 |
| `button` | `h-7`, `rounded-md`, `px-0` | 1 each | removed: one height for all buttons (D4) |
| `input` | `h-7`, `text-xs` | 1 each | removed: the chapter 4 theme already sets inputs to 28px and 13px |
| `stack` | `bg-muted` on the group header | 1 | kept, as the one remaining warning: the group header becomes a pattern in chapter 7 |

## What changed

- `src/ui/item.ts` gained `layout: 'wrap' | 'inline'` (default `wrap`, crease's behaviour). `inline` keeps the row at 36px on one line; the title truncates; actions stay at the end.
- `src/ui/button.ts` lost crease's six `variant`s and eight `size`s. It has `intent: 'primary' | 'secondary'` (default `secondary`) and `shape: 'text' | 'icon'`, both 28px; `shape: 'icon'` requires `ariaLabel`.
- `src/ui/sidebar.ts` used `buttonVariants({ variant: 'ghost', size: 'icon' })` for its trigger; it now uses `{ intent: 'secondary', shape: 'icon' }`.
- `crease.lock.json` lists the allowed values for `button`, `buttonLink` and `item`, so the lint rejects a removed value even when it arrives through a variable.
- `src/view.ts`: the content area gets `min-w-0`, so it can shrink below the rows' single-line width.
- The lint ratchet went from 13 to 1.
