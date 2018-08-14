import config from '../config.js'
import Item from './Item.js'

export default class Tetris {
  constructor (dimensions) {
    this._grid = []
    this.frameCount = 0
    this.gameOver = false
    this.gridSize = config.gridSize
    this.item = null
    this.nextItem = null
    this.score = 0

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
        result[y][x] = this.item.type + 1
      })
    }

    return result
  }

  _isTouchingTop () {
    return this._grid[0].some(cell => cell > 0)
  }

  _hasFullRows () {
    return this._grid.some(row => {
      return row.every(cell => cell > 0)
    })
  }

  _removeFullRows () {
    const newGrid = Array.from(this._grid).map(row => Array.from(row))
    let rowsRemoved = 0
    let i, j

    // loop backwards for splicing
    for (i = newGrid.length - 1; i > 0; i--) {
      if (newGrid[i].every(cell => cell > 0)) {
        newGrid.splice(i, 1)
        rowsRemoved++
      }
    }

    for (i = 0; i < rowsRemoved; i++) {
      const newRow = []

      for (j = 0; j < this.gridSize.x; j++) newRow.push(0)
      newGrid.splice(0, 0, newRow)
    }

    this.score += rowsRemoved
    this._grid = newGrid
  }

  _commitGrid () {
    this._grid = Array.from(this.grid)

    if (this._isTouchingTop()) {
      this.gameOver = true
    } else {
      this.item = this.nextItem
      this.nextItem = new Item()
    }
  }

  _descend () {
    if (this.item.y + this.item.height - 1 >= this.gridSize.y - 1) {
      this._commitGrid()
    } else {
      this.item.y += 1
    }
  }

  nextFrame () {
    if (!this.gameOver) {
      this.frameCount++

      if (this._hasFullRows()) {
        this._removeFullRows()
      }

      if (this.item) {
        if (this.frameCount % 60 === 0) {
          this._descend()
        }
      } else {
        this.item = new Item()
        this.nextItem = new Item()
      }
    }
  }

  input (direction) {
    if (!this.gameOver && this.item) {
      switch (direction) {
        case 'up':
          // TODO: rotate
          break
        case 'down':
          this._descend()
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
