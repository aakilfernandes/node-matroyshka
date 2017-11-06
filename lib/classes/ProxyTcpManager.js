const getSocketIdString = require('../utils/getSocketIdString')
const net = require('net')
const _ = require('lodash')
const defunction = require('defunction')
const getNumber = require('../utils/getNumber')
const TcpConnectedResponse = require('./responses/TcpConnected')
const TcpDisconnectedResponse = require('./responses/TcpDisconnected')
const TcpBackwardResponse = require('./responses/TcpBackward')
const ProxyPacket = require('./ProxyPacket')
const constants = require('../constants')

const ProxyTcpManager = module.exports = defunction(['Socket', 'Uint8Array'], '*', function ProxyTcpManager(socketIn, aesKey) {
  _.merge(this, { socketIn, aesKey, socketOuts: {} })
})

ProxyTcpManager.prototype.handle = defunction(['Command'], '*', function handle(command) {
  switch(command.type) {
    case 'tcpConnect':
      this.connect(command)
      break;
    case 'tcpDisconnect':
      this.disconnect(command)
      break;
    case 'tcpForward':
      this.forward(command)
      break;
  }
})

ProxyTcpManager.prototype.connect = defunction(['Command'], '*', function connect(command) {
  const socketId = command.socketId
  const socketIdString = getSocketIdString(socketId)
  return command.getIpAddress().then((ipAddress) => {

    const socketOut = net.createConnection({
      port: getNumber(command.port),
      host: ipAddress.join('.')
    }, () => {
      const tcpConnectedResponse = new TcpConnectedResponse(socketId)
      const proxyPacket = ProxyPacket.fromPlaintext(tcpConnectedResponse.getEncoding(), this.aesKey)
      this.socketIn.write(new Buffer(proxyPacket.getEncoding()))
    })

    socketOut.on('data', (dataBuffer) => {
      _.chunk(dataBuffer, constants.tcpCommandDataMax).forEach((dataBufferChunk) => {
        const tcpBackwardResponse = new TcpBackwardResponse(socketId, new Uint8Array(dataBufferChunk))
        const proxyPacket = ProxyPacket.fromPlaintext(tcpBackwardResponse.getEncoding(), this.aesKey)
        this.socketIn.write(new Buffer(proxyPacket.getEncoding()))
      })
    })

    socketOut.on('end', (dataBuffer) => {
      const tcpDisconnectedResponse = new TcpDisconnectedResponse(socketId, new Uint8Array(dataBuffer))
      const proxyPacket = ProxyPacket.fromPlaintext(tcpDisconnectedResponse.getEncoding(), this.aesKey)
      this.socketIn.write(new Buffer(proxyPacket.getEncoding()))
      delete this.socketOuts[socketIdString]
    })

    this.socketOuts[socketIdString] = socketOut
  })
})

ProxyTcpManager.prototype.disconnect = defunction(['Command'], '*', function disconnect(command) {
  const socketId = command.socketId
  const socketIdString = getSocketIdString(socketId)
  const socketOut = this.socketOuts[socketIdString]
  if (!socketOut) {
    return
  }
  socketOut.end(new Buffer(command.data))
})

ProxyTcpManager.prototype.forward = defunction(['Command'], '*', function forward(command) {
  const socketId = command.socketId
  const socketIdString = getSocketIdString(socketId)
  const socketOut = this.socketOuts[socketIdString]
  if (!socketOut) {
    return
  }
  socketOut.write(new Buffer(command.data))
})

ProxyTcpManager.prototype.destroy = defunction([], '*', function destroy(command) {
  _.forEach(this.socketOuts, (socketOut) => {
    socketOut.end()
    socketOut.destroy()
  })
})
