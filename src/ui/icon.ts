import type { Html, HtmlBuilder } from 'foldkit/html'
import { icon as renderIcon, type IconName } from '@/lib/icon'

/** Public icon adapter; the installed registry helper remains implementation-only. */
export const icon = <Msg>(
  props: Readonly<{ name: IconName }>,
  h: HtmlBuilder<Msg>,
): Html => renderIcon(props.name, {}, h)
