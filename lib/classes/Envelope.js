const defunction = require('defunction')
const _ = require('lodash')
const envelopeTemplate = require('../templates/envelope')
const envelopePayloadTemplate = require('../templates/envelopePayload')
const Signature = require('./Signature')
const getCommandFromPojo = require('../utils/getCommandFromPojo')

const Envelope = module.exports = defunction([
  'Uint8Array',
  'Uint8Array',
  'Uint8Array',
  'Command'
], '*', function Envelope(publicKey, nonce, timeout, command) {
  _.merge(this, { publicKey, nonce, timeout, command })
})

Envelope.prototype.setSignature = defunction(['Signature'], 'Envelope', function setSignature(signature) {
  this.signature = signature
  return this
})

Envelope.prototype.getPojo = defunction([], 'Object', function getPojo(publicKey, nonce, timeout, commandType, command) {
  return {
    payload: this.getPayloadPojo(),
    signature: {
      r: this.signature.r,
      s: this.signature.s
    }
  }
})

Envelope.prototype.getPayloadPojo = defunction([], 'Object', function getPayloadPojo(publicKey, nonce, timeout, commandType, command) {
  return {
    publicKey: this.publicKey,
    nonce: this.nonce,
    timeout: this.timeout,
    command: this.command.getPojo()
  }
})

Envelope.prototype.getEncoding = defunction([], 'Uint8Array', function toEncoding() {
  return envelopeTemplate.encode(this.getPojo())
})

Envelope.prototype.getPayloadEncoding = defunction([], 'Uint8Array', function getPayloadEncoding() {
  return envelopePayloadTemplate.encode(this.getPayloadPojo())
})

Envelope.prototype.validate = defunction([], '*', function validate() {
  return this.signature.validate(this.payload.publicKey, this.getPayloadPojo())
})

Envelope.fromPojo = defunction(['Object'], 'Envelope', function fromPojo(pojo) {
  const envelope = new Envelope(
    pojo.payload.publicKey,
    pojo.payload.nonce,
    pojo.payload.timeout,
    getCommandFromPojo(pojo.payload.command)
  )
  envelope.setSignature(Signature.fromPojo(pojo.signature))
  return envelope
})

Envelope.fromEncoding = defunction(['Uint8Array'], 'Envelope', function fromEncoding(encoding) {
  return Envelope.fromPojo(envelopeTemplate.decode(encoding))
})

Envelope.prototype.sign = defunction(['Keypair'], 'Signature', function sign(keypair) {
  this.signature = keypair.getSignature(this.getPayloadEncoding())
  return this.signature
})
