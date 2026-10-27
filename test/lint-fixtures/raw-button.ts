// expect: crease/no-raw-controls
// Feature code draws no raw controls.
import type { Html, HtmlBuilder } from 'foldkit/html'

export const fixture = <Msg>(h: HtmlBuilder<Msg>): Html => h.button([], ['Save'])
