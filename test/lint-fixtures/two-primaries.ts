// expect: crease-tasks/one-primary-action
// A region has one primary action (D4).
import type { Html, HtmlBuilder } from 'foldkit/html'

import { button } from '@/ui/button'

export const fixture = <Msg>(onSave: Msg, onPublish: Msg, h: HtmlBuilder<Msg>): ReadonlyArray<Html> => [
  button({ intent: 'primary', onClick: onSave, children: ['Save'] }, h),
  button({ intent: 'primary', onClick: onPublish, children: ['Publish'] }, h),
]
