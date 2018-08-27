/* eslint-disable */
import fs from 'fs'
import Game from '../tetris/Game.js'
import path from 'path'
import random from 'lodash-es/random.js'
import getGridHeuristics from './heuristics.js'
import { Layer, Network } from 'synaptic'

const PROGRESS = {}
const DATA_SAVE_PATH = path.resolve(__dirname, '../../data.json')
const STATS_SAVE_PATH = path.resolve(__dirname, '../../stats.json')
const DIRECTION_MAP = ['left', 'right', 'up', 'down']
const MOVE_VARIATIONS = [
  [ 0, 0, 0, 0, 1 ], // nothing
  [ 0, 0, 0, 1, 0 ], // down
  [ 0, 0, 1, 0, 0 ], // up
  [ 0, 0, 1, 1, 0 ], // up + down
  [ 0, 1, 0, 0, 0 ], // right
  [ 0, 1, 0, 1, 0 ], // right + down
  [ 0, 1, 1, 0, 0 ], // right + up
  [ 1, 0, 0, 0, 0 ], // left
  [ 1, 0, 0, 1, 0 ], // left + down
  [ 1, 0, 1, 0, 0 ] // left + up
]

function pathExists (filepath) {
  try {
    fs.accessSync(filepath)
    return true
  } catch (e) {
    return false
  }
}

function createNetwork () {
  let result

  if (pathExists(DATA_SAVE_PATH)) {
    const data = fs.readFileSync(DATA_SAVE_PATH, 'utf-8')
    const json = JSON.parse(data)

    result = Network.fromJSON(json)
  } else {
    const inputLayer = new Layer(15 * 20)
    const hiddenLayer = new Layer(50)
    const outputLayer = new Layer(5)

    inputLayer.project(hiddenLayer)
    hiddenLayer.project(outputLayer)

    result = new Network({
      input: inputLayer,
      hidden: [hiddenLayer],
      output: outputLayer
    })
  }

  return result
}

function saveNetwork (network) {
  fs.writeFileSync(
    DATA_SAVE_PATH,
    JSON.stringify(network.toJSON()),
    'utf-8'
  )
}

function saveStats (game, gameCount) {
  let stats = {}

  if (pathExists(STATS_SAVE_PATH)) {
    const json = fs.readFileSync(STATS_SAVE_PATH, 'utf-8')
    stats = JSON.parse(json)
  }

  stats[gameCount] = {
    frameCount: game.frameCount,
    heuristics: getGridHeuristics(game.grid),
    score: game.score
  }

  fs.writeFileSync(
    STATS_SAVE_PATH,
    JSON.stringify(stats, null, 2),
    'utf-8'
  )
}

/*
 * convert an output set to Game input directions
 */
function getDirectionsFromOutput (outputSet) {
  return DIRECTION_MAP.filter((_, i) => {
    return !!Math.round(outputSet[i])
  })
}

/* only use this piece of shit of a function if you absolutely have to
function getMoveVariantFromOutput (outputSet) {
  const topTwoIndexes = []
  let highest = -Infinity

  outputSet.forEach((value, i) => {
    if (value > highest) {
      highest = value
      topTwoIndexes[0] = i
    }
  })

  highest = -Infinity
  outputSet.forEach((value, i) => {
    if (i !== topTwoIndexes[0] && value > highest) {
      highest = value
      topTwoIndexes[1] = i
    }
  })

  const moveVariant = []
  for (let i = 0; i < outputSet.length; i++) {
    moveVariant[i] = topTwoIndexes.includes(i) ? 1 : 0
  }

  for (let i = 0; i < MOVE_VARIATIONS.length; i++) {
    if (MOVE_VARIATIONS[i].join('') === moveVariant.join('')) {
      return moveVariant
    }
  }

  for (let i = 0; i < outputSet.length; i++) {
    moveVariant[i] = i === topTwoIndexes[0] ? 1 : 0
  }

  return moveVariant
} */

class Simulation {
  constructor (options = {}) {
    let { brain, game, maxMoves } = options

    this.brain = brain
    this.game = game.clone() || new Game()
    this.maxMoves = maxMoves || Infinity
    this.moveCount = 0
    this.history = []
  }

  get heuristics () {
    return getGridHeuristics(this.game._grid)
  }

  simulate () {
    while (!this.game.gameOver && this.moveCount < this.maxMoves) {
      // const output = MOVE_VARIATIONS[random(0, MOVE_VARIATIONS.length - 1)]
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

function getBestSim (sims) {
  let bestIndex = 0
  let bestScore = 0
  let maxHeight = 0
  let maxHoles = 0
  let maxMoves = 0
  let maxRoughness = 0

  sims
    .map(sim => {
      const { heuristics: { height, holes, roughness }, moveCount } = sim

      if (height > maxHeight) maxHeight = height
      if (holes > maxHoles) maxHoles = holes
      if (moveCount > maxMoves) maxMoves = moveCount
      if (roughness > maxRoughness) maxRoughness = roughness

      return { height, holes, roughness, moveCount }
    })
    .forEach((sim, index) => {
      const { height, holes, roughness, moveCount } = sim
      const score = -(height / maxHeight) - (holes / maxHoles) - (roughness / maxRoughness) + (moveCount / maxMoves)

      if (score > bestScore) {
        bestIndex = index
        bestScore = score
      }
    })

  return sims[bestIndex]
}

function getNextMove (game, brain) {
  const sims = []
  // let simCount = 100
  let simCount = 5

  while (simCount) {
    const sim = new Simulation({ brain, game, maxMoves: 180 })

    sim.simulate()
    sims.push(sim)
    simCount--
  }

  return getBestSim(sims).history[0].move
}

const brain = createNetwork()
const learningRate = 0.3
let gameCount = 1

if (pathExists(STATS_SAVE_PATH)) {
  const stats = JSON.parse(fs.readFileSync(STATS_SAVE_PATH, 'utf-8'))
  gameCount = Math.max.apply(null, Object.keys(stats))
}

console.log('starting training...')
// train indefinitely until process is killed
while (true) {
  const game = new Game()

  while (!game.gameOver) {
    const nextMove = getNextMove(game, brain)
    const directions = getDirectionsFromOutput(nextMove)

    // train with current best next move
    brain.propagate(learningRate, nextMove)

    directions.forEach(direction => {
      game.input(direction)
    })

    game.nextFrame()
  }

  // save stats every 10 games
  if (gameCount % 10 === 0) {
    console.log('saving network and stats...')
    saveNetwork(brain)
    saveStats(game, gameCount)
  }

  console.log(`training game ${gameCount} complete`)
  gameCount++
}
