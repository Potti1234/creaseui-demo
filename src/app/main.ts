import { Schema as S } from 'effect'
import { Command, Runtime } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'

import { badge, type BadgeVariant } from '@/ui/pleat/badge'
import { button } from '@/ui/pleat/button'
import { card, cardContent } from '@/ui/pleat/card'
import { layoutStyle } from '@/ui/pleat/contracts'
import * as Dialog from '@/ui/pleat/dialog'
import {
  empty,
  emptyContent,
  emptyDescription,
  emptyHeader,
  emptyTitle,
} from '@/ui/pleat/empty'
import { fieldGroup } from '@/ui/pleat/field'
import { heading } from '@/ui/pleat/heading'
import { input } from '@/ui/pleat/input'
import { nativeSelect } from '@/ui/pleat/native-select'
import { section } from '@/ui/pleat/section'
import { hStack, vStack } from '@/ui/pleat/stack'
import {
  table,
  tableBody,
  tableCell,
  tableHead,
  tableHeader,
  tableRow,
} from '@/ui/pleat/table'
import { text } from '@/ui/pleat/text'

const Role = S.Literals(['Admin', 'Member', 'Viewer'])
type Role = typeof Role.Type
const roles: ReadonlyArray<Role> = ['Admin', 'Member', 'Viewer']

const Status = S.Literals(['Active', 'Invited', 'Suspended'])
type Status = typeof Status.Type

const Member = S.Struct({
  id: S.Number,
  name: S.String,
  email: S.String,
  role: Role,
  status: Status,
})
type Member = typeof Member.Type

const Model = S.Struct({
  members: S.Array(Member),
  search: S.String,
  nextId: S.Number,
  inviteEmail: S.String,
  inviteRole: Role,
  inviteDialog: Dialog.Model,
})
type Model = typeof Model.Type

const Message = defineMessageUnion({
  ChangedSearch: { value: S.String },
  ClickedClearSearch: {},
  ClickedInviteMember: {},
  ChangedInviteEmail: { value: S.String },
  ChangedInviteRole: { value: S.String },
  ClickedCancelInvite: {},
  ClickedSendInvite: {},
  GotInviteDialogMessage: { message: Dialog.Message },
})
type Message = typeof Message.Type

const initialMembers: ReadonlyArray<Member> = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@acme.io', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Grace Hopper', email: 'grace@acme.io', role: 'Member', status: 'Active' },
  { id: 3, name: 'Alan Turing', email: 'alan@acme.io', role: 'Member', status: 'Invited' },
  { id: 4, name: 'Katherine Johnson', email: 'katherine@acme.io', role: 'Viewer', status: 'Active' },
  { id: 5, name: 'Linus Torvalds', email: 'linus@acme.io', role: 'Member', status: 'Suspended' },
  { id: 6, name: 'Margaret Hamilton', email: 'margaret@acme.io', role: 'Admin', status: 'Active' },
]

const isRole = (value: string): value is Role =>
  roles.some(role => role === value)

const nameFromEmail = (email: string): string => email.split('@')[0] ?? email

const filteredMembers = (model: Model): ReadonlyArray<Member> => {
  const query = model.search.trim().toLowerCase()
  return query === ''
    ? model.members
    : model.members.filter(
        member =>
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query),
      )
}

const toDialogMessage = (message: Dialog.Message): Message =>
  Message.GotInviteDialogMessage({ message })

const withDialog = (
  model: Model,
  result: ReturnType<typeof Dialog.update>,
) => ({
  model: { ...model, inviteDialog: result.model },
  commands: Command.mapMessages(result.commands, toDialogMessage),
})

const resetInvite = (model: Model): Model => ({
  ...model,
  inviteEmail: '',
  inviteRole: 'Member',
})

const update = (model: Model, message: Message) =>
  Message.match(message, {
    ChangedSearch: ({ value }) => ({ model: { ...model, search: value } }),
    ClickedClearSearch: () => ({ model: { ...model, search: '' } }),
    ClickedInviteMember: () =>
      withDialog(resetInvite(model), Dialog.open(model.inviteDialog)),
    ChangedInviteEmail: ({ value }) => ({
      model: { ...model, inviteEmail: value },
    }),
    ChangedInviteRole: ({ value }) => ({
      model: isRole(value) ? { ...model, inviteRole: value } : model,
    }),
    ClickedCancelInvite: () =>
      withDialog(resetInvite(model), Dialog.close(model.inviteDialog)),
    ClickedSendInvite: () => {
      const email = model.inviteEmail.trim()
      if (email === '') return { model }
      const invited: Member = {
        id: model.nextId,
        name: nameFromEmail(email),
        email,
        role: model.inviteRole,
        status: 'Invited',
      }
      return withDialog(
        resetInvite({
          ...model,
          members: [...model.members, invited],
          nextId: model.nextId + 1,
        }),
        Dialog.close(model.inviteDialog),
      )
    },
    GotInviteDialogMessage: ({ message: dialogMessage }) =>
      withDialog(model, Dialog.update(model.inviteDialog, dialogMessage)),
  })

const statusVariant: Record<Status, BadgeVariant> = {
  Active: 'secondary',
  Invited: 'outline',
  Suspended: 'destructive',
}

const pageLayout = layoutStyle({ marginInline: 'auto', width: '100%' })

const pageHeader = (h: HtmlBuilder<Message>): Html =>
  hStack(
    {
      justify: 'between',
      align: 'center',
      gap: 4,
      wrap: 'wrap',
      children: [
        vStack(
          {
            gap: 1,
            children: [
              heading({ level: 1, children: ['Team members'] }, h),
              text(
                {
                  color: 'secondary',
                  children: [
                    'Manage who has access to your workspace and what they can do.',
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        button(
          { onClick: Message.ClickedInviteMember(), children: ['Invite member'] },
          h,
        ),
      ],
    },
    h,
  )

const memberRow = (member: Member, h: HtmlBuilder<Message>): Html =>
  tableRow(
    {
      children: [
        tableCell({ children: [text({ weight: 'medium', children: [member.name] }, h)] }, h),
        tableCell({ children: [text({ color: 'secondary', children: [member.email] }, h)] }, h),
        tableCell({ children: [member.role] }, h),
        tableCell(
          {
            children: [
              badge({ variant: statusVariant[member.status], children: [member.status] }, h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )

const membersTable = (
  members: ReadonlyArray<Member>,
  h: HtmlBuilder<Message>,
): Html =>
  table(
    {
      ariaLabel: 'Team members',
      children: [
        tableHeader(
          {
            children: [
              tableRow(
                {
                  children: [
                    tableHead({ children: ['Name'] }, h),
                    tableHead({ children: ['Email'] }, h),
                    tableHead({ children: ['Role'] }, h),
                    tableHead({ children: ['Status'] }, h),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        tableBody({ children: members.map(member => memberRow(member, h)) }, h),
      ],
    },
    h,
  )

const noMatches = (search: string, h: HtmlBuilder<Message>): Html =>
  empty(
    {
      children: [
        emptyHeader(
          {
            children: [
              emptyTitle({ children: ['No members found'] }, h),
              emptyDescription(
                { children: [`Nobody matches “${search.trim()}”. Try a different name or email.`] },
                h,
              ),
            ],
          },
          h,
        ),
        emptyContent(
          {
            children: [
              button(
                {
                  variant: 'outline',
                  onClick: Message.ClickedClearSearch(),
                  children: ['Clear search'],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )

const memberList = (model: Model, h: HtmlBuilder<Message>): Html => {
  const members = filteredMembers(model)
  return card(
    {
      children: [
        cardContent(
          {
            children: [
              vStack(
                {
                  gap: 4,
                  children: [
                    input(
                      {
                        id: 'member-search',
                        type: 'search',
                        value: model.search,
                        onInput: value => Message.ChangedSearch({ value }),
                        placeholder: 'Search by name or email',
                        ariaLabel: 'Search members',
                      },
                      h,
                    ),
                    members.length === 0
                      ? noMatches(model.search, h)
                      : membersTable(members, h),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  )
}

const inviteDialog = (model: Model, h: HtmlBuilder<Message>): Html =>
  Dialog.dialog(
    {
      model: model.inviteDialog,
      toParentMessage: toDialogMessage,
      title: 'Invite member',
      description: 'Send an invitation to join your workspace.',
      content: () => [
        fieldGroup(
          {
            children: [
              input(
                {
                  id: 'invite-email',
                  type: 'email',
                  label: 'Email',
                  value: model.inviteEmail,
                  onInput: value => Message.ChangedInviteEmail({ value }),
                  placeholder: 'name@company.com',
                  isRequired: true,
                },
                h,
              ),
              nativeSelect(
                {
                  id: 'invite-role',
                  label: 'Role',
                  value: model.inviteRole,
                  onChange: value => Message.ChangedInviteRole({ value }),
                  options: roles.map(role => ({ value: role, label: role })),
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
      footer: () => [
        button(
          {
            variant: 'outline',
            onClick: Message.ClickedCancelInvite(),
            children: ['Cancel'],
          },
          h,
        ),
        button(
          {
            onClick: Message.ClickedSendInvite(),
            isDisabled: model.inviteEmail.trim() === '',
            children: ['Send invite'],
          },
          h,
        ),
      ],
    },
    h,
  )

const view = (model: Model, h: HtmlBuilder<Message>): Html =>
  section(
    {
      variant: 'transparent',
      padding: 8,
      maxWidth: 960,
      layoutStyle: pageLayout,
      children: [
        vStack(
          { gap: 6, children: [pageHeader(h), memberList(model, h)] },
          h,
        ),
        inviteDialog(model, h),
      ],
    },
    h,
  )

const init = () => ({
  model: {
    members: initialMembers,
    search: '',
    nextId: initialMembers.length + 1,
    inviteEmail: '',
    inviteRole: 'Member' as const,
    inviteDialog: Dialog.init({ id: 'invite-dialog' }),
  },
})

export const start = () =>
  Runtime.run(
    Runtime.makeElement({
      Model,
      init,
      update,
      view,
      container: document.getElementById('root'),
      devTools: false,
    }),
  )
