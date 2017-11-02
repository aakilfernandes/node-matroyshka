const SplitTemplate = require('hendricks/lib/Split')
const tcpConnectCommandTemplate = require('./commands/tcpConnect')
const tcpDisconnectCommandTemplate = require('./commands/tcpDisconnect')
const tcpForwardCommandTemplate = require('./commands/tcpForward')

module.exports = new SplitTemplate('command', 2, ['tcpConnect', 'tcpDisconnect', 'tcpForward'], [
  tcpConnectCommandTemplate,
  tcpDisconnectCommandTemplate,
  tcpForwardCommandTemplate
])
