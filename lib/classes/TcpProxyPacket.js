const defunction = require('defunction')
const _ = require('lodash')
const tcpProxyPacketTemplate = require('../templates/tcpProxyPacket')
const sha256 = require('../utils/sha256')
const AesCbc = require('./AesCbc')
const random = require('../utils/random')
const arrayEquals = require('array-equal')
const Emitter = require('events')
const getNumber = require('../utils/getNumber')

const TcpProxyPacket = module.exports = defunction(['Uint8Array', 'Uint8Array', 'Uint8Array'], '*', function TcpProxyPacket(aesIv, checksum, ciphertext) {
  _.merge(this, { aesIv, checksum, ciphertext})
})

TcpProxyPacket.prototype.getPlaintext = defunction(['Uint8Array'], 'Uint8Array', function getPlaintext(aesKey) {
  const aesCbc = new AesCbc(aesKey, this.aesIv)
  const plaintext = aesCbc.getPlaintext(this.ciphertext)
  if (!arrayEquals(sha256(plaintext), this.checksum)) {
    //TODO: testable error
    throw new Error('Invalid checksum')
  }
  return plaintext
})

TcpProxyPacket.prototype.getPojo = defunction([], 'Object', function getPojo() {
  return {
    aesIv: this.aesIv,
    checksum: this.checksum,
    ciphertext: this.ciphertext
  }
})

TcpProxyPacket.prototype.getEncoding = defunction([], 'Uint8Array', function getEncoding() {
  return tcpProxyPacketTemplate.encode(this.getPojo())
})

TcpProxyPacket.fromEncoding = defunction(['Uint8Array'], 'TcpProxyPacket', function fromEncoding(encoding) {
  return TcpProxyPacket.fromPojo(tcpProxyPacketTemplate.decode(encoding))
})

TcpProxyPacket.fromEncodingWithRemainder = defunction(['Uint8Array'], 'Object', function fromEncoding(encoding) {
  const decodingWithRemainder = tcpProxyPacketTemplate.decodeWithRemainder(encoding)
  return {
    value: TcpProxyPacket.fromPojo(decodingWithRemainder.value),
    remainder: decodingWithRemainder.remainder
  }
})

TcpProxyPacket.fromPojo = defunction(['Object'], 'TcpProxyPacket', function fromPojo(pojo) {
  return new TcpProxyPacket(pojo.aesIv, pojo.checksum, pojo.ciphertext)
})

TcpProxyPacket.fromPlaintext = defunction(['Uint8Array', 'Uint8Array'], '[]TcpProxyPacket', function fromPlaintext(plaintext, aesKey) {
  const plaintexts = _.chunk(plaintext, 65519).map((plaintextArray) => {
    return new Uint8Array(plaintextArray)
  })
  return plaintexts.map((plaintext) => {
    const aesIv = random(16)
    const checksum = sha256(plaintext)
    const ciphertext = (new AesCbc(aesKey, aesIv)).getCiphertext(plaintext)
    return new TcpProxyPacket(aesIv, checksum, ciphertext)
  })
})
