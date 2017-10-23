const _ = require('lodash')
const Relay = require('../lib/classes/Relay')
const Client = require('../lib/classes/Client')
const SocksAgent = require('socks5-https-client/lib/Agent')
const request = require('request-promise')
const RelayDescriptor = require('../lib/classes/RelayDescriptor')
const Keypair = require('../lib/classes/Keypair')

const relays = []
const relayDescriptors = []
let client

describe('relays', () => {
  _.range(3).map((index) => {
    const port = 9000 + index
    let relay
    it(`should create relay`, () => {
      relay = new Relay(Keypair.generate())
      relay.index = index
      relays.push(relay)
      relayDescriptors.push(new RelayDescriptor(
        relay.keypair.publicKey,
        new Uint8Array(Buffer.from(port.toString(16), 'hex')),
        'ip4',
        new Uint8Array([127, 0, 0, 1])
      ))
    })
    it(`should create server and listen on 127.0.0.1:${port}`, () => {
      relay.createServer().listen(port, '127.0.0.1')
    })
  })
})

describe('client', () => {
  it('should create client', () => {
    client = new Client(Keypair.generate(), relayDescriptors)
  })
  it('should create socks5 server', () => {
    client.createTcpCircuitSocks5Server().server.listen(8888, '127.0.0.1')
  })
})

describe('user', () => {
  it('should fetch https://api.ipify.org', () => {
    return request({
    	url: 'https://api.ipify.org/',
    	strictSSL: true,
    	agentClass: SocksAgent,
    	agentOptions: {
    		socksPort: 8888
    	}
    }).then((res) => {
      console.log('res', res)
    })
  })
})
