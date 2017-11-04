const net = require('net')
const _ = require('lodash')
const defunction = require('defunction')
const Cryptix = require('./Cryptix')
const ProxyPacketReader = require('./ProxyPacketReader')
const ProxyTcpManager = require('./ProxyTcpManager')
const getCommandFromEncoding = require('../utils/getCommandFromEncoding')
const GreetedResponse = require('./responses/Greeted')
const ProxyPacket = require('./ProxyPacket')

const Proxy = module.exports = defunction(['Keypair'], '*', function Proxys(keypair) {
  _.merge(this, { keypair })
})

Proxy.prototype.createServer = defunction([], '*', function createServer() {
  const server = net.createServer((socket) => {

    let isGreeted = false
    let aesKey
    let proxyTcpManager
    let proxyPacketReader

    socket.on('data', (dataBuffer) => {
      // TODO: CryptixReader
      const data = new Uint8Array(dataBuffer)

      if (isGreeted) {
        proxyPacketReader.push(new Uint8Array(data))
        return
      }

      const cryptix = Cryptix.fromEncoding(data)
      const greeting = cryptix.getGreeting(this.keypair)
      greeting.validate(cryptix.ephemeralPublicKey)
      isGreeted = true

      try {
        aesKey = this.keypair.getAesKey(cryptix.ephemeralPublicKey)
      } catch (err) {
        socket.destroy()
        return
      }

      proxyTcpManager = new ProxyTcpManager(socket, aesKey)
      proxyPacketReader = new ProxyPacketReader

      socket.on('end', () => {
        proxyPacketReader.push(new Uint8Array(dataBuffer))
        proxyTcpManager.destroy()
      })

      proxyPacketReader.emitter.on('proxyPacket', (proxyPacket) => {
        const commandEncoding = proxyPacket.getPlaintext(aesKey)
        const command = getCommandFromEncoding(commandEncoding)
        switch (command.type) {
          case 'tcpConnect':
          case 'tcpDisconnect':
          case 'tcpForward':
            proxyTcpManager.handle(command)
            break;
        }
      })

      const greetedResponse = new GreetedResponse
      const proxyPacket = ProxyPacket.fromPlaintext(greetedResponse.getEncoding(), aesKey)

      socket.write(new Buffer(proxyPacket.getEncoding()))
    })
  })
  return server
})
