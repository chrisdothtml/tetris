export function random (...args) {
  let result

  if (args.length === 2) {
    const [ min, max ] = args

    result = random() * (max - min) + min
  } else {
    result = Math.random()
  }

  return result
}

export function randomInt (min, max) {
  return Math.floor(random() * ((max - min) + 1)) + min
}
