const defunction = require('defunction')
const net = require('net')
const getNumber = require('../../utils/getNumber')
const PromiseStub = require('../PromiseStub')
const _ = require('lodash')
const ProxyPacket = require('../ProxyPacket')
const AesCbc = require('../AesCbc')
const resolveDns = require('../../utils/resolveDns')
const ProxyPacketReader = require('../ProxyPacketReader')
const commandTemplate = require('../../templates/command')
const TcpConnectedResponse = require('../responses/TcpConnected')
const constants = require('../../constants')

const ack = new Uint8Array([1])

const TcpDisconnectCommand = module.exports = defunction(['Uint8Array', 'Uint8Array'], '*', function Command(socketId, data) {
  if (data.length > constants.tcpCommandDataMax) {
    throw new Error(`tcpCommandData (${data.length}) exceeds max of ${constants.tcpCommandDataMax}`)
  }
  _.merge(this, { type: 'tcpDisconnect', socketId, data })
})

TcpDisconnectCommand.prototype.getPojo = defunction([], 'Object', function getPojo() {
  return {
    branch: this.type,
    value: {
      socketId: this.socketId,
      data: this.data
    }
  }
})

TcpDisconnectCommand.prototype.getEncoding = defunction([], 'Uint8Array', function getEncoding() {
  return commandTemplate.encode(this.getPojo())
})
