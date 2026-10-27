// expect: crease/component-contract
// Appearance belongs to the component: corners are not placement.
import type { Html, HtmlBuilder } from 'foldkit/html'

import { button } from '@/ui/button'

export const fixture = <Msg>(h: HtmlBuilder<Msg>): Html => button({ class: 'rounded-full', children: ['Save'] }, h)
