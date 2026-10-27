# 006: Product policy

Chapter 10. A design-system change: the lint configuration, the receipt and one component.

- `policy/product-policy.js`: the product's own rules in one module, each naming its decision. The import rule from chapter 7 moved here and gained `@/ui/dialog` (D8).
- `crease.lock.json`: `badge` allows `outline` only; `text` allows sizes `xsm` and `sm`, colours `primary` and `secondary`, weights `normal`, `medium`, `semibold`. Components keep all of crease's choices in their source.
- `src/ui/badge.ts`: the `outline` look is replaced by the product's label look (muted, 11px; decision D2).
- `design-system/policy.md`: the three layers, narrowing versus replacing, and the limits found.
- Two lint fixtures: a narrowed `text` size and a `dialog` import in feature code.

Tried and taken back: narrowing `heading`'s `level` to `4`. The receipt only checks string values, so the restriction had no effect.
