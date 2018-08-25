import Item from './Item.js'

export default class Game {
  constructor (dimensions) {
    this._grid = []
    this.frameCount = 0
    this.gameOver = false
    this.gridSize = { x: 15, y: 20 }
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
        result[y][x] = this.item.type
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

    if (this._hasFullRows()) {
      this._removeFullRows()
    }

    if (this._isTouchingTop()) {
      this.gameOver = true
    } else {
      this.item = this.nextItem
      this.nextItem = new Item(this.gridSize.x)
    }
  }

  _itemHits (direction) {
    return this.item.points.some(point => {
      const [ x, y ] = point

      switch (direction) {
        case 'down':
          return this._grid[y + 1] && this._grid[y + 1][x] > 0
        case 'left':
          return this._grid[y][x - 1] > 0
        case 'right':
          return this._grid[y][x + 1] > 0
      }
    })
  }

  // indicates whether the current item should be
  // committed to the grid
  _itemShouldCommit () {
    let result = false

    // is at the bottom
    if (this.item.y + this.item.height >= this.gridSize.y) {
      result = true
    } else {
      // is above a non-empty space
      result = this._itemHits('down')
    }

    return result
  }

  _descendItem () {
    if (this._itemShouldCommit()) {
      this._commitGrid()
    } else {
      this.item.move('down')
    }
  }

  nextFrame () {
    if (!this.gameOver) {
      this.frameCount++

      if (this.item) {
        // auto-descend item every 60 frames
        if (this.frameCount % 60 === 0) {
          this._descendItem()
        }
      } else {
        this.item = new Item(this.gridSize.x)
        this.nextItem = new Item(this.gridSize.x)
      }
    }
  }

  input (direction) {
    if (!this.gameOver && this.item) {
      switch (direction) {
        case 'up':
          const potentialPoints = this.item.getPotentialRotation()
          const maxX = Math.max.apply(null, potentialPoints.map(point => point[0]))
          const maxY = Math.max.apply(null, potentialPoints.map(point => point[0]))

          if (maxX <= this.gridSize.x - 1 && maxY <= this.gridSize.y - 1) {
            const canRotate = potentialPoints.every(point => {
              const [ x, y ] = point
              const isOnGrid = this._grid[y] && typeof this._grid[y][x] === 'number'

              return isOnGrid && this._grid[y][x] === 0
            })

            if (canRotate) {
              this.item.rotate()
            }
          }
          break
        case 'down':
          this._descendItem()
          break
        case 'left':
          if (this.item.x > 0 && !this._itemHits('left')) {
            this.item.move(direction)
          }
          break
        case 'right':
          const isAtRightEdge = this.item.x + this.item.width >= this.gridSize.x

          if (!isAtRightEdge && !this._itemHits('right')) {
            this.item.move(direction)
          }
          break
      }
    }
  }
}
