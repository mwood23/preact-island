import { createIsland } from '../../island'
import {
  mount,
  getHostElements,
  formatProp,
  getExecutedScript,
  getInteriorPropsScriptsForElement,
  getPropsFromScripts,
  generateHostElementProps,
  getPropsFromElement,
  createRootFragment,
  watchForPropChanges,
  isValidPropsScript,
  renderIsland,
} from '../../lib'
import { h, FunctionComponent } from 'preact'

/**
 * Use this helper when you want to test what it's like to use an inline script to use preact-island. This imports and stubs everything the Babel transforms under
 * the hood for Jest to run the things. I'm not sure a better way to test this unless it's importing the dist files but then that requires a build step every time
 * we run tests.
 */
export const InlineScript: FunctionComponent<{
  widget: any
  renderCode: string
  id?: string
}> = ({ widget, renderCode, ...rest }) => {
  return (
    <script
      {...rest}
      dangerouslySetInnerHTML={{
        __html: `
(function() {
const _preact = preact
const _objectSpread = Object.assign
const _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();
function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }


const mount = ${mount};
const getHostElements = ${getHostElements};
const formatProp = ${formatProp};
const getExecutedScript = ${getExecutedScript};
const getInteriorPropsScriptsForElement = ${getInteriorPropsScriptsForElement};
const getPropsFromScripts = ${getPropsFromScripts};
const generateHostElementProps = ${generateHostElementProps};
const getPropsFromElement = ${getPropsFromElement};
const createRootFragment = ${createRootFragment};
const watchForPropChanges = ${watchForPropChanges};
const isValidPropsScript = ${isValidPropsScript};
const renderIsland = ${renderIsland};

const _lib = {
  mount: ${mount},
  getHostElements: ${getHostElements},
  formatProp: ${formatProp},
  getExecutedScript: ${getExecutedScript},
  getInteriorPropsScriptsForElement: ${getInteriorPropsScriptsForElement},
  getPropsFromScripts: ${getPropsFromScripts},
  generateHostElementProps: ${generateHostElementProps},
  getPropsFromElement: ${getPropsFromElement},
  createRootFragment: ${createRootFragment},
  watchForPropChanges: ${watchForPropChanges},
  isValidPropsScript: ${isValidPropsScript},
  renderIsland: ${renderIsland}
}

const createIsland = ${createIsland}
const island = createIsland(${widget})
${renderCode}
})()
`,
      }}
    ></script>
  )
}
