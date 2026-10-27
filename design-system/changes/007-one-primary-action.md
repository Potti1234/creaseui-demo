# 007: One primary action per region

Chapter 11. A lint rule of our own, for a decision configuration cannot express.

- `tooling/eslint-plugin-crease-tasks/index.js`: `one-primary-action` reports a second `intent: 'primary'` on `button` or `buttonLink` (imported from `@/ui/button`, under any local name) in the same file. A conditional intent counts when either branch is `primary`. A file is the region it renders: the page header, the composer, a pattern.
- `policy/product-policy.js`: the rule is on for `src/**/*.ts`.
- `test/rules/one-primary-action.test.ts`: ESLint's RuleTester with three valid and three invalid cases. With the rule's report disabled, the three invalid cases fail.
- `test/lint-fixtures/two-primaries.ts`: the rule, end to end through the project's configuration.

Known limit: a file is a coarse region. Two regions in one file (a page header and a dialog footer written in the same module) count as one. Splitting them into two files is the remedy, and keeps each region's rules in one place.
