// expect: crease/component-contract
// crease's text has eleven sizes; the product's receipt allows two (chapter 10).
import type { Html, HtmlBuilder } from 'foldkit/html'

import { text } from '@/ui/text'

export const fixture = <Msg>(h: HtmlBuilder<Msg>): Html => text({ size: 'lg', children: ['Release notes'] }, h)
