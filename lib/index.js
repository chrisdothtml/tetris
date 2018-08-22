/* eslint-disable no-new */
import debounce from 'https://cdn.rawgit.com/lodash/lodash/4.17.10-es/debounce.js'
import P5Instance from './deps/p5.js'
import Ractive from 'https://cdn.jsdelivr.net/npm/ractive@0.10.8/ractive.mjs'
import templates from './templates.js'
import Tetris from './classes/Tetris.js'

const ITEM_COLORS = [
  'black',
  '#e74c3c',
  '#9b59b6',
  '#e67e22',
  'white',
  '#2ecc71',
  '#1abc9c',
  '#3498db'
]

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
      data: {
        getItemColor: type => ITEM_COLORS[type],
        grid: [],
        info: {}
      },
      target: '#root',
      template: templates.layout
    })
  }

  p5.draw = () => {
    if (GAME.gameOver) {
      p5.noLoop()
    } else {
      // throttle held-in keys to trigger every 4 frames
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
              const { height, type, width } = nextItem
              const points = nextItem.getPoints(0, 0)

              result = { height, width, points, type }
            }

            return result
          })(),
          score: GAME.score
        }
      })
    }
  }

  // setup debouncers for all the keys we want to support
  // being held down
  const keyHolds = ['down', 'left', 'right']
    .reduce((result, direction) => {
      return {
        ...result,
        [direction]: debounce(() => {
          KEYS_BEING_PRESSED.add(direction)
        }, 200)
      }
    }, {})

  p5.keyPressed = () => {
    const direction = KEY_DIRECTION_MAP[p5.keyCode]

    if (direction) {
      GAME.input(direction)

      if (keyHolds[direction]) {
        keyHolds[direction]()
      }
    }
  }

  p5.keyReleased = () => {
    const direction = KEY_DIRECTION_MAP[p5.keyCode]

    if (keyHolds[direction]) {
      keyHolds[direction].cancel()
      KEYS_BEING_PRESSED.delete(direction)
    }
  }
})
