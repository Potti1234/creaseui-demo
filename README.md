# Crease Tasks

The example app of the Crease design-system guide: an issue tracker modelled on Linear, built with [Foldkit](https://foldkit.dev) and [crease/ui](https://github.com/Potti1234/creaseui) components, Tailwind renderer.

Each chapter of the guide is a tag on `main`. Check one out to get the app as that chapter leaves it, or diff two tags to see exactly what a chapter changed:

```sh
git switch --detach chapter-05
git diff chapter-04 chapter-05
```

| Tag | Chapter |
|---|---|
| `chapter-02` | Install and run: a first slice, built quickly |
| `chapter-03` | Turn product principles into decisions |
| `chapter-04` | Create a coherent theme |
| `chapter-05` | Customize a component and reduce its API |
| `chapter-06` | Contracts and boundaries |
| `chapter-07` | Compose named product patterns |
| `chapter-08` | Model saving, validation and workflows |
| `chapter-09` | Verify the whole system |
| `chapter-10` | Configure the product policy |
| `chapter-11` | Write a product lint rule |
| `chapter-12` | Feature work by agents, inside the system |
| `chapter-13` | A design-system change, proposed by an agent and reviewed |
| `chapter-14` | Evolve an API and migrate its callers |
| `chapter-15` | Take in changes from crease upstream |

## Run

```sh
npm install
npm run dev        # http://127.0.0.1:5197
npm run typecheck
npm run lint       # crease's strict lint; fails if the warning count grows
npm run doctor     # checks that the lint covers every UI file
npm run check      # all of the above, plus the CSS policy, the lint fixtures and the tests
npm test           # Story tests of update
npm run check:browser  # the browser check, against a running `npm run dev`
npm run scope      # enforcement files changed in the working tree
```

The crease components in `src/ui` and `src/lib` were installed with the shadcn CLI from `Potti1234/creaseui` at commit `9240b562` and updated to commit `d0bf498a` in chapter 15 (`design-system/changes/010-crease-update.md`). They are this app's own source. `crease.lock.json` records which files came from crease and what each export may be called with. `@creaseui/lint` is not published yet, so a packed copy is in `vendor/`.
