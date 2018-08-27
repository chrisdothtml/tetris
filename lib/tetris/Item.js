import memoize from '../../node_modules/lodash-es/memoize.js'

function generateMemKey (...args) {
  return JSON.stringify(args)
}

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
    getPoints = memoize(getPoints, generateMemKey)
    const points = getPoints(1, 1)
    const height = Math.max.apply(null, points.map(point => point[1]))
    const width = Math.max.apply(null, points.map(point => point[0]))

    // for each type, calculate width and height, and
    // return object including them
    return { getPoints, height, width }
  })

const rotatePoints = memoize(function (points) {
  const height = Math.max.apply(null, points.map(point => point[1]))
  const width = Math.max.apply(null, points.map(point => point[0]))
  const [ originX, originY ] = [
    Math.max(0, Math.floor(width / 2)),
    Math.max(0, Math.floor(height / 2))
  ]

  // I'd rather not admit how long it took me to figure out
  // this formula
  return points.map(point => ([
    // rotate counter-clockwise
    point[1] - originY + originX,
    -(point[0] - originX) + originY
  ]))
}, generateMemKey)

const getPoints = memoize(function (type, rotations) {
  let points = ITEM_TYPES[type].getPoints(0, 0)

  for (let i = rotations; i > 0; i--) {
    points = rotatePoints(points)
  }

  // line coordinates up with 0, 0
  for (let i = 0; i < 2; i++) {
    const smallest = Math.min.apply(null, points.map(point => point[i]))

    if (smallest < 0) {
      points = points.map(point => {
        point[i] += Math.abs(smallest)
        return point
      })
    } else if (smallest > 0) {
      points = points.map(point => {
        point[i] -= smallest
        return point
      })
    }
  }

  return points
}, generateMemKey)

export default class Item {
  constructor (options = {}) {
    const { clone, gridWidth, rng } = options

    if (clone instanceof Item) {
      Object.assign(this, clone)
    } else {
      const typeNumber = Math.floor(rng() * (ITEM_TYPES.length - 1))
      const itemType = ITEM_TYPES[typeNumber]

      // add all itemType properties to `this`
      this.getPoints = itemType.getPoints
      this.rotations = 0
      this.type = typeNumber + 1
      // center item in grid
      this.x = Math.floor((gridWidth - itemType.width) / 2)
      this.y = 0
    }
  }

  get points () {
    return getPoints(this.type - 1, this.rotations)
      // translate to actual coordinates
      .map(point => {
        return [ point[0] + this.x, point[1] + this.y ]
      })
  }

  get height () {
    const points = this.points
    const max = Math.max.apply(null, points.map(point => point[1]))
    const min = Math.min.apply(null, points.map(point => point[1]))

    return max - min + 1
  }

  get width () {
    const points = this.points
    const max = Math.max.apply(null, points.map(point => point[0]))
    const min = Math.min.apply(null, points.map(point => point[0]))

    return max - min + 1
  }

  clone () {
    return new Item({ clone: this })
  }

  getPotentialRotation () {
    this.rotate()
    const result = this.points
    this.rotate()
    this.rotate()
    this.rotate()
    return result
  }

  move (direction) {
    switch (direction) {
      case 'down':
        this.y += 1
        break
      case 'left':
        this.x -= 1
        break
      case 'right':
        this.x += 1
        break
    }
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
