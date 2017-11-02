const defunction = require('defunction')
const _ = require('lodash')
const greetingTemplate = require('../templates/greeting')
const Signature = require('./Signature')

const Greeting = module.exports = defunction([
  'Uint8Array', 'Signature'
], '*', function Greeting(publicKey, signature) {
  _.merge(this, { publicKey, signature })
})

Greeting.prototype.getPojo = defunction([], 'Object', function getPojo(publicKey, nonce, timeout, commandType, command) {
  return {
    publicKey: this.publicKey,
    signature: {
      r: this.signature.r,
      s: this.signature.s
    }
  }
})

Greeting.prototype.getEncoding = defunction([], 'Uint8Array', function toEncoding() {
  return greetingTemplate.encode(this.getPojo())
})

Greeting.prototype.validate = defunction(['Uint8Array'], '*', function validate(ephemeralPublicKey) {
  return this.signature.validate(ephemeralPublicKey, this.publicKey)
})

Greeting.fromPojo = defunction(['Object'], 'Greeting', function fromPojo(pojo) {
  return new Greeting(pojo.publicKey, Signature.fromPojo(pojo.signature))
})

Greeting.fromEncoding = defunction(['Uint8Array'], 'Greeting', function fromEncoding(encoding) {
  return Greeting.fromPojo(greetingTemplate.decode(encoding))
})
