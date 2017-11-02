const _ = require('lodash')
const defunction = require('defunction')

const ProxyDescriptor = module.exports = defunction(['Uint8Array', 'Uint8Array', 'string', 'Uint8Array'], '*', function ProxyDescriptor(publicKey, port, addressType, address) {
  _.merge(this, { publicKey, port, addressType, address })
})
