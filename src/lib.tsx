import { ComponentType, h, render } from 'preact'

type HostElement = HTMLElement
/**
 * Removes `-` from a string and capitalize the letter after
 * example: data-props-hello-world => dataPropsHelloWorld
 * Used for props passed from host DOM element
 * @param  {String} str string
 * @return {String} Capitalized string
 */
const camelcasize = (str: string) => {
  return str.replace(/-([a-z])/gi, (all, letter) => {
    return letter.toUpperCase()
  })
}

/**
 * [getExecutedScript internal widget to provide the currently executed script]
 * @param  {document} document [Browser document object]
 * @return {HTMLElement}     [script Element]
 */
const getExecutedScript = () => {
  return document.currentScript
}

const getPropsFromElement = (element: HostElement | HTMLOrSVGScriptElement) => {
  // @ts-ignore
  const { dataset } = element

  const props: { [x: string]: any } = {}

  for (var d in dataset) {
    // We don't pull props for inherited attributes
    if (dataset.hasOwnProperty(d) === false) return

    // data-prop or data-props works!
    let propName = d.split(/(data-props?-)/).pop() || ''
    propName = camelcasize(propName)

    if (d !== propName) {
      props[propName] = dataset[d]
    }

    return props
  }
}

const getInteriorScriptProps = (element: HTMLElement) => {
  let interiorScriptProps: any = {}
  ;[].forEach.call(
    element.getElementsByTagName('script'),
    (scrp: HTMLScriptElement) => {
      if (
        ['text/props', 'application/json'].includes(
          scrp.getAttribute('type') ?? '',
        )
      ) {
        // Swallow any potential errors
        try {
          interiorScriptProps = {
            ...interiorScriptProps,
            ...JSON.parse(scrp.innerHTML),
          }
        } catch (e: any) {
          console.error(e)
        }
      }
    },
  )
  return interiorScriptProps
}

/**
 * Get the props from a host element's data attributes
 * @param  {Element} tag The host element
 * @return {Object}  props object to be passed to the component
 */
const generateHostElementProps = <P extends {}>(
  element: HostElement,
  defaultProps = {},
): P => {
  const elementProps = getPropsFromElement(element)

  const currentScript = getExecutedScript()
  const currentScriptProps = currentScript
    ? getPropsFromElement(currentScript)
    : {}
  const interiorScriptProps = getInteriorScriptProps(element)

  return {
    ...defaultProps,
    ...elementProps,
    ...currentScriptProps,
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
const widgetDOMHostElements = ({ selector }: { selector?: string }) => {
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
 */
export function createRootFragment(
  parent: HTMLElement,
  replaceNode: HTMLElement | HTMLElement[],
): any {
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

const watchForPropChanges = <P extends {}>({
  hostElement,
  defaultProps,
  onNewProps,
}: {
  hostElement: HTMLElement
  defaultProps: any
  onNewProps: (props: P) => void
}) => {
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      onNewProps(generateHostElementProps(hostElement, defaultProps))
    })
  })

  const config = { attributes: true, childList: true, characterData: true }

  const executedScript = getExecutedScript()
  if (executedScript) {
    observer.observe(executedScript, config)
  }

  observer.observe(hostElement, config)
}

/**
 * preact render function that will be queued if the DOM is not ready
 * and executed immediately if DOM is ready
 */
const preactRender = <P extends {}>({
  widget,
  hostElements,
  cleanTarget,
  replaceTarget,
  defaultProps,
}: {
  widget: ComponentType<P>
  hostElements: Array<HostElement>
  cleanTarget: boolean
  replaceTarget: boolean
  defaultProps: P
}) => {
  hostElements.forEach((hostElement) => {
    const props = generateHostElementProps<P>(hostElement, defaultProps)
    if (cleanTarget) {
      hostElement.innerHTML = ''
    }

    const renderNode = document.createElement('div')
    hostElement.appendChild(renderNode)
    const rootFrag = createRootFragment(hostElement, renderNode)

    render(h(widget, props), rootFrag)

    watchForPropChanges<P>({
      hostElement,
      defaultProps,
      onNewProps: (newProps) => {
        render(h(widget, newProps), rootFrag)
      },
    })
  })
}

export {
  generateHostElementProps,
  widgetDOMHostElements,
  getExecutedScript,
  camelcasize,
  preactRender,
  getHabitatSelectorFromClient,
}
