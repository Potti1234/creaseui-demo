import { Runtime } from 'foldkit'

import { Model, init, update, view } from './settings'

export const start = () =>
  Runtime.run(
    Runtime.makeElement({
      Model,
      init: () => ({ model: init() }),
      update,
      view,
      container: document.getElementById('root'),
      devTools: false,
    }),
  )
