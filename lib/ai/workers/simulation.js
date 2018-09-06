import Game from '../../tetris/Game.js'
import getGridHeuristics from '../heuristics.js'
import now from 'performance-now'
import path from 'path'
import { Network } from 'synaptic'
import { parentPort } from 'worker_threads'

const ROOT_PATH = path.resolve(__dirname, '../../../')
const TEMP_PATH = path.resolve(ROOT_PATH, '.tmp')
const DIRECTION_MAP = ['left', 'right', 'up', 'down']

/*
 * convert an output set to Game input directions
 */
function getDirectionsFromOutput (outputSet) {
  return DIRECTION_MAP.filter((_, i) => {
    return !!Math.round(outputSet[i])
  })
}

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
      // const output = MOVE_VARIATIONS[Math.floor(Math.random() * (MOVE_VARIATIONS.length - 1))]
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
  const { game, network: brain } = data
  const sim = new Simulation({
    brain: Network.fromJSON(brain),
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
