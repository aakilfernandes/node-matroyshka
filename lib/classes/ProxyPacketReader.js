const Emitter = require('events')
const ProxyPacket = require('./ProxyPacket')
const defunction = require('defunction')
const getNumber = require('../utils/getNumber')

const ProxyPacketReader = module.exports = defunction([], '*', function ProxyPacketReader() {
  this.emitter = new Emitter
  this.currentData = new Uint8Array(0)
})

ProxyPacketReader.prototype.push = defunction(['Uint8Array'], 'undefined', function push(newData) {
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
  const proxyPacket = ProxyPacket.fromEncoding(combinedData)
  this.currentData = combinedData.slice(50 + ciphertextLength)
  this.emitter.emit('proxyPacket', proxyPacket)
  this.push(new Uint8Array(0)) // might be more than one ProxyPacket in the combinedData, so re-run
})
