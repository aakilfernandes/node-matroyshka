const defunction = require('defunction')
const dns = require('dns')
const utf8 = require('utf-8')
const PromiseStub = require('../classes/PromiseStub')

module.exports = defunction(['Uint8Array'], '=>Uint8Array', function resolveDns(address) {
  const promiseStub = new PromiseStub
  const hostname = utf8.getStringFromBytes(address)
  dns.resolve(hostname, (err, records) => {
    const ipAddress = records[0].split('.').map((byteString) => {
      return parseInt(byteString)
    })
    promiseStub.resolve(new Uint8Array(ipAddress))
  })
  return promiseStub.promise
})
