import config from '../config.js'
import Item from './Item.js'

export default class Tetris {
  constructor (dimensions) {
    this.gridSize = config.gridSize
    this.frameCount = 0
    this.item = null
    this._grid = []

    // populate grid
    for (let i = 0; i < this.gridSize.y; i++) {
      const line = []

      for (let i = 0; i < this.gridSize.x; i++) line.push(0)
      this._grid.push(line)
    }
  }

  get grid () {
    const result = Array.from(this._grid).map(row => Array.from(row))

    if (this.item) {
      this.item.points.forEach((point) => {
        const [ x, y ] = point
        result[y][x] = this.item.type
      })
    }

    return result
  }

  nextFrame () {
    this.frameCount++

    if (this.item) {
      if (this.frameCount % 60 === 0) {
        this.item.y += 1
      }
    } else {
      this.item = new Item()
    }
  }

  input (direction) {
    if (this.item) {
      switch (direction) {
        case 'up':
          // rotate
          break
        case 'down':
          this.item.y += 1
          break
        case 'left':
          if (this.item.x > 0) {
            this.item.x -= 1
          }
          break
        case 'right':
          if ((this.item.x + this.item.width - 1) < (this.gridSize.x - 1)) {
            this.item.x += 1
          }
          break
      }
    }
  }
}
