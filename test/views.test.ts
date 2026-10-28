import { describe, expect, test } from 'vitest'

import { SEED } from '../src/domain'
import { savedViewOf } from '../src/features/views'

describe('Active bugs', () => {
  test('lists issues labelled Bug that are in Todo, In Progress or In Review', () => {
    const saved = savedViewOf('active-bugs')
    expect(saved?.label).toBe('Active bugs')
    const ids = SEED.filter(issue => saved?.matches(issue) === true).map(issue => issue.id)
    expect(ids).toEqual(['CRE-142', 'CRE-136'])
  })

  test('leaves out bugs in Backlog or Done', () => {
    const matches = savedViewOf('active-bugs')?.matches
    const bug = SEED[0]
    expect(bug.labels).toContain('Bug')
    expect(matches?.({ ...bug, status: 'backlog' })).toBe(false)
    expect(matches?.({ ...bug, status: 'done' })).toBe(false)
    expect(matches?.({ ...bug, status: 'todo' })).toBe(true)
  })
})
