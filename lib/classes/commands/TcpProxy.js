const defunction = require('defunction')
const net = require('net')
const getNumber = require('../../utils/getNumber')
const PromiseStub = require('../PromiseStub')
const _ = require('lodash')
const TcpProxyPacket = require('../TcpProxyPacket')
const AesCbc = require('../AesCbc')
const resolveDns = require('../../utils/resolveDns')

const ack = new Uint8Array([1])

const TcpProxyCommand = module.exports = defunction(['Uint8Array', 'string', 'Uint8Array'], '*', function Command(port, addressType, address) {
  _.merge(this, { port, addressType, address })
})

TcpProxyCommand.prototype.execute = defunction(['Socket', 'Uint8Array'], 'undefined', function execute(socketIn, aesKey) {
  socketIn.removeAllListeners()

  let ipAddressPromise

  if (this.addressType === 'dns') {
    ipAddressPromise = resolveDns(this.address)
  } else {
    ipAddressPromise = Promise.resolve(this.address)
  }

  ipAddressPromise.then((ipAddress) => {
    const socketOut = net.createConnection({
      port: getNumber(this.port),
      host: ipAddress.join('.')
    }, () => {
      const tcpProxyPacket = TcpProxyPacket.fromPlaintext(ack, aesKey)
      socketIn.write(new Buffer(tcpProxyPacket.getEncoding()))
    })

    socketIn.on('data', (dataBuffer) => {
      const tcpProxyPacketEncoding = new Uint8Array(dataBuffer)
      const tcpProxyPacket = TcpProxyPacket.fromEncoding(tcpProxyPacketEncoding)
      socketOut.write(new Buffer(tcpProxyPacket.getPlaintext(aesKey)))
    })
    socketIn.on('end', (dataBuffer) => {
      socketOut.end()
      socketOut.destroy()
    })

    socketOut.on('data', (dataBuffer) => {
      const tcpProxyPacket = TcpProxyPacket.fromPlaintext(new Uint8Array(dataBuffer), aesKey)
      socketIn.write(new Buffer(tcpProxyPacket.getEncoding()))
    })
    socketOut.on('end', () => {
      socketIn.end()
      socketIn.destroy()
    })
  })

})

TcpProxyCommand.prototype.getPojo = defunction([], 'Object', function getPojo() {
  return {
    branch: 'tcpProxy',
    value: {
      port: this.port,
      address: {
        branch: this.addressType,
        value: this.address
      }
    }
  }
})
