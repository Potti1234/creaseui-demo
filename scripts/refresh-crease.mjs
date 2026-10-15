import { execFileSync, spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
if (existsSync(path.join(root, 'crease-source.json')))
  throw new Error(
    'This project owns customized sources. Initial snapshot installation refuses to overwrite them. Review upstream diffs and merge changes instead.',
  )
const base = path.resolve(root, '../creaseui-reliability-review')
const sha = '244b4c79cf901a28f7e2e8d57a9b4dd59aaee390'
const actual = execFileSync('git', ['-C', base, 'rev-parse', 'HEAD'], {
  encoding: 'utf8',
}).trim()
if (actual !== sha)
  throw new Error(
    'The registry checkout must match the reviewed source commit ' + sha,
  )
const items = [
  'button',
  'input',
  'textarea',
  'dialog',
  'dropdown-menu',
  'separator',
  'stack',
  'heading',
  'text',
  'empty',
  'label',
  'badge',
  'avatar',
]
const server = createServer((request, response) => {
  const name = request.url?.match(/^\/([a-z0-9-]+)\.json$/u)?.[1]
  if (!name) return response.writeHead(404).end()
  try {
    const item = JSON.parse(
      readFileSync(path.join(base, '.registry', name + '.json'), 'utf8'),
    )
    item.registryDependencies = (item.registryDependencies ?? []).map(
      dependency => {
        const id = dependency.match(/\/([^/#]+)(?:#.*)?$/u)?.[1]
        return id
          ? `http://127.0.0.1:${server.address().port}/${id}.json`
          : dependency
      },
    )
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(JSON.stringify(item))
  } catch {
    response.writeHead(404).end()
  }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
try {
  await new Promise((resolve, reject) => {
    const child = spawn(
      process.platform === 'win32' ? 'npx.cmd' : 'npx',
      [
        '--yes',
        'shadcn@latest',
        'add',
        ...items.map(
          item => `http://127.0.0.1:${server.address().port}/${item}.json`,
        ),
        '--yes',
        '--overwrite',
      ],
      { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' },
    )
    child.on('error', reject)
    child.on('exit', code =>
      code === 0
        ? resolve()
        : reject(new Error('Registry install exited ' + code)),
    )
  })
  writeFileSync(
    path.join(root, 'crease-source.json'),
    JSON.stringify(
      {
        repository: 'https://github.com/Potti1234/creaseui',
        commit: sha,
        renderer: 'tailwind',
        registryItems: items,
        note: 'Installed from the reviewed PR 28 registry. Product components live in src/design. The registry foundation is not a completed strict lint release.',
      },
      null,
      2,
    ) + '\n',
  )
} finally {
  server.close()
}
