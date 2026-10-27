# Boundaries

Who may use what, and which check enforces it. A feature change works inside these lines. Moving a line is a design-system change.

## Layers

| Layer | Files | May use | Enforced by |
|---|---|---|---|
| Features | `src/features/**`, `src/view.ts` | The public exports of `src/ui` (`button`, `item`, `stack`, …), the domain and the Model | `crease/no-raw-controls`, `no-raw-composition`, `no-application-styles`, `no-unapproved-renderer`, `component-contract` |
| Components | `src/ui/**` | Raw elements, classes, `src/lib` | Registered in `crease.lock.json` as renderers with a raw-rendering grant |
| Implementations | `src/lib/**` | Raw elements | Their render exports are `visibility: "implementation"` in `crease.lock.json`: only components may call them |
| Theme | `src/styles.css`, `src/theme/*.css` | Tokens; `geometry.css` also targets components by `data-slot` | `creaseui-lint css`; `geometry.css` is registered as theme CSS in `eslint.config.js` |
| Entry | `src/main.ts` | Stylesheet imports, the runtime | Registered as the setup file in `eslint.config.js` |
| Enforcement | `crease.lock.json`, `eslint.config.js`, `package.json` scripts, `AGENTS.md` | Changed only in design-system changes | `npm run scope` reports any change to them |

## What a feature may pass to a component

A feature places a component. The component decides how it looks. Checked by `crease/component-contract`:

- Allowed on every component: margin, width, `min-w-0`, `flex-1`, alignment and order (`mt-4`, `w-56`, `self-end`, `order-last`).
- Allowed except on `button` and `input`: a height. Those two own their height (decision D4 and the theme).
- Never allowed: padding, gap, corners, borders, colours, shadows, type, truncation. Each of these is a variant, a token, or a pattern's job.
- Variant values must be in the component's entry in `crease.lock.json`.

## Migration

`src/features/issues.ts` still runs in migration mode, for its group header (`bg-muted` on a `stack`). Chapter 7 turns the header into a pattern and removes the last entry. Every other file is checked at error level.

## Keeping the receipt in step

`crease.lock.json` lists the values each component accepts. When a component's variants change, its entry changes in the same commit. TypeScript checks the component's own type, the lint checks the receipt, and nothing compares the two yet, so a value added to only one of them shows up as a type that compiles and a lint error.
