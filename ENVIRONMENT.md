# Local project environment

This is a fresh Foldkit/Vite/Tailwind starter. The user task is in TASK.md.
The ordinary CreaseUI component skill is installed at
.agents/skills/creaseui-components/SKILL.md.

CreaseUI source snapshot: e5a619053ad0b344d3946664f34322057016a003.
Its registry is served read-only at http://127.0.0.1:62831/r/registry.json.
The named registry @crease is configured in components.json. Use @crease/<item>
with the shadcn CLI, or its item URL. Dependencies resolve to the same snapshot.
Translate public Potti1234/creaseui/<item> install examples to @crease/<item> for
this local snapshot. Documentation linked by an installed item is mirrored on
the same server. Use the supplied snapshot for CreaseUI rather than a moving
public main branch; other normal framework/tool documentation is available.

The matching installable lint package is vendor/creaseui-lint-0.1.0.tgz.
Use npm. The starter's framework version and lockfile are the compatibility
baseline. The application preview port assigned to this project is 5187.

Only this project is your writable workspace. Do not inspect sibling checkouts,
earlier demo applications, review documents or another agent's files. Normal
user-level skills/tools, dependencies and the supplied registry/docs are available.
Do not push, publish, create a PR or modify the CreaseUI repository. Keep work local.

Before finishing, record commands, components chosen, validation results, and
any blockers/workarounds in DISCOVERY.md. Keep the initial and final diagnostics
under output/. Commit the local result and leave its preview running so it can
be reviewed. A reviewer will examine the resulting application separately.
