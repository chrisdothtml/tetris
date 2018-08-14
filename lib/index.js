/* eslint-disable no-new */
import P5Instance from './deps/p5.js'
import Ractive from 'https://cdn.jsdelivr.net/npm/ractive@0.10.8/ractive.mjs'
import templates from './templates.js'
import Tetris from './classes/Tetris.js'

new P5Instance(p5 => {
  // eslint-disable-next-line no-unused-vars
  let gridVis, tetris

  // globals refs
  window.p5 = p5

  p5.setup = () => {
    // p5.noLoop()

    tetris = new Tetris()
    gridVis = Ractive({
      data: { rows: [] },
      target: '#root',
      template: templates.grid
    })
  }

  p5.draw = () => {
    tetris.nextFrame()
    gridVis.set({ rows: tetris.grid })
  }

  p5.keyPressed = () => {
    const directions = {
      [p5.DOWN_ARROW]: 'down',
      [p5.LEFT_ARROW]: 'left',
      [p5.RIGHT_ARROW]: 'right',
      [p5.UP_ARROW]: 'up'
    }

    if (directions[p5.keyCode]) {
      tetris.input(directions[p5.keyCode])
    }
  }
})
