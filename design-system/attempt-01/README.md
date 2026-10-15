# Archived first tutorial attempt

Saved 2026-10-15 on local branch archive/tutorial-attempt-01. This preserves the
first visual slice and the architecture failure for comparison and regression
work. It is not an accepted chapter or a starter template.

The source foundation is Crease PR 28 at
244b4c79cf901a28f7e2e8d57a9b4dd59aaee390. The demo's snapshot commit can be obtained
with git rev-parse archive/tutorial-attempt-01. No remote publication is required.

## Recover and run

Check out the archive branch in a separate checkout when comparing later repairs.
Install with npm ci, then run npm run dev. The configured address is
http://127.0.0.1:5197; use a different port when another copy is running.
The packed lint dependency, package lock, fonts dependency and component source
are included. Dependency downloads require network access.

Normal installation/build/run does not require the sibling Crease repository.
scripts/refresh-crease.mjs is an initial snapshot installer, requires a sibling
checkout and deliberately refuses to overwrite this customized application.

## Preserved results and known failure

The list, inline property editing, composer, local persistence, screenshots and
pilot essay are preserved. The historical browser evidence covers 28 distinct
workflow checks; the core 18 were also run against the production build.
See [the review record](../review-notes.md) and
[verification data](../verification.json) for scope and accessibility limitations.

The architecture fails its intended purpose: component styling is centralized
in src/styles.css, navigation bypasses the available Crease Sidebar, and
component authoring sources are globally ignored by lint. The archived lint
coverage report records that gap. A build or feature lint pass does not accept it.

## Evidence

evidence.zip contains selected final transcripts from the original browser runs,
negative feature-lint diagnostics, corresponding local CLI browser functions and
negative source examples. They are stored as an archive so Tailwind's source scan
does not include deliberately invalid example utilities. These are historical probes,
not installed package scripts or a portable automated regression suite. They use
the original local ports and, for Axe, a sibling dependency path.

The three curated screenshots are under docs/images. Runtime build output,
node_modules, browser profiles and temporary files are excluded from the snapshot.
Browser localStorage is not part of the archive; a fresh browser uses synthetic
seed data.

Further comparison should use a new repair branch or worktree. Preserve this
commit as the counterexample instead of rewriting it into an apparently correct
first attempt.
