const defunction = require('defunction')
const _ = require('lodash')
const Emitter = require('events')
const Cryptix = require('./Cryptix')
const PromiseStub = require('./PromiseStub')
const getNumber = require('../utils/getNumber')
const TcpProxyCommand = require('./commands/TcpProxy')
const Envelope = require('./Envelope')
const TcpProxyPacket = require('./TcpProxyPacket')
const sha256 = require('../utils/sha256')
const random = require('../utils/random')
const Keypair = require('./Keypair')
const net = require('net')
const AesCbc = require('./AesCbc')

const TcpCircuit = module.exports = defunction(['Keypair', '[]RelayDescriptor', 'Uint8Array', 'string', 'Uint8Array'], '*', function TcpCircuit(keypair, relayDescriptors, port, addressType, address) {

  _.merge(this, { keypair, relayDescriptors, port, addressType, address })

  this.range = _.range(relayDescriptors.length)

  this.ephemeralKeypairs = this.range.map(() => {
    return Keypair.generate()
  })

  this.aesKeys = this.range.map((index) => {
    const relayDescriptor = this.relayDescriptors[index]
    const ephemeralKeypair = this.ephemeralKeypairs[index]
    return ephemeralKeypair.getAesKey(relayDescriptor.publicKey)
  })

  this.emitter = new Emitter
})

TcpCircuit.prototype.ready = defunction([], '=>TcpCircuit', function ready() {

  const promiseStub = new PromiseStub
  const entryRelayDescriptor = this.relayDescriptors[0]

  const tcpProxyCommands = this.range.map((index) => {
    const isExit = (index === (this.relayDescriptors.length - 1))
    const nextRelayDescriptor = !isExit ? this.relayDescriptors[index + 1] : null
    return new TcpProxyCommand(
      isExit ? this.port : nextRelayDescriptor.port,
      isExit ? this.addressType : nextRelayDescriptor.addressType,
      isExit ? this.address : nextRelayDescriptor.address
    )
  })

  const envelopes = this.range.map((index) => {
    const envelope = new Envelope(
      this.keypair.publicKey,
      random(8),
      new Uint8Array([255]),
      tcpProxyCommands[index]
    )
    envelope.sign(this.keypair)
    return envelope
  })

  const cryptixes = this.range.map((index) => {
    const relayDescriptor = this.relayDescriptors[index]
    const ephemeralKeypair = this.ephemeralKeypairs[index]
    const envelope = envelopes[index]
    const envelopeEncoding = envelope.getEncoding()
    const envelopeEncodingCiphertext = ephemeralKeypair.getAesCbc(relayDescriptor.publicKey).getCiphertext(envelopeEncoding)
    return new Cryptix(ephemeralKeypair.publicKey, envelopeEncodingCiphertext)
  })

  const packets = this.range.map((index) => {
    const cryptix = cryptixes[index]
    let packet = cryptix.getEncoding()
    for (let proxyIndex = index - 1; proxyIndex >= 0; proxyIndex--) {
      const aesKey = this.aesKeys[proxyIndex]
      const aesIv = random(16)
      const aesCbc = new AesCbc(aesKey, aesIv)
      const tcpProxyPacket = new TcpProxyPacket(
        aesIv,
        sha256(packet),
        aesCbc.getCiphertext(packet)
      )
      packet = tcpProxyPacket.getEncoding()
    }
    return packet
  })

  const socket = net.createConnection({
    port: getNumber(entryRelayDescriptor.port),
    host: entryRelayDescriptor.address.join('.')
  })

  socket.on('data', (dataBuffer) => {
    if (packets.length > 0) {
      socket.write(new Buffer(packets.shift()))
      return
    }
    socket.removeAllListeners()
    this.socket = socket
    this.socket.on('data', (dataBuffer) => {
      const packets = unwrapPackets([new Uint8Array(dataBuffer)], this.aesKeys)
      packets.forEach((packet) => {
        this.emitter.emit('data', packet)
      })
    })
    promiseStub.resolve(this)
  })

  socket.write(new Buffer(packets.shift()))

  return promiseStub.promise
})

TcpCircuit.prototype.send = defunction(['Uint8Array'], 'undefined', function send(data) {
  let packet = data
  this.aesKeys.slice(0).reverse().forEach((aesKey) => {
    packet = TcpProxyPacket.fromPlaintext(packet, aesKey).getEncoding()
  })
  this.socket.write(new Buffer(packet))
})

function unwrapPackets(tcpProxyPacketEncodings, aesKeys) {

  let packets = tcpProxyPacketEncodings

  aesKeys.forEach((aesKey, index) => {
    const plaintexts = []
    packets.forEach((packet, index) => {
      let remainder = packet
      while (remainder.length > 0) {
        const tcpProxyPacketWithRemainder = TcpProxyPacket.fromEncodingWithRemainder(remainder)
        plaintexts.push(tcpProxyPacketWithRemainder.value.getPlaintext(aesKey))
        remainder = tcpProxyPacketWithRemainder.remainder
      }
    })
    packets = plaintexts
  })


  return packets
}