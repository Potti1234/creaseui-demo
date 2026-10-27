import { describe, expect, test } from 'vitest'

import { type Issue, SEED, isOpenBug } from '../src/domain'

/* The Bugs view lists, and its sidebar entry counts, open issues labelled Bug. */

const sample: Issue = SEED[0]!

describe('isOpenBug', () => {
  test('keeps open issues labelled Bug, among other labels too', () => {
    expect(isOpenBug({ ...sample, status: 'todo', labels: ['Bug'] })).toBe(true)
    expect(isOpenBug({ ...sample, status: 'in_review', labels: ['Design', 'Bug'] })).toBe(true)
  })

  test('leaves out done bugs and issues without the label', () => {
    expect(isOpenBug({ ...sample, status: 'done', labels: ['Bug'] })).toBe(false)
    expect(isOpenBug({ ...sample, status: 'todo', labels: ['Feature'] })).toBe(false)
    expect(isOpenBug({ ...sample, status: 'todo', labels: [] })).toBe(false)
  })

  test('the sample has two open bugs', () => {
    expect(SEED.filter(isOpenBug).map(issue => issue.id)).toEqual(['CRE-142', 'CRE-136'])
  })
})
