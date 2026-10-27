# 009: Display options instead of free-form controls

Chapter 14. An API change to `IssueCollection`, in three commits that each pass every check.

## Why

`controls` took any list of elements. Each view built its own buttons, and their labels drifted: "Grouped by status", "Sort: Priority", "Layout: Board". The bar is the same on every list page, so the collection should draw it (decision D13).

## Steps

1. `display` and `actions` added; `controls` kept and marked deprecated. A product rule (`no-restricted-syntax`) warns on every use, and the lint ratchet allows exactly the four existing callers.
2. All four views migrated; the ratchet returns to 0.
3. `controls` removed from the type and the rendering, and the deprecation rule removed: the type now rejects it.

## Migration for a view

Replace `controls: [button({ onClick, children: ['Sort: Priority'] }, h)]` with `display: [{ name: 'Order', value: 'Priority', onChange }]`, and a button that acts on the list with `actions: [{ label, onClick }]`.
