// Lints each file in test/lint-fixtures as if it were feature code and
// compares the rules that fire with the `// expect:` line at its top.
// Every rule the design system relies on has a fixture that must fail, and
// placement has one that must pass.
import { copyFileSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { ESLint } from 'eslint'

const root = path.resolve(import.meta.dirname, '..')
const fixtures = path.join(root, 'test', 'lint-fixtures')
const eslint = new ESLint({ cwd: root })
let failed = 0

for (const name of readdirSync(fixtures).filter(file => file.endsWith('.ts')).sort()) {
  const source = path.join(fixtures, name)
  const expected = /\/\/ expect: (\S+)/u.exec(readFileSync(source, 'utf8'))?.[1] ?? 'none'
  const target = path.join(root, 'src', 'features', `__fixture-${name}`)
  copyFileSync(source, target)
  try {
    const [result] = await eslint.lintFiles([target])
    const rules = [...new Set(result.messages.map(message => message.ruleId ?? 'parse-error'))]
    const ok = expected === 'none' ? rules.length === 0 : rules.includes(expected)
    if (!ok) failed += 1
    console.log(`${ok ? '✓' : '✗'} ${name.padEnd(20)} expected ${expected.padEnd(32)} got ${rules.length === 0 ? 'none' : rules.join(', ')}`)
  } finally {
    rmSync(target)
  }
}
console.log(failed === 0 ? 'lint fixtures: all as expected' : `lint fixtures: ${failed} not as expected`)
process.exit(failed === 0 ? 0 : 1)
