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

await check('D1: a long title is cut with an ellipsis at 900px', async () => {
  await page.setViewportSize({ width: 900, height: 800 })
  const title = await page.locator('a[href="#CRE-136"] [data-slot=text]').evaluate(text => ({
    ellipsis: getComputedStyle(text).textOverflow === 'ellipsis',
    cut: text.scrollWidth > text.clientWidth,
  }))
  await page.setViewportSize({ width: 1280, height: 800 })
  expect(title.ellipsis && title.cut, `title: ${JSON.stringify(title)}`)
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

const heading = async () => {
  await page.waitForTimeout(150)
  return page.locator('[data-slot=heading]').first().innerText()
}

await check('Navigation: a team page and a saved view list only their issues', async () => {
  await fresh()
  await page.getByRole('button', { name: 'Issues', exact: true }).nth(1).click()
  expect((await heading()) === 'Design · Issues', `heading is ${await heading()}`)
  const designRows = await page.locator('a[href^="#CRE-"]').count()
  await page.getByRole('button', { name: 'Unassigned' }).click()
  expect((await heading()) === 'Unassigned', 'Unassigned did not open')
  const unassigned = await page.locator('a[href^="#CRE-"]').count()
  expect(designRows === 4 && unassigned > 0, `rows: Design ${designRows}, Unassigned ${unassigned}`)
})

// The board (design-system change 008, decision D12).
const sidebarLink = (name, team = 0) => page.getByRole('button', { name, exact: true }).nth(team)
const isActive = async locator => (await locator.getAttribute('data-active')) !== null
const columns = () => page.locator('section', { has: page.locator('[data-slot=item][data-layout=inline]') })
const board = () => page.locator('[data-slot=stack]', { has: columns() }).last()
const COLUMN_NAMES = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done']
const columnHeaders = async () => (await columns().evaluateAll(sections => sections.map(section => section.innerText.split('\n')[0])))
/* The parts of the issue's row or card, in document order: pickers by field,
   the title link, labels, and texts (identifier, date). */
const partsOf = id =>
  page.locator('[data-slot=item]', { has: page.locator(`[id="${id}--status-trigger"]`) }).last().evaluate(item => {
    const selector = '[id$="-trigger"], a[href^="#CRE-"], [data-slot=badge], [data-slot=text]'
    return [...item.querySelectorAll(selector)]
      .filter(part => !part.parentElement.closest(selector))
      .map(part => (part.id.endsWith('-trigger') ? part.id.split('--')[1] : part.matches('a') ? 'title' : part.matches('[data-slot=badge]') ? `label ${part.innerText}` : part.innerText))
      .join(' | ')
  })
let boardViaLink = ''

await check("Board: the sidebar's Board link opens the board, one column per status, and is marked active", async () => {
  await fresh()
  await sidebarLink('Board').click()
  expect((await heading()) === 'Engineering · Board', `heading is ${await heading()}`)
  const headers = await columnHeaders()
  expect(headers.join(',') === COLUMN_NAMES.join(','), `columns: ${headers.join(', ')}`)
  expect(await isActive(sidebarLink('Board')), 'Board link not marked active')
  expect(!(await isActive(sidebarLink('Issues'))), 'Issues link still marked active')
  boardViaLink = await board().innerText()
})

await check('Board: the Layout switch opens the same view as the Board link, and the sidebar follows', async () => {
  await sidebarLink('Issues').click()
  expect((await heading()) === 'Engineering · Issues', `heading is ${await heading()}`)
  await page.getByRole('button', { name: 'Layout: List' }).click()
  expect((await heading()) === 'Engineering · Board', `heading is ${await heading()}`)
  expect((await board().innerText()) === boardViaLink, 'the board differs from the one the Board link opens')
  expect(await isActive(sidebarLink('Board')), 'Board link not marked active')
  expect(!(await isActive(sidebarLink('Issues'))), 'Issues link still marked active')
  await page.getByRole('button', { name: 'Layout: Board' }).click()
  expect((await heading()) === 'Engineering · Issues', `heading is ${await heading()}`)
  expect(await isActive(sidebarLink('Issues')), 'Issues link not marked active')
  expect(!(await isActive(sidebarLink('Board'))), 'Board link still marked active')
  await sidebarLink('Board').click()
})

await check('Board: at 1280px all five columns are visible, and nothing scrolls sideways', async () => {
  await page.setViewportSize({ width: 1280, height: 800 })
  const measured = await board().evaluate(region => ({
    page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    board: region.scrollWidth - region.clientWidth,
    right: region.getBoundingClientRect().right,
    columns: [...region.querySelectorAll(':scope > section')].map(section => section.getBoundingClientRect()).map(box => ({ left: Math.round(box.left), right: Math.round(box.right), width: Math.round(box.width) })),
  }))
  expect(measured.page <= 0, `page scrolls ${measured.page}px sideways`)
  expect(measured.board <= 0, `board scrolls ${measured.board}px sideways`)
  expect(measured.columns.length === 5, `${measured.columns.length} columns`)
  expect(measured.columns.every(box => box.left >= 0 && box.right <= Math.min(measured.right, 1280) + 1), `columns at ${measured.columns.map(box => `${box.left}-${box.right}`).join(', ')}`)
  expect(new Set(measured.columns.map(box => box.width)).size === 1, `column widths ${measured.columns.map(box => box.width).join(', ')}`)
})

await check('Board: below the column minimum the board scrolls in its own region, the page never does', async () => {
  const sizes = []
  for (const width of [900, 480]) {
    await page.setViewportSize({ width, height: 800 })
    await page.waitForTimeout(100)
    sizes.push(
      await board().evaluate(region => ({
        page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        board: region.scrollWidth - region.clientWidth,
        narrowest: Math.min(...[...region.querySelectorAll(':scope > section')].map(section => Math.round(section.getBoundingClientRect().width))),
      })),
    )
  }
  await page.setViewportSize({ width: 1280, height: 800 })
  expect(sizes.every(size => size.page <= 0), `page scrolls sideways: ${sizes.map(size => size.page).join(', ')}px`)
  expect(sizes.every(size => size.board > 0), 'board does not scroll in its region')
  expect(sizes.every(size => size.narrowest >= 176), `a column is ${Math.min(...sizes.map(size => size.narrowest))}px, under the 176px minimum`)
})

await check("D12: a card has the row's parts in the row's order; only the title and labels wrap", async () => {
  const onCard = await partsOf('CRE-136')
  const firstLine = await page.locator('article[data-slot=item]', { has: page.locator('[id="CRE-136--status-trigger"]') }).locator('[data-slot=item-header]').evaluate(line => Math.round(line.getBoundingClientRect().height))
  const title = await page.locator('article[data-slot=item]').getByRole('link', { name: /Very long issue titles/ }).evaluate(link => Math.round(link.getBoundingClientRect().height))
  await sidebarLink('Issues').click()
  const inRow = await partsOf('CRE-136')
  await sidebarLink('Board').click()
  expect(onCard === inRow, `card: ${onCard} / row: ${inRow}`)
  expect(firstLine <= 28, `the first line is ${firstLine}px tall`)
  expect(title > 20, 'a long title does not wrap on a card')
})

await check('D7 on a board: a status change on a card moves it to its column, focus returns to its glyph', async () => {
  await page.locator('[id="CRE-124--status-trigger"]').click()
  await page.getByRole('menuitemradio', { name: 'In Review' }).click()
  await page.waitForTimeout(150)
  expect((await label('[id="CRE-124--status-trigger"]')) === 'Status: In Review', 'status not changed')
  const column = await columns().filter({ has: page.locator('[id="CRE-124--status-trigger"]') }).first().innerText()
  expect(column.startsWith('In Review'), `card is in ${column.split('\n')[0]}`)
  expect((await focused()) === 'CRE-124--status-trigger', `focus on "${await focused()}"`)
})

await check('The row title opens the issue page; an empty title is refused, a valid one saved', async () => {
  await fresh()
  await page.getByRole('link', { name: 'Undo for a status change' }).click()
  expect((await heading()).endsWith('CRE-124'), 'issue page did not open')
  const title = page.getByRole('textbox', { name: 'Title' })
  await title.fill('')
  await page.getByText('Give the issue a title.').waitFor({ timeout: 2000 }).catch(() => {})
  expect((await page.getByText('Give the issue a title.').count()) === 1, 'no error for an empty title')
  await title.fill('Undo the last status change')
  await page.waitForTimeout(150)
  await page.getByRole('button', { name: 'All issues' }).first().click()
  await page.reload({ waitUntil: 'networkidle' })
  expect((await page.getByRole('link', { name: 'Undo the last status change' }).count()) === 1, 'new title not kept')
})

await check('D9: Ctrl+K finds a place by name; C opens the composer', async () => {
  await fresh()
  await page.keyboard.press('Control+K')
  await page.keyboard.type('urgent')
  await page.waitForTimeout(150)
  await page.keyboard.press('Enter')
  expect((await heading()) === 'Urgent & high', `heading is ${await heading()}`)
  await page.locator('[data-slot=heading]').first().click()
  await page.keyboard.press('c')
  await page.waitForTimeout(200)
  expect((await page.locator('#composer-title').count()) === 1 && (await focused()) === 'composer-title', 'C did not open the composer')
  await page.keyboard.press('Escape')
})

await check('Dark theme: the sidebar turns dark too, and the choice survives a reload', async () => {
  await fresh()
  await page.getByRole('button', { name: 'Use dark theme' }).click()
  await page.reload({ waitUntil: 'networkidle' })
  const dark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
  const sidebar = await page.locator('[data-slot=sidebar-inner], [data-slot=sidebar]').first().evaluate(element => getComputedStyle(element).backgroundColor)
  const lightness = Number(/oklch\(([\d.]+)/.exec(sidebar)?.[1] ?? /\d+/.exec(sidebar)?.[0] ?? 1)
  await page.getByRole('button', { name: 'Use light theme' }).click()
  expect(dark, 'dark theme not kept after reload')
  expect(lightness < 0.5, `sidebar background is ${sidebar}`)
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
