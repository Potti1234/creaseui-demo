import { Schema as S } from 'effect'
import { Runtime } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'

const Model = S.Struct({})
type Model = typeof Model.Type
type Message = never

const update = (model: Model, _message: Message) => ({ model })

const view = (_model: Model, h: HtmlBuilder<Message>): Html =>
  h.main([], ['Empty Foldkit project'])

export const start = () =>
  Runtime.run(
    Runtime.makeElement({
      Model,
      init: () => ({ model: {} }),
      update,
      view,
      container: document.getElementById('root'),
      devTools: false,
    }),
  )
