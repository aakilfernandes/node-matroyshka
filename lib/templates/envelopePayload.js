const DictionaryTemplate = require('hendricks/lib/Dictionary')
const FixedTemplate = require('hendricks/lib/Fixed')
const DynamicTemplate = require('hendricks/lib/Dynamic')
const SplitTemplate = require('hendricks/lib/Split')
const tcpProxyCommandTemplate = require('./commands/tcpProxy')

module.exports = new DictionaryTemplate('payload', [
  new FixedTemplate('publicKey', 33),
  new FixedTemplate('nonce', 8),
  new FixedTemplate('timeout', 1),
  new SplitTemplate('command', 2, ['tcpProxy'], [
    tcpProxyCommandTemplate
  ])
])
