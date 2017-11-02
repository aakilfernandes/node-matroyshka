const DictionaryTemplate = require('hendricks/lib/Dictionary')
const DynamicTemplate = require('hendricks/lib/Dynamic')
const FixedTemplate = require('hendricks/lib/Fixed')

module.exports = new DictionaryTemplate('tcpForward', [
  new FixedTemplate('socketId', 16),
  new DynamicTemplate('data', 2)
])
