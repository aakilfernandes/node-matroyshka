const DictionaryTemplate = require('hendricks/lib/Dictionary')
const FixedTemplate = require('hendricks/lib/Fixed')
const signatureTemplate = require('./signature')

module.exports = new DictionaryTemplate('hello', [
  new FixedTemplate('publicKey', 33),
  signatureTemplate
])
