const Keypair = require('../lib/classes/Keypair')

const keypair = Keypair.generate()
console.log(JSON.stringify({
  privateKey: keypair.privateKey.reduce((sum, byte) => {
    return sum + byte.toString(16)
  }, ''),
  publicKey: keypair.publicKey.reduce((sum, byte) => {
    return sum + byte.toString(16)
  }, '')
}, null, 2))
