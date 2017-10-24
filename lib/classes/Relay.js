const net = require('net')
const _ = require('lodash')
const defunction = require('defunction')
const Envelope = require('./Envelope')
const Cryptix = require('./Cryptix')

const Relay = module.exports = defunction(['Keypair'], '*', function Relay(keypair) {
  this.keypair = keypair
})

Relay.prototype.createServer = defunction([], '*', function createServer() {
  const server = net.createServer((socket) => {
    socket.on('data', (dataBuffer) => {
      const data = new Uint8Array(dataBuffer)
      const cryptix = Cryptix.fromEncoding(data)
      const aesKey = this.keypair.getAesKey(cryptix.ephemeralPublicKey)
      cryptix.getEnvelope(this.keypair).command.execute(socket, aesKey)
    })
  })
  return server
})
