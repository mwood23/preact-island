import { ComponentType, VNode } from 'preact'
import { createPortal, FC, useEffect, useMemo } from 'preact/compat'
import { createIsland, Island } from './island'

export type InitialPropsWebComponent = { [x: string]: any }

export const createIslandWebComponent = <P extends InitialPropsWebComponent>(
  /**
   * Must be a valid web component element name. See spec for more details:
   * https://html.spec.whatwg.org/#valid-custom-element-name
   */
  elementName: string,
  /**
   * Component you would like to render inside of the web component
   */
  widget: ComponentType<P>,
) => {
  if (customElements.get(elementName) == null) {
    class Element extends HTMLElement {
      constructor() {
        super()

        // Create a shadow root
        this.attachShadow({ mode: 'open' })
      }
    }

    customElements.define(elementName, Element)
  }

  const island = createIsland(widget)

  return {
    ...island,
    render: (
      args: Omit<
        Parameters<Island<P>['render']>[0],
        'replace' | 'clean' | 'inline'
      >,
    ) => island.render(args),
    injectStyles: (style: string) => {
      island._roots.forEach((root) => {
        const styleElement = document.createElement('style')
        styleElement.innerHTML = style

        // @ts-ignore
        root.parentNode.prepend(styleElement)
      })
    },
  }
}

export const WebComponentPortal: FC<{
  name: string
  container?: Element
  children: VNode<{}>
  style?: string | HTMLStyleElement
}> = ({ name, container = document.body, children, style }) => {
  const portalTarget = useMemo(() => {
    if (customElements.get(name) == null) {
      class Element extends HTMLElement {
        constructor() {
          super()

          // Create a shadow root
          const shadowRoot = this.attachShadow({ mode: 'open' })

          if (!style) return

          if (style instanceof HTMLStyleElement) {
            shadowRoot.prepend(style)
          } else {
            const styleElement = document.createElement('style')
            styleElement.innerHTML = style

            shadowRoot.prepend(styleElement)
          }
        }
      }

      customElements.define(name, Element)
    }

    const customElement = document.createElement(name)
    return container.appendChild(customElement)
  }, [container, style])

  useEffect(() => {
    return () => {
      portalTarget.remove()
    }
  }, [portalTarget])

  // @ts-ignore - Internal types wrong
  return createPortal(children, portalTarget.shadowRoot)
}
