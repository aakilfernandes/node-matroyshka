const defunction = require('defunction')
const cryptixTemplate = require('../templates/cryptix')
const _ = require('lodash')
const elliptic = require('elliptic')
const aesjs = require('aes-js')
const Envelope = require('./Envelope')
const Keypair = require('./Keypair')

const Cryptix = module.exports = defunction([
  'Uint8Array', 'Uint8Array'
], '*', function Cryptix(
  ephemeralPublicKey,
  envelopeEncodingCiphertext
) {
  _.merge(this, { ephemeralPublicKey, envelopeEncodingCiphertext })
})

Cryptix.prototype.getEncoding = defunction([], 'Uint8Array', function getEncoding() {
  return cryptixTemplate.encode(this.getPojo())
})

Cryptix.prototype.getEnvelope = defunction(['Keypair'], 'Envelope', function getEnvelope(keypair) {
  const envelopeEncoding = keypair.getAesCbc(this.ephemeralPublicKey).getPlaintext(this.envelopeEncodingCiphertext)
  return Envelope.fromEncoding(envelopeEncoding)
})

Cryptix.prototype.getPojo = defunction([], 'Object', function getPojo() {
  return {
    ephemeralPublicKey: this.ephemeralPublicKey,
    envelopeEncodingCiphertext: this.envelopeEncodingCiphertext
  }
})

Cryptix.fromEncoding = defunction(['Uint8Array'], 'Cryptix', function fromEncoding(encoding) {
  return Cryptix.fromPojo(cryptixTemplate.decode(encoding))
})

Cryptix.fromPojo = defunction(['Object'], 'Cryptix', function fromPojo(pojo) {
  return new Cryptix(pojo.ephemeralPublicKey, pojo.envelopeEncodingCiphertext)
})
