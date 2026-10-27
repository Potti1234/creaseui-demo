// The browser check: drives the running app in Chromium and checks what only
// a browser can show. Start the app first (`npm run dev`), then run
// `npm run check:browser`. BASE_URL overrides the address.
import { chromium } from 'playwright'

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:5197/'
const results = []

const check = async (name, run) => {
  try {
    await run()
    results.push({ name, ok: true })
    console.log(`✓ ${name}`)
  } catch (error) {
    results.push({ name, ok: false })
    console.log(`✗ ${name}\n    ${String(error.message ?? error).split('\n')[0]}`)
  }
}

const expect = (condition, message) => {
  if (!condition) throw new Error(message)
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await context.newPage()
const errors = []
page.on('pageerror', error => errors.push(String(error)))
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text())
})

const fresh = async () => {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
}
const label = selector => page.locator(selector).getAttribute('aria-label')
const focused = () => page.evaluate(() => document.activeElement?.id ?? '')

await fresh()

await check('D1: at 900px every row is 36px and nothing scrolls sideways', async () => {
  await page.setViewportSize({ width: 900, height: 800 })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  const heights = await page.locator('[data-slot=item][data-layout=inline]').evaluateAll(rows => rows.map(row => Math.round(row.getBoundingClientRect().height)))
  await page.setViewportSize({ width: 1280, height: 800 })
  expect(overflow <= 0, `page scrolls ${overflow}px sideways`)
  expect(heights.length > 0 && heights.every(height => height === 36), `row heights: ${[...new Set(heights)].join(', ')}`)
})

await check('D1: search results stay on one line on a 480px phone screen', async () => {
  await page.setViewportSize({ width: 480, height: 800 })
  await page.fill('#search', 'issue')
  await page.locator('[data-slot=item][data-layout=inline]').first().waitFor()
  const rows = await page.locator('[data-slot=item][data-layout=inline]').evaluateAll(items =>
    items.map(row => ({ height: Math.round(row.getBoundingClientRect().height), lines: [...row.querySelectorAll('[data-slot=text]')].map(text => Math.round(text.getBoundingClientRect().height)) })),
  )
  await page.fill('#search', '')
  await page.setViewportSize({ width: 1280, height: 800 })
  expect(rows.length > 0, 'no results')
  expect(rows.every(row => row.height === 36), `row heights: ${[...new Set(rows.map(row => row.height))].join(', ')}`)
  expect(rows.every(row => row.lines.every(height => height <= 20)), 'a text part wraps onto a second line')
})

await check('D3: search results use the same row as the list', async () => {
  const inList = await page.locator('[data-slot=item][data-layout=inline]').first().evaluate(row => [...row.children].map(child => child.getAttribute('data-slot')).join(' '))
  await page.fill('#search', 'focus')
  await page.locator('[data-slot=item][data-layout=inline]').first().waitFor()
  const inSearch = await page.locator('[data-slot=item][data-layout=inline]').first().evaluate(row => [...row.children].map(child => child.getAttribute('data-slot')).join(' '))
  await page.fill('#search', '')
  expect(inList === inSearch, `list: ${inList} / search: ${inSearch}`)
})

await check('D7: a status changes in place, the issue regroups, focus returns to its glyph', async () => {
  await page.locator('[id="CRE-131--status-trigger"]').click()
  await page.getByRole('menuitemradio', { name: 'In Progress' }).click()
  await page.waitForTimeout(150)
  expect((await label('[id="CRE-131--status-trigger"]')) === 'Status: In Progress', 'status not changed')
  const group = await page.locator('section', { has: page.locator('[id="CRE-131--status-trigger"]') }).first().innerText()
  expect(group.startsWith('In Progress'), 'issue did not move to In Progress')
  expect((await focused()) === 'CRE-131--status-trigger', `focus on "${await focused()}"`)
})

await check('D8: an empty title is refused, with the error at the field and focus on it', async () => {
  await page.click('#new-issue')
  await page.waitForTimeout(150)
  expect((await focused()) === 'composer-title', 'title not focused on open')
  await page.getByRole('button', { name: 'Create issue' }).click()
  await page.waitForTimeout(150)
  expect((await page.locator('[data-slot=field-error]').innerText()) === 'Give the issue a title.', 'no error')
  expect((await focused()) === 'composer-title', 'focus not on the title')
})

await check('D8: closing keeps the draft, Ctrl+Enter creates the next issue', async () => {
  await page.fill('#composer-title', 'Show a toast after creating an issue')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  expect((await page.locator('#new-issue').innerText()) === 'New issue (draft)', 'draft not shown on the button')
  await page.click('#new-issue')
  await page.waitForTimeout(150)
  expect((await page.inputValue('#composer-title')) === 'Show a toast after creating an issue', 'draft lost')
  await page.keyboard.press('Control+Enter')
  await page.waitForTimeout(250)
  expect((await page.locator('dialog[open]').count()) === 0, 'composer still open')
  expect((await page.locator('[id="CRE-143--status-trigger"]').count()) === 1, 'CRE-143 not created')
})

await check('Changes survive a reload', async () => {
  await page.reload({ waitUntil: 'networkidle' })
  expect((await page.locator('[id="CRE-143--status-trigger"]').count()) === 1, 'CRE-143 gone')
  expect((await label('[id="CRE-131--status-trigger"]')) === 'Status: In Progress', 'status change gone')
})

await check('A refused save shows SaveNotice; Retry saves once storage works again', async () => {
  await page.evaluate(() => {
    window.__setItem = Storage.prototype.setItem
    Storage.prototype.setItem = () => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    }
  })
  await page.locator('[id="CRE-128--priority-trigger"]').click()
  await page.getByRole('menuitemradio', { name: 'Urgent' }).click()
  await page.waitForTimeout(200)
  expect((await page.locator('[data-slot=alert-title]').innerText()) === 'Your last change was not saved', 'no notice')
  await page.evaluate(() => {
    Storage.prototype.setItem = window.__setItem
  })
  await page.getByRole('button', { name: 'Retry' }).click()
  await page.waitForTimeout(200)
  expect((await page.locator('[data-slot=alert-title]').count()) === 0, 'notice still shown')
})

await check('Unreadable saved data falls back to the sample, with a notice', async () => {
  await page.evaluate(() => localStorage.setItem('crease-tasks/v1', '{"version":1,"issues":"broken"}'))
  await page.reload({ waitUntil: 'networkidle' })
  expect((await page.locator('[data-slot=alert-title]').innerText()) === 'Saved issues could not be read', 'no load notice')
  await page.evaluate(() => localStorage.clear())
})

// The board (change 008, decision D12). The board is the element that holds
// the five column sections.
const STATUS_ORDER = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done']
const measureBoard = () =>
  page.evaluate(() => {
    const columns = [...document.querySelectorAll('section')]
    const board = columns[0]?.parentElement
    const area = board?.getBoundingClientRect()
    return {
      titles: columns.map(column => column.innerText.split('\n')[0]),
      widths: columns.map(column => Math.round(column.getBoundingClientRect().width)),
      outside: columns.filter(column => column.getBoundingClientRect().right > Math.min(area.right, window.innerWidth) + 0.5).length,
      boardOverflow: board.scrollWidth - board.clientWidth,
      boardScrolls: getComputedStyle(board).overflowX === 'auto',
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  })

await check('Board: the layout toggle shows All issues as one column per status, in workflow order', async () => {
  await fresh()
  await page.getByRole('button', { name: 'Layout: List' }).click()
  await page.waitForTimeout(150)
  expect((await page.getByRole('button', { name: 'Layout: Board' }).count()) === 1, 'toggle does not say Layout: Board')
  expect((await page.getByRole('button', { name: /grouped/i }).count()) === 0, 'grouping control shown on the board')
  const { titles } = await measureBoard()
  expect(titles.join('|') === STATUS_ORDER.join('|'), `columns: ${titles.join(', ')}`)
})

await check('Board: at 1280px all five columns are visible and nothing scrolls sideways', async () => {
  await page.setViewportSize({ width: 1280, height: 800 })
  const board = await measureBoard()
  expect(board.pageOverflow <= 0, `page scrolls ${board.pageOverflow}px sideways`)
  expect(board.boardOverflow <= 0, `board scrolls ${board.boardOverflow}px sideways`)
  expect(board.outside === 0, `${board.outside} column(s) cut off or hidden`)
  expect(new Set(board.widths).size === 1, `column widths differ: ${board.widths.join(', ')}`)
})

await check('Board: below the minimum column width the board scrolls in its own region, the page does not', async () => {
  await page.setViewportSize({ width: 900, height: 800 })
  const board = await measureBoard()
  await page.setViewportSize({ width: 1280, height: 800 })
  expect(board.pageOverflow <= 0, `page scrolls ${board.pageOverflow}px sideways`)
  expect(board.boardScrolls && board.boardOverflow > 0, 'board does not scroll in its own region')
  expect(board.widths.every(width => width >= 180), `columns narrower than the minimum: ${board.widths.join(', ')}`)
})

await check('D7 on the board: a status change moves the card to its column, focus returns to its glyph', async () => {
  await page.locator('[id="CRE-131--status-trigger"]').click()
  await page.getByRole('menuitemradio', { name: 'In Review' }).click()
  await page.waitForTimeout(150)
  expect((await label('[id="CRE-131--status-trigger"]')) === 'Status: In Review', 'status not changed')
  const column = await page.locator('section', { has: page.locator('[id="CRE-131--status-trigger"]') }).first().innerText()
  expect(column.startsWith('In Review'), `card is in the "${column.split('\n')[0]}" column`)
  expect((await focused()) === 'CRE-131--status-trigger', `focus on "${await focused()}"`)
})

await check('Component: an inline item keeps text in its content on one 36px line in a 240px column', async () => {
  await page.goto(new URL('component-check.html', BASE_URL).href, { waitUntil: 'networkidle' })
  const row = page.locator('[data-slot=item][data-layout=inline]')
  await row.waitFor()
  const height = Math.round((await row.boundingBox()).height)
  const lines = await row.locator('[data-slot=text]').evaluateAll(texts => texts.map(text => Math.round(text.getBoundingClientRect().height)))
  expect(height === 36, `row is ${height}px`)
  expect(lines.every(line => line <= 20), `a text part is ${Math.max(...lines)}px tall`)
})

await check('No errors in the console', async () => {
  expect(errors.length === 0, errors.join(' | '))
})

await browser.close()
const failed = results.filter(result => !result.ok).length
console.log(failed === 0 ? `browser check: ${results.length} of ${results.length} passed` : `browser check: ${failed} of ${results.length} failed`)
process.exit(failed === 0 ? 0 : 1)
