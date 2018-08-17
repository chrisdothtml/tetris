import { randomInt } from '../utils.js'

// each itemType has a function that takes in an x and y
// cooredinate and returns a set of points based on them
const ITEM_TYPES = ([
  // 0000
  (x, y) => [
    [x, y], [x + 1, y], [x + 2, y], [x + 3, y]
  ],
  // 000
  // 0
  (x, y) => [
    [x, y], [x + 1, y], [x + 2, y], [x, y + 1]
  ],
  // 000
  //  0
  (x, y) => [
    [x, y], [x + 1, y], [x + 2, y], [x + 1, y + 1]
  ],
  // 000
  //   0
  (x, y) => [
    [x, y], [x + 1, y], [x + 2, y], [x + 2, y + 1]
  ],
  //  00
  // 00
  (x, y) => [
    [x + 1, y], [x + 2, y], [x, y + 1], [x + 1, y + 1]
  ],
  // 00
  //  00
  (x, y) => [
    [x, y], [x + 1, y], [x + 1, y + 1], [x + 2, y + 1]
  ],
  // 00
  // 00
  (x, y) => [
    [x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]
  ]
])
  .map((getPoints) => {
    const points = getPoints(1, 1)
    const height = Math.max.apply(null, points.map(point => point[1]))
    const width = Math.max.apply(null, points.map(point => point[0]))

    // for each type, calculate width and height, and
    // return object including them
    return { getPoints, height, width }
  })

function rotatePoints (points) {
  const height = Math.max.apply(null, points.map(point => point[1]))
  const width = Math.max.apply(null, points.map(point => point[0]))
  const [ originX, originY ] = [
    Math.max(0, Math.floor(width / 2)),
    Math.max(0, Math.floor(height / 2))
  ]

  // I'd rather not admit how long it took me to figure out
  // this formula
  return points.map(point => ([
    point[1] - originY + originX,
    -(point[0] - originX) + originY
  ]))
}

export default class Item {
  constructor (gridWidth) {
    const typeNumber = randomInt(0, ITEM_TYPES.length - 1)
    const itemType = ITEM_TYPES[typeNumber]

    // add all itemType properties to `this`
    Object.assign(this, itemType)
    this.rotations = 0
    this.type = typeNumber + 1
    // center item in grid
    this.x = Math.floor((gridWidth - this.width) / 2)
    this.y = 0
  }

  get points () {
    let points = this.getPoints(0, 0)

    for (let i = this.rotations; i > 0; i--) {
      points = rotatePoints(points)
    }

    // TODO: all seems to be working pretty well except when `0000` is rotated sideways; x coordinate is off (and probably y). seems like this will require normalizing also for positive overflow like it currently is for negative
    // adjust for negative coordinates
    for (let i = 0; i < 2; i++) {
      const smallest = Math.min.apply(null, points.map(point => point[i]))

      if (smallest < 0) {
        points = points.map(point => {
          point[i] += Math.abs(smallest)
          return point
        })
      }
    }

    // translate to actual coordinates
    return points.map(point => {
      return [ point[0] + this.x, point[1] + this.y ]
    })
  }

  rotate () {
    if (this.rotations === 3) {
      // reset rotation
      this.rotations = 0
    } else {
      this.rotations++
    }
  }
}
