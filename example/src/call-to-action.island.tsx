import { createIslandWebComponent, WebComponentPortal } from '../../src'
import { useState } from 'preact/hooks'
import style from './call-to-action.island.css'
import cx from 'clsx'

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

      {isOpen && (
        <WebComponentPortal style={style} name="bounty-modal">
          <div className={cx('cta__modal', isOpen && 'cta__modal--visible')}>
            <img src="https://github.com/mwood23/preact-island/raw/master/docs/preact-island.svg" />
            <p>Portals work with web component islands too!</p>
            <button className="cta_button" onClick={() => setIsOpen(false)}>
              close
            </button>
          </div>
        </WebComponentPortal>
      )}
      {isOpen && (
        <WebComponentPortal style={style} name="bounty-dimmer">
          <div
            className={cx(
              'cta__modal-dimmer',
              isOpen && 'cta__modal-dimmer--visible',
            )}
            onClick={() => setIsOpen(false)}
          />
        </WebComponentPortal>
      )}
    </div>
  )
}

const name = 'call-to-action'
const island = createIslandWebComponent(name, Widget)
island.render({
  selector: name,
})
island.injectStyles(style)
