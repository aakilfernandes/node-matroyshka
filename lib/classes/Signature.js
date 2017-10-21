const defunction = require('defunction')
const secp256k1 = require('secp256k1')
const _ = require('lodash')

const Signature = module.exports = defunction(['Uint8Array', 'Uint8Array'], 'undefined', function Signature(r, s) {
  _.merge(this, { r, s })
})

Signature.prototype.validate = defunction(['Uint8Array', 'Uint8Array'], 'undefined', function validate(message, publicKey) {
  const signatureRAndS = new Uint8Array(64)
  signatureRAndS.set(this.r, 0)
  signatureRAndS.set(this.s, 32)
  if (!secp256k1.verify(message, signatureRAndS, publicKey)) {
    throw new Error
  }
})

Signature.prototype.getPojo = defunction([], 'Object', function getPojo() {
  return {
    r: this.r,
    s: this.s
  }
})

Signature.fromPojo = defunction(['Object'], 'Signature', function fromPojo(pojo) {
  return new Signature(pojo.r, pojo.s)
})
