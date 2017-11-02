const DictionaryTemplate = require('hendricks/lib/Dictionary')
const FixedTemplate = require('hendricks/lib/Fixed')
const DynamicTemplate = require('hendricks/lib/Dynamic')
const signatureTemplate = require('./signature')

module.exports = new DictionaryTemplate('cryptix', [
  new FixedTemplate('ephemeralPublicKey', 33),
  new DynamicTemplate('greetingCiphertext', 4)
])
