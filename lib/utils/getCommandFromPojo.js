const defunction = require('defunction')
const TcpProxyCommand = require('../classes/commands/TcpProxy')

module.exports = defunction(['Object'], 'Command', function getCommandFromPojo(pojo) {
  const value = pojo.value
  switch(pojo.branch) {
    case 'tcpProxy':
      return new TcpProxyCommand(value.port, value.address.branch, value.address.value)
      break;
    default:
      throw new Error(`Unknown command ${pojo.branch}`)
  }
})
