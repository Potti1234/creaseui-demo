import './styles.css'
// The product theme comes after crease's base theme so its tokens win.
import './theme/tokens.css'
import './theme/geometry.css'

import { BrowserKeyValueStore } from '@effect/platform-browser'
import { Runtime } from 'foldkit'

import { Model, init, subscriptions, update } from './model'
import { Flags, loadFlags } from './storage'
import { view } from './view'

Runtime.run(
  Runtime.makeElement({
    Model,
    Flags,
    flags: loadFlags,
    init,
    update,
    view,
    subscriptions,
    // Issues are kept in this browser's localStorage (src/storage.ts).
    resources: BrowserKeyValueStore.layerLocalStorage,
    container: document.getElementById('root'),
  }),
)
