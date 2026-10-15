# Product design rules

1. Issue titles receive the most attention. Supporting navigation, identifiers,
   project names and labels recede. Avoid promotional panels and empty statistics.
2. Location and view operations occupy separate, stable header rows. Create remains
   in the same action position across the implemented views.
3. Small properties edit beside their trigger. Multi-field creation has a focused
   composer and an explicit submit boundary. Menus are not a universal modal ban.
4. One vocabulary serves rows, creation and filters: four statuses, five priorities,
   four named teammates and Unassigned. Status uses shape as well as color.
5. A row's hover/focus treatment is distinct from the recent-created highlight.
   This checkpoint does not implement multi-selection; do not imply it with checkboxes.
6. Parent layout, control geometry and text roles belong to product components.
   Feature code cannot choose arbitrary classes, colors, spacing or Button sizes.
7. Source-owned customization is explicit. Named appearances extend copied Crease
   sources. Keep behavior and focus ownership in Foldkit/Crease primitives and their
   update results; do not recreate them in click handlers.
8. Search, filters and ordering are separate model concepts. Empty results explain
   the state and provide a working way to remove it. Navigation always changes real
   data selection rather than the heading alone.
9. A property menu focuses an option, supports Arrow/Enter/Escape, and restores focus
   after editing/regrouping. If filtering removes the trigger, focus returns to the
   list heading. Commands use Foldkit's after-commit DOM helpers.
10. Persist actual issue edits. Validate saved data on load and report failures.
    Reset requires confirmation. A toast or a CSS state is not a data operation.
11. Keep motion short, interruptible and limited to state changes. Respect reduced
    motion. Numbers use tabular forms; icons use one verified source and scale.
12. Lint encodes a useful subset of policy. Types and tests cover state behavior;
    browser checks and human review cover appearance, focus and task usability.

Sources and adaptations are documented in the Crease planning repository's
docs/plan/linear-task-manager-design-research.md. The working product and the
source material remain distinguishable: no undocumented Linear metric is treated
as a requirement, and its trademark or product assets are not used.
