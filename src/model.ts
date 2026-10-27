import { Effect, Match as M, Schema as S } from 'effect'
import { Command, Dom, Subscription, type Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import type * as KeyValueStore from 'effect/unstable/persistence/KeyValueStore'

import { Issue, Status } from './domain'
import { DRAFT_ID, TITLE_ID, emptyDraft, initComposer, validateTitle } from './design/issue-composer'
import { type PickerContext, type PickerField, closedMenu, withProperty } from './design/property-picker'
import { type Flags, SaveIssues, SaveMessage } from './storage'
import * as Dialog from '@/ui/dialog'
import * as DropdownMenu from '@/ui/dropdown-menu'

export const View = S.Literals(['all', 'mine'])
export type View = typeof View.Type

export const Sort = S.Literals(['priority', 'newest'])
export type Sort = typeof Sort.Type

/** The one property menu that is open, or was last open. */
export const OpenPicker = S.Struct({ key: S.String, menu: DropdownMenu.Model })

export const SaveState = S.Literals(['saved', 'failed'])
export type SaveState = typeof SaveState.Type

export const Model = S.Struct({
  issues: S.Array(Issue),
  nextNumber: S.Number,
  view: View,
  query: S.String,
  isGrouped: S.Boolean,
  sort: Sort,
  collapsed: S.Array(Status),
  picker: S.NullOr(OpenPicker),
  composer: Dialog.Model,
  draft: Issue,
  titleError: S.NullOr(S.String),
  save: SaveState,
  /** Shown once at startup when saved data could not be read. */
  loadNotice: S.NullOr(S.String),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  SelectedView: { view: View },
  ChangedQuery: { query: S.String },
  ClearedQuery: {},
  ToggledGrouping: {},
  ToggledSort: {},
  ToggledGroup: { status: Status },
  GotPickerMessage: { key: S.String, message: DropdownMenu.Message },
  ClickedNewIssue: {},
  GotComposerMessage: { message: Dialog.Message },
  ChangedDraftTitle: { title: S.String },
  SubmittedComposer: {},
  CancelledComposer: {},
  CompletedFocusTitle: {},
  SucceededSave: {},
  FailedSave: { reason: S.String },
  RetriedSave: {},
  DismissedLoadNotice: {},
})
export type Message = typeof Message.Type

/** update's result; saving needs the KeyValueStore service. */
type Return = Update.Return<Model, Message, KeyValueStore.KeyValueStore>

export const init = (flags: Flags): Update.Return<Model, Message> => ({
  model: {
    issues: flags.issues,
    nextNumber: flags.nextNumber,
    view: 'all',
    query: '',
    isGrouped: true,
    sort: 'priority',
    collapsed: [],
    picker: null,
    composer: initComposer(),
    draft: emptyDraft,
    titleError: null,
    save: 'saved',
    loadNotice: flags.notice,
  },
})

const FIELDS: ReadonlyArray<PickerField> = ['status', 'priority', 'assignee']

/** The issue id and property a picker key names (`CRE-136--status`). */
const parseKey = (key: string): Readonly<{ id: string; field: PickerField }> | undefined => {
  const at = key.lastIndexOf('--')
  const field = FIELDS.find(each => each === key.slice(at + 2))
  return at < 0 || field === undefined ? undefined : { id: key.slice(0, at), field }
}

const menuOf = (model: Model, key: string): DropdownMenu.Model =>
  model.picker?.key === key ? model.picker.menu : closedMenu(key)

/** What the issue rows need to render and route their property pickers. */
export const pickersOf = (model: Model): PickerContext<Message> => ({
  menuFor: key => menuOf(model, key),
  toParentMessage: key => message => Message.GotPickerMessage({ key, message }),
})

const save = (model: Model) =>
  Command.mapMessages([SaveIssues({ issues: model.issues, nextNumber: model.nextNumber })], message =>
    message._tag === 'SucceededSave' ? Message.SucceededSave() : Message.FailedSave({ reason: message.reason }),
  )[0]!

export const FocusTitle = Command.define('FocusComposerTitle', {
  messages: [Message.CompletedFocusTitle],
  execute: Dom.focus(`#${TITLE_ID}`).pipe(Effect.ignore, Effect.as(Message.CompletedFocusTitle())),
})

const toComposer = (commands: ReadonlyArray<Command.Command<Dialog.Message>> | undefined) =>
  Command.mapMessages(commands, message => Message.GotComposerMessage({ message }))

const submit = (model: Model): Return => {
  if (!model.composer.isOpen) return { model }
  const checked = validateTitle(model.draft.title)
  if (!checked.ok) return { model: { ...model, titleError: checked.error }, commands: [FocusTitle()] }
  const created: Issue = { ...model.draft, id: `CRE-${model.nextNumber}`, title: checked.title, updated: 'Just now' }
  const closed = Dialog.close(model.composer)
  const next: Model = {
    ...model,
    issues: [created, ...model.issues],
    nextNumber: model.nextNumber + 1,
    draft: emptyDraft,
    titleError: null,
    composer: closed.model,
  }
  return { model: next, commands: [...toComposer(closed.commands), save(next)] }
}

export const update = (model: Model, message: Message): Return =>
  M.value(message).pipe(
    M.tagsExhaustive({
      SelectedView: ({ view }) => ({ model: { ...model, view, query: '' } }),
      ChangedQuery: ({ query }) => ({ model: { ...model, query } }),
      ClearedQuery: () => ({ model: { ...model, query: '' } }),
      ToggledGrouping: () => ({ model: { ...model, isGrouped: !model.isGrouped } }),
      ToggledSort: () => {
        const sort: Sort = model.sort === 'priority' ? 'newest' : 'priority'
        return { model: { ...model, sort } }
      },
      ToggledGroup: ({ status }) => ({
        model: {
          ...model,
          collapsed: model.collapsed.includes(status)
            ? model.collapsed.filter(each => each !== status)
            : [...model.collapsed, status],
        },
      }),
      GotPickerMessage: ({ key, message: menuMessage }) => {
        const result = DropdownMenu.update(menuOf(model, key), menuMessage)
        const target = parseKey(key)
        const chosen = result.outMessage
        const menuCommands = Command.mapMessages(result.commands, inner => Message.GotPickerMessage({ key, message: inner }))
        const withMenu: Model = { ...model, picker: { key, menu: result.model } }
        if (chosen === undefined || target === undefined) return { model: withMenu, commands: menuCommands }
        if (target.id === DRAFT_ID)
          return { model: { ...withMenu, draft: withProperty(model.draft, target.field, chosen.value) }, commands: menuCommands }
        const next: Model = {
          ...withMenu,
          issues: model.issues.map(issue => (issue.id === target.id ? withProperty(issue, target.field, chosen.value) : issue)),
        }
        return { model: next, commands: [...menuCommands, save(next)] }
      },
      ClickedNewIssue: () => {
        const opened = Dialog.open(model.composer)
        return { model: { ...model, composer: opened.model }, commands: toComposer(opened.commands) }
      },
      GotComposerMessage: ({ message: dialogMessage }) => {
        const result = Dialog.update(model.composer, dialogMessage)
        return { model: { ...model, composer: result.model }, commands: toComposer(result.commands) }
      },
      ChangedDraftTitle: ({ title }) => ({
        model: {
          ...model,
          draft: { ...model.draft, title },
          titleError: model.titleError === null || !validateTitle(title).ok ? model.titleError : null,
        },
      }),
      SubmittedComposer: () => submit(model),
      CancelledComposer: () => {
        const closed = Dialog.close(model.composer)
        return { model: { ...model, composer: closed.model }, commands: toComposer(closed.commands) }
      },
      CompletedFocusTitle: () => ({ model }),
      SucceededSave: () => ({ model: { ...model, save: 'saved' as const, loadNotice: null } }),
      FailedSave: () => ({ model: { ...model, save: 'failed' as const } }),
      RetriedSave: () => ({ model, commands: [save(model)] }),
      DismissedLoadNotice: () => ({ model: { ...model, loadNotice: null } }),
    }),
  )

export const subscriptions = Subscription.make<Model, Message>()(entry => ({
  composerShortcut: entry(
    { isComposerOpen: S.Boolean },
    {
      modelToDependencies: model => ({ isComposerOpen: model.composer.isOpen }),
      dependenciesToStream: ({ isComposerOpen }) =>
        Subscription.keyBindings<Message>({
          bindings: [{ keys: 'Mod+Enter', isEnabled: isComposerOpen, whileTyping: 'Allow', mapEvent: () => Message.SubmittedComposer() }],
        }),
    },
  ),
}))

export { SaveMessage }
