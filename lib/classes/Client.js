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
  const client = this

  function link() {
    const proxyCircuit = new ProxyCircuit(
      client.keypair,
      _.shuffle(client.relayDescriptors).slice(0, 3)
    )

    proxyCircuit.emitter.once('end', () => {
      link()
    })

    socks5Server.emitter.on('connection', (connectionPojo) => {
      const socketId = random(16)
      const socketIdString = getSocketIdString(socketId)

      let isEnded = false

      proxyCircuit.emitter.once('end', () => {
        connectionPojo.socket.end()
        connectionPojo.socket.destroy()
        connectionPojo.socket.emit('end')
      })

      proxyCircuit.connect(
        socketId,
        connectionPojo.port,
        connectionPojo.addressType,
        connectionPojo.address
      ).then(() => {

        const onData = (dataBuffer) => {
          proxyCircuit.forward(socketId, new Uint8Array(dataBuffer))
        }

        const onDisconnect = (response) => {
          connectionPojo.socket.end(new Buffer(repsonse.data))
        }

        const onBackward = (response) => {
          connectionPojo.socket.write(new Buffer(response.data))
        }

        connectionPojo.socket.once('end', (dataBuffer) => {
          proxyCircuit.disconnect(socketId, new Uint8Array(dataBuffer))
          connectionPojo.socket.removeListener('data', onData)
          proxyCircuit.emitter.removeListener(`response.tcpDisconnect.${socketIdString}`, onDisconnect)
          proxyCircuit.emitter.removeListener(`response.tcpBackward.${socketIdString}`, onBackward)
        })
        connectionPojo.socket.on('data', onData)
        proxyCircuit.emitter.once(`response.tcpDisconnect.${socketIdString}`, onDisconnect)
        proxyCircuit.emitter.on(`response.tcpBackward.${socketIdString}`, onBackward)
        connectionPojo.ready()
      })
    })
  }

  link()

  return socks5Server
})
