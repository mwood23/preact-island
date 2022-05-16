import { getHostElements, mount, RootFragment, renderIsland } from './lib'
import { render, ComponentType } from 'preact'

export type InitialProps = { [x: string]: any }

export type Island<P extends InitialProps> = {
  /**
   * A WeakMap that yields the mutation observers associated with a particular root. Used for cleaning up observers
   * on destroy.
   */
  _rootsToObservers: WeakMap<RootFragment, MutationObserver>
  /**
   * An array of the root fragments (a fake DOM element) containing one or more
   * DOM nodes, which can then be passed as the `parent` argument to Preact's `render()` method.
   */
  _roots: RootFragment[]
  /**
   * A reference to the executed script that called `createIsland`. This is used for listening to prop
   * changes on that script and causing rerenders of the island.
   */
  _executedScript: HTMLOrSVGScriptElement | null
  /**
   * Renders the created island at the given selector. Calling multiple times appends elements at the given selectors.
   */
  render: (props: {
    /**
     * A query selector target to create the widget. This is ignored if inline is passed or if a `data-mount-in` attribute
     * is appended onto the executed script.
     *
     * @example '[data-island="widget"]'
     */
    selector?: string
    /**
     * If true, removes all children of the element before rendering the component.
     *
     * @default false
     *
     * @example
     * ```html
     * <div data-island="widget">
     *    <div>some other content</div>
     *    <div>some other content</div>
     *    <div>some other content</div>
     * </div>
     * ```
     *
     * // turns into
     *
     * ```html
     * <div data-island="widget">
     *    <div>your-widget</div>
     * </div
     * ```
     */
    clean?: boolean
    /**
     * If true, replaces the contents of the selector with the component given. If you use replace,
     * you will not be able to add props to the host element (since it will be replaced). You will also
     * not be able to use child props script either (since they will be replaced).
     *
     * Use script tag props or a props selector for handling props when in replace mode.
     *
     * @default false
     *
     * @example
     * ```html
     * <div data-island="widget"></div>
     * ```
     *
     * // turns into
     *
     * ```html
     * <div>your-widget</div>
     * ```
     */
    replace?: boolean

    /**
     * Renders the widget at the current position of the script in the HTML document.
     *
     * @default false
     *
     * @example
     * ```html
     * <div>
     *    <div>some content here</div>
     *    <script src="https://preact-island.netlify.app/islands/pokemon.inline.island.umd.js"></script>
     *    <div>some content here</div>
     * </div>
     * ```
     *
     * // turns into
     *
     * ```html
     * <div>
     *    <div>some content here</div>
     *    <script src="https://preact-island.netlify.app/islands/pokemon.inline.island.umd.js"></script>
     *    <div>your widget</div>
     *    <div>some content here</div>
     * </div>
     * ```
     */
    inline?: boolean
    /**
     * Initial props to pass to the component. These props do not cause updates to the island if changed. Use `createIsland().rerender` instead.
     */
    initialProps?: P
    /**
     * A valid selector to a script tag located in the HTML document with a type of either `text/props` or `application/json`
     * containing props to pass into the component. If there are multiple scripts found with the selector, all props are merged with
     * the last script found taking priority.
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
   * Destroys all instances of the island on the page and disconnects any associated observers.
   */
  destroy: () => void
}

export const createIsland = <P extends InitialProps>(
  widget: ComponentType<P>,
) => {
  const island: Island<P> = {
    _rootsToObservers: new WeakMap(),
    _roots: [],
    _executedScript: document.currentScript,
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
        const hostElements = getHostElements({
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
