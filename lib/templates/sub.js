const sub = require('../../lib/utils/sub')
const fromAnything = require('../../lib/utils/fromAnything')

const specs = [
  [0, 0, 0],
  [1, 0, 1],
  [1, 1, 0],
  [2, 1, 1],
  [255, 0, 255],
  [256, 0, 256],
  [256, 1, 255],
  [257, 0, 257],
  [257, 1, 256],
  [257, 2, 255],
  [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 255, 255, 255, 255, 255, 254], Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
]

for (let i = 0; i < 1000; i ++) {
  const a = Math.round(Math.random() * Number.MAX_SAFE_INTEGER)
  const b = Math.round(Math.random() * a)
  specs.push([a, b, a - b])
}

describe('utils:sub', () => {
  specs.forEach((spec, index) => {
    describe(`spec ${index}`, () => {
      const a = spec[0]
      const b = spec[1]
      const diff = spec[2]
      let result
      it(`should sub(${a}, ${b}) to ${diff}`, () => {
        sub(fromAnything(a), fromAnything(b)).should.deep.equal(fromAnything(diff))
      })
    })
  })
})
