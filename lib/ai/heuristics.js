export function getYPeaks (grid) {
  const firstRow = grid[0]
  const xSize = firstRow.length
  const ySize = grid.length
  const result = firstRow.map(_ => (ySize - 1))
  let x, y

  for (x = 0; x < xSize; x++) {
    for (y = 0; y < grid.length; y++) {
      // once a non-zero cell is found, we have the
      // peak for this x
      if (grid[y][x] > 0) {
        result[x] = y
        break
      }
    }
  }

  return result
}

/*
 * Number of inaccessible grid cells
 */
export function countGridHoles (grid) {
  const yPeaks = getYPeaks(grid)
  const xSize = yPeaks.length
  const ySize = grid.length
  let result = 0
  let x, y

  for (x = 0; x < xSize; x++) {
    const peak = yPeaks[x]

    if (peak < ySize - 1) {
      for (y = peak + 1; y < ySize; y++) {
        // if any zero cells below peak, increase
        // the count
        if (grid[y][x] === 0) {
          result++
        }
      }
    }
  }

  return result
}

/*
 * Tallest column in the grid
 */
export function getGridHeight (grid) {
  const ySize = grid.length
  let result = 0

  for (let y = 0; y < ySize; y++) {
    if (grid[y].some(Boolean)) {
      result = ySize - y
      break
    }
  }

  return result
}

/*
 * Difference of height across all columns
 */
export function getGridRoughness (grid) {
  return getYPeaks(grid)
    .reduce((result, peak, i, arr) => {
      const nextPeak = arr[i + 1]

      if (typeof nextPeak === 'number') {
        result += Math.abs(peak - nextPeak)
      }

      return result
    }, 0)
}

export default function getGridHeuristics (grid) {
  return {
    height: getGridHeight(grid),
    holes: countGridHoles(grid),
    roughness: getGridRoughness(grid)
  }
}
