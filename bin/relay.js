const Relay = require('../lib/classes/Relay')
const Keypair = require('../lib/classes/Keypair')
const commander = require('commander')
const _ = require('lodash')

commander.version('0.0.0').arguments('<privateKey> [port] [address]').action((privateKeyHex, port = 5000, address = '0.0.0.0') => {
  const privateKey = new Uint8Array(_.range(32).map((index) => {
    const hexIndex = index * 2
    const byteHex = privateKeyHex.slice(hexIndex, hexIndex + 2)
    return parseInt(byteHex, 16)
  }))

  const keypair = new Keypair(privateKey)
  const relay = new Relay(keypair)

  relay.createServer().listen(parseInt(port), address)
  console.log(`relay listening on ${address}:${port}`)

})

commander.parse(process.argv)
