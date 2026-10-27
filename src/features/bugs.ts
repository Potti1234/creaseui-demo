import type { Html, HtmlBuilder } from 'foldkit/html'

import { STATUSES, isOpenBug } from '../domain'
import { issueCollection } from '../design/issue-collection'
import { type Message, Message as M, type Model, pickersOf } from '../model'

/* Open issues labelled Bug, grouped by status. */

export const bugsView = (model: Model, h: HtmlBuilder<Message>): Html => {
  const bugs = model.issues.filter(isOpenBug)
  return issueCollection(
    {
      body:
        bugs.length === 0
          ? { kind: 'empty', title: 'No open bugs', description: 'Issues labelled Bug that are not done show up here.' }
          : {
              kind: 'groups',
              groups: STATUSES.map(status => ({
                status,
                issues: bugs.filter(issue => issue.status === status),
                isCollapsed: model.collapsed.includes(status),
                onToggle: M.ToggledGroup({ status }),
              })),
            },
      pickers: pickersOf(model),
    },
    h,
  )
}
