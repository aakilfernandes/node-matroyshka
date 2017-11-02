const defunction = require('defunction')
const net = require('net')
const getNumber = require('../../utils/getNumber')
const PromiseStub = require('../PromiseStub')
const _ = require('lodash')
const ProxyPacket = require('../ProxyPacket')
const AesCbc = require('../AesCbc')
const resolveDns = require('../../utils/resolveDns')
const ProxyPacketReader = require('../ProxyPacketReader')
const responseTemplate = require('../../templates/response')
const TcpConnectedResponse = require('../responses/TcpConnected')
const constants = require('../../constants')

const ack = new Uint8Array([1])

const TcpDisconnectedResponse = module.exports = defunction(['Uint8Array', 'Uint8Array'], '*', function Response(socketId, data) {
  if (data.length > constants.tcpCommandDataMax) {
    throw new Error(`tcpCommandData (${data.length}) exceeds max of ${constants.tcpCommandDataMax}`)
  }
  _.merge(this, { type: 'tcpDisconnected', socketId, data })
})

TcpDisconnectedResponse.prototype.getPojo = defunction([], 'Object', function getPojo() {
  return {
    branch: this.type,
    value: {
      socketId: this.socketId,
      data: this.data
    }
  }
})

TcpDisconnectedResponse.prototype.getEncoding = defunction([], 'Uint8Array', function getEncoding() {
  return responseTemplate.encode(this.getPojo())
})
