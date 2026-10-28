import { Dialog as DialogPrimitive } from '@foldkit/ui'
import { Story } from 'foldkit'
import { describe, expect, test } from 'vitest'

import { SEED } from '../src/domain'
import { validateTitle } from '../src/design/issue-composer'
import { ApplyTheme, FocusTitle, Message, type Model, init, teamIdOf, teamPage, update } from '../src/model'
import { SaveIssues, SaveMessage } from '../src/storage'
import * as DropdownMenu from '../src/ui/dropdown-menu'

/* Stories of update: Messages in, Model and Commands out. Every Command a
   step produces must be resolved, so a missing save fails the test. */

const start: Model = init({ issues: SEED, nextNumber: 143, isDark: false, notice: null }).model

const choose = (key: string, item: string, index: number) => [
  Story.message(Message.GotPickerMessage({ key, message: DropdownMenu.Message.Opened() })),
  Story.message(
    Message.GotPickerMessage({ key, message: DropdownMenu.Message.SelectedItem({ item, index, staysOpenOnSelect: false }) }),
  ),
]

const focusReturned = Story.Command.resolve(
  DropdownMenu.FocusTrigger,
  DropdownMenu.Message.CompletedFocusDropdownMenuTrigger(),
)

const openComposer = [
  Story.message(Message.ClickedNewIssue()),
  Story.Command.resolve(DialogPrimitive.ShowDialog, DialogPrimitive.Message.SucceededShowDialog()),
]

const issue = (model: Model, id: string) => model.issues.find(each => each.id === id)

describe('changing a property in place', () => {
  test('commits at once and saves', () =>
    Story.story(
      update,
      Story.given(start),
      ...choose('CRE-131--status', 'in_progress', 2),
      Story.model(model => expect(issue(model, 'CRE-131')?.status).toBe('in_progress')),
      focusReturned,
      Story.Command.expectHas(SaveIssues),
      Story.Command.resolve(SaveIssues, SaveMessage.SucceededSave()),
      Story.model(model => expect(model.save).toBe('saved')),
    ))

  test('a failed save keeps the change and offers Retry, which saves again', () =>
    Story.story(
      update,
      Story.given(start),
      ...choose('CRE-131--priority', 'urgent', 0),
      focusReturned,
      Story.Command.resolve(SaveIssues, SaveMessage.FailedSave({ reason: 'QuotaExceededError' })),
      Story.model(model => {
        expect(model.save).toBe('failed')
        expect(issue(model, 'CRE-131')?.priority).toBe('urgent')
      }),
      Story.message(Message.RetriedSave()),
      Story.Command.resolve(SaveIssues, SaveMessage.SucceededSave()),
      Story.model(model => expect(model.save).toBe('saved')),
    ))
})

describe('creating an issue', () => {
  test('an empty title shows an error and focuses the title; nothing is created', () =>
    Story.story(
      update,
      Story.given(start),
      ...openComposer,
      Story.message(Message.SubmittedComposer()),
      Story.Command.resolve(FocusTitle, Message.CompletedFocusTitle()),
      Story.model(model => {
        expect(model.titleError).toBe('Give the issue a title.')
        expect(model.issues).toHaveLength(SEED.length)
      }),
    ))

  test('closing the composer keeps the draft (D8)', () =>
    Story.story(
      update,
      Story.given(start),
      ...openComposer,
      Story.message(Message.ChangedDraftTitle({ title: 'Half-written idea' })),
      Story.message(Message.CancelledComposer()),
      Story.Command.resolve(DialogPrimitive.CloseDialog, DialogPrimitive.Message.CompletedCloseDialog()),
      Story.model(model => {
        expect(model.composer.isOpen).toBe(false)
        expect(model.draft.title).toBe('Half-written idea')
      }),
    ))

  test('a valid draft becomes the next issue, the draft clears and the issues are saved', () =>
    Story.story(
      update,
      Story.given(start),
      ...openComposer,
      Story.message(Message.ChangedDraftTitle({ title: '  Show a toast after creating an issue  ' })),
      Story.message(Message.SubmittedComposer()),
      Story.Command.resolve(DialogPrimitive.CloseDialog, DialogPrimitive.Message.CompletedCloseDialog()),
      Story.Command.resolve(SaveIssues, SaveMessage.SucceededSave()),
      Story.model(model => {
        expect(model.issues[0]).toMatchObject({ id: 'CRE-143', title: 'Show a toast after creating an issue', status: 'todo' })
        expect(model.nextNumber).toBe(144)
        expect(model.draft.title).toBe('')
      }),
    ))
})

describe('a team page', () => {
  test('a new issue created there belongs to that team', () =>
    Story.story(
      update,
      Story.given(start),
      Story.message(Message.SelectedView({ view: 'team:des' })),
      ...openComposer,
      Story.message(Message.ChangedDraftTitle({ title: 'Darker hover on board cards' })),
      Story.message(Message.SubmittedComposer()),
      Story.Command.resolve(DialogPrimitive.CloseDialog, DialogPrimitive.Message.CompletedCloseDialog()),
      Story.Command.resolve(SaveIssues, SaveMessage.SucceededSave()),
      Story.model(model => expect(model.issues[0]).toMatchObject({ id: 'CRE-143', teamId: 'des' })),
    ))

  test('a new issue created on its board belongs to that team too', () =>
    Story.story(
      update,
      Story.given(start),
      Story.message(Message.SelectedView({ view: 'board:eng' })),
      ...openComposer,
      Story.message(Message.ChangedDraftTitle({ title: 'Cards keep their column width' })),
      Story.message(Message.SubmittedComposer()),
      Story.Command.resolve(DialogPrimitive.CloseDialog, DialogPrimitive.Message.CompletedCloseDialog()),
      Story.Command.resolve(SaveIssues, SaveMessage.SucceededSave()),
      Story.model(model => expect(model.issues[0]).toMatchObject({ id: 'CRE-143', teamId: 'eng' })),
    ))

  test('changing a status on the board moves the issue and saves', () =>
    Story.story(
      update,
      Story.given(start),
      Story.message(Message.SelectedView({ view: 'board:eng' })),
      ...choose('CRE-124--status', 'in_progress', 2),
      focusReturned,
      Story.Command.resolve(SaveIssues, SaveMessage.SucceededSave()),
      Story.model(model => {
        expect(model.view).toBe('board:eng')
        expect(issue(model, 'CRE-124')?.status).toBe('in_progress')
      }),
    ))
})

describe('a team board', () => {
  // What the sidebar's links do: select the view.
  const viaLink = (from: Model, view: Model['view']): Model => update(from, Message.SelectedView({ view })).model
  const onEngineering = viaLink(start, 'team:eng')

  test("the Layout switch opens the same view as the sidebar's Board link", () =>
    Story.story(
      update,
      Story.given(onEngineering),
      Story.message(Message.ToggledLayout()),
      Story.model(model => {
        expect(model.view).toBe('board:eng')
        expect(model).toEqual(viaLink(onEngineering, 'board:eng'))
      }),
    ))

  test("on a board, the Layout switch opens the same view as the sidebar's Issues link", () =>
    Story.story(
      update,
      Story.given(viaLink(start, 'board:des')),
      Story.message(Message.ToggledLayout()),
      Story.model(model => {
        expect(model.view).toBe('team:des')
        expect(model).toEqual(viaLink(viaLink(start, 'board:des'), 'team:des'))
      }),
    ))

  test('the Layout switch does nothing on a page that is not a team page', () =>
    Story.story(
      update,
      Story.given(start),
      Story.message(Message.ToggledLayout()),
      Story.model(model => expect(model).toEqual(start)),
    ))

  test('the Board link leaves a search and an open issue, like every other link', () =>
    Story.story(
      update,
      Story.given(start),
      Story.message(Message.ChangedQuery({ query: 'focus' })),
      Story.message(Message.OpenedIssue({ id: 'CRE-142' })),
      Story.message(Message.SelectedView({ view: 'board:eng' })),
      Story.model(model => expect(model).toMatchObject({ view: 'board:eng', query: '', openIssueId: null })),
    ))

  test("a card's title opens the issue page; closing it returns to the board", () =>
    Story.story(
      update,
      Story.given(viaLink(start, 'board:eng')),
      Story.message(Message.OpenedIssue({ id: 'CRE-136' })),
      Story.model(model => expect(model).toMatchObject({ view: 'board:eng', openIssueId: 'CRE-136' })),
      Story.message(Message.ClosedIssue()),
      Story.model(model => expect(model).toMatchObject({ view: 'board:eng', openIssueId: null })),
    ))

  test('teamPage names each team page in each layout', () => {
    expect([teamPage('eng', 'list'), teamPage('eng', 'board'), teamPage('des', 'list'), teamPage('des', 'board')]).toEqual([
      'team:eng',
      'board:eng',
      'team:des',
      'board:des',
    ])
  })
})

describe('teamIdOf', () => {
  test.each([
    ['team:eng', 'eng'],
    ['board:eng', 'eng'],
    ['team:des', 'des'],
    ['board:des', 'des'],
    ['all', undefined],
    ['urgent', undefined],
  ] as const)('%s belongs to %s', (view, teamId) => expect(teamIdOf(view)).toBe(teamId))
})

describe('the issue page', () => {
  test('an empty title is not saved; the issue keeps its last valid title', () =>
    Story.story(
      update,
      Story.given(start),
      Story.message(Message.OpenedIssue({ id: 'CRE-142' })),
      Story.message(Message.ChangedIssueTitle({ title: '   ' })),
      Story.Command.expectNone(),
      Story.model(model => {
        expect(model.issueTitleError).toBe('Give the issue a title.')
        expect(issue(model, 'CRE-142')?.title).toBe('Keyboard focus is lost after changing an issue status')
      }),
    ))

  test('a valid title and a description are saved as they are typed', () =>
    Story.story(
      update,
      Story.given(start),
      Story.message(Message.OpenedIssue({ id: 'CRE-142' })),
      Story.message(Message.ChangedIssueTitle({ title: 'Focus returns to the status glyph' })),
      Story.Command.resolve(SaveIssues, SaveMessage.SucceededSave()),
      Story.message(Message.ChangedIssueDescription({ description: 'Seen in Firefox too.' })),
      Story.Command.resolve(SaveIssues, SaveMessage.SucceededSave()),
      Story.model(model => {
        expect(model.issueTitleError).toBeNull()
        expect(issue(model, 'CRE-142')).toMatchObject({ title: 'Focus returns to the status glyph', description: 'Seen in Firefox too.' })
      }),
    ))

  test('choosing a list closes the issue page', () =>
    Story.story(
      update,
      Story.given(start),
      Story.message(Message.OpenedIssue({ id: 'CRE-142' })),
      Story.message(Message.SelectedView({ view: 'mine' })),
      Story.model(model => expect(model.openIssueId).toBeNull()),
    ))
})

describe('shortcuts and the theme', () => {
  test('C opens the composer, and does nothing while a dialog is open', () =>
    Story.story(
      update,
      Story.given(start),
      Story.message(Message.PressedNewIssueKey()),
      Story.Command.resolve(DialogPrimitive.ShowDialog, DialogPrimitive.Message.SucceededShowDialog()),
      Story.model(model => expect(model.composer.isOpen).toBe(true)),
      Story.message(Message.PressedNewIssueKey()),
      Story.Command.expectNone(),
    ))

  test('switching the theme applies it and saves the choice', () =>
    Story.story(
      update,
      Story.given(start),
      Story.message(Message.ToggledTheme()),
      Story.Command.resolve(ApplyTheme, Message.AppliedTheme()),
      Story.Command.resolve(SaveIssues, SaveMessage.SucceededSave()),
      Story.model(model => expect(model.isDark).toBe(true)),
    ))
})

describe('validateTitle', () => {
  test.each([
    ['', false],
    ['   ', false],
    ['A', true],
    ['x'.repeat(200), true],
    ['x'.repeat(201), false],
  ])('%j is valid: %s', (title, valid) => expect(validateTitle(title).ok).toBe(valid))
})
