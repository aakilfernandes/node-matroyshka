const defunction = require('defunction')
const responseTemplate = require('../../templates/response')
const _ = require('lodash')

const ack = new Uint8Array([1])

const TcpConnectedResponse = module.exports = defunction(['Uint8Array'], '*', function Response(socketId) {
  _.merge(this, { type: 'tcpConnected', socketId })
})

TcpConnectedResponse.prototype.getPojo = defunction([], 'Object', function getPojo() {
  return {
    branch: this.type,
    value: this.socketId
  }
})

TcpConnectedResponse.prototype.getEncoding = defunction([], 'Uint8Array', function getEncoding() {
  return responseTemplate.encode(this.getPojo())
})
