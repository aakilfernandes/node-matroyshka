const secp256k1 = require('secp256k1')
const crypto = require('crypto')
const defunction = require('defunction')
const _ = require('lodash')
const Signature = require('./Signature')
const AesCbc = require('./AesCbc')

const Keypair = module.exports = defunction(['Uint8Array'], '*', function Keypair(privateKey) {
  this.privateKey = privateKey
  this.publicKey = new Uint8Array(secp256k1.publicKeyCreate(privateKey))
})

Keypair.generate = defunction([], 'Keypair', function generate() {
  const privateKey = crypto.randomBytes(32)

  if(!secp256k1.privateKeyVerify(privateKey)) {
    return Keypair.generate()
  }

  return new Keypair(new Uint8Array(privateKey))
})

Keypair.prototype.getSignature = defunction(['Uint8Array'], 'Signature', function getSignature(message) {
  const hash = crypto.createHash('sha256').update(message).digest()
  const secp256k1Signature = new Uint8Array(secp256k1.sign(hash, this.privateKey).signature)
  return new Signature(
    new Uint8Array(secp256k1Signature.slice(0, 32)),
    new Uint8Array(secp256k1Signature.slice(32, 64))
  )
})

Keypair.prototype.getEcdhSharedKey = defunction(['Uint8Array'], 'Uint8Array', function getEcdhSharedKey(publicKey) {
  return new Uint8Array(secp256k1.ecdh(publicKey, this.privateKey))
})

Keypair.prototype.getAesCbc = defunction(['Uint8Array'], '*', function getAesCbc(publicKey) {
  const sharedKey = this.getEcdhSharedKey(publicKey)
  const aesKey = sharedKey.slice(0, 16)
  const aesIv = sharedKey.slice(16, 32)
  return new AesCbc(aesKey, aesIv)
})
