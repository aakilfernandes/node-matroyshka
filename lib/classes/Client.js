const Socks5Server = require('./Socks5Server')
const _ = require('lodash')
const defunction = require('defunction')
const Greeting = require('./Greeting')
const random = require('../utils/random')
const net = require('net')
const resolveDns = require('../utils/resolveDns')
const Keypair = require('./Keypair')
const ProxyCircuit = require('./ProxyCircuit')
const TcpConnectCommand = require('./commands/TcpConnect')
const Emitter = require('events')
const getSocketIdString = require('../utils/getSocketIdString')

const Client = module.exports = defunction(['Keypair', '[]ProxyDescriptor'], '*', function Client(keypair, relayDescriptors) {
  _.merge(this, { keypair, relayDescriptors })
})

Client.prototype.createProxyCircuitSocks5Server = defunction([], 'Socks5Server', function createProxyCircuitSocks5Server() {
  const socks5Server = new Socks5Server()

  const proxyCircuit = new ProxyCircuit(
    this.keypair,
    _.shuffle(this.relayDescriptors).slice(0, 3)
  )

  socks5Server.emitter.on('connection', (connectionPojo) => {
    const socketId = random(16)
    const socketIdString = getSocketIdString(socketId)

    proxyCircuit.connect(
      socketId,
      connectionPojo.port,
      connectionPojo.addressType,
      connectionPojo.address
    ).then(() => {
      connectionPojo.socket.on('end', (dataBuffer) => {
        proxyCircuit.disconnect(socketId, new Uint8Array(dataBuffer))
      })
      connectionPojo.socket.on('data', (dataBuffer) => {
        proxyCircuit.forward(socketId, new Uint8Array(dataBuffer))
      })
      proxyCircuit.emitter.once(`response.tcpDisconnect.${socketIdString}`, (response) => {
        connectionPojo.socket.end(new Buffer(repsonse.data))
      })
      proxyCircuit.emitter.on(`response.tcpBackward.${socketIdString}`, (response) => {
        connectionPojo.socket.write(new Buffer(response.data))
      })
      connectionPojo.ready()
    })
  })

  return socks5Server
})
