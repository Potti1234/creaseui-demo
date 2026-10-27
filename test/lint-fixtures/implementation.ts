// expect: crease/no-unapproved-renderer
// Implementations in src/lib are for components only.
import type { Html, HtmlBuilder } from 'foldkit/html'

import { renderButton } from '@/lib/button'

export const fixture = <Msg>(h: HtmlBuilder<Msg>): Html => renderButton({ children: ['Save'] }, [], h)
