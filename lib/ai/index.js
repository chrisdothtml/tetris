import fs from 'fs'
import Game from '../tetris/Game.js'
import getGridHeuristics from './heuristics.js'
import now from 'performance-now'
import path from 'path'
import WorkerPool from '../WorkerPool/WorkerPool.js'
import { Layer, Network } from 'synaptic'

const ROOT_PATH = path.resolve(__dirname, '../../')
const DATA_SAVE_PATH = path.resolve(ROOT_PATH, 'data.json')
const STATS_SAVE_PATH = path.resolve(ROOT_PATH, 'stats.json')
const DIRECTION_MAP = ['left', 'right', 'up', 'down']
const WORKER_POOL = new WorkerPool({
  workerPath: path.resolve(__dirname, 'workers/simulation.js')
})

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
    const hiddenLayer = new Layer(20)
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

async function asyncWhile (conditionCheck, iterator) {
  if (conditionCheck()) {
    await iterator()
    return asyncWhile(conditionCheck, iterator)
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

async function getNextMoves (game, network) {
  for (let i = WorkerPool.poolSize(); i; i--) {
    WORKER_POOL.queue({
      game: game.toJSON(),
      network: network.toJSON()
    })
  }

  const sims = await WORKER_POOL.run()
  return getBestSim(sims).history.slice(0, 10).map(({ move }) => move)
}

;(async () => {
  const brain = createNetwork()
  const learningRate = 0.1
  let gameCount = 1

  if (pathExists(STATS_SAVE_PATH)) {
    const stats = JSON.parse(fs.readFileSync(STATS_SAVE_PATH, 'utf-8'))
    gameCount = Math.max.apply(null, Object.keys(stats)) + 1
  }

  console.log('starting training...')
  // train indefinitely until process is killed
  await asyncWhile(() => true, async () => {
    const game = new Game()

    const start = now()
    await asyncWhile(() => !game.gameOver, async () => {
      const nextMoves = await getNextMoves(game, brain)

      for (const nextMove of nextMoves) {
        const input = game.grid.reduce((result, row) => result.concat(row), [])
        const directions = getDirectionsFromOutput(nextMove)

        brain.activate(input)
        brain.propagate(learningRate, nextMove)

        directions.forEach(direction => {
          game.input(direction)
        })

        game.nextFrame()
      }
    })

    console.log(`game took ${(now() - start).toFixed(1)}ms`)
    saveNetwork(brain)
    saveStats(game, gameCount)
    gameCount++
  })

  // we'll never get to this line for now, but putting here so I don't forget
  WORKER_POOL.destroy()
})().catch(e => console.error(e))
