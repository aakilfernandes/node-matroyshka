const defunction = require('defunction')
const _ = require('lodash')
const proxyPacketTemplate = require('../templates/proxyPacket')
const sha256 = require('../utils/sha256')
const AesCbc = require('./AesCbc')
const random = require('../utils/random')
const arrayEquals = require('array-equal')
const Emitter = require('events')
const getNumber = require('../utils/getNumber')
const constants = require('../constants')

const ProxyPacket = module.exports = defunction(['Uint8Array', 'Uint8Array', 'Uint8Array'], '*', function ProxyPacket(aesIv, checksum, ciphertext) {
  if (ciphertext.length > constants.proxyPacketCiphertextMax) {
    throw new Error(`ciphertext (${ciphertext.length}) exceeds maximum length of ${constants.proxyPacketCiphertextMax}`)
  }
  _.merge(this, { aesIv, checksum, ciphertext})
})

ProxyPacket.prototype.getPlaintext = defunction(['Uint8Array'], 'Uint8Array', function getPlaintext(aesKey) {
  const aesCbc = new AesCbc(aesKey, this.aesIv)
  const plaintext = aesCbc.getPlaintext(this.ciphertext)
  if (!arrayEquals(sha256(plaintext), this.checksum)) {
    //TODO: testable error
    throw new Error('Invalid checksum')
  }
  return plaintext
})

ProxyPacket.prototype.getPojo = defunction([], 'Object', function getPojo() {
  return {
    aesIv: this.aesIv,
    checksum: this.checksum,
    ciphertext: this.ciphertext
  }
})

ProxyPacket.prototype.getEncoding = defunction([], 'Uint8Array', function getEncoding() {
  return proxyPacketTemplate.encode(this.getPojo())
})

ProxyPacket.fromEncoding = defunction(['Uint8Array'], 'ProxyPacket', function fromEncoding(encoding) {
  return ProxyPacket.fromPojo(proxyPacketTemplate.decode(encoding))
})

ProxyPacket.fromPojo = defunction(['Object'], 'ProxyPacket', function fromPojo(pojo) {
  return new ProxyPacket(pojo.aesIv, pojo.checksum, pojo.ciphertext)
})

ProxyPacket.fromPlaintext = defunction(['Uint8Array', 'Uint8Array'], 'ProxyPacket', function fromPlaintext(plaintext, aesKey) {
  if (plaintext.length > constants.proxyPacketPlaintextMax) {
    throw new Error(`plaintext (${plaintext.length}) exceeds maximum length of ${constants.proxyPacketPlaintextMax}`)
  }
  const aesIv = random(16)
  const checksum = sha256(plaintext)
  const ciphertext = (new AesCbc(aesKey, aesIv)).getCiphertext(plaintext)
  return new ProxyPacket(aesIv, checksum, ciphertext)
})
