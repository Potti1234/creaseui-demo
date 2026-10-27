// expect: none
// A parent may place a component: margin and width are placement.
import type { Html, HtmlBuilder } from 'foldkit/html'

import { button } from '@/ui/button'

export const fixture = <Msg>(h: HtmlBuilder<Msg>): Html => button({ class: 'mt-4 w-full', children: ['Save'] }, h)
