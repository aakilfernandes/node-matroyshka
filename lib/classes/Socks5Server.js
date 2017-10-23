const net = require('net')
const util = require('util')
const Emitter = require('events')
const defunction = require('defunction')

const authCodes = {
    NOAUTH: 0x00,
    GSSAPI: 0x01,
    USERPASS: 0x02,
    NONE: 0xFF
}

const requestCodes = {
  CONNECT: 0x01,
  BIND: 0x02,
  UDP_ASSOCIATE: 0x03
}

const addressTypes = {
    IP_V4: 0x01,
    DNS: 0x03,
    IP_V6: 0x04
}

const Socks5Server = module.exports = defunction([], '*', function Socks5Server() {
  this.server = net.createServer()
  this.emitter = new Emitter()
  this.server.on('connection', (socket) => {

    socket.once('data', (dataBuffer) => {

      const data = new Uint8Array(dataBuffer)

      if (data[0] !== 5) {
        socket.end()
        return
      }

      const methodsCount = data[1]
      const methods = data.slice(2, 2 + methodsCount)

      if(methods.indexOf(authCodes.NOAUTH) === -1) {
        connection.end()
        return
      }

      const response = new Uint8Array([0x05, authCodes.NOAUTH])
      socket.write(new Buffer(response))

      socket.once('data', (dataBuffer) => {
        const data = new Uint8Array(dataBuffer)
        if (data[0] !== 0x05) {
          socket.end(new Buffer([0x05, 0x01]))
          return
        }

        let addressType
        let address
        let port

        switch(data[3]) {
          case addressTypes.IP_V4:
            addressType = 'ip4'
            address = data.slice(4, 8)
            port = data.slice(8, 10)
            break;
          case addressTypes.IP_V6:
            addressType = 'ip6'
            address = data.slice(4, 20)
            port = data.slice(20, 22)
            break;
          case addressTypes.DNS:
            addressType = 'dns'
            const addressLength = data[4]
            address = data.slice(5, 5 + addressLength)
            port = data.slice(5 + addressLength, 5 + addressLength + 2)
            break;
          default:
            connection.end()
            return
        }

        function ready() {
          const response = new Uint8Array(data.length)
          response.set(data)
          response.set([0x05, 0x00, 0x00])
          socket.write(new Buffer(response))
        }

        this.emitter.emit('connection', {
          port, addressType, address, ready, socket
        })
      })
    })
  })
})
