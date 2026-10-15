# Crease Tasks

Archived first attempt: see design-system/attempt-01/README.md. This local
snapshot preserves a working visual slice with known architecture defects,
not an accepted tutorial checkpoint.

A local, working first slice for the Crease design-system tutorial. Open
http://127.0.0.1:5197 after npm install and npm run dev.

The source foundation is pinned in crease-source.json to reviewed Crease PR 28,
244b4c79cf901a28f7e2e8d57a9b4dd59aaee390. Foldkit 0.164.0 and Effect 4.0.0-rc.117
are kept together. The unpublished lint package is a portable packed snapshot in
vendor, so installing this checkpoint does not require a sibling checkout.

- src/ui and src/lib contain registry-installed, source-owned Crease components.
- src/design contains product patterns with closed, domain-specific APIs.
- src/view.ts composes those patterns; src/model.ts owns domain state and updates.
- src/styles.css should own theme/base rules only. This checkpoint incorrectly
  centralizes component styling there; that is an open architecture repair.
- design-system records the brief, decisions and review evidence.

Try status, priority and assignee pickers, My issues/project navigation, search,
Filter, Display, and New issue. C opens creation, / focuses search, Escape dismisses
an overlay, Arrow keys/Enter operate menus, and Control/Command+Enter creates an
issue. Drafts survive closing/reopening in the session. Issue edits and creation
survive refresh. The reset button beside the account requires confirmation.

Validation commands: npm run typecheck, npm run lint, npm run build. The initial
lint command checks feature files under the strict policy and enforces the product
import boundary. Only the exact known component source paths are excluded from
this initial feature lint; new files are checked automatically. Full
component-authoring policy, generated installer contracts,
the complete accessibility/visual matrix and all tutorial chapters are later work.
This first visual review is not a completed strict-lint or design-reliability release.

Architecture review also found that navigation was rebuilt without adapting the
available Crease Sidebar, and authoring sources receive no effective lint checks.
Closed product APIs do not compensate for those gaps. Repair styling ownership,
component reuse and authoring coverage before treating this source as a tutorial
checkpoint. See design-system/review-notes.md; the full repair assignment is
docs/plan/tutorial-architecture-enforcement-plan.md in the Crease planning repo.

Some copied sources have named product appearances added locally. Do not run
scripts/refresh-crease.mjs over those changes without reviewing/merging them; its
overwrite behavior is for recreating the initial upstream snapshot, not upgrading
customized product sources safely. It requires the pinned sibling review checkout
and generated registry. Normal app install/build/run has no sibling dependency.

Keep this slice local for iteration. The user will supply the remote repository;
chapter branches and reviewed checkpoint tags follow the accepted visual direction.
