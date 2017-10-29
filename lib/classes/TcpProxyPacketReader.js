const Emitter = require('events')
const TcpProxyPacket = require('./TcpProxyPacket')
const defunction = require('defunction')
const getNumber = require('../utils/getNumber')

const TcpProxyPacketReader = module.exports = defunction([], '*', function TcpProxyPacketReader() {
  this.emitter = new Emitter
  this.currentData = new Uint8Array(0)
})

TcpProxyPacketReader.prototype.push = defunction(['Uint8Array'], 'undefined', function push(newData) {
  const  combinedData = new Uint8Array(this.currentData.length + newData.length)
  combinedData.set(this.currentData)
  combinedData.set(newData, this.currentData.length)
  if (combinedData.length < 50) {
    this.currentData = combinedData
    return
  }
  const ciphertextLengthUint8Array = combinedData.slice(48, 50)
  const ciphertextLength = getNumber(ciphertextLengthUint8Array)
  if (combinedData.length < (50 + ciphertextLength)) {
    this.currentData = combinedData
    return
  }
  const tcpProxyPacket = TcpProxyPacket.fromEncoding(combinedData)
  this.currentData = combinedData.slice(50 + ciphertextLength)
  this.emitter.emit('tcpProxyPacket', tcpProxyPacket)
  this.push(new Uint8Array(0)) // might be more than one TcpProxyPacket in the combinedData, so re-run
})
