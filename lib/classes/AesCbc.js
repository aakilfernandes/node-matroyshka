const defunction = require('defunction')
const _ = require('lodash')
const aesjs = require('aes-js')

const AesCbc = module.exports = defunction(['Uint8Array', 'Uint8Array'], '*', function AesCbc(key, iv) {
  _.merge(this, { key, iv })
  this.cipher = new aesjs.ModeOfOperation.cbc(key, iv)
})

AesCbc.prototype.getCiphertext = defunction(['Uint8Array'], 'Uint8Array', function getCiphertext(plaintext) {
  const paddedPlaintextLength = 16 * Math.ceil((plaintext.length + 1) / 16)
  const paddedPlaintext = new Uint8Array(paddedPlaintextLength)
  paddedPlaintext.fill(0)
  paddedPlaintext.set(plaintext)
  paddedPlaintext[plaintext.length] = 1
  return this.cipher.encrypt(paddedPlaintext)
})

AesCbc.prototype.getPlaintext = defunction(['Uint8Array'], 'Uint8Array', function getPlaintext(ciphertext) {
  const paddedPlaintext = this.cipher.decrypt(ciphertext)
  return paddedPlaintext.slice(0, paddedPlaintext.lastIndexOf(1))
})
