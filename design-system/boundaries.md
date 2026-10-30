# Boundaries

Who may use what, and which check enforces it. A feature change works inside these lines. Moving a line is a design-system change.

## Layers

| Layer | Files | May use | Enforced by |
|---|---|---|---|
| Features | `src/features/**`, `src/view.ts` | The patterns in `src/design`, the public exports of `src/ui` except `item` and `dropdown-menu`, the domain and the Model | `crease/no-raw-controls`, `no-raw-composition`, `no-application-styles`, `no-unapproved-renderer`, `component-contract`, `no-restricted-imports` |
| Patterns | `src/design/**` | The public exports of `src/ui` | The same rules as features: patterns are application code that composes components |
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

None since chapter 7. Every file is checked at error level and the ratchet is 0.

## Keeping the receipt in step

`crease.lock.json` lists the values each component accepts. When a component's variants change, its entry changes in the same commit. TypeScript checks the component's own type, the lint checks calls against the receipt, and `creaseui-lint doctor` compares the two (since chapter 15): a value the receipt allows but the component does not have is a problem, and a value the component has but the receipt leaves out is printed as a note, because narrowing in the receipt is allowed (chapter 10 narrows `badge` and `text`).
