const fs = require('fs')
const ProxyDescriptor = require('../lib/classes/ProxyDescriptor')
const Client = require('../lib/classes/Client')
const Keypair = require('../lib/classes/Keypair')
const os = require('os')
const path = require('path')

const logo = fs.readFileSync(path.join(__dirname, '../assets/logo.txt'), 'utf8')
const proxyDescriptorsJson = fs.readFileSync(path.join(__dirname, '../assets/proxyDescriptors.json'), 'utf8')
const proxyDescriptors = JSON.parse(proxyDescriptorsJson).map((descriptor) => {
  return new ProxyDescriptor(
    new Uint8Array(descriptor.publicKey),
    new Uint8Array([19, 136]),
    'ip4',
    new Uint8Array(descriptor.address.split('.').map((byteString) => {
      return parseInt(byteString)
    }))
  )
})

console.log('\033[2J')
console.log(logo)

const matryoshkaPath = `${os.homedir()}/.matryoshka`
const privateKeyPath = `${matryoshkaPath}/privateKey`

if (!fs.existsSync(matryoshkaPath)){
  fs.mkdirSync(matryoshkaPath)
}

let keypair

if (!fs.existsSync(privateKeyPath)){
  keypair = Keypair.generate()
  fs.writeFileSync(privateKeyPath, JSON.stringify(Array.from(keypair.privateKey)), 'utf8')
} else {
  const privateKey = JSON.parse(fs.readFileSync(privateKeyPath, 'utf8'))
  keypair = new Keypair(new Uint8Array(privateKey))
}

let server = null
let proxyCircuit = null
let isClosing = false

process.on('uncaughtException', function (err) {
  console.log(err)
});

const client = new Client(keypair, proxyDescriptors)

client.createProxyCircuitSocks5Server().server.listen(8888, '127.0.0.1')

console.log('==============================================================================')
console.log('public key   :', toHex(keypair.publicKey))
console.log('burn address :', toHex(keypair.getBurnAddress()))
console.log('socks proxy  :', '127.0.0.1:8888')
console.log('==============================================================================')

function toHex(array) {
  return array.reduce((sum, byte) => {
    let hex = byte.toString(16)
    if (hex.length === 0) {
      hex = 0 + hex
    }
    return sum + hex
  }, '')
}
