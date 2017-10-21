const DictionaryTemplate = require('hendricks/lib/Dictionary')
const FixedTemplate = require('hendricks/lib/Fixed')

module.exports = new DictionaryTemplate('signature', [
  new FixedTemplate('r', 32),
  new FixedTemplate('s', 32)
])
