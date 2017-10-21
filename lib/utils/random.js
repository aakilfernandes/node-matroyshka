const crypto = require('crypto')
const defunction = require('defunction')

module.exports = defunction(['number'], 'Uint8Array', function random(length) {
  return new Uint8Array(crypto.randomBytes(length))
})
