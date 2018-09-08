import config from '../common/config.json'
import { Layer, Network } from 'synaptic'

export const DIRECTION_MAP = ['left', 'right', 'up', 'down', null]

export function createBrain (json) {
  let result

  if (json) {
    result = Network.fromJSON(json)
  } else {
    const inputLayer = new Layer(config.grid.width * config.grid.height)
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

export function flattenGrid (grid) {
  return grid.reduce((result, row) => result.concat(row), [])
}

export function getDirectionsFromOutput (outputSet) {
  return DIRECTION_MAP.filter((direction, i) => {
    return direction && !!Math.round(outputSet[i])
  })
}
