const DictionaryTemplate = require('hendricks/lib/Dictionary')
const FixedTemplate = require('hendricks/lib/Fixed')
const DynamicTemplate = require('hendricks/lib/Dynamic')

module.exports = new DictionaryTemplate('tcpProxyPacket', [
  new FixedTemplate('aesIv', 16),
  new FixedTemplate('checksum', 32),
  new DynamicTemplate('ciphertext', 4)
])
