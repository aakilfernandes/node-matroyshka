const defunction = require('defunction')

module.exports = defunction(['number'], 'Uint8Array', function fromNumber(number) {
  const results = []

  let remaining = number
  let index = 31

  while (remaining > 0) {
    const byte = remaining % 256
    results.unshift(remaining)
    remaining = (remaining - byte) / 256
    index = index - 1
  }

  return new Uint8Array(results)
})
