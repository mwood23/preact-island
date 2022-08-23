import { createIsland } from '../../src'
import { Pokemon } from './pokemon.component'
import style from './pokemon.island.css'
import { injectCSS } from './utils'

injectCSS(style)

const island = createIsland(Pokemon)
island.render({
  inline: true,
})
