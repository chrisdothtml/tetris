import { Layer, Network } from 'synaptic'

export const DIRECTION_MAP = ['left', 'right', 'up', 'down']

export function createBrain (json) {
  let result

  if (json) {
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

export function getDirectionsFromOutput (outputSet) {
  return DIRECTION_MAP.filter((_, i) => {
    return !!Math.round(outputSet[i])
  })
}
