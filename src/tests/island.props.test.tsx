import { h } from 'preact'
import { createIsland } from '../island'
import { useState } from 'preact/hooks'
import { render, waitFor } from '@testing-library/preact'
import userEvent from '@testing-library/user-event'
import { InlineScript } from './helpers/inlineScript'
import { getById } from './helpers/getById'

const Widget = (props: any) => {
  const [toggle, setToggle] = useState(false)

  return (
    <div data-testid="widget">
      <button
        data-testid="toggleButton"
        onClick={() => {
          setToggle((x) => !x)
        }}
      >
        toggle
      </button>
      {toggle ? <span data-testid="toggled">toggled</span> : null}
      <span data-testid="widgetProps">{JSON.stringify(props)}</span>
    </div>
  )
}

it('should render at the given selector and trigger a rerender (not remount) when new props are passed to the host', async () => {
  const user = userEvent.setup()
  const r = render(
    <div
      data-widget-host="island"
      data-testid="island-host"
      data-prop-test="bananas"
    ></div>,
  )

  const island = createIsland(Widget)
  island.render({
    selector: '[data-widget-host="island"]',
  })

  await waitFor(() =>
    expect(r.getByTestId('widgetProps').textContent).toEqual(
      '{"widgetHost":"island","testid":"island-host","test":"bananas"}',
    ),
  )

  /**
   * We set some local state to the rendered widget to make sure when we update the props that the localized state
   * continues to exist!
   */
  const buttonToggleNode = r.getByTestId('toggleButton')
  user.click(buttonToggleNode)
  await waitFor(() => expect(r.getByTestId('toggled')).toBeInTheDocument())

  const islandHost = r.getByTestId('island-host')
  islandHost.dataset.propTest = 'apples'

  // By asserting that toggled is still in the document it shows we didn't accidentally remount
  // the component on prop changes
  await waitFor(() => expect(r.getByTestId('toggled')).toBeInTheDocument())
  await waitFor(() =>
    expect(r.getByTestId('widgetProps').textContent).toEqual(
      '{"widgetHost":"island","testid":"island-host","test":"apples"}',
    ),
  )
})

it('should render at the given selector and trigger a rerender (not remount) when rerender is called with new props', async () => {
  const user = userEvent.setup()
  const r = render(
    <div
      data-widget-host="island"
      data-testid="island-host"
      data-prop-test="bananas"
    ></div>,
  )

  const island = createIsland(Widget)
  island.render({
    selector: '[data-widget-host="island"]',
  })

  await waitFor(() =>
    expect(r.getByTestId('widgetProps').textContent).toEqual(
      '{"widgetHost":"island","testid":"island-host","test":"bananas"}',
    ),
  )

  /**
   * We set some local state to the rendered widget to make sure when we update the props that the localized state
   * continues to exist!
   */
  const buttonToggleNode = r.getByTestId('toggleButton')
  user.click(buttonToggleNode)
  await waitFor(() => expect(r.getByTestId('toggled')).toBeInTheDocument())

  island.rerender({ test: 'apples' })

  // By asserting that toggled is still in the document it shows we didn't accidentally remount
  // the component on prop changes
  await waitFor(() => expect(r.getByTestId('toggled')).toBeInTheDocument())
  await waitFor(() =>
    expect(r.getByTestId('widgetProps').textContent).toEqual(
      '{"widgetHost":"island","testid":"island-host","test":"apples"}',
    ),
  )
})

it('should render at the given selector and trigger a rerender (not remount) when new props are passed to the child script props tag', async () => {
  const user = userEvent.setup()
  const r = render(
    <div data-widget-host="island" data-testid="island-host">
      <script type="application/json" data-testid="script-props">
        {'{"test": "bananas"}'}
      </script>
    </div>,
  )

  const island = createIsland(Widget)
  island.render({
    selector: '[data-widget-host="island"]',
  })

  await waitFor(() =>
    expect(r.getByTestId('widgetProps').textContent).toEqual(
      '{"widgetHost":"island","testid":"island-host","test":"bananas"}',
    ),
  )

  /**
   * We set some local state to the rendered widget to make sure when we update the props that the localized state
   * continues to exist!
   */
  const buttonToggleNode = r.getByTestId('toggleButton')
  user.click(buttonToggleNode)
  await waitFor(() => expect(r.getByTestId('toggled')).toBeInTheDocument())

  const scriptProps = r.getByTestId('script-props')
  scriptProps.innerHTML = '{"test": "apples"}'

  // By asserting that toggled is still in the document it shows we didn't accidentally remount
  // the component on prop changes
  await waitFor(() => expect(r.getByTestId('toggled')).toBeInTheDocument())
  await waitFor(() =>
    expect(r.getByTestId('widgetProps').textContent).toEqual(
      '{"widgetHost":"island","testid":"island-host","test":"apples"}',
    ),
  )
})

it('should render at the given selector and trigger a rerender (not remount) when new props are passed to the targeted props script', async () => {
  const user = userEvent.setup()
  const r = render(
    <div>
      <div data-widget-host="island" data-testid="island-host"></div>
      <script
        type="application/json"
        data-island-props="test-island"
        id="inline-script-test"
      >
        {'{"test": "bananas"}'}
      </script>
    </div>,
  )

  const island = createIsland(Widget)
  island.render({
    selector: '[data-widget-host="island"]',
    propsSelector: '[data-island-props="test-island"]',
  })

  await waitFor(() =>
    expect(r.getByTestId('widgetProps').textContent).toEqual(
      '{"widgetHost":"island","testid":"island-host","test":"bananas"}',
    ),
  )

  /**
   * We set some local state to the rendered widget to make sure when we update the props that the localized state
   * continues to exist!
   */
  const buttonToggleNode = r.getByTestId('toggleButton')
  user.click(buttonToggleNode)
  await waitFor(() => expect(r.getByTestId('toggled')).toBeInTheDocument())

  const scriptProps = getById('inline-script-test')
  scriptProps.innerHTML = '{"test": "apples"}'

  // By asserting that toggled is still in the document it shows we didn't accidentally remount
  // the component on prop changes
  await waitFor(() => expect(r.getByTestId('toggled')).toBeInTheDocument())
  await waitFor(() =>
    expect(r.getByTestId('widgetProps').textContent).toEqual(
      '{"widgetHost":"island","testid":"island-host","test":"apples"}',
    ),
  )
})

it('should render at the given selector and trigger a rerender (not remount) when new props are passed to the injected script', async () => {
  const user = userEvent.setup()
  const r = render(
    <div>
      <div data-widget-host="island" data-testid="island-host"></div>
      <InlineScript
        widget={Widget}
        data-prop-test="bananas"
        renderCode={`
island.render({
  selector: '[data-widget-host="island"]',
  })
        `}
        id="inline-script"
      />
    </div>,
  )

  await waitFor(() =>
    expect(r.getByTestId('widgetProps').textContent).toEqual(
      '{"widgetHost":"island","testid":"island-host","test":"bananas"}',
    ),
  )

  /**
   * We set some local state to the rendered widget to make sure when we update the props that the localized state
   * continues to exist!
   */
  const buttonToggleNode = r.getByTestId('toggleButton')
  user.click(buttonToggleNode)
  await waitFor(() => expect(r.getByTestId('toggled')).toBeInTheDocument())

  const scriptProps = getById('inline-script')
  scriptProps.dataset.test = 'apples'

  // By asserting that toggled is still in the document it shows we didn't accidentally remount
  // the component on prop changes
  await waitFor(() => expect(r.getByTestId('toggled')).toBeInTheDocument())
  await waitFor(() =>
    expect(r.getByTestId('widgetProps').textContent).toEqual(
      '{"widgetHost":"island","testid":"island-host","test":"apples"}',
    ),
  )
})
