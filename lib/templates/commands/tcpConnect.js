const DictionaryTemplate = require('hendricks/lib/Dictionary')
const DynamicTemplate = require('hendricks/lib/Dynamic')
const FixedTemplate = require('hendricks/lib/Fixed')
const SplitTemplate = require('hendricks/lib/Split')

module.exports = new DictionaryTemplate('tcpConnect', [
  new FixedTemplate('socketId', 16),
  new FixedTemplate('port', 2),
  new SplitTemplate('address', 1, ['ip4', 'ip6', 'dns'], [
    new FixedTemplate('address', 4),
    new FixedTemplate('address', 16),
    new DynamicTemplate('address', 1)
  ])
])
