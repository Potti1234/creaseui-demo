import { Match as M, Schema as S } from 'effect'
import { Command, type Update } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { modifyFields } from 'foldkit/struct'

import { button } from '@/ui/button'
import {
  card,
  cardContent,
  cardDescription,
  cardFooter,
  cardHeader,
  cardTitle,
} from '@/ui/card'
import { heading } from '@/ui/heading'
import { input } from '@/ui/input'
import { stack } from '@/ui/stack'
import { switchControl } from '@/ui/switch'
import * as Tabs from '@/ui/tabs'
import { text } from '@/ui/text'
import { textarea } from '@/ui/textarea'

// MODEL

const Tab = S.Union([S.Literal('profile'), S.Literal('notifications')])
type Tab = typeof Tab.Type

const Notification = S.Union([
  S.Literal('product'),
  S.Literal('security'),
  S.Literal('weekly'),
])
type Notification = typeof Notification.Type

export const Model = S.Struct({
  tabs: Tabs.Model,
  selectedTab: Tab,
  name: S.String,
  email: S.String,
  bio: S.String,
  isSaved: S.Boolean,
  product: S.Boolean,
  security: S.Boolean,
  weekly: S.Boolean,
})
export type Model = typeof Model.Type

// MESSAGE

export const Message = defineMessageUnion({
  GotTabsMessage: { message: Tabs.Message },
  ChangedName: { value: S.String },
  ChangedEmail: { value: S.String },
  ChangedBio: { value: S.String },
  SavedProfile: {},
  ToggledNotification: { notification: Notification, isChecked: S.Boolean },
})
export type Message = typeof Message.Type

// INIT

export const init = (): Model => ({
  tabs: Tabs.init({ id: 'settings-tabs' }),
  selectedTab: 'profile',
  name: 'Olivia Martin',
  email: 'olivia@example.com',
  bio: '',
  isSaved: false,
  product: true,
  security: true,
  weekly: false,
})

// UPDATE

type UpdateReturn = Update.Return<Model, Message>

const isTab = S.is(Tab)

export const update = (model: Model, message: Message): UpdateReturn =>
  M.value(message).pipe(
    M.withReturnType<UpdateReturn>(),
    M.tagsExhaustive({
      GotTabsMessage: ({ message: tabsMessage }) => {
        const next = Tabs.update(model.tabs, tabsMessage)
        const selection =
          next.outMessage?._tag === 'Selected' && isTab(next.outMessage.value)
            ? next.outMessage.value
            : undefined
        return {
          model: {
            ...model,
            tabs: next.model,
            ...(selection === undefined ? {} : { selectedTab: selection }),
          },
          commands: Command.mapMessages(next.commands ?? [], nextMessage =>
            Message.GotTabsMessage({ message: nextMessage }),
          ),
        }
      },
      ChangedName: ({ value }) => ({
        model: modifyFields(model, { name: () => value, isSaved: () => false }),
      }),
      ChangedEmail: ({ value }) => ({
        model: modifyFields(model, { email: () => value, isSaved: () => false }),
      }),
      ChangedBio: ({ value }) => ({
        model: modifyFields(model, { bio: () => value, isSaved: () => false }),
      }),
      SavedProfile: () => ({
        model: modifyFields(model, { isSaved: () => true }),
      }),
      ToggledNotification: ({ notification, isChecked }) => ({
        model: { ...model, [notification]: isChecked },
      }),
    }),
  )

// VIEW

const NOTIFICATIONS: ReadonlyArray<
  Readonly<{ notification: Notification; label: string; description: string }>
> = [
  {
    notification: 'product',
    label: 'Product updates',
    description: 'News about features and improvements.',
  },
  {
    notification: 'security',
    label: 'Security alerts',
    description: 'Sign-ins from new devices and password changes.',
  },
  {
    notification: 'weekly',
    label: 'Weekly summary',
    description: 'A digest of activity every Monday.',
  },
]

const profileCard = (model: Model, h: HtmlBuilder<Message>): Html =>
  card(
    {
      children: [
        cardHeader(
          {
            children: [
              cardTitle({ children: ['Profile'] }, h),
              cardDescription(
                { children: ['How other people see you in the workspace.'] },
                h,
              ),
            ],
          },
          h,
        ),
        cardContent(
          {
            children: [
              stack(
                {
                  gap: 4,
                  children: [
                    input(
                      {
                        id: 'settings-name',
                        label: 'Name',
                        value: model.name,
                        autocomplete: 'name',
                        onInput: value => Message.ChangedName({ value }),
                      },
                      h,
                    ),
                    input(
                      {
                        id: 'settings-email',
                        label: 'Email',
                        type: 'email',
                        value: model.email,
                        autocomplete: 'email',
                        onInput: value => Message.ChangedEmail({ value }),
                      },
                      h,
                    ),
                    textarea(
                      {
                        id: 'settings-bio',
                        label: 'Bio',
                        description: 'A sentence or two about yourself.',
                        value: model.bio,
                        rows: 3,
                        onInput: value => Message.ChangedBio({ value }),
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
        ),
        cardFooter(
          {
            children: [
              stack(
                {
                  direction: 'horizontal',
                  gap: 3,
                  vAlign: 'center',
                  children: [
                    button(
                      { children: ['Save changes'], onClick: Message.SavedProfile() },
                      h,
                    ),
                    ...(model.isSaved
                      ? [text({ color: 'secondary', children: ['Saved'] }, h)]
                      : []),
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

const notificationsCard = (model: Model, h: HtmlBuilder<Message>): Html =>
  card(
    {
      children: [
        cardHeader(
          {
            children: [
              cardTitle({ children: ['Email notifications'] }, h),
              cardDescription({ children: ['Choose what we email you about.'] }, h),
            ],
          },
          h,
        ),
        cardContent(
          {
            children: [
              stack(
                {
                  gap: 4,
                  children: NOTIFICATIONS.map(({ notification, label, description }) =>
                    switchControl(
                      {
                        id: `settings-${notification}`,
                        label,
                        description,
                        isChecked: model[notification],
                        onToggle: isChecked =>
                          Message.ToggledNotification({ notification, isChecked }),
                      },
                      h,
                    ),
                  ),
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

export const view = (model: Model, h: HtmlBuilder<Message>): Html =>
  stack(
    {
      gap: 6,
      padding: 6,
      class: 'mx-auto max-w-2xl',
      children: [
        stack(
          {
            gap: 1,
            children: [
              heading({ level: 1, children: ['Settings'] }, h),
              text(
                { color: 'secondary', children: ['Manage your profile and notifications.'] },
                h,
              ),
            ],
          },
          h,
        ),
        Tabs.tabs<Message>(
          {
            model: model.tabs,
            selectedValue: model.selectedTab,
            toParentMessage: message => Message.GotTabsMessage({ message }),
            ariaLabel: 'Settings sections',
            tabs: [
              { value: 'profile', label: 'Profile', content: profileCard(model, h) },
              {
                value: 'notifications',
                label: 'Notifications',
                content: notificationsCard(model, h),
              },
            ],
          },
          h,
        ),
      ],
    },
    h,
  )
