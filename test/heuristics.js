import test from 'ava'
import getGridHeuristics, {
  countGridHoles,
  getGridHeight,
  getGridRoughness,
  getYPeaks
} from '../lib/ai/heuristics.js'

test('countGridHoles', t => {
  const empty = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]
  const holey = [
    [0, 2, 0, 5],
    [0, 3, 4, 2],
    [1, 0, 6, 0],
    [1, 0, 0, 1]
  ]
  const full = [
    [1, 2, 3],
    [4, 5, 6],
    [1, 2, 3]
  ]

  t.is(countGridHoles(empty), 0)
  t.is(countGridHoles(holey), 4)
  t.is(countGridHoles(full), 0)
})

test('getGridHeight', t => {
  const empty = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]
  const halfway = [
    [0, 0, 0],
    [0, 0, 0],
    [1, 0, 4],
    [1, 0, 0]
  ]
  const full = [
    [0, 0, 6],
    [0, 3, 0],
    [1, 0, 4]
  ]

  t.is(getGridHeight(empty), 0)
  t.is(getGridHeight(halfway), halfway.length / 2)
  t.is(getGridHeight(full), full.length)
})

test('getGridRoughness', t => {
  const empty = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]
  const halfway = [
    [0, 0, 0],
    [0, 2, 0],
    [1, 5, 4]
  ]
  const full = [
    [0, 0, 6, 0],
    [0, 3, 0, 0],
    [1, 0, 4, 0],
    [0, 0, 4, 0]
  ]

  t.is(getGridRoughness(empty), 0)
  t.is(getGridRoughness(halfway), 2)
  t.is(getGridRoughness(full), 5)
})

test('getYPeaks', t => {
  const empty = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]
  const full = [
    [0, 2, 0],
    [0, 5, 6],
    [0, 2, 0],
    [4, 5, 6]
  ]

  t.deepEqual(getYPeaks(empty), [2, 2, 2])
  t.deepEqual(getYPeaks(full), [3, 0, 1])
})

test('getGridHeuristics', t => {
  const grid = [
    [0, 0, 3, 0],
    [0, 0, 6, 0],
    [0, 2, 0, 0],
    [4, 5, 6, 0]
  ]

  t.deepEqual(getGridHeuristics(grid), {
    height: 4,
    holes: 1,
    roughness: 6
  })
})
