const defunction = require('defunction')
const sha256 = require('./sha256')

module.exports = defunction(['Uint8Array'], 'Uint8Array', function getBurnAddress(publicKey) {
  return sha256(publicKey).slice(0, 20)
})
