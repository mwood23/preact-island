import { ComponentType, h, render } from 'preact'
import { InitialProps, Island } from './island'

type HostElement = HTMLElement

export const formatProp = (str: string) => {
  return `${str.charAt(0).toLowerCase()}${str.slice(1)}`
}

export const getPropsFromElement = (
  element: HostElement | HTMLOrSVGScriptElement,
) => {
  const { dataset } = element

  const props: { [x: string]: any } = {}

  for (var d in dataset) {
    // We don't pull props for inherited attributes
    if (dataset.hasOwnProperty(d) === false) return

    // data-prop or data-props works!
    const propName = formatProp(d.split(/(props?)/).pop() || '')

    if (propName) {
      props[propName] = dataset[d]
    }
  }

  return props
}

export const isValidPropsScript = (element: Element) => {
  return (
    // element.tagName.toLowerCase() === 'script' &&
    ['text/props', 'application/json'].includes(
      element.getAttribute('type') || '',
    )
  )
}

export const getInteriorPropsScriptsForElement = (element: HTMLElement) => {
  return Array.from(element.getElementsByTagName('script')).filter(
    isValidPropsScript,
  )
}

export const getPropsScriptsBySelector = (selector: string) => {
  return Array.from(document.querySelectorAll(selector)).filter(
    isValidPropsScript,
    // Checked by filter call
  ) as HTMLOrSVGScriptElement[]
}

export const getPropsFromScripts = (scripts: HTMLOrSVGScriptElement[]) => {
  let interiorScriptProps: any = {}
  scripts.forEach((script) => {
    // Swallow any potential errors so we don't throw on someone else's page
    try {
      interiorScriptProps = {
        ...interiorScriptProps,
        ...JSON.parse(script.innerHTML),
      }
    } catch (e: any) {}
  })
  return interiorScriptProps
}

/**
 * Get the props from a host element's data attributes
 * @param  {Element} tag The host element
 * @return {Object}  props object to be passed to the component
 */
export const generateHostElementProps = <P extends InitialProps>(
  island: Island<P>,
  element: HostElement,
  initialProps = {},
  propsSelector: string | undefined | null,
): P => {
  const elementProps = getPropsFromElement(element)

  const currentScriptProps = island._executedScript
    ? getPropsFromElement(island._executedScript)
    : {}
  const interiorScriptProps = getPropsFromScripts(
    getInteriorPropsScriptsForElement(element),
  )

  const propsSelectorProps = propsSelector
    ? getPropsFromScripts(getPropsScriptsBySelector(propsSelector))
    : {}

  return {
    ...initialProps,
    ...elementProps,
    ...currentScriptProps,
    ...propsSelectorProps,
    ...interiorScriptProps,
  }
}

export const getHostElements = ({
  selector,
  inline,
}: {
  selector?: string
  inline: boolean
}): HostElement[] => {
  const currentScript = document.currentScript

  if (inline && currentScript?.parentNode) {
    // @ts-ignore Not sure on this one
    return [currentScript.parentNode]
  }

  // Next, try to get the selector from the current script
  const maybeSelector = currentScript?.dataset.mountIn
  if (maybeSelector) {
    return Array.from(document.querySelectorAll<HTMLElement>(maybeSelector))
  }

  if (selector) {
    return Array.from(document.querySelectorAll<HTMLElement>(selector))
  }

  return []
}

/**
 * A Preact 11+ implementation of the `replaceNode` parameter from Preact 10.
 *
 * This creates a "Persistent Fragment" (a fake DOM element) containing one or more
 * DOM nodes, which can then be passed as the `parent` argument to Preact's `render()` method.
 *
 * Lifted from: https://gist.github.com/developit/f4c67a2ede71dc2fab7f357f39cff28c
 */
export type RootFragment = any

export function createRootFragment(
  parent: HTMLElement,
  replaceNode: HTMLElement | HTMLElement[],
): RootFragment {
  replaceNode = ([] as HTMLElement[]).concat(replaceNode)
  var s = replaceNode[replaceNode.length - 1].nextSibling
  function insert(c: HTMLElement, r: HTMLElement) {
    parent.insertBefore(c, r || s)
  }
  // Mutating the parent to add a preact property
  // @ts-expect-error We're mutating the parent to add these properties for Preact
  return (parent.__k = {
    nodeType: 1,
    parentNode: parent,
    firstChild: replaceNode[0],
    childNodes: replaceNode,
    insertBefore: insert,
    appendChild: insert,
    removeChild: function (c: HTMLElement) {
      parent.removeChild(c)
    },
  })
}

export const watchForPropChanges = <P extends InitialProps>({
  island,
  hostElement,
  initialProps,
  onNewProps,
  propsSelector,
}: {
  island: Island<P>
  hostElement: HostElement
  initialProps: any
  onNewProps: (props: P) => void
  propsSelector: string | undefined | null
}) => {
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function () {
      onNewProps(
        generateHostElementProps(
          island,
          hostElement,
          initialProps,
          propsSelector,
        ),
      )
    })
  })

  const config = { attributes: true, childList: true, characterData: true }

  if (island._executedScript) {
    observer.observe(island._executedScript, config)
  }

  getInteriorPropsScriptsForElement(hostElement).forEach((script) => {
    observer.observe(script, config)
  })

  if (propsSelector) {
    getPropsScriptsBySelector(propsSelector).forEach((script) => {
      observer.observe(script, config)
    })
  }

  observer.observe(hostElement, config)

  return observer
}

export const renderIsland = <P extends InitialProps>({
  island,
  widget,
  rootFragment,
  props,
}: {
  island: Island<P>
  widget: ComponentType<P>
  rootFragment: RootFragment
  props: P
}) => {
  island.props = props
  render(h(widget, props), rootFragment)
}

export const mount = <P extends InitialProps>({
  island,
  widget,
  hostElements,
  clean,
  replace,
  initialProps,
  propsSelector,
}: {
  island: Island<P>
  widget: ComponentType<P>
  hostElements: Array<HostElement>
  clean: boolean
  replace: boolean
  initialProps: P
  propsSelector?: string
}) => {
  const rootFragments: any = []

  hostElements.forEach((hostElement) => {
    const props = generateHostElementProps<P>(
      island,
      hostElement,
      initialProps,
      propsSelector,
    )
    if (clean) {
      hostElement.replaceChildren()
    }

    let rootFragment: any
    if (replace) {
      rootFragment = createRootFragment(
        hostElement.parentElement || document.body,
        hostElement,
      )
    } else {
      const renderNode = document.createElement('div')
      hostElement.appendChild(renderNode)
      rootFragment = createRootFragment(hostElement, renderNode)
    }

    rootFragments.push(rootFragment)

    renderIsland({ island, widget, rootFragment, props })

    const observer = watchForPropChanges<P>({
      island,
      hostElement,
      initialProps,
      onNewProps: (newProps) => {
        renderIsland({ island, widget, rootFragment, props: newProps })
      },
      propsSelector,
    })

    island._rootsToObservers.set(rootFragment, observer)
  })

  return { rootFragments }
}
