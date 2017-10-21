const _ = require('lodash')
const defunction = require('defunction')

const RelayDescriptor = module.exports = defunction(['Uint8Array', 'Uint8Array', 'Uint8Array'], '*', function RelayDescriptor(publicKey, address, port) {
  _.merge(this, { publicKey, address, port })
})
