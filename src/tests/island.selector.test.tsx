import { h } from 'preact'
import { createIsland } from '../island'
import { render, waitFor, within } from '@testing-library/preact'
import { InlineScript } from './helpers/inlineScript'

const Widget = (props: any) => {
  return <div data-testid="widget">{JSON.stringify(props)}</div>
}

it('should render at the given selector', async () => {
  const r = render(<div data-island="island"></div>)

  await waitFor(() => expect(r.queryByTestId('widget')).not.toBeInTheDocument())

  const island = createIsland(Widget)
  island.render({
    selector: '[data-island="island"]',
  })

  await waitFor(() =>
    expect(r.container).toMatchInlineSnapshot(`
      <div>
        <div
          data-island="island"
        >
          <div
            data-testid="widget"
          >
            {"island":"island"}
          </div>
        </div>
      </div>
    `),
  )
})

it('should render inline if prop is passed and take highest priority', async () => {
  const r = render(
    <div data-testid="parent-node">
      <InlineScript
        widget={Widget}
        renderCode={`
island.render({
  inline: true
})
  `}
      />
    </div>,
  )

  await waitFor(() =>
    expect(r.getByTestId('parent-node').lastChild).toMatchInlineSnapshot(`
      <div
        data-testid="widget"
      >
        {"testid":"parent-node"}
      </div>
    `),
  )
})

it('should render using the data-mount-in prop and take priority over a selector if passed', async () => {
  const r = render(
    <div data-testid="parent-node">
      <div data-testid="selector" data-island="selector"></div>
      <div
        data-testid="inlineScriptMountIn"
        data-island="inlineScriptMountIn"
      ></div>
      <InlineScript
        widget={Widget}
        data-mount-in={`[data-island="inlineScriptMountIn"]`}
        renderCode={`
island.render({
  selector: '[data-island="island"]'
})
  `}
      />
    </div>,
  )

  await waitFor(() =>
    expect(
      within(r.getByTestId('selector')).queryByTestId('widget'),
    ).not.toBeInTheDocument(),
  )

  await waitFor(() =>
    expect(
      within(r.getByTestId('inlineScriptMountIn')).queryByTestId('widget'),
    ).toBeInTheDocument(),
  )
})

it('should pass down default props', async () => {
  const r = render(<div data-island="island"></div>)
  const initialProps = {
    apples: 'yes',
    bananas: 1,
    kiwis: true,
  }

  const island = createIsland(Widget)
  island.render({
    selector: '[data-island="island"]',
    initialProps,
  })

  await waitFor(() =>
    expect(r.getByTestId('widget').innerHTML).toEqual(
      JSON.stringify({ ...initialProps, island: 'island' }),
    ),
  )
})

it('should render twice if multiple nodes are found from the selector', async () => {
  const r = render(
    <div>
      <div data-island="island"></div>
      <div data-island="island"></div>
    </div>,
  )
  const initialProps = {
    apples: 'yes',
    bananas: 1,
    kiwis: true,
  }

  const island = createIsland(Widget)
  island.render({
    selector: '[data-island="island"]',
    initialProps,
  })

  // NOTE: Notice there is a different between this one and the other test.
  // This one render inside of two data-island elements whereas the other
  // renders twice inside of the same data widget host element!
  await waitFor(() =>
    expect(r.container).toMatchInlineSnapshot(`
      <div>
        <div>
          <div
            data-island="island"
          >
            <div
              data-testid="widget"
            >
              {"apples":"yes","bananas":1,"kiwis":true,"island":"island"}
            </div>
          </div>
          <div
            data-island="island"
          >
            <div
              data-testid="widget"
            >
              {"apples":"yes","bananas":1,"kiwis":true,"island":"island"}
            </div>
          </div>
        </div>
      </div>
    `),
  )
})

it('should render multiple times if render is called twice', async () => {
  const r = render(<div data-island="island"></div>)
  const initialProps = {
    apples: 'yes',
    bananas: 1,
    kiwis: true,
  }

  const island = createIsland(Widget)
  island.render({
    selector: '[data-island="island"]',
    initialProps,
  })
  island.render({
    selector: '[data-island="island"]',
    initialProps,
  })

  await waitFor(() =>
    expect(r.container).toMatchInlineSnapshot(`
      <div>
        <div
          data-island="island"
        >
          <div
            data-testid="widget"
          >
            {"apples":"yes","bananas":1,"kiwis":true,"island":"island"}
          </div>
          <div
            data-testid="widget"
          >
            {"apples":"yes","bananas":1,"kiwis":true,"island":"island"}
          </div>
        </div>
      </div>
    `),
  )
})

it('should replace the node at given selector if prop is given', async () => {
  const r = render(<div data-island="island"></div>)

  const island = createIsland(Widget)
  island.render({
    selector: '[data-island="island"]',
    replace: true,
  })

  await waitFor(() =>
    expect(r.container).toMatchInlineSnapshot(`
      <div>
        <div
          data-testid="widget"
        >
          {"island":"island"}
        </div>
      </div>
    `),
  )
})

it('should destroy mounted islands when destroy called', async () => {
  const r = render(<div data-island="island"></div>)

  const island = createIsland(Widget)
  island.render({
    selector: '[data-island="island"]',
  })

  await waitFor(() =>
    expect(r.container).toMatchInlineSnapshot(`
      <div>
        <div
          data-island="island"
        >
          <div
            data-testid="widget"
          >
            {"island":"island"}
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
          data-island="island"
        />
      </div>
    `),
  )
})

it('should destroy mounted islands when destroy called with replace: true', async () => {
  const r = render(<div data-island="island"></div>)

  const island = createIsland(Widget)
  island.render({
    selector: '[data-island="island"]',
    replace: true,
  })

  await waitFor(() =>
    expect(r.container).toMatchInlineSnapshot(`
      <div>
        <div
          data-testid="widget"
        >
          {"island":"island"}
        </div>
      </div>
    `),
  )

  island.destroy()

  await waitFor(() => expect(r.container).toMatchInlineSnapshot(`<div />`))
})
