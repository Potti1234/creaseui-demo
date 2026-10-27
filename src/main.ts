import './styles.css'
// The product theme comes after crease's base theme so its tokens win.
import './theme/tokens.css'
import './theme/geometry.css'

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
