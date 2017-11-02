const SplitTemplate = require('hendricks/lib/Split')
const FixedTemplate = require('hendricks/lib/Fixed')
const tcpConnectedResponseTemplate = require('./responses/tcpConnected')
const tcpDisconnectedResponseTemplate = require('./responses/tcpDisconnected')
const tcpBackwardResponseTemplate = require('./responses/tcpBackward')

module.exports = new SplitTemplate('response', 2, ['greeted', 'tcpConnected', 'tcpDisconnected', 'tcpBackward'], [
  new FixedTemplate('greeted', 1),
  tcpConnectedResponseTemplate,
  tcpDisconnectedResponseTemplate,
  tcpBackwardResponseTemplate
])
