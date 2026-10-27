import './styles.css'

import { Runtime } from 'foldkit'

import { Model, init, update } from './model'
import { view } from './view'

Runtime.run(
  Runtime.makeElement({
    Model,
    init,
    update,
    view,
    container: document.getElementById('root'),
  }),
)
