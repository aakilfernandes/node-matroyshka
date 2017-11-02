const defunction = require('defunction')
const commandTemplate = require('../templates/command')
const TcpConnectCommand = require('../classes/commands/TcpConnect')
const TcpDisconnectCommand = require('../classes/commands/TcpDisconnect')
const TcpForwardCommand = require('../classes/commands/TcpForward')

module.exports = defunction(['Uint8Array'], 'Command', function getCommandFromEncoding(encoding) {
  const pojo = commandTemplate.decode(encoding)
  const value = pojo.value
  switch(pojo.branch) {
    case 'tcpConnect':
      return new TcpConnectCommand(value.socketId, value.port, value.address.branch, value.address.value)
      break;
    case 'tcpDisconnect':
      return new TcpDisconnectCommand(value.socketId, value.data)
      break;
    case 'tcpForward':
      return new TcpForwardCommand(value.socketId, value.data)
      break;
    default:
      throw new Error(`Unknown command ${pojo.branch}`)
  }
})
