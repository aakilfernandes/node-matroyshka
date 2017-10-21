const defunction = require('defunction')
const _sha256 = require('sha256')

module.exports = defunction(['Uint8Array'], 'Uint8Array', function sha256(prehash) {
  return new Uint8Array(_sha256(prehash, { asBytes: true }))
})
