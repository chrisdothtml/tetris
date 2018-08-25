/* eslint-disable no-new */

import Brain from '../ai/brain.js'
import Game from '../tetris/Game.js'
import P5Instance from 'p5'
import Ractive from 'ractive'
import templates from './templates.js'
import { debounce } from 'lodash-es'

const BRAIN = new Brain()
const TRAINING_INPUTS = new Set()
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

function parseQueryString (queryString) {
  return queryString
    .replace(/^\?/, '')
    .split('&')
    .reduce((result, pair) => {
      const [ key, value ] = pair.split('=')
      return { ...result, [key]: value }
    }, {})
}

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
  window.brain = BRAIN

  window.saveBrain = () => {
    p5.createStringDict(BRAIN.toJSON()).saveJSON('brain')
  }

  p5.setup = () => {
    const { seed } = parseQueryString(window.location.search)

    p5.noCanvas()

    GAME = new Game({ seed })
    VIEW = Ractive({
      components: {
        gameOverModal: Ractive.extend({ template: templates.gameOverModal }),
        grid: Ractive.extend({ template: templates.grid }),
        infoPane: Ractive.extend({ template: templates.infoPane })
      },
      data: {
        getItemColor: type => ITEM_COLORS[type],
        gameOver: false,
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
      VIEW.set({ gameOver: true })
    } else {
      // throttle held-in keys to trigger every 4 frames
      if (p5.frameCount % 4 === 0) {
        KEYS_BEING_PRESSED.forEach(direction => {
          GAME.input(direction)
          TRAINING_INPUTS.add(direction)
        })
      }

      // not training to do nothing yet; only training when there are inputs
      if (TRAINING_INPUTS.size) {
        BRAIN.trainInputs(GAME, TRAINING_INPUTS)
        TRAINING_INPUTS.clear()
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
              const points = nextItem.getPoints(0, 0)
              const type = nextItem.type + 1

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
      TRAINING_INPUTS.add(direction)

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
