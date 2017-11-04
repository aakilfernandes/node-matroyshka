const defunction = require('defunction')
const _ = require('lodash')
const Emitter = require('events')
const Cryptix = require('./Cryptix')
const PromiseStub = require('./PromiseStub')
const getNumber = require('../utils/getNumber')
const TcpConnectCommand = require('./commands/TcpConnect')
const TcpDisconnectCommand = require('./commands/TcpDisconnect')
const TcpForwardCommand = require('./commands/TcpForward')
const Greeting = require('./Greeting')
const sha256 = require('../utils/sha256')
const random = require('../utils/random')
const Keypair = require('./Keypair')
const net = require('net')
const AesCbc = require('./AesCbc')
const ProxyPacketReader = require('./ProxyPacketReader')
const getSocketIdString = require('../utils/getSocketIdString')
const ProxyPacket = require('./ProxyPacket')
const getResponseFromEncoding = require('../utils/getResponseFromEncoding')

const ProxyCircuit = module.exports = defunction(['Keypair', '[]ProxyDescriptor'], '*', function ProxyCircuit(keypair, proxyDescriptors) {

  _.merge(this, { keypair, proxyDescriptors, emitter: new Emitter })

  this.range = _.range(proxyDescriptors.length)

  this.ephemeralKeypairs = this.range.map(() => {
    return Keypair.generate()
  })

  this.aesKeys = this.range.map((index) => {
    const proxyDescriptor = this.proxyDescriptors[index]
    const ephemeralKeypair = this.ephemeralKeypairs[index]
    return ephemeralKeypair.getAesKey(proxyDescriptor.publicKey)
  })

  this.socketIds = this.range.slice(0, -1).map(() => {
    return random(16)
  })

  this.emitter.setMaxListeners(255)
})

ProxyCircuit.prototype.connect = defunction(['Uint8Array', 'Uint8Array', 'string', 'Uint8Array'], 'Promise', function connect(socketId, port, addressType, address) {
  const promiseStub = new PromiseStub
  const socketIdString = getSocketIdString(socketId)

  this.ready().then(() => {
    const command = new TcpConnectCommand(socketId, port, addressType, address)
    const commandEncoding = command.getEncoding()
    const layeredProxyPacketEncoding = this.getLayeredProxyPacketEncoding(commandEncoding)
    this.socket.write(new Buffer(layeredProxyPacketEncoding))
  })
  this.emitter.once(`response.tcpConnected.${socketIdString}`, () => {
    promiseStub.resolve()
  })
  return promiseStub.promise
})

ProxyCircuit.prototype.disconnect = defunction(['Uint8Array', 'Uint8Array'], 'undefined', function disconnect(socketId, data) {
  const command = new TcpDisconnectCommand(socketId, data)
  const commandEncoding = command.getEncoding()
  const layeredProxyPacketEncoding = this.getLayeredProxyPacketEncoding(commandEncoding)
  this.socket.write(new Buffer(layeredProxyPacketEncoding))
})

ProxyCircuit.prototype.forward = defunction(['Uint8Array', 'Uint8Array'], 'undefined', function forward(socketId, data) {
  const command = new TcpForwardCommand(socketId, data)
  const commandEncoding = command.getEncoding()
  const layeredProxyPacketEncoding = this.getLayeredProxyPacketEncoding(commandEncoding)
  this.socket.write(new Buffer(layeredProxyPacketEncoding))
})

ProxyCircuit.prototype.getLayeredProxyPacketEncoding = defunction(['Uint8Array', '*', '*'], 'Uint8Array', function getLayeredProxyPacketEncoding(
  plaintext,
  isCryptix = false,
  targetProxyIndex = this.range.length - 1
) {
  let packet = plaintext
  _.range(targetProxyIndex + 1).reverse().forEach((proxyIndex) => {
    if (proxyIndex < targetProxyIndex) {
      const socketId = this.socketIds[proxyIndex]
      const tcpForwardCommand = new TcpForwardCommand(socketId, packet)
      packet = tcpForwardCommand.getEncoding()
    }
    if (proxyIndex < targetProxyIndex || !isCryptix) {
      packet = ProxyPacket.fromPlaintext(packet, this.aesKeys[proxyIndex]).getEncoding()
    }
  })
  return packet
})

ProxyCircuit.prototype.ready = defunction([], '=>ProxyCircuit', function ready() {

  if (this.isReady) {
    return Promise.resolve(this)
  }

  if (this.readyPromise) {
    return this.readyPromise
  }

  const promiseStub = new PromiseStub

  this.readyPromise = promiseStub.promise

  const greetings = this.range.map((index) => {
    return new Greeting(
      this.keypair.publicKey,
      this.keypair.getSignature(this.ephemeralKeypairs[index].publicKey)
    )
  })

  const cryptixEncodings = this.range.map((index) => {
    const proxyDescriptor = this.proxyDescriptors[index]
    const ephemeralKeypair = this.ephemeralKeypairs[index]
    const greeting = greetings[index]
    const greetingCiphertext = ephemeralKeypair.getAesCbc(proxyDescriptor.publicKey).getCiphertext(greeting.getEncoding())
    const cryptix = new Cryptix(ephemeralKeypair.publicKey, greetingCiphertext)
    return cryptix.getEncoding()
  })

  const entryProxyDescriptor = this.proxyDescriptors[0]

  this.socket = net.createConnection({
    port: getNumber(entryProxyDescriptor.port),
    host: entryProxyDescriptor.address.join('.')
  })

  const proxyPacketReaders = this.range.map(() => {
    return new ProxyPacketReader
  })

  proxyPacketReaders.forEach((proxyPacketReader, index) => {
    const isLast = (index === (proxyPacketReaders.length - 1))
    const aesKey = this.aesKeys[index]

    proxyPacketReader.emitter.on('proxyPacket', (proxyPacket) => {

      const response = getResponseFromEncoding(proxyPacket.getPlaintext(aesKey))

      if (isLast || (response.type !== 'tcpBackward')) {
        this.emitter.emit(`response.${response.type}.${getSocketIdString(response.socketId)}`, response)
      } else {
        proxyPacketReaders[index + 1].push(response.data)
      }
    })

  })

  const packets = []

  this.range.forEach((targetProxyIndex) => {
    const isExitProxy = (targetProxyIndex === (this.range.length - 1))
    packets.push(
      this.getLayeredProxyPacketEncoding(cryptixEncodings[targetProxyIndex], true, targetProxyIndex)
    )
    if (isExitProxy) {
      return
    }
    const nextProxyDescriptor = this.proxyDescriptors[targetProxyIndex + 1]
    const socketId = this.socketIds[targetProxyIndex]
    const tcpConnectCommand = new TcpConnectCommand(
      socketId,
      nextProxyDescriptor.port,
      nextProxyDescriptor.addressType,
      nextProxyDescriptor.address
    )
    packets.push(
      this.getLayeredProxyPacketEncoding(tcpConnectCommand.getEncoding(), false, targetProxyIndex)
    )
  })

  const greetingListener = (dataBuffer) => {
    if (packets.length > 0) {
      this.socket.write(new Buffer(packets.shift()))
      return
    }
    this.isReady = true
    this.socket.removeListener('data', greetingListener)

    this.socket.on('data', (dataBuffer) => {
      proxyPacketReaders[0].push(new Uint8Array(dataBuffer))
    })
    promiseStub.resolve(this)
  }

  this.socket.on('data', greetingListener)

  this.socket.on('end', () => {
    this.emitter.emit('end')
  })

  this.socket.write(new Buffer(packets.shift()))

  return promiseStub.promise
})
