# First local review record

2026-10-15. Candidate for user review; no visual acceptance or frozen chapter tag.

Foundation: Crease PR 28, 244b4c79cf901a28f7e2e8d57a9b4dd59aaee390.
Product source lives in this separate local Git repository. It has no remote and
no chapter commits/tags yet. The user will create creaseui-demo remotely.

## Architecture review correction

The user identified a material mismatch with the tutorial's purpose. Component
appearance lives in roughly 1,230 lines of global styles.css; named appearances
mostly point to CSS hooks rather than owning Tailwind styling. The sidebar was
rebuilt in src/design/shell.ts instead of adapting the available Crease Sidebar.
Other foundation candidates need the same reuse inventory.

Direct ESLint configuration inspection confirms that src/design/shell.ts,
src/ui/button.ts and src/styles.css are ignored and have no effective config.
The feature checks below remain valid within their stated scope, but do not
establish component-authoring, CSS ownership or foundation reuse correctness.

The implementation and our original instructions enabled this failure. AGENTS.md
and README.md now state the required boundary. Source repair and new enforcement
are still pending; no visual or runtime code changed during this audit. The full
assignment is docs/plan/tutorial-architecture-enforcement-plan.md in the Crease
planning repository. Do not freeze or expand the tutorial before this repair.

## What is ready to review

Open http://127.0.0.1:5197. Start with the list, change a status and assignee, use
search/Filter/Display, then create an issue with the keyboard. The slice uses the
confirmed light, desktop-first direction, shared product patterns and local data.
The current proposal is 236px navigation, 58px location header, 52px view toolbar,
44px rows, 40px group headers and 32px regular action visuals with 40px hit targets.

The candidate images in docs/images show the list, contextual picker and composer.
The images are review material, not approved screenshot comparison baselines.
The pilot essay is docs/tutorial/01-a-product-vocabulary.md. It explains decisions
through this real source rather than a standalone decorative mockup.

## Verification

- Full TypeScript check and Vite production build pass through npm run build.
- npm run lint passes for application code. The exclusion scope is stated below.
- Eighteen core browser workflows pass against both development and production.
  They cover data edits, regrouping, focus, keyboard navigation, filters, draft
  retention, validation, creation, reload persistence and confirmed reset.
- Seven additional checks pass: real display ordering, repeated personal/all
  navigation, nested-menu Escape, shortcut suppression while typing, reset
  cancellation, 390px containment and invalid stored-data recovery. No console
  errors occurred during that check.
- Three production checks pass for failed storage writes, truthful unsaved
  feedback/reload behavior, and group collapse/expand. Total: 28 distinct checks;
  the eighteen core checks were also repeated on the production bundle.
- Six negative diagnostics demonstrate the policy: forbidden base-layer import,
  raw composition, raw control, direct styling, asserted product props, and a raw
  button in a new unregistered file beside the installed UI sources.
- Axe 4.13.0, WCAG A/AA tags through 2.2, reports zero violations on the production
  list, open assignee picker and composer. List/composer have no incomplete
  checks. The menu has one aria-controls review item; direct DOM checks confirm
  its visible trigger references the existing visible popup. This is recorded
  as manual evidence, not silently counted as an automatic Axe pass.
- Browser measurements confirm every visible issue row is 44px, headers/toolbar
  match the declared values, Inter is used, every icon resolves and the checked
  menu stays inside the viewport.

Verification details are summarized in verification.json. Raw CLI transcripts,
probe scripts and additional screenshots remain in ignored output/. These checks
ran on Windows/Chromium. They are not a complete browser/device/theme matrix.

## Source-owned adaptations

The copied Button has finite task appearances and explicit transition properties.
Input, Textarea and Dialog expose finite product appearances. DropdownMenu exposes
finite trigger/panel appearances, leaves modified keys to the surrounding workflow
and only declares a live popup control reference while open. Product patterns hide
the broader base styling API from feature code. No parallel dialog/menu state
machine was added.

Menu focus uses the child update result and Foldkit's after-commit Dom helpers.
If regrouping/filtering removes a trigger, focus falls back to the list heading.
Avatar initials are decorative within already named choices. Contrast corrections
live in product styles. Domain teammate data does not carry visual color choices.

A row caching attempt failed during navigation between filtered collections. It
was removed; the final source uses fresh row VNodes and stable issue keys. The
repeated navigation and full workflow checks pass after that correction. Avoid
reintroducing mutable VNode reuse across changing positions as an untested cleanup.

## Exact limits of this checkpoint

The initial lint gate checks feature code and product imports. Known authoring
source files are excluded by exact paths. New neighboring files are checked;
there is no whole-directory raw-render exemption. This does not yet establish
complete component-authoring lint coverage. The explicit product receipt is
temporary maintenance while upstream installer contracts are incomplete.

The upstream PR's five review findings remain a separate repair assignment.
This app avoids the reviewed raw height override, namespace re-export and Item
paths; it does not claim to fix or release the upstream package.

Drafts survive closing/reopening during the session; drafts and view preferences
do not survive reload. This is one list surface, not a complete issue detail,
board, command palette or collaboration product. Narrow containment is checked,
but the light desktop direction is the primary review target. Human assessment
of appearance, usability and product rules remains necessary.

## Feedback to carry into the next revision

Review title/metadata hierarchy, density, label emphasis, the balance between the
rail and content, focus treatment and picker/composer feel. Record accepted
changes here and update the patterns, styles, public contracts and essay together.
Expand the product and freeze chapter branches only after this first direction
is accepted. Merge a later reviewed Crease baseline into the owned sources;
do not overwrite the local adaptations with a new registry snapshot.
