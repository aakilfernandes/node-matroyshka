const defunction = require('defunction')

module.exports = defunction(['Uint8Array'], 'number', function getNumber(uint8Array) {
  let number = 0
  for (let i = 0; i < uint8Array.length; i++) {
    const byte = uint8Array[uint8Array.length - i - 1]
    if (byte === 0) {
      continue
    }
    number = number + byte * (Math.pow(256, i))
  }
  return number
})
