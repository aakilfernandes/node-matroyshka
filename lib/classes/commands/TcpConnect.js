const defunction = require('defunction')
const net = require('net')
const getNumber = require('../../utils/getNumber')
const PromiseStub = require('../PromiseStub')
const _ = require('lodash')
const ProxyPacket = require('../ProxyPacket')
const AesCbc = require('../AesCbc')
const ProxyPacketReader = require('../ProxyPacketReader')
const commandTemplate = require('../../templates/command')
const TcpConnectedResponse = require('../responses/TcpConnected')
const resolveDns = require('../../utils/resolveDns')

const ack = new Uint8Array([1])

const TcpConnectCommand = module.exports = defunction(['Uint8Array', 'Uint8Array', 'string', 'Uint8Array'], '*', function Command(socketId, port, addressType, address) {
  _.merge(this, {  type: 'tcpConnect', socketId, port, addressType, address })
})

TcpConnectCommand.prototype.getIpAddress = defunction([], '=>Uint8Array', function getIpAddress() {
  if (this.addressType === 'dns') {
    return resolveDns(this.address)
  } else {
    return Promise.resolve(this.address)
  }
})

TcpConnectCommand.prototype.getPojo = defunction([], 'Object', function getPojo() {
  return {
    branch: this.type,
    value: {
      socketId: this.socketId,
      port: this.port,
      address: {
        branch: this.addressType,
        value: this.address
      }
    }
  }
})

TcpConnectCommand.prototype.getEncoding = defunction([], 'Uint8Array', function getEncoding() {
  return commandTemplate.encode(this.getPojo())
})
