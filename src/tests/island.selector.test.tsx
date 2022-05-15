import { createIsland } from '../island'
import { h } from 'preact'
import { render, waitFor } from '@testing-library/preact'

const Widget = (props: any) => {
  return <div data-testid="widget">{JSON.stringify(props)}</div>
}

it('should render at the given selector', async () => {
  const r = render(<div data-widget-host="island"></div>)

  await waitFor(() => expect(r.queryByTestId('widget')).not.toBeInTheDocument())

  const island = createIsland(Widget)
  island.render({
    selector: '[data-widget-host="island"]',
  })

  await waitFor(() =>
    expect(r.container).toMatchInlineSnapshot(`
      <div>
        <div
          data-widget-host="island"
        >
          <div
            data-testid="widget"
          >
            {"widgetHost":"island"}
          </div>
        </div>
      </div>
    `),
  )
})

it('should pass down default props', async () => {
  const r = render(<div data-widget-host="island"></div>)
  const initialProps = {
    apples: 'yes',
    bananas: 1,
    kiwis: true,
  }

  const island = createIsland(Widget)
  island.render({
    selector: '[data-widget-host="island"]',
    initialProps,
  })

  await waitFor(() =>
    expect(r.getByTestId('widget').innerHTML).toEqual(
      JSON.stringify({ ...initialProps, widgetHost: 'island' }),
    ),
  )
})

it('should render twice if multiple nodes are found from the selector', async () => {
  const r = render(
    <div>
      <div data-widget-host="island"></div>
      <div data-widget-host="island"></div>
    </div>,
  )
  const initialProps = {
    apples: 'yes',
    bananas: 1,
    kiwis: true,
  }

  const island = createIsland(Widget)
  island.render({
    selector: '[data-widget-host="island"]',
    initialProps,
  })

  // NOTE: Notice there is a different between this one and the other test.
  // This one render inside of two data-widget-host elements whereas the other
  // renders twice inside of the same data widget host element!
  await waitFor(() =>
    expect(r.container).toMatchInlineSnapshot(`
      <div>
        <div>
          <div
            data-widget-host="island"
          >
            <div
              data-testid="widget"
            >
              {"apples":"yes","bananas":1,"kiwis":true,"widgetHost":"island"}
            </div>
          </div>
          <div
            data-widget-host="island"
          >
            <div
              data-testid="widget"
            >
              {"apples":"yes","bananas":1,"kiwis":true,"widgetHost":"island"}
            </div>
          </div>
        </div>
      </div>
    `),
  )
})

it('should render multiple times if render is called twice', async () => {
  const r = render(<div data-widget-host="island"></div>)
  const initialProps = {
    apples: 'yes',
    bananas: 1,
    kiwis: true,
  }

  const island = createIsland(Widget)
  island.render({
    selector: '[data-widget-host="island"]',
    initialProps,
  })
  island.render({
    selector: '[data-widget-host="island"]',
    initialProps,
  })

  await waitFor(() =>
    expect(r.container).toMatchInlineSnapshot(`
      <div>
        <div
          data-widget-host="island"
        >
          <div
            data-testid="widget"
          >
            {"apples":"yes","bananas":1,"kiwis":true,"widgetHost":"island"}
          </div>
          <div
            data-testid="widget"
          >
            {"apples":"yes","bananas":1,"kiwis":true,"widgetHost":"island"}
          </div>
        </div>
      </div>
    `),
  )
})

it('should replace the node at given selector if prop is given', async () => {
  const r = render(<div data-widget-host="island"></div>)

  const island = createIsland(Widget)
  island.render({
    selector: '[data-widget-host="island"]',
    replaceTarget: true,
  })

  await waitFor(() =>
    expect(r.container).toMatchInlineSnapshot(`
      <div>
        <div
          data-testid="widget"
        >
          {"widgetHost":"island"}
        </div>
      </div>
    `),
  )
})

it('should destroy mounted islands when destroy called', async () => {
  const r = render(<div data-widget-host="island"></div>)

  const island = createIsland(Widget)
  island.render({
    selector: '[data-widget-host="island"]',
  })

  await waitFor(() =>
    expect(r.container).toMatchInlineSnapshot(`
      <div>
        <div
          data-widget-host="island"
        >
          <div
            data-testid="widget"
          >
            {"widgetHost":"island"}
          </div>
        </div>
      </div>
    `),
  )

  island.destroy()

  await waitFor(() =>
    expect(r.container).toMatchInlineSnapshot(`
      <div>
        <div
          data-widget-host="island"
        />
      </div>
    `),
  )
})

it('should destroy mounted islands when destroy called mode', async () => {
  const r = render(<div data-widget-host="island"></div>)

  const island = createIsland(Widget)
  island.render({
    selector: '[data-widget-host="island"]',
    replaceTarget: true,
  })

  await waitFor(() =>
    expect(r.container).toMatchInlineSnapshot(`
      <div>
        <div
          data-testid="widget"
        >
          {"widgetHost":"island"}
        </div>
      </div>
    `),
  )

  island.destroy()

  await waitFor(() => expect(r.container).toMatchInlineSnapshot(`<div />`))
})
