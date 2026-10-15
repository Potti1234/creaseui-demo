# Crease Tasks local tutorial checkpoint

Read README.md, design-system/product-brief.md and design-system/principles.md.
This is a local first-slice review. Do not publish, add a backend, expand to more
screens, or create tutorial version branches before the visual direction is reviewed.

The foundation is Crease PR 28 at the commit in crease-source.json. Do not silently
upgrade Foldkit, Effect or copied components. The upstream lint/reliability release
has open findings; do not claim that this checkpoint completes that release.

Feature views use src/design patterns. They do not render raw controls, layout or
text, import a styling library, pass class/style overrides, or invent sizes/colors.
Product component changes belong in src/design, the reviewed src/ui sources, and
their owned renderer styles. src/styles.css is limited to framework/font imports,
semantic theme tokens/bindings and essential document/reset rules. Keep ordinary
Tailwind styles in the owning component source; do not add global component, slot
or descendant overrides. Moving those selectors into imported global CSS is not
a repair. Update the explicit contracts when changing a public API.
Keep the shared picker vocabulary, row geometry, action roles and keyboard behavior
consistent. Reuse Crease behavior rather than adding parallel menu/dialog state.

Before creating a product pattern, inspect the pinned Crease catalog/source and
record the base components to adapt. Sidebar already exists upstream; use its
owned source and parts for navigation. Inspect Kbd, InputGroup, Badge and other
applicable foundations before rebuilding their markup. Document actual API gaps
and change owned source where appropriate. New domain patterns remain legitimate.

Known architecture debt: this checkpoint violates the styling/reuse boundary
above, and its component authoring files are globally ignored by lint. Repair
those issues before expanding/freezing the tutorial. Do not copy that shortcut,
add new exemptions, or present feature-only lint as complete authoring coverage.
The repair assignment is docs/plan/tutorial-architecture-enforcement-plan.md in
the Crease planning repository. A registration grants no automatic quality proof.

Keep domain issues in the feature Model and interaction state in child Models.
Use child update results and Command.mapMessages. Do not edit child Model fields
from a parent update. Effects run through Commands/subscriptions, not views.

Run npm run typecheck, npm run lint and npm run build. Inspect the actual rendered
screen and changed interactions, including keyboard focus and persistence. Record
evidence in design-system/review-notes.md. A build or lint pass is not visual approval.
