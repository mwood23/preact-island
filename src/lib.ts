import { ComponentType, h, render } from 'preact'
import { InitialProps, Island } from './island'

type HostElement = HTMLElement

/**
 * Removes `-` from a string and capitalize the letter after
 * example: data-props-hello-world => dataPropsHelloWorld
 * Used for props passed from host DOM element
 * @param  {String} str string
 * @return {String} Capitalized string
 */
export const formatProp = (str: string) => {
  return `${str.charAt(0).toLowerCase()}${str.slice(1)}`
}

/**
 * [getExecutedScript internal widget to provide the currently executed script]
 * @param  {document} document [Browser document object]
 * @return {HTMLElement}     [script Element]
 */
export const getExecutedScript = () => {
  return document.currentScript
}

export const getPropsFromElement = (
  element: HostElement | HTMLOrSVGScriptElement,
) => {
  // @ts-ignore
  const { dataset } = element

  const props: { [x: string]: any } = {}

  for (var d in dataset) {
    // We don't pull props for inherited attributes
    if (dataset.hasOwnProperty(d) === false) return

    // data-prop or data-props works!
    const propName = formatProp(d.split(/(props?)/).pop() || '')

    if (propName !== '') {
      props[propName] = dataset[d]
    }
  }

  return props
}

export const isValidPropsScript = (element: Element) => {
  return (
    element.tagName.toLowerCase() === 'script' &&
    ['text/props', 'application/json'].includes(
      element.getAttribute('type') || '',
    )
  )
}

export const getInteriorPropsScriptsForElement = (element: HTMLElement) => {
  return [...element.getElementsByTagName('script')].filter(isValidPropsScript)
}

export const getPropsScriptsBySelector = (selector: string) => {
  return [...document.querySelectorAll(selector)].filter(
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

const getHabitatSelectorFromClient = (currentScript: any) => {
  let scriptTagAttrs = currentScript.attributes
  let selector = null
  // check for another props attached to the tag
  Object.keys(scriptTagAttrs).forEach((key) => {
    if (scriptTagAttrs.hasOwnProperty(key)) {
      const dataAttrName = scriptTagAttrs[key].name
      if (dataAttrName === 'data-mount-in') {
        selector = scriptTagAttrs[key].nodeValue
      }
    }
  })
  return selector
}

/**
 * Return array of 0 or more elements that will host our widget
 * @return {Array}        Array of matching habitats
 */
export const widgetDOMHostElements = ({ selector }: { selector?: string }) => {
  let hostNodes: HostElement[] = []
  let currentScript = getExecutedScript()

  // Assume inline if no selector is present
  if (selector == null) {
    if (currentScript?.parentNode) {
      // @ts-ignore
      hostNodes.push(currentScript.parentNode)
    }
    return hostNodes
  }

  ;[].forEach.call(document.querySelectorAll(selector), (queriedTag) => {
    hostNodes.push(queriedTag)
  })
  return hostNodes
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
  // @ts-ignore
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
  hostElement: HTMLElement
  initialProps: any
  onNewProps: (props: P) => void
  propsSelector: string | undefined | null
}) => {
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
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

/**
 * preact render function that will be queued if the DOM is not ready
 * and executed immediately if DOM is ready
 */

export const preactRender = <P extends InitialProps>({
  island,
  widget,
  hostElements,
  cleanTarget,
  replaceTarget,
  initialProps,
  propsSelector,
}: {
  island: Island<P>
  widget: ComponentType<P>
  hostElements: Array<HostElement>
  cleanTarget: boolean
  replaceTarget: boolean
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
    if (cleanTarget) {
      hostElement.replaceChildren()
    }

    let rootFragment: any
    if (replaceTarget) {
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

    render(h(widget, props), rootFragment)

    const observer = watchForPropChanges<P>({
      island,
      hostElement,
      initialProps,
      onNewProps: (newProps) => {
        render(h(widget, newProps), rootFragment)
      },
      propsSelector,
    })

    island._rootsToObservers.set(rootFragment, observer)
  })

  return { rootFragments }
}
