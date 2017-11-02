const defunction = require('defunction')
const responseTemplate = require('../templates/response')
const GreetedResponse = require('../classes/responses/Greeted')
const TcpConnectedResponse = require('../classes/responses/TcpConnected')
const TcpBackwardResponse = require('../classes/responses/TcpBackward')
const TcpDisconnectedResponse = require('../classes/responses/TcpDisconnected')

module.exports = defunction(['Uint8Array'], 'Response', function getResponseFromEncoding(encoding) {
  const pojo = responseTemplate.decode(encoding)
  const value = pojo.value
  switch(pojo.branch) {
    case 'greeted':
      return new GreetedResponse()
      break;
    case 'tcpConnected':
      return new TcpConnectedResponse(value)
      break;
    case 'tcpDisconnected':
      return new TcpDisconnectedResponse(value.socketId, value.data)
      break;
    case 'tcpBackward':
      return new TcpBackwardResponse(value.socketId, value.data)
      break;
    default:
      throw new Error(`Unknown command ${pojo.branch}`)
  }
})
