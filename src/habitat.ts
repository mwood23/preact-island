import { ComponentType } from 'preact'
import {
  widgetDOMHostElements,
  preactRender,
  getExecutedScript,
  getHabitatSelectorFromClient,
} from './lib'

export const lego = <P extends {}>(widget: ComponentType<P>) => {
  const render = (props: {
    selector?: string
    cleanTarget: boolean
    replaceTarget: boolean
    defaultProps: P
  }) => {
    const { selector, cleanTarget, replaceTarget, defaultProps } = props
    let rendered = false

    //   const getTargetSelector = () => {
    //     // First see if a target is given from the executed script
    //     const currentScript = getExecutedScript()
    //     const target = getHabitatSelectorFromClient(currentScript)

    //     if (target != null) return

    //     return selector
    //   }

    const load = () => {
      /**
       * We listen for multiple events to render so soon as we do it once
       * successfully we break early for others.
       */
      if (rendered === true) return
      const hostElements = widgetDOMHostElements({
        selector,
      })

      // Do nothing if no host elements returned
      if (hostElements.length === 0) return

      preactRender({
        widget,
        cleanTarget,
        hostElements,
        replaceTarget,
        defaultProps,
      })
      rendered = true
    }

    load()
    document.addEventListener('DOMContentLoaded', load)
    document.addEventListener('load', load)
  }

  return { render }
}
