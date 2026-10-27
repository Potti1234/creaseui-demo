// expect: no-restricted-imports
// Issue rows come from IssueRow (D3).
import type { Html, HtmlBuilder } from 'foldkit/html'

import { item, itemTitle } from '@/ui/item'

export const fixture = <Msg>(title: string, h: HtmlBuilder<Msg>): Html =>
  item({ size: 'xs', layout: 'inline', children: [itemTitle({ children: [title] }, h)] }, h)
