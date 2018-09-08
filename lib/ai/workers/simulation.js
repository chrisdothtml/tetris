import Game from '../../tetris/Game.js'
import getGridHeuristics from '../heuristics.js'
import { createBrain, getDirectionsFromOutput } from '../brain.js'
import { parentPort } from 'worker_threads'

class Simulation {
  constructor (options = {}) {
    let { brain, game, maxMoves } = options

    this.brain = brain
    this.game = game
    this.maxMoves = maxMoves || Infinity
    this.moveCount = 0
    this.history = []
  }

  get heuristics () {
    return getGridHeuristics(this.game._grid)
  }

  simulate () {
    while (!this.game.gameOver && this.moveCount < this.maxMoves) {
      const input = this.game.grid.reduce((result, row) => result.concat(row), [])
      const output = this.brain.activate(input)
      const directions = getDirectionsFromOutput(output)

      this.history.push({
        grid: this.game.grid,
        move: output
      })

      directions.forEach(direction => {
        this.game.input(direction)
      })

      this.game.nextFrame()
      this.moveCount++
    }
  }
}

async function handleMessage (data) {
  const { game, brain } = data
  const sim = new Simulation({
    brain: createBrain(brain),
    game: Game.fromJSON(game),
    maxMoves: 600
  })

  sim.simulate()

  return {
    heuristics: sim.heuristics,
    history: sim.history,
    moveCount: sim.moveCount
  }
}

parentPort.on('message', data => {
  handleMessage(data)
    .then(result => parentPort.postMessage(result))
    .catch(e => console.error(e))
})
