const Keypair = require('../lib/classes/Keypair')

describe('keypair', () => {
  let alice
  let bob

  it('should generate keypairs', () => {
    alice = Keypair.generate()
    bob = Keypair.generate()
  })

  it('should derive shared keys', () => {
    const sharedKey1 = alice.getEcdhSharedKey(bob.publicKey)
    const sharedKey2 = bob.getEcdhSharedKey(alice.publicKey)
    sharedKey1.should.deep.equal(sharedKey2)
  })

  it('should encrypt message from bob to alice', () => {
    const message = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
    const ciphertext = alice.getAesCbc(bob.publicKey).getCiphertext(message)
    ciphertext.should.have.length(32)
    ciphertext.should.not.deep.equal(message)
    bob.getAesCbc(alice.publicKey).getPlaintext(ciphertext).should.deep.equal(message)
  })

  it('should getBurnAddress', () => {
    alice.getBurnAddress().should.have.length(20)
  })
})
