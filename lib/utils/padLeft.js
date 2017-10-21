const defunction = require('defunction')

module.exports = defunction(['Uint8Array', 'number'], 'Uint8Array', function padLeft(uint8Array, length) {
  if (uint8Array.length === length)  {
    return uint8Array
  }
  if (uint8Array.length > length) {
    throw new Error(`Trying to pad Uint8Array(${uint8Array.length}) to ${length}`)
  }
  const paddingLength =  length - uint8Array.length
  const padded = (new Uint8Array(length)).fill(0)
  padded.set(uint8Array, paddingLength)
  return padded
})
