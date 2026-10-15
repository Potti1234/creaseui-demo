import { writeFileSync } from 'node:fs'

// Explicit public rendering APIs for this checkpoint. No filename-based discovery.
const api = {
  'src/design/primitives.ts': [
    'action',
    'iconAction',
    'glyph',
    'shortcut',
    'person',
    'statusIcon',
    'priorityIcon',
    'brand',
  ],
  'src/design/shell.ts': [
    'appShell',
    'sidebar',
    'pageHeader',
    'toolbar',
    'feedback',
  ],
  'src/design/issue-list.ts': [
    'issueCollection',
    'issueGroup',
    'issueRow',
    'emptyIssues',
  ],
  'src/design/pickers.ts': [
    'statusPicker',
    'priorityPicker',
    'assigneePicker',
    'filterPicker',
    'displayPicker',
  ],
  'src/design/composer.ts': ['issueComposer', 'resetConfirmation'],
}
const artifacts = Object.entries(api).map(([file, names]) => ({
  id: 'tasks/' + file.split('/').at(-1).replace('.ts', ''),
  files: [{ path: file, role: 'renderer', rawRendering: true }],
  exports: names.map(name => ({
    file,
    name,
    contract: 'tasks.' + name,
    propsArgument: name === 'brand' ? 1 : 0,
    builderArgument: name === 'brand' ? 0 : 1,
    variants:
      name === 'action'
        ? { intent: ['primary', 'quiet', 'outline'] }
        : /Picker$/.test(name)
          ? { presentation: ['row', 'composer'] }
          : {},
  })),
}))
artifacts.push({
  id: 'tasks/entry',
  files: [{ path: 'src/entry.ts', role: 'setup', rawRendering: false }],
  exports: [],
})
writeFileSync(
  'crease.lock.json',
  JSON.stringify(
    {
      schemaVersion: 1,
      policyVersion: 'crease-default-v1',
      renderer: 'tailwind',
      artifacts,
    },
    null,
    2,
  ) + '\n',
)
