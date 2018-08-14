import { randomInt } from '../utils.js'

// each itemType has a function that takes in an x and y
// cooredinate and returns a set of points based on them
const itemTypes = ([
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
    return {
      getPoints,
      height,
      width
    }
  })

export default class Item {
  constructor () {
    this.type = randomInt(0, itemTypes.length - 1)
    this.height = itemTypes[this.type].height
    this.width = itemTypes[this.type].width
    this.x = 0
    this.y = 0
  }

  get points () {
    return itemTypes[this.type].getPoints(this.x, this.y)
  }
}
