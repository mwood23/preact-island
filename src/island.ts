import {
  widgetDOMHostElements,
  mount,
  RootFragment,
  getExecutedScript,
  renderIsland,
} from './lib'
import { h, render, ComponentType } from 'preact'

export type InitialProps = { [x: string]: any }

export type Island<P extends InitialProps> = {
  /**
   * A WeakMap that yields us the mutation observers associated with a particular root. Used for cleaning up observers
   * on destroy.
   */
  _rootsToObservers: WeakMap<RootFragment, MutationObserver>
  /**
   * An array of the root fragments (a fake DOM element) containing one or more
   * DOM nodes, which can then be passed as the `parent` argument to Preact's `render()` method.
   */
  _roots: RootFragment[]
  /**
   * A reference to the executed script that called createIsland. This is used for listening to prop
   * changes on that script and causing rerenders of the island.
   */
  _executedScript: HTMLOrSVGScriptElement | null
  /**
   * Renders the created island at the given selector. Calling multiple times appends elements at the given selectors.
   */
  render: (props: {
    /**
     * A query selector target to create the widget. This is ignore if inline is passed or if a data-mount-in attribute
     * is appended onto the executed script.
     */
    selector?: string
    /**
     * If true, removes all children of the element before rendering the component.
     *
     * @default false
     */
    clean?: boolean
    /**
     * If true, replaces the contents of the selector with the component given.
     *
     * @default false
     */
    replace?: boolean

    /**
     * Appends the widget to the parent of the DOM node where the script is placed.
     *
     * @default false
     */
    inline?: boolean
    /**
     * Initial props to pass to the component.
     */
    initialProps?: P
    /**
     * A valid selector to a script tag located in the HTML document with a type of either 'text/props' or 'application/json'
     * containing props to pass into the component. If there are multiple scripts found with the selector, chooses the first one.
     */
    propsSelector?: string
  }) => void

  /**
   * Contains the current props used to render the island.
   */
  props: P
  /**
   * Triggers a rerenders of the island with the new props given.
   */
  rerender: (props: P) => void
  /**
   * Destroys all instances of the island on the page and disconnects any associated observers
   */
  destroy: () => void
}

export const createIsland = <P extends InitialProps>(
  widget: ComponentType<P>,
) => {
  const island: Island<P> = {
    _rootsToObservers: new WeakMap(),
    _roots: [],
    _executedScript: getExecutedScript(),
    // @ts-ignore
    props: {},
    render: ({
      selector,
      clean = false,
      replace = false,
      inline = false,
      initialProps = {},
      propsSelector,
    }) => {
      let rendered = false

      const load = () => {
        /**
         * We listen for multiple events to render so soon as we do it once
         * successfully we break early for others.
         */
        if (rendered === true) return
        const hostElements = widgetDOMHostElements({
          selector,
          inline,
        })

        // Do nothing if no host elements returned
        if (hostElements.length === 0) return

        const { rootFragments } = mount<P>({
          island,
          widget,
          clean,
          hostElements,
          replace,
          // @ts-ignore Not sure how to fix this error
          initialProps,
          propsSelector,
        })

        island._roots = island._roots.concat(rootFragments)
        rendered = true
      }

      load()
      document.addEventListener('DOMContentLoaded', load)
      document.addEventListener('load', load)
    },
    rerender: (newProps) => {
      island._roots.forEach((rootFragment) => {
        renderIsland({
          island,
          widget,
          rootFragment,
          props: { ...island.props, ...newProps },
        })
      })
    },
    destroy: () => {
      island._roots.forEach((rootFragment) => {
        island._rootsToObservers.get(rootFragment)?.disconnect()
        render(null, rootFragment)
      })
    },
  }

  return island
}
