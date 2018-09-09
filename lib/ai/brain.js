import config from '../common/config.json'
import { Layer, Network } from 'synaptic'

const DIRECTION_MAP = ['left', 'right', 'up', 'down', null]

function flattenGrid (grid) {
  return grid.reduce((result, row) => result.concat(row), [])
}

function getDirectionsFromOutput (outputSet) {
  const result = new Set()

  DIRECTION_MAP.forEach((direction, i) => {
    if (direction && !!Math.round(outputSet[i])) {
      result.add(direction)
    }
  })

  return result
}

export default class Brain {
  constructor (json) {
    if (json) {
      this.network = Network.fromJSON(json)
    } else {
      const inputLayer = new Layer(config.grid.width * config.grid.height)
      const hiddenLayer = new Layer(20)
      const outputLayer = new Layer(5)

      inputLayer.project(hiddenLayer)
      hiddenLayer.project(outputLayer)

      this.network = new Network({
        input: inputLayer,
        hidden: [hiddenLayer],
        output: outputLayer
      })
    }
  }

  toJSON () {
    return this.network.toJSON()
  }

  /**
   * Activates the network based on the provided game
   *
   * @param {Game} game
   *
   * @returns {Set} directions
   */
  getInputs (game) {
    const input = flattenGrid(game.grid)
    const output = this.network.activate(input)

    return getDirectionsFromOutput(output)
  }

  /**
   * Trains the network based on the provided game
   * instance and tetris input Set
   *
   * @param {Game} game
   * @param {Set} directions
   */
  trainInputs (game, directions) {
    const output = DIRECTION_MAP.map(direction => {
      return directions.has(direction) ? 1 : 0
    })

    this.network.activate(flattenGrid(game.grid))
    this.network.propagate(0.3, output)
  }
}
