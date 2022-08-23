import { createIsland } from '../../dist/index.module'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import style from './call-to-action.island.css'
import { injectCSS } from './utils'
import cx from 'clsx'

injectCSS(style)

const Widget = ({ backgroundColor }: { backgroundColor?: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button
        className="cta_button"
        style={{ backgroundColor: backgroundColor }}
        onClick={() => setIsOpen(true)}
      >
        All expenses paid island vacation. Click to enter!
      </button>

      {isOpen &&
        createPortal(
          <div className={cx('cta__modal', isOpen && 'cta__modal--visible')}>
            <img src="https://github.com/mwood23/preact-island/raw/master/docs/preact-island.svg" />
            <p>Portals work with islands too!</p>
            <button className="cta_button" onClick={() => setIsOpen(false)}>
              close
            </button>
          </div>,
          document.body,
        )}
      {isOpen &&
        createPortal(
          <div
            className={cx(
              'cta__modal-dimmer',
              isOpen && 'cta__modal-dimmer--visible',
            )}
            onClick={() => setIsOpen(false)}
          />,
          document.body,
        )}
    </div>
  )
}

const island = createIsland(Widget)
island.render({
  selector: '[data-island="call-to-action"]',
})
