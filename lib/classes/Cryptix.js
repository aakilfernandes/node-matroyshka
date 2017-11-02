const defunction = require('defunction')
const cryptixTemplate = require('../templates/cryptix')
const _ = require('lodash')
const elliptic = require('elliptic')
const aesjs = require('aes-js')
const Greeting = require('./Greeting')
const Keypair = require('./Keypair')

const Cryptix = module.exports = defunction([
  'Uint8Array', 'Uint8Array'
], '*', function Cryptix(
  ephemeralPublicKey,
  greetingCiphertext
) {
  _.merge(this, { ephemeralPublicKey, greetingCiphertext })
})

Cryptix.prototype.getEncoding = defunction([], 'Uint8Array', function getEncoding() {
  return cryptixTemplate.encode(this.getPojo())
})

Cryptix.prototype.getGreeting = defunction(['Keypair'], 'Greeting', function getGreeting(keypair) {
  const greetingEncoding = keypair.getAesCbc(this.ephemeralPublicKey).getPlaintext(this.greetingCiphertext)
  return Greeting.fromEncoding(greetingEncoding)
})

Cryptix.prototype.getPojo = defunction([], 'Object', function getPojo() {
  return {
    ephemeralPublicKey: this.ephemeralPublicKey,
    greetingCiphertext: this.greetingCiphertext
  }
})

Cryptix.fromEncoding = defunction(['Uint8Array'], 'Cryptix', function fromEncoding(encoding) {
  return Cryptix.fromPojo(cryptixTemplate.decode(encoding))
})

Cryptix.fromPojo = defunction(['Object'], 'Cryptix', function fromPojo(pojo) {
  return new Cryptix(pojo.ephemeralPublicKey, pojo.greetingCiphertext)
})
