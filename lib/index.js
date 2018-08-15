/* eslint-disable no-new */
import P5Instance from './deps/p5.js'
import Ractive from 'https://cdn.jsdelivr.net/npm/ractive@0.10.8/ractive.mjs'
import templates from './templates.js'
import Tetris from './classes/Tetris.js'

new P5Instance(p5 => {
  // eslint-disable-next-line no-unused-vars
  let VIEW, GAME
  const KEYS_BEING_PRESSED = new Set()
  const KEY_DIRECTION_MAP = {
    [p5.DOWN_ARROW]: 'down',
    [p5.LEFT_ARROW]: 'left',
    [p5.RIGHT_ARROW]: 'right',
    [p5.UP_ARROW]: 'up'
  }

  // globals refs
  window.p5 = p5

  p5.setup = () => {
    p5.noCanvas()

    GAME = new Tetris()
    VIEW = Ractive({
      components: {
        grid: Ractive.extend({ template: templates.grid }),
        infoPane: Ractive.extend({ template: templates.infoPane })
      },
      data: { grid: [], info: {} },
      target: '#root',
      template: templates.layout
    })
  }

  p5.draw = () => {
    // throttle key presses to every 4 frames
    if (p5.frameCount % 4 === 0) {
      KEYS_BEING_PRESSED.forEach(direction => {
        GAME.input(direction)
      })
    }

    GAME.nextFrame()
    VIEW.set({
      grid: GAME.grid,
      info: {
        nextItem: (() => {
          const { nextItem } = GAME
          let result

          if (nextItem) {
            const { height, width } = nextItem
            const points = GAME.nextItem.getPoints(0, 0)
            const type = nextItem.type + 1

            result = { height, width, points, type }
          }

          return result
        })(),
        score: GAME.score
      }
    })
  }

  p5.keyPressed = () => {
    const direction = KEY_DIRECTION_MAP[p5.keyCode]

    if (direction) {
      KEYS_BEING_PRESSED.add(direction)
    }
  }

  p5.keyReleased = () => {
    const direction = KEY_DIRECTION_MAP[p5.keyCode]

    if (direction) {
      KEYS_BEING_PRESSED.delete(direction)
    }
  }
})
