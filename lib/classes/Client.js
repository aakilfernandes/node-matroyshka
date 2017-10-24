const Socks5Server = require('./Socks5Server')
const _ = require('lodash')
const defunction = require('defunction')
const Envelope = require('./Envelope')
const random = require('../utils/random')
const net = require('net')
const resolveDns = require('../utils/resolveDns')
const Keypair = require('./Keypair')
const TcpCircuit = require('./TcpCircuit')

const Client = module.exports = defunction(['Keypair', '[]RelayDescriptor'], '*', function Client(keypair, relayDescriptors) {
  _.merge(this, { keypair, relayDescriptors })
})

Client.prototype.createTcpCircuitSocks5Server = defunction([], 'Socks5Server', function createTcpCircuitSocks5Server() {
  const socks5Server = new Socks5Server()

  socks5Server.emitter.on('connection', (connectionPojo) => {

    const tcpCircuit = new TcpCircuit(
      this.keypair,
      _.shuffle(this.relayDescriptors).slice(0, 3),
      connectionPojo.port,
      connectionPojo.addressType,
      connectionPojo.address
    )
    tcpCircuit.ready().then(() => {
      connectionPojo.socket.on('data', (dataBuffer) => {
        tcpCircuit.send(new Uint8Array(dataBuffer))
      })
      connectionPojo.socket.on('end', () => {
        tcpCircuit.socket.end()
      })

      tcpCircuit.emitter.on('data', (data) => {
        connectionPojo.socket.write(new Buffer(data))
      })
      tcpCircuit.socket.on('end', () => {
        connectionPojo.socket.end()
      })
      connectionPojo.ready()
    })
  })

  return socks5Server
})
