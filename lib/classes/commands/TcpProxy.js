const defunction = require('defunction')
const net = require('net')
const getNumber = require('../../utils/getNumber')
const PromiseStub = require('../PromiseStub')
const _ = require('lodash')
const TcpProxyPacket = require('../TcpProxyPacket')
const AesCbc = require('../AesCbc')

const ack = new Uint8Array([1])

const TcpProxyCommand = module.exports = defunction(['Uint8Array', 'Uint8Array', 'Uint8Array'], '*', function Command(aesKey, port, address) {
  _.merge(this, { aesKey, port, address })
})

TcpProxyCommand.prototype.execute = defunction(['Socket'], 'undefined', function execute(socketIn) {
  socketIn.removeAllListeners()

  const socketOut = net.createConnection({
    port: getNumber(this.port),
    host: this.address.join('.')
  }, () => {
    const tcpProxyPacket = TcpProxyPacket.fromPlaintext(ack, this.aesKey)
    socketIn.write(new Buffer(tcpProxyPacket.getEncoding()))
  })

  socketIn.on('data', (dataBuffer) => {
    const tcpProxyPacketEncoding = new Uint8Array(dataBuffer)
    const tcpProxyPacket = TcpProxyPacket.fromEncoding(tcpProxyPacketEncoding)
    socketOut.write(new Buffer(tcpProxyPacket.getPlaintext(this.aesKey)))
  })
  socketIn.on('end', (dataBuffer) => {
    socketOut.end()
    socketOut.destroy()
  })

  socketOut.on('data', (dataBuffer) => {
    const tcpProxyPacket = TcpProxyPacket.fromPlaintext(new Uint8Array(dataBuffer), this.aesKey)
    socketIn.write(new Buffer(tcpProxyPacket.getEncoding()))
  })
  socketOut.on('end', () => {
    socketIn.end()
    socketIn.destroy()
  })

})

TcpProxyCommand.prototype.getPojo = defunction([], 'Object', function getPojo() {
  return {
    branch: 'tcpProxy',
    value: {
      aesKey: this.aesKey,
      port: this.port,
      address: this.address
    }
  }
})
