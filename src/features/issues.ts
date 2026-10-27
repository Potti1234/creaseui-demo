import type { Html, HtmlBuilder } from 'foldkit/html'

import { STATUSES } from '../domain'
import { type CollectionBody, issueCollection } from '../design/issue-collection'
import { type Message, Message as M, type Model, pickersOf } from '../model'
import { button } from '@/ui/button'

/* All issues: as a list, grouped by status or not, or as a board with one
   column per status. Grouping only applies to the list. */

const listBody = (model: Model): CollectionBody<Message> =>
  model.isGrouped
    ? {
        kind: 'groups',
        groups: STATUSES.map(status => ({
          status,
          issues: model.issues.filter(issue => issue.status === status),
          isCollapsed: model.collapsed.includes(status),
          onToggle: M.ToggledGroup({ status }),
        })),
      }
    : { kind: 'rows', issues: model.issues }

export const allIssuesView = (model: Model, h: HtmlBuilder<Message>): Html =>
  issueCollection(
    {
      controls: [
        button(
          { onClick: M.ToggledLayout(), children: [model.layout === 'list' ? 'Layout: List' : 'Layout: Board'] },
          h,
        ),
        ...(model.layout === 'list'
          ? [
              button(
                { onClick: M.ToggledGrouping(), children: [model.isGrouped ? 'Grouped by status' : 'Not grouped'] },
                h,
              ),
            ]
          : []),
      ],
      body: model.layout === 'board' ? { kind: 'board', issues: model.issues } : listBody(model),
      pickers: pickersOf(model),
    },
    h,
  )
