import { createIsland } from '../../src'
import { useState } from 'preact/hooks'
import { injectCSS } from './utils'
import style from './email-subscribe.island.css'

injectCSS(style)

const Widget = ({
  showEmail = true,
  showName = true,
  ...rest
}: {
  showEmail: boolean
  showName: boolean
}) => {
  const [value, setValue] = useState({ name: '', email: '' })
  return (
    <div className="email__container">
      <p className="email__title">Join our newsletter</p>
      <form
        onSubmit={() => {
          alert(`Submitted with: ${value.name}, ${value.email}`)
        }}
      >
        {showName && (
          <label className="email__input">
            Name
            <input
              name="name"
              onInput={(e: any) =>
                setValue((x) => ({ ...x, name: e.target.value }))
              }
            />
          </label>
        )}

        {showEmail && (
          <label className="email__input">
            Email
            <input
              name="email"
              onInput={(e: any) =>
                setValue((x) => ({ ...x, email: e.target.value }))
              }
            />
          </label>
        )}
        <button className="email__submit">Sign up</button>
      </form>
    </div>
  )
}

const island = createIsland(Widget)
island.render({
  selector: '[data-island="email-subscribe"]',
})
