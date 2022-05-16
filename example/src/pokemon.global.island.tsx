import { createIsland } from '../../dist/index.module'
import { Pokemon } from './pokemon.component'
import style from './pokemon.island.css'
import { injectCSS } from './utils'

injectCSS(style)

const island = createIsland(Pokemon)

// @ts-expect-error - We're mutating the window to add this
window._pokemon = island
