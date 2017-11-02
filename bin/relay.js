const Proxy = require('../lib/classes/Proxy')
const Keypair = require('../lib/classes/Keypair')
const commander = require('commander')
const _ = require('lodash')

commander.version('0.0.0').arguments('<privateKeyJson> [port] [address]').action((privateKeyJson, port = 5000, address = '0.0.0.0') => {
  const privateKey = new Uint8Array(JSON.parse(privateKeyJson))

  const keypair = new Keypair(privateKey)
  const relay = new Proxy(keypair)

  relay.createServer().listen(parseInt(port), address)
  console.log(`relay listening on ${address}:${port}`)

})

commander.parse(process.argv)
