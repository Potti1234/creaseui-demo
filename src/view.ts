import type { Html, HtmlBuilder } from 'foldkit/html'

import { type Issue, ME, isOpen, isOpenBug } from './domain'
import { bugsView } from './features/bugs'
import { allIssuesView } from './features/issues'
import { myIssuesView } from './features/my-issues'
import { searchView } from './features/search'
import { issueComposer } from './design/issue-composer'
import { saveNotice } from './design/save-notice'
import { type Message, Message as M, type Model, pickersOf } from './model'
import { button } from '@/ui/button'
import { heading } from '@/ui/heading'
import { icon } from '@/ui/icon'
import { input } from '@/ui/input'
import {
  sidebar,
  sidebarContent,
  sidebarGroup,
  sidebarGroupLabel,
  sidebarHeader,
  sidebarInset,
  sidebarMenu,
  sidebarMenuBadge,
  sidebarMenuButton,
  sidebarMenuItem,
  sidebarProvider,
} from '@/ui/sidebar'
import { stack } from '@/ui/stack'
import { text } from '@/ui/text'

/* What each sidebar entry counts: the open issues its view lists. */
const COUNTED: Readonly<Record<Model['view'], (issue: Issue) => boolean>> = {
  all: isOpen,
  mine: issue => isOpen(issue) && issue.assigneeId === ME,
  bugs: isOpenBug,
}

const openCount = (model: Model, view: Model['view']): number => model.issues.filter(COUNTED[view]).length

const navItem = (
  model: Model,
  view: Model['view'],
  label: string,
  iconName: 'list' | 'circle-user' | 'bug',
  h: HtmlBuilder<Message>,
): Html =>
  sidebarMenuItem(
    {
      children: [
        sidebarMenuButton(
          {
            isActive: model.view === view && model.query === '',
            onClick: M.SelectedView({ view }),
            children: [icon({ name: iconName }, h), text({ children: [label] }, h)],
          },
          h,
        ),
        sidebarMenuBadge({ children: [String(openCount(model, view))] }, h),
      ],
    },
    h,
  )

const notices = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> =>
  model.save === 'failed'
    ? [
        saveNotice(
          {
            title: 'Your last change was not saved',
            description: 'The browser refused to store it. Your changes are still on this page; they are lost if you reload before a save succeeds.',
            onRetry: M.RetriedSave(),
          },
          h,
        ),
      ]
    : model.loadNotice === null
      ? []
      : [saveNotice({ title: 'Saved issues could not be read', description: model.loadNotice }, h)]

const VIEW_TITLE: Readonly<Record<Model['view'], string>> = {
  all: 'All issues',
  mine: 'My issues',
  bugs: 'Bugs',
}

const title = (model: Model): string => (model.query !== '' ? 'Search' : VIEW_TITLE[model.view])

const currentView = (model: Model, h: HtmlBuilder<Message>): Html => {
  if (model.query !== '') return searchView(model, h)
  switch (model.view) {
    case 'all':
      return allIssuesView(model, h)
    case 'mine':
      return myIssuesView(model, h)
    case 'bugs':
      return bugsView(model, h)
  }
}

export const view = (model: Model, h: HtmlBuilder<Message>): Html =>
  sidebarProvider(
    {
      children: [
        sidebar(
          {
            children: [
              sidebarHeader(
                {
                  children: [
                    text({ weight: 'semibold', children: ['Crease Tasks'] }, h),
                  ],
                },
                h,
              ),
              sidebarContent(
                {
                  children: [
                    sidebarGroup(
                      {
                        children: [
                          sidebarGroupLabel({ children: ['Workspace'] }, h),
                          sidebarMenu(
                            {
                              children: [
                                navItem(model, 'all', 'All issues', 'list', h),
                                navItem(model, 'mine', 'My issues', 'circle-user', h),
                                navItem(model, 'bugs', 'Bugs', 'bug', h),
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
              ),
            ],
          },
          h,
        ),
        sidebarInset(
          {
            // Rows never wrap (D1), so the content area must be allowed to
            // shrink below their single-line width.
            class: 'min-w-0',
            children: [
              stack(
                {
                  as: 'header',
                  direction: 'horizontal',
                  align: 'center',
                  justify: 'between',
                  gap: 3,
                  paddingInline: 4,
                  paddingBlock: 2,
                  children: [
                    heading({ level: 4, accessibilityLevel: 1, children: [title(model)] }, h),
                    stack(
                      {
                        direction: 'horizontal',
                        align: 'center',
                        gap: 2,
                        children: [
                          input(
                            {
                              id: 'search',
                              value: model.query,
                              onInput: query => M.ChangedQuery({ query }),
                              placeholder: 'Search issues',
                              ariaLabel: 'Search issues',
                              role: 'searchbox',
                              class: 'w-56',
                            },
                            h,
                          ),
                          // The page's one main action (D4, D6).
                          button(
                            {
                              id: 'new-issue',
                              intent: 'primary',
                              onClick: M.ClickedNewIssue(),
                              children: [model.draft.title.trim() === '' ? 'New issue' : 'New issue (draft)'],
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
              ...notices(model, h),
              currentView(model, h),
              issueComposer(
                {
                  dialog: model.composer,
                  toDialogMessage: message => M.GotComposerMessage({ message }),
                  draft: model.draft,
                  titleError: model.titleError,
                  onTitle: title => M.ChangedDraftTitle({ title }),
                  onCreate: M.SubmittedComposer(),
                  onCancel: M.CancelledComposer(),
                  pickers: pickersOf(model),
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
