# 005: Verification

Chapter 9. Adds tests and checks; no component or pattern changes apart from exporting `FocusTitle` for the tests.

- `test/update.test.ts`: Story tests of update with Foldkit's `Story`: a property change commits and saves; a failed save keeps the change and Retry saves again; an empty title is refused; closing keeps the draft; a valid draft becomes the next issue and is saved; `validateTitle`.
- `test/lint-fixtures/*` and `scripts/check-lint-fixtures.mjs`: six files that must pass or fail with a named rule, linted as feature code.
- `scripts/check-browser.mjs`: eleven checks in Chromium against the running app, one of them on `component-check.html`, a page that renders components in the situations their guarantees are about (registered as a setup file in `eslint.config.js`).
- `package.json`: `npm test`, `npm run check:lint-fixtures`, `npm run check:browser`; `npm run check` now also runs the lint fixtures and the tests.
- `design-system/verification.md`: what each check proves and misses.
