const DictionaryTemplate = require('hendricks/lib/Dictionary')
const envelopePayloadTemplate = require('./envelopePayload')
const signatureTemplate = require('./signature')

module.exports = new DictionaryTemplate('envelope', [
  envelopePayloadTemplate,
  signatureTemplate
])
