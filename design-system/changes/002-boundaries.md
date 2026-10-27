# 002: Boundaries

Chapter 6. A design-system change: it edits `eslint.config.js`, adds scripts and adds `AGENTS.md`, so `npm run scope` against `chapter-05` lists four enforcement changes.

## Why

After chapter 5, three of the four files in migration mode had no findings left, but their findings were still only warnings. A new override in `my-issues.ts` would have passed the build as long as the ratchet had room. And nothing told a person or an agent where the line between a feature change and a design-system change runs.

## What changed

- `eslint.config.js`: migration mode covers only `src/features/issues.ts`, which keeps its one known warning until chapter 7. Every other file is checked at error level.
- `package.json`: `npm run check` runs the typecheck, the lint with its ratchet, `creaseui-lint doctor` and the CSS policy. `npm run scope` lists enforcement files changed in the working tree.
- `design-system/boundaries.md`: the layers, what each may use, and which check enforces it, including what a feature may pass to a component.
- `AGENTS.md`: the two kinds of change, for people and agents.
