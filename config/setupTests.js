import 'regenerator-runtime/runtime'
import '@testing-library/jest-dom'

import preact from 'preact'
import * as hook from 'preact/hooks'
global.preact = preact
global._hooks = hook
