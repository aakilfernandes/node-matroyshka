const DictionaryTemplate = require('hendricks/lib/Dictionary')
const DynamicTemplate = require('hendricks/lib/Dynamic')
const FixedTemplate = require('hendricks/lib/Fixed')

module.exports = new DictionaryTemplate('tcpProxy', [
  new FixedTemplate('aesKey', 16),
  new FixedTemplate('port', 2),
  new DynamicTemplate('address', 1)
])
