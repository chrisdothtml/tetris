import P5Instance from './deps/p5.js'

// eslint-disable-next-line no-new
new P5Instance(p5 => {
  window.p5 = p5

  // triggered after preload
  p5.setup = () => {
    //
  }

  // triggered for every frame
  p5.draw = () => {
    //
  }
})
