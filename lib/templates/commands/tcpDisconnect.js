const DictionaryTemplate = require('hendricks/lib/Dictionary')
const DynamicTemplate = require('hendricks/lib/Dynamic')
const FixedTemplate = require('hendricks/lib/Fixed')
const SplitTemplate = require('hendricks/lib/Split')

module.exports = new DictionaryTemplate('tcpDisconnect', [
  new FixedTemplate('socketId', 16),
  new DynamicTemplate('data', 2)
])
