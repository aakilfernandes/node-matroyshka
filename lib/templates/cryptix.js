const DictionaryTemplate = require('hendricks/lib/Dictionary')
const FixedTemplate = require('hendricks/lib/Fixed')
const DynamicTemplate = require('hendricks/lib/Dynamic')
const envelopePayloadTemplate = require('./envelopePayload')
const signatureTemplate = require('./signature')

module.exports = new DictionaryTemplate('cryptix', [
  new FixedTemplate('ephemeralPublicKey', 33),
  new DynamicTemplate('envelopeEncodingCiphertext', 4)
])
